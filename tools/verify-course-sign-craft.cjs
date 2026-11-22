const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const before=false,software=process.argv.includes('--software'),out=`output/level-one-sign-craft/${before?'before':'after'}-${software?'software':'native'}`;
 fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__signGame={state,resetFirstHole,render,actions:NIGHT_ORDER_ACTIONS};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__signScene=()=>({world,renderer,objectiveCues});'}));
 const draw=()=>p.evaluate(async()=>{__signGame.render();await RCScene3D.whenPresented();});
 const shot=async name=>{await draw();await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:91});};
 const position=async(x,y,tx,ty,pitch=0)=>{await p.evaluate(v=>Object.assign(__signGame.state.player,v),{x,y,yaw:Math.atan2((tx-x)*.72,ty-y),pitch});await draw();};
 const read=()=>p.evaluate(()=>{const {world,renderer}=__signScene(),r=world.getObjectByName('ObjectiveWayfinding'),m=r.getObjectByName('CourseSignFrames');return {cue:RCScene3D.stats().objectiveCues,body:{material:(Array.isArray(m.material)?m.material:[m.material]).map(m=>m.type),vertices:m.geometry.attributes.position.count,normals:!!m.geometry.attributes.normal,drawRange:m.geometry.drawRange},memory:{...renderer.info.memory},programs:renderer.info.programs.length};});
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__signGame);await p.locator('#game').click();
  await p.evaluate(()=>{const s=__signGame.state;__signGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,clearNavigation:false,apparitions:false,reducedMotion:true});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});
  await draw();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});
  if(process.argv.includes('--responsive')){
   for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await position(-12,20,-22,40);await shot('front-'+width);}
   assert.deepEqual(errors,[]);fs.writeFileSync(out+'/responsive-report.json',JSON.stringify({passed:true,software,errors}));console.log(JSON.stringify({passed:true,responsive:true,software,errors}));return;
  }
  for(const [name,x,y,tx,ty,pitch]of [['opening',0,10,0,100,-.08],['front',-12,20,-22,40,0],['side',-45,36,-22,40,0],['rear',-22,60,-22,40,0]]){await position(x,y,tx,ty,pitch);await shot(name);views.push({name,...await read()});}
  await position(0,10,0,100,-.08);for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('opening-'+width);}
  const start=await read();assert.equal(start.cue.batches,before?2:3);assert.equal(start.cue.visibleSigns,1);assert.deepEqual(start.cue.atlas,[960,672]);assert.equal(start.cue.approachDraw.sign.count,6);
  assert.deepEqual(start.body.material,before?['MeshBasicMaterial']:['MeshLambertMaterial','MeshLambertMaterial']);assert.equal(start.body.drawRange.count,start.cue.approachDraw.body.count);
  checks.push('Single approach sign, atlas and expected material groups retained');
  await p.evaluate(()=>__signGame.state.clearNavigation=true);await draw();assert.equal((await read()).cue.visibleSigns,15);
  for(const [name,x]of [['station-front',62],['station-back',110]]){await p.setViewportSize({width:2560,height:1600});await position(x,148,86,148,.42);await shot(name);}
  for(let i=0;i<=3;i++){await p.evaluate(i=>__signGame.state.hole.nightOrderActionsCompleted=__signGame.actions.slice(0,i).map(a=>a.id),i);await draw();const c=(await read()).cue;assert(c.state.slice(0,i).every(s=>s.done));if(i<3)assert(c.state[i].next);}
  await p.evaluate(()=>{__signGame.state.hole.keyCollected=true;__signGame.state.hole.drainUnlocked=true;});await draw();assert((await read()).cue.state.every(s=>s.done));assert((await read()).cue.exits.every(e=>e.ready));
  checks.push('All 15 signs, ordered completion, access and exit readiness still update');
  await p.evaluate(()=>{const s=__signGame.state;s.clearNavigation=false;s.hole.nightOrderActionsCompleted=[];s.hole.keyCollected=false;s.hole.drainUnlocked=false;});await position(77,148,86,148);await p.evaluate(()=>advanceTime(17));await p.keyboard.press('e');for(let i=0;i<120&&!(await p.evaluate(()=>__signGame.state.hole.nightOrderActionsCompleted.includes('audit-bell')));i++)await p.evaluate(()=>advanceTime(100));await draw();assert(await p.evaluate(()=>__signGame.state.hole.nightOrderActionsCompleted.includes('audit-bell')));assert((await read()).cue.state[0].done);
  checks.push('Actual Use completes Audit Bell and updates sign');
  await position(-12,20,-22,40);await p.setViewportSize({width:2560,height:1600});await shot('completed');
  const frozen=await read();await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(800));await draw();assert.equal((await read()).cue.updates,frozen.cue.updates);await p.keyboard.press('Escape');
  const warmed=await read();for(let i=0;i<10;i++)await draw();const end=await read();assert.deepEqual(end.memory,warmed.memory);assert.equal(end.programs,warmed.programs);
  checks.push('Pause/repeated draws retain state and warmed resource counts');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,views,start,end,checks,errors},null,2));console.log(JSON.stringify({passed:true,before,software,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
