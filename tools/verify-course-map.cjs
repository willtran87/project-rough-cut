const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
// Night Order's course map was removed as a player option (COURSE_MAP_ENABLED=false in web/game.js).
// This verifier asserts that it stays unreachable: no HUD button, no toggle, and the former map key pauses.
(async()=>{
 const software=process.argv.includes('--software'),out='output/course-map/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:1280,height:720},hasTouch:true}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/game.js','utf8');assert(/const COURSE_MAP_ENABLED = false;/.test(source),'The course map must stay disabled');
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__map={state,resetFirstHole,render,toggleCourseMap};\n  window.advanceTime = (milliseconds) => {')}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),draw=()=>p.evaluate(async()=>{__map.render();await RCScene3D.whenPresented();});
 const read=()=>p.evaluate(()=>({mode:__map.state.mode,open:!!__map.state.hole.mapOpen,panel:!!document.querySelector('#course-map')?.offsetParent,button:[...document.querySelectorAll('.q-map')].some(e=>e.offsetParent)}));
 const place=async()=>{await p.evaluate(()=>{const t=__map,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x:0,y:40,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:200,mode:'patrol',patrolPause:9999});});await tick(17);};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__map&&window.roughCutRebuild);await p.keyboard.press('Enter');
  await place();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});await place();await draw();
  assert.deepEqual(await read(),{mode:'first_hole',open:false,panel:false,button:false});await p.screenshot({path:out+'/no-map-1280.png'});checks.push('Gameplay HUD shows no Map button and no map panel');
  await p.evaluate(()=>{__map.toggleCourseMap();roughCutRebuild.toggleMap?.();});await tick(17);await draw();assert.deepEqual(await read(),{mode:'first_hole',open:false,panel:false,button:false});checks.push('Map toggle is a no-op');
  await p.keyboard.press('h');await tick(17);await draw();assert.deepEqual(await read(),{mode:'paused',open:false,panel:false,button:false});checks.push('The controls key pauses instead of opening the map');
  await p.keyboard.press('Escape');await tick(17);assert.equal((await read()).mode,'first_hole');
  await p.evaluate(()=>{window.mapPad={connected:true,id:'Map verification',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[mapPad];});await tick(34);await p.evaluate(()=>mapPad.buttons[3]={pressed:true,value:1});await tick(17);await p.evaluate(()=>mapPad.buttons[3]={pressed:false,value:0});await tick(17);await draw();
  assert(!(await read()).open&&!(await read()).panel);await p.evaluate(()=>navigator.getGamepads=()=>[]);checks.push('Controller Y does not open the map');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,checks,errors},null,2));console.log(JSON.stringify({passed:true,software,checks,errors}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,state:await read().catch(()=>null),errors},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
