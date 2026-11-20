// Relaxed difficulty alone may restart a caught attempt at the last area
// reached. Standard and Hard keep the no-checkpoint rule that
// verify-under-green-restart-browser.cjs asserts, and nothing is ever saved.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {unlockChapters,skipStories}=require('./lib/campaign-fixture.cjs');
const out='output/under-green/relaxed-checkpoints';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],checks=[];
 try{
  const p=await browser.newPage({viewport:{width:1280,height:720}});
  await unlockChapters(p);await skipStories(p);
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const ready=async()=>{await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));};
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await ready();
  await p.evaluate(()=>{localStorage.clear();});await p.reload();await ready();
  // Walks the real simulation into a checkpoint area, then is caught there.
  const reachAndFall=async({x,y,bypass})=>{
   if(await p.locator('#panel').isVisible())await p.click('#primary');await p.evaluate(()=>advanceTime(0));
   await p.evaluate(({x,y,bypass})=>{const r=__underGreen.run;Object.assign(r.player,{x,y,grace:5});r.lessonCrossed=true;if(bypass){r.bypass=true;r.bypassAt=r.time;}r.joe.x=40;r.joe.y=5;advanceTime(100);r.mode='caught';r.reason='test';advanceTime(0);},{x,y,bypass});
   await p.waitForFunction(()=>!document.getElementById('panel').hidden&&document.body.dataset.mode==='caught');
   // The retry panel waits for the short capture camera move to land.
   await p.waitForFunction(()=>{advanceTime(0);return !document.body.classList.contains('transition-hold');},null,{timeout:8000});
  };
  const pump={x:-16,y:40,bypass:true};
  // Standard: no checkpoint, whatever was reached.
  await reachAndFall(pump);
  assert.equal((await read()).retryCheckpoint,0);assert.equal(await p.locator('#primary').textContent(),'Retry from the start');
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  let s=await read();assert.equal(s.player.x,0);assert.equal(s.player.y,5);assert.equal(s.checkpoint,0);assert(!s.bypass);
  checks.push('Standard restarts at the drain entrance after reaching the pump house');
  // Hard: the same.
  await p.keyboard.press('Escape');await p.evaluate(()=>{const e=document.querySelector('[data-campaign=difficulty]');e.value='hard';e.dispatchEvent(new Event('change',{bubbles:true}));});
  assert.equal(await p.evaluate(()=>__underGreen.run.difficulty),'relentless');await p.click('#restart');await p.evaluate(()=>advanceTime(0));
  await reachAndFall(pump);assert.equal(await p.locator('#primary').textContent(),'Retry from the start');
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));s=await read();assert.equal(s.player.y,5);assert.equal(s.checkpoint,0);
  checks.push('Hard restarts at the drain entrance after reaching the pump house');
  // Relaxed: restart at the pump house, bypass kept, and the screen says so.
  await p.keyboard.press('Escape');await p.evaluate(()=>{const e=document.querySelector('[data-campaign=difficulty]');e.value='relaxed';e.dispatchEvent(new Event('change',{bubbles:true}));});
  assert.equal(await p.evaluate(()=>__underGreen.run.difficulty),'steady');assert.match(await p.locator('#save-note').textContent(),/Relaxed difficulty/);
  await p.click('#restart');await p.evaluate(()=>advanceTime(0));
  await reachAndFall(pump);
  assert.equal((await read()).retryCheckpoint,2);
  assert.equal(await p.locator('#primary').textContent(),'Retry from the pump house');
  assert.match(await p.locator('#tagline').textContent(),/start again at the pump house/);assert.match(await p.locator('#retry-progress').textContent(),/restarts at the pump house/);
  await p.screenshot({path:`${out}/caught-relaxed.png`});
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));s=await read();
  assert.equal(s.checkpoint,2);assert.equal(s.player.x,-16);assert.equal(s.player.y,40);assert(s.bypass);assert.equal(s.mode,'under_green_playing');
  checks.push('Relaxed restarts at the last area reached and names it on the retry screen');
  // Restart chapter and a reload both return to the entrance; nothing is stored.
  const save=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.under-green.v1')));assert(!('checkpoint' in save));
  await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(0));s=await read();assert.equal(s.checkpoint,0);assert.equal(s.player.y,5);assert.equal(s.retryCheckpoint,0);
  await reachAndFall(pump);await p.reload();await ready();s=await read();assert.equal(s.checkpoint,0);assert.equal(s.player.y,5);assert.equal(s.retryCheckpoint,0);
  checks.push('Manual restart and reload clear the relaxed checkpoint; the save never holds one');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
