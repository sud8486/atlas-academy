import json,os,shutil,glob,re
N='/home/claude/norm'; P='/home/claude/portal'; D=P+'/data'
for d in ['questions','notes/pdf','notes/txt','notes/html']: os.makedirs(f'{D}/{d}',exist_ok=True)
inv={x['series_id']:x for x in json.load(open('/mnt/user-data/outputs/atlas/inventory.json'))}
DEF={'correct':1,'wrong':-1/3,'min_per_q':1,'source':'default (not stated in source) — configurable'}
MARK={
 'upsc_ca':{'correct':2,'wrong':-0.66,'min_per_q':1.2,'source':'stated on original page: +2 / −0.66, 120 min per 100 Q'},
 'arthiki2026':{'correct':1,'wrong':-1/3,'min_per_q':1,'source':'stated on original page: −⅓ per wrong answer (UPPSC style)'},
 'ramayan_ca':{'correct':1,'wrong':-1/3,'min_per_q':1,'source':'original page: optional −⅓ negative marking'},
 'lakshya_pcs':{'correct':2,'wrong':-2/3,'min_per_q':1,'source':'stated on original page: +2 / −⅓ of marks, 10 min per mock'},
}
SUBJ={'Current Affairs':('current-affairs','समसामयिकी'),'Economy (current)':('economy','अर्थव्यवस्था'),'Indian Economy':('economy','अर्थव्यवस्था'),
 'Ancient History':('history','इतिहास'),'Medieval History':('history','इतिहास'),'Modern History':('history','इतिहास'),
 'Indian Geography':('geography','भूगोल'),'World Geography':('geography','भूगोल'),'Indian Polity':('polity','राजव्यवस्था'),
 'Indian Polity (Articles)':('polity','राजव्यवस्था'),'Environment & Ecology':('environment','पर्यावरण'),
 'General Science (Physics)':('science','सामान्य विज्ञान'),'Chemistry':('science','सामान्य विज्ञान'),'Biology':('science','सामान्य विज्ञान'),
 'UP GK + mixed':('up-gk','उत्तर प्रदेश / मिश्रित')}
EXAM={'upsc_ca':'upsc','passage_pyq':'upsc'}  # everything else uppsc
series=[];total=0;subjects={}
for sid,m in inv.items():
    qs=json.load(open(f'{N}/{sid}.json'))
    subj_id,subj_hi=SUBJ[m['subject']]; exam=EXAM.get(sid,'uppsc'); mk=MARK.get(sid,DEF)
    for q in qs:
        q.update(exam=exam,subject=subj_id,series=sid)
        if q['id']=='world_geography-0046': q['source_defect']='Options garbled in the original source (correct option b is blank). Kept as-is; please check against the book (UP UDA/LDA Pre 2006, page 540).'
    json.dump(qs,open(f'{D}/questions/{sid}.json','w'),ensure_ascii=False)
    # tests: by test_no when present, else by topic (chapter), keeping source order
    groups=[]; key=lambda q: q.get('test_no') or q['topic'] or '—'
    for q in qs:
        k=key(q)
        if not groups or groups[-1]['key']!=k:
            if any(g['key']==k for g in groups): g=[g for g in groups if g['key']==k][0]; g['ids'].append(q['id']); continue
            groups.append({'key':k,'ids':[]})
        groups[-1]['ids'].append(q['id'])
    tests=[]
    for i,g in enumerate(groups,1):
        first=next(q for q in qs if q['id']==g['ids'][0])
        title=(f"टेस्ट {g['key']:02d}" if isinstance(g['key'],int) else str(g['key']))
        if isinstance(g['key'],int) and first['topic'] and sid not in ('uppsc_ca_series','upsc_ca','environment','biology','chemistry','general_science','samsamayik_arthiki'): title+=f" · {first['topic']}"
        n=len(g['ids'])
        tests.append({'id':f'{sid}-t{i:03d}','title':title,'question_ids':g['ids'],'count':n,'max_marks':round(n*mk['correct'],2),'duration_min':(10 if sid=='lakshya_pcs' else round(n*mk['min_per_q']))})
    series.append({'id':sid,'title':m['title'],'exam':exam,'subject':subj_id,'subject_title':m['subject'],'structure':m['structure'],
      'question_count':len(qs),'with_explanation':m['with_explanation'],'image_based':sid in ('biology','chemistry','general_science'),
      'marking':mk,'source_url':m['artifact_url'],'tests':tests})
    subjects.setdefault(subj_id,{'id':subj_id,'title_hi':subj_hi,'series':[],'notes':[]})['series'].append(sid)
    total+=len(qs)
