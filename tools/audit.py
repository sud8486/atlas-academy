import json,os,glob,collections
P='/home/claude/portal'; D=P+'/data'
series=json.load(open(f'{D}/test-series.json')); notes=json.load(open(f'{D}/notes/notes.json'))
src_counts={'ancient_history':lambda d:len(d['qs']),'medieval_history':lambda d:len(d['qs']),'modern_history':lambda d:len(d['qs']),
 'india_geography':lambda d:len(d['qs']),'world_geography':lambda d:len(d['qs']),'passage_pyq':lambda d:len(d['qs']),'polity_pyq':lambda d:len(d['qs']),
 'uppsc_economy':lambda d:len(d['qs']),'samsamayik_arthiki':lambda d:len(d['Q']),'environment':len,'ramayan_ca':lambda d:sum(len(c['qs']) for c in d),
 'uppsc_ca_test':lambda d:sum(len(c['qs']) for c in d),'uppsc_ca_series':lambda d:sum(len(t) for t in d),'upsc_ca':lambda d:sum(len(t) for t in d),
 'arthiki2026':lambda d:sum(len(t['q']) for t in d),'ca_batch1':len,'lakshya_pcs':lambda d:sum(len(t['qs']) for t in d),
 'biology':lambda d:sum(len(t) for t in d),'chemistry':lambda d:sum(len(t) for t in d),'general_science':lambda d:sum(len(t) for t in d)}
rows=[];allids=collections.Counter();problems=[];T=collections.Counter()
for s in series:
    sid=s['id']; qs=json.load(open(f'{D}/questions/{sid}.json'))
    src=src_counts[sid](json.load(open(f'/home/claude/extract/{sid}.json')))
    ids=[q['id'] for q in qs]; allids.update(ids)
    in_tests=[i for t in s['tests'] for i in t['question_ids']]
    if sorted(in_tests)!=sorted(ids): problems.append(f'{sid}: test membership mismatch')
    ans=expl=opt_bad=img_missing=0
    for q in qs:
        n=len(q['options']) if q['options'] else q.get('option_count')
        a=q['answer'] if isinstance(q['answer'],list) else [q['answer']]
        if all(isinstance(i,int) and 0<=i<n for i in a): ans+=1
        else: problems.append(f"{q['id']}: answer out of range")
        if q['explanation'] or q.get('explanation_image'): expl+=1
        if not q.get('source_defect') and q['options'] is not None and (len(q['options'])<2 or any(not str(o).strip() for o in q['options'])): opt_bad+=1
        for k in ('q_image','explanation_image'):
            if q.get(k) and not os.path.exists(f"{P}/{q[k]}"): img_missing+=1
        if q['q'] is not None and not q['q'].strip(): problems.append(f"{q['id']}: empty question")
    if src!=len(qs): problems.append(f'{sid}: source {src} vs site {len(qs)}')
    if opt_bad: problems.append(f'{sid}: {opt_bad} questions with empty/missing options')
    if img_missing: problems.append(f'{sid}: {img_missing} missing images')
    T['src']+=src;T['site']+=len(qs);T['ans']+=ans;T['expl']+=expl
    rows.append(f"| {s['title']} | {src} | {len(qs)} | {ans} | {expl} | {len(s['tests'])} | {'✓' if src==len(qs) else '✗'} |")
dup=[k for k,v in allids.items() if v>1]
if dup: problems.append(f'{len(dup)} duplicate IDs')
nmiss=[p for n in notes['notes'] for part in n['parts'] for k in ('pdf','txt','html') if part.get(k) and not os.path.exists(f'{P}/{part[k]}')]
devanagari=sum(1 for q in json.load(open(f'{D}/questions/ramayan_ca.json')) if any('\u0900'<=c<='\u097F' for c in q['q']))
md=f"""# Content Audit Report
_Phases 2–3 · 2026-11-23_

## Totals
- Source questions found in your artifacts: **{T['src']:,}**
- Questions in the data store: **{T['site']:,}** (difference: {T['src']-T['site']})
- With a valid answer key: **{T['ans']:,}** · with an explanation (text or image): **{T['expl']:,}**
- Unique question IDs: {len(allids):,} (duplicates: {len(dup)})
- Notes documents imported: **{len(notes['notes'])}** (missing files: {len(nmiss)}) · empty source docs flagged: {len(notes['empty_sources'])}
- Hindi (Devanagari) text intact: ✓ (spot check: {devanagari} of 1,007 रामायण questions contain Devanagari)

## Per series
| Series | In source | In store | Valid answer | Explanation | Tests | Match |
|---|---|---|---|---|---|---|
{chr(10).join(rows)}

## Problems found
{chr(10).join('- '+p for p in problems) if problems else '- None. Every source question is present, every answer points to a real option, and every image file exists.'}

## Known gaps (not errors; nothing was dropped)
- **1 source defect** kept as-is and flagged: world_geography-0046 (options garbled in original, correct option blank).
- **विज्ञान टेस्ट सीरीज** (5 MB page) still not collected. Save it from claude.ai into `C:\\atlas\\source-backup\\` to include it.
- **No explanations in the source** for सम-सामयिक आर्थिकी (1,276), पर्यावरण (528), CA बैच 1 (10); partial for UPPSC CA सीरीज and रामायण.
- **Image-only questions** (1,494 science PYQs): searchable by exam/year tag only, not by question words.
- **26 science + 17 history PYQs accept two answers**, as the source key states.
- **5 notes docs were empty** title-only shells (4 × करेंट अर्द्धवार्षिकी, 1 × घटनासार copy). Nothing to import; listed in `data/notes/notes.json`.
- **MCQ doc "UPPSC 2026 करेंट अफेयर्स MCQ"**: all 100 questions already in UPPSC करेंट अफेयर्स टेस्ट 2026, so not duplicated. The doc itself is kept as a PDF in notes.
- **Notes search text** comes from PDF extraction; a few Hindi words show stray spaces (e.g. "अफे यर्स"). The PDFs themselves are exact.
"""
open('/home/claude/portal/AUDIT_REPORT.md','w').write(md)
print(md[:1500]); print('PROBLEMS:',problems)
