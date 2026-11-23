import json
N='/home/claude/norm'
M=[ # sid, title, slug, url, exam, subject, kind, marking/duration from page
('uppsc_ca_test','UPPSC करेंट अफेयर्स टेस्ट 2026','9278f4f2-73fc-49e8-92e8-836908ec20a9','K63pxT6GcuJkZM3bzdRsGU','UPPSC / State PCS','Current Affairs','Practice (source-based)','not stated'),
('uppsc_ca_series','UPPSC करेंट अफेयर्स टेस्ट सीरीज 2026','ce3f4992-e74d-4897-a21e-2a4026229ea4','SUAK8fadz7qzNb8nZKT1y5','UPPSC / State PCS','Current Affairs','Mock tests (14×100)','1/3 negative mentioned'),
('upsc_ca','UPSC स्तर करेंट अफेयर्स टेस्ट 2026','6e210457-9755-456e-87ca-7b92e8afd81c','Ebkh9AKxVtPtWi5BXvTgEF','UPSC / UPPSC Prelims','Current Affairs','Mock test (1×100)','+2 / −0.66, 200 marks, 120 min'),
('ramayan_ca','रामायण करेंट अफेयर्स टेस्ट सीरीज़','bb324007-606d-4526-908b-ec46cfe14c5a','Q7iYAi2UKkVifKAsF5GRxm','UPPSC / State PCS','Current Affairs','Chapter-wise (29 ch.)','negative marking mentioned'),
('ca_batch1','करेंट अफेयर्स टेस्ट सीरीज़ (बैच 1)','83ec48f6-63bc-4cf1-8579-2363cbae2b32','HHqx4jEX8NLSgTtpmMFPT7','UPPSC / State PCS','Current Affairs','Practice','not stated'),
('arthiki2026','आर्थिकी 2026 टेस्ट सीरीज़','498b42cd-1f37-458c-9910-f470f2208143','A5jFYNgeSwTJ6XhuzPwBwp','UPPSC','Economy (current)','Section tests (14)','1/3 negative (UPPSC style)'),
('samsamayik_arthiki','सम-सामयिक आर्थिकी 2026 – ऑब्जेक्टिव टेस्ट सीरीज़','a9bd68d3-6e3a-405d-bbe5-85b86208eb66','Mxh8M3qmABJaE6hjdPKCxu','UPPSC / State PCS','Economy (current)','Tests (26)','not stated'),
('uppsc_economy','UPPSC अर्थव्यवस्था टेस्ट सीरीज़ (PYQ, Hindi+English)','8a0fd9c5-3279-4c39-b4e7-5df2a85b9b5b','J3p4sVbzT8AABaN45uT3qc','UPPSC (PYQ)','Indian Economy','Chapter-wise (16 ch.)','not stated'),
('ancient_history','UPPSC प्राचीन इतिहास टेस्ट सीरीज़ (PYQ)','da0998df-42b0-44f0-952e-21b410d30137','Tvc1FaWhXmS24QwvS5aAar','UPPSC / State PCS (PYQ)','Ancient History','Chapter-wise (15 ch.)','not stated'),
('medieval_history','UPPSC मध्यकालीन इतिहास टेस्ट सीरीज़ (PYQ)','9949e786-1b92-4319-9c5c-bb8bea0f2815','KvsHUqUYjsWCRjLGSMTMK2','UPPSC / State PCS (PYQ)','Medieval History','Chapter-wise (25 ch.)','1/3 negative mentioned'),
('modern_history','UPPSC आधुनिक इतिहास टेस्ट सीरीज़ (PYQ)','81901637-32ac-45ac-af04-77e43c8f4668','GzwYNQL9mvazQ6Xf1NEDDh','UPPSC / State PCS (PYQ)','Modern History','Chapter-wise (55 ch.)','not stated'),
('india_geography','UPPSC भारत का भूगोल – टेस्ट सीरीज़ (PYQ)','18bf5c43-4ef3-4c32-bad0-cf17ec56e2cf','44F92emruuysw2EA5dNMKc','UPPSC & UP exams (PYQ)','Indian Geography','Chapter-wise (12 ch.)','not stated'),
('world_geography','UPPSC विश्व का भूगोल – टेस्ट सीरीज़ (PYQ)','3241a8bc-651a-4bba-a37c-7e32916b7a4c','7CwbYPJ1isLos8W1hiZJ99','UPPSC & UP exams (PYQ)','World Geography','Chapter-wise (12 ch.)','not stated'),
('polity_pyq','UPPSC राजव्यवस्था — विगत वर्षों के प्रश्न','83b5441e-447f-4134-80e2-6de82a58028b','HGJfzowM2e2JpRzudDZdb8','UPPSC (PYQ)','Indian Polity','Chapter-wise (41 ch.)','1/3 negative mentioned'),
('passage_pyq','अनुच्छेद आधारित प्रश्न — PCS/IAS PYQ','49e90835-ce0a-45ec-a8f4-fe8bc77374a6','A8MQkEK5pRZWipqbJj61KB','PCS / IAS (PYQ)','Indian Polity (Articles)','Part-wise (25 groups)','not stated'),
('environment','UPPSC टेस्ट सीरीज़ – पर्यावरण एवं पारिस्थितिकी (PYQ)','98fd9a90-f127-4030-9bf2-bd2d57ea7ebd','KtjUW39yjn419Qfdwvassi','UPPSC (PYQ)','Environment & Ecology','Tests of 25','not stated'),
('general_science','UPPSC सामान्य विज्ञान टेस्ट सीरीज़ (पेज 9–311)','f5c8c0ff-7a0d-46e8-a9aa-88557926dfe9','XML1u31ku5uAH9mhmE6ZFe','UP exams (PYQ)','General Science (Physics)','Tests of 25 — IMAGE questions','not stated'),
('chemistry','UPPSC रसायन विज्ञान टेस्ट सीरीज़ (पेज 312–431)','414abf16-5eb5-4ce2-af62-217c24feaa9b','94dMiD8Qp9hSsDYDX1y9sg','UP exams (PYQ)','Chemistry','Tests of 25 — IMAGE questions','not stated'),
('biology','UPPSC जीव विज्ञान टेस्ट सीरीज़','51cdb774-4f59-4c8f-9a6f-fe9a096ed245','B6tJ4fGeoQRLSRsexUGEWx','UP exams (PYQ)','Biology','Tests of 25 — IMAGE questions','not stated'),
('lakshya_pcs','लक्ष्य PCS टेस्ट सीरीज़ (Hindi + English)','4c6ac076-c290-4c7d-b070-572158ecca24','ASJhkb2EnCn1mtPz1fwWm9','UPPSC / State PCS','UP GK + mixed','Mock (2×10)','10 min per mock'),
]
rows=[];inv=[];T=dict(q=0,a=0,e=0)
for sid,title,slug,url,exam,subj,kind,mark in M:
    v=json.load(open(f'{N}/{sid}.json'))
    nq=len(v); na=sum(x['answer'] is not None for x in v); ne=sum(bool(x['explanation'] or x.get('explanation_image')) for x in v)
    qs=[x['q'] for x in v if x['q']]; dup=len(qs)-len(set(qs)); multi=sum(isinstance(x['answer'],list) for x in v)
    odd=sum(1 for x in v if x['options'] and len(x['options'])!=4)
    tests=len(set(x.get('test_no') or x['topic'] for x in v))
    img='images' in kind.lower() or 'IMAGE' in kind
    status='Extracted — question/explanation IMAGES still to download' if 'IMAGE' in kind else 'Extracted (text, verbatim)'
    T['q']+=nq;T['a']+=na;T['e']+=ne
    notes=[]
    if dup: notes.append(f'{dup} repeated question texts (kept)')
    if multi: notes.append(f'{multi} with 2 accepted answers')
    if odd: notes.append(f'{odd} with ≠4 options')
    if ne<nq: notes.append(f'{nq-ne} without explanation')
    rows.append(f'| {title} | {exam} | {subj} | {kind} | {nq} | {na}/{nq} | {ne}/{nq} | {mark} | [artifact](https://claude.ai/artifact/{url}) | {status} | {"; ".join(notes) or "—"} |')
    inv.append(dict(series_id=sid,title=title,artifact_slug=slug,artifact_url=f'https://claude.ai/artifact/{url}',exam=exam,subject=subj,structure=kind,questions=nq,with_answer=na,with_explanation=ne,repeated_texts=dup,multi_answer=multi,marking_on_page=mark,status=status))
