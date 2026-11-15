const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/approach-strike',initial=JSON.parse(fs.readFileSync(`${out}/initial.json`));
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],cases=[],geometry=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  const reset=page=>page.evaluate(initial=>{__underGreen.run=structuredClone(initial);__underGreen.clearInput();__underGreen.run.player.yaw=Math.PI/2;__underGreen.run.message='The pump diversion is complete.';__underGreen.run.messageTime=5;advanceTime(0);},initial);
  const read=page=>page.evaluate(()=>JSON.parse(render_game_to_text()));
  const hold=async(page,key,ms)=>{await page.keyboard.down(key);await page.evaluate(ms=>advanceTime(ms),ms);await page.keyboard.up(key);};
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await reset(p);await hold(p,'w',250);
   assert.match(await p.locator('#caption').innerText(),/raises the trimmer/i);assert.equal(await p.locator('#caption').getAttribute('data-kind'),'danger');
   await p.screenshot({path:`${out}/windup-${width}.png`});
   if(width===2560)geometry.push(await p.evaluate(()=>__underGreen.inspectJoeGeometry()));
   await hold(p,'d',550);await hold(p,'w',2700);let state=await read(p);assert.equal(state.mode,'under_green_playing');assert(state.player.x>initial.joe.x+2);assert.equal(state.waterHits,0);
   await p.evaluate(()=>advanceTime(0));await p.screenshot({path:`${out}/passed-${width}.png`});cases.push({width,height,action:'keyboard-sidestep',mode:state.mode,player:state.player});
   await reset(p);await hold(p,'w',250);await p.evaluate(()=>advanceTime(3250));state=await read(p);assert.equal(state.mode,'under_green_playing');cases.push({width,height,action:'stop',mode:state.mode});
   await reset(p);await hold(p,'w',1600);state=await read(p);assert.equal(state.mode,'under_green_caught');cases.push({width,height,action:'ignore-windup',mode:state.mode,gap:state.joe.distance});
  }
  await p.setViewportSize({width:2560,height:1600});await reset(p);await hold(p,'w',250);const before=await read(p);await p.click('#pause');await p.evaluate(()=>advanceTime(500));assert.equal((await read(p)).joe.age,before.joe.age);await p.click('#primary');await p.evaluate(()=>advanceTime(100));const resumed=await read(p);assert.equal(resumed.player.x,before.player.x);assert.equal(resumed.player.y,before.player.y);cases.push({action:'pause-resume',mode:resumed.mode});
  // Inspect the new committed poses at their real encounter position.
  for(const age of [.25,.75,1.05,1.25,1.6,2.3]){await reset(p);await p.evaluate(ms=>advanceTime(ms),age*1000);geometry.push(await p.evaluate(()=>__underGreen.inspectJoeGeometry()));}
  await reset(p);const pad=async axes=>p.evaluate(axes=>{navigator.getGamepads=()=>[{connected:true,axes,buttons:Array.from({length:16},()=>({pressed:false,value:0}))}];},axes);
  await pad([0,0,0,0]);await p.evaluate(()=>advanceTime(20));await pad([0,-1,0,0]);await p.evaluate(()=>advanceTime(250));await pad([1,0,0,0]);await p.evaluate(()=>advanceTime(550));await pad([0,-1,0,0]);await p.evaluate(()=>advanceTime(2700));await pad([0,0,0,0]);let state=await read(p);assert.equal(state.mode,'under_green_playing');assert(state.player.x>initial.joe.x+2);cases.push({action:'gamepad-api-sidestep',mode:state.mode});
  const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});touch.on('pageerror',e=>errors.push(e.message));await touch.goto('http://127.0.0.1:4187/under-green.html?test');await touch.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await touch.evaluate(()=>advanceTime(0));await touch.locator('#primary').tap();await reset(touch);
  const cdp=await touch.context().newCDPSession(touch);
  const touchHold=async(key,ms)=>{const box=await touch.locator(`[data-key="${key}"]`).boundingBox();assert(box);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2,id:1}]});await touch.evaluate(ms=>advanceTime(ms),ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  await touchHold('forward',250);assert.match(await touch.locator('#caption').innerText(),/raises the trimmer/i);await touch.screenshot({path:`${out}/windup-touch-390.png`});await touchHold('right',550);await touchHold('forward',2700);state=await read(touch);assert.equal(state.mode,'under_green_playing');assert(state.player.x>initial.joe.x+2);assert.equal(state.inputMethod,'touch');cases.push({action:'touch-sidestep',mode:state.mode});await touch.screenshot({path:`${out}/passed-touch-390.png`});
  fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:errors.length===0&&geometry.every(x=>!x.hits.length),cases,geometry,errors,limits:['Controller API and browser touch events are emulated, not physical-device qualification.','A recorded live-route encounter supplies the initial state; responses use ordinary input handlers.']},null,2));
  assert.deepEqual(errors,[]);assert(geometry.every(x=>!x.hits.length));console.log(JSON.stringify({passed:true,cases:cases.length,geometry:geometry.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
