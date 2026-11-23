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

  /* ---- theme ---- */
  function applyTheme() {
    const t = Store.prefs().theme;
    const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const b = document.getElementById('themeBtn'); if (b) b.querySelector('span').textContent = dark ? 'लाइट मोड' : 'डार्क मोड';
  }
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  /* ---- shell ---- */
  const NAV = [
    ['home', 'index.html', 'होम'], ['exams', 'exams.html', 'परीक्षाएँ'], ['subjects', 'subjects.html', 'विषय'],
    ['series', 'test-series.html', 'टेस्ट सीरीज़', fmt(C.totals.series)], ['practice', 'practice.html', 'अभ्यास'],
    ['notes', 'notes.html', 'नोट्स', fmt(C.totals.notes)], ['bookmarks', 'bookmarks.html', 'बुकमार्क'], ['results', 'results.html', 'परिणाम']
  ];
  function shell() {
    if (!document.querySelector('link[rel=icon]')) document.head.insertAdjacentHTML('beforeend', '<link rel="icon" type="image/png" href="assets/img/favicon.png">');
    const page = document.body.dataset.page;
    const navHtml = NAV.map(([id, href, label, count]) =>
      `<li><a href="${href}"${id === page ? ' aria-current="page"' : ''}><span class="dot" aria-hidden="true"></span>${label}${count ? `<small>${count}</small>` : ''}</a></li>`).join('');
    document.body.insertAdjacentHTML('afterbegin', `
      <a class="skip" href="#main">मुख्य सामग्री पर जाएँ</a>
      <div class="shell">
        <aside class="side" id="side" aria-label="मुख्य नेविगेशन">
          <a class="brand" href="index.html"><img class="brand-logo" src="assets/img/logo.jpg" width="132" height="132" alt="Atlas Academy: An Alternative Learning System"><b>सरकारी परीक्षा तैयारी</b><span>My Government Exam Preparation Portal</span></a>
          <ul class="nav">${navHtml}</ul>
          <div class="side-foot">
            <button class="theme-btn" id="themeBtn" type="button"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor"/><path d="M8 1.5a6.5 6.5 0 0 0 0 13z" fill="currentColor"/></svg><span>डार्क मोड</span></button>
            <span class="hint">${fmt(C.totals.questions)} प्रश्न, ${fmt(C.totals.tests)} टेस्ट. सारा डेटा इसी कंप्यूटर पर.</span>
          </div>
        </aside>
        <div class="main">
          <div class="topbar">
            <a class="top-logo" href="index.html"><img src="assets/img/logo.jpg" width="40" height="40" alt="Atlas Academy"></a>
            <button class="menu-btn" id="menuBtn" type="button" aria-controls="side" aria-expanded="false">मेनू</button>
            <form class="search" action="search.html" role="search">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6"/></svg>
              <input type="search" name="q" placeholder="टेस्ट, विषय, अध्याय या नोट्स खोजें" aria-label="खोजें" value="${esc(page === 'search' ? qs.get('q') || '' : '')}">
            </form>
          </div>
          <main id="main" class="wrap" tabindex="-1"></main>
        </div>
      </div>`);
    document.getElementById('themeBtn').onclick = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      Store.setPref('theme', dark ? 'light' : 'dark'); applyTheme();
    };
    applyTheme();
    const side = document.getElementById('side'), mb = document.getElementById('menuBtn');
    mb.onclick = e => { e.stopPropagation(); const o = side.classList.toggle('open'); mb.setAttribute('aria-expanded', o); };
    document.addEventListener('click', e => { if (side.classList.contains('open') && !side.contains(e.target)) { side.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') side.classList.remove('open'); });
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
    markingText, isDefaultMarking, loadSeries, bubble, seriesMeta, seriesTags,
    subjectTitle: id => SUBJECT_TITLE[id] || (subjects[id] && subjects[id].title_hi) || id,
    mount(render) {
      shell();
      const main = document.getElementById('main');
      try { render(main); } catch (e) { console.error(e); main.innerHTML = `<div class="empty"><b>यह पेज खुल नहीं सका</b>${esc(e.message)}</div>`; }
    }
  };
})();
