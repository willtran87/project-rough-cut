// Candidate only: omit the complete actor from rendering when a conservative
// world-space envelope is outside the view. Animation/audio still update.
// Full framebuffer readback completes every measured frame; no finish-only
// or command-submission timing is presented as completed GPU work.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const runtime=process.argv.includes('--runtime'),full=process.argv.includes('--full'),audioOnly=process.argv.includes('--audio-only');
const out='output/under-green/actor-culling-candidate'+(runtime?'/runtime':'')+(full?'/full':'');
const candidate=`
  if(window.__actorCullEnabled){
   camera.updateMatrixWorld();
   actorFrustum.setFromProjectionMatrix(actorProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
   actorEnvelope.center.copy(joe.root.position).y+=1.2;
   joe.root.visible=joe.root.visible&&actorFrustum.intersectsSphere(actorEnvelope);
  }
`;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(resolution=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({resolution,fov:85})),full?1:.5);
  await p.route('**/under-green.js',route=>{
   const source=fs.readFileSync('web/under-green.js','utf8'),marker='if(test)window.__underGreen={';assert(source.includes(marker));
   return route.fulfill({contentType:'application/javascript',body:source.replace(marker,'window.__actorCullPrefs=prefs;'+marker)});
  });
  await p.route('**/under-green-scene.js',route=>{
   let source=fs.readFileSync('web/under-green-scene.js','utf8');
   const marker=' return {draw,drainJoeFootsteps:',update='joe.update(r,prefs.reduced);';assert(source.includes(marker)&&source.includes(update));
   if(runtime){assert(source.includes('if(actorFrustum&&actorVisible){'));source=source.replace('if(actorFrustum&&actorVisible){','if(actorFrustum&&actorVisible&&window.__actorCullEnabled){');}
   else{
    assert(!source.includes('const actorFrustum='),'Use --runtime with integrated actor culling');
    source=source.replace('const scene=new THREE.Scene();','const actorFrustum=new THREE.Frustum(),actorProjection=new THREE.Matrix4(),actorEnvelope=new THREE.Sphere(new THREE.Vector3(),3);const scene=new THREE.Scene();').replace(update,update+candidate);
   }
   source=source.replace(marker,' window.__actorCull={renderer,camera,joe};'+marker);
   return route.fulfill({contentType:'application/javascript',body:source});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');
  await p.waitForFunction(()=>window.__actorCull&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const bounds=audioOnly?{}:await p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js');let maxRadius=0,points=0,poses=0;
   for(const yaw of [0,.7,Math.PI/2,Math.PI])for(const [phase,ages]of [['walk',[0,.2,.4]],['search',[0,.5]],['windup',[0,.2,.6,.94]],['sweep',[0,.1,.225,.35,.45]],['recover',[0,.4,.8,1.3]]])for(const age of ages){
    const r=createRun();r.mode='playing';r.time=30+age;Object.assign(r.joe,{x:0,y:52.7,yaw,attackYaw:yaw,phase,age,walk:age*2.1,speed:phase==='walk'?2.1:0});__underGreen.run=r;advanceTime(0);
    for(const v of __actorCull.joe.inspectMeshPoints()){maxRadius=Math.max(maxRadius,Math.hypot(v.x-r.joe.x,v.y-r.joe.y,v.height-1.2));points++;}poses++;
   }
   return {maxRadius,points,poses,envelopeRadius:3,centerHeight:1.2};
  });if(!audioOnly){fs.writeFileSync(`${out}/bounds.json`,JSON.stringify(bounds,null,2));assert(bounds.maxRadius<3,'Actor exceeds culling envelope');}
  const views=[];
  for(const [width,height]of audioOnly?[]:[[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const fov of [45,85])for(const yaw of [0,.6,1.2,Math.PI,Math.PI+1.2,Math.PI*2-.1])for(const pitch of width===2560?[-.85,0,.85]:[0])for(const distance of width===2560?[.5,5,90]:[5]){
    const row=await p.evaluate(async({fov,yaw,pitch,distance})=>{
     const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=35;
     Object.assign(r.player,{x:0,y:55,yaw,pitch,eyeHeight:pitch<0?1.12:1.65});Object.assign(r.joe,{x:0,y:55-distance,yaw:0,attackYaw:0,phase:'sweep',age:.225});__underGreen.run=r;__actorCullPrefs.fov=fov;
     const gl=__actorCull.renderer.getContext();
     const pixels=()=>{advanceTime(0);const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return bytes;};
     window.__actorCullEnabled=false;pixels();const before=pixels(),full=JSON.parse(render_game_to_text()).graphics,actor=JSON.stringify(full.actor);
     window.__actorCullEnabled=true;const after=pixels(),culled=JSON.parse(render_game_to_text()).graphics;
     let changed=0;for(let i=0;i<before.length;i++)if(before[i]!==after[i])changed++;
     return {fov,yaw,pitch,distance,changed,actorUnchanged:actor===JSON.stringify(culled.actor),visible:culled.actorCulled===undefined?__actorCull.joe.root.visible:!culled.actorCulled,fullDraws:full.draws,culledDraws:culled.draws,fullTriangles:full.triangles,culledTriangles:culled.triangles};
    },{fov,yaw,pitch,distance});views.push({width,height,...row});
    fs.writeFileSync(`${out}/partial.json`,JSON.stringify({bounds,views,errors},null,2));
    assert.equal(row.changed,0,JSON.stringify(views.at(-1)));assert(row.actorUnchanged);
    if(fov===85&&yaw===Math.PI&&pitch===0&&distance===5)await p.screenshot({path:`${out}/visible-${width}.png`});
   }
   console.log(JSON.stringify({width,views:views.length,culled:views.filter(v=>!v.visible).length}));
  }
  await p.setViewportSize({width:2560,height:1600});
  const timing=[];
  for(const [name,x,y,yaw,jx,jy]of audioOnly?[]:[['roots-behind',0,12,0,0,5],['roots-visible',0,12,0,0,18],['range-behind',12,36,Math.PI,12,41],['range-visible',12,36,Math.PI,12,31]]){
   const row=await p.evaluate(async({name,x,y,yaw,jx,jy})=>{
    const {createRun}=await import('./under-green-sim.js'),r=createRun(2);r.mode='playing';r.time=90;
    Object.assign(r.player,{x,y,yaw});Object.assign(r.joe,{x:jx,y:jy,yaw,phase:'walk',speed:2.1});__underGreen.run=r;__actorCullPrefs.fov=85;
    const gl=__actorCull.renderer.getContext();advanceTime(0);const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4),runs=[];
    const frame=()=>{const start=performance.now();advanceTime(0);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return performance.now()-start;};
    for(const enabled of [false,true,true,false]){window.__actorCullEnabled=enabled;for(let i=0;i<4;i++)frame();const samples=[];for(let i=0;i<16;i++)samples.push(frame());const sorted=samples.slice().sort((a,b)=>a-b),g=JSON.parse(render_game_to_text()).graphics;runs.push({enabled,median:sorted[8],p95:sorted[15],samples,draws:g.draws,actorVisible:g.actorCulled===undefined?__actorCull.joe.root.visible:!g.actorCulled});}
    return {name,runs,resolution:[gl.drawingBufferWidth,gl.drawingBufferHeight]};
   },{name,x,y,yaw,jx,jy});timing.push(row);console.log(JSON.stringify({name,runs:row.runs.map(({samples,...r})=>r)}));
  }
  const footsteps=await p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js'),runs=[];
   for(const enabled of [false,true]){
    window.__actorCullEnabled=enabled;const r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:60,yaw:0});Object.assign(r.joe,{x:0,y:50,yaw:0,phase:'walk',speed:2.1});__underGreen.run=r;advanceTime(0);
    const initial=JSON.parse(render_game_to_text()),start=initial.audio.counts.joeSteps,startSerial=initial.graphics.actor.footsteps.serial,rows=[];
    for(let frame=1;frame<=120;frame++){
     r.time=frame/60;r.joe.age=r.time;r.joe.y=50+r.time*2.1;r.joe.walk=r.time*2.1;advanceTime(0);
     const s=JSON.parse(render_game_to_text());rows.push({serial:s.graphics.actor.footsteps.serial-startSerial,audio:s.audio.counts.joeSteps-start,feet:s.graphics.actor.footPositions});
    }
    runs.push({enabled,rows});
   }
   return {same:JSON.stringify(runs[0].rows)===JSON.stringify(runs[1].rows),steps:runs[1].rows.at(-1).audio,frames:120,runs};
  });fs.writeFileSync(`${out}/footsteps.json`,JSON.stringify(footsteps,null,2));assert(footsteps.same&&footsteps.steps>0,'Off-screen culling changed animation/contact audio');
  if(!audioOnly){assert(views.some(v=>!v.visible&&v.culledDraws<v.fullDraws));assert(views.some(v=>v.visible));}assert.deepEqual(errors,[]);
  if(audioOnly){console.log(JSON.stringify({audioOnly,passed:true,steps:footsteps.steps}));return;}
  fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,candidateOnly:!runtime,bounds,views,timing,footsteps,errors,method:'Exact framebuffer comparisons; ABBA fixed-pose CPU submission plus complete RGBA readback; excludes real-time gameplay and does not establish sustained frame budget.'},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
