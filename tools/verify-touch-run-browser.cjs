const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/touch-run',errors=[],checks=[];fs.mkdirSync(out,{recursive:true});
 try{
  const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),p=await context.newPage();
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__touchTest={state,render,TOUCH_CONTROLS,clearTouchInputs};\n  window.advanceTime = (milliseconds) => {')}));
  const cdp=await context.newCDPSession(p),contacts=new Map();
  const send=type=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[...contacts].map(([id,point])=>({id,...point,radiusX:6,radiusY:6,force:1}))});
  const start=async(id,point)=>{contacts.set(id,point);await send('touchStart');};
  // This Chromium endpoint releases the supplied contact on a partial end.
  // Sending the remaining contacts lifted the wrong finger in the Focus audit.
  const end=async id=>{const point=contacts.get(id);contacts.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:contacts.size?[{id,...point}]:[]});};
  const move=async(id,point)=>{contacts.set(id,point);await send('touchMove');};
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const center=async selector=>{const r=await p.locator(selector).boundingBox();assert(r,selector);return {x:r.x+r.width/2,y:r.y+r.height/2};};
  let chapter='under-green';
  const location=async name=>chapter==='under-green'?center(name==='pause'?'#pause':`[data-key=${name}]`):p.evaluate(name=>{
   const r=document.getElementById('game').getBoundingClientRect(),controls=__touchTest.TOUCH_CONTROLS,b=controls[name==='forward'?'move':name];
   return {x:r.left+(b.x+(b.width||0)/2)*r.width/1280,y:r.top+(b.y+(b.height||0)/2-(name==='forward'?b.radius-20:0))*r.height/720};
  },name);
  const tap=async name=>{await start(8,await location(name));await end(8);await tick(0);};
  const position=()=>p.evaluate(()=>window.__touchTest?{...__touchTest.state.player}:JSON.parse(render_game_to_text()).player);
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);
  await p.locator('#comfort summary').tap();await p.locator('#touch-run-toggle').check();assert(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.feel.v1')).touchSprintToggle));await p.locator('#primary').tap();await tick(0);
  for(const current of ['under-green','level-one']){
   chapter=current;
   if(chapter==='level-one'){
    await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__touchTest&&window.roughCutRebuild);
    await p.keyboard.press('Enter');await p.keyboard.press('Space');await p.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:90000});
    await p.evaluate(()=>{__touchTest.state.manualTime=true;roughCutRebuild.startLab('calibration');advanceTime(0);});
    await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
    assert(await p.evaluate(()=>roughCutRebuild.comfort().touchSprintToggle));
   }
   // Reveal touch controls using an actual touch on an unoccupied look area.
   const canvas=await p.locator('#game').boundingBox(),look={x:canvas.x+canvas.width*.65,y:canvas.y+canvas.height*.4};
   await start(9,look);await end(9);await tick(0);
   await tap('sprint');assert((await read()).touchRun.active);const idle=await position();await tick(200);const still=await position();assert.equal(still.x,idle.x);assert.equal(still.y,idle.y);
   await start(1,await location('forward'));await start(2,look);const before=await position();await tick(500);const after=await position();
   const metres=chapter==='level-one'?.16:1;assert(Math.abs((after.y-before.y)*metres-3.04)<.03,`${chapter} sprint displacement`);
   await move(2,{x:look.x+20,y:look.y-10});await tick(50);const turned=await position();assert(turned.yaw>after.yaw);assert(turned.pitch>after.pitch,'Touch vertical look remains normal');
   await end(2);await end(1);await tick(0);assert((await read()).touchRun.active,'Normal release and implicit capture loss retain Run');
   for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
    await p.setViewportSize({width,height});await tick(0);if(chapter==='level-one')await p.evaluate(()=>RCScene3D.whenPresented());
    if(chapter==='under-green')assert(await p.evaluate(()=>[...document.querySelectorAll('#touch button')].every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44;})),'Touch targets stay at least 44 CSS pixels');
    await p.screenshot({path:`${out}/${chapter}-run-${width}.png`});
   }
   await p.setViewportSize({width:844,height:390});await tick(0);
   // Cancelling a real movement contact clears speed selection and movement.
   await start(1,await location('forward'));contacts.clear();await send('touchCancel');await tick(0);assert(!(await read()).touchRun.active);
   const stopped=await position();await tick(200);assert.equal((await position()).x,stopped.x);assert.equal((await position()).y,stopped.y);
   await tap('sprint');assert((await read()).touchRun.active);await tap('pause');assert(!(await read()).touchRun.active);assert.match((await read()).mode,/paused/);
   if(chapter==='under-green')await p.locator('#primary').tap();else await p.keyboard.press('Enter');await tick(0);
   await tap('sprint');await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await tick(0);assert(!(await read()).touchRun.active);assert.match((await read()).mode,/paused/);
   checks.push(`${chapter}: one Run tap then two simultaneous real touch contacts move at 6.08 m/s and look normally; release, cancellation, pause and blur are safe; four viewports captured`);
  }
  // Change the shared option in Level 1's real comfort UI, then return to UG.
  await p.locator('#controls-launch').click();await p.locator('#controls-dialog [data-feel=touchSprintToggle]').uncheck();
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.feel.v1')).touchSprintToggle),false);
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);
  assert.equal((await read()).touchRun.toggle,false);await p.locator('#primary').tap();await tick(0);chapter='under-green';
  const area=await p.locator('#game').boundingBox();await start(9,{x:area.width*.6,y:area.height*.4});await end(9);await tick(0);
  await start(8,await location('sprint'));await tick(0);assert((await read()).touchRun.active);await end(8);await tick(0);assert(!(await read()).touchRun.active);
  checks.push('Shared option carries UG → Level 1 → UG through actual settings; default hold behavior remains available');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
