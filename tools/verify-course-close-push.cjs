const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/course-close-push';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__push={state,resetFirstHole,render,updateJoe,updateJoeMowerEffects,moveJoeToward,COURSE_OBSTACLES,joeObstacleOnSegment,updateAudio,ensureAudio,audio:()=>({motorGain,motorOscillator})};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__pushScene=()=>({joeModel,renderer});\n'}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),draw=()=>p.evaluate(async()=>{__push.render();await RCScene3D.whenPresented();});
 const read=()=>p.evaluate(()=>({mode:__push.state.mode,escape:{...__push.state.hole.engagement.closeEscape},joe:{x:__push.state.hole.joe.x,y:__push.state.hole.joe.y},player:{...__push.state.player},intent:RCScene3D.stats().joeModel?.intent,head:RCScene3D.stats().joeModel?.headRotation,handError:RCScene3D.stats().joeModel?.handError,body:RCScene3D.stats().joeModel?.pushPose}));
 const shot=async name=>{await draw();await p.screenshot({path:out+'/'+name+'.png'});};
 const reset=async()=>{await p.evaluate(()=>{const t=__push,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0,hasLineOfSight:true,detection:1,contactConfirmationSeconds:1});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';s.hole.statusRequest.issued=s.hole.statusRequest.resolved=true;Object.assign(s.player,{x:40,y:50,yaw:Math.PI,pitch:-.15});Object.assign(s.hole.joe,{x:40,y:40,effectLastX:40,effectLastY:40,effectHeading:Math.PI/2,mode:'chase',alert:1,reactionTimer:0,patrolPause:9999});});await tick(17);await draw();};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__push);await p.locator('#game').click();await reset();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await reset();
  await tick(150);await shot('warning-2560');const warning=await read();assert.equal(warning.escape.phase,'warning');assert.equal(warning.intent,'bracing');assert(warning.body.available&&warning.body.lean>.05);const target={...warning.escape.target};
  await p.keyboard.press('Escape');const paused=await read();await tick(1000);assert.deepEqual(await read(),paused);await p.keyboard.press('Escape');
  await p.keyboard.down('d');await tick(600);await p.keyboard.up('d');await p.evaluate(()=>{const s=__push.state;s.player.yaw=Math.atan2((s.hole.joe.x-s.player.x)*.72,s.hole.joe.y-s.player.y);});await shot('push-2560');const push=await read();assert.equal(push.mode,'first_hole');assert.equal(push.escape.phase,'push');assert.equal(push.intent,'committed-push');assert(push.body.lean>warning.body.lean);assert.deepEqual(push.escape.target,target);assert(Math.abs(push.player.x-40)>10);assert(Math.abs(push.joe.x-40)<.001);
  await tick(430);await shot('recovery-2560');const recovery=await read();assert.equal(recovery.mode,'first_hole');assert.equal(recovery.escape.phase,'recovery');assert.equal(recovery.intent,'recovering');assert.notDeepEqual(recovery.head,warning.head);assert([warning,push,recovery].every(s=>s.handError<.005));await tick(400);assert.deepEqual((await read()).joe,recovery.joe);assert.equal((await read()).escape.armed,false);
  await tick(650);assert.equal((await read()).escape.phase,'none');checks.push('Actual lateral dodge survives a committed line, with distinct bracing/push/recovery poses and a stationary recovery interval');
  const paths=[];
  for(const x of [-100,100]){await reset();paths.push(await p.evaluate(x=>{const t=__push,h=t.state.hole;Object.assign(t.state.player,{x,y:700});h.noise=0;const a=[];for(let i=0;i<105;i++){h.elapsed+=1/60;t.updateJoe(1/60);t.updateJoeMowerEffects(1/60);a.push({x:h.joe.x,y:h.joe.y,phase:h.engagement.closeEscape.phase,target:h.engagement.closeEscape.target});}return a;},x));}
  assert.deepEqual(paths[0],paths[1]);assert(paths[0].some(s=>s.phase==='push'&&s.y>40));checks.push('Hidden left/right relocation produces identical committed targets and Joe movement through recovery');
  await reset();await tick(450);await p.evaluate(()=>{const h=__push.state.hole;h.engagement.closeEscape.phase='push';h.engagement.closeEscape.remaining=0;h.engagement.closeEscape.target={x:-35,y:116};__push.moveJoeToward({x:100,y:700},40,1/60);});assert.equal((await read()).escape.phase,'recovery');assert.equal((await read()).joe.y,40);checks.push('Blocked push stops into recovery without routing through a wall');
  await reset();await p.evaluate(()=>{const h=__push.state.hole;h.distraction={kind:'appeal',x:100,y:600};h.distractionTimer=h.appealReviewTimer=4;});await tick(17);assert.equal((await read()).escape.phase,'none');assert.equal(await p.evaluate(()=>__push.state.hole.distraction.kind),'appeal');checks.push('A compelled appeal review cancels the commitment and preserves its distraction');
  await reset();await tick(900);assert.equal((await read()).mode,'defeat');checks.push('Standing in the committed path still results in normal capture');
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await reset();await tick(150);await shot('warning-'+width);}
  await p.evaluate(()=>{__push.state.reducedMotion=true;});await tick(100);await shot('warning-reduced');assert.equal((await read()).intent,'bracing');checks.push('Warning remains visible at four sizes and reduced motion preserves the attack information');
  const motor=await p.evaluate(()=>{__push.ensureAudio();const {motorGain,motorOscillator}=__push.audio(),g=motorGain.gain,f=motorOscillator.frequency,go=g.setTargetAtTime.bind(g),fo=f.setTargetAtTime.bind(f),rows=[];let gain,pitch;g.setTargetAtTime=(v,...args)=>{gain=v;return go(v,...args);};f.setTargetAtTime=(v,...args)=>{pitch=v;return fo(v,...args);};const e=__push.state.hole.engagement.closeEscape,prior={...e};for(const phase of ['none','warning','push','recovery']){e.phase=phase;e.age=.3;__push.updateAudio();rows.push({phase,gain,pitch});}Object.assign(e,prior);g.setTargetAtTime=go;f.setTargetAtTime=fo;return rows;});
  assert(motor[1].pitch>motor[0].pitch&&motor[2].pitch>motor[1].pitch&&motor[3].pitch<motor[0].pitch);assert(motor[1].gain>motor[0].gain&&motor[2].gain>motor[1].gain&&motor[3].gain<motor[0].gain);checks.push('Actual motor AudioParam targets rise through bracing/push and settle during recovery');
  const poseAudit=await p.evaluate(async()=>{
   const {createCoursePushPose}=await import('./course-push-pose.js'),{Vector3}=await import('./vendor/three/three.module.js');
   const root=__pushScene().joeModel.root,bones=new Map();root.traverse(o=>{if(o.isBone)bones.set(o.name,o);});
   const snapshot=()=>Object.fromEntries([...bones].map(([name,b])=>[name,{p:b.getWorldPosition(new Vector3()).toArray(),q:b.quaternion.toArray()}]));
   const before=snapshot(),pose=createCoursePushPose(root,bones),rows=[];
   let time=500;
   for(const phase of ['warning','push','recovery','none']){
    for(let i=0;i<20;i++){pose.restore();pose.update({time:time+=1/60,closeEscape:{phase}},1/60);}
    root.updateMatrixWorld(true);rows.push({phase,...pose.stats(),bones:snapshot()});
   }
   const frozen=snapshot();for(let i=0;i<40;i++){pose.restore();pose.update({time,paused:true,closeEscape:{phase:'none'}},0);root.updateMatrixWorld(true);}
   const repeated=snapshot();pose.restore();root.updateMatrixWorld(true);const restored=snapshot();
   return {before,rows,frozen,repeated,restored};
  });
  for(const row of poseAudit.rows){assert(row.gripError<.005);for(const name of ['FootL','FootR'])assert.deepEqual(row.bones[name].p,poseAudit.before[name].p);}
  assert.deepEqual(poseAudit.repeated,poseAudit.frozen);assert.deepEqual(poseAudit.restored,poseAudit.before);
  assert(Math.hypot(...poseAudit.rows[1].bones.Head.p.map((v,i)=>v-poseAudit.before.Head.p[i]))>.03);
  checks.push('Actual skeleton torso overlay moves the head, preserves both foot positions and grip, restores all bones and never accumulates on repeated paused presentation');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,warning,push,recovery,target,paths,motor,poseAudit,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,state:await read(),errors},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
