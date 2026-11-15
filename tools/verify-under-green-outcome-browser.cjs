const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/outcome',b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[],checks=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const fixture=JSON.parse(fs.readFileSync('output/under-green/navigation/service-encounter.json','utf8'));
  await p.evaluate(r=>{r.evidence=true;__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},fixture);await tick(1500);
  let s=await read();assert.equal(s.mode,'under_green_caught');assert.equal(s.failure.kind,'sweep');assert.match(await p.locator('#retry-advice').innerText(),/Next try:.*sideways/);assert.match(await p.locator('#retry-progress').innerText(),/checkpoint 2.*bypass stays open.*record is kept/);
  await p.click('#primary');await tick(0);s=await read();assert.equal(s.mode,'under_green_playing');assert.equal(s.failure,null);assert(s.bypass&&s.evidence);assert.equal(s.waterHits,0);assert(await p.locator('#retry-advice').isHidden());assert(await p.locator('#retry-progress').isHidden());
  checks.push('Actual browser sweep produces useful advice; ordinary retry preserves durable facts and clears the old failure');
  const surge=JSON.parse(fs.readFileSync(out+'/caught-after-surge.json','utf8'));
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(r=>{__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},surge);
   assert.match(await p.locator('#result').innerText(),/surge at east spillway/);assert.match(await p.locator('#retry-advice').innerText(),/full crossing window/);
   await p.locator('#retry-advice').scrollIntoViewIfNeeded();
   const bounds=await p.locator('#retry-advice').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight};});
   assert(bounds.left>=0&&bounds.right<=width&&bounds.top>=0&&bounds.bottom<=height);views.push({width,height,bounds});await p.screenshot({path:`${out}/retry-${width}.png`});
   await p.locator('#primary').scrollIntoViewIfNeeded();assert(await p.locator('#primary').isVisible());
  }
  checks.push('Recorded surge context and retry advice remain readable and retry reachable at four sizes');
  await p.setViewportSize({width:1280,height:720});await p.click('#primary');await tick(0);await p.keyboard.press('Escape');assert(await p.locator('#retry-advice').isHidden());assert(await p.locator('#retry-progress').isHidden());
  await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});assert.equal((await read()).failure,null);assert(await p.locator('#retry-advice').isHidden());
  checks.push('Pause and reload do not display stale capture coaching');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
