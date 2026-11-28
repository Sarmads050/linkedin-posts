// Gemini (free tier) turns one abstract into structured post content. Output is JSON only.
const MODELS = [process.env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-2.5-flash'].filter(Boolean);

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    relevant: { type: 'BOOLEAN', description: 'true only if the study is about primary health care, maternal/newborn/child health, nutrition, immunization, family planning, community health workers or health information systems IN PAKISTAN' },
    headline_plain: { type: 'STRING', description: 'Max 9 words. The single most striking finding, plain English, no jargon.' },
    headline_accent: { type: 'STRING', description: '1-3 consecutive words copied exactly from headline_plain to highlight' },
    topic: { type: 'STRING', description: '2-4 words, e.g. "Immunization · Sindh"' },
    big_value: { type: 'STRING', description: 'The key number exactly as written in the abstract, e.g. "23.8%" or "1,252"' },
    big_label: { type: 'STRING', description: 'Max 14 words explaining big_value' },
    bars: {
      type: 'ARRAY', description: '2-5 key percentage findings from the abstract (0-100). Empty if fewer than 2 percentages.',
      items: { type: 'OBJECT', properties: { label: { type: 'STRING', description: 'max 6 words' }, sub: { type: 'STRING', description: 'max 6 words context' }, value: { type: 'NUMBER' } }, required: ['label', 'value'] },
    },
    facts: { type: 'ARRAY', description: '0-3 other short facts with a number', items: { type: 'OBJECT', properties: { value: { type: 'STRING' }, label: { type: 'STRING', description: 'max 8 words' } }, required: ['value', 'label'] } },
    data_period: { type: 'STRING', description: 'When the data were collected, exactly as stated in the abstract (e.g. "2024-25"). "not stated" if the abstract does not say.' },
    scope: { type: 'STRING', description: 'Where the study was done, exactly as in the abstract, e.g. "4 provinces of Pakistan" or "2 districts of Sindh". Never widen it.' },
    design: { type: 'STRING', description: 'One line: study design, sample size and setting, e.g. "Cross-sectional survey of 2,400 women in 3 districts of Sindh"' },
    limitation: { type: 'STRING', description: 'One honest limitation in max 25 words' },
    why: { type: 'STRING', description: 'Why it matters for primary health care in Pakistan, max 25 words' },
    caption: { type: 'STRING', description: 'LinkedIn caption 120-200 words: first line = striking finding; what was studied; 3-5 key findings as lines starting with "– "; one line starting "Worth keeping in mind:" with the limitation; why it matters for primary health care; end with ONE genuine question for people in the field. No hashtags, no source line, no links, max 1 emoji.' },
    hashtags: { type: 'ARRAY', items: { type: 'STRING' }, description: '4-5 hashtags without #' },
    alt: { type: 'STRING', description: 'Alt text describing the infographic numbers' },
  },
  required: ['relevant', 'data_period', 'scope', 'headline_plain', 'headline_accent', 'topic', 'big_value', 'big_label', 'bars', 'facts', 'design', 'limitation', 'why', 'caption', 'hashtags', 'alt'],
};

const RULES = `You write LinkedIn research briefs for Sarmad Ali, an MIS & data professional in a maternal and child nutrition programme (primary health care) in Sindh, Pakistan.
Rules:
- Use ONLY facts and numbers that appear in the abstract below. Copy numbers exactly. Never round, estimate, convert or invent numbers.
- Do not use any number that is not in the abstract (no "first 1,000 days", no other statistics).
- Do not claim causation if the design is observational. Mention the real study design.
- Do not say Sarmad was involved in the study. Write in a natural, human, professional voice.
- Attach every number to exactly the group, outcome and place it belongs to in the abstract. Do not mix groups.
- Never widen the scope: a study in 2 districts is not "Pakistan"; say where it was done.
- Use "associated with" for observational studies. Use "reduced/caused" only for randomised trials.
- Professional British/International English, no spelling or grammar mistakes, no hype words like "shocking" or "game-changer".
- If the study is not mainly about Pakistan or not related to primary health care, set relevant=false.`;

// Gemini schema (OBJECT/STRING...) -> standard JSON Schema (object/string...)
const toJsonSchema = n => {
  const o = { ...n, type: String(n.type).toLowerCase() };
  if (n.properties) o.properties = Object.fromEntries(Object.entries(n.properties).map(([k, v]) => [k, toJsonSchema(v)]));
  if (n.items) o.items = toJsonSchema(n.items);
  return o;
};

