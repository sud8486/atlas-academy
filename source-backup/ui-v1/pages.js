/* Page renderers. Each HTML file calls App.mount(Pages.<name>). */
(function () {
  const A = App, { C, esc, fmt } = A;
  const bySubject = list => A.SUBJECT_ORDER.map(id => [id, list.filter(x => x.subject === id)]).filter(([, l]) => l.length);
  const crumbs = items => `<nav class="crumbs" aria-label="आप यहाँ हैं">${items.map(([h, t]) => h ? `<a href="${h}">${esc(t)}</a>` : esc(t)).join(' / ')}</nav>`;
  const lastScore = id => { const r = (Store.results()[id] || []).slice(-1)[0]; return r ? `${+r.score.toFixed(2)}/${r.max}` : ''; };
  const notFound = (main, what, back, backT) => main.innerHTML = `<div class="empty"><b>${what} नहीं मिला</b>हो सकता है लिंक पुराना हो. <a href="${back}">${backT}</a> पर जाएँ.</div>`;

  const Pages = {};

  /* ================= HOME ================= */
  Pages.home = main => {
    const T = C.totals, last = Store.last();
    const lastTest = last && A.tests[last.test];
    const cont = lastTest
      ? `<a class="continue" href="test.html?t=${lastTest.id}"><small>जहाँ छोड़ा था</small><b>${esc(A.SHORT[lastTest.series])}</b><span class="muted">${esc(lastTest.title)}</span></a>`
      : `<a class="continue" href="test-series.html?id=upsc_ca"><small>शुरुआत के लिए</small><b>UPSC स्तर करेंट अफेयर्स</b><span class="muted">100 प्रश्नों का पूरा मॉक टेस्ट</span></a>`;
    const ordered = A.SUBJECT_ORDER.flatMap(sid => C.series.filter(s => s.subject === sid));
    let i = 0;
    const rows = ordered.map(s => {
      const done = s.tests.filter(t => Store.testStatus(t.id) === 'done').length;
      return `<li class="row"><a class="row-name" href="test-series.html?id=${s.id}">${esc(A.SHORT[s.id])}<small>${A.subjectTitle(s.subject)}</small></a>
        <div class="bubbles">${s.tests.map(t => A.bubble(t, i++)).join('')}</div>
        <span class="row-count">${done}/${s.tests.length}</span></li>`;
    }).join('');
    const doneAll = C.series.reduce((n, s) => n + s.tests.filter(t => Store.testStatus(t.id) === 'done').length, 0);
    const recent = [...C.series].sort((a, b) => (A.UPDATED[b.id] || '').localeCompare(A.UPDATED[a.id] || '')).slice(0, 6);
    const subjectsList = A.SUBJECT_ORDER.filter(id => A.subjects[id]).map(id => {
      const s = A.subjects[id], q = s.series.reduce((n, x) => n + A.series[x].question_count, 0);
      return `<li><a href="subjects.html?id=${id}"><span class="t">${A.subjectTitle(id)}</span><span class="m">${q ? fmt(q) + ' प्रश्न' : ''}${q && s.notes.length ? ', ' : ''}${s.notes.length ? s.notes.length + ' नोट्स' : ''}</span></a></li>`;
    }).join('');
    main.innerHTML = `
      <section class="hello">
        <div><h1>आज कहाँ से शुरू करें?</h1>
          <p>आपकी सारी टेस्ट सीरीज़ और नोट्स अब एक जगह हैं. नीचे हर गोला एक टेस्ट है; टेस्ट पूरा करते ही वह भर जाता है.</p></div>
        ${cont}
      </section>
      <ul class="facts" aria-label="संग्रह का सार">
        <li><b>${T.exams}</b>परीक्षा वर्ग</li><li><b>${T.subjects}</b>विषय</li><li><b>${T.series}</b>टेस्ट सीरीज़</li>
        <li><b>${fmt(T.tests)}</b>टेस्ट</li><li><b>${fmt(T.questions)}</b>प्रश्न</li><li><b>${T.notes}</b>नोट्स</li>
      </ul>
      <section class="register block inking" aria-labelledby="regH">
        <div class="register-top"><h2 id="regH">उत्तर-पत्रक</h2>
          <ul class="legend"><li><span class="bub"></span>बाकी</li><li><span class="bub part"></span>अधूरा</li><li><span class="bub done"></span>दिया गया</li><li>${doneAll} / ${fmt(T.tests)} पूरे</li></ul></div>
        <ul class="rows">${rows}</ul>
      </section>
      <div class="two">
        <section class="sheet"><div class="sheet-head"><h2>विषय के अनुसार</h2><a class="hint" href="subjects.html">सभी विषय</a></div>
          <ul class="list">${subjectsList}</ul>
          <div class="sheet-head" style="margin-top:22px"><h3>परीक्षा के अनुसार</h3></div>
          <ul class="list">${C.exams.map(e => `<li><a href="exams.html#${e.id}"><span class="t">${esc(e.title_hi)}</span><span class="m">${e.series.length} सीरीज़</span></a></li>`).join('')}</ul>
        </section>
        <section class="sheet"><div class="sheet-head"><h2>हाल में जोड़े गए</h2></div>
          <ul class="list">${recent.map(s => `<li><a href="test-series.html?id=${s.id}"><span class="t">${esc(A.SHORT[s.id])}</span><span class="m">${new Date(A.UPDATED[s.id]).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}</span></a></li>`).join('')}</ul>
          <div class="sheet-head" style="margin-top:22px"><h3>जल्दी पहुँचें</h3></div>
          <ul class="list">
            <li><a href="test.html?t=upsc_ca-t001"><span class="t">पूरा मॉक: UPSC स्तर करेंट अफेयर्स</span><span class="m">100 प्रश्न, 120 मिनट</span></a></li>
            <li><a href="test-series.html?id=lakshya_pcs"><span class="t">लक्ष्य PCS मॉक (हिंदी + English)</span><span class="m">2 टेस्ट</span></a></li>
            <li><a href="notes.html?subject=current-affairs"><span class="t">करेंट अफेयर्स रिवीज़न नोट्स</span><span class="m">${C.notes.filter(n => n.subject === 'current-affairs').length} नोट्स</span></a></li>
            <li><a href="notes.html?id=quant-formulas"><span class="t">गणित सूत्र-पत्रक</span><span class="m">PDF</span></a></li>
          </ul>
        </section>
      </div>`;
    setTimeout(() => main.querySelector('.register').classList.remove('inking'), 4000);
  };

  /* ================= EXAMS ================= */
  Pages.exams = main => {
    const DESC = { uppsc: 'उत्तर प्रदेश लोक सेवा आयोग और राज्य PCS की प्रारंभिक परीक्षा के लिए: विगत वर्षों के प्रश्न, करेंट अफेयर्स और अर्थव्यवस्था.', upsc: 'UPSC सिविल सेवा प्रारंभिक परीक्षा के कठिन पैटर्न वाले प्रश्न: कथन आधारित, सुमेलन और अनुच्छेद आधारित.' };
    main.innerHTML = `<header class="page-head"><h1>परीक्षाएँ</h1><p>केवल वही परीक्षा वर्ग दिखाए गए हैं जिनकी सामग्री आपके संग्रह में है.</p></header>` +
      C.exams.map(e => `<section class="sheet" id="${e.id}"><div class="sheet-head"><h2>${esc(e.title_hi)}</h2><span class="hint">${e.series.length} टेस्ट सीरीज़, ${fmt(e.series.reduce((n, s) => n + A.series[s].question_count, 0))} प्रश्न</span></div>
        <p class="muted">${DESC[e.id] || ''}</p>
        ${bySubject(e.series.map(id => A.series[id])).map(([sid, list]) => `<h3 style="margin-top:14px">${A.subjectTitle(sid)}</h3>
          <ul class="list">${list.map(s => `<li><a href="test-series.html?id=${s.id}"><span class="t">${esc(s.title)}</span><span class="m">${fmt(s.question_count)} प्रश्न, ${s.tests.length} टेस्ट</span></a></li>`).join('')}</ul>`).join('')}
      </section>`).join('');
    if (location.hash) { const el = document.querySelector(location.hash); if (el) el.scrollIntoView(); }
  };

  /* ================= SUBJECTS ================= */
  Pages.subjects = main => {
    const id = A.qs.get('id');
    if (!id) {
      main.innerHTML = `<header class="page-head"><h1>विषय</h1><p>हर विषय में उसकी टेस्ट सीरीज़, अध्याय और रिवीज़न नोट्स.</p></header>
        <section class="sheet"><ul class="list">${A.SUBJECT_ORDER.filter(s => A.subjects[s]).map(sid => {
          const s = A.subjects[sid], q = s.series.reduce((n, x) => n + A.series[x].question_count, 0), t = s.series.reduce((n, x) => n + A.series[x].tests.length, 0);
          return `<li><a href="subjects.html?id=${sid}"><span class="t">${A.subjectTitle(sid)}</span><span class="m">${[s.series.length && s.series.length + ' सीरीज़', t && t + ' टेस्ट', q && fmt(q) + ' प्रश्न', s.notes.length && s.notes.length + ' नोट्स'].filter(Boolean).join(', ')}</span></a></li>`;
        }).join('')}</ul></section>`;
      return;
    }
    const s = A.subjects[id]; if (!s) return notFound(main, 'विषय', 'subjects.html', 'सभी विषय');
    const ser = s.series.map(x => A.series[x]);
    main.innerHTML = `${crumbs([['subjects.html', 'विषय'], [null, A.subjectTitle(id)]])}
      <header class="page-head"><h1>${A.subjectTitle(id)}</h1><p>${ser.length ? `${ser.length} टेस्ट सीरीज़, ${fmt(ser.reduce((n, x) => n + x.question_count, 0))} प्रश्न` : 'इस विषय में अभी केवल नोट्स हैं'}${s.notes.length ? `, ${s.notes.length} नोट्स` : ''}.</p></header>
      ${ser.map(x => `<section class="sheet"><div class="sheet-head"><h2 style="font-size:26px"><a href="test-series.html?id=${x.id}" style="text-decoration:none">${esc(x.title)}</a></h2><span class="hint">${A.seriesMeta(x)}</span></div>
        <div class="tags" style="margin-bottom:12px">${A.seriesTags(x)}</div>
        <ul class="chips" aria-label="अध्याय / टेस्ट">${x.tests.map(t => `<li><a href="test.html?t=${t.id}" title="${t.count} प्रश्न">${esc(t.title)}</a></li>`).join('')}</ul></section>`).join('')}
      ${s.notes.length ? `<section class="sheet"><div class="sheet-head"><h2>रिवीज़न नोट्स</h2></div><ul class="list">${s.notes.map(n => A.notes[n]).map(n => `<li><a href="notes.html?id=${n.id}"><span class="t">${esc(n.title)}</span><span class="m">${n.parts[0].pdf ? 'PDF' : 'वेब पेज'}</span></a></li>`).join('')}</ul></section>` : ''}`;
  };

  /* ================= TEST SERIES ================= */
  Pages.series = main => {
    const id = A.qs.get('id');
    if (!id) {
      const f = A.qs.get('subject');
      const list = C.series.filter(s => !f || s.subject === f);
      main.innerHTML = `<header class="page-head"><h1>टेस्ट सीरीज़</h1><p>${C.series.length} सीरीज़, ${fmt(C.totals.tests)} टेस्ट. हर टेस्ट को समयबद्ध परीक्षा या बिना समय के अभ्यास, दोनों तरह दे सकते हैं.</p></header>
        <ul class="chips" aria-label="विषय से छाँटें"><li><a href="test-series.html"${!f ? ' aria-current="true"' : ''}>सभी</a></li>${A.SUBJECT_ORDER.filter(s => C.series.some(x => x.subject === s)).map(s => `<li><a href="test-series.html?subject=${s}"${f === s ? ' aria-current="true"' : ''}>${A.subjectTitle(s)}</a></li>`).join('')}</ul>
        ${bySubject(list).map(([sid, l]) => `<section class="group"><h2>${A.subjectTitle(sid)}</h2>${l.map(s => {
          const done = s.tests.filter(t => Store.testStatus(t.id) === 'done').length;
          return `<article class="series"><div><h3><a href="test-series.html?id=${s.id}">${esc(s.title)}</a></h3>
            <div class="meta">${A.seriesMeta(s)}, ${A.markingText(s.marking)}${done ? `, ${done} टेस्ट दिए` : ''}</div></div>
            <div class="acts"><a class="btn sm" href="test-series.html?id=${s.id}">टेस्ट देखें</a></div>
            <div class="tags">${A.seriesTags(s)}</div></article>`;
        }).join('')}</section>`).join('')}`;
      return;
    }
    const s = A.series[id]; if (!s) return notFound(main, 'टेस्ट सीरीज़', 'test-series.html', 'सभी टेस्ट सीरीज़');
    const m = s.marking;
    main.innerHTML = `${crumbs([['test-series.html', 'टेस्ट सीरीज़'], [`test-series.html?subject=${s.subject}`, A.subjectTitle(s.subject)], [null, A.SHORT[s.id]]])}
      <header class="page-head"><h1>${esc(s.title)}</h1><div class="tags" style="margin-top:10px">${A.seriesTags(s)}</div></header>
      <section class="sheet"><dl class="kv">
        <div><dt>परीक्षा</dt><dd>${esc(A.exams[s.exam].title_hi)}</dd></div>
        <div><dt>विषय</dt><dd>${A.subjectTitle(s.subject)}</dd></div>
        <div><dt>प्रश्न</dt><dd>${fmt(s.question_count)}</dd></div>
        <div><dt>टेस्ट</dt><dd>${s.tests.length}</dd></div>
        <div><dt>अंकन</dt><dd>${A.markingText(m)}</dd></div>
        <div><dt>व्याख्या</dt><dd>${s.with_explanation === s.question_count ? 'सभी प्रश्नों में' : s.with_explanation ? fmt(s.with_explanation) + ' प्रश्नों में' : 'उपलब्ध नहीं'}</dd></div>
      </dl>
      ${A.isDefaultMarking(m) ? '<p class="note" style="margin:16px 0 0">मूल सीरीज़ में अंकन योजना नहीं दी गई थी, इसलिए UPPSC जैसा अंकन (+1, −⅓) रखा गया है. इसे टेस्ट शुरू करने से पहले बदल सकते हैं.</p>' : `<p class="hint" style="margin:14px 0 0">अंकन मूल सीरीज़ से लिया गया है.</p>`}
      ${s.image_based ? '<p class="hint" style="margin:8px 0 0">इस सीरीज़ में प्रश्न और व्याख्या पुस्तक के पन्नों की तस्वीरों के रूप में हैं; उत्तर-कुंजी टेक्स्ट में है.</p>' : ''}
      </section>
      <section class="sheet"><div class="sheet-head"><h2>टेस्ट</h2><span class="hint"><a href="${esc(s.source_url)}" target="_blank" rel="noopener">मूल सीरीज़ (इंटरनेट पर)</a></span></div>
        <div class="tbl-wrap"><table class="tests"><thead><tr><th>#</th><th>टेस्ट</th><th class="n">प्रश्न</th><th class="n">पूर्णांक</th><th class="n">समय</th><th>स्थिति</th><th></th></tr></thead><tbody>
        ${s.tests.map((t, i) => `<tr><td class="n">${i + 1}</td><td>${esc(t.title)}</td><td class="n">${t.count}</td><td class="n">${+t.max_marks.toFixed(2)}</td><td class="n">${t.duration_min} मि.</td>
          <td>${A.bubble(t, 0)} <span class="hint">${lastScore(t.id)}</span></td>
          <td><div class="acts"><a class="btn sm" href="test.html?t=${t.id}">टेस्ट दें</a><a class="btn sm ghost" href="practice.html?t=${t.id}">अभ्यास</a></div></td></tr>`).join('')}
        </tbody></table></div></section>`;
  };

  /* ================= TEST: instruction screen (engine arrives in Phase 5) ================= */
  Pages.test = main => {
    const t = A.tests[A.qs.get('t')]; if (!t) return notFound(main, 'टेस्ट', 'test-series.html', 'टेस्ट सीरीज़');
    const s = A.series[t.series], m = s.marking, res = Store.results()[t.id] || [];
    const neg = A.markingText(m).split('−')[1];
    main.innerHTML = `${crumbs([['test-series.html', 'टेस्ट सीरीज़'], [`test-series.html?id=${s.id}`, A.SHORT[s.id]], [null, t.title]])}
      <header class="page-head"><h1>${esc(t.title)}</h1><p>${esc(s.title)}</p></header>
      <section class="sheet"><dl class="kv">
        <div><dt>परीक्षा</dt><dd>${esc(A.exams[s.exam].title_hi)}</dd></div><div><dt>विषय</dt><dd>${A.subjectTitle(s.subject)}</dd></div>
        <div><dt>प्रश्न</dt><dd>${t.count}</dd></div><div><dt>पूर्णांक</dt><dd>${+t.max_marks.toFixed(2)}</dd></div>
        <div><dt>सुझाया समय</dt><dd>${t.duration_min} मिनट</dd></div><div><dt>अंकन</dt><dd>${A.markingText(m)}</dd></div></dl></section>
      <section class="sheet"><h2 style="margin-bottom:10px">निर्देश</h2><ol class="instructions">
        <li>स्क्रीन पर एक बार में एक प्रश्न दिखेगा. "अगला" और "पिछला" से आगे-पीछे जाएँ, या दाईं ओर के उत्तर-पत्रक में किसी भी प्रश्न पर सीधे जाएँ.</li>
        <li>हर सही उत्तर पर +${m.correct} अंक. हर गलत उत्तर पर ${neg} अंक कटेंगे. छोड़े गए प्रश्न पर कोई अंक नहीं कटता.</li>
        <li>किसी प्रश्न को बाद में देखने के लिए "समीक्षा हेतु चिह्नित करें" दबाएँ. चुना उत्तर हटाने के लिए "उत्तर हटाएँ" दबाएँ.</li>
        <li>${t.duration_min} मिनट पूरे होते ही टेस्ट अपने आप जमा हो जाएगा. पहले जमा करना हो तो "टेस्ट जमा करें" दबाएँ.</li>
        <li>जमा करने के बाद हर प्रश्न का सही उत्तर और व्याख्या दिखेगी.</li></ol></section>
      ${res.length ? `<section class="sheet"><h2 style="margin-bottom:10px">पिछले प्रयास</h2><div class="tbl-wrap"><table><thead><tr><th>तारीख</th><th class="n">अंक</th><th class="n">सही</th><th class="n">गलत</th><th class="n">छोड़े</th></tr></thead><tbody>${res.slice().reverse().map(r => `<tr><td>${new Date(r.at).toLocaleString('hi-IN')}</td><td class="n">${+r.score.toFixed(2)}/${r.max}</td><td class="n">${r.correct}</td><td class="n">${r.wrong}</td><td class="n">${r.skipped}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
      <div class="block" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <button class="btn" type="button" disabled>टेस्ट शुरू करें</button><a class="btn ghost" href="practice.html?t=${t.id}">बिना समय अभ्यास</a>
        <span class="hint">टेस्ट इंजन अगले चरण (Phase 5) में जुड़ेगा.</span></div>`;
  };

  /* ================= NOTES ================= */
  Pages.notes = main => {
    const id = A.qs.get('id');
    if (!id) {
      const f = A.qs.get('subject');
      const list = C.notes.filter(n => !f || n.subject === f);
      main.innerHTML = `<header class="page-head"><h1>नोट्स</h1><p>${C.notes.length} रिवीज़न नोट्स, मूल रूप जैसे ही (PDF). इंटरनेट के बिना खुलते हैं.</p></header>
        <ul class="chips" aria-label="विषय से छाँटें"><li><a href="notes.html"${!f ? ' aria-current="true"' : ''}>सभी</a></li>${A.SUBJECT_ORDER.filter(s => C.notes.some(n => n.subject === s)).map(s => `<li><a href="notes.html?subject=${s}"${f === s ? ' aria-current="true"' : ''}>${A.subjectTitle(s)}</a></li>`).join('')}</ul>
        ${bySubject(list).map(([sid, l]) => `<section class="group"><h2>${A.subjectTitle(sid)}</h2><ul class="list">${l.map(n => `<li><a href="notes.html?id=${n.id}"><span class="t">${esc(n.title)}</span><span class="m">${n.flag ? `<span class="tag">${esc(A.FLAG_HI(n.flag))}</span> ` : ''}${n.parts[0].pdf ? 'PDF' : 'वेब पेज'}</span></a></li>`).join('')}</ul></section>`).join('')}
        ${!f && C.empty_notes.length ? `<details class="block hint"><summary>${C.empty_notes.length} नोट्स डॉक खाली थे, इसलिए शामिल नहीं</summary><ul>${C.empty_notes.map(e => `<li>${esc(e.title)}</li>`).join('')}</ul><p>इनमें केवल शीर्षक था, कोई सामग्री नहीं.</p></details>` : ''}`;
      return;
    }
    const n = A.notes[id]; if (!n) return notFound(main, 'नोट्स', 'notes.html', 'सभी नोट्स');
    main.innerHTML = `${crumbs([['notes.html', 'नोट्स'], [`notes.html?subject=${n.subject}`, A.subjectTitle(n.subject)], [null, n.title]])}
      <header class="page-head"><h1>${esc(n.title)}</h1>${n.flag ? `<div class="tags" style="margin-top:8px"><span class="tag">${esc(A.FLAG_HI(n.flag))}</span></div>` : ''}</header>
      ${n.parts.length > 1 ? `<div class="tabs" role="tablist">${n.parts.map((p, i) => `<button role="tab" type="button" aria-selected="${i === 0}" data-i="${i}">${esc(p.tab)}</button>`).join('')}</div>` : ''}
      <iframe class="viewer" id="viewer" title="${esc(n.title)}"></iframe>
      <p class="hint" style="margin-top:8px"><a id="openNew" target="_blank" rel="noopener">नए टैब में खोलें</a></p>`;
    const show = i => { const p = n.parts[i], src = p.pdf || p.html; document.getElementById('viewer').src = src; document.getElementById('openNew').href = src; main.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.i == i)); };
    main.querySelectorAll('.tabs button').forEach(b => b.onclick = () => show(+b.dataset.i));
    show(0);
  };

  /* ================= SEARCH (titles now; question text in Phase 6) ================= */
  Pages.search = main => {
    const q = (A.qs.get('q') || '').trim(), ql = q.toLowerCase();
    const hit = s => s && s.toLowerCase().includes(ql);
    const hl = s => esc(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`);
    if (!q) { main.innerHTML = `<header class="page-head"><h1>खोज</h1><p>ऊपर खोज-बॉक्स में टेस्ट, अध्याय, विषय या नोट्स का नाम लिखें.</p></header>`; return; }
    const ser = C.series.filter(s => hit(s.title) || hit(A.SHORT[s.id]));
    const tst = C.series.flatMap(s => s.tests.filter(t => hit(t.title)).map(t => [s, t])).slice(0, 80);
    const nts = C.notes.filter(n => hit(n.title));
    const sub = A.SUBJECT_ORDER.filter(s => hit(A.subjectTitle(s)));
    const total = ser.length + tst.length + nts.length + sub.length;
    main.innerHTML = `<header class="page-head"><h1>“${esc(q)}” के परिणाम</h1><p>${total ? total + ' मिले.' : 'कुछ नहीं मिला. छोटा शब्द आज़माएँ, जैसे "मौर्य" या "बजट".'} प्रश्नों के भीतर खोज अगले चरण में जुड़ेगी.</p></header>
      ${sub.length ? `<section class="sheet"><h2>विषय</h2><ul class="list">${sub.map(s => `<li><a href="subjects.html?id=${s}"><span class="t">${hl(A.subjectTitle(s))}</span></a></li>`).join('')}</ul></section>` : ''}
      ${ser.length ? `<section class="sheet"><h2>टेस्ट सीरीज़</h2><ul class="list">${ser.map(s => `<li><a href="test-series.html?id=${s.id}"><span class="t">${hl(s.title)}</span><span class="m">${fmt(s.question_count)} प्रश्न</span></a></li>`).join('')}</ul></section>` : ''}
      ${tst.length ? `<section class="sheet"><h2>टेस्ट और अध्याय</h2><ul class="list">${tst.map(([s, t]) => `<li><a href="test.html?t=${t.id}"><span class="t">${hl(t.title)}</span><span class="m">${esc(A.SHORT[s.id])}, ${t.count} प्रश्न</span></a></li>`).join('')}</ul></section>` : ''}
      ${nts.length ? `<section class="sheet"><h2>नोट्स</h2><ul class="list">${nts.map(n => `<li><a href="notes.html?id=${n.id}"><span class="t">${hl(n.title)}</span></a></li>`).join('')}</ul></section>` : ''}`;
  };

  /* ================= placeholders filled in Phases 5–6 ================= */
  const later = (title, intro, what) => main => {
    main.innerHTML = `<header class="page-head"><h1>${title}</h1><p>${intro}</p></header><div class="empty"><b>${what}</b>यह हिस्सा अगले चरण में जुड़ेगा. तब तक <a href="test-series.html">टेस्ट सीरीज़</a> देखें.</div>`;
  };
  Pages.practice = later('अभ्यास', 'बिना समय के, हर उत्तर तुरंत जाँचें. विषय और अध्याय से छाँटकर, या केवल गलत हुए प्रश्नों का अभ्यास करें.', 'अभ्यास मोड जल्द');
  Pages.bookmarks = later('बुकमार्क', 'टेस्ट या अभ्यास के दौरान जिन प्रश्नों पर बुकमार्क लगाएँगे, वे यहाँ मिलेंगे.', `अभी ${Object.keys(Store.bookmarks()).length} बुकमार्क हैं`);
  Pages.results = main => {
    const R = Store.results(), ids = Object.keys(R).filter(id => A.tests[id]);
    if (!ids.length) { later('परिणाम', 'हर दिए गए टेस्ट का स्कोर, सही-गलत और समय यहाँ जमा होगा.', 'अभी कोई टेस्ट नहीं दिया गया')(main); return; }
    const rows = ids.flatMap(id => R[id].map(r => [id, r])).sort((a, b) => b[1].at - a[1].at);
    main.innerHTML = `<header class="page-head"><h1>परिणाम</h1></header><section class="sheet"><div class="tbl-wrap"><table><thead><tr><th>तारीख</th><th>टेस्ट</th><th class="n">अंक</th><th class="n">सही</th><th class="n">गलत</th><th class="n">छोड़े</th></tr></thead><tbody>
      ${rows.map(([id, r]) => `<tr><td>${new Date(r.at).toLocaleDateString('hi-IN')}</td><td><a href="test.html?t=${id}">${esc(A.SHORT[A.tests[id].series])}: ${esc(A.tests[id].title)}</a></td><td class="n">${+r.score.toFixed(2)}/${r.max}</td><td class="n">${r.correct}</td><td class="n">${r.wrong}</td><td class="n">${r.skipped}</td></tr>`).join('')}</tbody></table></div></section>`;
  };

  window.Pages = Pages;
})();
