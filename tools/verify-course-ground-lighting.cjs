const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/level-one-lantern-throughput/reference-'+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__groundGame={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('const softwareBudget=createSoftwareFrameBudget()','const softwareBudget=createSoftwareFrameBudget({scales:[.75]})')+'\nwindow.__groundScene=()=>({renderer,world,camera,parallax,sceneTarget,practicalLighting,groundLighting,coursePointLights});'}));
 await p.route('**/course-ground-lighting.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/course-ground-lighting.js','utf8').replace('  const prepared=prepareLanternGround(mesh','  const originalGeometry=mesh.geometry.clone();const prepared=prepareLanternGround(mesh').replace('  return {update,candidates,dispose()', '  globalThis.__groundFixture={mesh,compile,cacheKey,originalGeometry};return {update,candidates,dispose()')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__groundGame);await p.locator('#game').click();
  await p.evaluate(()=>{const s=__groundGame.state;__groundGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true});Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x:0,y:10,yaw:0,pitch:-.15});Object.assign(s.hole.joe,{x:100,y:700});RCSpatialControls.set('resolution',1);__groundGame.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});
  await p.evaluate(async()=>{
   const {stableLightMaterialSort}=await import('/local-light-culling.js'),{mesh,compile,cacheKey}=__groundFixture,s=__groundScene();
   window.__groundOptimized=mesh.material;window.__groundReference=mesh.material.clone();__groundReference.onBeforeCompile=compile;__groundReference.customProgramCacheKey=cacheKey;__groundReference.userData.localLightSourceId=mesh.material.id;s.practicalLighting.apply(__groundReference);s.renderer.setOpaqueSort(stableLightMaterialSort);
  });
  if(process.argv.includes('--budget')){
   const results=[];
   for(const [name,x,y,yaw]of [['opening',0,10,0],['audit',0,100,0],['pond',30,257,1.87]]){
    await p.evaluate(v=>Object.assign(__groundGame.state.player,{...v,pitch:-.15}),{x,y,yaw});
    const samples={baseline:[],optimized:[]};
    for(let i=0;i<56;i++){
     const optimized=i%4===1||i%4===2;
     const sample=await p.evaluate(async optimized=>{
      const {mesh,originalGeometry}=__groundFixture,s=__groundScene();window.__groundOptimizedGeometry??=mesh.geometry;
      mesh.material=optimized?__groundOptimized:__groundReference;mesh.geometry=optimized?__groundOptimizedGeometry:originalGeometry;
      __groundGame.state.player.yaw+=.00001;const start=performance.now();__groundGame.render();await RCScene3D.whenPresented();
      const gl=s.renderer.getContext(),fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;
      while((status=gl.clientWaitSync(fence,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(fence);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');
      return performance.now()-start;
     },optimized);
     if(i>=8)samples[optimized?'optimized':'baseline'].push(sample);
    }
    const summarize=a=>{a.sort((x,y)=>x-y);return {median:a[12],p95:a[22],samples:a.length};};results.push({name,baseline:summarize(samples.baseline),optimized:summarize(samples.optimized)});
   }
   assert.deepEqual(errors,[]);fs.writeFileSync(out+'/paired-budget.json',JSON.stringify({software,method:'ABBA interleaved within one scene; original baseline geometry and generic lighting;24 warmed samples each',results,errors},null,2));console.log(JSON.stringify({software,results,errors}));return;
  }
  for(const [name,x,y,yaw]of [['opening',0,10,0],['audit',0,100,0],['water',0,240,0],['pond',30,257,1.87],['dead-green',0,463,0],['range',0,550,0],['release',0,650,0]])for(const turn of [0,Math.PI/2]){
   await p.evaluate(async v=>{Object.assign(__groundGame.state.player,v);__groundGame.render();await RCScene3D.whenPresented();},{x,y,yaw:yaw+turn,pitch:-.15});
   for(const outage of [false,true]){
    const compared=await p.evaluate(outage=>{
     const {renderer:r,world,camera,parallax,sceneTarget,groundLighting,coursePointLights}=__groundScene(),mesh=__groundFixture.mesh,gl=r.getContext(),a=new Uint8Array(sceneTarget.width*sceneTarget.height*4),b=a.slice(),powers=coursePointLights.map(l=>l.intensity);
     if(outage)coursePointLights.forEach(l=>l.intensity=0);groundLighting.update();
     const draw=(material,pixels)=>{mesh.material=material;r.setRenderTarget(sceneTarget);r.autoClear=false;r.clear();r.render(parallax.scene,parallax.camera);r.clearDepth();r.render(world,camera);r.autoClear=true;gl.readPixels(0,0,sceneTarget.width,sceneTarget.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);};
     draw(__groundOptimized,a);draw(__groundReference,b);mesh.material=__groundOptimized;coursePointLights.forEach((l,i)=>l.intensity=powers[i]);groundLighting.update();r.setRenderTarget(null);
     let changed=0,maxDelta=0;for(let i=0;i<a.length;i++){const delta=Math.abs(a[i]-b[i]);if(delta)changed++;maxDelta=Math.max(maxDelta,delta);}return {changed,maxDelta,error:gl.getError(),ground:groundLighting.stats()};
    },outage);views.push({name,turn,outage,...compared});
   }
  }
  fs.writeFileSync(out+'/report.json',JSON.stringify({views,errors},null,2));assert.deepEqual(errors,[]);for(const v of views){assert.equal(v.error,0);assert(v.maxDelta<=2,'Ground lighting differs from generic field: '+JSON.stringify(v));}
  console.log(JSON.stringify({passed:true,software,views:views.length,maxDelta:Math.max(...views.map(v=>v.maxDelta)),ground:views[0].ground,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