// OpenAI-compatible chat providers (Groq free tier, GitHub Models).
async function callGitHubModels(prompt, schema, temperature) { return callChat('GitHub Models', 'https://models.github.ai/inference/chat/completions', process.env.GITHUB_TOKEN, process.env.GH_MODEL || 'openai/gpt-4.1-mini', prompt, schema, temperature); }
async function callGroq(prompt, schema, temperature) {
  let err;
  for (const model of [process.env.GROQ_MODEL, 'llama-3.3-70b-versatile', 'openai/gpt-oss-120b'].filter(Boolean)) {
    try { return await callChat('Groq', 'https://api.groq.com/openai/v1/chat/completions', process.env.GROQ_API_KEY, model, prompt, schema, temperature); }
    catch (e) { err = e; }
  }
  throw err;
}
async function callChat(name, url, token, model, prompt, schema, temperature) {
  if (!token) throw new Error(`no key for ${name}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(name === 'GitHub Models' ? { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } : {}) },
    body: JSON.stringify({
      model, temperature,
      messages: [
        { role: 'system', content: 'Reply with one JSON object that follows the given JSON schema exactly. No markdown.' },
        { role: 'user', content: `${prompt}\n\nJSON schema:\n${JSON.stringify(toJsonSchema(schema))}` },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${name} ${res.status}: ${body.slice(0, 200)}`);
  let j; try { j = JSON.parse(body); } catch { throw new Error(`${name} non-JSON reply (status ${res.status}, type ${res.headers.get('content-type')}, url ${res.url}): ${JSON.stringify(body.slice(0, 300))}`); }
  const out = JSON.parse(j.choices?.[0]?.message?.content || '{}');
  for (const k of schema.required || []) if (!(k in out)) throw new Error(`${name} answer missing "${k}"`);
  return out;
}

async function callGemini(prompt, schema, apiKey, temperature = 0.3) {
  let lastErr;
  if (process.env.GROQ_API_KEY) { try { return await callGroq(prompt, schema, temperature); } catch (e) { lastErr = e; } }
  if (!apiKey) { if (lastErr) throw lastErr; return callGitHubModels(prompt, schema, temperature); }
  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature, responseMimeType: 'application/json', responseSchema: schema },
        }),
      });
      if (!res.ok) { lastErr = new Error(`Gemini ${model} ${res.status}: ${(await res.text()).slice(0, 200)}`); continue; }
      const j = await res.json();
      const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
      return JSON.parse(txt);
    } catch (e) { lastErr = e; }
  }
  // Gemini unavailable (no credits, quota, key problem): try the GitHub Models fallback
  try { return await callGitHubModels(prompt, schema, temperature); }
  catch (e) { throw new Error(`${lastErr ? lastErr.message : 'Gemini failed'} | fallback: ${e.message}`); }
}

export function briefFromAbstract(study, apiKey) {
  const prompt = `${RULES}\n\nTitle: ${study.title}\nJournal: ${study.journal} (${study.pubDate})\nAbstract: ${study.abstract}`;
  return callGemini(prompt, SCHEMA, apiKey, 0.3);
}

const REVIEW_SCHEMA = {
  type: 'OBJECT',
  properties: {
    pass: { type: 'BOOLEAN', description: 'true only if there is no factual, numerical, scope, causal-language or language error at all' },
    issues: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Every problem found, each one specific. Empty if pass.' },
  },
  required: ['pass', 'issues'],
};

// Independent second pass: a strict fact-checker reads the draft against the abstract.
export function reviewBrief(study, brief, apiKey) {
  const prompt = `You are a strict senior public-health editor fact-checking a LinkedIn post before it is published to an audience of health professionals, researchers and managers in Pakistan. A single error damages the author's credibility, so be demanding.

Check the DRAFT against the ABSTRACT and fail it (pass=false) if ANY of these is true:
1. Any number is missing from the abstract, altered, rounded, or attached to the wrong group, outcome, year or place.
2. Any claim is not supported by the abstract, or overstates it.
3. Causal wording ("reduced", "led to", "caused", "because of") is used for a non-randomised study.
4. The scope is widened (e.g. district or facility results presented as national).
5. The headline or big number would mislead someone who reads only the image.
6. The limitation is missing, wrong or trivial.
7. Any spelling, grammar or awkward English that a professional would notice.
8. The data are old (collected more than 5 years before publication) and this is not made clear.
9. The study is not really about primary health care in Pakistan.

ABSTRACT (title: ${study.title}; journal: ${study.journal}; published ${study.pubDate}):
${study.abstract}

DRAFT (JSON):
${JSON.stringify(brief, null, 2)}`;
  return callGemini(prompt, REVIEW_SCHEMA, apiKey, 0);
}
