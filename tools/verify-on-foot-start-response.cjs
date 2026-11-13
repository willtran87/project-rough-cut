const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/on-foot-start-response',baseline=process.argv.includes('--baseline'),frame=1000/60;
const near=(a,b,label)=>assert(Math.abs(a-b)<1e-5,`${label}: ${a} != ${b}`);
(async()=>{
 fs.mkdirSync(out,{recursive:true});if(baseline)assert(!fs.existsSync(out+'/baseline.json'));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const results=[],errors=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  async function visit(chapter){await p.goto(`http://127.0.0.1:4187/${chapter}.html?test`);await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);}
  await visit('under-green');await p.locator('#comfort summary').click();await p.locator('[data-spatial=acceleration]').check();
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.spatial.v1')).acceleration),true);
  async function reset(chapter){await p.evaluate(async chapter=>{const {createRun}=await import(`./${chapter}-sim.js`),r=createRun();r.mode='playing';if(chapter==='final-cut'){Object.assign(r.player,{x:16,y:8,yaw:0});__finalCut.run=r;}else{__underGreen.clearInput();__underGreen.run=r;}},chapter);await tick(0);}
  for(const chapter of ['under-green','final-cut']){
   await visit(chapter);await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await p.click('#primary');
   for(const [name,keys,speed]of [['walk',['w'],3.84],['sprint',['w','Shift'],6.08],['listen',['w','q','Shift'],2.4],['crouch',['w','c'],2.4],['diagonal',['w','d'],3.84]]){
    await reset(chapter);const start=(await read()).player;for(const key of keys)await p.keyboard.down(key);await tick(frame);const first=(await read()).player;await tick(100);const settled=(await read()).player;
    for(const key of keys)await p.keyboard.up(key);await tick(100);const stopped=(await read()).player;
    const distance=Math.hypot(first.x-start.x,first.y-start.y),expected=speed/60*.525;
    results.push({chapter,name,distance,expected,settledSpeed:settled.speed,stopDelta:Math.hypot(stopped.x-settled.x,stopped.y-settled.y)});
    if(!baseline){near(distance,expected,chapter+' '+name);near(settled.speed,speed,'full speed');near(stopped.x,settled.x,'stop x');near(stopped.y,settled.y,'stop y');}
   }
   await reset(chapter);await p.keyboard.down('w');await tick(150);await p.keyboard.up('w');const beforeReverse=(await read()).player;await p.keyboard.down('s');await tick(frame);await p.keyboard.up('s');const reversed=(await read()).player;
   results.push({chapter,name:'reverse',distance:beforeReverse.y-reversed.y,expected:3.84/60*.525});if(!baseline)near(beforeReverse.y-reversed.y,3.84/60*.525,'reverse ramp');
  }
  if(!baseline){
   // The finale exposes the inherited preference and allows it to be changed.
   await p.keyboard.press('Escape');await p.locator('#comfort summary').click();assert(await p.locator('[data-spatial=acceleration]').isChecked());
   await p.locator('[data-spatial=acceleration]').uncheck();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.spatial.v1')).acceleration),false);
   await reset('final-cut');const start=(await read()).player;await p.keyboard.down('w');await tick(frame);const immediate=(await read()).player;await p.keyboard.up('w');near(immediate.y-start.y,3.84/60,'default immediate');await tick(100);near((await read()).player.y,immediate.y,'immediate stop');
   await p.keyboard.press('Escape');await p.locator('[data-spatial=acceleration]').check();await reset('final-cut');
   await p.evaluate(()=>{window.startPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[startPad];});await tick(frame);const padStart=(await read()).player;
   await p.evaluate(()=>startPad.axes=[0,-1,0,0]);await tick(frame);near((await read()).player.y-padStart.y,3.84/60*.525,'controller start');await p.evaluate(()=>startPad.axes=[0,0,0,0]);await tick(100);const padStop=(await read()).player;await tick(100);near((await read()).player.y,padStop.y,'controller stop');await p.evaluate(()=>navigator.getGamepads=()=>[]);await tick(frame);
   if((await read()).mode==='final_cut_playing')await p.keyboard.press('Escape');
   for(const [width,height]of [[2560,1600],[1280,720]]){await p.setViewportSize({width,height});await p.locator('[data-spatial=acceleration]').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/settings-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.locator('[data-spatial=acceleration]').evaluate(e=>e.closest('label').getBoundingClientRect().height>=44&&e.getBoundingClientRect().width>=22));views.push({width,height});}
   await visit('under-green');await p.locator('#comfort summary').click();assert(await p.locator('[data-spatial=acceleration]').isChecked());
   await p.locator('[data-spatial=acceleration]').uncheck();await visit('final-cut');await p.locator('#comfort summary').click();assert(!(await p.locator('[data-spatial=acceleration]').isChecked()));
   await p.locator('[data-spatial=acceleration]').check();
   // Verify the third actual consumer on Level 1's clear calibration ground.
   await p.evaluate(()=>localStorage.setItem('rough-cut.level-one-opening.v1','{"seen":true,"skip":true}'));
   await p.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__startResponseTest={state};\n  window.advanceTime = (milliseconds) => {')}));
   await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__startResponseTest&&window.roughCutRebuild,null,{timeout:90000});
   assert(await p.evaluate(()=>RCSpatialControls.get().acceleration));await p.keyboard.press('Enter');await p.keyboard.press('Space');await p.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:90000});
   await p.evaluate(()=>{__startResponseTest.state.manualTime=true;roughCutRebuild.startLab('calibration');__startResponseTest.state.hole.rebuild.lab=null;advanceTime(0);});await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
   const l1Start=await p.evaluate(()=>({...__startResponseTest.state.player}));await p.keyboard.down('w');await tick(frame);await p.keyboard.up('w');const l1End=await p.evaluate(()=>({...__startResponseTest.state.player}));
   const l1Distance=Math.hypot((l1End.x-l1Start.x)*.1152,(l1End.y-l1Start.y)*.16);near(l1Distance,3.84/60*.525,'Level 1 start');await tick(100);const l1Stop=await p.evaluate(()=>({...__startResponseTest.state.player}));near(l1Stop.y,l1End.y,'Level 1 stop');
   results.push({chapter:'level-one',name:'inherited ramp and stop',distance:l1Distance,expected:3.84/60*.525});
   // Actual touch settings and movement; verify the checkbox works on phones.
   for(const [width,height]of [[844,390],[390,844]]){
    const tc=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true}),t=await tc.newPage();t.on('pageerror',e=>errors.push(e.message));await t.goto('http://127.0.0.1:4187/final-cut.html?test');await t.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await t.evaluate(()=>advanceTime(0));await t.locator('#comfort summary').tap();await t.locator('[data-spatial=acceleration]').check();await t.locator('[data-spatial=acceleration]').scrollIntoViewIfNeeded();await t.screenshot({path:`${out}/settings-touch-${width}.png`});views.push({width,height,touch:true});await t.locator('#primary').tap();
    await t.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),r=createRun();r.mode='playing';Object.assign(r.player,{x:16,y:8,yaw:0});__finalCut.run=r;advanceTime(0);});
    const cdp=await tc.newCDPSession(t),r=await t.locator('[data-key=forward]').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+r.width/2,y:r.y+r.height/2}]});await t.evaluate(ms=>advanceTime(ms),frame);near(await t.evaluate(()=>__finalCut.run.player.y)-8,3.84/60*.525,'touch start');await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await t.evaluate(()=>advanceTime(100));near(await t.evaluate(()=>__finalCut.run.player.speed),0,'touch cancelled stop');await tc.close();
   }
  }
  assert.deepEqual(errors,[]);const mismatches=results.filter(r=>Math.abs(r.distance-r.expected)>1e-5);
  if(baseline)assert(mismatches.some(r=>r.chapter==='final-cut'));else assert.deepEqual(mismatches,[]);
  fs.writeFileSync(`${out}/${baseline?'baseline':'verified'}.json`,JSON.stringify({baseline,results,mismatches,views,errors},null,2));console.log(JSON.stringify({baseline,cases:results.length,mismatches:mismatches.length,views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
