const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const baselineField=false,before=false,software=process.argv.includes('--software'),budget=process.argv.includes('--budget');
 const out=(process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/level-one-practical-lighting')+'/'+(baselineField?'baseline-':before?'before-':'after-')+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:!process.argv.includes('--headed'),args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__practicalGame={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('const softwareBudget=createSoftwareFrameBudget()','const softwareBudget=createSoftwareFrameBudget({scales:[.75]})')+'\nwindow.__practicalScene=()=>({world,renderer,camera,nearLamp,glowAnchors,coursePointLights,practicalLighting:typeof practicalLighting==="undefined"?null:practicalLighting});'}));
 const draw=()=>p.evaluate(async()=>{__practicalGame.render();await RCScene3D.whenPresented();});
 const read=()=>p.evaluate(()=>{const s=RCScene3D.stats(),r=__practicalScene();return {practicals:s.practicals||null,oldLamp:r.nearLamp?{position:r.nearLamp.position.toArray(),power:r.nearLamp.intensity}:null,anchors:r.glowAnchors.map(a=>({position:a.position.toArray(),intensity:a.intensity})),resolution:s.resolution,pairs:s.pathLanterns.pairs,memory:{...r.renderer.info.memory},programs:r.renderer.info.programs.length,draws:s.drawCalls,triangles:s.triangles,ambient:r.world.children.filter(o=>o.isAmbientLight).map(o=>o.intensity)};});
 const shot=async name=>{for(let i=0;i<3;i++){await p.evaluate(()=>__practicalGame.state.hole.elapsed+=.001);await draw();await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:93});};
 const settle=async()=>{for(let i=0;i<15;i++){await p.evaluate(()=>__practicalGame.state.hole.elapsed+=.05);await draw();}};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__practicalGame);await p.locator('#game').click();await p.evaluate(()=>{const s=__practicalGame.state;__practicalGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x:0,y:10,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});await draw();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
  await p.waitForFunction(()=>RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});await settle();
  if(process.argv.includes('--responsive')){
   await p.evaluate(()=>Object.assign(__practicalGame.state.player,{x:0,y:10,yaw:0,pitch:-.08}));
   for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('opening-'+width);views.push({name:'opening-'+width,...await read()});}
   assert.deepEqual(errors,[]);fs.writeFileSync(out+'/responsive-report.json',JSON.stringify({passed:true,software,views,errors},null,2));console.log(JSON.stringify({passed:true,software,responsive:true,errors}));return;
  }
  if(process.argv.includes('--diagnostic')){
   await p.evaluate(()=>Object.assign(__practicalGame.state.player,{x:0,y:100,yaw:0,pitch:-.12}));
   const samples=[];
   for(let i=0;i<20;i++){
    await p.evaluate(i=>{__practicalGame.state.hole.elapsed+=i%2?.001:.05;},i);await draw();
    const sample=await p.evaluate(()=>{const r=__practicalScene().renderer,gl=r.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let bright=0;for(let j=0;j<pixels.length;j+=4)if(pixels[j]>128||pixels[j+1]>128||pixels[j+2]>128)bright++;return {bright,time:__practicalGame.state.hole.elapsed,glError:gl.getError()};});samples.push(sample);
    if(i<4)await p.screenshot({path:out+'/diagnostic-'+i+'.jpg',type:'jpeg',quality:93});
   }
   fs.writeFileSync(out+'/diagnostic.json',JSON.stringify({samples,errors},null,2));console.log(JSON.stringify({samples,errors}));return;
  }
  if(budget){
   const results=[];for(const [name,x,y,yaw]of [['opening',0,10,0],['audit',0,100,0],['pond',30,257,1.87]]){
    await p.evaluate(v=>Object.assign(__practicalGame.state.player,{...v,pitch:-.15}),{x,y,yaw});await draw();const times=[];
    for(let i=0;i<34;i++){const ms=await p.evaluate(async()=>{__practicalGame.state.player.yaw+=.0001;const t=performance.now();__practicalGame.render();await RCScene3D.whenPresented();const gl=__practicalScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let s;while((s=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(s===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-t;});if(i>=10)times.push(ms);}times.sort((a,b)=>a-b);const r=await read();results.push({name,median:times[12],p95:times[22],resolution:r.resolution,draws:r.draws,triangles:r.triangles,memory:r.memory,programs:r.programs,ground:r.practicals?.ground});
   }assert.deepEqual(errors,[]);fs.writeFileSync(out+'/budget.json',JSON.stringify({passed:true,before,software,results,errors},null,2));console.log(JSON.stringify({passed:true,before,software,results}));return;
  }
  for(const [name,x,y,yaw,pitch]of [['opening',0,10,0,-.08],['opening-back',0,10,Math.PI,-.15],['audit',0,100,0,-.12],['water',0,240,0,0],['dead-green',0,463,0,-.1],['range',0,550,0,0],['release',0,650,0,-.08]]){
   assert(await p.evaluate(v=>{Object.assign(__practicalGame.state.player,v);return !__practicalGame.obstacleAtPosition(v.x,v.y,2.4);},{x,y,yaw,pitch}),name+' legal viewpoint');await shot(name);views.push({name,...await read()});
  }
  if(!before){
   for(const v of views){if(!baselineField){assert.equal(v.practicals.ground?.mode,'fixed-ground-sources');assert.equal(v.practicals.ground.sources,v.anchors.length+v.practicals.ground.normalPointSources);}assert.equal(v.practicals.mode,'fixed-world-field');assert.equal(v.practicals.count,v.anchors.length);assert.equal(v.pairs.length,14);assert.deepEqual(v.ambient,[.28]);for(const s of v.practicals.sources)if(s.index>=0){assert.deepEqual(s.position,v.anchors[s.index].position);assert(Math.abs(s.power-2.8*v.anchors[s.index].intensity)<1e-6);}}
   assert.deepEqual(views[0].practicals.sources,views[1].practicals.sources,'Turning does not change active fixtures');checks.push('Source positions/output match actual fixtures; camera turn leaves light unchanged;28symmetric lanterns and ambient.005');
   const v=await read();for(const pair of v.pairs){assert(Math.abs((pair.lamps[0].x+pair.lamps[1].x)/2-pair.center.x)<1e-8);assert(Math.abs((pair.lamps[0].z+pair.lamps[1].z)/2-pair.center.z)<1e-8);}
   await p.evaluate(()=>__practicalGame.state.reducedMotion=false);await settle();const stable=await read();await draw();assert.deepEqual((await read()).practicals,stable.practicals);await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(700));assert.deepEqual((await read()).practicals,stable.practicals);await p.keyboard.press('Escape');checks.push('Pause and repeated draws retain source state');
   await p.keyboard.down('w');await p.evaluate(()=>advanceTime(400));await p.keyboard.up('w');await draw();await shot('walking');await settle();const warm=await read();
   for(let i=0;i<30;i++){await p.evaluate(()=>__practicalGame.state.hole.elapsed+=.05);await draw();}
   const end=await read();assert.deepEqual(end.memory,warm.memory);assert.equal(end.programs,warm.programs);for(const s of end.practicals.sources)if(s.index>=0)assert(Math.abs(s.power-2.8*end.anchors[s.index].intensity)<1e-6);checks.push('Walking/flicker retain source alignment, bounded lights and warmed resources');
  }
  await p.evaluate(()=>{Object.assign(__practicalGame.state.player,{x:0,y:10,yaw:0,pitch:-.08});Object.assign(__practicalGame.state.hole,{messageTimer:0,zoneBannerTimer:0});__practicalGame.state.reducedMotion=true;});
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('opening-'+width);}
  if(!before){
   const old=await read();
   await p.evaluate(async()=>{const f=__practicalScene().practicalLighting;window.__oldField=f;window.__fieldDisposals=0;for(const t of f.textures)t.addEventListener('dispose',()=>__fieldDisposals++);RCScene3D.reset();__practicalGame.render();await RCScene3D.whenPresented();});
   await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
   const fresh=await read(),lifecycle=await p.evaluate(()=>({disposals:__fieldDisposals,fresh:__practicalScene().practicalLighting!==__oldField}));
   assert.deepEqual(lifecycle,{disposals:1,fresh:true});assert.equal(fresh.practicals.count,old.practicals.count);assert.equal(fresh.memory.textures,old.memory.textures);assert(fresh.programs<=old.programs);checks.push('Rebuild disposes field texture once, creates fresh sources and retains bounded texture/program counts');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,views,checks,errors},null,2));console.log(JSON.stringify({passed:true,before,software,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
