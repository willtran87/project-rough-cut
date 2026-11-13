const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 const contract={window:{}};vm.runInNewContext(fs.readFileSync('web/foundation.js','utf8'),contract);vm.runInNewContext(fs.readFileSync('web/quality-core.js','utf8'),contract);
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const ready=()=>p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await ready();await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 async function reset(){await p.evaluate(async()=>{__underGreen.clearInput();const {createRun}=await import('./under-green-sim.js');__underGreen.run=createRun();__underGreen.run.mode='playing';});await tick(0);}
 const near=(a,b)=>assert(Math.abs(a-b)<.00001,`${a} != ${b}`);
 async function walk(keys){await reset();for(const key of keys)await p.keyboard.down(key);await tick(500);for(const key of keys)await p.keyboard.up(key);return (await read()).player;}
 const unit=contract.window.RCFoundation.units,m=contract.window.RCQuality.scale.meters;
 for(const [keys,speed]of [[['w'],unit.walk],[['w','Shift'],unit.sprint],[['w','c'],unit.crouch],[['w','r','Shift'],unit.listen]])near((await walk(keys)).y-5,speed*m*.5);
 let pos=await walk(['ArrowRight']);near(pos.x,unit.walk*m*.5);near(pos.yaw,0);
 pos=await walk(['w','d']);near(Math.hypot(pos.x,pos.y-5),unit.walk*m*.5);
 const stopped={...pos};await tick(500);pos=(await read()).player;near(pos.x,stopped.x);near(pos.y,stopped.y);
 checks.push('Level 1 walk/run/crouch/listen speeds, arrow strafe, diagonal normalization, immediate stop');
 await reset();await p.keyboard.down('c');await tick(500);near((await read()).player.eyeHeight,contract.window.RCQuality.stanceHeight(1.65,true,.5));await p.screenshot({path:'output/under-green/controls-crouch-2560.png'});await p.keyboard.up('c');await tick(500);assert((await read()).player.eyeHeight>1.64);
 checks.push('Level 1 crouch eye transition');
 await reset();await p.locator('#game').click({position:{x:1280,y:800}});await p.waitForFunction(()=>document.pointerLockElement?.id==='game');await p.mouse.move(1280,760,{steps:4});await tick(100);assert((await read()).player.pitch>0);await p.screenshot({path:'output/under-green/controls-mouse-up-2560.png'});await p.mouse.move(1280,840,{steps:8});await tick(100);assert((await read()).player.pitch<0);
 await reset();await p.keyboard.down('q');await p.keyboard.down('w');await p.mouse.move(1400,700,{steps:4});await tick(500);pos=(await read()).player;near(pos.yaw,0);near(pos.pitch,0);near(pos.y,5+unit.walk*m*.5);assert(Math.abs(pos.rearAngle)>3);await p.keyboard.up('w');await p.keyboard.up('q');await tick(600);pos=(await read()).player;near(pos.yaw,0);near(pos.pitch,0);assert(Math.abs(pos.rearAngle)<.001);
 checks.push('Real pointer-lock mouse up/down non-inverted; rear glance preserves travel heading and discards queued look');
 await p.evaluate(()=>document.exitPointerLock());
 async function pad(axes,buttons=[]){await p.evaluate(({axes,buttons})=>{navigator.getGamepads=()=>[{connected:true,axes,buttons:Array.from({length:16},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))}];},{axes,buttons});}
 await reset();await pad([0,-.1,0,0]);await tick(500);near((await read()).player.y,5);
 await pad([0,-.61,0,0]);await tick(500);near((await read()).player.y-5,unit.walk*m*.25);
 await reset();await pad([0,-1,0,0],[7]);await tick(500);near((await read()).player.y-5,unit.sprint*m*.5);
 await reset();await pad([0,-1,0,0],[4]);await tick(500);near((await read()).player.y-5,unit.crouch*m*.5);
 await p.evaluate(()=>navigator.getGamepads=()=>[]);checks.push('Controller radial deadzone, proportional movement, RT sprint and LB crouch');
 await reset();await p.setViewportSize({width:390,height:844});
 for(const key of ['forward','sprint'])await p.locator(`[data-key=${key}]`).dispatchEvent('pointerdown',{pointerType:'touch',pointerId:key==='forward'?2:3});
 await tick(500);near((await read()).player.y-5,unit.sprint*m*.5);
 for(const key of ['forward','sprint'])await p.locator(`[data-key=${key}]`).dispatchEvent('pointerup',{pointerType:'touch',pointerId:key==='forward'?2:3});
 assert(await p.evaluate(()=>document.getElementById('caption').getBoundingClientRect().bottom<document.querySelector('[data-key=sprint]').getBoundingClientRect().top));await p.screenshot({path:'output/under-green/controls-touch-run-390.png'});checks.push('Touch run matches keyboard speed');
 await p.evaluate(()=>{localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:{move_up:'KeyI',sprint:'KeyT'}}));localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({mouse:1.2,fov:77,invertVertical:true}));});
 await p.reload();await ready();await tick(0);await p.click('#primary');await reset();await p.keyboard.down('i');await p.keyboard.down('t');await tick(500);await p.keyboard.up('i');await p.keyboard.up('t');near((await read()).player.y-5,unit.sprint*m*.5);near((await read()).comfort.sensitivity,.0025*1.2**2);near((await read()).comfort.fov,77);
 checks.push('Saved Level 1 movement bindings, sensitivity and field of view carry across');
 assert.deepEqual(errors,[]);fs.writeFileSync('output/under-green/controls.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
