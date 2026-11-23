/* Search: titles (instant) + question text across all series + notes full text. Loads data on demand. */
(function () {
  const A = App, { C, esc, fmt } = A;
  const norm = s => String(s || '').toLowerCase().normalize('NFC');
  const rx = q => new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const hl = (s, q) => esc(s).replace(rx(esc(q)), m => `<mark>${m}</mark>`);
  const snip = (s, q, w = 70) => { const i = norm(s).indexOf(norm(q)); if (i < 0) return esc(s.slice(0, w * 2)); const a = Math.max(0, i - w), b = Math.min(s.length, i + q.length + w); return (a ? '…' : '') + hl(s.slice(a, b), q) + (b < s.length ? '…' : ''); };
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s); });

  Pages.search = main => {
    const q = (A.qs.get('q') || '').trim(), subj = A.qs.get('subject') || '', ser = A.qs.get('series') || '';
    if (!q) { main.innerHTML = `<header class="page-head"><h1>खोज</h1><p>ऊपर खोज-बॉक्स में कोई शब्द लिखें, जैसे "मौर्य", "रामसर" या "रेपो दर". टेस्ट, नोट्स और सभी ${fmt(C.totals.questions)} प्रश्नों में खोजा जाएगा.</p></header>`; return; }
    const nq = norm(q), hit = s => norm(s).includes(nq);
    const ser1 = C.series.filter(s => hit(s.title) || hit(A.SHORT[s.id]));
    const tst = C.series.flatMap(s => s.tests.filter(t => hit(t.title)).map(t => [s, t])).slice(0, 40);
    const link = (k, v) => { const p = new URLSearchParams({ q }); if (subj) p.set('subject', subj); if (ser) p.set('series', ser); if (v) p.set(k, v); else p.delete(k); if (k === 'subject') p.delete('series'); return 'search.html?' + p; };
    main.innerHTML = `<header class="page-head"><h1>“${esc(q)}” की खोज</h1></header>
      <ul class="chips" aria-label="विषय से छाँटें"><li><a href="${link('subject', '')}"${!subj ? ' aria-current="true"' : ''}>सभी विषय</a></li>${A.SUBJECT_ORDER.filter(s => C.series.some(x => x.subject === s)).map(s => `<li><a href="${link('subject', s)}"${subj === s ? ' aria-current="true"' : ''}>${A.subjectTitle(s)}</a></li>`).join('')}</ul>
      ${subj ? `<div class="form-row" style="margin-bottom:14px"><label>टेस्ट सीरीज़ / अध्याय<select id="serSel"><option value="">${A.subjectTitle(subj)} की सभी सीरीज़</option>${C.series.filter(s => s.subject === subj).map(s => `<option value="${s.id}"${ser === s.id ? ' selected' : ''}>${esc(s.title)}</option>`).join('')}</select></label></div>` : ''}
      ${!subj && (ser1.length || tst.length) ? `<section class="sheet"><h2>टेस्ट और अध्याय</h2><ul class="list">
        ${ser1.map(s => `<li><a href="test-series.html?id=${s.id}"><span class="t">${hl(s.title, q)}</span><span class="m">सीरीज़, ${fmt(s.question_count)} प्रश्न</span></a></li>`).join('')}
        ${tst.map(([s, t]) => `<li><a href="test.html?t=${t.id}"><span class="t">${hl(t.title, q)}</span><span class="m">${esc(A.SHORT[s.id])}, ${t.count} प्रश्न</span></a></li>`).join('')}</ul></section>` : ''}
      <section class="sheet" id="qres"><div class="sheet-head"><h2>प्रश्नों में</h2><span class="hint" id="qcount">खोज रहे हैं…</span></div><div id="qlist"></div></section>
      ${!ser ? '<section class="sheet" id="nres"><div class="sheet-head"><h2>नोट्स में</h2><span class="hint" id="ncount">खोज रहे हैं…</span></div><ul class="list" id="nlist"></ul></section>' : ''}`;
    const ss = main.querySelector('#serSel'); if (ss) ss.onchange = () => location.href = link('series', ss.value);

    const targets = C.series.filter(s => (!subj || s.subject === subj) && (!ser || s.id === ser));
    Promise.all(targets.map(s => A.loadSeries(s.id))).then(lists => {
      const LIMIT = 150, out = []; let total = 0;
      lists.forEach((list, i) => list.forEach(x => {
        const fields = [x.q, x.q_en, ...(x.options || []), x.explanation, x.topic, x.source, x.note];
        if (fields.some(f => f && norm(f).includes(nq))) { total++; if (out.length < LIMIT) out.push(x); }
      }));
      main.querySelector('#qcount').textContent = total ? (total > LIMIT ? `${fmt(total)} मिले, पहले ${LIMIT} दिख रहे हैं` : `${fmt(total)} मिले`) : 'कुछ नहीं मिला';
      main.querySelector('#qlist').innerHTML = out.length ? `<ol class="review">${out.map(x => {
        const inQ = x.q && norm(x.q).includes(nq), where = inQ ? '' : x.options && x.options.some(o => norm(o).includes(nq)) ? 'विकल्प में' : x.explanation && norm(x.explanation).includes(nq) ? 'व्याख्या में' : 'स्रोत/अध्याय में';
        return `<li class="ritem"><div class="q-head"><div class="tags"><span class="tag">${esc(A.SHORT[x.series])}</span>${x.topic ? `<span class="tag">${esc(x.topic)}</span>` : ''}${where ? `<span class="tag warn">${where} मिला</span>` : ''}</div>
          <a class="btn sm" href="practice.html?q=${encodeURIComponent(x.id)}">अभ्यास करें</a></div>
          <div class="qtext">${x.q ? (inQ ? hl(x.q, q) : esc(x.q)) : `<span class="hint">चित्र वाला प्रश्न (${esc(x.source || '')})</span>`}</div>
          ${!inQ && where === 'व्याख्या में' ? `<p class="hint">${snip(x.explanation, q)}</p>` : ''}${!inQ && where === 'विकल्प में' ? `<p class="hint">${x.options.filter(o => norm(o).includes(nq)).map(o => hl(o, q)).join(' · ')}</p>` : ''}</li>`;
      }).join('')}</ol>` : `<p class="muted">प्रश्नों में "${esc(q)}" नहीं मिला. छोटा या दूसरा शब्द आज़माएँ.</p>`;
    }).catch(e => { main.querySelector('#qcount').textContent = 'प्रश्न फ़ाइलें नहीं खुलीं: ' + e.message; });

    if (!ser) (window.NOTES_TEXT ? Promise.resolve() : loadScript('data-js/notes-text.js')).then(() => {
      const notes = C.notes.filter(n => !subj || n.subject === subj).map(n => { const t = window.NOTES_TEXT[n.id] || ''; const c = (norm(t).match(rx(nq)) || []).length + (hit(n.title) ? 1 : 0); return [n, c, t]; }).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
      main.querySelector('#ncount').textContent = notes.length ? `${notes.length} नोट्स में` : 'कुछ नहीं मिला';
      main.querySelector('#nlist').innerHTML = notes.map(([n, c, t]) => `<li><a href="notes.html?id=${n.id}"><span class="t">${hl(n.title, q)}<span class="hint" style="display:block;font-weight:400">${snip(t.replace(/\s+/g, ' '), q)}</span></span><span class="m">${c} बार</span></a></li>`).join('');
    }).catch(() => { main.querySelector('#ncount').textContent = 'नोट्स का टेक्स्ट नहीं खुला'; });
  };
})();
