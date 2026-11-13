const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/night-order-20261108/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({hasTouch:true,viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__brief={state,render,resetFirstHole,pollGamepad,rebindKeyboardAction,startRebuildLab};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');
  await p.waitForFunction(()=>window.__brief&&__brief.state.mode==='menu');await p.keyboard.press('Enter');
  await p.waitForFunction(()=>window.RCScene3D?.stats().ready&&__brief.state.mode==='first_hole',null,{timeout:90000});await p.waitForFunction(()=>!document.querySelector('[data-brief-start]').disabled);
  await p.evaluate(()=>__brief.state.manualTime=true);
  const present=async()=>{await p.evaluate(()=>__brief.render());await p.evaluate(async()=>RCScene3D.whenPresented());};
  assert(await p.locator('#night-order').isVisible());
  const freeze=()=>p.evaluate(()=>{const s=__brief.state;return {elapsed:s.hole.elapsed,joe:[s.hole.joe.x,s.hole.joe.y],player:[s.player.x,s.player.y],checks:s.hole.nightOrderActionsCompleted,balls:s.hole.golfBalls};});
  const before=await freeze();await p.keyboard.down('w');await p.evaluate(()=>advanceTime(5000));await p.keyboard.up('w');assert.deepEqual(await freeze(),before);assert(await p.locator('#night-order').isVisible());
  for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){
   await p.setViewportSize({width,height});await present();await p.screenshot({path:out+'/brief-'+width+'.png'});
   const layout=await p.evaluate(()=>{const panel=document.querySelector('#night-order'),button=document.querySelector('[data-brief-start]'),r=panel.getBoundingClientRect(),b=button.getBoundingClientRect();return {overflowX:panel.scrollWidth>panel.clientWidth,scroll:panel.scrollHeight>panel.clientHeight,buttonVisible:b.top>=r.top&&b.bottom<=r.bottom,buttonHeight:b.height};});
   assert(!layout.overflowX);assert(!layout.scroll,'Landscape briefing needs scrolling '+JSON.stringify(layout));assert(layout.buttonVisible&&layout.buttonHeight>=44);
  }
  await p.keyboard.press('Escape');await present();assert.equal(await p.locator('#night-order').isVisible(),false);await p.keyboard.press('Escape');await present();assert(await p.locator('#night-order').isVisible());
  await p.evaluate(()=>__brief.rebindKeyboardAction('interact','KeyG'));await present();assert.match(await p.locator('[data-brief-controls]').innerText(),/G use/);await p.keyboard.press('e');assert(await p.locator('#night-order').isVisible());await p.keyboard.press('g');await p.evaluate(()=>advanceTime(17));await present();assert.equal(await p.locator('#night-order').isVisible(),false);assert.equal(await p.evaluate(()=>__brief.state.hole.ballAim.active),false);
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(600));await p.keyboard.up('w');await present();assert((await freeze()).player[1]>before.player[1]);assert.match(await p.locator('[data-q=goal]').innerText(),/RING THE AUDIT BELL/);await p.screenshot({path:out+'/first-objective.png'});
  await p.evaluate(()=>{__brief.rebindKeyboardAction('interact','KeyE');__brief.resetFirstHole();__brief.render();});await p.waitForFunction(()=>{__brief.render();return !RCScene3D.isPreparing();},null,{timeout:90000});await present();await p.locator('[data-brief-start]').tap({force:true});await present();assert.equal(await p.evaluate(()=>__brief.state.hole.tutorialVisible),false);
  // Synthetic controller: stick drift cannot skip; a fresh A press can.
  await p.evaluate(()=>__brief.resetFirstHole());await p.waitForFunction(()=>{__brief.render();return !RCScene3D.isPreparing();},null,{timeout:90000});const pad=await p.evaluate(()=>{const t=__brief,s=t.state;const buttons=Array.from({length:16},()=>({pressed:false,value:0})),pad={id:'QA fixture',connected:true,buttons,axes:[.4,0,0,0]};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});s.gamepad.previousButtons=[];t.pollGamepad();const drift=s.hole.tutorialVisible;buttons[0]={pressed:true,value:1};t.pollGamepad();return {drift,started:!s.hole.tutorialVisible};});assert.deepEqual(pad,{drift:true,started:true});
  await p.evaluate(()=>{Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[]});__brief.startRebuildLab('calibration');});await present();assert.equal(await p.locator('#night-order').isVisible(),false);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,checks:['Real menu start shows narrative/objective briefing','Time/player/Joe/checks freeze while reading','Movement and gamepad drift do not skip','Responsive layouts and 44px confirm control','Pause/resume, remapped key, click/tap and gamepad confirm','No chip on dismissal; movement restored; practice bypass'],errors},null,2));console.log(JSON.stringify({passed:true,software,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
