/* Test page (start / resume / review), practice builder + sessions, bookmarks, results. */
(function () {
  const A = App, E = Engine, { C, esc, fmt } = A;
  const crumbs = items => `<nav class="crumbs" aria-label="आप यहाँ हैं">${items.map(([h, t]) => h ? `<a href="${h}">${esc(t)}</a>` : esc(t)).join(' / ')}</nav>`;
  const loading = (main, t) => main.innerHTML = `<div class="empty"><b>${t || 'प्रश्न लोड हो रहे हैं…'}</b></div>`;
  const fail = (main, e) => main.innerHTML = `<div class="empty"><b>प्रश्न नहीं खुल सके</b>${esc(e.message)}. जाँचें कि <code>data-js</code> फ़ोल्डर पूरा है.</div>`;
  const NEG = [[0, 'कोई कटौती नहीं'], [-0.25, '¼ अंक'], [-1 / 3, '⅓ अंक'], [-0.5, '½ अंक']]; // fraction of the question's marks
  const allSeriesIds = () => C.series.map(s => s.id);
  const wrongIds = () => { const a = Store.attempts(); return Object.keys(a).filter(id => a[id][4] === 0); };
  const attemptedIds = () => Object.keys(Store.attempts());
  const isRepeat = q => (q.source || '').includes(';') || q.repeat_flag;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ================= TEST: instructions → start/resume, or ?review=k ================= */
  Pages.test = main => {
    const t = A.tests[A.qs.get('t')];
    if (!t) { main.innerHTML = '<div class="empty"><b>टेस्ट नहीं मिला</b><a href="test-series.html">सभी टेस्ट सीरीज़</a></div>'; return; }
    const s = A.series[t.series], m = s.marking, res = Store.results()[t.id] || [], back = [`test-series.html?id=${s.id}`, A.SHORT[s.id]];
    const title = `${A.SHORT[s.id]}: ${t.title}`;

    const rk = A.qs.get('review');
    if (rk != null && res[+rk]) {
      loading(main);
      E.loadQuestions(t.question_ids).then(qs => E.showResult(main, { qs, res: res[+rk], title, testId: t.id, back, attemptNo: +rk + 1 })).catch(e => fail(main, e));
      return;
    }
    const prog = Store.progress()[t.id];
    main.innerHTML = `${crumbs([['test-series.html', 'टेस्ट सीरीज़'], back, [null, t.title]])}
      <header class="page-head"><h1>${esc(t.title)}</h1><p>${esc(s.title)}</p></header>
      <section class="sheet"><dl class="kv">
        <div><dt>परीक्षा</dt><dd>${esc(A.exams[s.exam].title_hi)}</dd></div><div><dt>विषय</dt><dd>${A.subjectTitle(s.subject)}</dd></div>
        <div><dt>प्रश्न</dt><dd>${t.count}</dd></div><div><dt>पूर्णांक</dt><dd id="maxM">${+t.max_marks.toFixed(2)}</dd></div>
        <div><dt>समय</dt><dd>${t.duration_min} मिनट</dd></div><div><dt>अंकन</dt><dd>${A.markingText(m)}</dd></div></dl></section>
      <section class="sheet"><h2 style="margin-bottom:10px">निर्देश</h2><ol class="instructions">
        <li>स्क्रीन पर एक बार में एक प्रश्न दिखेगा. "सहेजें और अगला" और "पिछला" से आगे-पीछे जाएँ, या उत्तर-पत्रक में किसी भी प्रश्न पर सीधे जाएँ.</li>
        <li>हर सही उत्तर पर नीचे चुने अंक मिलेंगे और हर गलत उत्तर पर नकारात्मक अंक कटेंगे. छोड़े गए प्रश्न पर कोई अंक नहीं कटता.</li>
        <li>"समीक्षा हेतु चिह्नित करें" से प्रश्न को बाद में देखने के लिए चिह्नित करें. चुना उत्तर हटाने के लिए "उत्तर हटाएँ" दबाएँ.</li>
        <li>समय पूरा होते ही टेस्ट अपने आप जमा हो जाएगा. बीच में पेज बंद हो जाए तो यहीं से जारी रख सकते हैं.</li>
        <li>कीबोर्ड: 1–4 से विकल्प, ← → से प्रश्न बदलें, M से चिह्नित करें.</li></ol></section>
      <section class="sheet"><h2 style="margin-bottom:6px">अंकन और समय</h2>
        <p class="hint">${A.isDefaultMarking(m) ? 'मूल सीरीज़ में अंकन नहीं दिया था; UPPSC जैसा अंकन पहले से चुना है.' : 'मूल सीरीज़ का अंकन पहले से चुना है.'} इस प्रयास के लिए बदल सकते हैं.</p>
        <div class="form-row">
          <label>सही उत्तर पर<select id="mC">${[1, 2, 2.5, 4].map(v => `<option value="${v}"${v === m.correct ? ' selected' : ''}>+${v}</option>`).join('')}</select></label>
          <label>गलत उत्तर पर प्रश्न के अंकों का<select id="mW">${NEG.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
          <label>समय (मिनट)<input id="mT" type="number" min="1" max="600" value="${t.duration_min}"></label>
        </div></section>
      ${res.length ? `<section class="sheet"><h2 style="margin-bottom:10px">पिछले प्रयास</h2><div class="tbl-wrap"><table><thead><tr><th>तारीख</th><th class="n">अंक</th><th class="n">सही</th><th class="n">गलत</th><th class="n">छोड़े</th><th></th></tr></thead><tbody>
        ${res.map((r, k) => [r, k]).reverse().map(([r, k]) => `<tr><td>${new Date(r.at).toLocaleString('hi-IN')}</td><td class="n">${r.score}/${r.max}</td><td class="n">${r.correct}</td><td class="n">${r.wrong}</td><td class="n">${r.skipped}</td><td class="n">${r.answers ? `<a class="btn sm ghost" href="test.html?t=${t.id}&review=${k}">उत्तर देखें</a>` : ''}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
      <div class="block q-actions">
        ${prog ? `<button class="btn" type="button" id="resume">जारी रखें (${Object.keys(prog.answers).length} उत्तर, ${E.mmss(prog.left)} बचा)</button><button class="btn ghost" type="button" id="start">नए सिरे से शुरू करें</button>`
              : '<button class="btn" type="button" id="start">टेस्ट शुरू करें</button>'}
        <a class="btn ghost" href="practice.html?t=${t.id}">बिना समय अभ्यास</a></div>`;
    // negative select: stored as fraction of correct marks → actual penalty = frac * correct
    const negSel = main.querySelector('#mW');
    const curFrac = m.wrong / m.correct; // e.g. −0.66/2 ≈ −⅓ (UPSC), −⅔/2 = −⅓ (लक्ष्य)
    let best = NEG[0][0]; NEG.forEach(([v]) => { if (Math.abs(v - curFrac) < Math.abs(best - curFrac)) best = v; });
    [...negSel.options].forEach(o => o.selected = +o.value === best);
    const upd = () => main.querySelector('#maxM').textContent = +(t.count * +main.querySelector('#mC').value).toFixed(2);
    main.querySelector('#mC').onchange = upd;
    const go = resume => {
      const correct = +main.querySelector('#mC').value, frac = +negSel.value;
      let wrong = frac * correct; if (Math.abs(m.wrong + 0.66) < 1e-6 && correct === 2 && Math.abs(frac + 1 / 3) < 1e-6) wrong = -0.66; // keep UPSC's printed −0.66
      const dur = Math.max(1, +main.querySelector('#mT').value || t.duration_min);
      loading(main);
      E.loadQuestions(t.question_ids).then(qs => {
        if (resume) { const ok = prog.ids.length === qs.length; E.run(main, { mode: 'test', title, back, questions: qs, testId: t.id, marking: prog.marking, durationMin: prog.left / 60, resume: ok ? prog : null }); }
        else { Store.setProgress(t.id, null); E.run(main, { mode: 'test', title, back, questions: qs, testId: t.id, marking: { correct, wrong }, durationMin: dur }); }
      }).catch(e => fail(main, e));
    };
    main.querySelector('#start').onclick = () => go(false);
    if (prog) main.querySelector('#resume').onclick = () => go(true);
  };

  /* ================= PRACTICE ================= */
  Pages.practice = main => {
    const P = A.qs, src = P.get('src'), tId = P.get('t'), sId = P.get('s'), qid = P.get('q');
    const start = (ids, title, back) => {
      if (!ids.length) { main.innerHTML = `${crumbs([['practice.html', 'अभ्यास'], [null, title]])}<div class="empty"><b>इस चयन में कोई प्रश्न नहीं है</b>दूसरा विकल्प चुनें या <a href="practice.html">नया अभ्यास</a> बनाएँ.</div>`; return; }
      loading(main);
      E.loadQuestions(ids).then(qs => E.run(main, { mode: 'practice', title, back: back || ['practice.html', 'अभ्यास'], questions: qs })).catch(e => fail(main, e));
    };
    if (qid) return start([qid], 'एक प्रश्न का अभ्यास', ['search.html', 'खोज']);
    if (tId && src !== 'attempt') { const t = A.tests[tId]; if (t) return start(t.question_ids, `${A.SHORT[t.series]}: ${t.title}`, [`test-series.html?id=${t.series}`, A.SHORT[t.series]]); }
    if (src === 'wrong') return start(wrongIds(), 'पिछली बार गलत हुए प्रश्न');
    if (src === 'bookmarks') return start(Object.keys(Store.bookmarks()), 'बुकमार्क किए प्रश्न', ['bookmarks.html', 'बुकमार्क']);
    if (src === 'attempted') return start(attemptedIds(), 'पहले हल किए प्रश्न');
    if (src === 'attempt') {
      const t = A.tests[tId], r = t && (Store.results()[tId] || [])[+P.get('k') || 0];
      if (r && r.answers) return E.loadQuestions(t.question_ids).then(qs => start(qs.filter(q => !E.isRight(q, r.answers[q.id])).map(q => q.id), `${t.title}: गलत और छोड़े प्रश्न`, [`test.html?t=${tId}`, t.title]));
    }
    if (sId) {
      const s = A.series[sId]; if (!s) return start([], 'अभ्यास');
      const pick = (P.get('tests') || '').split(',').filter(Boolean);
      const mode = P.get('mode') || 'all', n = +P.get('n') || 0, mix = P.get('mix') === '1';
      let ids = (pick.length ? s.tests.filter(t => pick.includes(t.id)) : s.tests).flatMap(t => t.question_ids);
      return A.loadSeries(sId).then(all => {
        const by = {}; all.forEach(q => by[q.id] = q); const at = Store.attempts();
        if (mode === 'new') ids = ids.filter(id => !at[id]);
        if (mode === 'wrong') ids = ids.filter(id => at[id] && at[id][4] === 0);
        if (mode === 'repeat') ids = ids.filter(id => isRepeat(by[id]));
        if (mix) ids = shuffle(ids);
        if (n) ids = ids.slice(0, n);
        const label = { all: '', new: ', नए प्रश्न', wrong: ', पहले गलत हुए', repeat: ', बार-बार पूछे गए' }[mode] || '';
        start(ids, `${A.SHORT[sId]}${label}`);
      }).catch(e => fail(main, e));
    }

    /* builder */
    const wr = wrongIds().length, bm = Object.keys(Store.bookmarks()).length, atn = attemptedIds().length;
    main.innerHTML = `<header class="page-head"><h1>अभ्यास</h1><p>बिना समय के. हर उत्तर चुनते ही सही-गलत और व्याख्या दिखती है. यहाँ के उत्तर "परिणाम" में नहीं जुड़ते, पर गलत प्रश्न याद रखे जाते हैं.</p></header>
      <div class="quick">
        <a class="quick-i" href="practice.html?src=wrong"${wr ? '' : ' aria-disabled="true"'}><b>गलत हुए प्रश्न</b><span>${wr ? fmt(wr) + ' प्रश्न जो पिछली बार गलत हुए' : 'अभी कोई नहीं'}</span></a>
        <a class="quick-i" href="practice.html?src=bookmarks"${bm ? '' : ' aria-disabled="true"'}><b>बुकमार्क</b><span>${bm ? fmt(bm) + ' सहेजे गए प्रश्न' : 'अभी कोई नहीं'}</span></a>
        <a class="quick-i" href="practice.html?src=attempted"${atn ? '' : ' aria-disabled="true"'}><b>पहले हल किए</b><span>${atn ? fmt(atn) + ' प्रश्न दोबारा देखें' : 'अभी कोई नहीं'}</span></a>
      </div>
      <form class="sheet block" id="builder"><h2 style="margin-bottom:12px">अपना अभ्यास बनाएँ</h2>
        <div class="form-row">
          <label>विषय<select id="bSub"><option value="">सभी विषय</option>${A.SUBJECT_ORDER.filter(x => C.series.some(s => s.subject === x)).map(x => `<option value="${x}">${A.subjectTitle(x)}</option>`).join('')}</select></label>
          <label>टेस्ट सीरीज़<select id="bSer" name="s" required></select></label>
        </div>
        <fieldset class="fs"><legend>अध्याय / टेस्ट <span class="hint">(कोई न चुनें तो सभी)</span></legend><div class="checks" id="bTests"></div></fieldset>
        <div class="form-row">
          <label>कौन-से प्रश्न<select name="mode"><option value="all">सभी</option><option value="new">जो अभी तक हल नहीं किए</option><option value="wrong">जो पिछली बार गलत हुए</option><option value="repeat">महत्वपूर्ण: एक से अधिक परीक्षाओं में पूछे गए</option></select></label>
          <label>कितने<select name="n"><option value="10">10</option><option value="25" selected>25</option><option value="50">50</option><option value="100">100</option><option value="0">सभी</option></select></label>
          <label>क्रम<select name="mix"><option value="1">मिलाकर</option><option value="0">मूल क्रम में</option></select></label>
        </div>
        <input type="hidden" name="tests" id="bPick">
        <div class="q-actions"><button class="btn" type="submit">अभ्यास शुरू करें</button></div>
      </form>`;
    const sub = main.querySelector('#bSub'), ser = main.querySelector('#bSer'), box = main.querySelector('#bTests');
    const fillSer = () => { ser.innerHTML = C.series.filter(s => !sub.value || s.subject === sub.value).map(s => `<option value="${s.id}">${esc(s.title)} (${fmt(s.question_count)})</option>`).join(''); fillTests(); };
    const fillTests = () => { const s = A.series[ser.value]; box.innerHTML = s.tests.map(t => `<label class="ck"><input type="checkbox" value="${t.id}"> ${esc(t.title)} <span class="hint">${t.count}</span></label>`).join(''); };
    sub.onchange = fillSer; ser.onchange = fillTests; fillSer();
    main.querySelector('#builder').onsubmit = () => { main.querySelector('#bPick').value = [...box.querySelectorAll('input:checked')].map(i => i.value).join(','); };
    main.querySelector('#builder').setAttribute('action', 'practice.html');
  };

  /* ================= BOOKMARKS ================= */
  Pages.bookmarks = main => {
    const ids = Object.keys(Store.bookmarks());
    if (!ids.length) { main.innerHTML = `<header class="page-head"><h1>बुकमार्क</h1></header><div class="empty"><b>अभी कोई बुकमार्क नहीं</b>टेस्ट, अभ्यास या खोज में किसी प्रश्न पर "☆ बुकमार्क" दबाएँ; वह यहाँ दिखेगा.</div>`; return; }
    loading(main);
    E.loadQuestions(ids).then(qs => {
      const groups = {}; qs.forEach(q => (groups[q.series] = groups[q.series] || []).push(q));
      main.innerHTML = `<header class="page-head"><h1>बुकमार्क</h1><p>${qs.length} प्रश्न सहेजे हैं.</p></header>
        <div class="q-actions" style="margin-bottom:8px"><a class="btn" href="practice.html?src=bookmarks">इन सबका अभ्यास करें</a></div>
        ${Object.keys(groups).map(sid => `<section class="sheet"><div class="sheet-head"><h2 style="font-size:26px">${esc(A.SHORT[sid])}</h2><span class="hint">${groups[sid].length}</span></div>
          <ol class="review">${groups[sid].map(q => `<li class="ritem" id="bm-${q.id}"><div class="q-head"><div class="tags">${[q.topic, q.source].filter(Boolean).map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
            <button type="button" class="bm-btn" data-rm="${q.id}" aria-pressed="true">★ हटाएँ</button></div>
            ${q.q_image ? `<img class="qimg" src="${E.imgSrc(q.q_image)}" alt="प्रश्न">` : `<div class="qtext">${esc(q.q)}</div>`}
            <details><summary>उत्तर देखें</summary>${q.options ? `<ul class="ropts">${q.options.map((o, i) => `<li class="ropt ${E.correctSet(q).includes(i) ? 'right' : ''}"><span class="obub">${'abcdef'[i]}</span>${esc(o)}</li>`).join('')}</ul>` : `<p class="verdict">सही उत्तर: ${E.correctSet(q).map(i => '(' + 'abcdef'[i] + ')').join(' या ')}</p>`}
              ${q.explanation ? `<div class="explain"><b class="ex-h">व्याख्या</b><div class="ex-text">${esc(q.explanation)}</div></div>` : q.explanation_image ? `<div class="explain"><img class="qimg" src="${E.imgSrc(q.explanation_image)}" alt="व्याख्या"></div>` : ''}</details></li>`).join('')}</ol></section>`).join('')}`;
      main.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { Store.toggleBookmark(b.dataset.rm); document.getElementById('bm-' + b.dataset.rm).remove(); });
    }).catch(e => fail(main, e));
  };

  /* ================= RESULTS ================= */
  Pages.results = main => {
    const R = Store.results(), rows = Object.keys(R).filter(id => A.tests[id]).flatMap(id => R[id].map((r, k) => [id, r, k])).sort((a, b) => b[1].at - a[1].at);
    if (!rows.length) { main.innerHTML = `<header class="page-head"><h1>परिणाम</h1></header><div class="empty"><b>अभी कोई टेस्ट नहीं दिया</b>कोई भी <a href="test-series.html">टेस्ट</a> दें; उसका स्कोर, सही-गलत और समय यहाँ जमा होगा.</div>`; return; }
    const c = rows.reduce((n, [, r]) => n + r.correct, 0), w = rows.reduce((n, [, r]) => n + r.wrong, 0), tested = new Set(rows.map(r => r[0])).size;
    main.innerHTML = `<header class="page-head"><h1>परिणाम</h1></header>
      <section class="sheet"><dl class="kv"><div><dt>टेस्ट दिए</dt><dd>${tested} <span class="hint">(${rows.length} प्रयास)</span></dd></div>
        <div><dt>कुल सही</dt><dd class="c-ok">${fmt(c)}</dd></div><div><dt>कुल गलत</dt><dd class="c-bad">${fmt(w)}</dd></div>
        <div><dt>सटीकता</dt><dd>${c + w ? Math.round(c * 100 / (c + w)) : 0}%</dd></div><div><dt>हल किए प्रश्न</dt><dd>${fmt(attemptedIds().length)}</dd></div></dl>
        <div class="q-actions" style="margin-top:14px"><a class="btn ghost" href="practice.html?src=wrong">गलत प्रश्नों का अभ्यास</a><a class="btn ghost" href="practice.html?src=attempted">हल किए प्रश्न दोबारा</a></div></section>
      <section class="sheet"><div class="tbl-wrap"><table><thead><tr><th>तारीख</th><th>टेस्ट</th><th class="n">अंक</th><th class="n">सही</th><th class="n">गलत</th><th class="n">छोड़े</th><th class="n">समय</th><th></th></tr></thead><tbody>
      ${rows.map(([id, r, k]) => `<tr><td>${new Date(r.at).toLocaleDateString('hi-IN')}</td><td><a href="test.html?t=${id}">${esc(A.SHORT[A.tests[id].series])}: ${esc(A.tests[id].title)}</a></td><td class="n">${r.score}/${r.max}</td><td class="n">${r.correct}</td><td class="n">${r.wrong}</td><td class="n">${r.skipped}</td><td class="n">${E.mmss(r.secs || 0)}</td>
        <td class="n">${r.answers ? `<a class="btn sm ghost" href="test.html?t=${id}&review=${k}">उत्तर देखें</a>` : ''}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="sheet"><h2 style="margin-bottom:8px">बैकअप</h2><p class="muted">आपकी प्रगति केवल इसी ब्राउज़र में है. दूसरे कंप्यूटर या ब्राउज़र में ले जाने के लिए फ़ाइल सहेजें.</p>
        <div class="q-actions"><button class="btn ghost" type="button" id="exp">प्रगति फ़ाइल में सहेजें</button><label class="btn ghost">फ़ाइल से वापस लाएँ<input type="file" id="imp" accept=".json" hidden></label></div></section>`;
    main.querySelector('#exp').onclick = () => { const b = new Blob([JSON.stringify(Store.exportAll())], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `exam-portal-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
    main.querySelector('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { Store.importAll(JSON.parse(t)); location.reload(); }).catch(() => alert('यह फ़ाइल पढ़ी नहीं जा सकी.')); };
  };
})();
