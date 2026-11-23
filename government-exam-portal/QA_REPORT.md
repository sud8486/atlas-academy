# QA Report (Phase 7)
_2026-11-23 · Google Chrome, pages opened from file:// exactly as on your PC_

## Content (from AUDIT_REPORT.md)
- 13,593 of 13,593 source questions present; 0 duplicate IDs; every answer points to a real option; all 2,760 images present.
- 1 source defect kept and flagged (world_geography-0046).

## Automated test run: 25 / 25 passed
| Area | Check | Result |
|---|---|---|
| Test engine | Palette shows not visited / unanswered / answered / marked / answered + marked | Pass |
| Test engine | Countdown timer runs | Pass |
| Test engine | Confirm-before-submit shows answered / unanswered / marked / time left | Pass |
| Scoring | UPSC test, +2 / −0.66: 6 right, 3 wrong → 10.02 | Pass |
| Scoring | Correct / wrong / skipped counts | Pass |
| Scoring | Question accepting two answers scored right; +1 / −⅓ gives 0.67 | Pass |
| Scoring | Shuffled-option series (आर्थिकी 2026) shuffles and still scores 5/5 | Pass |
| Review | All questions listed with answer + explanation; "wrong only" filter | Pass |
| Review | Past attempt re-opens from Results | Pass |
| Timer | Test auto-submits at 0:00 | Pass |
| Progress | Leaving mid-test offers "जारी रखें"; answers kept | Pass |
| Progress | Home answer-sheet bubble fills after a test | Pass |
| Practice | Instant right/wrong + explanation | Pass |
| Practice | Wrong-answer practice collects previously wrong questions | Pass |
| Practice | Builder: important (asked in >1 exam) questions | Pass |
| Bookmarks | Bookmarked question appears on Bookmarks page | Pass |
| Images | Image-based question loads | Pass |
| Language | Hindi / English toggle (bilingual series) | Pass |
| Search | Keyword found in questions (मौर्य → 147) | Pass |
| Search | Keyword found in notes | Pass |
| Search | Filter by subject + series | Pass |
| Stability | No JavaScript errors during the whole run | Pass |

## Crawl
- 475 pages (every series, test, subject and note) open with 0 errors; 935 internal links, 0 broken.

## Visual review (screenshots)
- Desktop 1366 px, mobile 390 px, light and dark mode: home, series, test, exam screen, palette drawer on mobile, result, practice, notes viewer.
- Hindi renders with Windows fonts (Kokila headings, Nirmala UI text).

## Known limits
- Image-only science questions are searchable by exam/year only.
- Notes search text comes from the PDFs; a few Hindi words carry a stray space, so a search may occasionally miss a word in notes. The PDFs themselves are exact.
- Progress is per browser; use the backup button to move it.
- विज्ञान टेस्ट सीरीज (5 MB page) is not yet included.
