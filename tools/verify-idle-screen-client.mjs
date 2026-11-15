import fs from 'node:fs';
const root='C:/Users/Will/.codex/skills/develop-web-game/';
let source=fs.readFileSync(root+'scripts/web_game_playwright_client.js','utf8');
source=source.replace('from "playwright"',`from "file:///${root}node_modules/playwright/index.mjs"`);
source=source.replace('"--use-angle=swiftshader"','"--use-angle=d3d11", "--ignore-gpu-blocklist"');
source=source.replace('const page = await browser.newPage();','const page = await browser.newPage({viewport:{width:2560,height:1600}});');
source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',`
  await page.addInitScript(()=>{for(const key of ['rough-cut.back-nine-opening.v1','rough-cut.under-green-opening.v1'])localStorage.setItem(key,JSON.stringify({skip:true}));localStorage.setItem('rough-cut.final-cut-story.v1',JSON.stringify({skipIntro:true}));});
  await page.goto(args.url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});`);
source=source.replace('    await captureScreenshot(page, canvas, shotPath);',`    await captureScreenshot(page, canvas, shotPath);
    await page.screenshot({path:path.join(args.screenshotDir,'page-'+i+'.png')});`);
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
