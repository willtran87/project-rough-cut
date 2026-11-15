const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='output/under-green/checkpoint-one',errors=[],checks=[],views=[];
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
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
  let state=await memory();assert.equal(state.checkpoint,1);assert(state.save.bunkerRouteObserved&&state.active);
  checks.push('Actual westward keyboard movement records Joe’s sighted route in browser storage at checkpoint 1');
  await p.reload();await ready();await tick(0);state=await memory();assert(state.remembered&&state.active);assert.equal(state.mode,'briefing');
  assert.equal(state.x,0);assert.equal(state.y,55);assert.equal(state.age,0);
  await p.click('#primary');await tick(0);
  // Exercise the real retry handler from a defeat fixture, without waiting for
  // a second full capture (physical strike/capture has separate coverage).
  await p.evaluate(()=>{__underGreen.run.mode='caught';__underGreen.run.reason='Checkpoint retry fixture';advanceTime(0);});
  await p.click('#primary');await tick(0);state=await memory();assert(state.active&&state.remembered);assert.equal(state.age,0);
  await p.keyboard.press('Escape');const paused=await memory();await tick(2000);assert.deepEqual(await memory(),paused);
  checks.push('Reload and the real Retry checkpoint action retain only the observed route; the authored spawn and calm phase reset, and pause freezes the result');
  const encounter=JSON.parse(fs.readFileSync(out+'/restored-encounter.json','utf8'));
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(r=>{__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},encounter);
   const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(s.joe.distance<6);assert.equal(s.mode,'under_green_playing');
   assert.match(await p.locator('#caption').innerText(),/JOE IS CLOSE/);
   await p.screenshot({path:`${out}/restored-approach-${width}.png`});views.push({width,height,joe:s.joe,player:s.player});
  }
  await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#campaign-threat-captions').uncheck();await p.click('#primary');await tick(0);
  assert.doesNotMatch(await p.locator('#caption').innerText(),/JOE IS CLOSE/);
  await p.evaluate(()=>{const r=__underGreen.run;r.joe.phase='windup';r.joe.x=r.player.x+1;r.joe.y=r.player.y;advanceTime(0);});
  assert.match(await p.locator('#caption').innerText(),/Move sideways/);
  checks.push('Close observed approaches outrank pump success text at four sizes; optional pursuit captions can be disabled while immediate attack instructions remain');
  await p.keyboard.press('Escape');await p.click('#restart');await tick(0);state=await memory();assert.equal(state.checkpoint,0);assert(!state.remembered&&!state.active);assert(!state.save.bunkerRouteObserved);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.back-nine.v1')).sentinel),'sibling-progress');
  checks.push('Restart chapter clears route memory and preserves sibling chapter progress');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/memory-browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