# notes
NOTES=[ # slug8, id, title, subject, flag
('2252e6da','ancient-history-full','प्राचीन भारत का इतिहास – संपूर्ण नोट्स','history',''),
('32380577','medieval-history-pagewise','मध्यकालीन भारत का इतिहास – पेज-वार नोट्स','history',''),
('fac08f84','medieval-short','मध्यकालीन भारत – शॉर्ट नोट्स (UPPCS)','history',''),
('ec83b7be','modern-history-pagewise','आधुनिक भारत का इतिहास – पेज-वार नोट्स','history',''),
('32ea6099','india-geo-short','भारत का भूगोल – संक्षिप्त नोट्स (UPPCS 2026)','geography',''),
('fb318f72','india-geo-concept','भारत का भूगोल — UPPSC 2026 कॉन्सेप्ट नोट्स','geography',''),
('b27be47d','world-geo-pagewise','विश्व का भूगोल – पेज-वार नोट्स','geography',''),
('ff106bd4','polity-short','भारतीय राजव्यवस्था – शॉर्ट नोट्स','polity',''),
('ce391051','economics-pagewise','अर्थशास्त्र – पेज-वार नोट्स (UPPCS)','economy',''),
('c5356fd2','arthiki-2026-short','आर्थिकी 2026 – शॉर्ट नोट्स','economy',''),
('6297d950','arthiki-2026-notes','आर्थिकी 2026 – UPPSC नोट्स','economy',''),
('a6391c86','phy-chem-short','भौतिकी एवं रसायन विज्ञान — संक्षिप्त नोट्स','science',''),
('e30531c0','biology-short','जीव विज्ञान – पेज-वार शॉर्ट नोट्स (UPPCS)','science',''),
('22691a6f','gs-part7-a','सामान्य विज्ञान भाग-7 — UPPSC 2026 क्रमबद्ध नोट्स','science','duplicate pair A (copy 1)'),
('90f03b52','gs-part7-b','सामान्य विज्ञान (भाग 7) — UPPSC 2026 क्रमबद्ध नोट्स','science','duplicate pair A (copy 2)'),
('5ba2f360','env-short','पर्यावरण एवं पारिस्थितिकी — शॉर्ट नोट्स (UPPCS)','environment',''),
('3c2609b2','env-sustainable','पर्यावरण एवं सतत विकास – UPPSC 2026 नोट्स','environment',''),
('f223817e','ramsar-sites','भारत में रामसर स्थल – हिंदी नोट्स','environment',''),
('6e51dc96','up-special','उत्तर प्रदेश स्पेशल – शॉर्ट नोट्स 2026 (UPPCS)','up-gk',''),
('7e1e3bbe','quant-formulas','Quantitative Aptitude Formula Sheet (UPPSC / UPSSSC)','quant',''),
('d0265ff5','ca-2026-07','करंट अफेयर्स जुलाई 2026 – शॉर्ट नोट्स','current-affairs',''),
('d4f03c49','ca-2026-08','करेंट अफेयर्स शॉर्ट नोट्स – अगस्त 2026','current-affairs',''),
('81e5d49b','ca-2026-09','करेंट अफेयर्स शॉर्ट नोट्स – सितंबर 2026','current-affairs',''),
('2012484d','ca-2026-10-short','शॉर्ट नोट्स — अक्टूबर 2026 समसामयिकी','current-affairs',''),
('d76647c7','ca-2026-10-sections','समसामयिकी नोट्स — अक्टूबर 2026 (सेक्शन-वार)','current-affairs',''),
('b2c10e9f','ramayan-ca-notes','रामायण करेंट अफेयर्स 2026 — शॉर्ट नोट्स','current-affairs','2 tabs'),
('57a2f36b','drishti-ca-notes','UPPSC 2026 करेंट अफेयर्स नोट्स (दृष्टि)','current-affairs',''),
('99402957','ghatnasar-ca-notes','UPPSC 2026 करेंट अफेयर्स नोट्स (घटनासार 2026)','current-affairs','other copy (7c27318c) is an empty 1-page shell'),
('bc7c2286','drishti-vs-ghatnasar','दृष्टि 2026(2) बनाम घटनासार 2026 — केवल एक पत्रिका में छपी खबरें','current-affairs',''),
('236e5de3','indices-2026','सूचकांक 2026 – भारत की रैंक','current-affairs','related: combined list'),
('f711c76b','indices-2026-combined','सूचकांक 2026 — भारत की रैंकिंग (संयुक्त सूची)','current-affairs','related: indices list'),
('f7a5343e','ca-mcq-doc','UPPSC 2026 करेंट अफेयर्स MCQ (प्रश्नोत्तर)','current-affairs','all 100 MCQs already in uppsc_ca_test'),
]
notes=[]
for slug,nid,title,subj,flag in NOTES:
    files=sorted(glob.glob(f'/home/claude/notes/{slug}__*.pdf'))
    parts=[]
    for k,f in enumerate(files):
        tab=os.path.basename(f)[10:-4]; suffix='' if len(files)==1 else f'-tab{k+1}'
        shutil.copy(f,f'{D}/notes/pdf/{nid}{suffix}.pdf')
        shutil.copy(f.replace('/notes/','/notes/txt/').replace('.pdf','.txt'),f'{D}/notes/txt/{nid}{suffix}.txt')
        parts.append({'tab':tab,'pdf':f'data/notes/pdf/{nid}{suffix}.pdf','txt':f'data/notes/txt/{nid}{suffix}.txt'})
    assert parts, slug
    notes.append({'id':nid,'title':title,'subject':subj,'parts':parts,'flag':flag,'source_slug_prefix':slug})
    subjects.setdefault(subj,{'id':subj,'title_hi':{'quant':'गणित','up-gk':'उत्तर प्रदेश / मिश्रित'}.get(subj,subj),'series':[],'notes':[]})['notes'].append(nid)
