const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/crossings/ui';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const errors=[],samples=[];
 for(const [width,height,touch]of [[2560,1600,false],[1280,720,false],[844,390,true],[390,844,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4187/final-cut.html?test');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.evaluate(()=>advanceTime(0));
  await page.locator('#comfort summary').click();await page.locator('[data-campaign=subtitleSize]').fill('1.4');await page.locator('[data-campaign=threatCaptions]').uncheck();await page.locator('[data-campaign=muted]').check();await page.locator('#primary').click();
  for(const warning of ['middle','danger']){
   await page.evaluate(async warning=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:16,y:46,yaw:0,crouch:true});if(warning==='danger')Object.assign(r.rig,{x:29,y:50,yaw:-Math.PI/2,direction:-1,phase:'pass',deployment:1});__finalCut.run=r;await advanceTime(0);},warning);
   const caption=await page.locator('#caption').innerText();assert.match(caption,warning==='middle'?/Middle rough is next/:/Cutting pass approaching/);assert(await page.locator('#caption').isVisible());
   await page.screenshot({path:`${out}/${warning}-${width}.png`});
   const metrics=await page.evaluate(()=>{const rect=id=>{const e=document.getElementById(id),r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,visible:!!e.getClientRects().length&&!e.hidden};};return {objective:rect('objective-card'),caption:rect('caption'),touch:rect('touch'),method:JSON.parse(render_game_to_text()).inputMethod};});
   const {objective:a,caption:b,touch:t}=metrics,overlap=a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
   samples.push({width,height,warning,metrics,overlap});assert(!overlap,`Caption overlaps objective at ${width} ${warning}`);assert(b.y>=0&&b.y+b.h<=height);if(touch){assert(t.visible);assert(await page.evaluate(()=>{const a=document.getElementById('caption').getBoundingClientRect();return [...document.querySelectorAll('#touch button')].every(e=>{const b=e.getBoundingClientRect();return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom;});}),'Caption overlaps a touch control');}
  }
  await page.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:16,y:58,yaw:Math.atan2(-5.4,.4)});__finalCut.run=r;await advanceTime(0);});
  await page.screenshot({path:`${out}/fork-${width}.png`});assert((await page.evaluate(()=>JSON.parse(render_game_to_text()))).crossings.atFork);
  await context.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,samples,errors},null,2));console.log(JSON.stringify({passed:true,samples:samples.length,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
