/* Question engine shared by timed tests (mode 'test') and instant-check practice (mode 'practice').
   Answers are always stored as the ORIGINAL option index from the source data; display order may be shuffled
   only for series whose source stored the correct option first (the original pages shuffled them too). */
(function () {
  const A = App, { esc, fmt } = A;
  const L = ['a', 'b', 'c', 'd', 'e', 'f'];
  const SHUFFLE_SERIES = { arthiki2026: 1, ramayan_ca: 1 };

  const seriesOf = qid => qid.slice(0, qid.lastIndexOf('-'));
  const optCount = q => q.options ? q.options.length : (q.option_count || 4);
  const correctSet = q => Array.isArray(q.answer) ? q.answer : [q.answer];
  const isRight = (q, i) => i != null && correctSet(q).includes(i);
  const fracTxt = v => { const a = Math.abs(v); return a === 0 ? '0' : Math.abs(a - 1 / 3) < 1e-6 ? '⅓' : Math.abs(a - 2 / 3) < 1e-6 ? '⅔' : Math.abs(a - .25) < 1e-6 ? '¼' : Math.abs(a - .5) < 1e-6 ? '½' : String(+a.toFixed(2)); };
  const r2 = n => Math.round(n * 100) / 100;
  const mmss = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };

  /* load question objects for a list of ids (spanning any series) */
  async function loadQuestions(ids) {
    const need = [...new Set(ids.map(seriesOf))];
    await Promise.all(need.map(A.loadSeries));
    const map = {}; need.forEach(s => window.__Q[s].forEach(q => map[q.id] = q));
    const qs = ids.map(id => map[id]).filter(Boolean);
    await ensureImages(qs);
    return qs;
  }
  /* image-based questions: pictures live in data-js/img/<series>/t<N>.js bundles (works from file://) */
  const imgLoaded = {};
  function ensureImages(qs) {
    const keys = [...new Set(qs.filter(q => q.q_image).map(q => `${q.series}/t${q.test_no}`))];
    return Promise.all(keys.map(k => imgLoaded[k] || (imgLoaded[k] = new Promise(res => {
      const s = document.createElement('script'); s.src = `data-js/img/${k}.js`; s.onload = res; s.onerror = res; document.head.appendChild(s);
    }))));
  }
  const imgSrc = p => (window.__IMGS && window.__IMGS[p]) || p;
  function makeOrder(qs) {
    const o = {};
    qs.forEach(q => {
      if (!SHUFFLE_SERIES[q.series] || q.fixed_order || !q.options) return;
      const p = q.options.map((_, i) => i);
      for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
      o[q.id] = p;
    });
    return o;
  }

  /* ---------- rendering pieces ---------- */
  function qText(q, lang) {
    if (q.q_image) return `<img class="qimg" src="${imgSrc(q.q_image)}" alt="प्रश्न (पुस्तक के पन्ने की तस्वीर)">`;
    const t = lang === 'en' && q.q_en ? q.q_en : q.q;
    return `<div class="qtext">${esc(t)}</div>`;
  }
  function optText(q, i, lang) {
    if (!q.options) return '';
    const arr = lang === 'en' && q.options_en ? q.options_en : q.options;
    return esc(arr[i]);
  }
  function explanation(q, lang) {
    const parts = [];
    const ex = lang === 'en' && q.explanation_en ? q.explanation_en : q.explanation;
    if (ex) parts.push(`<div class="ex-text">${esc(ex)}</div>`);
    if (q.explanation_image) parts.push(`<img class="qimg" src="${imgSrc(q.explanation_image)}" alt="व्याख्या (पुस्तक के पन्ने की तस्वीर)">`);
    if (q.note) parts.push(`<div class="ex-text"><b>संबंधित तथ्य:</b> ${esc(q.note)}</div>`);
    if (!parts.length) parts.push('<div class="hint">इस प्रश्न के लिए मूल सामग्री में व्याख्या नहीं थी.</div>');
    return `<div class="explain"><b class="ex-h">व्याख्या</b>${parts.join('')}</div>`;
  }
  function answerLine(q, order, lang) {
    const c = correctSet(q).map(i => { const d = order ? order.indexOf(i) : i; return `(${L[d]})${q.options ? ' ' + optText(q, i, lang) : ''}`; });
    return `सही उत्तर: ${c.join(' या ')}${c.length > 1 ? ' <span class="hint">(स्रोत के अनुसार दोनों सही)</span>' : ''}`;
  }
  const qMeta = q => [q.topic, q.source].filter(Boolean).map(x => `<span class="tag">${esc(x)}</span>`).join('');
  const bmBtn = q => { const on = !!Store.bookmarks()[q.id]; return `<button type="button" class="bm-btn" data-bm="${q.id}" aria-pressed="${on}">${on ? '★ बुकमार्क किया' : '☆ बुकमार्क'}</button>`; };
  function wireBookmarks(root) {
    root.querySelectorAll('[data-bm]').forEach(b => b.onclick = () => { const on = Store.toggleBookmark(b.dataset.bm); b.setAttribute('aria-pressed', on); b.textContent = on ? '★ बुकमार्क किया' : '☆ बुकमार्क'; });
  }

  /* ======================================================================
     run(main, cfg)
     cfg: {mode:'test'|'practice', title, back:[href,label], questions, testId?, marking, durationMin?, resume?, onFinish?}
     ====================================================================== */
  function run(main, cfg) {
    const qs = cfg.questions, N = qs.length, test = cfg.mode === 'test';
    const st = cfg.resume || { ids: qs.map(q => q.id), order: makeOrder(qs), answers: {}, marked: [], visited: [], checked: {}, pos: 0, left: test ? Math.round(cfg.durationMin * 60) : 0, used: 0, lang: 'hi', marking: cfg.marking };
    const marked = new Set(st.marked), visited = new Set(st.visited);
    const bilingual = qs.some(q => q.q_en);
    let timer = null, lastTick = Date.now(), done = false;

    const save = () => { if (test && cfg.testId && !done) { st.marked = [...marked]; st.visited = [...visited]; Store.setProgress(cfg.testId, st); } };
    const displayIdx = (q, orig) => st.order[q.id] ? st.order[q.id].indexOf(orig) : orig;
    const origIdx = (q, disp) => st.order[q.id] ? st.order[q.id][disp] : disp;
    const stateOf = q => { const a = st.answers[q.id] != null, m = marked.has(q.id); return a && m ? 'am' : m ? 'mk' : a ? 'an' : visited.has(q.id) ? 'nv' : 'na'; };

    main.innerHTML = `
      <div class="exam${test ? '' : ' practice'}">
        <div class="exam-bar">
          <div class="exam-title"><a href="${cfg.back[0]}" class="hint">${esc(cfg.back[1])}</a><b>${esc(cfg.title)}</b></div>
          ${bilingual ? '<div class="lang" role="group" aria-label="भाषा"><button type="button" data-lang="hi">हिंदी</button><button type="button" data-lang="en">English</button></div>' : ''}
          ${test ? '<div class="timer" id="timer" role="timer" aria-live="off"></div><button class="btn" id="submitBtn" type="button">टेस्ट जमा करें</button>' : `<span class="hint" id="pscore"></span><button class="btn ghost" id="endBtn" type="button">अभ्यास समाप्त करें</button>`}
          <button class="btn ghost pal-toggle" id="palToggle" type="button" aria-controls="palette" aria-expanded="false">प्रश्न-सूची</button>
        </div>
        <div class="exam-body">
          <section class="qpane" id="qpane" aria-live="polite"></section>
          <aside class="palette" id="palette" aria-label="उत्तर-पत्रक">
            <div class="pal-head"><b>उत्तर-पत्रक</b><span class="hint" id="palCount"></span></div>
            <div class="pal-grid" id="palGrid"></div>
            ${test ? `<ul class="pal-legend">
              <li><span class="pb na"></span>नहीं देखा</li><li><span class="pb nv"></span>बिना उत्तर</li><li><span class="pb an"></span>उत्तर दिया</li>
              <li><span class="pb mk"></span>समीक्षा हेतु</li><li><span class="pb am"></span>उत्तर + समीक्षा</li></ul>` : `<ul class="pal-legend"><li><span class="pb ok"></span>सही</li><li><span class="pb bad"></span>गलत</li><li><span class="pb na"></span>बाकी</li></ul>`}
          </aside>
        </div>
      </div>
      <dialog id="confirm" class="dlg"></dialog>`;
    const $ = s => main.querySelector(s);

    function palette() {
      $('#palGrid').innerHTML = qs.map((q, i) => {
        let cls = stateOf(q);
        if (!test) cls = st.checked[q.id] == null ? 'na' : isRight(q, st.checked[q.id]) ? 'ok' : 'bad';
        return `<button type="button" class="pb ${cls}${i === st.pos ? ' cur' : ''}" data-go="${i}" aria-label="प्रश्न ${i + 1}">${i + 1}</button>`;
      }).join('');
      $('#palGrid').querySelectorAll('[data-go]').forEach(b => b.onclick = () => { go(+b.dataset.go); closePal(); });
      const answered = Object.keys(st.answers).length;
      if (test) $('#palCount').textContent = `${answered}/${N} उत्तर, ${marked.size} चिह्नित`;
      else { const c = Object.keys(st.checked), r = c.filter(id => isRight(qs.find(q => q.id === id), st.checked[id])).length; $('#palCount').textContent = `${c.length}/${N} हल`; $('#pscore').textContent = `सही ${r}, गलत ${c.length - r}`; }
    }

    function render() {
      const q = qs[st.pos]; visited.add(q.id);
      const n = optCount(q), chosen = test ? st.answers[q.id] : st.checked[q.id];
      const checked = !test && chosen != null;
      const opts = Array.from({ length: n }, (_, d) => {
        const o = origIdx(q, d);
        let cls = '';
        if (test && chosen === o) cls = 'sel';
        if (checked) { if (isRight(q, o)) cls = 'right'; else if (chosen === o) cls = 'wrong'; }
        return `<button type="button" class="opt ${cls}" role="radio" aria-checked="${chosen === o}" data-o="${o}" ${checked ? 'disabled' : ''}>
          <span class="obub">${L[d]}</span><span class="otext">${q.options ? optText(q, o, st.lang) : `विकल्प (${L[d]})`}</span>${checked && isRight(q, o) ? '<span class="omark">सही</span>' : checked && chosen === o ? '<span class="omark">आपका उत्तर</span>' : ''}</button>`;
      }).join('');
      $('#qpane').innerHTML = `
        <div class="q-head"><span class="q-no">प्रश्न ${st.pos + 1} <span class="hint">/ ${N}</span></span><div class="tags">${qMeta(q)}</div>${bmBtn(q)}</div>
        ${q.source_defect ? `<p class="note">${esc(q.source_defect)}</p>` : ''}
        ${qText(q, st.lang)}
        ${q.q_image ? '<p class="hint">ऊपर चित्र में दिए विकल्पों में से चुनें.</p>' : ''}
        <div class="opts" role="radiogroup" aria-label="विकल्प">${opts}</div>
        ${checked ? `<p class="verdict ${isRight(q, chosen) ? 'ok' : 'bad'}">${isRight(q, chosen) ? 'सही उत्तर.' : 'गलत उत्तर. ' + answerLine(q, st.order[q.id], st.lang)}</p>${explanation(q, st.lang)}` : ''}
        <div class="q-actions">
          <button class="btn ghost" type="button" id="prevBtn" ${st.pos === 0 ? 'disabled' : ''}>पिछला</button>
          ${test ? `<button class="btn ghost" type="button" id="clearBtn" ${chosen == null ? 'disabled' : ''}>उत्तर हटाएँ</button>
            <button class="btn ghost" type="button" id="markBtn">${marked.has(q.id) ? 'चिह्न हटाएँ' : 'समीक्षा हेतु चिह्नित करें'}</button>` : ''}
          <span class="spacer"></span>
          <button class="btn" type="button" id="nextBtn">${st.pos === N - 1 ? (test ? 'जमा करने के लिए तैयार' : 'परिणाम देखें') : test ? 'सहेजें और अगला' : 'अगला'}</button>
        </div>`;
      $('#qpane').querySelectorAll('.opt').forEach(b => b.onclick = () => choose(+b.dataset.o));
      $('#prevBtn').onclick = () => go(st.pos - 1);
      $('#nextBtn').onclick = () => st.pos === N - 1 ? (test ? confirmSubmit() : finishPractice()) : go(st.pos + 1);
      if (test) {
        $('#clearBtn').onclick = () => { delete st.answers[q.id]; save(); render(); };
        $('#markBtn').onclick = () => { marked.has(q.id) ? marked.delete(q.id) : marked.add(q.id); save(); render(); };
      }
      wireBookmarks($('#qpane'));
      main.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === st.lang));
      palette(); save();
      A.C && Store.setLast({ test: cfg.testId || null, practice: !test ? location.search : null });
    }
    function choose(o) {
      const q = qs[st.pos];
      if (test) st.answers[q.id] = o;
      else { if (st.checked[q.id] != null) return; st.checked[q.id] = o; Store.recordAttempt(q.id, o, isRight(q, o)); }
      render();
    }
    function go(i) { if (i < 0 || i >= N) return; st.pos = i; render(); $('#qpane').scrollIntoView({ block: 'start' }); $('#qpane').focus && $('#qpane').focus(); }

    /* palette drawer on small screens */
    const pal = $('#palette'), pt = $('#palToggle');
    const closePal = () => { pal.classList.remove('open'); pt.setAttribute('aria-expanded', 'false'); };
    pt.onclick = () => { const o = pal.classList.toggle('open'); pt.setAttribute('aria-expanded', o); };
    main.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { st.lang = b.dataset.lang; render(); });

    /* keyboard: 1-6 / a-f choose, ← → move, M mark */
    const onKey = e => {
      if (done || e.target.closest('input,textarea,select,dialog')) return;
      const q = qs[st.pos], n = optCount(q);
      const k = e.key.toLowerCase(), di = '123456'.indexOf(k) >= 0 ? '123456'.indexOf(k) : L.indexOf(k);
      if (di >= 0 && di < n && !e.ctrlKey && !e.metaKey) { choose(origIdx(q, di)); e.preventDefault(); }
      else if (e.key === 'ArrowRight') go(st.pos + 1);
      else if (e.key === 'ArrowLeft') go(st.pos - 1);
      else if (k === 'm' && test) { marked.has(q.id) ? marked.delete(q.id) : marked.add(q.id); save(); render(); }
    };
    document.addEventListener('keydown', onKey);

    /* ---------- timer ---------- */
    function tick() {
      const now = Date.now(), d = (now - lastTick) / 1000; lastTick = now;
      st.left -= d; st.used += d;
      const t = $('#timer'); if (!t) return;
      t.textContent = mmss(st.left);
      t.classList.toggle('low', st.left <= 300);
      t.setAttribute('aria-label', `बचा समय ${mmss(st.left)}`);
      if (Math.round(st.used) % 5 === 0) save();
      if (st.left <= 0) { clearInterval(timer); submit(true); }
    }
    if (test) { tick(); timer = setInterval(tick, 1000); }

    /* ---------- submit ---------- */
    function confirmSubmit() {
      const a = Object.keys(st.answers).length;
      const dlg = $('#confirm');
      dlg.innerHTML = `<form method="dialog"><h2>टेस्ट जमा करें?</h2>
        <dl class="kv" style="margin:14px 0"><div><dt>उत्तर दिए</dt><dd>${a}</dd></div><div><dt>बिना उत्तर</dt><dd>${N - a}</dd></div><div><dt>समीक्षा हेतु चिह्नित</dt><dd>${marked.size}</dd></div><div><dt>बचा समय</dt><dd>${mmss(st.left)}</dd></div></dl>
        <p class="muted">जमा करने के बाद उत्तर बदले नहीं जा सकेंगे.</p>
        <div class="q-actions"><button class="btn ghost" value="no">वापस टेस्ट पर</button><span class="spacer"></span><button class="btn" value="yes">हाँ, जमा करें</button></div></form>`;
      dlg.onclose = () => { if (dlg.returnValue === 'yes') submit(false); };
      dlg.showModal();
    }
    if (test) $('#submitBtn').onclick = confirmSubmit;

    function submit(auto) {
      if (done) return; done = true; clearInterval(timer); document.removeEventListener('keydown', onKey);
      const m = st.marking; let c = 0, w = 0, sk = 0;
      qs.forEach(q => { const a = st.answers[q.id]; if (a == null) sk++; else if (isRight(q, a)) c++; else w++; if (a != null) Store.recordAttempt(q.id, a, isRight(q, a)); });
      const res = { at: Date.now(), score: r2(c * m.correct + w * m.wrong), max: r2(N * m.correct), correct: c, wrong: w, skipped: sk, secs: Math.round(st.used), auto: !!auto, marking: m, answers: st.answers, order: st.order };
      if (cfg.testId) { Store.addResult(cfg.testId, res); Store.setProgress(cfg.testId, null); }
      showResult(main, { qs, res, title: cfg.title, testId: cfg.testId, back: cfg.back, auto });
    }
    function finishPractice() {
      done = true; document.removeEventListener('keydown', onKey);
      const ids = Object.keys(st.checked), r = ids.filter(id => isRight(qs.find(q => q.id === id), st.checked[id])).length;
      main.innerHTML = `<section class="sheet"><h1>अभ्यास पूरा</h1><dl class="kv" style="margin:16px 0">
        <div><dt>हल किए</dt><dd>${ids.length} / ${N}</dd></div><div><dt>सही</dt><dd>${r}</dd></div><div><dt>गलत</dt><dd>${ids.length - r}</dd></div>
        <div><dt>सटीकता</dt><dd>${ids.length ? Math.round(r * 100 / ids.length) : 0}%</dd></div></dl>
        <div class="q-actions"><a class="btn" href="practice.html?src=wrong">गलत प्रश्नों का अभ्यास</a><a class="btn ghost" href="${cfg.back[0]}">${esc(cfg.back[1])}</a><a class="btn ghost" href="practice.html">नया अभ्यास</a></div></section>`;
    }
    render();
    return { submit };
  }

  /* ======================================================================
     Result + question-wise review (also used to re-open past attempts)
     ====================================================================== */
  function showResult(main, { qs, res, title, testId, back, auto, attemptNo }) {
    const N = qs.length, att = res.correct + res.wrong;
    const topics = {};
    qs.forEach(q => { const t = q.topic || '—', a = res.answers[q.id]; const x = topics[t] = topics[t] || [0, 0, 0]; a == null ? x[2]++ : isRight(q, a) ? x[0]++ : x[1]++; });
    const tkeys = Object.keys(topics);
    const status = q => { const a = res.answers[q.id]; return a == null ? 'skip' : isRight(q, a) ? 'ok' : 'bad'; };
    main.innerHTML = `
      ${back ? `<nav class="crumbs"><a href="${back[0]}">${esc(back[1])}</a></nav>` : ''}
      <section class="sheet result">
        <div class="result-top"><div><h1>${esc(title)}</h1>
          <p class="muted">${attemptNo ? `प्रयास ${attemptNo}, ` : ''}${new Date(res.at).toLocaleString('hi-IN')}${auto ? '. समय पूरा होने पर अपने आप जमा हुआ.' : ''}</p></div>
          <div class="score"><span class="score-n">${res.score}</span><span class="score-d">/ ${res.max} अंक</span></div></div>
        <dl class="kv"><div><dt>सही</dt><dd class="c-ok">${res.correct}</dd></div><div><dt>गलत</dt><dd class="c-bad">${res.wrong}</dd></div>
          <div><dt>छोड़े</dt><dd>${res.skipped}</dd></div><div><dt>सटीकता</dt><dd>${att ? Math.round(res.correct * 100 / att) : 0}%</dd></div>
          <div><dt>लगा समय</dt><dd>${mmss(res.secs)}</dd></div><div><dt>अंकन</dt><dd>+${res.marking.correct}, −${fracTxt(res.marking.wrong)}</dd></div></dl>
        <div class="bar3" aria-hidden="true"><i class="ok" style="flex:${res.correct}"></i><i class="bad" style="flex:${res.wrong}"></i><i style="flex:${res.skipped}"></i></div>
        <div class="q-actions" style="margin-top:16px">
          ${testId ? `<a class="btn" href="test.html?t=${testId}">फिर से दें</a>` : ''}
          ${res.wrong + res.skipped ? `<a class="btn ghost" href="practice.html?src=attempt&t=${testId || ''}&k=${attemptNo ? attemptNo - 1 : ''}">गलत और छोड़े प्रश्नों का अभ्यास</a>` : ''}
          <a class="btn ghost" href="results.html">सभी परिणाम</a></div>
      </section>
      ${tkeys.length > 1 ? `<section class="sheet"><h2 style="margin-bottom:10px">अध्याय के अनुसार</h2><div class="tbl-wrap"><table><thead><tr><th>अध्याय</th><th class="n">सही</th><th class="n">गलत</th><th class="n">छोड़े</th></tr></thead><tbody>
        ${tkeys.map(t => `<tr><td>${esc(t)}</td><td class="n">${topics[t][0]}</td><td class="n">${topics[t][1]}</td><td class="n">${topics[t][2]}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
      <section class="sheet"><div class="sheet-head"><h2>उत्तर और व्याख्या</h2></div>
        <ul class="chips" role="group" aria-label="छाँटें">${[['all', 'सभी', N], ['bad', 'गलत', res.wrong], ['skip', 'छोड़े', res.skipped], ['ok', 'सही', res.correct]].map(([k, t, n], i) => `<li><button type="button" data-f="${k}" aria-pressed="${i === 0}">${t} (${n})</button></li>`).join('')}</ul>
        <ol class="review" id="review">${qs.map((q, i) => {
          const a = res.answers[q.id], s = status(q), order = res.order && res.order[q.id], n = optCount(q);
          const opts = Array.from({ length: n }, (_, d) => { const o = order ? order[d] : d; const cls = isRight(q, o) ? 'right' : a === o ? 'wrong' : '';
            return `<li class="ropt ${cls}"><span class="obub">${L[d]}</span>${q.options ? optText(q, o, 'hi') : ''}${isRight(q, o) ? ' <b class="omark">सही</b>' : a === o ? ' <b class="omark">आपका उत्तर</b>' : ''}</li>`; }).join('');
          return `<li class="ritem" data-s="${s}"><div class="q-head"><span class="q-no">प्रश्न ${i + 1}</span><span class="tag ${s === 'ok' ? 'ok' : s === 'bad' ? 'bad-t' : ''}">${s === 'ok' ? 'सही' : s === 'bad' ? 'गलत' : 'छोड़ा'}</span><div class="tags">${qMeta(q)}</div>${bmBtn(q)}</div>
            ${q.source_defect ? `<p class="note">${esc(q.source_defect)}</p>` : ''}${qText(q, 'hi')}<ul class="ropts">${opts}</ul>
            ${s !== 'ok' ? `<p class="verdict ${s === 'bad' ? 'bad' : ''}">${answerLine(q, order, 'hi')}</p>` : ''}${explanation(q, 'hi')}</li>`;
        }).join('')}</ol></section>`;
    main.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
      main.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b));
      main.querySelectorAll('.ritem').forEach(li => li.hidden = b.dataset.f !== 'all' && li.dataset.s !== b.dataset.f);
    });
    wireBookmarks(main);
    window.scrollTo(0, 0);
  }

  window.Engine = { run, showResult, loadQuestions, imgSrc, isRight, correctSet, fracTxt, seriesOf, mmss };
})();