shutil.copy('/home/claude/notes/ec83b7be__आधुनिक भारत का इतिहास – पेज-वार नोट्स.md',f'{D}/notes/txt/modern-history-pagewise.md')
shutil.copy('/tmp/claude-tool-results/2364c67a-6e3f-5e1b-ab74-8b425f00f231/mcp-claude-artifacts-blob-1795449151568-38u6tp-c4a26bb6.html',f'{D}/notes/html/env-handwritten.html')
notes.append({'id':'env-handwritten','title':'पर्यावरण हस्तलिखित नोट्स','subject':'environment','parts':[{'tab':'web page','html':'data/notes/html/env-handwritten.html'}],'flag':'original was a web page','source_slug_prefix':'1882824b'})
subjects['environment']['notes'].append('env-handwritten')
EMPTY=[('7c27318c','UPPSC 2026 करेंट अफेयर्स नोट्स (घटनासार 2026)'),('ad1fa363','करेंट अर्द्धवार्षिकी 2026 – शॉर्ट नोट्स'),('27d2b3f8','करेंट अर्धवार्षिकी 2026 – शॉर्ट नोट्स'),('56a9f715','करेंट अर्द्धवार्षिकी 2026 – शॉर्ट नोट्स'),('b6d0bb66','करेंट अर्द्धवार्षिकी 2026 – शॉर्ट नोट्स')]
exams=[{'id':'uppsc','title_hi':'UPPSC / उत्तर प्रदेश राज्य PCS','title_en':'UPPSC / UP State PCS','category':'State PCS'},
       {'id':'upsc','title_hi':'UPSC सिविल सेवा (प्रारंभिक स्तर)','title_en':'UPSC CSE (Prelims level)','category':'UPSC'}]
for e in exams: e['series']=[s['id'] for s in series if s['exam']==e['id']]
json.dump(exams,open(f'{D}/exams.json','w'),ensure_ascii=False,indent=1)
json.dump(list(subjects.values()),open(f'{D}/subjects.json','w'),ensure_ascii=False,indent=1)
json.dump(series,open(f'{D}/test-series.json','w'),ensure_ascii=False,indent=1)
json.dump({'notes':notes,'empty_sources':[{'slug_prefix':a,'title':b,'status':'source doc is a 1-page title-only shell; nothing to import'} for a,b in EMPTY]},open(f'{D}/notes/notes.json','w'),ensure_ascii=False,indent=1)
print('questions',total,'series',len(series),'tests',sum(len(s['tests']) for s in series),'notes',len(notes),'subjects',len(subjects))
