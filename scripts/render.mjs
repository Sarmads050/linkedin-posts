// Renders the 1080x1350 post image for both series in the house design system.
import { chromium } from 'playwright';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const accent = (plain, acc) => {
  const i = acc ? plain.indexOf(acc) : -1;
  if (i < 0) return esc(plain);
  return esc(plain.slice(0, i)) + `<em>${esc(acc)}</em>` + esc(plain.slice(i + acc.length));
};

const BASE = `
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Caveat:wght@700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}body{margin:0}
:root{--ink:#14161B;--muted:#5D6270;--paper:#FAF8F3;--red:#E23D3D;--yellow:#FFD84D;--green:#1F8A5B}
.c{width:1080px;height:1350px;position:relative;overflow:hidden;padding:74px 78px 66px;display:flex;flex-direction:column;color:var(--ink);font-family:'DM Sans',sans-serif;
  background:var(--paper);background-image:radial-gradient(rgba(20,22,27,.09) 1.6px,transparent 1.6px);background-size:30px 30px}
.top{display:flex;align-items:center;gap:12px}
.chip{font-weight:700;font-size:19px;letter-spacing:2.5px;text-transform:uppercase;border-radius:999px;padding:11px 20px;color:#fff}
.new{font-weight:700;font-size:17px;letter-spacing:2px;border:2px solid var(--ink);border-radius:999px;padding:8px 14px;background:#fff}
.topic{margin-left:auto;font-size:21px;font-weight:500;color:var(--muted);text-align:right;max-width:420px}
h1{font-family:'Bricolage Grotesque';font-weight:800;line-height:1.06;letter-spacing:-1.2px;word-spacing:4px;margin-top:40px;text-wrap:balance}
h1 em{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:1.17em;background:linear-gradient(transparent 60%,var(--yellow) 60%,var(--yellow) 90%,transparent 90%);padding:0 6px}
.card{background:#fff;border:1px solid #E2DED4;border-radius:20px;box-shadow:0 12px 30px rgba(20,24,40,.06)}
.take{display:flex;gap:18px;align-items:flex-start;font-size:25px;line-height:1.3;font-weight:500}
.take span{flex:none;font-family:'Bricolage Grotesque';font-weight:800;font-size:20px;letter-spacing:2px;background:var(--ink);color:var(--paper);padding:8px 14px;border-radius:8px;margin-top:2px}
.foot{margin-top:auto;padding-top:20px;border-top:2px solid rgba(20,22,27,.12);display:flex;justify-content:space-between;gap:24px;font-size:18px;color:var(--muted)}
.foot b{color:var(--ink)} .foot span:last-child{white-space:nowrap}
.sticky{background:var(--yellow);padding:20px 28px 24px;transform:rotate(2.5deg);box-shadow:0 12px 24px rgba(0,0,0,.13);font-family:Caveat,cursive;font-size:40px;font-weight:700;line-height:1.05;color:#2A2A2A;position:relative}
.sticky:before{content:"";position:absolute;left:50%;top:-13px;width:100px;height:26px;margin-left:-50px;background:rgba(255,255,255,.6);transform:rotate(-4deg)}
</style>`;

