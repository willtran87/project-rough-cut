const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/dead-green';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__green={state,resetFirstHole,render,updateDeadGreen,triggerZoneSetPiece,OLD_FINISH};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__greenGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures});'}));
 const render=async()=>{await p.evaluate(()=>__green.render());await p.evaluate(async()=>RCScene3D.whenPresented());};
 const shot=async name=>{await render();await p.screenshot({path:out+'/'+name+'.png'});};
 const read=()=>p.evaluate(()=>({beat:__green.state.hole.engagement.experience.deadGreen,visual:RCScene3D.stats().deadGreen,relief:__green.state.hole.tensionDirector.reliefSeconds,events:__green.state.hole.engagement.events}));
 const reset=async()=>{await p.evaluate(()=>{const t=__green,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,apparitions:false});s.keys.clear();const h=s.hole;Object.assign(h,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0,hasLineOfSight:false,playerAudible:false,detection:0});h.practiceDrill.active=false;Object.assign(s.player,{x:0,y:445,yaw:0,pitch:0});Object.assign(h.joe,{x:100,y:30,mode:'patrol',patrolPause:9999});Object.assign(h.tensionDirector,{accentCooldown:0,reliefSeconds:0,omen:null,pendingIntercept:null,silentStalk:null,coverAudit:null});});await render();};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__green);await reset();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
  const gpu=await p.evaluate(()=>__greenGpu());await shot('approach-2560');
  await p.evaluate(()=>{__green.state.player.yaw=Math.PI;__green.updateDeadGreen(1);});assert.equal((await read()).beat.phase,'waiting');
  await p.evaluate(()=>{__green.state.player.yaw=0;__green.updateDeadGreen(.5);});assert.equal((await read()).beat.phase,'respite');assert((await read()).relief>=6);await shot('respite-2560');
  const retained=await p.evaluate(()=>{const h=__green.state.hole;h.nightOrderActionsCompleted=['audit-bell','field-log'];h.keyCollected=true;h.drainUnlocked=true;return {joe:{...h.joe},player:{...__green.state.player},checks:[...h.nightOrderActionsCompleted],key:h.keyCollected,valve:h.drainUnlocked};});
  await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(2000));assert.equal((await read()).beat.age,0);await p.keyboard.press('Escape');
  await p.evaluate(()=>__green.updateDeadGreen(4));assert.equal((await read()).beat.phase,'revealed');await p.evaluate(()=>__green.updateDeadGreen(.375));await shot('opening-notice');const mid=(await read()).visual.rotation;assert(mid<0&&mid>-Math.PI);
  await p.evaluate(()=>__green.updateDeadGreen(.4));await shot('notice-2560');assert(Math.abs((await read()).visual.rotation)<1e-8);
  const after=await p.evaluate(()=>{const h=__green.state.hole;return {joe:{...h.joe},player:{...__green.state.player},checks:[...h.nightOrderActionsCompleted],key:h.keyCollected,valve:h.drainUnlocked};});assert.deepEqual(after,retained);
  assert.equal((await read()).events.filter(e=>e.type==='old_finish_notice').length,1);
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('notice-'+width);}
  assert.deepEqual(await p.evaluate(()=>__greenGpu()),gpu);
  await reset();await p.evaluate(()=>{__green.updateDeadGreen(.5);__green.state.hole.joe.mode='chase';__green.updateDeadGreen(.1);__green.updateDeadGreen(1);});assert.equal((await read()).beat.phase,'revealed');assert(!(await read()).beat.announced);
  await reset();await p.evaluate(()=>{__green.state.reducedMotion=true;__green.updateDeadGreen(.5);__green.updateDeadGreen(4);});await render();assert(Math.abs((await read()).visual.rotation)<1e-8);
  await reset();const boundary=await p.evaluate(()=>{const h=__green.state.hole;const before=h.horrorDirector.eventCount;__green.triggerZoneSetPiece(5);return {active:h.zoneSetPiece.active,triggered:h.zoneSetPiece.triggered[5],before,after:h.horrorDirector.eventCount};});assert(boundary.triggered);assert.equal(boundary.active,null);assert.equal(boundary.before,boundary.after);
  // The decorative arch must leave the existing center passage traversable.
  await p.evaluate(()=>{__green.state.player.y=463;__green.state.hole.elapsed=100;});await p.keyboard.down('w');await p.evaluate(()=>advanceTime(2000));await p.keyboard.up('w');assert(await p.evaluate(()=>__green.state.player.y>485));
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,gpu,retained,boundary,errors},null,2));console.log(JSON.stringify({passed:true,gpu,boundary,errors}));
 }catch(e){await shot('failure');fs.writeFileSync(out+'/failure.json',JSON.stringify(await read(),null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
