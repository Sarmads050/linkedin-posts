// Data Tip, 2x2 "four checks" layout. Example content: Data Tip #02 (report quality checks).
// Usage: node templates/data-tip-grid.js <out.png>
const { chromium } = require('playwright');

const D = {
  no: '02',
  topic: 'Reporting · Data Quality',
  headline: 'Before a report leaves<br>your desk, run <em>4 checks.</em>',
  checks: [
    { n: 1, t: 'Completeness', q: 'Did every district submit?', viz: 'complete' },
    { n: 2, t: 'Timeliness', q: 'Did they submit on time?', viz: 'timely' },
    { n: 3, t: 'Consistency', q: 'Does this month look like last month?', viz: 'consistent' },
    { n: 4, t: 'Accuracy', q: 'Do the totals match across sheets?', viz: 'accurate' },
  ],
  sticky: 'A report is only as strong<br>as its weakest district.',
  pointer: 'Takes 10 minutes · saves a re-issued report',
};

// tiny visuals (example data only)
const viz = {
  complete: () => `<div class="dots">${Array.from({ length: 12 }, (_, i) => `<i class="${i === 4 || i === 9 ? 'miss' : 'ok'}"></i>`).join('')}</div>
    <div class="cap"><b>10 / 12</b> districts in · 2 missing</div>`,
  timely: () => `<div class="tl">${[['D-A', 1], ['D-B', 1], ['D-C', 0], ['D-D', 1], ['D-E', 0]].map(([d, ok]) => `<span class="${ok ? 'ok' : 'late'}">${d}</span>`).join('')}</div>
    <div class="cap">Deadline 10:00 · <b class="r">2 late</b></div>`,
  consistent: () => `<svg viewBox="0 0 300 92" width="100%" height="92"><polyline points="10,62 60,58 110,60 160,55 210,57 260,14" fill="none" stroke="#14161B" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
    ${[[10, 62], [60, 58], [110, 60], [160, 55], [210, 57]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#14161B"/>`).join('')}
    <circle cx="260" cy="14" r="9" fill="#E23D3D"/></svg><div class="cap">Sudden jump · <b class="r">check before reporting</b></div>`,
  accurate: () => `<div class="sum"><div><span>Sheet A total</span><b>1,284</b></div><div><span>Summary total</span><b class="r">1,248</b></div></div>
    <div class="cap">Off by 36 · <b class="r">find it first</b></div>`,
};

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Caveat:wght@700&family=JetBrains+Mono:wght@600&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}body{margin:0}
:root{--ink:#14161B;--muted:#5D6270;--paper:#FAF8F3;--red:#E23D3D;--yellow:#FFD84D;--green:#1F8A5B}
.c{width:1080px;height:1350px;position:relative;overflow:hidden;padding:74px 78px 66px;display:flex;flex-direction:column;color:var(--ink);font-family:'DM Sans',sans-serif;
  background:var(--paper);background-image:radial-gradient(rgba(20,22,27,.09) 1.6px,transparent 1.6px);background-size:30px 30px}
.top{display:flex;align-items:center}
.chip{font-weight:700;font-size:19px;letter-spacing:2.5px;text-transform:uppercase;border-radius:999px;padding:11px 20px;background:var(--ink);color:var(--paper)}
.topic{margin-left:auto;font-size:21px;font-weight:500;color:var(--muted)}
h1{font-family:'Bricolage Grotesque';font-weight:800;font-size:72px;line-height:1.06;letter-spacing:-1.2px;word-spacing:4px;margin-top:40px}
h1 em{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:88px;background:linear-gradient(transparent 60%,var(--yellow) 60%,var(--yellow) 90%,transparent 90%);padding:0 6px}
.grid{margin-top:44px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
.card{background:#fff;border:1px solid #E2DED4;border-radius:20px;padding:24px 26px;box-shadow:0 12px 28px rgba(20,24,40,.06);display:flex;flex-direction:column;gap:12px;min-height:300px}
.head{display:flex;align-items:center;gap:14px}
.num{flex:none;width:46px;height:46px;border-radius:50%;background:var(--ink);color:var(--paper);font-family:'Bricolage Grotesque';font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center}
.head b{font-family:'Bricolage Grotesque';font-size:31px}
.q{font-size:23px;color:var(--muted);line-height:1.3}
.viz{margin-top:auto}
.dots{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.dots i{display:block;height:34px;border-radius:9px}
.dots i.ok{background:var(--green)} .dots i.miss{background:#fff;border:3px dashed var(--red)}
.tl{display:flex;gap:8px;flex-wrap:wrap}
.tl span{font-family:'JetBrains Mono',monospace;font-size:19px;padding:8px 11px;border-radius:9px}
.tl .ok{background:#E2F3EA;color:var(--green)} .tl .late{background:#FDE6E6;color:var(--red)}
.sum{display:flex;flex-direction:column;gap:8px;font-family:'JetBrains Mono',monospace}
.sum div{display:flex;justify-content:space-between;align-items:center;background:var(--paper);border-radius:10px;padding:9px 14px;font-size:19px}
.sum b{font-size:24px} .r{color:var(--red)}
.cap{margin-top:12px;font-size:20px;color:var(--muted)} .cap b{color:var(--ink)} .cap b.r{color:var(--red)}
.sticky{align-self:flex-end;margin-top:34px;margin-right:16px;background:var(--yellow);padding:20px 28px 24px;transform:rotate(2.5deg);box-shadow:0 12px 24px rgba(0,0,0,.13);
  font-family:Caveat,cursive;font-size:42px;font-weight:700;line-height:1.05;color:#2A2A2A;position:relative}
.sticky:before{content:"";position:absolute;left:50%;top:-13px;width:100px;height:26px;margin-left:-50px;background:rgba(255,255,255,.6);transform:rotate(-4deg)}
.foot{margin-top:auto;padding-top:20px;border-top:2px solid rgba(20,22,27,.12);display:flex;justify-content:space-between;gap:20px;font-size:19px;color:var(--muted)}
.foot b{color:var(--ink)} .foot span:last-child{white-space:nowrap}
</style>
<div class="c">
  <div class="top"><div class="chip">Data Tip #${D.no}</div><div class="topic">${D.topic}</div></div>
  <h1>${D.headline}</h1>
  <div class="grid">${D.checks.map(c => `<div class="card"><div class="head"><div class="num">${c.n}</div><b>${c.t}</b></div>
    <div class="q">${c.q}</div><div class="viz">${viz[c.viz]()}</div></div>`).join('')}</div>
  <div class="sticky">${D.sticky}</div>
  <div class="foot"><span>${D.pointer} · example data</span><span><b>Sarmad Ali</b> · MIS & Data</span></div>
</div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: process.argv[2] || __dirname + '/out.png' });
  await b.close(); console.log('ok');
})();
