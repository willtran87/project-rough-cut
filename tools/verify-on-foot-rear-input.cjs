const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/on-foot-rear-input',baseline=process.argv.includes('--baseline');
const near=(a,b,label)=>assert(Math.abs(a-b)<1e-5,`${label}: ${a} != ${b}`);
(async()=>{
 fs.mkdirSync(out,{recursive:true});if(baseline)assert(!fs.existsSync(out+'/baseline.json'));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const results=[],errors=[];
 try{
  for(const chapter of ['under-green','final-cut']){
   const context=await browser.newContext({viewport:{width:2560,height:1600}}),p=await context.newPage();
   p.on('pageerror',e=>errors.push(e.message));
   await p.addInitScript(()=>{window.rearPad={connected:true,index:0,id:'Rear QA',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[rearPad];});
   await p.goto(`http://127.0.0.1:4187/${chapter}.html?test`);
   await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
   await tick(0);await p.click('#primary');await tick(17);
   const reset=async()=>{
    await p.evaluate(async chapter=>{rearPad.axes=[0,0,0,0];rearPad.buttons.forEach(b=>{b.pressed=false;b.value=0;});const {createRun}=await import(`./${chapter}-sim.js`),r=createRun();r.mode='playing';if(chapter==='final-cut'){Object.assign(r.player,{x:16,y:8,yaw:0,pitch:0});__finalCut.run=r;}else{__underGreen.clearInput();__underGreen.run=r;}},chapter);await tick(17);
   };
   await reset();const start=(await read()).player;
   await p.evaluate(()=>{rearPad.axes=[0,-1,1,-1];rearPad.buttons[11]={pressed:true,value:1};});await tick(500);
   const rear=(await read()).player;
   await p.screenshot({path:`${out}/${chapter}-${baseline?'baseline':'final'}-rear-2560.png`});
   await p.evaluate(()=>{rearPad.axes=[0,0,0,0];rearPad.buttons[11]={pressed:false,value:0};});await tick(700);const returned=(await read()).player;
   results.push({chapter,case:'controller rear+movement+look',start,rear,returned});
   if(!baseline){near(rear.yaw,start.yaw,'rear heading');near(rear.pitch,start.pitch,'rear pitch');near(rear.x,start.x,'rear strafe');near(rear.y-start.y,1.92,'rear forward');near(returned.yaw,start.yaw,'returned heading');near(returned.pitch,start.pitch,'no queued look');assert(Math.abs(returned.rearAngle)<.001);}
   await p.evaluate(()=>rearPad.axes=[0,0,.7,-.7]);await tick(100);const normal=(await read()).player;
   assert(normal.yaw>returned.yaw);assert(chapter==='final-cut'?normal.pitch<returned.pitch:normal.pitch>returned.pitch);
   await reset();await p.locator('#game').click({position:{x:1280,y:800}});await p.waitForFunction(()=>document.pointerLockElement?.id==='game');
   await p.keyboard.down('r');await p.keyboard.down('w');await p.mouse.move(1420,700,{steps:4});await tick(500);const mouseRear=(await read()).player;
   await p.keyboard.up('w');await p.keyboard.up('r');await tick(700);const mouseReturned=(await read()).player;
   results.push({chapter,case:'mouse rear+movement',mouseRear,mouseReturned});
   if(!baseline){near(mouseRear.yaw,0,'mouse rear heading');near(mouseRear.pitch,0,'mouse rear pitch');near(mouseReturned.yaw,0,'mouse returned heading');near(mouseReturned.pitch,0,'mouse queued look');}
   // A mouse event queued before the controller takes over must not steer it.
   await reset();await p.mouse.move(1500,650,{steps:1});
   await p.evaluate(()=>rearPad.axes=[0,-1,0,0]);await tick(100);const switchedMouse=(await read()).player;
   if(!baseline){near(switchedMouse.yaw,0,'queued mouse yaw discarded');near(switchedMouse.pitch,0,'queued mouse pitch discarded');}
   results.push({chapter,case:'queued mouse to controller',player:switchedMouse});
   await p.evaluate(()=>document.exitPointerLock());await context.close();

   // Real concurrent touch contacts, then controller input while the finger remains down.
   const tc=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),t=await tc.newPage();t.on('pageerror',e=>errors.push(e.message));
   await t.addInitScript(()=>{window.rearPad={connected:true,index:0,id:'Rear QA',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[rearPad];});
   await t.goto(`http://127.0.0.1:4187/${chapter}.html?test`);await t.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await t.evaluate(()=>advanceTime(0));await t.locator('#primary').tap();
   await t.evaluate(async chapter=>{const {createRun}=await import(`./${chapter}-sim.js`),r=createRun();r.mode='playing';if(chapter==='final-cut'){Object.assign(r.player,{x:16,y:8,yaw:0,pitch:0});__finalCut.run=r;}else{__underGreen.clearInput();__underGreen.run=r;}advanceTime(17);},chapter);
   const cdp=await tc.newCDPSession(t),contacts=new Map(),ttick=ms=>t.evaluate(ms=>advanceTime(ms),ms),tread=()=>t.evaluate(()=>JSON.parse(render_game_to_text()));
   const centre=async s=>{const r=await t.locator(s).boundingBox();assert(r,s);return {x:r.x+r.width/2,y:r.y+r.height/2};};
   const send=type=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[...contacts].map(([id,point])=>({id,...point}))});
   const down=async(id,point)=>{contacts.set(id,point);await send('touchStart');};
   await down(1,await centre('[data-key=rear]'));await down(2,await centre('[data-key=forward]'));await down(3,{x:420,y:180});
   contacts.set(3,{x:480,y:150});await send('touchMove');await ttick(500);const touchRear=await tread();
   await t.screenshot({path:`${out}/${chapter}-${baseline?'baseline':'final'}-touch-rear-844.png`});
   contacts.clear();await send('touchCancel');await ttick(700);const touchReturned=await tread();
   results.push({chapter,case:'touch rear+movement+look',rear:touchRear.player,returned:touchReturned.player});
   if(!baseline){near(touchRear.player.yaw,0,'touch rear heading');near(touchRear.player.pitch,0,'touch rear pitch');near(touchReturned.player.yaw,0,'touch returned heading');near(touchReturned.player.pitch,0,'touch returned pitch');near(touchReturned.player.speed,0,'touch cancel stops');}
   await down(1,await centre('[data-key=forward]'));await ttick(100);const beforeSwitch=await tread();
   await t.evaluate(()=>rearPad.axes=[.6,0,0,0]);await ttick(500);const switched=await tread();
   results.push({chapter,case:'touch to controller',before:beforeSwitch.player,after:switched.player,device:switched.inputMethod});
   if(!baseline){near(switched.player.y,beforeSwitch.player.y,'old touch movement cleared');assert(switched.player.x>beforeSwitch.player.x);assert.equal(switched.inputMethod,'gamepad');}
   contacts.clear();await send('touchCancel');await t.evaluate(()=>rearPad.axes=[0,0,0,0]);await ttick(100);
   await t.evaluate(()=>window.dispatchEvent(new Event('blur')));await ttick(100);assert((await tread()).mode.endsWith('_paused'));
   await t.evaluate(()=>window.dispatchEvent(new Event('focus')));await t.locator('#primary').tap();await ttick(100);near((await tread()).player.speed,0,'resume stopped');
   await tc.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${baseline?'baseline':'verified'}.json`,JSON.stringify({baseline,results,errors},null,2));console.log(JSON.stringify({baseline,cases:results.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
