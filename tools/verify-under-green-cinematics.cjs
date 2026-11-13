const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/cinematics';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],slides=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 await p.waitForFunction(()=>JSON.parse(render_game_to_text()).opening.ready);assert.equal((await read()).mode,'under_green_intro');
 await p.evaluate(()=>advanceTime(5000));assert.equal((await read()).elapsed,0,'Intro must not advance pursuit/water');
 await p.locator('#opening-story input').check();
 for(let i=1;i<=3;i++){
  await p.waitForFunction(i=>{const s=JSON.parse(render_game_to_text()).opening;return s.slide===i&&s.ready;},i);
  const image=await p.locator('.opening-image img').evaluate(e=>({src:e.currentSrc,width:e.naturalWidth,height:e.naturalHeight}));assert(image.width>=1600);slides.push(image);
  await p.waitForTimeout(750);await p.screenshot({path:out+'/intro-'+i+'-2560.png'});await p.keyboard.press('e');
 }
 assert.equal((await read()).mode,'under_green_playing');assert.equal((await read()).elapsed,0);assert(!(await read()).opening.active);
 // Real contact, rather than setting the loss screen directly.
 await p.evaluate(async()=>{const{createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.evidence=true;r.bypass=true;Object.assign(r.player,{x:0,y:55,grace:0});Object.assign(r.joe,{x:0,y:53.6,yaw:0,phase:'windup',age:0});__underGreen.run=r;advanceTime(1500);});
 assert.equal((await read()).mode,'under_green_caught');assert(await p.locator('#defeat-art').isVisible());
 for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>advanceTime(0));await p.locator('#defeat-art img').evaluate(e=>e.decode());
  const art=await p.locator('#defeat-art img').evaluate(e=>({width:e.naturalWidth,fit:getComputedStyle(e).objectFit}));assert(art.width>=1600);assert.equal(art.fit,'contain');
  assert.equal(await p.locator('#panel').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await p.screenshot({path:out+'/loss-'+width+'.png'});
  await p.locator('#primary').scrollIntoViewIfNeeded();const button=await p.locator('#primary').boundingBox();assert(button.x>=0&&button.x+button.width<=width);views.push({width,height,art,button});
 }
 await p.keyboard.press('e');let state=await read();assert.equal(state.mode,'under_green_playing');assert.equal(state.player.y,5);assert(!state.bypass&&!state.evidence);assert(!state.opening.active,'Retry bypasses the intro');
 await p.setViewportSize({width:1280,height:720});await p.keyboard.press('Escape');const time=(await read()).elapsed;await p.locator('#comfort summary').click();await p.click('#replay-intro');await p.waitForFunction(()=>JSON.parse(render_game_to_text()).opening.ready);await p.evaluate(()=>advanceTime(5000));assert.equal((await read()).elapsed,time);await p.keyboard.press('Escape');assert.equal((await read()).mode,'under_green_paused');
 await p.reload();await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');assert.equal((await read()).mode,'under_green_playing','Skip preference survives reload');
 // Responsive replay includes narrative and navigation, not a cropped poster.
 await p.keyboard.press('Escape');await p.locator('#comfort summary').click();await p.click('#replay-intro');await p.waitForFunction(()=>JSON.parse(render_game_to_text()).opening.ready);
 for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});assert(await p.locator('[data-opening="skip"]').isVisible());assert(await p.locator('[data-opening="next"]').isVisible());assert.equal(await p.locator('#opening-story').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await p.screenshot({path:out+'/intro-'+width+'.png'});}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,slides,views,errors},null,2));console.log(JSON.stringify({passed:true,slides:slides.length,views:views.length,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
