// Safety check: every number used in the post must appear in the abstract.
const norm = s => s.replace(/,/g, '').replace(/\.0+$/, '').replace(/^0+(?=\d)/, '');

export function numbersIn(text) {
  return (String(text).match(/\d[\d,]*(?:\.\d+)?/g) || []).map(norm);
}

export function verifyBrief(brief, abstract) {
  // '128 680' style thousands in abstracts count as 128680 too
  const allowed = new Set([...numbersIn(abstract), ...numbersIn(abstract.replace(/(\d) (\d{3})(?!\d)/g, '$1$2'))]);
  // harmless numbers: years, small list counts
  for (let y = 2000; y <= 2030; y++) allowed.add(String(y));
  for (let i = 1; i <= 5; i++) allowed.add(String(i));
  const fields = [brief.headline_plain, brief.big_value, brief.big_label, brief.design, brief.limitation, brief.why, brief.caption,
    ...(brief.bars || []).flatMap(b => [b.label, b.sub, String(b.value)]),
    ...(brief.facts || []).flatMap(f => [f.value, f.label])];
  const bad = [];
  for (const f of fields) for (const n of numbersIn(f || '')) if (!allowed.has(n)) bad.push(n);
  const problems = [];
  if (bad.length) problems.push(`numbers not in abstract: ${[...new Set(bad)].join(', ')}`);
  if (!brief.relevant) problems.push('not relevant to Pakistan primary health care');
  if (!brief.headline_plain.includes(brief.headline_accent)) problems.push('accent not in headline');
  if ((brief.bars || []).some(b => !(b.value >= 0 && b.value <= 100))) problems.push('bar value outside 0-100');
  const words = brief.caption.split(/\s+/).length;
  if (words < 80 || words > 260) problems.push(`caption length ${words} words`);
  return { ok: problems.length === 0, problems };
}
