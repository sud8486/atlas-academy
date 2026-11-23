import json,os
X='/home/claude/extract'; OUT='/home/claude/norm'; os.makedirs(OUT,exist_ok=True)
L=lambda f: json.load(open(f'{X}/{f}.json'))
def Q(sid,i,q,o,a,e='',topic='',src='',page=None,extra=None,lang='hi'):
    d={'id':f'{sid}-{i:04d}','q':q,'options':o,'answer':a,'explanation':e or '','topic':topic,'source':src,'lang':lang}
    if page is not None: d['page']=page
    if extra: d.update(extra)
    return d
S={}
# history (ancient/medieval/modern)
for sid in ['ancient_history','medieval_history','modern_history']:
    d=L(sid); ch=d['chapters']
    S[sid]=[Q(sid,i+1,x['q'],x['o'],x['a'] if len(x['a'])>1 else x['a'][0],x['e'],ch[x['ch']],'; '.join(x['t']),x.get('page'),{'num_in_source':x.get('n')}) for i,x in enumerate(d['qs'])]
for sid in ['india_geography','world_geography']:
    d=L(sid); ch=d['ch']
    S[sid]=[Q(sid,i+1,x['q'],x['o'],x['a'],x['e'],ch[str(x['c'])],x['s'],x.get('p'),{'repeat_flag':x['r']}) for i,x in enumerate(d['qs'])]
for sid in ['passage_pyq','polity_pyq']:
    d=L(sid); ch=d['chapters']
    S[sid]=[Q(sid,i+1,r[1],r[2],r[3],r[5] if len(r)>5 else '',ch[r[0]],'; '.join(r[4])) for i,r in enumerate(d['qs'])]
d=L('uppsc_economy'); ch=d['chapters']
S['uppsc_economy']=[Q('uppsc_economy',i+1,x['s'],x['o'],x['a'],x['e'],ch[x['ch']][0],'; '.join(x['t']),None,{'q_hi_only':x.get('sh'),'options_hi_only':x.get('oh'),'topic_en':ch[x['ch']][1]},'hi+en') for i,x in enumerate(d['qs'])]
d=L('samsamayik_arthiki'); tmap={}
for k,T in enumerate(d['T']):
    for j in T['i']: tmap[j]=k+1
S['samsamayik_arthiki']=[Q('samsamayik_arthiki',i+1,x['q'],x['o'],x['c'],'',x['s'],'',x['p'],dict({'test_no':tmap.get(i)},**({'note':x['x']} if x.get('x') else {}))) for i,x in enumerate(d['Q'])]
d=L('environment'); PER=25
S['environment']=[Q('environment',i+1,x['q'],x['o'],x['a'],'', '', x.get('t',''),None,{'test_no':i//PER+1}) for i,x in enumerate(d)]
d=L('ramayan_ca'); out=[];n=0
for c in d:
    for x in c['qs']:
        n+=1; out.append(Q('ramayan_ca',n,x['q'],x['o'],x['a'],x.get('e',''),c['t'],'',None,dict({'chapter_no':c['n'],'source_pages':c['p']},**({'fixed_order':True} if x.get('fx') else {}))))
S['ramayan_ca']=out
d=L('uppsc_ca_test'); out=[];n=0
for k,sec in enumerate(d):
    for x in sec['qs']:
        n+=1; out.append(Q('uppsc_ca_test',n,x['q'],x['o'],x['a'],x.get('e',''),sec['title'],'',None,{'test_no':k+1}))
S['uppsc_ca_test']=out
for sid in ['uppsc_ca_series','upsc_ca']:
    d=L(sid); out=[];n=0
    for k,t in enumerate(d):
        for r in t:
            n+=1; out.append(Q(sid,n,r[0],r[1],r[2],r[4],r[5],'',None,{'test_no':k+1,'answer_text':r[3]}))
    S[sid]=out
d=L('arthiki2026'); out=[];n=0
for k,t in enumerate(d):
    for r in t['q']:
        n+=1; out.append(Q('arthiki2026',n,r[0],r[1:5],0,r[5] if len(r)>5 else '',t['title'],'',None,{'test_no':k+1,'note':'source lists correct option first; original page shuffled options on display'}))
S['arthiki2026']=out
d=L('ca_batch1')
S['ca_batch1']=[Q('ca_batch1',i+1,r[0],r[1],r[2]) for i,r in enumerate(d)]
d=L('lakshya_pcs'); out=[];n=0
for k,t in enumerate(d):
    for x in t['qs']:
        n+=1; out.append(Q('lakshya_pcs',n,x['hi'],x['o']['hi'],x['a'],x['x']['hi'],t['title']['hi'],'',None,{'test_no':k+1,'q_en':x['en'],'options_en':x['o']['en'],'explanation_en':x['x']['en']},'hi+en'))
S['lakshya_pcs']=out
for sid in ['biology','chemistry','general_science']:
    d=L(sid); out=[];n=0
    for k,t in enumerate(d):
        for x in t:
            n+=1; img=lambda p: f'assets/qimg/{sid}/t{k+1}/{p}' if p else None
            out.append(Q(sid,n,None,None,(x['acc'] if 'acc' in x else x['ans']),None,'',x['tag'],None,{'test_no':k+1,'q_image':img(x['img']),'explanation_image':img(x['exp']),'option_count':x['n'],'src_id':x['id']}))
    S[sid]=out
for k,v in S.items(): json.dump(v,open(f'{OUT}/{k}.json','w'),ensure_ascii=False,indent=1)
# stats
print(f"{'series':22}{'Qs':>6}{'ans':>6}{'expl':>6}{'opt!=4':>7}{'dupQ':>6}{'emptyQ':>7}")
tot=0
for k,v in S.items():
    ans=sum(1 for x in v if x['answer'] is not None)
    ex=sum(1 for x in v if x['explanation'] or x.get('explanation_image'))
    bad=sum(1 for x in v if x['options'] is not None and len(x['options'])!=4)
    qs=[x['q'] for x in v if x['q']]; dup=len(qs)-len(set(qs))
    empty=sum(1 for x in v if x['q'] is not None and not str(x['q']).strip())
    tot+=len(v); print(f"{k:22}{len(v):6}{ans:6}{ex:6}{bad:7}{dup:6}{empty:7}")
print('TOTAL',tot)
