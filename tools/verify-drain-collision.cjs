const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const baseline=process.argv.includes('--baseline'),software=process.argv.includes('--software'),out='output/drain-collision/'+(baseline?'baseline':software?'software':'final');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],walks=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__drain={actions:NIGHT_ORDER_ACTIONS,state,resetFirstHole,render,COURSE_OBSTACLES,obstacleAtPosition,planJoeRoute,moveJoeToward,updateJoeMowerEffects,joeObstacleOnSegment,worldDistance};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__drainScene=()=>({world,camera,drainGate,exitMechanisms,pixelWorld});\n'}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),draw=()=>p.evaluate(async()=>{__drain.render();await RCScene3D.whenPresented();});
 const reset=async x=>{await p.evaluate(x=>{const t=__drain,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x,y:680,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:20,effectLastX:100,effectLastY:20,mode:'patrol',patrolPause:9999});},x);await tick(17);await draw();};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__drain);await p.locator('#game').click();await reset(-78);await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});
  await reset(-78);await p.screenshot({path:out+'/approach-2560.png'});
  for(const [name,x]of [['grate',-78],['west-stone',-78-1.37/.1152],['east-stone',-78+1.37/.1152],['east-bypass',-58]]){
   await reset(x);await p.keyboard.down('w');await tick(1400);await p.keyboard.up('w');await draw();const s=await p.evaluate(()=>{const t=__drain,h=t.state.hole;return {player:{...t.state.player},mode:t.state.mode,blocker:h.environment?.nearestObstacle?.id,failed:JSON.parse(render_game_to_text()).readiness.failedIds};});walks.push({name,...s});if(name==='grate'){const view=await p.evaluate(async()=>{const {Raycaster,Vector2,Box3}=await import('./vendor/three/three.module.js'),g=__drainScene(),ray=new Raycaster();g.world.updateMatrixWorld(true);ray.setFromCamera(new Vector2(),g.camera);return {camera:g.camera.position.toArray(),gate:g.drainGate.position.toArray(),hits:ray.intersectObjects(g.world.children,true).slice(0,6).map(h=>({distance:h.distance,name:h.object.name,ancestors:[h.object.parent?.name,h.object.parent?.parent?.name],bounds:new Box3().setFromObject(h.object),material:h.object.material.name}))};});fs.writeFileSync(out+'/view.json',JSON.stringify(view,null,2));if(!baseline)assert(view.hits.every(h=>h.distance>1),'Duplicate cover geometry blocks the drain view');}await p.screenshot({path:out+'/'+name+'.png'});
  }
  if(baseline){assert(walks.slice(0,3).every(s=>s.player.y>705));}
  else{assert(walks.slice(0,3).every(s=>s.player.y<700));assert(walks[3].player.y>705);}
  if(!baseline){
   await reset(-78);
   const ownership=await p.evaluate(async()=>{
    const {auditDrainCollisionArt}=await import('./drain-collision.js');
    const audit=()=>{const g=__drainScene();return auditDrainCollisionArt(__drain.COURSE_OBSTACLES,[...g.pixelWorld.stats().drainCollisionArt,...g.exitMechanisms.stats().collisionArt],RCQuality.scale);};
    const original=audit(),mutations=[],g=__drainScene(),stone=g.world.getObjectByName('drain-stone-west'),hoist=g.world.getObjectByName('DrainReleaseHoist'),foot=hoist.children.find(o=>o.isMesh);
    for(const [name,object]of [['gate',g.drainGate],['stone',stone],['feet',foot]]){
     const before=object.position.x;object.position.x+=.3;mutations.push({name,kind:'translated',failed:audit().filter(a=>!a.passed).map(a=>a.id)});object.position.x=before;
     object.visible=false;mutations.push({name,kind:'hidden',failed:audit().filter(a=>!a.passed).map(a=>a.id)});object.visible=true;
     const parent=object.parent;object.removeFromParent();mutations.push({name,kind:'detached',failed:audit().filter(a=>!a.passed).map(a=>a.id)});parent.add(object);
    }
    stone.geometry.translate(.3,0,0);mutations.push({name:'stone',kind:'edited vertices',failed:audit().filter(a=>!a.passed).map(a=>a.id)});stone.geometry.translate(-.3,0,0);
    return {original,mutations,restored:audit()};
   });
   assert.equal(ownership.original.length,5);assert(ownership.original.every(a=>a.passed),JSON.stringify(ownership.original));assert(ownership.mutations.every(m=>m.failed.length),JSON.stringify(ownership.mutations));assert(ownership.restored.every(a=>a.passed));
   fs.writeFileSync(out+'/ownership.json',JSON.stringify(ownership,null,2));checks.push('Five colliders match actual rendered vertices; transforms, hidden/detached owners and vertex edits fail the audit; restoration passes');
   for(const side of [-1,1]){await reset(-78+side*1.16/.1152);await p.keyboard.down('w');await tick(1400);await p.keyboard.up('w');assert(await p.evaluate(()=>__drain.state.player.y<700));}
   await reset(-78);await p.keyboard.down('c');await p.keyboard.down('w');await tick(4000);assert(await p.evaluate(()=>__drain.state.hole.crouched));await p.keyboard.up('w');await p.keyboard.up('c');assert(await p.evaluate(()=>__drain.state.player.y<700));
   const sides=[];for(const [name,x,key]of [['west',-106,'d'],['east',-58,'a']]){await reset(x);await p.evaluate(()=>{__drain.state.player.y=705;});await p.keyboard.down(key);await tick(1300);await p.keyboard.up(key);const end=await p.evaluate(()=>({...__drain.state.player}));sides.push({name,...end});if(name==='west')assert(end.x<-95&&end.x>-100);else assert(end.x>-61&&end.x<-59);}fs.writeFileSync(out+'/sides.json',JSON.stringify(sides,null,2));
   checks.push('Actual movement stops at grate, both shoulders and both hoist feet; crouching cannot bypass the grate; eastern passage remains open');
   await reset(-78);await p.keyboard.down('w');await tick(1400);await p.keyboard.up('w');await p.evaluate(()=>{__drain.state.player.pitch=-.35;});await p.keyboard.press('e');await tick(30);assert(await p.evaluate(()=>!__drain.state.hole.escapeFiling.active));
   await p.evaluate(()=>{const h=__drain.state.hole;h.keyCollected=h.drainUnlocked=true;h.nightOrderActionsCompleted=__drain.actions.map(a=>a.id);});
   await p.keyboard.down('w');await tick(100);await p.keyboard.up('w');assert.equal(await p.evaluate(()=>__drain.state.hole.blockedTimer),0);await draw();await p.screenshot({path:out+'/ready-contact-2560.png'});
   await p.keyboard.press('e');await tick(17);assert(await p.evaluate(()=>__drain.state.hole.escapeFiling.active));
   await tick(await p.evaluate(()=>{const f=__drain.state.hole.escapeFiling;return (f.duration-f.progress+f.sealDuration+.1)*1000;}));assert.equal(await p.evaluate(()=>__drain.state.mode),'victory');
   checks.push('Locked drain rejects actual Use; completed prerequisites replace retreat feedback with filing and allow victory from the reachable collision stopping point');
   await reset(-78);await p.keyboard.down('w');await tick(1400);await p.keyboard.up('w');
   await p.evaluate(()=>{__drain.state.player.pitch=-.6;});await draw();await p.screenshot({path:out+'/close-2560.png'});
   for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await draw();await p.screenshot({path:out+'/grate-'+width+'.png'});}
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,baseline,checks,walks,errors},null,2));console.log(JSON.stringify({passed:true,baseline,checks,walks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
