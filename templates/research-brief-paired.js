// Research Brief, paired-bar layout ("available" vs "guideline available").
// Example content: Research Brief #02, JOGH 2026;16:04103 (Mustufa, Ariff et al., published 30 Apr 2026).
// Usage: node templates/research-brief-paired.js <out.png>
const { chromium } = require('playwright');

const D = {
  no: '02',
  topic: 'Maternal & Newborn Care · Facilities',
  headline: 'Medicines are on the shelf.<br>The <em>guidelines</em> aren\'t.',
  intro: 'Share of 275 public & private hospitals in 141 districts that had each item',
  rows: [
    ['Oxytocin', 'for bleeding after birth', 83.3, 17.9],
    ['Magnesium sulphate', 'for eclampsia', 73.5, 21.9],
    ['Antenatal steroids', 'for preterm babies\' lungs', 57.7, 10.2],
    ['Bag & mask', 'newborn resuscitation', 66.8, 8.8],
    ['Infant warmer', 'keeping newborns warm', 70.8, 9.9],
  ],
  legendA: 'Medicine / equipment available',
  legendB: 'Written guideline available',
  side: [['13.8%', 'had a kangaroo mother care unit'], ['18.5%', 'had a neonatologist'], ['1 of 275', 'offered all 11 maternal emergency functions']],
  note: 'data from 2022',
  take: 'More births now happen in facilities, but that hasn\'t brought the drop in newborn deaths it should. Readiness, not just access, is the gap.',
  source: 'Mustufa, Ariff et al., <b>Journal of Global Health</b> 2026;16:04103 · Apr 2026',
};

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Caveat:wght@700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}body{margin:0}
:root{--ink:#14161B;--muted:#5D6270;--paper:#FAF8F3;--red:#E23D3D;--yellow:#FFD84D;--green:#1F8A5B}
.c{width:1080px;height:1350px;position:relative;overflow:hidden;padding:74px 78px 66px;display:flex;flex-direction:column;color:var(--ink);font-family:'DM Sans',sans-serif;
  background:var(--paper);background-image:radial-gradient(rgba(20,22,27,.09) 1.6px,transparent 1.6px);background-size:30px 30px}
.top{display:flex;align-items:center}
.chip{font-weight:700;font-size:19px;letter-spacing:2.5px;text-transform:uppercase;border-radius:999px;padding:11px 20px;background:var(--red);color:#fff}
.new{margin-left:12px;font-weight:700;font-size:17px;letter-spacing:2px;border:2px solid var(--ink);border-radius:999px;padding:8px 14px;background:#fff}
.topic{margin-left:auto;font-size:21px;font-weight:500;color:var(--muted)}
h1{font-family:'Bricolage Grotesque';font-weight:800;font-size:68px;line-height:1.08;letter-spacing:-1.2px;word-spacing:4px;margin-top:40px}
h1 em{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:84px;background:linear-gradient(transparent 60%,var(--yellow) 60%,var(--yellow) 90%,transparent 90%);padding:0 6px}
.card{margin-top:36px;background:#fff;border:1px solid #E2DED4;border-radius:20px;padding:30px 34px 28px;box-shadow:0 14px 34px rgba(20,24,40,.07);position:relative}
.intro{font-size:21px;color:var(--muted)}
.legend{display:flex;gap:26px;margin-top:12px;font-size:20px;font-weight:500}
.legend i{display:inline-block;width:18px;height:18px;border-radius:5px;margin-right:8px;vertical-align:-2px}
.rows{margin-top:20px;display:flex;flex-direction:column;gap:18px}
.r{display:grid;grid-template-columns:250px 1fr;gap:20px;align-items:center}
.r .n b{display:block;font-family:'Bricolage Grotesque';font-size:26px;line-height:1.1}
.r .n span{font-size:18px;color:var(--muted)}
.bars{display:flex;flex-direction:column;gap:7px}
.bar{display:flex;align-items:center;gap:10px}
.bar i{display:block;height:22px;border-radius:6px}
.bar em{font-style:normal;font-family:'Bricolage Grotesque';font-weight:800;font-size:23px;font-variant-numeric:tabular-nums}
.hand{position:absolute;right:34px;bottom:20px;font-family:Caveat,cursive;font-weight:700;color:var(--red);font-size:38px;transform:rotate(-4deg)}
.side{margin-top:34px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.s{border-top:4px solid var(--ink);padding-top:14px}
.s b{font-family:'Bricolage Grotesque';font-weight:800;font-size:44px;line-height:1;color:var(--red);display:block}
.s span{font-size:21px;line-height:1.3;display:block;margin-top:8px}
.take{margin-top:auto;display:flex;gap:18px;align-items:flex-start;font-size:26px;line-height:1.3;font-weight:500}
.take span{flex:none;font-family:'Bricolage Grotesque';font-weight:800;font-size:21px;letter-spacing:2px;background:var(--ink);color:var(--paper);padding:8px 14px;border-radius:8px;margin-top:2px}
.foot{margin-top:28px;padding-top:20px;border-top:2px solid rgba(20,22,27,.12);display:flex;justify-content:space-between;gap:20px;font-size:18px;color:var(--muted)}
.foot b{color:var(--ink)}
.foot span:last-child{white-space:nowrap}
</style>
<div class="c">
  <div class="top"><div class="chip">Research Brief #${D.no}</div><div class="new">NEW · 2026</div><div class="topic">${D.topic}</div></div>
  <h1>${D.headline}</h1>
  <div class="card">
    <div class="hand">${D.note}</div>
    <div class="intro">${D.intro}</div>
    <div class="legend"><span><i style="background:var(--ink)"></i>${D.legendA}</span><span><i style="background:var(--red)"></i>${D.legendB}</span></div>
    <div class="rows">
      ${D.rows.map(([n, s, a, g]) => `<div class="r"><div class="n"><b>${n}</b><span>${s}</span></div>
        <div class="bars"><div class="bar"><i style="width:${a * 5.6}px;background:var(--ink)"></i><em>${a}%</em></div>
        <div class="bar"><i style="width:${g * 5.6}px;background:var(--red)"></i><em style="color:var(--red)">${g}%</em></div></div></div>`).join('')}
    </div>
  </div>
  <div class="side">${D.side.map(([b, t]) => `<div class="s"><b>${b}</b><span>${t}</span></div>`).join('')}</div>
  <div class="take"><span>WHY IT MATTERS</span>${D.take}</div>
  <div class="foot"><span>Source: ${D.source}</span><span><b>Sarmad Ali</b> · MIS & Data</span></div>
</div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: process.argv[2] || __dirname + '/out.png' });
  await b.close(); console.log('ok');
})();
