const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const verify=process.argv.includes('--verify'),moving=process.argv.includes('--moving'),out='output/course-budget-review/'+(verify?'batch-visuals-final':moving?'batch-moving-final':'batches-final');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),rows=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__batch={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/pixel-world-props.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/pixel-world-props.js','utf8').replace(/const chunkSize=economy\?(10|20):12/,'const chunkSize=economy?(window.__chunkSize||10):12').replace('localLighting?.register(m,b.parts);','localLighting?.register(m,window.__chunkSize===20?b.parts:null);')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('softwareBudget.scale():1','1:1')+'\nwindow.__batchScene=()=>({renderer,world,camera,parallax,sceneTarget});'}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__batch);await p.locator('#game').click();
  await p.evaluate(()=>{const t=__batch,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:690,mode:'patrol',patrolPause:9999});RCSpatialControls.set('resolution',.5);t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});
  for(const [block,size]of (verify?[10,20]:[10,20,20,10]).entries()){
   await p.evaluate(size=>{window.__chunkSize=size;RCScene3D.reset();__batch.render();},size);
   await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});
   for(const [width,height]of (verify?[[2560,1600],[1280,720],[390,844]]:[[1280,720]])){
   await p.setViewportSize({width,height});
   for(const [name,x,y,yaw,pitch]of (verify?[
    ['opening',0,65,0,0],['shore',-63,187,0,-.25],['woodland',50,365,Math.PI/2,0],
    ['lantern',0,32,Math.PI,-.15],['shed',-18,684,0,-.15],['hedge',-28,102,.6,-.1]
   ]:[['opening',0,65,0,0],['shore',-63,187,0,-.25],['woodland',50,365,Math.PI/2,0]])){
    const view=name+'-'+width;
    await p.evaluate(()=>Object.assign(__batch.state.hole.joe,{x:100,y:690,mode:'patrol',patrolPause:9999}));
    if(verify&&name==='hedge')await p.evaluate(()=>Object.assign(__batch.state.hole.joe,{x:-10,y:120,effectHeading:1}));
    const blocked=await p.evaluate(async v=>{Object.assign(__batch.state.player,v);__batch.render();await RCScene3D.whenPresented();return __batch.obstacleAtPosition(v.x,v.y)?.id||null;},{x,y,yaw,pitch});
    if(verify)assert.equal(blocked,null,view+' must use a legal player position');
    const result=await p.evaluate(async({block,view,verify})=>{
     // Direct fixed-scene draws isolate batch construction from animation,
     // simulation and adaptive resolution. Fence completion, not submit time.
     const {renderer:r,world,camera,parallax,sceneTarget}=__batchScene(),gl=r.getContext(),ms=[];
     r.setRenderTarget(sceneTarget);
     for(let i=0;i<(verify?4:40);i++){
      const start=performance.now();r.autoClear=false;r.clear();r.render(parallax.scene,parallax.camera);r.clearDepth();r.render(world,camera);r.autoClear=true;
      const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,2));gl.deleteSync(f);
      if(i>=(verify?0:10))ms.push(performance.now()-start);
     }
     const pixels=new Uint8Array(sceneTarget.width*sceneTarget.height*4);r.readRenderTargetPixels(sceneTarget,0,0,sceneTarget.width,sceneTarget.height,pixels);
     window.__batchPixels??={};let changed=0,maxDelta=0;
     if(block===0)__batchPixels[view]=pixels;else for(let i=0;i<pixels.length;i++){const delta=Math.abs(pixels[i]-__batchPixels[view][i]);if(delta)changed++;maxDelta=Math.max(maxDelta,delta);}
     ms.sort((a,b)=>a-b);r.setRenderTarget(null);
     return {median:ms[15],p95:ms[28],draws:r.info.render.calls,triangles:r.info.render.triangles,resolution:[sceneTarget.width,sceneTarget.height],changed,maxDelta,memory:{...r.info.memory},programs:r.info.programs.length};
    },{block,view,verify});
    rows.push({block,size,view,...result});console.log(JSON.stringify(rows.at(-1)));
    await p.screenshot({path:`${out}/${block}-${view}.png`});
    if(moving){
     const timing=await p.evaluate(async({x,y,yaw,pitch})=>{
      const elapsed=[],cpu=[];
      for(let i=0;i<48;i++){
       Object.assign(__batch.state.player,{x,y:y+i*.06,yaw:yaw+Math.sin(i*.03)*.14,pitch});
       const start=performance.now();__batch.render();await RCScene3D.whenPresented();
       if(i>=12){elapsed.push(performance.now()-start);cpu.push(RCScene3D.stats().worldSubmitMs);}
      }
      elapsed.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);
      return {median:elapsed[18],p95:elapsed[34],cpuMedian:cpu[18],cpuP95:cpu[34],resolution:RCScene3D.stats().resolution};
     },{x,y,yaw,pitch});rows.at(-1).moving=timing;console.log(JSON.stringify({block,size,view,moving:timing}));
    }
   }
   }
  }
  const checks=[];
  if(verify){
   assert(rows.every(row=>row.changed===0),'Batch sizes must preserve rendered pixels');
   checks.push('Exact scene-target pixels across six locations and three viewport sizes');
   await p.evaluate(async()=>{Object.assign(__batch.state.player,{x:0,y:40,yaw:0,pitch:0});__batch.render();await RCScene3D.whenPresented();});
   const before=await p.evaluate(()=>__batch.state.player.y);
   await p.keyboard.down('w');await p.evaluate(()=>advanceTime(500));await p.keyboard.up('w');
   assert(await p.evaluate(y=>__batch.state.player.y>y,before),'Actual W input must advance');
   await p.keyboard.press('Escape');
   const paused=await p.evaluate(()=>JSON.stringify(__batch.state.player));
   await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.stringify(__batch.state.player)),paused,'Pause must preserve player pose');
   await p.keyboard.press('Escape');checks.push('Actual keyboard movement and pause/resume preserve control');
  }
  fs.writeFileSync(out+'/report.json',JSON.stringify({rows,checks,errors,scope:'Completed-render diagnostic with fixed-view pixel comparison; optional controlled camera motion. Shared host; not full-route FPS.'},null,2));assert.deepEqual(errors,[]);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
