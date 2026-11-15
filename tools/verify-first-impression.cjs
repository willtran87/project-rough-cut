const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/first-impression';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__firstGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures});'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__first={state,resetFirstHole,render,updateFirstImpression,updateJoe,lineBlockerBetween,TEE_ANOMALY};\n  window.advanceTime = (milliseconds) => {')}));
 const read=()=>p.evaluate(()=>{const h=__first.state.hole;return {first:h.engagement.experience.firstImpression,joe:{x:h.joe.x,y:h.joe.y,mode:h.joe.mode},player:{...__first.state.player},pose:RCScene3D.stats().joeModel,anomaly:RCScene3D.stats().teeAnomaly,events:h.engagement.events};});
 async function reset(){await p.evaluate(()=>{const t=__first;t.resetFirstHole();Object.assign(t.state,{mode:'first_hole',manualTime:true,transitionAlpha:0});t.state.hole.tutorialVisible=false;t.render();});}
 async function shot(name){await p.evaluate(()=>__first.render());await p.evaluate(async()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/'+name+'.png'});}
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__first);await reset();
  await p.waitForFunction(()=>{__first.render();return RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready;},null,{timeout:120000});
  const prepared=await p.evaluate(()=>__firstGpu());
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(4000));await p.keyboard.up('w');
  let s=await read();assert(s.first.workRemaining>0,JSON.stringify(s.first));assert.equal(s.joe.mode,'patrol');assert.equal(s.player.yaw,0);await shot('first-joe-2560');
  const stopped=s.joe;await p.evaluate(()=>advanceTime(300));s=await read();assert.equal(s.joe.x,stopped.x);assert.equal(s.joe.y,stopped.y);
  await p.keyboard.press('Escape');const frozen=(await read()).first.workRemaining;await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).first.workRemaining,frozen);await p.keyboard.press('Escape');
  await p.keyboard.down('Shift');await p.keyboard.down('w');await p.evaluate(()=>advanceTime(1100));await p.keyboard.up('w');await p.keyboard.up('Shift');s=await read();
  assert.equal(s.first.workOutcome,'interrupted_by_evidence',JSON.stringify(s));assert(s.joe.x!==stopped.x||s.joe.y!==stopped.y);assert.equal(s.events.filter(e=>e.type==='joe_first_sighting').length,1);await shot('joe-reacts');
  checks.push('Actual W approach observes distant Joe, he tends his patch briefly, pause freezes him, approaching sprint interrupts with ordinary perception, camera remains free');
  await reset();await p.evaluate(()=>{const t=__first,s=t.state,h=s.hole;Object.assign(s.player,{x:-6,y:36,yaw:Math.atan2((-34+6)*.72,52-36),pitch:-.22});h.elapsed=10;h.practiceDrill.active=false;h.interactionPromptOwner=null;h.prompt='';h.messageTimer=0;h.tensionDirector.accentCooldown=h.tensionDirector.reliefSeconds=0;h.hasLineOfSight=false;h.playerAudible=false;h.detection=0;t.render();});
  await p.evaluate(()=>__first.updateFirstImpression(.5));s=await read();assert.equal(s.first.anomaly,'rising',JSON.stringify(s));
  await p.evaluate(()=>__first.updateFirstImpression(2.7));await shot('impossible-ball-2560');s=await read();assert(s.anomaly.visible);assert(Math.abs(s.anomaly.position[1]-.645)<.001);
  assert.deepEqual(await p.evaluate(()=>__firstGpu()),prepared,'First appearances reuse prepared resources');
  await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).first.anomalyAge,s.first.anomalyAge);await p.keyboard.press('Escape');
  const unchanged=await p.evaluate(()=>({balls:__first.state.hole.golfBalls,joe:{...__first.state.hole.joe},yaw:__first.state.player.yaw}));
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('impossible-ball-'+width);}
  await p.evaluate(()=>__first.state.reducedMotion=true);await shot('impossible-ball-reduced');
  await p.evaluate(()=>__first.updateFirstImpression(.3));await shot('impossible-ball-reduced-later');assert.equal((await read()).anomaly.position[1],s.anomaly.position[1]);
  assert.deepEqual(await p.evaluate(()=>({balls:__first.state.hole.golfBalls,joe:{...__first.state.hole.joe},yaw:__first.state.player.yaw})),unchanged);
  await p.evaluate(()=>{__first.state.hole.ballAim.active=true;__first.updateFirstImpression(.1);});await shot('impossible-ball-yields');assert.equal((await read()).anomaly.visible,false);assert.equal((await read()).first.anomaly,'spent');
  checks.push('Observed tee anomaly rises without camera/inventory/AI changes, Reduced Motion keeps it still, aiming cancels it permanently');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,prepared,errors},null,2));console.log(JSON.stringify({passed:true,checks,prepared,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