function researchHtml(b, meta) {
  const bars = (b.bars || []).slice(0, 5);
  const facts = (b.facts || []).slice(0, 3);
  const h1size = b.headline_plain.length > 48 ? 62 : 70;
  const barsHtml = bars.length >= 2 ? `<div class="card bars">
      ${bars.map(x => `<div class="r"><div class="n"><b>${esc(x.label)}</b>${x.sub ? `<span>${esc(x.sub)}</span>` : ''}</div>
        <div class="bw"><i style="width:${Math.max(1.5, x.value)}%"></i></div><em>${esc(x.value)}%</em></div>`).join('')}
    </div>` : '';
  return `<!doctype html><meta charset="utf-8">${BASE}<style>
  .hero{margin-top:34px;display:grid;grid-template-columns:auto 1fr;gap:34px;align-items:center;padding:30px 36px}
  .big{font-family:'Bricolage Grotesque';font-weight:800;font-size:${b.big_value.length > 6 ? 104 : 136}px;line-height:.9;color:var(--red);letter-spacing:-3px;white-space:nowrap}
  .hero p{font-size:28px;line-height:1.3;font-weight:500}
  .bars{margin-top:20px;padding:24px 32px;display:flex;flex-direction:column;gap:16px}
  .bars .r{display:grid;grid-template-columns:300px 1fr 110px;gap:18px;align-items:center}
  .bars .n b{display:block;font-family:'Bricolage Grotesque';font-size:24px;line-height:1.1}
  .bars .n span{font-size:17px;color:var(--muted)}
  .bw{height:24px;background:#F0EDE6;border-radius:7px;overflow:hidden}.bw i{display:block;height:100%;background:var(--ink);border-radius:7px}
  .bars em{font-style:normal;font-family:'Bricolage Grotesque';font-weight:800;font-size:28px;text-align:right}
  .facts{margin-top:22px;display:grid;grid-template-columns:repeat(${Math.max(1, facts.length)},1fr);gap:16px}
  .f{border-top:4px solid var(--ink);padding-top:12px}.f b{font-family:'Bricolage Grotesque';font-weight:800;font-size:40px;color:var(--red);display:block;line-height:1}
  .f span{font-size:20px;line-height:1.3;display:block;margin-top:6px}
  .design{margin-top:22px;font-size:20px;color:var(--muted)}
  .hand{font-family:Caveat,cursive;font-weight:700;color:var(--red);font-size:34px;line-height:1.05}
  .keep{margin-top:20px;display:grid;grid-template-columns:1fr;gap:14px}
  </style>
  <div class="c">
    <div class="top"><div class="chip" style="background:var(--red)">Research Brief #${meta.no}</div><div class="new">NEW · ${esc(meta.year)}</div><div class="topic">${esc(b.topic)}</div></div>
    <h1 style="font-size:${h1size}px">${accent(b.headline_plain, b.headline_accent)}</h1>
    <div class="card hero"><div class="big">${esc(b.big_value)}</div><p>${esc(b.big_label)}</p></div>
    ${barsHtml}
    ${facts.length ? `<div class="facts">${facts.map(f => `<div class="f"><b>${esc(f.value)}</b><span>${esc(f.label)}</span></div>`).join('')}</div>` : ''}
    <div class="design">${esc(b.design)}</div>
    <div class="keep"><div class="hand">Keep in mind: ${esc(b.limitation)}</div></div>
    <div class="take" style="margin-top:22px"><span>WHY IT MATTERS</span>${esc(b.why)}</div>
    <div class="foot"><span>Source: ${esc(meta.sourceShort)}</span><span><b>Sarmad Ali</b> · MIS & Data</span></div>
  </div>`;
}

function tipHtml(t, meta) {
  const pts = t.points.slice(0, 4);
  return `<!doctype html><meta charset="utf-8">${BASE}<style>
  .pts{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:18px;flex:1;max-height:700px}
  .p{padding:28px 30px;display:flex;flex-direction:column;gap:14px}
  .p .h{display:flex;align-items:center;gap:14px}
  .p .num{flex:none;width:46px;height:46px;border-radius:50%;background:var(--ink);color:var(--paper);font-family:'Bricolage Grotesque';font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center}
  .p b{font-family:'Bricolage Grotesque';font-size:33px;line-height:1.1}
  .p span{font-size:28px;color:var(--muted);line-height:1.38}

  .sticky{align-self:flex-end;margin-top:34px;margin-right:16px}
  </style>
  <div class="c">
    <div class="top"><div class="chip" style="background:var(--ink)">Data Tip #${meta.no}</div><div class="topic">${esc(t.topic)}</div></div>
    <h1 style="font-size:${t.headline.length > 50 ? 64 : 72}px">${accent(t.headline, t.accent)}</h1>
    <div class="pts">${pts.map((p, i) => `<div class="card p"><div class="h"><div class="num">${i + 1}</div><b>${esc(p.title)}</b></div><span>${esc(p.text)}</span></div>`).join('')}</div>
    <div class="sticky">${esc(t.sticky)}</div>
    <div class="foot tipfoot"><span>${esc(t.pointer || 'Practical tip for MIS & reporting teams')}</span><span><b>Sarmad Ali</b> · MIS & Data</span></div>
  </div>`;
}

export async function renderPng(kind, content, meta, outPath) {
  const html = kind === 'research' ? researchHtml(content, meta) : tipHtml(content, meta);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // layout guard: content must not overflow the card
  const overflow = await page.evaluate(() => {
    const c = document.querySelector('.c'); const foot = document.querySelector('.foot');
    const last = [...c.children].filter(e => e !== foot).pop();
    return last.getBoundingClientRect().bottom > foot.getBoundingClientRect().top - 8;
  });
  await page.screenshot({ path: outPath });
  await browser.close();
  return { overflow };
}
