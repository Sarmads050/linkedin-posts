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
    design: { type: 'STRING', description: 'One line: study design, sample size and setting, e.g. "Cross-sectional survey of 2,400 women in 3 districts of Sindh"' },
    limitation: { type: 'STRING', description: 'One honest limitation in max 25 words' },
    why: { type: 'STRING', description: 'Why it matters for primary health care in Pakistan, max 25 words' },
    caption: { type: 'STRING', description: 'LinkedIn caption 120-200 words: first line = striking finding; what was studied; 3-5 key findings as lines starting with "– "; one line starting "Worth keeping in mind:" with the limitation; why it matters for primary health care; end with ONE genuine question for people in the field. No hashtags, no source line, no links, max 1 emoji.' },
    hashtags: { type: 'ARRAY', items: { type: 'STRING' }, description: '4-5 hashtags without #' },
    alt: { type: 'STRING', description: 'Alt text describing the infographic numbers' },
  },
  required: ['relevant', 'headline_plain', 'headline_accent', 'topic', 'big_value', 'big_label', 'bars', 'facts', 'design', 'limitation', 'why', 'caption', 'hashtags', 'alt'],
};

const RULES = `You write LinkedIn research briefs for Sarmad Ali, an MIS & data professional in a maternal and child nutrition programme (primary health care) in Sindh, Pakistan.
Rules:
- Use ONLY facts and numbers that appear in the abstract below. Copy numbers exactly. Never round, estimate, convert or invent numbers.
- Do not use any number that is not in the abstract (no "first 1,000 days", no other statistics).
- Do not claim causation if the design is observational. Mention the real study design.
- Do not say Sarmad was involved in the study. Write in a natural, human, professional voice.
- If the study is not mainly about Pakistan or not related to primary health care, set relevant=false.`;

export async function briefFromAbstract(study, apiKey) {
  const prompt = `${RULES}\n\nTitle: ${study.title}\nJournal: ${study.journal} (${study.pubDate})\nAbstract: ${study.abstract}`;
  let lastErr;
  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseSchema: SCHEMA },
        }),
      });
      if (!res.ok) { lastErr = new Error(`Gemini ${model} ${res.status}: ${(await res.text()).slice(0, 200)}`); continue; }
      const j = await res.json();
      const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
      return JSON.parse(txt);
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Gemini failed');
}
