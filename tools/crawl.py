import asyncio,json,re
from playwright.async_api import async_playwright
B='file:///home/claude/portal/'
cat=json.loads(open('portal/data-js/catalog.js').read()[len('window.CATALOG='):-2])
urls=['index.html','exams.html','subjects.html','test-series.html','practice.html','notes.html','bookmarks.html','results.html','search.html','search.html?q=मौर्य']
urls+=[f'subjects.html?id={s["id"]}' for s in cat['subjects']]+[f'test-series.html?id={s["id"]}' for s in cat['series']]
urls+=[f'test.html?t={t["id"]}' for s in cat['series'] for t in s['tests']]+[f'notes.html?id={n["id"]}' for n in cat['notes']]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg=await b.new_page(); bad=[];errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        links=set()
        for u in urls:
            n=len(errs); await pg.goto(B+u, wait_until='domcontentloaded')
            txt=await pg.inner_text('#main')
            if 'नहीं मिला' in txt or 'खुल नहीं सका' in txt or len(errs)>n or len(txt)<20: bad.append(u)
            for h in await pg.eval_on_selector_all('#main a[href]','els=>els.map(e=>e.getAttribute("href"))'):
                if not h.startswith('http') and not h.startswith('#'): links.add(h)
        # check linked local files exist
        import os
        missing=[h for h in links if not os.path.exists('portal/'+h.split('?')[0].split('#')[0])]
        print('pages',len(urls),'bad',bad[:10],'errors',errs[:5],'distinct links',len(links),'missing targets',missing[:10])
        await b.close()
asyncio.run(main())
