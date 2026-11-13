const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/level-one-gamepad-menus',checks=[],errors=[];fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__padMenuTest={state,SETTINGS_ROWS,settingsRowGeometry};\n  window.advanceTime = (milliseconds) => {')}));
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.fieldnotes.v1',JSON.stringify(['course-sign','audit-board','clubhouse-board','service-board','final-board','release-board']));window.mockPad={id:'QA controller',index:0,connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>({pressed:i===0,value:i===0?1:0}))};navigator.getGamepads=()=>mockPad.connected?[mockPad]:[];});
  await p.goto('http://127.0.0.1:4187/');await p.waitForFunction(()=>window.__padMenuTest&&window.render_game_to_text);
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),mode=()=>p.evaluate(()=>__padMenuTest.state.mode);
  const buttons=async values=>{await p.evaluate(values=>mockPad.buttons.forEach((b,i)=>{b.pressed=values.includes(i);b.value=b.pressed?1:0;}),values);await tick(17);};
  const tap=async i=>{await buttons([i]);await buttons([]);};
  const go=async selector=>{for(let i=0;i<80;i++){if(await p.evaluate(s=>document.activeElement?.matches(s),selector))return;await tap(13);}throw Error('Cannot focus '+selector);};
  await tick(200);assert.equal(await mode(),'gate');await buttons([]);await tap(0);assert.equal(await mode(),'intro');await tap(0);assert.equal(await mode(),'menu');
  checks.push('A held first connection cannot bypass the gate; fresh A presses reach intro and menu');
  await tap(13);await tap(0);assert.equal(await mode(),'settings');
  const volume=await p.evaluate(()=>__padMenuTest.state.volume);await tap(14);assert((await p.evaluate(()=>__padMenuTest.state.volume))<volume);
  // Navigate every existing canvas row without direct state changes.
  const count=await p.evaluate(()=>__padMenuTest.SETTINGS_ROWS.length),visited=[];
  for(let i=0;i<count;i++){
   const row=await p.evaluate(()=>{const t=__padMenuTest;return {id:t.SETTINGS_ROWS[t.state.settingsIndex].id,...t.settingsRowGeometry(t.state.settingsIndex)};});assert(row.visible);visited.push(row.id);await tap(13);
  }
  assert.equal(new Set(visited).size,count);await tap(3);assert.equal(await p.evaluate(()=>__padMenuTest.state.settingsPage),'bindings');await tap(13);await tap(1);assert.equal(await p.evaluate(()=>__padMenuTest.state.settingsPage),'mix');await tap(1);assert.equal(await mode(),'menu');
  checks.push(`All ${count} canvas settings rows are reachable with visible selection; sliders respond to controller adjustment`);
  await tap(2);assert(await p.locator('#controls-dialog').evaluate(e=>e.open));await go('#clear-navigation');await tap(0);assert(await p.locator('#clear-navigation').isChecked());
  const slider='[data-spatial="mouse"]';await go(slider);const before=Number(await p.locator(slider).inputValue());await tap(15);assert(Number(await p.locator(slider).inputValue())>before);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await go('#clear-navigation');await tick(17);assert.equal(await p.locator('#clear-navigation').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
   const r=await p.locator('#clear-navigation').boundingBox();assert(r.y>=0&&r.y+r.height<=height);await p.screenshot({path:`${out}/comfort-${width}.png`});
  }
  await tap(1);assert(!(await p.locator('#controls-dialog').evaluate(e=>e.open)));assert.equal(await mode(),'menu');
  await tap(3);assert(await p.locator('#study-dialog').evaluate(e=>e.open));await go('[data-section="journal"]');await tap(0);assert(await p.locator('#study-journal').isVisible());
  await go('#study-notes article:last-child');const note=await p.locator('#study-notes article:last-child').boundingBox();assert(note.y>=0&&note.y+note.height<=844);await p.screenshot({path:out+'/journal-390.png'});
  await tap(1);assert(!(await p.locator('#study-dialog').evaluate(e=>e.open)));
  checks.push('X opens comfort and Y opens journal; shared DOM focus, checkbox, slider, tab and Back work at four sizes');
  await p.setViewportSize({width:1280,height:720});
  // Return from settings leaves menu index 1. Select Begin and skip the prologue
  // through its real controller action; its complete art sequence has separate QA.
  await tap(12);await tap(0);assert.equal(await mode(),'opening_story');await tap(1);
  await p.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:120000});
  for(let i=0;i<20&&await mode()!=='first_hole';i++)await tick(100);
  assert.equal(await mode(),'first_hole');await tap(0);
  await p.waitForFunction(()=>!window.RCScene3D?.isPreparing(),null,{timeout:120000});
  await buttons([]);await p.evaluate(()=>mockPad.axes=[0,-1,0,0]);await tick(250);const elapsed=await p.evaluate(()=>__padMenuTest.state.hole.elapsed);
  await p.evaluate(()=>mockPad.connected=false);await tick(17);assert.equal(await mode(),'paused');await tick(500);assert.equal(await p.evaluate(()=>__padMenuTest.state.hole.elapsed),elapsed);
  await p.evaluate(()=>{mockPad.connected=true;mockPad.axes=[0,0,0,0];mockPad.buttons[0]={pressed:true,value:1};});await tick(200);assert.equal(await mode(),'paused');
  await buttons([]);await tap(0);assert.equal(await mode(),'first_hole');await tap(9);assert.equal(await mode(),'paused');
  await tap(2);assert(await p.locator('#controls-dialog').evaluate(e=>e.open));await tap(9);assert(!(await p.locator('#controls-dialog').evaluate(e=>e.open)));assert.equal(await mode(),'paused');
  await tap(3);await tap(1);assert.equal(await mode(),'paused');
  await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await tap(0);assert.equal(await mode(),'paused');
  await buttons([0]);await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await tick(100);assert.equal(await mode(),'paused');await buttons([]);
  checks.push('Background controller input cannot activate a paused menu; returning focus requires neutral input');
  await p.screenshot({path:out+'/paused-1280.png'});
  checks.push('Controller-only start/briefing/pause/resume work; disconnect freezes the round, held reconnect cannot resume, and dialog Start/Back cannot leak into gameplay');
  // Result fixture isolates navigation from the independently tested capture.
  await p.evaluate(()=>{const s=__padMenuTest.state;s.mode='defeat';s.time=3;s.resultIndex=0;});await buttons([]);await tap(0);assert.equal(await mode(),'first_hole');
  await tap(9);await tap(13);await tap(13);await tap(13);await tap(0);assert.equal(await mode(),'menu');
  checks.push('Defeat Retry and pause-menu Return to clubhouse work without a mouse; long journal notes scroll into focus');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,visited,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
