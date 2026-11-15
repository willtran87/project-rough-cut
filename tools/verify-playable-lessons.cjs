const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/playable-lessons';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__lesson={state,resetFirstHole,render,practicalLessonPresentation,updateExperienceEvidence,syncLessonInputDevice,replayPracticalLessons,readSavedPreferences,turnCamera,tiltCamera,getPlayerEnvironmentState};\n  window.advanceTime = (milliseconds) => {')}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
 const render=async()=>{await p.evaluate(()=>__lesson.render());await p.evaluate(async()=>RCScene3D.whenPresented());};
 const read=()=>p.evaluate(()=>{const s=__lesson.state,h=s.hole;return {learned:{...s.learnedControls},lesson:__lesson.practicalLessonPresentation(),player:{...s.player},notes:[...h.engagement.notes],practice:h.practiceDrill.active,owner:h.interactionPromptOwner,cover:h.environment?.hardCover,rough:h.environment?.effectiveRough,message:h.message,progress:h.coverPracticeSeconds,guards:{messageTimer:h.messageTimer,joe:h.joe.mode,los:h.hasLineOfSight,detection:h.detection,blocked:h.blockedTimer,close:h.engagement.closeEscape.remaining,map:h.mapOpen}};});
 const shot=async n=>{await render();await p.screenshot({path:out+'/'+n+'.png'});};
 const reset=async()=>{await p.evaluate(()=>{const t=__lesson,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,apparitions:false,guidedHints:true,learnedControls:{},learnedControlsByDevice:{},lessonInputMethod:null,inputMethod:'keyboard',crouchToggle:false});s.keys.clear();const h=s.hole;Object.assign(h,{tutorialVisible:false,messageTimer:0,zoneBannerTimer:0,elapsed:0});h.practiceDrill.active=true;Object.assign(s.player,{x:0,y:0,yaw:0,pitch:0});Object.assign(h.joe,{x:100,y:240,patrolPause:9999});t.syncLessonInputDevice();});await tick(17);await render();};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__lesson);await reset();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});await render();assert.equal((await read()).lesson.id,'move');await shot('move-2560');
  await p.keyboard.down('w');await tick(400);await p.keyboard.up('w');assert((await read()).learned.move);assert.equal((await read()).lesson.id,'look');
  await p.evaluate(()=>{__lesson.state.hole.rebuild.observedJoe=true;__lesson.updateExperienceEvidence(.017);});assert(!(await read()).learned.look);
  for(let i=0;i<14;i++){await p.dispatchEvent('#game','pointermove',{pointerType:'mouse',buttons:1,movementX:20,movementY:0});await tick(34);}assert((await read()).learned.look);checks.push('Actual walk and mouse turn teach movement/look; seeing Joe alone does not');
  await reset();for(let i=0;i<14;i++){await p.dispatchEvent('#game','pointermove',{pointerType:'mouse',buttons:1,movementX:0,movementY:20});await tick(34);}assert((await read()).learned.look,'Vertical look counts');
  await reset();await p.evaluate(()=>Object.assign(__lesson.state.learnedControls,{move:true,look:true}));
  // Reach the board through real movement; the old teleported pose was inside
  // the opening hedge and produced a misleading obstructed screenshot.
  await p.keyboard.down('w');
  for(let i=0;i<50;i++){
   const d=await p.evaluate(()=>{const s=__lesson.state,dx=(-40-s.player.x)*.72,dy=44-s.player.y;s.player.yaw=Math.atan2(dx,dy);return Math.hypot(dx,dy);});
   if(d<1.8)break;await tick(100);
  }
  await p.keyboard.up('w');await p.evaluate(()=>{const s=__lesson.state;s.player.yaw=Math.atan2((-54-s.player.x)*.72,48-s.player.y);});
  await tick(17);assert.equal((await read()).owner.targetId,'course-sign');assert((await read()).practice);const joe=await p.evaluate(()=>JSON.stringify(__lesson.state.hole.joe));await p.keyboard.press('e');assert.equal(await p.evaluate(()=>JSON.stringify(__lesson.state.hole.joe)),joe);await tick(17);let s=await read();assert(s.notes.includes('course-sign'));assert(s.learned.interact);assert(s.practice);assert.equal(s.lesson,null);await shot('quiet-welcome');assert.match(await p.locator('.q-context').innerText(),/WELCOME POLICY/);checks.push('Welcome board remains usable during optional golf practice, teaches real Use and preserves its quiet consequence');
  await reset();await p.keyboard.press('e');await tick(17);assert(!(await read()).learned.interact,'Invalid Use is not learning evidence');
  await reset();await p.evaluate(()=>{const s=__lesson.state;Object.assign(s.learnedControls,{move:true,look:true,interact:true,chip:true});Object.assign(s.player,{x:20,y:100,yaw:.3,pitch:0});Object.assign(s.hole.joe,{x:86,y:148,mode:'patrol',patrolPause:9999});s.hole.practiceDrill.active=false;});await tick(3600);s=await read();assert(s.cover);assert.equal(s.lesson.id,'cover');await shot('cover-2560');
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('cover-'+width);assert.match(await p.locator('.q-context').innerText(),/cover blocks Joe/);}
  await p.setViewportSize({width:2560,height:1600});await p.keyboard.down('c');await tick(300);assert(!(await read()).learned.cover);await p.keyboard.press('Escape');const frozen=(await read()).progress;await tick(1000);assert.equal((await read()).progress,frozen);await p.keyboard.press('Escape');await p.keyboard.down('c');await tick(700);await p.keyboard.up('c');s=await read();assert(s.learned.cover);assert.match(s.message,/SOLID COVER/);await shot('cover-learned');checks.push('Sustained actual crouch behind solid cover teaches concealment; pause freezes it and feedback distinguishes solid cover');
  const persisted=await p.evaluate(()=>__lesson.readSavedPreferences());assert(persisted.learnedControlsByDevice.keyboard.cover);
  await p.evaluate(()=>{__lesson.state.inputMethod='gamepad';__lesson.state.hole.messageTimer=0;__lesson.syncLessonInputDevice();});assert(!(await read()).learned.cover);assert.equal((await read()).lesson?.id,'move');
  await p.evaluate(()=>{__lesson.state.inputMethod='keyboard';__lesson.syncLessonInputDevice();});assert((await read()).learned.cover);
  await p.evaluate(()=>{__lesson.replayPracticalLessons();__lesson.state.hole.messageTimer=0;});assert(!(await read()).learned.cover);checks.push('Learning persists per device, device change does not borrow mastery, replay clears it');
  for(const reason of ['danger','message','disabled']){await reset();await p.evaluate(reason=>{const s=__lesson.state;if(reason==='danger')s.hole.joe.mode='chase';if(reason==='message')s.hole.messageTimer=3;if(reason==='disabled')s.guidedHints=false;},reason);assert.equal((await read()).lesson,null,reason);}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }catch(e){await shot('failure');fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,...await read()},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

