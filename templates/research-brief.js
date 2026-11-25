// Research Brief #01: Benazir Nashonuma Programme final cohort results (AKU / WHO EMRO, May 2026).
const { chromium } = require('playwright');

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Caveat:wght@700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}body{margin:0}
:root{--ink:#14161B;--muted:#5D6270;--paper:#FAF8F3;--red:#E23D3D;--yellow:#FFD84D;--green:#1F8A5B}
.c{width:1080px;height:1350px;position:relative;overflow:hidden;padding:74px 78px 70px;display:flex;flex-direction:column;color:var(--ink);font-family:'DM Sans',sans-serif;
  background:var(--paper);background-image:radial-gradient(rgba(20,22,27,.09) 1.6px,transparent 1.6px);background-size:30px 30px}
.top{display:flex;align-items:center}
.chip{font-weight:700;font-size:19px;letter-spacing:2.5px;text-transform:uppercase;border-radius:999px;padding:11px 20px;background:var(--red);color:#fff}
.new{margin-left:12px;font-weight:700;font-size:17px;letter-spacing:2px;border:2px solid var(--ink);border-radius:999px;padding:8px 14px;background:#fff}
.topic{margin-left:auto;font-size:22px;font-weight:500;color:var(--muted)}
h1{font-family:'Bricolage Grotesque';font-weight:800;font-size:74px;line-height:1.05;letter-spacing:-1.2px;word-spacing:4px;margin-top:44px}
h1 em{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:88px;background:linear-gradient(transparent 60%,var(--yellow) 60%,var(--yellow) 90%,transparent 90%);padding:0 6px}
.hero{margin-top:46px;display:grid;grid-template-columns:auto 1fr;gap:40px;align-items:center;background:#fff;border:1px solid #E2DED4;border-radius:22px;padding:38px 42px;box-shadow:0 14px 34px rgba(20,24,40,.07)}
.big{font-family:'Bricolage Grotesque';font-weight:800;font-size:190px;line-height:.85;color:var(--green);letter-spacing:-6px}
.big small{font-size:96px;letter-spacing:-2px}
.hero p{font-size:31px;line-height:1.3;font-weight:500}
.hero p span{display:block;font-size:22px;color:var(--muted);font-weight:400;margin-top:10px}
.tl{margin-top:96px;position:relative}
.tl .line{position:absolute;left:0;right:0;top:34px;height:6px;border-radius:3px;background:linear-gradient(90deg,#F5B7B7,var(--red))}
.tl .pts{display:grid;grid-template-columns:repeat(4,1fr);position:relative}
.pt{display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.dot{width:74px;height:74px;border-radius:50%;background:#fff;border:6px solid var(--red);display:flex;align-items:center;justify-content:center;font-size:32px}
.pt b{font-family:'Bricolage Grotesque';font-size:31px}
.pt span{font-size:24px;color:var(--muted);line-height:1.3;max-width:200px}
.pt.hit .dot{background:var(--green);border-color:var(--green)}
.hand{font-family:Caveat,cursive;font-weight:700;color:var(--green);font-size:42px;position:absolute;left:250px;top:-46px;transform:rotate(-3deg);white-space:nowrap}
.take{margin-top:auto;display:flex;gap:18px;align-items:flex-start;font-size:27px;line-height:1.3;font-weight:500}
.take span{flex:none;font-family:'Bricolage Grotesque';font-weight:800;font-size:22px;letter-spacing:2px;background:var(--ink);color:var(--paper);padding:8px 14px;border-radius:8px;margin-top:2px}
.foot{margin-top:30px;padding-top:20px;border-top:2px solid rgba(20,22,27,.12);display:flex;justify-content:space-between;gap:20px;font-size:19px;color:var(--muted)}
.foot b{color:var(--ink)}
.foot span:last-child{white-space:nowrap}
</style>
<div class="c">
  <div class="top"><div class="chip">Research Brief #01</div><div class="new">NEW · 2026</div><div class="topic">Nutrition · Social Protection</div></div>
  <h1>Supporting mothers early<br>cut stunting by <em>over a fifth.</em></h1>
  <div class="hero">
    <div class="big">22<small>%</small></div>
    <p>lower stunting at 6 months among babies whose mothers joined Benazir Nashonuma
      <span>compared with similar BISP families not in the programme</span></p>
  </div>
  <div class="tl">
    <div class="hand">↓ the window that matters</div>
    <div class="line"></div>
    <div class="pts">
      <div class="pt"><div class="dot">🤰</div><b>Pregnancy</b><span>Cash, specialised food & counselling</span></div>
      <div class="pt"><div class="dot">👶</div><b>Birth</b><span>Facility visits continue</span></div>
      <div class="pt hit"><div class="dot">✓</div><b>6 months</b><span>Stunting 22% lower</span></div>
      <div class="pt"><div class="dot">🎂</div><b>2 years</b><span>End of the first 1,000 days</span></div>
    </div>
  </div>
  <div class="take"><span>WHY IT MATTERS</span>It's evidence that pairing cash support with health and nutrition services during pregnancy can change outcomes, not just intentions.</div>
  <div class="foot"><span>Source: <b>AKU impact evaluation</b>, final cohort · WHO EMRO, May 2026</span><span><b>Sarmad Ali</b> · MIS & Data</span></div>
</div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: process.argv[2] || __dirname + '/out.png' });
  await b.close(); console.log('ok');
})();
