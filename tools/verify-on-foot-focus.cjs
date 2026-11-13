const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/on-foot-focus';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],views=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   localStorage.setItem('rough-cut.level-one-opening.v1',JSON.stringify({seen:true,skip:true}));
   localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:{focus:'KeyZ'},keyboardBindingsVersion:2}));
  });
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__focusTest={state};\n  window.advanceTime = (milliseconds) => {')}));
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__focusTest&&window.roughCutRebuild,null,{timeout:90000});
  await p.keyboard.press('Enter');await p.keyboard.press('Space');await p.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:90000});
  await p.evaluate(()=>{__focusTest.state.manualTime=true;roughCutRebuild.startLab('calibration');__focusTest.state.hole.rebuild.lab=null;advanceTime(0);});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const l1before=await p.evaluate(()=>({...__focusTest.state.player}));
  await p.keyboard.down('z');await p.keyboard.down('w');await p.keyboard.down('Shift');await tick(500);
  const l1=await p.evaluate(()=>({player:{...__focusTest.state.player},focus:__focusTest.state.hole.focus}));
  assert(l1.focus);const l1metres=Math.hypot((l1.player.x-l1before.x)*.1152,(l1.player.y-l1before.y)*.16);assert(Math.abs(l1metres-1.2)<.03,JSON.stringify({l1metres}));
  for(const key of ['z','w','Shift'])await p.keyboard.up(key);await tick(17);assert(!await p.evaluate(()=>__focusTest.state.hole.focus));
  checks.push('Actual Level 1 remapped hold Focus overrides sprint at 2.4m/s and releases normally');
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await p.click('#primary');
  const reset=async()=>{await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');__underGreen.clearInput();__underGreen.run=createRun();__underGreen.run.mode='playing';advanceTime(0);});};
  await p.keyboard.down('q');await tick(17);assert(!(await read()).player.focus);await p.keyboard.up('q');
  await reset();for(const key of ['z','w','Shift'])await p.keyboard.down(key);await tick(500);let s=await read();assert(s.player.focus);assert(Math.abs(s.player.y-6.2)<.001);assert(await p.locator('#focus-state').isVisible());
  for(const key of ['z','w','Shift'])await p.keyboard.up(key);await tick(17);assert(!(await read()).player.focus);assert(await p.locator('#focus-state').isHidden());
  await p.keyboard.press('Escape');assert.match(await p.locator('#control-guide').textContent(),/Z listens/);await p.click('#primary');
  checks.push('The same remapped hold/release and sprint precedence work in Under the Green, with truthful guide and active-state feedback');
  await p.evaluate(()=>{window.focusPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[focusPad];});await tick(17);await reset();
  await p.evaluate(()=>{focusPad.axes[1]=-1;focusPad.buttons[6]={pressed:true,value:1};focusPad.buttons[7]={pressed:true,value:1};});await tick(500);s=await read();assert(s.player.focus);assert(Math.abs(s.player.y-6.2)<.001);
  await p.evaluate(()=>{focusPad.axes[1]=0;focusPad.buttons[6]={pressed:false,value:0};focusPad.buttons[7]={pressed:false,value:0};});await tick(17);assert(!(await read()).player.focus);await p.evaluate(()=>navigator.getGamepads=()=>[]);
  checks.push('Injected LT Focus overrides RT sprint and releases; physical-controller comfort remains untested');
  await p.evaluate(()=>{window.focusEvents=[];for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,e=>focusEvents.push({type,id:e.pointerId,key:e.target.dataset.key,kind:e.pointerType}));});
  const cdp=await p.context().newCDPSession(p),contacts=new Map();
  const send=type=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[...contacts].map(([id,point])=>({id,...point,radiusX:6,radiusY:6,force:1}))});
  const center=async selector=>{const r=await p.locator(selector).boundingBox();assert(r,selector);return {x:r.x+r.width/2,y:r.y+r.height/2};};
  const start=async(id,point)=>{contacts.set(id,point);await send('touchStart');},end=async id=>{const point=contacts.get(id);contacts.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:contacts.size?[{id,...point}]:[]});};
  await p.setViewportSize({width:390,height:844});await reset();await start(9,{x:230,y:350});await end(9);await tick(0);assert(await p.locator('[data-key=focus]').isVisible());
  await start(1,await center('[data-key=focus]'));await start(2,await center('[data-key=forward]'));await tick(500);s=await read();assert(s.player.focus);assert(Math.abs(s.player.y-6.2)<.001);assert.equal(await p.locator('[data-key=focus]').getAttribute('aria-pressed'),'true');
  await end(1);await tick(500);s=await read();assert(!s.player.focus,JSON.stringify(await p.evaluate(()=>({events:focusEvents,state:JSON.parse(render_game_to_text()).player}))));assert(Math.abs(s.player.y-8.12)<.001);await end(2);
  await start(1,await center('[data-key=focus]'));await tick(17);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});contacts.clear();await tick(17);assert(!(await read()).player.focus);
  checks.push('Actual touch hold + movement uses 2.4m/s; release restores walking while movement remains held; cancellation clears Focus');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await reset();await p.evaluate(()=>{__underGreen.run.player.y=19.5;__underGreen.run.time=3.8;advanceTime(0);});
   await start(1,await center('[data-key=focus]'));await tick(17);
   assert(await p.locator('#focus-state').isVisible());assert.equal(await p.locator('[data-key=focus]').getAttribute('aria-pressed'),'true');
   const bounds=await p.locator('#touch button').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();return {key:e.dataset.key,x:r.x,y:r.y,w:r.width,h:r.height};}));
   assert(bounds.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=width&&r.y+r.h<=height&&r.w>=44&&r.h>=44));
   const water=await p.locator('#water-read').boundingBox(),objective=await p.locator('#objective-card').boundingBox();
   assert(water&&objective);assert(objective.x+objective.width<=water.x||objective.y+objective.height<=water.y||water.x+water.width<=objective.x||water.y+water.height<=objective.y);
   await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/listening-${width}.png`});views.push({width,height,bounds});await end(1);await tick(17);
  }
  await start(1,await center('[data-key=focus]'));await tick(17);await p.evaluate(()=>window.dispatchEvent(new Event('blur')));contacts.clear();await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await tick(17);assert.equal((await read()).mode,'under_green_paused');assert(await p.locator('#focus-state').isHidden());await p.click('#primary');await tick(17);assert(!(await read()).player.focus);
  checks.push('Focus UI and five touch actions fit four viewports; blur/pause/resume cannot retain a held Listen input');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,l1metres,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
