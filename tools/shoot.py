import asyncio,sys
from playwright.async_api import async_playwright
B='file:///home/claude/portal/'
SEED="""localStorage.setItem('gep.v1.results',JSON.stringify({'upsc_ca-t001':[{at:Date.now(),score:121.4,max:200,correct:68,wrong:23,skipped:9,secs:6000}],'ancient_history-t001':[{at:Date.now()-9e7,score:30,max:42,correct:33,wrong:9,skipped:0,secs:1800}],'ancient_history-t002':[{at:Date.now(),score:20,max:40,correct:24,wrong:12,skipped:4,secs:1800}],'polity_pyq-t003':[{at:Date.now(),score:10,max:20,correct:12,wrong:6,skipped:2,secs:900}]}));localStorage.setItem('gep.v1.progress',JSON.stringify({'modern_history-t004':{answers:{},pos:3}}));localStorage.setItem('gep.v1.last',JSON.stringify({test:'ancient_history-t002'}));"""
async def main():
    jobs=sys.argv[1:]
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--allow-file-access-from-files'])
        for j in jobs:
            name,url,w,h,theme=j.split('|')
            c=await b.new_context(viewport={'width':int(w),'height':int(h)},color_scheme=theme)
            pg=await c.new_page(); errs=[]
            pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
            await pg.goto(B+'index.html'); await pg.evaluate(SEED)
            await pg.goto(B+url); await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'/home/claude/shots/{name}.png',full_page=(int(h)<2000))
            print(name,'errors:',errs)
            await c.close()
        await b.close()
asyncio.run(main())
