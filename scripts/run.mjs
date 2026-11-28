// Daily LinkedIn autopilot. Runs in GitHub Actions; no Claude involved.
// Env: GEMINI_API_KEY, BUFFER_API_KEY, BUFFER_CHANNEL_ID, DRY_RUN=1 (no push/post), KIND=research|tip (override), FORCE=1 (ignore day checks)
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { findCandidates } from './research.mjs';
import { briefFromAbstract, reviewBrief } from './gemini.mjs';
import { verifyBrief } from './verify.mjs';
import { renderPng } from './render.mjs';
import { publish, checkKey } from './buffer.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const STATE = path.join(ROOT, 'data/state.json');
const LOG = path.join(ROOT, 'posts-log.md');
const DRY = process.env.DRY_RUN === '1';
const sh = cmd => execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
const log = (...a) => console.log('[autopilot]', ...a);

const pk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
const today = `${pk.getFullYear()}-${String(pk.getMonth() + 1).padStart(2, '0')}-${String(pk.getDate()).padStart(2, '0')}`;
const dow = pk.getDay(); // 0 Sun
const state = JSON.parse(fs.readFileSync(STATE, 'utf8'));

if (!process.env.FORCE) {
  if (dow === 0) { log('Sunday: no post.'); process.exit(0); }
  if (state.last_post_date === today) { log('Already posted today.'); process.exit(0); }
}
let kind = process.env.KIND || ([1, 3, 5].includes(dow) ? 'research' : 'tip');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad2 = n => String(n).padStart(2, '0');

let post = null;

if (kind === 'research') {
  try {
    // latest research first: published in the last 180 days (never before 1 Jan 2026)
    const since = new Date(pk.getTime() - 180 * 86400000).toISOString().slice(0, 10);
    const cands = await findCandidates({ used: state.used_research, fromDate: since > '2026-01-01' ? since : '2026-01-01' });
    log(`${cands.length} candidate studies`);
    for (const s of cands.slice(0, 3)) { // at most 3 studies per day
      log(`trying ${s.id}: ${s.title.slice(0, 90)}`);
      let brief;
      try { brief = await briefFromAbstract(s, process.env.GEMINI_API_KEY); }
      catch (e) { log('gemini error:', e.message); if (/40[0-4]|depleted|not valid/.test(e.message) && !/Gemini [^ ]+: Unexpected|JSON/.test(e.message)) { log('AI provider problem, stopping research for today'); break; } continue; }
      const v = verifyBrief(brief, s.abstract);
      if (!v.ok) { log('rejected:', v.problems.join('; ')); state.used_research.push(s.id); continue; }
      // old data is not "latest data": skip if collected more than 5 years before publication
      const dataYears = (brief.data_period.match(/(19|20)\d{2}/g) || []).map(Number);
      if (dataYears.length && Math.max(...dataYears) < Number(s.pubDate.slice(0, 4)) - 5) { log('rejected: data too old', brief.data_period); state.used_research.push(s.id); continue; }
      // independent fact-check pass
      let review;
      try { review = await reviewBrief(s, brief, process.env.GEMINI_API_KEY); }
      catch (e) { log('review error:', e.message); continue; }
      if (!review.pass) { log('fact-check failed:', review.issues.join(' | ')); continue; }
      const no = pad2(state.research_no + 1);
      const [y, m] = s.pubDate.split('-');
      const monthYear = `${MONTHS[+m - 1]} ${y}`;
      const dataNote = /not stated/i.test(brief.data_period) ? '' : ` · data ${brief.data_period}`;
      const sourceShort = `${s.firstAuthor} et al., ${s.journal} · ${monthYear}${dataNote}`;
      const file = `images/${today}-research-brief-${no}.png`;
      const r = await renderPng('research', brief, { no, year: y, sourceShort }, path.join(ROOT, file));
      if (r.overflow) { log('layout overflow, trying next study'); continue; }
      const tags = brief.hashtags.slice(0, 5).map(h => '#' + h.replace(/^#/, '').replace(/\s+/g, '')).join(' ');
      post = {
        kind, no, file, alt: brief.alt,
        text: `${brief.caption.trim()}\n\nSource: ${s.firstAuthor} et al., ${s.journal} (${monthYear})${s.doi ? ` · doi:${s.doi}` : ''}\n\n${tags}`,
        logTopic: brief.headline_plain, logSource: `${sourceShort}${s.pmid ? ` (PMID ${s.pmid})` : ''}`, usedId: s.id,
      };
      break;
    }
  } catch (e) { log('research step failed:', e.message); }
  if (!post) { log('no verified research today, falling back to a Data Tip'); kind = 'tip'; }
}

if (kind === 'tip') {
  const tips = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/tips.json'), 'utf8'));
  const t = tips[state.tip_index];
  if (!t) { console.error('Tip bank is empty. Add tips to data/tips.json.'); process.exit(1); }
  const no = pad2(state.tip_no + 1);
  const file = `images/${today}-data-tip-${no}.png`;
  const r = await renderPng('tip', t, { no }, path.join(ROOT, file));
  if (r.overflow) { console.error('Tip layout overflow, check data/tips.json entry', state.tip_index); process.exit(1); }
  post = {
    kind, no, file, alt: t.alt,
    text: `${t.caption.trim()}\n\n${t.hashtags.map(h => '#' + h).join(' ')}`,
    logTopic: t.headline, logSource: '—',
  };
}

log(`\n----- ${post.kind.toUpperCase()} #${post.no} -----\n${post.text}\n-----`);
if (DRY) {
  try { log('Buffer key OK, organizations:', (await checkKey(process.env.BUFFER_API_KEY)).join(', ')); }
  catch (e) { log('Buffer key PROBLEM:', e.message); }
  log('DRY_RUN: image at', post.file, '(not pushed, not posted)'); process.exit(0);
}

// 1) publish image to GitHub so Buffer can fetch it
sh(`git add "${post.file}"`);
sh(`git commit -m "Add ${post.kind === 'research' ? 'Research Brief' : 'Data Tip'} #${post.no} image (autopilot)"`);
sh('git push');
const sha = sh('git rev-parse HEAD');
const repo = process.env.GITHUB_REPOSITORY || 'Sarmads050/linkedin-posts';
const url = `https://raw.githubusercontent.com/${repo}/${sha}/${post.file}`;
for (let i = 0; i < 12; i++) {
  const ok = (await fetch(url, { method: 'HEAD' })).ok;
  if (ok) break;
  if (i === 11) throw new Error('image URL not reachable: ' + url);
  await new Promise(r => setTimeout(r, 10000));
}

// 2) post to LinkedIn through Buffer
const res = await publish({ apiKey: process.env.BUFFER_API_KEY, channelId: process.env.BUFFER_CHANNEL_ID, text: post.text, imageUrl: url, altText: post.alt });
log('Buffer post created', res.id);

// 3) record it
if (post.kind === 'research') { state.research_no += 1; state.used_research.push(post.usedId); }
else { state.tip_no += 1; state.tip_index += 1; }
state.last_post_date = today;
fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
fs.appendFileSync(LOG, `| ${today} | ${post.kind === 'research' ? 'Research Brief' : 'Data Tip'} | ${post.no} | ${post.logTopic.replace(/\|/g, '/')} | ${post.logSource.replace(/\|/g, '/')} | ${post.file} |\n`);
sh('git add data/state.json posts-log.md');
sh(`git commit -m "Log ${post.kind} #${post.no} (autopilot)"`);
sh('git push');
log('done');
