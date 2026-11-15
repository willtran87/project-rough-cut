const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const base='http://127.0.0.1:4187',key='rough-cut.settings.v1',out='output/on-foot-keyboard-scope';
const baseline=process.argv.includes('--legacy-baseline');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const context=await browser.newContext({viewport:{width:2560,height:1600}}),p=await context.newPage(),errors=[],checks=[],views=[];
  p.on('pageerror',e=>errors.push(e.message));
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  const visit=async chapter=>{await p.goto(`${base}/${chapter}.html?test`);await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);};
  const edit=(action,code)=>p.locator(`[data-binding=${action}]`).selectOption(code);
  const saved=()=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  await visit('under-green');
  await p.evaluate(async key=>{const {CONTROL_PROFILES}=await import('./control-profiles.js');localStorage.setItem(key,JSON.stringify({keyboardBindings:{...CONTROL_PROFILES.onFoot,focus:'KeyQ',look_back:'KeyR',interact:'Enter'},chaseKeyboardBindings:{...CONTROL_PROFILES.chase,brake:'KeyB'},extension:{keep:42}}));},key);
  await visit('under-green');await p.locator('#comfort summary').click();
  assert.equal(await p.locator('[data-binding=interact]').inputValue(),'KeyE');
  await edit('move_up','KeyI');
  const legacy=await saved();
  if(baseline){assert.equal(legacy.keyboardBindings.interact,'Enter');fs.writeFileSync(out+'/legacy-baseline.json',JSON.stringify({legacy,errors},null,2));console.log('Reproduced: first edit resurrects legacy Enter binding');return;}
  assert.equal(legacy.keyboardBindings.interact,'KeyE');assert.equal(legacy.keyboardBindingsVersion,3);
  checks.push('Legacy full-default migration survives first unrelated edit');
  await p.locator('[data-keyboard-reset]').click();
  const beforeFailure=await saved();
  await p.evaluate(()=>{window.rejectBindings=true;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='rough-cut.settings.v1'&&window.rejectBindings&&JSON.parse(v).keyboardBindingsVersion===3)throw new DOMException('Fixture failure','QuotaExceededError');return set.call(this,k,v);};});
  await edit('interact','Enter');assert.match(await p.locator('[data-keyboard-status]').innerText(),/session.*storage is unavailable/);assert.deepEqual(await saved(),beforeFailure);assert.match(await p.locator('#control-guide').innerText(),/Enter uses/);
  // A peer updates unrelated profile fields while this editor has pending work.
  const peer=await context.newPage();await peer.route('**/keyboard-peer',r=>r.fulfill({contentType:'text/html',body:'<title>Keyboard peer fixture</title>'}));await peer.goto(base+'/keyboard-peer');
  await peer.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.keyboardBindings.chip='KeyB';s.keyboardBindings.controls='KeyG';s.extension.peer=true;s.volume=.37;localStorage.setItem(key,JSON.stringify(s));},key);await peer.close();
  await p.evaluate(()=>window.rejectBindings=false);await edit('move_up','KeyI');
  let record=await saved();assert.equal(record.keyboardBindings.interact,'Enter');assert.equal(record.keyboardBindings.chip,'KeyB');assert.equal(record.keyboardBindings.controls,'KeyG');assert.equal(record.keyboardBindingsVersion,3);assert.equal(record.volume,.37);assert(record.extension.peer);assert.equal(record.chaseKeyboardBindings.brake,'KeyB');
  assert.match(await p.locator('[data-keyboard-status]').innerText(),/On-foot keyboard controls saved/);
  for(const [action,code]of [['move_left','KeyJ'],['move_down','KeyK'],['move_right','KeyL']])await edit(action,code);
  assert.match(await p.locator('#control-guide').innerText(),/I \/ J \/ K \/ L/);
  // Reject a stale panel choice taken by another tab, without overwriting it.
  const conflict=await context.newPage();await conflict.route('**/keyboard-peer',r=>r.fulfill({contentType:'text/html',body:'<title>Conflict fixture</title>'}));await conflict.goto(base+'/keyboard-peer');
  await conflict.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.keyboardBindings.chip='KeyT';localStorage.setItem(key,JSON.stringify(s));},key);await conflict.close();
  await edit('focus','KeyT');assert.match(await p.locator('[data-keyboard-status]').innerText(),/assigned elsewhere/);assert.equal((await saved()).keyboardBindings.focus,'KeyR');
  checks.push('Atomic versioned write; honest failure; pending recovery; peer fields and separate chase profile preserved; conflicts rejected');
  await visit('under-green');await p.locator('#comfort summary').click();assert.equal(await p.locator('[data-binding]').count(),9);assert.equal(await p.locator('[data-binding=interact]').inputValue(),'Enter');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.locator('#keyboard').evaluate(e=>e.scrollIntoView({block:'start'}));await p.screenshot({path:`${out}/editor-${width}.png`});
   const bounds=await p.locator('[data-binding]').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,height:r.height};}));assert(bounds.every(r=>r.x>=0&&r.right<=width&&r.height>=44));
   await p.locator('[data-keyboard-reset]').evaluate(e=>e.scrollIntoView({block:'center'}));const reset=await p.locator('[data-keyboard-reset]').boundingBox();assert(reset.y>=0&&reset.y+reset.height<=height&&reset.height>=44,JSON.stringify({width,height,reset}));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`${out}/editor-bottom-${width}.png`});views.push({width,height,bounds,reset});
  }
  await p.setViewportSize({width:2560,height:1600});await p.locator('#primary').click();
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),{LEVER}=await import('./under-green-course.js');const r=createRun(1);r.mode='playing';Object.assign(r.player,{x:LEVER.x-1.7,y:LEVER.y,yaw:Math.PI/2,pitch:0});Object.assign(r.joe,{phase:'search',x:0,y:5,last:{x:0,y:5}});__underGreen.run=r;__underGreen.clearInput();});await tick(0);
  assert.match(await p.locator('#use').innerText(),/^Enter/);await p.keyboard.press('e');await tick(17);assert(!(await p.evaluate(()=>__underGreen.run.bypass)));await p.keyboard.press('Enter');await tick(17);assert(await p.evaluate(()=>__underGreen.run.bypass));
  await p.screenshot({path:out+'/under-green-enter-use-2560.png'});checks.push('UG editor at four viewport sizes; Enter prompt and real pump action; old E inactive');
  await visit('final-cut');assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).bindings.interact),'Enter');await p.locator('#primary').click();
  await p.evaluate(()=>Object.assign(__finalCut.run.player,{x:8.5,y:38,yaw:Math.atan2(-.5,1)}));await tick(0);assert.match(await p.locator('#use').innerText(),/^Enter/);await p.keyboard.press('e');await tick(17);assert(!(await p.evaluate(()=>__finalCut.run.pump)));await p.keyboard.press('Enter');await tick(17);assert(await p.evaluate(()=>__finalCut.run.pump));checks.push('Final Cut inherits intentional Enter; real pump input and prompt agree');
  await p.addInitScript(()=>localStorage.setItem('rough-cut.level-one-opening.v1','{"skip":true}'));
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__bindingTest={state,resetFirstHole,NIGHT_ORDER_ACTIONS,courseInteractionPromptPresentation};\n  window.advanceTime = (milliseconds) => {')}));
  await p.goto(base+'/index.html?test');await p.waitForFunction(()=>window.__bindingTest&&window.roughCutRebuild,null,{timeout:90000});await p.locator('#game').click();await p.keyboard.press('Space');
  await p.evaluate(()=>{const t=__bindingTest;t.resetFirstHole();const s=t.state,h=s.hole,a=t.NIGHT_ORDER_ACTIONS[0];s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.freeLook=true;h.tutorialVisible=false;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;h.joe.x=100;h.joe.y=690;h.joe.patrolPause=9999;Object.assign(s.player,{x:a.x,y:a.y-8,yaw:0,pitch:-.1});});await tick(17);
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:90000});
  assert.match(await p.evaluate(()=>__bindingTest.courseInteractionPromptPresentation().text),/^ENTER/i);
  await p.keyboard.press('e');await tick(17);assert(!(await p.evaluate(()=>__bindingTest.state.hole.nightOrderActionsCompleted.includes(__bindingTest.NIGHT_ORDER_ACTIONS[0].id))));await p.keyboard.press('Enter');await tick(17);assert(await p.evaluate(()=>__bindingTest.state.hole.nightOrderActionsCompleted.includes(__bindingTest.NIGHT_ORDER_ACTIONS[0].id)));checks.push('Level 1 inherits Enter; real bell input and prompt agree');
  await visit('under-green');await p.locator('#comfort summary').click();await p.locator('[data-keyboard-reset]').click();record=await saved();assert.equal(record.keyboardBindings.interact,'KeyE');assert.equal(record.keyboardBindings.chip,'Space');assert.equal(record.keyboardBindings.controls,'KeyH');assert.equal(record.chaseKeyboardBindings.brake,'KeyB');assert.equal(record.volume,.37);checks.push('Explicit on-foot reset includes hidden ball/guide actions and preserves chase/settings');
  await p.evaluate(()=>{window.bindingPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[bindingPad];});await tick(17);
  await p.locator('[data-binding=interact]').focus();await p.evaluate(()=>bindingPad.buttons[15]={pressed:true,value:1});await tick(17);await p.evaluate(()=>bindingPad.buttons[15]={pressed:false,value:0});await tick(17);
  assert.notEqual(await p.locator('[data-binding=interact]').inputValue(),'KeyE');assert.equal(await p.evaluate(()=>__underGreen.run.mode),'briefing');
  await p.locator('[data-keyboard-reset]').focus();await p.evaluate(()=>bindingPad.buttons[0]={pressed:true,value:1});await tick(17);await p.evaluate(()=>bindingPad.buttons[0]={pressed:false,value:0});await tick(17);assert.equal(await p.locator('[data-binding=interact]').inputValue(),'KeyE');
  await p.evaluate(()=>navigator.getGamepads=()=>[]);await tick(17);await p.locator('#primary').focus();await p.keyboard.press('Enter');await tick(17);assert.equal(await p.evaluate(()=>__underGreen.run.mode),'playing');checks.push('Controller adjusts/selects editor controls without starting play; Enter still activates focused menu button');
  // Touch contexts expose the actual compact UI, not just a resized desktop.
  for(const [width,height]of [[844,390],[390,844]]){
   const tc=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true}),t=await tc.newPage();t.on('pageerror',e=>errors.push(e.message));await t.goto(base+'/under-green.html?test');await t.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await t.evaluate(()=>advanceTime(0));await t.locator('#comfort summary').tap();await t.locator('#keyboard legend').scrollIntoViewIfNeeded();await t.screenshot({path:`${out}/touch-editor-${width}.png`});await t.locator('[data-binding=interact]').selectOption('KeyT');assert.match(await t.locator('#control-guide').innerText(),/T uses/);await t.locator('[data-keyboard-reset]').tap();assert.equal(await t.locator('[data-binding=interact]').inputValue(),'KeyE');await tc.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
