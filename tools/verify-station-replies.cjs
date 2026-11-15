const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/station-replies';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const marker='  window.advanceTime = (milliseconds) => {';
 const source=fs.readFileSync('web/game.js','utf8');assert(source.includes(marker));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace(marker,'  window.__replies={state,resetFirstHole,render,NIGHT_ORDER_ACTIONS,updateExperienceEncounters,ensureAudio,captureCourseCheckpoint,restoreCourseCheckpoint};\n'+marker).replace('  function playEncounterMechanism(kind,source) {','  function playEncounterMechanism(kind,source) {\n(window.__replySounds ||= []).push({kind,source:{x:source.x,y:source.y},at:state.hole.elapsed});')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__replyMeshes=()=>[...stations].map(([id,e])=>({id,page:e.mechanism?.page?.rotation.z,hood:e.mechanism?.hood?.rotation.x,stamp:e.moving.position.y,receipt:e.mechanism?.receipt?.visible}));window.__replyGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures});'}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
 const render=async()=>{await p.evaluate(()=>__replies.render());await p.evaluate(()=>RCScene3D.whenPresented());};
 const shot=async name=>{await render();await p.screenshot({path:out+'/'+name+'.png'});};
 const read=()=>p.evaluate(()=>{const s=__replies.state,h=s.hole,e=h.engagement.experience;return {mode:s.mode,elapsed:h.elapsed,player:{x:s.player.x,y:s.player.y},responses:e.stationResponses,queue:e.queue,sounds:window.__replySounds||[],meshes:__replyMeshes(),completed:h.nightOrderActionsCompleted,events:h.engagement.events.filter(e=>e.type==='objective_aftermath'),captions:h.captions.map(c=>c.text)};});
 // Advance only the environmental scheduler for deterministic interruption and
 // contact timing. Actual filing, retreat and Pause still use gameplay inputs.
 const step=async seconds=>{await p.evaluate(dt=>{const t=__replies;t.state.hole.elapsed+=dt;t.updateExperienceEncounters(dt);},seconds);await render();};
 const safe=()=>p.evaluate(()=>{const t=__replies,s=t.state,h=s.hole,e=h.engagement.experience;Object.assign(h.joe,{x:0,y:20,mode:'patrol',patrolPause:9999});Object.assign(h,{hasLineOfSight:false,detection:0,mapOpen:false,messageTimer:0,joeBarkTimer:0,prompt:'',interactionPromptOwner:null,captions:[]});h.ballAim.active=false;h.escapeFiling.sealing=false;h.zoneSetPiece.active=null;Object.assign(h.tensionDirector,{reliefSeconds:0,accentCooldown:0,pendingIntercept:null,silentStalk:null,coverAudit:null,omen:null});e.aftermathClearSeconds=0;e.arrival.phase='skipped';});
 async function complete(kind,reduced=false){
  const index=kind==='release'?2:1;
  await p.evaluate(({index,reduced})=>{const t=__replies,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:reduced});s.keys.clear();const h=s.hole;Object.assign(h,{tutorialVisible:false,elapsed:100,controlHintTimer:0,zoneBannerTimer:0});h.practiceDrill.active=false;h.engagement.experience.arrival.phase='skipped';Object.assign(h.joe,{x:100,y:30,patrolPause:9999});const a=t.NIGHT_ORDER_ACTIONS[index];Object.assign(s.player,{x:a.x,y:a.y-9,yaw:0,pitch:-.15});window.__replySounds=[];t.ensureAudio();},{index,reduced});
  await tick(17);await render();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&!RCScene3D.isPreparing(),null,{timeout:120000});await tick(17);await p.keyboard.press(kind==='release'?'e':kind==='quiet'?'1':'2');if(kind==='quiet')await tick(1634);
  const id=kind==='release'?'release-review':'field-log';assert((await read()).completed.includes(id));
  await p.keyboard.down('s');await tick(1200);await p.keyboard.up('s');
  let r=await read();const queued=r.queue.find(b=>b.id===id);assert(queued,'Action enqueues reply');assert(Math.hypot((r.player.x-queued.x)*.72,r.player.y-queued.y)>24,'Keyboard retreat clears station');
  await safe();await p.evaluate(()=>{const h=__replies.state.hole;h.elapsed=Math.max(h.elapsed,h.engagement.experience.queue[0].ready+.01);});
  return id;
 }
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__replies);await p.locator('#game').click();
  await complete('quiet');await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});const prepared=await p.evaluate(()=>__replyGpu());
  for(const kind of ['quiet','loud','release']){
   const id=await complete(kind);
   // Each blocked state retains the optional reply instead of overriding the
   // interaction, danger, caption or authored scene already in progress.
   for(const reason of ['chase','map','message','interaction','zone','sealing','tutorial','caption','accent','near']){
    await safe();const result=await p.evaluate(reason=>{const t=__replies,s=t.state,h=s.hole,e=h.engagement.experience,pos={x:s.player.x,y:s.player.y};e.aftermathClearSeconds=3;
     if(reason==='chase')h.joe.mode='chase';if(reason==='map')h.mapOpen=true;if(reason==='message')h.messageTimer=3;
     if(reason==='interaction'){h.prompt='TEST';h.interactionPromptOwner={prompt:'TEST',targetId:'test'};}
     if(reason==='zone')h.zoneSetPiece.active='test';if(reason==='sealing')h.escapeFiling.sealing=true;if(reason==='tutorial')h.tutorialVisible=true;
     if(reason==='caption')h.captions=[{text:'TEST',age:0,duration:3,category:'threat'}];if(reason==='accent')h.tensionDirector.accentCooldown=3;
     if(reason==='near')Object.assign(s.player,{x:e.queue[0].x,y:e.queue[0].y-9});
     const snapshot=()=>JSON.stringify({joe:h.joe,distraction:h.distraction,detection:h.detection,lastSeen:h.lastSeenPlayer,completed:h.nightOrderActionsCompleted});const before=snapshot();t.updateExperienceEncounters(.1);const after=snapshot();Object.assign(s.player,pos);h.tutorialVisible=false;
     return {before,after,count:e.stationResponses.length,queued:e.queue.length};},reason);
    assert.equal(result.count,0,kind+': '+reason);assert.equal(result.queued,1,reason);assert.equal(result.before,result.after,reason);
   }
   await safe();await step(1);assert.equal((await read()).responses.length,0,'Requires sustained clear interval');await step(1.05);
   let r=await read();assert.equal(r.responses.length,1);assert.equal(r.events.length,1);assert.equal(r.responses[0].id,id);assert.equal(r.queue.length,0);
   const expectedKind=kind==='quiet'?'field-log-page':id;
   assert.equal(r.sounds.length,kind==='quiet'?1:0);await shot(kind+'-retreat-start-2560');
   await step(.2);r=await read();const frozen=r.meshes;
   await p.keyboard.press('Escape');await tick(1300);await render();assert.equal((await read()).elapsed,r.elapsed);assert.deepEqual((await read()).meshes,frozen);assert.deepEqual((await read()).sounds,r.sounds);await p.keyboard.press('Escape');
   await step(.2);r=await read();const mesh=r.meshes.find(m=>m.id===id);
   if(kind==='quiet')assert(mesh.page>0&&mesh.page<Math.PI);else if(kind==='loud')assert(Math.abs(mesh.stamp-1.184)<1e-7);else assert(mesh.hood<0&&mesh.hood>-Math.PI/2);
   assert.equal(r.sounds.length,kind==='release'?0:1);
   // Detail observer uses a legal station approach after the retreat trigger.
   await p.evaluate(id=>{const t=__replies,a=t.NIGHT_ORDER_ACTIONS.find(a=>a.id===id);Object.assign(t.state.player,{x:a.x,y:a.y-9,yaw:0,pitch:-.15});},id);await shot(kind+'-moving-2560');
   await render();assert.deepEqual((await read()).meshes,r.meshes,'Renders cannot advance mesh');
   if(kind==='release'){await step(.69);assert.equal((await read()).sounds.length,0);await step(.02);assert.equal((await read()).sounds.length,1);}else await step(.81);
   await step(.5);r=await read();const settled=r.meshes.find(m=>m.id===id);
   if(kind==='quiet')assert.equal(settled.page,Math.PI);else if(kind==='loud')assert.equal(settled.stamp,1.32);else {assert.equal(settled.hood,-Math.PI/2);assert(settled.receipt);}
   assert.equal(r.sounds.length,1);assert.equal(r.sounds[0].kind,expectedKind);assert.deepEqual(r.sounds[0].source,{x:r.responses[0].x,y:r.responses[0].y});assert(r.responses[0].sounded);
   await shot(kind+'-settled-2560');for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot(kind+'-settled-'+width);}await p.setViewportSize({width:2560,height:1600});
   await p.evaluate(()=>{const t=__replies,s=t.state;window.__stationCheckpoint=t.captureCourseCheckpoint(s.hole,s.player,s.player.yaw);s.hole.elapsed+=40;s.hole.engagement.experience.stationResponses=[];t.restoreCourseCheckpoint(s.hole,s.player,__stationCheckpoint);});await render();assert.deepEqual((await read()).meshes,r.meshes);await step(2);assert.equal((await read()).sounds.length,1);assert.equal((await read()).events.length,1);
   samples.push({kind,settled,sound:r.sounds[0],startedAt:r.responses[0].startedAt});
  }
  checks.push('Real filing and keyboard retreat enqueue quiet-page, loud-stamp and release-hood replies; ten interruption conditions defer each without altering Joe or completed actions');
  checks.push('Actual mesh transforms follow contact timing, freeze with Pause and repeated renders, settle once, and survive checkpoint restore without replaying sound');
  for(const kind of ['quiet','loud','release']){const id=await complete(kind,true);await step(2.05);const r=await read(),mesh=r.meshes.find(m=>m.id===id);assert.equal(r.sounds.length,1);if(kind==='quiet')assert.equal(mesh.page,Math.PI);else if(kind==='loud')assert.equal(mesh.stamp,1.32);else assert.equal(mesh.hood,-Math.PI/2);}
  await p.evaluate(()=>{const t=__replies,s=t.state,cp=t.captureCourseCheckpoint(s.hole,s.player,s.player.yaw);delete cp.engagement.experience.stationResponses;t.restoreCourseCheckpoint(s.hole,s.player,cp);t.updateExperienceEncounters(.1);});await render();assert(Math.abs((await read()).meshes.find(m=>m.id==='release-review').hood)<1e-8);
  assert.deepEqual(await p.evaluate(()=>__replyGpu()),prepared);assert.deepEqual(errors,[]);
  checks.push('Reduced Motion presents immediate final results and sounds; legacy checkpoint without replies renders safely; no new GPU textures/programs during animation');
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,samples,prepared,errors},null,2));console.log(JSON.stringify({passed:true,checks,samples,prepared,errors}));
 }catch(e){await shot('failure');fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,state:await read(),errors},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
