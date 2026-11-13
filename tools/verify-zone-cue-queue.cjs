const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/zone-cue-queue';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__zone={state,resetFirstHole,render,triggerZoneSetPiece,updateZoneSetPiece,zoneSetPiecePriority,enterCourseZone,NIGHT_ORDER_ACTIONS,activeInteractionPromptOwner,rebuildChoicePresentation};\n  window.advanceTime = (milliseconds) => {')}));
 const read=()=>p.evaluate(()=>({mode:__zone.state.mode,player:__zone.state.player,owner:__zone.activeInteractionPromptOwner(),choice:__zone.rebuildChoicePresentation(),quiet:__zone.state.hole.quietLog,zone:__zone.state.hole.zoneSetPiece,captions:__zone.state.hole.captions,horror:__zone.state.hole.horrorDirector.eventCount,joe:{...__zone.state.hole.joe}}));
 const step=dt=>p.evaluate(dt=>__zone.updateZoneSetPiece(dt),dt);
 const render=async()=>{await p.evaluate(()=>__zone.render());await p.evaluate(async()=>RCScene3D.whenPresented());};
 const reset=async(index=2)=>{await p.evaluate(i=>{const t=__zone,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,apparitions:false,guidedHints:false,inputMethod:'keyboard'});s.keys.clear();const h=s.hole;Object.assign(h,{tutorialVisible:false,elapsed:100,zoneIndex:i,messageTimer:0,zoneBannerTimer:0,hasLineOfSight:false,playerAudible:false,detection:0,travelDistance:0});h.practiceDrill.active=false;h.joeBarkTimer=0;h.captions=[];Object.assign(s.player,{x:0,y:[40,120,220,320,405,500,590,680][i],yaw:0,pitch:0});Object.assign(h.joe,{x:100,y:30,mode:'patrol',patrolPause:9999});Object.assign(h.tensionDirector,{accentCooldown:0,reliefSeconds:0,omen:null,pendingIntercept:null,silentStalk:null,coverAudit:null,encounterActive:false});h.horrorDirector.manifestation=null;h.horrorDirector.visualFlash=null;},index);await render();};
 const shot=async name=>{await render();await p.screenshot({path:out+'/'+name+'.png'});};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__zone);await reset();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
  // Exercise the real boundary handler as well as the cue queue. Previously a
  // second path bypassed all priority rules and directly altered Joe's alert.
  for(const index of [2,3,4,5]){
   await reset(index);await p.evaluate(index=>{const h=__zone.state.hole;h.zoneIndex=index-1;h.message='KEEP THE CURRENT ACTION';h.messageTimer=5;h.joe.alert=.03;},index);
   const before=await read();await p.evaluate(index=>__zone.enterCourseZone(index),index);
   const after=await read();assert.deepEqual(after.joe,before.joe);assert.deepEqual(after.captions,before.captions);
   assert.equal(await p.evaluate(()=>__zone.state.hole.message),'KEEP THE CURRENT ACTION');
   assert.equal(await p.evaluate(()=>__zone.state.hole.blackoutTimer),0);
   assert.equal(await p.evaluate(index=>__zone.state.hole.zoneVisits[index],index),1);
   await p.evaluate(index=>__zone.enterCourseZone(index),index);assert.equal(await p.evaluate(index=>__zone.state.hole.zoneVisits[index],index),1);
  }
  await reset(2);await p.evaluate(()=>{const h=__zone.state.hole;h.zoneIndex=1;Object.assign(__zone.state.player,{x:0,y:177.9,yaw:0});h.message='CHASE WARNING';h.messageTimer=5;});
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(17));await p.keyboard.up('w');
  assert.equal(await p.evaluate(()=>__zone.state.hole.zoneIndex),2);assert.equal(await p.evaluate(()=>__zone.state.hole.message),'CHASE WARNING');assert.equal(await p.evaluate(()=>__zone.state.hole.blackoutTimer),0);
  checks.push('Actual update crossing and four boundary handlers preserve current messages, captions and Joe alert; Water relay does not fire on arrival; visits remain once-only');
  for(const field of ['ballAim','quietLog','recovery','message','chase','firstSighting']){
   await reset();await p.evaluate(field=>{const h=__zone.state.hole;if(field==='ballAim')h.ballAim.active=true;if(field==='quietLog')h.quietLog={progress:0,duration:1.6};if(field==='recovery')h.tensionDirector.reliefSeconds=8;if(field==='message')h.messageTimer=3;if(field==='chase')h.joe.mode='chase';if(field==='firstSighting')h.engagement.experience.firstImpression.workRemaining=2;__zone.triggerZoneSetPiece(2);},field);
   const before=await read();await step(2);const after=await read();assert.equal(after.zone.active,null,field);assert(after.zone.queue.pending);assert.equal(after.zone.total,0);assert.equal(after.horror,before.horror);assert.deepEqual(after.joe,before.joe);assert.equal(after.captions.length,0);
  }
  checks.push('Aiming, quiet filing, recovery, important messages, chase and observed opening scenes defer zone effects without AI/caption/horror changes');
  await reset();await p.evaluate(()=>__zone.triggerZoneSetPiece(2));await step(.6);const beforePause=(await read()).zone;await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(1500));assert.deepEqual((await read()).zone,beforePause);await p.keyboard.press('Escape');await step(.7);let s=await read();assert.equal(s.zone.active,'submerged_lights');assert.equal(s.zone.total,1);assert.equal(await p.evaluate(()=>__zone.state.hole.blackoutTimer),4.2);assert.equal(s.horror,0);assert.equal(s.captions.at(-1).category,'world');await p.evaluate(()=>Object.assign(__zone.state.player,{yaw:-Math.PI/2,pitch:-.12}));await shot('water-accent');
  let fx=await p.evaluate(()=>RCScene3D.stats().effects.original);assert(fx.zone>0);assert.equal(fx.anchor.x,s.zone.anchor.x);assert.equal(fx.anchor.z,s.zone.anchor.z);
  for(const [width,height] of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('water-'+width);}
  await p.setViewportSize({width:2560,height:1600});
  await p.evaluate(()=>__zone.triggerZoneSetPiece(2));assert.equal((await read()).zone.queue.pending,null);
  await p.evaluate(()=>__zone.state.hole.joe.mode='chase');await step(.017);s=await read();assert.equal(s.zone.active,null);assert.equal(s.zone.cancelled,1);assert(!s.captions.some(c=>c.key.startsWith('zone_set_piece_')));await shot('danger-owns-scene');
  checks.push('Pause freezes queued time; stable clear interval starts one local event; chase retires that event and its caption without a global fog event');
  await reset();await p.evaluate(()=>{__zone.triggerZoneSetPiece(2);__zone.state.hole.elapsed+=25;});await step(2);assert.equal((await read()).zone.queue.lastDrop,'expired');
  await reset();await p.evaluate(()=>{__zone.triggerZoneSetPiece(2);__zone.state.hole.zoneIndex=3;});await step(2);assert.equal((await read()).zone.queue.lastDrop,'left_area');
  await reset(4);await p.evaluate(()=>{__zone.triggerZoneSetPiece(4);__zone.updateZoneSetPiece(1.3);const a=__zone.NIGHT_ORDER_ACTIONS[1];Object.assign(__zone.state.player,{x:a.x,y:a.y-9,yaw:0});});assert.equal((await read()).zone.active,'hedge_breach');await p.evaluate(()=>advanceTime(17));await p.keyboard.press('1');await p.evaluate(()=>advanceTime(17));assert.equal((await read()).zone.active,null);assert(await p.evaluate(()=>!!__zone.state.hole.quietLog));
  assert(!await p.evaluate(()=>__zone.state.hole.statusRequest.issued));await shot('quiet-filing-owns-scene');
  checks.push('Old events expire or drop after leaving; actual quiet-filing input takes over the Service Maze event without a remote request stealing Use');
  for(const reason of ['message','recovery']){
   await reset();await p.evaluate(()=>{__zone.triggerZoneSetPiece(2);__zone.updateZoneSetPiece(1.3);});
   await p.evaluate(reason=>{if(reason==='message')__zone.state.hole.messageTimer=3;else __zone.state.hole.tensionDirector.reliefSeconds=5;},reason);
   await step(.017);assert.equal((await read()).zone.active,null,reason);assert.equal((await read()).zone.cancelled,1,reason);
  }
  await reset(4);await p.evaluate(()=>advanceTime(17));assert(await p.evaluate(()=>__zone.state.hole.statusRequest.active),'Remote request still issues in clear space');
  await p.keyboard.press('e');await p.evaluate(()=>advanceTime(1300));assert(await p.evaluate(()=>__zone.state.hole.statusRequest.resolved),'Remote request can still be completed');
  checks.push('New important message/recovery interrupts scenery; a remote request in clear space still issues and resolves using actual Use input');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }catch(e){await shot('failure');fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,...await read()},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
