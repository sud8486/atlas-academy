# PROJECT_STATUS — Government Exam Portal
_Last updated: 2026-11-23 · All 8 phases complete_

## Completed
1. **Discovery** — your saved Claude artifacts are the source (old chat text can't be reached from here).
2. **Collection** — 20 of 21 test series extracted verbatim: 13,593 questions, all with answer keys; 2,760 science images; 33 notes as PDFs.
3. **Data store** — `government-exam-portal/data/` (JSON master) + `data-js/` (offline copies). `AUDIT_REPORT.md`: 0 missing, 0 duplicates.
4. **Layout & navigation** — 10 pages, OMR answer-sheet design, Hindi-first, light/dark, desktop sidebar + mobile menu.
5. **Test engine** — one question at a time, 5-state palette, mark for review, clear response, countdown with auto-submit, confirm before submit, real marking schemes incl. negative marking (configurable per attempt), resume after leaving, result + chapter breakdown + question-wise review with explanations.
6. **Learning features** — practice with instant checking, topic-wise practice builder, wrong-answer practice, important questions (asked in >1 exam), bookmarks, review of past attempts, results history with backup/restore, keyword search across questions and notes with subject/series filters.
7. **QA** — `QA_REPORT.md`: 25/25 automated checks, 475 pages / 935 links clean, screenshots reviewed.
8. **Delivery** — files in `C:\atlas\government-exam-portal`, `README.md` with usage and how to add content.
   - Science images bundled in `data-js/img/` and notes PDFs in `data/notes/pdf/`, so the site needs no extracted zips.
   - Atlas Academy branding: logo (from `C:\atlas\logo`) in sidebar and mobile header, tab icon on every page, page titles "… · Atlas Academy". Files: `assets/img/logo.jpg`, `assets/img/favicon.png`.

## UI redesign (2026-11-23)
- Light theme by default (old "auto" setting, which followed Windows dark mode, is reset once to light). Dark mode is optional via the header switch.
- Header with Atlas Academy logo, search and theme switch; icon sidebar; footer on every page; new dashboard (stat cards, progress ring, accuracy, recent tests, subject cards, test tracker); restyled test engine, results, tables, notes, practice, search.
- Changed files only: `assets/css/style.css`, `assets/js/app.js` (shell), `assets/js/pages.js` (dashboard), `assets/js/storage.js` (default theme). Question data and the test engine (`mock-test.js`, `practice.js`) are byte-for-byte unchanged.
- Verified: 25/25 automated checks, 475 pages / 938 links clean, screenshots at 1440 / 820 / 390 px in light and dark.

## Question format
`id, q, options[], answer (0-based, or [i,j] when two are accepted), explanation, topic, source, lang, exam, subject, series, test_no?, page?`
Optional: `q_en/options_en/explanation_en`, `q_image/explanation_image/option_count`, `answer_text`, `note`, `fixed_order`, `repeat_flag`, `source_defect`.

## Still open (optional)
- **विज्ञान टेस्ट सीरीज** — 5 MB page not collected. Save it from claude.ai into `C:\atlas\source-backup\` and ask Claude to add it.
- **Chat-only content** — claude.ai data export (`conversations.json`) into `C:\atlas` if any questions exist only as chat text.
- Housekeeping: `C:\atlas\_transfer\`, the four `portal-files-0X.zip` and the `portal-files-01..04` folders are no longer used and can be deleted.

## How to continue in a new session
Tell Claude: "Continue my exam portal in C:\atlas — read PROJECT_STATUS.md". Tools used to build everything are in `C:\atlas\tools\`:
`grab.js` + `normalize.py` (extract from artifact pages) → `build_repo.py` (data store) → `audit.py` → `build_js.py` (offline data) → `crawl.py`, `qa.py` (checks).

## Known issues
- 1 source defect kept and flagged: world_geography-0046.
- Image-only questions searchable by exam/year only; notes search text has occasional stray spaces in Hindi.
