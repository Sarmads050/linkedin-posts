// Polished creator-style card with characterful fonts.
// Fonts: Bricolage Grotesque (headline), Instrument Serif italic (accent words), DM Sans (body), Caveat (handwriting).
const { chromium } = require('playwright');
const fs = require('fs');

const rows = [
  ['District', 'Facility', 'ANC Visits', 'Report Date'],
  ['District A', 'RHC-01', '46', '24-11-2026'],
  ['District B', 'RHC-03', '', '24-11-2026'],
  ['District C', 'RHC-05', '4,120', '24-11-2026'],
  ['District C', 'BHU-06', '29', '24-11-2026'],
  ['District D', 'RHC-07', '41', '24-12-2026'],
];
const bad = { '2,2': 1, '3,2': 1, '5,3': 1 };

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Caveat:wght@700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{margin:0}
:root{--ink:#14161B;--muted:#5D6270;--paper:#FAF8F3;--red:#E23D3D;--yellow:#FFD84D;--green:#1E6E43}
.c{width:1080px;height:1350px;position:relative;overflow:hidden;padding:74px 78px 70px;display:flex;flex-direction:column;color:var(--ink);
  font-family:'DM Sans',sans-serif;background:var(--paper);
  background-image:radial-gradient(rgba(20,22,27,.09) 1.6px,transparent 1.6px);background-size:30px 30px}
.top{display:flex;align-items:center;gap:22px}
.ph{width:108px;height:108px;border-radius:50%;padding:5px;background:conic-gradient(from 200deg,#FFD84D,#E23D3D,#FFD84D)}
.ph img{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:50% 18%;border:4px solid var(--paper);display:block}
.name{font-family:'Bricolage Grotesque';font-weight:800;font-size:36px;letter-spacing:-.5px}
.role{font-size:23px;color:var(--muted);margin-top:2px}
.topic{margin-left:auto;font-size:22px;font-weight:500;color:var(--muted)}
.chip{background:var(--ink)!important;color:var(--paper);border-color:var(--ink)!important;font-weight:700;font-size:19px;letter-spacing:2.5px;text-transform:uppercase;border:2px solid var(--ink);border-radius:999px;padding:9px 18px;background:#fff}
h1{font-family:'Bricolage Grotesque';font-weight:800;font-size:80px;line-height:1.05;letter-spacing:-1.2px;word-spacing:4px;margin-top:44px}
h1 em{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:94px;letter-spacing:-1px;
  background:linear-gradient(transparent 60%,var(--yellow) 60%,var(--yellow) 90%,transparent 90%);padding:0 6px}
.sheet{margin-top:52px;width:660px;position:relative;background:#fff;border:1px solid #D6D6D6;border-radius:8px;box-shadow:0 22px 44px rgba(20,24,40,.13),0 2px 6px rgba(20,24,40,.06);transform:rotate(-1.4deg)}
.bar{height:36px;background:var(--green);border-radius:8px 8px 0 0;color:#fff;font-size:17px;display:flex;align-items:center;gap:10px;padding:0 14px;font-family:Carlito,'Liberation Sans',sans-serif}
.bar i{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,.55);display:inline-block}
table{border-collapse:collapse;width:100%;font-family:Carlito,'Liberation Sans',sans-serif;font-size:26px;table-layout:fixed}
td{border:1px solid #E5E5E5;height:58px;padding:0 14px;white-space:nowrap}
tr:first-child td{background:#E4EEF8;font-weight:700;font-size:24px}
.n{text-align:right}
.bad{background:#FFD0D5;color:#A3000B}
.hand{font-family:Caveat,cursive;color:var(--red);font-weight:700;position:absolute;line-height:1}
.sticky{position:absolute;right:70px;top:930px;background:var(--yellow);padding:24px 30px 28px;transform:rotate(3deg);box-shadow:0 14px 26px rgba(0,0,0,.14);
  font-family:Caveat,cursive;font-size:46px;font-weight:700;line-height:1.02;color:#2A2A2A}
.sticky:before{content:"";position:absolute;left:50%;top:-14px;width:110px;height:28px;margin-left:-55px;background:rgba(255,255,255,.6);transform:rotate(-4deg)}
.tips{margin-top:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.tip{display:flex;gap:14px;align-items:flex-start;font-size:28px;line-height:1.25;font-weight:500}
.tip span{flex:none;width:46px;height:46px;border-radius:50%;background:var(--ink);color:var(--paper);font-family:'Bricolage Grotesque';font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center}
.foot{margin-top:30px;padding-top:20px;border-top:2px solid rgba(20,22,27,.12);display:flex;justify-content:space-between;font-size:20px;color:var(--muted)}
.foot b{color:var(--ink)}
</style>
<div class="c">
  <div class="top">
    <div class="chip">Data Tip #01</div>
    <div class="topic">Data Quality · MIS</div>
  </div>
  <h1>One blank cell can<br>hold up an <em>entire</em><br><em>district report.</em></h1>

  <div class="sheet">
    <div class="bar"><i></i><i></i><i></i>&nbsp;district_daily_submission.xlsx</div>
    <table><colgroup><col style="width:185px"><col style="width:140px"><col style="width:145px"><col style="width:190px"></colgroup>
    ${rows.map((r, ri) => `<tr>${r.map((v, ci) => `<td class="${bad[ri + ',' + ci] ? 'bad ' : ''}${ci === 2 && ri ? 'n' : ''}">${v}</td>`).join('')}</tr>`).join('')}</table>
    <svg id="ann" style="position:absolute;left:0;top:0;overflow:visible" width="1" height="1" fill="none" stroke="#E23D3D" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></svg>
  </div>

  <div class="sticky">Fix it at the register,<br>not at Head Office.</div>

  <div class="tips">
    <div class="tip"><span>1</span>No empty required fields</div>
    <div class="tip"><span>2</span>Numbers within a normal range</div>
    <div class="tip"><span>3</span>No dates from the future</div>
  </div>
  <div class="foot"><span>Excel → <b>Data › Data Validation</b></span><span><b>Sarmad Ali</b> · MIS & Data, Public Health</span></div>
</div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => {
    const sheet = document.querySelector('.sheet'), svg = document.getElementById('ann');
    const barH = sheet.querySelector('.bar').offsetHeight;
    const notes = ['blank?!', '41 or 4,120?', 'next month??'], tilt = [-5, 3, -3];
    [...sheet.querySelectorAll('td.bad')].forEach((td, i) => {
      const x = td.offsetLeft, y = barH + td.parentElement.offsetTop, w = td.offsetWidth, h = td.offsetHeight;
      const cx = x + w / 2, cy = y + h / 2, rx = w / 2 + 6, ry = h / 2 - 4;
      const d = `M${cx - rx + 14} ${cy - ry + 2} C ${cx - rx * .2} ${cy - ry - 8}, ${cx + rx} ${cy - ry - 3}, ${cx + rx + 3} ${cy + 1} C ${cx + rx + 1} ${cy + ry + 7}, ${cx - rx * .5} ${cy + ry + 5}, ${cx - rx - 3} ${cy + 4} C ${cx - rx - 7} ${cy - ry * .5}, ${cx - rx * .3} ${cy - ry - 6}, ${cx + rx * .05} ${cy - ry - 3}`;
      const ns = 'http://www.w3.org/2000/svg';
      const e = document.createElementNS(ns, 'path'); e.setAttribute('d', d); svg.appendChild(e);
      const ex = sheet.offsetWidth + 8;
      const a = document.createElementNS(ns, 'path');
      a.setAttribute('d', `M${ex + 62} ${cy - 6} C ${ex + 42} ${cy - 12}, ${ex + 20} ${cy - 3}, ${ex + 4} ${cy} M${ex + 4} ${cy} l 16 -12 M${ex + 4} ${cy} l 18 9`);
      svg.appendChild(a);
      const n = document.createElement('div'); n.className = 'hand'; n.textContent = notes[i];
      n.style.cssText = `left:${ex + 74}px;top:${cy - 30}px;font-size:44px;white-space:nowrap;transform:rotate(${tilt[i]}deg)`;
      sheet.appendChild(n);
    });
  });
  await p.screenshot({ path: process.argv[2] || __dirname + '/out.png' });
  await b.close(); console.log('ok');
})();
