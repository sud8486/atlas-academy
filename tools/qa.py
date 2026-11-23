import asyncio,json
from playwright.async_api import async_playwright
B='file:///home/claude/portal/'
Q=lambda s: json.load(open(f'/home/claude/portal/data/questions/{s}.json'))
results=[]
def check(name,cond,detail=''):
    results.append((name,bool(cond),detail)); print(('PASS ' if cond else 'FAIL ')+name,detail)

async def pick_by_text(pg,text):
    opts=await pg.query_selector_all('.opt')
    for o in opts:
        t=(await o.inner_text())
        if text in t: await o.click(); return True
    return False

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        c=await b.new_context(viewport={'width':1366,'height':900}); pg=await c.new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        # ---- 1. UPSC test: +2 / −0.66, 6 right, 4 wrong, clear 1, mark 2 → 6*2 − 3*0.66 = 10.02
        up=Q('upsc_ca')
        await pg.goto(B+'test.html?t=upsc_ca-t001'); await pg.click('#start'); await pg.wait_for_selector('.opt')
        for i in range(10):
            q=up[i]; target=q['answer'] if i<6 else (q['answer']+1)%len(q['options'])
            await pick_by_text(pg,q['options'][target]); 
            if i in (2,5): await pg.click('#markBtn')
            await pg.click('#nextBtn')
        await pg.click('[data-go="9"]'); await pg.click('#clearBtn')
        pal=await pg.eval_on_selector_all('#palGrid .pb','els=>els.slice(0,12).map(e=>e.className)')
        check('palette states (answered/marked/visited/not visited)', 'am' in pal[2] and 'an' in pal[0] and 'nv' in pal[9] and 'na' in pal[11], str(pal[:12]))
        t1=await pg.inner_text('#timer'); await pg.wait_for_timeout(2100); t2=await pg.inner_text('#timer')
        check('timer counts down', t1!=t2 and t1.startswith('1:59'), f'{t1} -> {t2}')
        await pg.click('#submitBtn'); dlg=await pg.inner_text('#confirm')
        check('confirm dialog shows counts', '9' in dlg and '91' in dlg, dlg.replace('\n',' ')[:80])
        await pg.click('#confirm button[value=yes]'); await pg.wait_for_selector('.score-n')
        sc=await pg.inner_text('.score-n'); check('UPSC negative marking score = 10.02', sc.strip()=='10.02', sc)
        kv=await pg.inner_text('.result .kv'); check('result counts 6/3/91', '6' in kv and '3' in kv and '91' in kv)
        rv=await pg.eval_on_selector_all('.ritem','els=>els.length'); check('review lists all 100 questions', rv==100, str(rv))
        await pg.click('[data-f="bad"]'); vis=await pg.eval_on_selector_all('.ritem:not([hidden])','els=>els.length'); check('review filter: wrong only', vis==3, str(vis))
        # ---- 2. result persisted + home bubble filled + results page review link
        await pg.goto(B+'index.html'); filled=await pg.eval_on_selector_all('.bub.done','e=>e.length'); check('home register bubble filled after test', filled>=1, str(filled))
        await pg.goto(B+'results.html'); await pg.click('text=उत्तर देखें'); await pg.wait_for_selector('.score-n'); check('past attempt review opens', (await pg.inner_text('.score-n')).strip()=='10.02')
        # ---- 3. multi-answer acceptance + default marking (+1 −⅓): ancient t001, q1 accepts [0,1]
        an=Q('ancient_history'); q0=an[0]
        await pg.goto(B+'test.html?t=ancient_history-t001'); await pg.click('#start'); await pg.wait_for_selector('.opt')
        await pick_by_text(pg,q0['options'][1]); await pg.click('#nextBtn')
        q1=an[1]; await pick_by_text(pg,q1['options'][(q1['answer'][0]+1)%4] if isinstance(q1['answer'],list) else q1['options'][(q1['answer']+1)%4])
        await pg.click('#submitBtn'); await pg.click('#confirm button[value=yes]'); await pg.wait_for_selector('.score-n')
        sc=await pg.inner_text('.score-n'); check('two-answer question accepted; 1 − ⅓ = 0.67', sc.strip()=='0.67', sc)
        # ---- 4. resume after reload
        await pg.goto(B+'test.html?t=polity_pyq-t001'); await pg.click('#start'); await pg.wait_for_selector('.opt')
        await (await pg.query_selector_all('.opt'))[0].click(); await pg.click('#nextBtn'); await (await pg.query_selector_all('.opt'))[1].click(); await pg.wait_for_timeout(300)
        await pg.goto(B+'test.html?t=polity_pyq-t001'); rb=await pg.inner_text('#resume'); check('resume offered after leaving', '2 उत्तर' in rb, rb)
        await pg.click('#resume'); await pg.wait_for_selector('#palGrid'); pc=await pg.inner_text('#palCount'); check('resume keeps answers', pc.startswith('2/'), pc)
        # ---- 5. shuffled series: correct answer still scored right (arthiki stores correct first)
        ar=Q('arthiki2026'); await pg.goto(B+'test.html?t=arthiki2026-t001'); await pg.click('#start'); await pg.wait_for_selector('.opt')
        firsts=[]
        for i in range(5):
            opts=await pg.query_selector_all('.opt'); texts=[await o.inner_text() for o in opts]
            firsts.append(next(k for k,t in enumerate(texts) if ar[i]['options'][0] in t))
            await pick_by_text(pg,ar[i]['options'][0]); await pg.click('#nextBtn')
        await pg.click('#submitBtn'); await pg.click('#confirm button[value=yes]'); await pg.wait_for_selector('.score-n')
        sc=await pg.inner_text('.score-n'); check('arthiki: options shuffled', len(set(firsts))>1, str(firsts)); check('arthiki: shuffled answers scored correctly (5)', sc.strip()=='5', sc)
        # ---- 6. practice: instant check + explanation + attempts recorded → wrong practice
        await pg.goto(B+'practice.html?t=medieval_history-t001'); await pg.wait_for_selector('.opt')
        md=Q('medieval_history'); q=md[0]; wrong=(q['answer'] if not isinstance(q['answer'],list) else q['answer'][0])+1
        await pick_by_text(pg,q['options'][wrong%4]); v=await pg.inner_text('.verdict'); ex=await pg.query_selector('.explain')
        check('practice: instant verdict + explanation', 'गलत' in v and ex is not None, v[:60])
        await pg.goto(B+'practice.html?src=wrong'); await pg.wait_for_selector('#palCount'); wc=await pg.inner_text('#palCount'); check('wrong-answer practice collects wrong questions', wc.endswith('हल') and '/' in wc, wc)
        # ---- 7. bookmarks
        await pg.click('[data-bm]'); await pg.goto(B+'bookmarks.html'); await pg.wait_for_selector('.ritem'); n=await pg.eval_on_selector_all('.ritem','e=>e.length'); check('bookmark appears on bookmarks page', n==1, str(n))
        # ---- 8. builder → important (repeated) questions
        await pg.goto(B+'practice.html'); await pg.select_option('#bSer','world_geography'); await pg.select_option('select[name=mode]','repeat'); await pg.click('#builder button[type=submit]')
        await pg.wait_for_selector('#palCount'); check('builder: important (asked >1 time) practice starts', 'हल' in await pg.inner_text('#palCount'))
        # ---- 9. image-based series renders images
        await pg.goto(B+'test.html?t=biology-t001'); await pg.click('#start'); await pg.wait_for_selector('.qimg'); await pg.wait_for_timeout(400)
        w=await pg.eval_on_selector('.qimg','i=>i.naturalWidth'); check('image question loads', w>100, str(w))
        # ---- 10. bilingual toggle
        await pg.goto(B+'test.html?t=lakshya_pcs-t001'); await pg.click('#start'); await pg.wait_for_selector('.qtext'); await pg.click('[data-lang=en]'); en=await pg.inner_text('.qtext'); check('Hindi/English toggle', en.isascii() or 'What' in en, en[:50])
        # ---- 11. search questions + notes
        await pg.goto(B+'search.html?q=मौर्य'); await pg.wait_for_function("document.querySelector('#qcount').textContent!=='खोज रहे हैं…'",timeout=60000)
        await pg.wait_for_function("document.querySelector('#ncount').textContent!=='खोज रहे हैं…'",timeout=60000)
        check('keyword search in questions', 'मिले' in await pg.inner_text('#qcount'), await pg.inner_text('#qcount'))
        check('keyword search in notes', 'नोट्स में' in await pg.inner_text('#ncount'), await pg.inner_text('#ncount'))
        await pg.goto(B+'search.html?q=मौर्य&subject=history&series=ancient_history'); await pg.wait_for_function("document.querySelector('#qcount').textContent!=='खोज रहे हैं…'")
        check('search filter by subject + series', 'मिले' in await pg.inner_text('#qcount'), await pg.inner_text('#qcount'))
        # ---- 12. auto-submit when time runs out (1-minute test)
        await pg.goto(B+'test.html?t=ca_batch1-t001'); await pg.fill('#mT','1'); await pg.click('#start'); await pg.wait_for_selector('.opt')
        await pg.wait_for_selector('.score-n',timeout=75000); auto=await pg.inner_text('.result-top'); check('auto-submit at 0:00', 'अपने आप' in auto)
        check('no JavaScript errors during run', not errs, str(errs[:3]))
        await b.close()
    print('\nSUMMARY', sum(r[1] for r in results),'/',len(results))
asyncio.run(main())