json.dump(inv,open('/mnt/user-data/outputs/atlas/inventory.json','w'),ensure_ascii=False,indent=1)
notes='''
| # | Notes doc | Subject | Duplicate? | Link |
|---|---|---|---|---|
'''
ND=[('प्राचीन भारत का इतिहास – संपूर्ण नोट्स','Ancient History','','5EqA8ufHGeU7hbadbxLqbS'),
('मध्यकालीन भारत का इतिहास – पेज-वार नोट्स','Medieval History','','7CfxVNDnuYgTuWuQMhhGfY'),
('मध्यकालीन भारत – शॉर्ट नोट्स (UPPCS)','Medieval History','different version of above','Xxuj6oZn7RPm19KEpeQrHg'),
('आधुनिक भारत का इतिहास – पेज-वार नोट्स','Modern History','','WCwPFmj3zhbg6PLgZM87fY'),
('भारत का भूगोल – संक्षिप्त नोट्स (UPPCS 2026)','Indian Geography','','7HfNLdDEUidycHmnvu1ZVt'),
('भारत का भूगोल — UPPSC 2026 कॉन्सेप्ट नोट्स','Indian Geography','different version','Y255zUWUJKM8wF8PJLH2cm'),
('विश्व का भूगोल – पेज-वार नोट्स','World Geography','','P3KRcvR849yxNad5vcvcsV'),
('भारतीय राजव्यवस्था – शॉर्ट नोट्स','Polity','','YVnvAtMuWYcGAnRYtPyTr7'),
('अर्थशास्त्र – पेज-वार नोट्स (UPPCS)','Economy','','STzDQ597X9ktUZg9HDgWf1'),
('आर्थिकी 2026 – शॉर्ट नोट्स','Economy (current)','','RMRihMcE77sMfhgq2jY4Tm'),
('आर्थिकी 2026 – UPPSC नोट्स','Economy (current)','different version','DB8hnYVbcEry3SnEC3m2gW'),
('भौतिकी एवं रसायन विज्ञान — संक्षिप्त नोट्स','Physics & Chemistry','','MXWFRV481SGXvxUCqKxgwN'),
('जीव विज्ञान – पेज-वार शॉर्ट नोट्स (UPPCS)','Biology','','V2wUEqDQQkamvQctirB8GL'),
('सामान्य विज्ञान भाग-7 — UPPSC 2026 क्रमबद्ध नोट्स','General Science','DUPLICATE pair (A)','5FTBcZCpCBtaZdf36LSuML'),
('सामान्य विज्ञान (भाग 7) — UPPSC 2026 क्रमबद्ध नोट्स','General Science','DUPLICATE pair (A)','Ju4ZubodRGcuYSNio3q7MV'),
('पर्यावरण एवं पारिस्थितिकी — शॉर्ट नोट्स (UPPCS)','Environment','','CKJuo2fyZWcGfhc67dx2yp'),
('पर्यावरण एवं सतत विकास – UPPSC 2026 नोट्स','Environment','','8RnnbwuZcLY3y1zT4zEJKa'),
('पर्यावरण हस्तलिखित नोट्स (web page)','Environment','web page, not a doc','42YQ3DeBjsX2wZooRVADYF'),
('भारत में रामसर स्थल – हिंदी नोट्स','Environment','','WuDfubYMKYBSananEJikkq'),
('उत्तर प्रदेश स्पेशल – शॉर्ट नोट्स 2026 (UPPCS)','UP Special','','Ed7x8MFDPJXTMofiTBZwJp'),
('Quantitative Aptitude Formula Sheet (UPPSC / UPSSSC)','Quant','','GaGbMLQLS5wyfecFwT7E8G'),
('करंट अफेयर्स जुलाई 2026 – शॉर्ट नोट्स','Current Affairs','','Shnh2by1WS8tYnXm5cYJvD'),
('करेंट अफेयर्स शॉर्ट नोट्स – अगस्त 2026','Current Affairs','','TJ5r3ppt3w6oYox2TXxRMm'),
('करेंट अफेयर्स शॉर्ट नोट्स – सितंबर 2026','Current Affairs','','H3Lg5cuVi7Huwphwe62gzU'),
('शॉर्ट नोट्स — अक्टूबर 2026 समसामयिकी','Current Affairs','','4xhW1XYwxAACF7V439Tn3d'),
('समसामयिकी नोट्स — अक्टूबर 2026 (सेक्शन-वार)','Current Affairs','different version','TbiCHVKDBqw8hCz6cvwByn'),
('करेंट अर्द्धवार्षिकी 2026 – शॉर्ट नोट्स','Current Affairs','DUPLICATE set (B), copy 1','NNvirym8JicM6XY7bYhdkN'),
('करेंट अर्धवार्षिकी 2026 – शॉर्ट नोट्स','Current Affairs','DUPLICATE set (B), copy 2','5vDYNP6bjcesm2AksJznUk'),
('करेंट अर्द्धवार्षिकी 2026 – शॉर्ट नोट्स','Current Affairs','DUPLICATE set (B), copy 3','BhhHecD3ufLX6Y3bfc9BqS'),
('करेंट अर्द्धवार्षिकी 2026 – शॉर्ट नोट्स','Current Affairs','DUPLICATE set (B), copy 4','PaLhGvuwkyeoHkfEX5Nhrc'),
('रामायण करेंट अफेयर्स 2026 — शॉर्ट नोट्स','Current Affairs','','P5FezipqkcL2CTBdw6ERSB'),
('UPPSC 2026 करेंट अफेयर्स नोट्स (दृष्टि)','Current Affairs','','BpfJmHD5M2orSKdYETqdEB'),
('UPPSC 2026 करेंट अफेयर्स नोट्स (घटनासार 2026)','Current Affairs','DUPLICATE pair (C)','GLCL7H4x316pdrvEzpLeuP'),
('UPPSC 2026 करेंट अफेयर्स नोट्स (घटनासार 2026)','Current Affairs','DUPLICATE pair (C)','KvbUXyachujQcRLVCRDQqK'),
('दृष्टि 2026(2) बनाम घटनासार 2026 — केवल एक पत्रिका में छपी खबरें','Current Affairs','','QGwq3PMNaYVAkxU4DSPbgW'),
('सूचकांक 2026 – भारत की रैंक','Indices / Rankings','DUPLICATE pair (D)?','5Nm8FBZLh4YKP69Gn7PvFg'),
('सूचकांक 2026 — भारत की रैंकिंग (संयुक्त सूची)','Indices / Rankings','DUPLICATE pair (D)? "combined list"','XWXus8Yp63sPNdKasQyfGp'),
('UPPSC 2026 करेंट अफेयर्स MCQ (प्रश्नोत्तर) — MCQs inside a doc','Current Affairs','question count not yet taken','Xaf8g7G1NvcPdY3GKJagfR'),
]
for i,(t,s,d,u) in enumerate(ND,1): notes+=f'| {i} | {t} | {s} | {d or "—"} | [open](https://claude.ai/artifact/{u}) |\n'
md=f'''# Content Inventory — My Government Exam Preparation Portal
_Phase 1 · generated 2026-11-23 · source: your saved Claude artifacts_

## Summary
- Test series found: **21** · extracted: **20** · pending: **1** (विज्ञान टेस्ट सीरीज — 5 MB page, too large for automatic download)
- Questions extracted: **{T["q"]:,}** · with answers: **{T["a"]:,}** · with explanations: **{T["e"]:,}**
- Notes/revision documents found: **{len(ND)}** (contents not yet imported)
- Exam focus: almost entirely **UPPSC / UP State PCS**, plus a UPSC-level CA test and PCS/IAS PYQs
- Language: Hindi (Devanagari); two series also carry English (UPPSC अर्थव्यवस्था, लक्ष्य PCS)

## Test series
| Test series | Exam | Subject | Structure | Qs | Answers | Explanations | Marking on page | Source | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
{chr(10).join(rows)}
| विज्ञान टेस्ट सीरीज | ? | Science | ? | ? | ? | ? | ? | [artifact](https://claude.ai/artifact/A28hS9kQxPzM7ERvoF9gsw) | **PENDING — not collected** | 5 MB single page |

### Data-quality notes (nothing removed)
- **Repeated question texts** are kept: in PYQ books the same question appears in several exam years, sometimes with different options. They are flagged only.
- **17 history PYQs accept two answers** (the source explanation says both a and b are correct). The scorer will accept either.
- **Image-based series** (सामान्य विज्ञान, रसायन, जीव विज्ञान: 1,494 Qs): question and explanation are scanned images; the answer key is in text. The images still need to be downloaded from the artifacts (about 60 files).
- **No explanations**: सम-सामयिक आर्थिकी (1,276), पर्यावरण (528), करेंट अफेयर्स बैच 1 (10); partial in UPPSC CA सीरीज (277 of 1,400) and रामायण (855 of 1,007).
- **आर्थिकी 2026**: the source stores the correct option first; the old page shuffled options on screen. The new site will shuffle the same way.
- **Marking**: only the UPSC-level CA test states a full scheme (+2 / −0.66, 120 min). Others will use a configurable default (UPPSC style: +1, −⅓ suggested).

## Notes & revision material
{notes}
## Not included (not exam material)
Tax/26AS letters, outstanding-demand reply, medical reimbursement letter, अभियोजन सेवा नियमावली drafts (2), Play Store plan, लक्ष्य PCS logo, posters, biodata, Instagram designs, anniversary page.

## Not reachable from here
- Content that only exists as chat text (never saved as an artifact). Fix: export your data from claude.ai's Settings (Privacy section) and put `conversations.json` into C:\\atlas.
'''
open('/mnt/user-data/outputs/atlas/CONTENT_INVENTORY.md','w').write(md)
print(T)
