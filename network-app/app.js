/* Network Daily: semi-automatic LinkedIn networking planner.
   Opens ready-made LinkedIn searches; the user chooses people and taps Connect himself.
   Nothing is sent automatically. All progress is stored in this browser (localStorage). */
(function () {
  'use strict';

  // 5 daily categories, all inside health care, data analysis and MIS. Targets add up to 18.
  var TIERS = [
    { id: 'mis', label: 'MIS & M&E', color: '#E23D3D', target: 4, note: 'mis',
      who: 'MIS Officers, MIS Coordinators, HMIS / DHIS2 aur M&E log',
      searches: ['MIS Officer health', 'MIS Officer Karachi', 'MIS Officer Sindh', 'MIS Coordinator Pakistan', 'MIS Manager NGO Pakistan',
        'MIS Officer PPHI', 'HMIS Pakistan', 'DHIS2 Pakistan', 'HISP Pakistan', 'LHMIS Pakistan', 'Health Department Sindh MIS',
        'District Health Information System Pakistan', 'M&E Officer Sindh', 'M&E Officer health Pakistan', 'MEAL Officer Pakistan',
        'Monitoring and Evaluation Specialist Pakistan', 'EPI Sindh data', 'MIS Assistant health Pakistan'] },
    { id: 'data', label: 'Data analysis', color: '#2F6FED', target: 4, note: 'data',
      who: 'Data analysts, Power BI / Excel dashboard aur health data log',
      searches: ['health data analyst Pakistan', 'data analyst Karachi', 'data analyst Pakistan healthcare', 'Power BI developer Pakistan',
        'Power BI health dashboard', 'Excel dashboard specialist Pakistan', 'data management officer NGO Pakistan', 'database officer health Pakistan',
        'biostatistician Pakistan', 'data scientist healthcare Pakistan', 'research data manager Aga Khan University', 'statistical officer health Pakistan',
        'data quality officer Pakistan', 'business intelligence analyst Karachi', 'data analyst public health Sindh', 'SQL data analyst Karachi'] },
    { id: 'health', label: 'Health care & public health', color: '#1F8A5B', target: 4, note: 'org',
      who: 'Public health, nutrition, MNCH aur hospitals ke professionals',
      searches: ['public health specialist Karachi', 'public health Sindh', 'UNICEF Pakistan health', 'UNICEF Pakistan nutrition', 'WHO Pakistan',
        'WFP Pakistan monitoring', 'Nutrition International Pakistan', 'Action Against Hunger Pakistan', 'HANDS Pakistan', 'RSPN Sindh health',
        'Aga Khan University public health', 'Indus Hospital public health', 'Jhpiego Pakistan', 'Save the Children Pakistan health',
        'Population Council Pakistan', 'Health Services Academy Islamabad', 'maternal child health Pakistan', 'primary health care Pakistan',
        'nutrition officer Sindh', 'health program manager Karachi'] },
    { id: 'eco', label: 'PPHI & social protection', color: '#7A4BD1', target: 3, note: 'eco',
      who: 'PPHI, SSPA, Mamta, BISP aur World Bank ke log',
      searches: ['PPHI Sindh MIS', 'PPHI Sindh monitoring evaluation', 'PPHI Sindh nutrition', 'PPHI district support manager', 'PPHI Sindh data',
        "People's Primary Healthcare Initiative", 'Sindh Social Protection Authority', 'Mamta Sindh program', 'Social Protection Department Sindh',
        'BISP Nashonuma', 'World Bank social protection Pakistan', 'PPHI Balochistan MIS'] },
    { id: 'peer', label: 'Recruiters & alumni', color: '#B7791F', target: 3, note: 'rec',
      who: 'Health / development sector HR aur aap ki universities ke log',
      searches: ['talent acquisition development sector Pakistan', 'HR NGO Karachi', 'recruiter healthcare Pakistan', 'UN recruitment Pakistan',
        'HR manager hospital Karachi', 'talent acquisition Aga Khan University', 'HR public health Pakistan', 'IQRA University data analyst',
        'IQRA University MIS', 'SBBU alumni IT', 'SBBU Information Technology', 'hiring MIS Officer Pakistan'] }
  ];

  var NOTES = [
    { id: 'eco', title: 'PPHI / SSPA / Mamta', text: "Hi [Name], I work on MIS & reporting for the MAMTA Program at PPHI Head Office. Would be great to connect with others working on the program." },
    { id: 'mis', title: 'MIS / M&E professional', text: "Hi [Name], I'm an MIS & reporting professional in a public health program in Sindh. Always good to connect with others working in MIS and M&E." },
    { id: 'data', title: 'Data analyst', text: "Hi [Name], I build KPI dashboards and reports from health program data in Sindh. I'd love to connect and learn from your work in data analysis." },
    { id: 'his', title: 'DHIS2 / HMIS specialist', text: "Hi [Name], I manage MIS data and KPI dashboards for a health program in Sindh and I'm keen to grow in DHIS2/HMIS. Would love to learn from your work." },
    { id: 'org', title: 'Health / nutrition org', text: "Hi [Name], I work in data & reporting for a maternal and child nutrition program in Sindh. I'd value connecting with people in public health and nutrition." },
    { id: 'rec', title: 'Recruiter', text: "Hi [Name], I'm an MIS & data professional (MS CS) in public health programs in Sindh. Happy to connect for future M&E/MIS opportunities." },
    { id: 'alum', title: 'IQRA / SBBU alumni', text: "Hi [Name], fellow alum here. I now work in health program MIS at PPHI in Karachi. Would be glad to connect." },
    { id: 'post', title: 'Un ki post dekh kar', text: "Hi [Name], I enjoyed your recent post on [topic]. I work in health MIS & reporting in Sindh and would like to follow your work." },
    { id: 'after', title: 'Accept ke baad (message)', text: "Thanks for connecting, [Name]! Looking forward to learning from your work in [their field]." }
  ];

  // ---------- storage ----------
  var KEY = 'nd-v1';
  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); if (v && typeof v === 'object') return v; } catch (e) {}
    return {};
  }
  var S = load();
  S.log = S.log || {};
  S.settings = S.settings || { target: 18, limit: 100, only2nd: false };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  // ---------- dates ----------
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  var now, today, dayNum;
  function refreshDate() {
    now = new Date(); today = dkey(now);
    dayNum = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
  }
  refreshDate();

  function day(k) {
    k = k || today;
    var d = S.log[k] || (S.log[k] = { c: {}, com: 0, done: [] });
    d.c = d.c || {}; d.done = d.done || []; d.com = d.com || 0;
    return d;
  }
  function dayTotal(k) {
    var d = S.log[k]; if (!d || !d.c) return 0;
    var t = 0; for (var id in d.c) t += d.c[id] || 0; return t;
  }
  function weekTotal() { var t = 0; for (var i = 0; i < 7; i++) t += dayTotal(dkey(addDays(now, -i))); return t; }
  function streak() {
    var s = 0, i = dayTotal(today) > 0 ? 0 : 1;
    for (; i < 400; i++) {
      var d = addDays(now, -i);
      if (d.getDay() === 0 && dayTotal(dkey(d)) === 0) continue; // Sunday off doesn't break the streak
      if (dayTotal(dkey(d)) > 0) s++; else break;
    }
    return s;
  }

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function searchUrl(q) {
    var u = 'https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(q);
    if (S.settings.only2nd) u += '&network=' + encodeURIComponent('["S"]');
    return u;
  }
  function todaysQuery(t, i) { return t.searches[(dayNum + i * 3) % t.searches.length]; }
  var toastTimer;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 1800); }
  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copy ho gaya'); } catch (e) { toast('Copy nahi hua, khud select karein'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast('Note copy ho gaya'); }, fallback);
    else fallback();
  }
  function buzz() { if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {} }

  // ---------- today view ----------
  function renderSummary() {
    var tgt = S.settings.target, lim = S.settings.limit, t = dayTotal(today), w = weekTotal();
    $('todayCount').textContent = t; $('todayTarget').textContent = tgt;
    var ring = $('ringFg'); ring.style.strokeDashoffset = String(314.16 * (1 - Math.min(1, t / tgt)));
    ring.classList.toggle('done', t >= tgt);
    $('weekCount').textContent = w; $('weekLimitLabel').textContent = lim;
    var wb = $('weekBar'); wb.style.width = Math.min(100, w / lim * 100) + '%';
    wb.className = w >= lim ? 'stop' : (w >= lim * 0.85 ? 'warn' : '');
    var ws = $('weekStatus'), lb = $('limitBanner');
    if (w >= lim) { ws.textContent = 'Limit poori'; ws.style.color = 'var(--red)'; lb.hidden = false; lb.innerHTML = '<b>Is hafte ki limit poori.</b> Account safe rakhne ke liye kuch din requests na bhejein. Comments karte rahein.'; }
    else if (w >= lim * 0.85) { ws.textContent = (lim - w) + ' baqi, aahista chalein'; ws.style.color = 'var(--amber)'; lb.hidden = true; }
    else { ws.textContent = (lim - w) + ' aur bhej sakte hain'; ws.style.color = 'var(--green)'; lb.hidden = true; }
    $('comCount').textContent = day().com;
    var st = streak(); $('streakNum').textContent = st;
    $('fridayBanner').hidden = now.getDay() !== 5;
    $('dateLabel').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  }

  function renderTasks() {
    var box = $('tasks'); box.innerHTML = '';
    TIERS.forEach(function (t, i) {
      var q = todaysQuery(t, i), d = day(), n = d.c[t.id] || 0, done = d.done.indexOf(t.id) > -1 || n >= t.target;
      var note = NOTES.filter(function (x) { return x.id === t.note; })[0];
      var li = el('li', 'task' + (done ? ' done' : '')); li.style.setProperty('--tier', t.color);

      var top = el('div', 'task-top');
      var info = el('div');
      info.appendChild(el('div', 'tier', t.label));
      info.appendChild(el('div', 'q', q));
      info.appendChild(el('div', 'who', t.who));
      var cnt = el('div', 'count'); cnt.innerHTML = '<span>' + n + '</span> <small>/ ' + t.target + '</small>';
      top.appendChild(info); top.appendChild(cnt);

      var actions = el('div', 'task-actions');
      var open = el('a', 'btn red', 'LinkedIn kholein ↗'); open.href = searchUrl(q); open.target = '_blank'; open.rel = 'noopener';
      var step = el('div', 'stepper');
      var minus = el('button', 'step', '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Aik kam');
      var plus = el('button', 'step plus', '+1'); plus.type = 'button'; plus.setAttribute('aria-label', 'Aik request bheji');
      minus.onclick = function () { var dd = day(); dd.c[t.id] = Math.max(0, (dd.c[t.id] || 0) - 1); save(); renderAll(); };
      plus.onclick = function () {
        var dd = day();
        if (weekTotal() >= S.settings.limit) { toast('Hafte ki limit poori. Ab ruk jayein.'); return; }
        dd.c[t.id] = (dd.c[t.id] || 0) + 1; save(); buzz(); renderAll();
        if (dd.c[t.id] === t.target) toast(t.label + ' ka target poora ✓');
      };
      step.appendChild(minus); step.appendChild(plus);
      actions.appendChild(open); actions.appendChild(step);

      var sub = el('div', 'sub-actions');
      var cp = el('button', 'chipbtn', 'Note copy: ' + note.title); cp.type = 'button'; cp.onclick = function () { copyText(note.text); };
      var other = el('a', 'chipbtn', 'Doosri search'); other.href = searchUrl(t.searches[(dayNum + i * 3 + 1) % t.searches.length]); other.target = '_blank'; other.rel = 'noopener';
      sub.appendChild(cp); sub.appendChild(other);

      li.appendChild(top); li.appendChild(actions); li.appendChild(sub);
      box.appendChild(li);
    });
  }

  // ---------- notes ----------
  function renderNotes() {
    var box = $('notes'); box.innerHTML = '';
    NOTES.forEach(function (n) {
      var c = el('div', 'card note');
      var h = el('div', 'note-head'); h.appendChild(el('h2', null, n.title));
      var b = el('button', 'btn', 'Copy'); b.type = 'button'; b.onclick = function () { copyText(n.text); };
      h.appendChild(b);
      c.appendChild(h); c.appendChild(el('p', null, n.text));
      c.appendChild(el('span', 'len', n.text.length + ' / 200 characters'));
      box.appendChild(c);
    });
  }

  // ---------- progress ----------
  function renderProgress() {
    var chart = $('chart'); chart.innerHTML = '';
    var vals = [], max = 1;
    for (var i = 13; i >= 0; i--) { var d = addDays(now, -i); var v = dayTotal(dkey(d)); vals.push([d, v]); if (v > max) max = v; }
    vals.forEach(function (p, idx) {
      var col = el('div', 'col' + (idx === 13 ? ' today' : ''));
      col.appendChild(el('em', null, p[1] ? String(p[1]) : ''));
      var bar = el('i'); bar.style.height = Math.max(2, p[1] / max * 110) + 'px'; col.appendChild(bar);
      col.appendChild(el('span', null, p[0].toLocaleDateString('en-GB', { weekday: 'narrow' })));
      chart.appendChild(col);
    });
    var total = 0, best = 0;
    for (var k in S.log) { var t = dayTotal(k); total += t; if (t > best) best = t; }
    $('kpiTotal').textContent = total; $('kpiStreak').textContent = streak(); $('kpiBest').textContent = best;

    var lib = $('library'); lib.innerHTML = '';
    TIERS.forEach(function (t) {
      var g = el('div', 'lib-group'); g.appendChild(el('h3', null, t.label));
      var l = el('div', 'lib-list');
      t.searches.forEach(function (q) { var a = el('a', null, q); a.href = searchUrl(q); a.target = '_blank'; a.rel = 'noopener'; l.appendChild(a); });
      g.appendChild(l); lib.appendChild(g);
    });
  }

  // ---------- settings ----------
  function initSettings() {
    $('setTarget').value = S.settings.target; $('setLimit').value = S.settings.limit; $('only2nd').checked = !!S.settings.only2nd;
    $('setTarget').onchange = function () { var v = Math.min(25, Math.max(5, parseInt(this.value, 10) || 18)); this.value = v; S.settings.target = v; save(); renderAll(); toast('Target save ho gaya'); };
    $('setLimit').onchange = function () { var v = Math.min(150, Math.max(50, parseInt(this.value, 10) || 100)); this.value = v; S.settings.limit = v; save(); renderAll(); toast('Limit save ho gayi'); };
    $('only2nd').onchange = function () { S.settings.only2nd = this.checked; save(); renderTasks(); renderProgress(); toast(this.checked ? 'Sirf 2nd-degree log dikhenge' : 'Sab log dikhenge'); };
    $('exportBtn').onclick = function () { var box = $('backupBox'); box.hidden = false; box.value = JSON.stringify(S); $('importApply').hidden = true; copyText(box.value); };
    $('importBtn').onclick = function () { var box = $('backupBox'); box.hidden = false; box.value = ''; box.focus(); $('importApply').hidden = false; };
    $('importApply').onclick = function () {
      try { var v = JSON.parse($('backupBox').value); if (!v || !v.log) throw 0; S = v; S.settings = S.settings || { target: 18, limit: 100 }; save(); initSettings(); renderAll(); toast('Backup lag gaya'); $('importApply').hidden = true; }
      catch (e) { toast('Yeh backup sahi nahi. Poora text paste karein.'); }
    };
    $('resetBtn').onclick = function () { $('resetConfirm').hidden = false; };
    $('resetNo').onclick = function () { $('resetConfirm').hidden = true; };
    $('resetYes').onclick = function () { S = { log: {}, settings: { target: 18, limit: 100, only2nd: false } }; save(); initSettings(); renderAll(); $('resetConfirm').hidden = true; toast('Sab data mit gaya'); };
  }

  // ---------- comments ----------
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-act]'); if (!b) return;
    var d = day();
    if (b.getAttribute('data-act') === 'com+') { d.com++; buzz(); } else d.com = Math.max(0, d.com - 1);
    save(); renderSummary();
  });

  // ---------- tabs ----------
  var TITLES = { today: 'Aaj ka plan', notes: 'Connection notes', progress: 'Progress', settings: 'Settings' };
  function show(view) {
    ['today', 'notes', 'progress', 'settings'].forEach(function (v) { $('view-' + v).hidden = v !== view; });
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) { t.classList.toggle('active', t.getAttribute('data-view') === view); });
    $('viewTitle').textContent = TITLES[view];
    if (view === 'progress') renderProgress();
    window.scrollTo(0, 0);
    try { history.replaceState(null, '', view === 'today' ? location.pathname : '#' + view); } catch (e) {}
  }
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) { t.onclick = function () { show(t.getAttribute('data-view')); }; });

  function renderAll() { renderSummary(); renderTasks(); }

  // refresh when the app comes back to the foreground (e.g. after LinkedIn), and at midnight
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { var old = today; refreshDate(); if (old !== today) renderTasks(); renderSummary(); } });

  initSettings(); renderNotes(); renderAll();
  var h = (location.hash || '').slice(1); show(TITLES[h] ? h : 'today');

  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
