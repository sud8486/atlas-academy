# My Government Exam Preparation Portal

Open `index.html` in Google Chrome (double-click, or paste `file:///C:/atlas/government-exam-portal/index.html`).
No internet, server, login or installation is needed.

## What's inside
- 13,593 questions in 20 test series and 403 tests (UPPSC / UP State PCS and UPSC level), every one with its answer key
- 33 revision notes (exact PDFs)
- Timed mock tests, untimed practice, bookmarks, wrong-answer practice, results history, search

## Using it
- **Take a test:** टेस्ट सीरीज़ → a series → "टेस्ट दें". Choose marking and time if you want, then "टेस्ट शुरू करें".
  - One question at a time. Keyboard: 1–4 choose, ← → move, M mark for review.
  - The answer sheet on the right (on phones: "प्रश्न-सूची") shows not visited / unanswered / answered / marked / answered + marked.
  - The test submits itself when time runs out. If you close the page, open the test again and press "जारी रखें".
  - After submitting: score with negative marking, chapter breakdown, and every question with the right answer and explanation.
- **Practice (no timer):** अभ्यास → pick subject, series, chapters, and which questions (all / not yet done / previously wrong / important = asked in more than one exam). Each answer is checked instantly with its explanation.
- **Bookmarks:** "☆ बुकमार्क" on any question; see them under बुकमार्क and practise them together.
- **Results:** every attempt with score and time; "उत्तर देखें" re-opens the full review.
- **Search:** the box at the top searches test names, all question text, options, explanations and the notes.
- **Light / dark:** button at the bottom of the left menu.

## Your progress
Stored only in this Chrome browser (localStorage). To move it to another computer or browser, or keep a safe copy:
परिणाम → बैकअप → "प्रगति फ़ाइल में सहेजें", and "फ़ाइल से वापस लाएँ" on the other side.
Clearing Chrome's "Cookies and other site data" erases progress, so take a backup first.

## Folders
- `*.html` — pages
- `assets/css/style.css` — design; `assets/js/` — code (`app.js` shell, `storage.js` progress, `pages.js` listing pages, `mock-test.js` test/practice engine, `practice.js` test/practice/bookmarks/results pages, `search.js`)
- `assets/qimg/` — book-page images for the 3 image-based science series
- `data/` — master content: `exams.json`, `subjects.json`, `test-series.json`, `questions/<series>.json`, `notes/` (PDF + text)
- `data-js/` — the same data as JavaScript so pages work from file:// (browsers block reading JSON files directly)
- `AUDIT_REPORT.md` — content audit; `QA_REPORT.md` — test results

## Adding a new test series later
1. Put the questions in `data/questions/<new_id>.json`, one object per question:
   `{"id":"<new_id>-0001","q":"…","options":["…","…","…","…"],"answer":0,"explanation":"…","topic":"…","source":"…","lang":"hi","exam":"uppsc","subject":"history","series":"<new_id>","test_no":1}`
   (`answer` counts from 0; use `[0,1]` when two answers are accepted.)
2. Add the series to `data/test-series.json` (copy an existing entry: id, title, exam, subject, marking, tests with question_ids) and its id to `subjects.json` / `exams.json`.
3. Run `python tools/build_js.py "C:\atlas\government-exam-portal"` (needs Python), then refresh the page.
Or simply ask Claude to do steps 1–3 for you from a new chat or artifact.
