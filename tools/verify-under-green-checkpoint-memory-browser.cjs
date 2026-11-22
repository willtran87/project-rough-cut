const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='output/under-green/checkpoint-one',errors=[],checks=[],views=[];fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));
  const ready=()=>p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  const memory=()=>p.evaluate(()=>{const r=__underGreen.run;return {checkpoint:r.checkpoint,remembered:r.bunkerRouteObserved,active:r.joe.sawBunkerRoute,mode:r.mode,x:r.joe.x,y:r.joe.y,age:r.joe.age,time:r.time,save:JSON.parse(localStorage.getItem('rough-cut.under-green.v1'))};});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await ready();await p.click('#primary');
  await p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=24;
   Object.assign(r.player,{x:-3.7,y:73,yaw:-Math.PI/2});
   Object.assign(r.joe,{x:0,y:58,yaw:0,phase:'walk',last:{x:0,y:55}});
   __underGreen.run=r;__underGreen.clearInput();advanceTime(0);
   localStorage.setItem('rough-cut.back-nine.v1',JSON.stringify({sentinel:'sibling-progress'}));
  });
  await p.keyboard.down('w');await tick(150);await p.keyboard.up('w');
  // Standard keeps no checkpoints and saves no pursuit memory (981accb; see verify-under-green-restart-browser).
  let state=await memory();assert.equal(state.checkpoint,0);assert(state.remembered&&state.active);assert(!('bunkerRouteObserved' in state.save)&&!('checkpoint' in state.save));
  checks.push('Actual westward keyboard movement records Joe’s sighted route for this attempt only, without a checkpoint or saved memory');
  await p.reload();await ready();await tick(0);state=await memory();assert(!state.remembered&&!state.active);assert.equal(state.mode,'briefing');
  assert.equal(state.age,0);assert.equal(await p.evaluate(()=>__underGreen.run.joe.phase),'absent');
  await p.click('#primary');await tick(0);
  // Exercise the real retry handler from a defeat fixture, without waiting for
  // a second full capture (physical strike/capture has separate coverage).
  await p.evaluate(()=>{const r=__underGreen.run;r.bunkerRouteObserved=true;r.joe.sawBunkerRoute=true;r.mode='caught';r.reason='Checkpoint retry fixture';advanceTime(0);});
  // The retry panel waits behind the short capture camera move.
  await p.waitForFunction(()=>{advanceTime(0);return !document.body.classList.contains('transition-hold');},null,{timeout:8000});assert.equal(await p.locator('#primary').textContent(),'Retry from the start');
  await p.click('#primary');await tick(0);state=await memory();assert(!state.active&&!state.remembered);assert.equal(state.checkpoint,0);assert.equal(state.age,0);
  await p.keyboard.press('Escape');const paused=await memory();await tick(2000);assert.deepEqual(await memory(),paused);
  checks.push('Reload and the real Retry action start fresh without the observed route; pause freezes the result');
  const encounter=JSON.parse(fs.readFileSync('tools/fixtures/under-green/checkpoint-one-restored-encounter.json','utf8'));
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(r=>{__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},encounter);
   const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(s.joe.distance<6);assert.equal(s.mode,'under_green_playing');
   // The chapter no longer narrates pursuit in the gameplay banner (#pursuit is cleared; #caption carries only optional sound descriptions).
   assert.doesNotMatch(await p.locator('#caption').innerText(),/JOE/);assert.equal(await p.locator('#pursuit').innerText(),'');
   await p.screenshot({path:`${out}/restored-approach-${width}.png`});views.push({width,height,joe:s.joe,player:s.player});
  }
  await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#comfort .rc-settings-tabs button',{hasText:'Readability'}).click();await p.locator('#campaign-threat-captions').uncheck();await p.locator('#comfort').evaluate(e=>e.open=false);await p.click('#primary');await tick(0);
  assert.doesNotMatch(await p.locator('#caption').innerText(),/JOE IS CLOSE/);
  await p.evaluate(()=>{const r=__underGreen.run;r.joe.phase='windup';r.joe.x=r.player.x+1;r.joe.y=r.player.y;advanceTime(0);});
  assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).joe.phase,'windup');assert.doesNotMatch(await p.locator('#caption').innerText(),/JOE|Move sideways/);
  checks.push('Close restored approaches play at four sizes without pursuit narration in the banner, with pursuit captions on or off');
  await p.keyboard.press('Escape');await p.click('#restart');await tick(0);state=await memory();assert.equal(state.checkpoint,0);assert(!state.remembered&&!state.active);assert(!state.save.bunkerRouteObserved);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.back-nine.v1')).sentinel),'sibling-progress');
  checks.push('Restart chapter clears route memory and preserves sibling chapter progress');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/memory-browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
