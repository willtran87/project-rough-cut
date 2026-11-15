const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/spatial-settings';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],checks=[],views=[];
 try{
  const context=await browser.newContext({viewport:{width:2560,height:1600}}),p=await context.newPage();
  p.on('pageerror',e=>errors.push(e.message));
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  async function visit(path='under-green.html?test'){
   await p.goto('http://127.0.0.1:4187/'+path);
   await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);
  }
  async function settings(){
   if((await read()).mode==='under_green_playing')await p.keyboard.press('Escape');
   if(!(await p.locator('#comfort').evaluate(e=>e.open)))await p.locator('#comfort summary').click();
  }
  async function set(id,value){await settings();const input=p.locator('#'+id);if(typeof value==='boolean')await input.setChecked(value);else await input.fill(String(value));await tick(0);}
  async function reset(){
   await p.evaluate(async()=>{navigator.getGamepads=()=>[];__underGreen.clearInput();const {createRun}=await import('./under-green-sim.js');__underGreen.run=createRun();__underGreen.run.mode='playing';});await tick(0);
  }
  const near=(a,b,tolerance=.00001)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);
  await visit();await settings();
  assert.equal(await p.locator('#sensitivity').inputValue(),'1');
  for(const [id,value,key]of [['field-of-view',72,'fov'],['sensitivity',1.5,'mouse'],['controller-sensitivity',1.75,'controller'],['touch-sensitivity',.75,'touch']]){
   await set(id,value);assert.equal((await read()).spatial[key],value);
  }
  near((await read()).comfort.sensitivity,.0025*1.5**2);assert.equal((await read()).graphics.camera.fov,72);
  assert.equal(await p.locator('[data-spatial-output="mouse"]').innerText(),'1.50×');
  await p.evaluate(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({...JSON.parse(localStorage.getItem('rough-cut.spatial.v1')),extension:'keep',controller:1.3,invertVertical:true})));
  await set('field-of-view',74);assert.equal((await read()).spatial.controller,1.3);
  assert.equal(await p.locator('#controller-sensitivity').inputValue(),'1.3');
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.spatial.v1')).extension),'keep');
  checks.push('Live camera FOV and normalized multipliers; latest unrelated/known fields merge and UI resynchronizes');

  // Compare actual integrated mouse/touch/controller response, with fresh poses.
  async function mouseResponse(gain){
   await set('sensitivity',gain);await reset();
   await p.locator('#game').dispatchEvent('pointerdown',{pointerType:'mouse',pointerId:9,clientX:100,clientY:100});
   await p.locator('#game').dispatchEvent('pointermove',{pointerType:'mouse',pointerId:9,clientX:102,clientY:98});
   await p.locator('#game').dispatchEvent('pointerup',{pointerType:'mouse',pointerId:9});await tick(200);return (await read()).player;
  }
  const mouse1=await mouseResponse(1),mouse2=await mouseResponse(2);near(mouse2.yaw/mouse1.yaw,4,.001);assert(mouse1.pitch>0&&mouse2.pitch>0);
  async function touchResponse(gain){
   await set('touch-sensitivity',gain);await reset();
   await p.locator('#game').dispatchEvent('pointerdown',{pointerType:'touch',pointerId:10,clientX:100,clientY:100});
   await p.locator('#game').dispatchEvent('pointermove',{pointerType:'touch',pointerId:10,clientX:120,clientY:80});
   await p.locator('#game').dispatchEvent('pointerup',{pointerType:'touch',pointerId:10});await tick(17);return (await read()).player;
  }
  const touch1=await touchResponse(1),touch2=await touchResponse(2);near(touch2.yaw/touch1.yaw,2,.001);assert(touch2.pitch>0);
  async function padResponse(gain){
   await set('controller-sensitivity',gain);await reset();
   await p.evaluate(()=>{window.settingsPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[settingsPad];});await tick(17);
   await p.evaluate(()=>settingsPad.axes=[0,0,.8,-.8]);await tick(100);const player=(await read()).player;
   await p.evaluate(()=>navigator.getGamepads=()=>[]);return player;
  }
  const pad1=await padResponse(1),pad2=await padResponse(2);near(pad2.yaw/pad1.yaw,2,.001);assert(pad2.pitch>0);
  checks.push('Actual mouse response follows Level 1 squared gain; touch/controller linear gains update live; vertical look remains normal despite saved inversion');

  await set('crouch-toggle',true);await reset();await p.keyboard.press('c');await p.keyboard.down('w');await tick(500);await p.keyboard.up('w');near((await read()).player.y-5,1.2);
  await p.keyboard.press('c');await p.keyboard.down('w');await tick(500);await p.keyboard.up('w');near((await read()).player.y-6.2,1.92);
  await set('sprint-toggle',true);await reset();await p.keyboard.press('Shift');await p.keyboard.down('w');await tick(500);await p.keyboard.up('w');near((await read()).player.y-5,3.04);
  await p.keyboard.press('Escape');await p.click('#primary');await p.keyboard.down('w');await tick(500);await p.keyboard.up('w');near((await read()).player.y-8.04,1.92);
  for(const [button,speed]of [[4,2.4],[7,6.08]]){
   await reset();await p.evaluate(()=>{window.settingsPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[settingsPad];});await tick(16);
   await p.evaluate(i=>settingsPad.buttons[i]={pressed:true,value:1},button);await tick(16);
   await p.evaluate(i=>{settingsPad.buttons[i]={pressed:false,value:0};settingsPad.axes[1]=-1;},button);await tick(500);near((await read()).player.y-5,speed*.5);
   await p.evaluate(()=>navigator.getGamepads=()=>[]);
  }
  await set('movement-ramp',true);await reset();await p.keyboard.down('w');await tick(16);const ramp=(await read()).player;assert(ramp.y>5&&ramp.y<5+3.84*.017);
  await p.keyboard.up('w');await tick(200);near((await read()).player.y,ramp.y);
  await set('movement-ramp',false);await set('camera-bob',.5);await reset();await p.keyboard.down('w');await tick(500);await p.keyboard.up('w');let state=await read();assert(Math.abs(state.graphics.camera.height-state.player.eyeHeight)>.001);
  await set('reduced',true);await p.click('#primary');await p.keyboard.down('w');await tick(500);await p.keyboard.up('w');state=await read();near(state.graphics.camera.height,state.player.eyeHeight);
  checks.push('Keyboard and controller crouch/sprint toggles change actual speed; pause clears sprint latch; optional ramp stops immediately; reduced motion suppresses actual camera bob');

  // Exercise saved values through the Level 1 adapter and back into this chapter.
  await p.goto('http://127.0.0.1:4187/');await p.waitForFunction(()=>window.RCSpatialControls);
  assert.equal(await p.evaluate(()=>RCSpatialControls.get().fov),74);
  assert.equal(await p.evaluate(()=>RCFoundation.readComfort().cameraBob),.5);
  await p.locator('[data-spatial="fov"]').evaluate(e=>{e.value='67';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await p.evaluate(()=>RCSpatialControls.set('mouse',1.25));assert.equal(await p.locator('[data-spatial="mouse"]').inputValue(),'1.25');
  await visit();assert.equal((await read()).graphics.camera.fov,67);near((await read()).comfort.sensitivity,.0025*1.25**2);
  assert.equal((await read()).movementPreferences.sprintToggle,true);assert.equal((await read()).spatial.invertVertical,false);
  checks.push('Level 1 adapter consumes saved settings; UI writes and canvas-service writes sync; return/reload carries FOV, gain and comfort');

  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await settings();await p.locator('.on-foot-settings').scrollIntoViewIfNeeded();await tick(0);
   const bounds=await p.locator('.on-foot-settings').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width+.5);
   await p.screenshot({path:`${out}/settings-${width}.png`});
   for(const selector of ['#field-of-view','#sensitivity','#controller-sensitivity','#touch-sensitivity','#camera-bob','#crouch-toggle','#sprint-toggle','#movement-ramp']){
    await p.locator(selector).focus();const r=await p.locator(selector).boundingBox();assert(r.x>=0&&r.x+r.width<=width+.5&&r.y>=0&&r.y+r.height<=height+.5,JSON.stringify({selector,width,r}));
   }
   await p.screenshot({path:`${out}/focus-${width}.png`});views.push({width,height,bounds});
  }
  checks.push('All new settings visible or focus-scrollable inside four supported viewport widths');

  // Storage denial must keep the session playable and the visible setting effective.
  await p.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('blocked for QA');};});
  await set('sensitivity',1.6);near((await read()).comfort.sensitivity,.0025*1.6**2);assert.match(await p.locator('#spatial-settings-status').innerText(),/this session/);
  await set('camera-bob',.3);assert.equal((await read()).comfort.cameraBob,.3);
  await reset();await p.keyboard.down('w');await tick(500);await p.keyboard.up('w');assert((await read()).player.y>5);
  checks.push('Denied storage retains effective session settings, explains persistence failure and permits play');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
