const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 await page.setContent('<section id="course-menu" data-screen="menu" style="position:absolute;inset:0"></section>');
 await page.evaluate(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...a){return type==='webgl'?null:get.call(this,type,...a);};window.RCChapterSelect={selected:()=>({id:'night-order'})};});
 for(const name of ['course-menu-atmosphere-fallback.js','course-menu-atmosphere.js'])await page.addScriptTag({content:fs.readFileSync('web/'+name,'utf8')});
 await page.evaluate(()=>{window.fallback=RCMenuAtmosphere.create(document.querySelector('#course-menu'));fallback.sync({reducedMotion:false});});await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>fallback.stats().driver),'lightweight-fallback');assert((await page.evaluate(()=>fallback.stats().ticks))>0);assert.equal(await page.locator('canvas').count(),0);
 await page.evaluate(()=>fallback.sync({reducedMotion:true}));assert.equal(await page.evaluate(()=>fallback.stats().scheduled),false);console.log('Missing WebGL falls back to the bounded 10 Hz speckles; reduced motion stops the fallback.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
