/* Shared shell + helpers. Each page sets <body data-page="..."> and a page script calls App.mount(renderFn). */
(function () {
  const C = window.CATALOG;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Number(n).toLocaleString('en-IN');
  const qs = new URLSearchParams(location.search);

  /* ---- indexes ---- */
  const series = {}, tests = {}, subjects = {}, exams = {}, notes = {};
  C.series.forEach(s => { series[s.id] = s; s.tests.forEach((t, i) => { t.series = s.id; t.n = i + 1; tests[t.id] = t; }); });
  C.subjects.forEach(s => subjects[s.id] = s);
  C.exams.forEach(e => exams[e.id] = e);
  C.notes.forEach(n => notes[n.id] = n);

  const SUBJECT_TITLE = { 'current-affairs': 'समसामयिकी', economy: 'अर्थव्यवस्था', history: 'इतिहास', geography: 'भूगोल', polity: 'राजव्यवस्था', environment: 'पर्यावरण एवं पारिस्थितिकी', science: 'सामान्य विज्ञान', 'up-gk': 'उत्तर प्रदेश विशेष', quant: 'गणित / अभिक्षमता' };
  const SUBJECT_ORDER = ['current-affairs', 'history', 'geography', 'polity', 'economy', 'environment', 'science', 'up-gk', 'quant'];
  const SHORT = {
    uppsc_ca_test: 'करेंट अफेयर्स टेस्ट 2026', uppsc_ca_series: 'करेंट अफेयर्स सीरीज़ 2026', upsc_ca: 'UPSC स्तर करेंट अफेयर्स',
    ramayan_ca: 'रामायण करेंट अफेयर्स', ca_batch1: 'करेंट अफेयर्स बैच 1', arthiki2026: 'आर्थिकी 2026', samsamayik_arthiki: 'सम-सामयिक आर्थिकी',
    uppsc_economy: 'अर्थव्यवस्था PYQ', ancient_history: 'प्राचीन इतिहास PYQ', medieval_history: 'मध्यकालीन इतिहास PYQ', modern_history: 'आधुनिक इतिहास PYQ',
    india_geography: 'भारत का भूगोल PYQ', world_geography: 'विश्व का भूगोल PYQ', polity_pyq: 'राजव्यवस्था PYQ', passage_pyq: 'अनुच्छेद आधारित PYQ',
    environment: 'पर्यावरण PYQ', general_science: 'भौतिकी PYQ', chemistry: 'रसायन विज्ञान PYQ', biology: 'जीव विज्ञान PYQ', lakshya_pcs: 'लक्ष्य PCS मॉक'
  };
  const UPDATED = { passage_pyq: '2026-11-20', polity_pyq: '2026-11-20', ca_batch1: '2026-11-17', uppsc_ca_test: '2026-11-14', india_geography: '2026-11-14', world_geography: '2026-11-14', uppsc_economy: '2026-11-14', uppsc_ca_series: '2026-11-14', modern_history: '2026-11-14', medieval_history: '2026-11-14', ancient_history: '2026-11-14', ramayan_ca: '2026-11-14', general_science: '2026-11-13', chemistry: '2026-11-13', environment: '2026-11-13', biology: '2026-11-13', samsamayik_arthiki: '2026-11-12', upsc_ca: '2026-11-09', arthiki2026: '2026-11-09', lakshya_pcs: '2026-11-05' };
  const FLAG_HI = f => !f ? '' : f.startsWith('duplicate pair A') ? 'इसकी एक और प्रति भी है' : f === '2 tabs' ? '2 भाग' : f.startsWith('other copy') ? 'दूसरी प्रति खाली थी' : f.startsWith('related') ? 'संबंधित सूची भी उपलब्ध' : f.startsWith('all 100 MCQs') ? 'सभी 100 प्रश्न टेस्ट सीरीज़ में शामिल' : f.startsWith('original was a web page') ? 'वेब पेज' : f;

  const markingText = m => {
    const neg = Math.abs(m.wrong);
    const negTxt = Math.abs(neg - 1 / 3) < 1e-6 ? '⅓' : Math.abs(neg - 2 / 3) < 1e-6 ? '⅔' : String(neg);
    return `सही +${m.correct}, गलत −${negTxt}`;
  };
  const isDefaultMarking = m => /^default/.test(m.source);

  /* ---- lazy load a series' questions (works from file:// via <script>) ---- */
  const loaded = {};
  function loadSeries(id) {
    if (window.__Q && window.__Q[id]) return Promise.resolve(window.__Q[id]);
    if (loaded[id]) return loaded[id];
    return loaded[id] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = `data-js/q/${id}.js`;
      s.onload = () => res(window.__Q[id]); s.onerror = () => rej(new Error('प्रश्न फ़ाइल नहीं मिली: ' + id));
      document.head.appendChild(s);
    });
  }

  /* ---- icons: one small line-icon set, drawn inline so the site stays offline ---- */
  const ICON_PATHS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9v12h13V9"/><path d="M10 21v-6h4v6"/>',
    exams: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><path d="M22 9v5"/>',
    subjects: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    series: '<rect x="4.5" y="4" width="15" height="17" rx="2.5"/><path d="M9 4V2.8h6V4"/><path d="M8.5 10h7M8.5 13.5h7M8.5 17h4"/>',
    practice: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
    notes: '<path d="M2.5 5.5c2.7-1.5 6-1.5 9.5.8 3.5-2.3 6.8-2.3 9.5-.8v13.6c-2.7-1.4-6-1.4-9.5.9-3.5-2.3-6.8-2.3-9.5-.9z"/><path d="M12 6.3v13.6"/>',
    bookmarks: '<path d="M6 3.5h12v17.5l-6-4.2-6 4.2z"/>',
    results: '<path d="M3.5 20.5h17"/><rect x="5" y="11" width="3.5" height="7" rx="1"/><rect x="10.3" y="5" width="3.5" height="13" rx="1"/><rect x="15.6" y="8.5" width="3.5" height="9.5" rx="1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/>',
    moon: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',
    menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 4"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>',
    trophy: '<path d="M7.5 4h9v4.5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 5.5H4.5a3 3 0 0 0 3 4M16.5 5.5h3a3 3 0 0 1-3 4"/><path d="M12 13v3.5M8.5 20.5h7M9.5 20.5c0-2 1-4 2.5-4s2.5 2 2.5 4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    shield: '<path d="M12 2.8 4.5 5.6v6c0 4.6 3.2 8.2 7.5 9.6 4.3-1.4 7.5-5 7.5-9.6v-6z"/><path d="m9 12 2.2 2.2L15.3 10"/>'
  };
  const icon = (name, size) => `<svg class="ico" width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;

  /* ---- theme: light is the default; dark only when the reader switches it on ---- */
  (function migrateTheme() {
    const p = Store.prefs();
    if (!p.ui2) { Store.setPref('theme', 'light'); Store.setPref('ui2', 1); }
  })();
  function applyTheme() {
    const dark = Store.prefs().theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const b = document.getElementById('themeBtn');
    if (b) {
      b.querySelector('.tl').textContent = dark ? 'लाइट मोड' : 'डार्क मोड';
      b.querySelector('.ti').innerHTML = icon(dark ? 'sun' : 'moon', 19);
      b.setAttribute('aria-label', dark ? 'लाइट मोड पर जाएँ' : 'डार्क मोड पर जाएँ');
    }
  }
  applyTheme();

  /* ---- shell ---- */
  const NAV = [
    ['home', 'index.html', 'डैशबोर्ड'], ['exams', 'exams.html', 'परीक्षाएँ'], ['subjects', 'subjects.html', 'विषय'],
    ['series', 'test-series.html', 'टेस्ट सीरीज़', fmt(C.totals.series)], ['practice', 'practice.html', 'अभ्यास'],
    ['notes', 'notes.html', 'नोट्स', fmt(C.totals.notes)], ['bookmarks', 'bookmarks.html', 'बुकमार्क'], ['results', 'results.html', 'परिणाम']
  ];
  const NAV_ICON = { home: 'home', exams: 'exams', subjects: 'subjects', series: 'series', practice: 'practice', notes: 'notes', bookmarks: 'bookmarks', results: 'results' };
  function shell() {
    if (!document.querySelector('link[rel=icon]')) document.head.insertAdjacentHTML('beforeend', '<link rel="icon" type="image/png" href="assets/img/favicon.png">');
    const page = document.body.dataset.page;
    const navHtml = NAV.map(([id, href, label, count]) =>
      `<li><a href="${href}"${id === page ? ' aria-current="page"' : ''}>${icon(NAV_ICON[id])}<span class="nl">${label}</span>${count ? `<small>${count}</small>` : ''}</a></li>`).join('');
    const year = new Date().getFullYear();
    document.body.insertAdjacentHTML('afterbegin', `
      <a class="skip" href="#main">मुख्य सामग्री पर जाएँ</a>
      <header class="appbar">
        <button class="menu-btn" id="menuBtn" type="button" aria-controls="side" aria-expanded="false" aria-label="मेनू">${icon('menu', 22)}</button>
        <a class="brand" href="index.html">
          <img class="brand-logo" src="assets/img/logo.jpg" width="48" height="48" alt="Atlas Academy">
          <span class="brand-text"><b>Atlas Academy</b><span>An Alternative Learning System</span></span>
        </a>
        <form class="search" action="search.html" role="search">
          ${icon('search', 18)}
          <input type="search" name="q" placeholder="टेस्ट, विषय, अध्याय या नोट्स खोजें" aria-label="खोजें" value="${esc(page === 'search' ? qs.get('q') || '' : '')}">
        </form>
        <button class="theme-btn" id="themeBtn" type="button"><span class="ti"></span><span class="tl">डार्क मोड</span></button>
      </header>
      <div class="shell">
        <aside class="side" id="side" aria-label="मुख्य नेविगेशन">
          <div class="side-brand"><img src="assets/img/logo.jpg" width="40" height="40" alt=""><b>Atlas Academy</b></div>
          <p class="side-label">मेनू</p>
          <ul class="nav">${navHtml}</ul>
          <div class="side-card">
            ${icon('shield', 20)}
            <p><b>${fmt(C.totals.questions)} प्रश्न, ${fmt(C.totals.tests)} टेस्ट</b>आपकी प्रगति केवल इसी कंप्यूटर पर सहेजी जाती है.</p>
          </div>
        </aside>
        <div class="main">
          <main id="main" class="wrap" tabindex="-1"></main>
          <footer class="foot">
            <div class="foot-brand"><img src="assets/img/logo.jpg" width="44" height="44" alt="">
              <div><b>Atlas Academy</b><span>An Alternative Learning System</span><span class="foot-exams">UPPSC, UPSSSC, RO/ARO और अन्य प्रतियोगी परीक्षाएँ</span></div></div>
            <nav class="foot-links" aria-label="फ़ुटर">
              <a href="test-series.html">टेस्ट सीरीज़</a><a href="practice.html">अभ्यास</a><a href="notes.html">नोट्स</a><a href="results.html">परिणाम</a>
            </nav>
            <p class="foot-note">${fmt(C.totals.questions)} प्रश्न, ${fmt(C.totals.tests)} टेस्ट और ${C.totals.notes} नोट्स. इंटरनेट के बिना चलता है. © ${year} Atlas Academy</p>
          </footer>
        </div>
      </div>
      <div class="scrim" id="scrim" hidden></div>`);
    document.getElementById('themeBtn').onclick = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      Store.setPref('theme', dark ? 'light' : 'dark'); applyTheme();
    };
    applyTheme();
    const side = document.getElementById('side'), mb = document.getElementById('menuBtn'), scrim = document.getElementById('scrim');
    const setOpen = o => { side.classList.toggle('open', o); scrim.hidden = !o; mb.setAttribute('aria-expanded', o); document.body.classList.toggle('nav-open', o); };
    mb.onclick = e => { e.stopPropagation(); setOpen(!side.classList.contains('open')); };
    scrim.onclick = () => setOpen(false);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && side.classList.contains('open')) setOpen(false); });
  }

  /* ---- reusable fragments ---- */
  const bubble = (t, i) => {
    const st = Store.testStatus(t.id);
    const label = `${SHORT[t.series] || ''} — ${t.title} (${t.count} प्रश्न)${st === 'done' ? ', दिया गया' : st === 'part' ? ', अधूरा' : ''}`;
    return `<a class="bub ${st === 'done' ? 'done' : st === 'part' ? 'part' : ''}" style="--i:${i || 0}" href="test.html?t=${t.id}" title="${esc(label)}" aria-label="${esc(label)}"></a>`;
  };
  const seriesMeta = s => {
    const tags = [`${fmt(s.question_count)} प्रश्न`, `${s.tests.length} टेस्ट`, exams[s.exam].title_en.split(' ')[0]];
    return tags.join(', ');
  };
  const seriesTags = s => {
    const t = [];
    if (s.image_based) t.push('<span class="tag">प्रश्न चित्र रूप में</span>');
    if (s.with_explanation === 0) t.push('<span class="tag warn">व्याख्या उपलब्ध नहीं</span>');
    else if (s.with_explanation < s.question_count) t.push(`<span class="tag">${fmt(s.with_explanation)} प्रश्नों में व्याख्या</span>`);
    if (/PYQ/.test(s.title) || /PYQ|विगत/.test(s.title)) t.push('<span class="tag">विगत वर्षों के प्रश्न</span>');
    return t.join('');
  };

  window.App = {
    C, esc, fmt, qs, series, tests, subjects, exams, notes, SHORT, UPDATED, SUBJECT_TITLE, SUBJECT_ORDER, FLAG_HI,
    markingText, isDefaultMarking, loadSeries, bubble, seriesMeta, seriesTags, icon,
    subjectTitle: id => SUBJECT_TITLE[id] || (subjects[id] && subjects[id].title_hi) || id,
    mount(render) {
      shell();
      const main = document.getElementById('main');
      try { render(main); } catch (e) { console.error(e); main.innerHTML = `<div class="empty"><b>यह पेज खुल नहीं सका</b>${esc(e.message)}</div>`; }
    }
  };
})();
