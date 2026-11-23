/* All personal data lives in this browser's localStorage under one prefix.
   Keys: prefs, results, progress, bookmarks, attempts, last. Nothing leaves the computer. */
(function () {
  const P = 'gep.v1.';
  const read = (k, d) => { try { const v = localStorage.getItem(P + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  const Store = {
    get: read, set: write,
    prefs() { return read('prefs', { theme: 'light' }); },
    setPref(k, v) { const p = Store.prefs(); p[k] = v; write('prefs', p); },

    /* results: { testId: [ {at, score, max, correct, wrong, skipped, secs} ...newest last ] } */
    results() { return read('results', {}); },
    addResult(testId, r) { const all = Store.results(); (all[testId] = all[testId] || []).push(r); write('results', all); },

    /* progress: { testId: {answers:{qid:i}, marked:[qid], pos, left, started} } — unfinished tests */
    progress() { return read('progress', {}); },
    setProgress(testId, p) { const all = Store.progress(); if (p) all[testId] = p; else delete all[testId]; write('progress', all); },

    /* bookmarks: { qid: timestamp } */
    bookmarks() { return read('bookmarks', {}); },
    toggleBookmark(qid) { const b = Store.bookmarks(); if (b[qid]) delete b[qid]; else b[qid] = Date.now(); write('bookmarks', b); return !!b[qid]; },

    /* attempts: { qid: [lastChoice, timesRight, timesWrong, lastAt, lastWasRight] } — feeds review + wrong-answer practice */
    attempts() { return read('attempts', {}); },
    recordAttempt(qid, choice, right) {
      const a = Store.attempts(); const x = a[qid] || [null, 0, 0, 0];
      x[0] = choice; x[right ? 1 : 2]++; x[3] = Date.now(); x[4] = right ? 1 : 0; a[qid] = x; write('attempts', a);
    },

    last() { return read('last', null); },
    setLast(o) { write('last', Object.assign({ at: Date.now() }, o)); },

    testStatus(testId) {
      if ((Store.results()[testId] || []).length) return 'done';
      if (Store.progress()[testId]) return 'part';
      return 'none';
    },
    exportAll() { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(P)) o[k] = localStorage.getItem(k); } return o; },
    importAll(o) { Object.keys(o).forEach(k => { if (k.startsWith(P)) localStorage.setItem(k, o[k]); }); }
  };
  window.Store = Store;
})();
