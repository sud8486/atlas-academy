import asyncio
from playwright.async_api import async_playwright
B='file:///home/claude/portal/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for name,w,h,theme in [('exam',1366,900,'light'),('exam-m',390,844,'light'),('exam-d',1366,900,'dark')]:
            c=await b.new_context(viewport={'width':w,'height':h},color_scheme=theme); pg=await c.new_page()
            await pg.goto(B+'test.html?t=modern_history-t001'); await pg.click('#start'); await pg.wait_for_selector('.opt')
            for i in range(3):
                await (await pg.query_selector_all('.opt'))[i%4].click(); await pg.click('#nextBtn')
            await (await pg.query_selector_all('.opt'))[1].click(); 
            if w>1000: await pg.click('#markBtn')
            await pg.screenshot(path=f'shots/{name}.png')
            if name=='exam-m':
                await pg.click('#palToggle'); await pg.wait_for_timeout(300); await pg.screenshot(path='shots/exam-m-pal.png')
            if name=='exam':
                await pg.click('#submitBtn'); await pg.click('#confirm button[value=yes]'); await pg.wait_for_selector('.score-n'); await pg.screenshot(path='shots/result.png')
                await pg.goto(B+'practice.html?t=ancient_history-t003'); await pg.wait_for_selector('.opt'); await (await pg.query_selector_all('.opt'))[0].click(); await pg.wait_for_timeout(200); await pg.screenshot(path='shots/practice.png')
            await c.close()
        await b.close()
asyncio.run(main())
