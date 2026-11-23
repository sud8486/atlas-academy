# Content Audit Report
_Phases 2–3 · 2026-11-23_

## Totals
- Source questions found in your artifacts: **13,593**
- Questions in the data store: **13,593** (difference: 0)
- With a valid answer key: **13,593** · with an explanation (text or image): **10,419**
- Unique question IDs: 13,593 (duplicates: 0)
- Notes documents imported: **33** (missing files: 0) · empty source docs flagged: 5
- Hindi (Devanagari) text intact: ✓ (spot check: 1007 of 1,007 रामायण questions contain Devanagari)

## Per series
| Series | In source | In store | Valid answer | Explanation | Tests | Match |
|---|---|---|---|---|---|---|
| UPPSC करेंट अफेयर्स टेस्ट 2026 | 1249 | 1249 | 1249 | 1249 | 12 | ✓ |
| UPPSC करेंट अफेयर्स टेस्ट सीरीज 2026 | 1400 | 1400 | 1400 | 277 | 14 | ✓ |
| UPSC स्तर करेंट अफेयर्स टेस्ट 2026 | 100 | 100 | 100 | 100 | 1 | ✓ |
| रामायण करेंट अफेयर्स टेस्ट सीरीज़ | 1007 | 1007 | 1007 | 855 | 29 | ✓ |
| करेंट अफेयर्स टेस्ट सीरीज़ (बैच 1) | 10 | 10 | 10 | 0 | 1 | ✓ |
| आर्थिकी 2026 टेस्ट सीरीज़ | 312 | 312 | 312 | 312 | 14 | ✓ |
| सम-सामयिक आर्थिकी 2026 – ऑब्जेक्टिव टेस्ट सीरीज़ | 1276 | 1276 | 1276 | 0 | 26 | ✓ |
| UPPSC अर्थव्यवस्था टेस्ट सीरीज़ (PYQ, Hindi+English) | 675 | 675 | 675 | 675 | 15 | ✓ |
| UPPSC प्राचीन इतिहास टेस्ट सीरीज़ (PYQ) | 643 | 643 | 643 | 643 | 15 | ✓ |
| UPPSC मध्यकालीन इतिहास टेस्ट सीरीज़ (PYQ) | 479 | 479 | 479 | 479 | 25 | ✓ |
| UPPSC आधुनिक इतिहास टेस्ट सीरीज़ (PYQ) | 1260 | 1260 | 1260 | 1260 | 55 | ✓ |
| UPPSC भारत का भूगोल – टेस्ट सीरीज़ (PYQ) | 911 | 911 | 911 | 911 | 19 | ✓ |
| UPPSC विश्व का भूगोल – टेस्ट सीरीज़ (PYQ) | 674 | 674 | 674 | 674 | 27 | ✓ |
| UPPSC राजव्यवस्था — विगत वर्षों के प्रश्न | 1214 | 1214 | 1214 | 1214 | 41 | ✓ |
| अनुच्छेद आधारित प्रश्न — PCS/IAS PYQ | 341 | 341 | 341 | 341 | 25 | ✓ |
| UPPSC टेस्ट सीरीज़ – पर्यावरण एवं पारिस्थितिकी (PYQ) | 528 | 528 | 528 | 0 | 22 | ✓ |
| UPPSC सामान्य विज्ञान टेस्ट सीरीज़ (पेज 9–311) | 575 | 575 | 575 | 536 | 23 | ✓ |
| UPPSC रसायन विज्ञान टेस्ट सीरीज़ (पेज 312–431) | 218 | 218 | 218 | 206 | 9 | ✓ |
| UPPSC जीव विज्ञान टेस्ट सीरीज़ | 701 | 701 | 701 | 667 | 28 | ✓ |
| लक्ष्य PCS टेस्ट सीरीज़ (Hindi + English) | 20 | 20 | 20 | 20 | 2 | ✓ |

## Problems found
- None. Every source question is present, every answer points to a real option, and every image file exists.

## Known gaps (not errors; nothing was dropped)
- **1 source defect** kept as-is and flagged: world_geography-0046 (options garbled in original, correct option blank).
- **विज्ञान टेस्ट सीरीज** (5 MB page) still not collected. Save it from claude.ai into `C:\atlas\source-backup\` to include it.
- **No explanations in the source** for सम-सामयिक आर्थिकी (1,276), पर्यावरण (528), CA बैच 1 (10); partial for UPPSC CA सीरीज and रामायण.
- **Image-only questions** (1,494 science PYQs): searchable by exam/year tag only, not by question words.
- **26 science + 17 history PYQs accept two answers**, as the source key states.
- **5 notes docs were empty** title-only shells (4 × करेंट अर्द्धवार्षिकी, 1 × घटनासार copy). Nothing to import; listed in `data/notes/notes.json`.
- **MCQ doc "UPPSC 2026 करेंट अफेयर्स MCQ"**: all 100 questions already in UPPSC करेंट अफेयर्स टेस्ट 2026, so not duplicated. The doc itself is kept as a PDF in notes.
- **Notes search text** comes from PDF extraction; a few Hindi words show stray spaces (e.g. "अफे यर्स"). The PDFs themselves are exact.
