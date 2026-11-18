const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const before=process.argv.includes('--before'),software=process.argv.includes('--software'),budget=process.argv.includes('--budget'),pond=process.argv.includes('--pond');
 const out=(pond?'output/level-one-pond-banks/budget/':'output/level-one-verge-lighting/')+(before?'before':'after')+(software?'-software':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__verge={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync((before?'output/level-one-verge-lighting/baseline-source':'web')+'/scene-3d.js','utf8').replace('const softwareBudget=createSoftwareFrameBudget()',budget&&software?'const softwareBudget=createSoftwareFrameBudget({scales:[.75]})':'const softwareBudget=createSoftwareFrameBudget()')+'\nwindow.__vergeScene=()=>({world,renderer,camera,lights,understoryCulling});'}));
 if(before&&pond)for(const name of ['pixel-world-props.js','pixel-water.js','course-verge-material.js'])await page.route('**/'+name+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-pond-banks/baseline-source/'+name,'utf8')}));
 const draw=()=>page.evaluate(async()=>{__verge.render();await RCScene3D.whenPresented();});
 const place=async(x,y,yaw=0,pitch=0)=>{await page.evaluate(v=>Object.assign(__verge.state.player,v),{x,y,yaw,pitch});await draw();};
 const read=()=>page.evaluate(()=>{const {world,renderer}=__vergeScene(),s=RCScene3D.stats(),plants=[];world.traverse(o=>{if(o.name.startsWith('CourseUnderstory-'))plants.push({name:o.name,count:o.count,capacity:o.instanceMatrix.count,type:o.material.type,shadow:o.receiveShadow,vertices:o.geometry.attributes.position.count,emission:o.material.emissiveIntensity??null});});return {plants,memory:renderer.info.memory,programs:renderer.info.programs.length,resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles,lanterns:s.pathLanterns.pairs.length*2,ambient:world.children.filter(o=>o.type==='AmbientLight').map(o=>o.intensity)};});
 const shot=async name=>{await page.screenshot({path:out+'/'+name+'.png'});views.push({name,...await read()});};
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__verge);await page.locator('#game').click();
  await page.evaluate(()=>{const s=__verge.state;__verge.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol',patrolPause:9999});RCSpatialControls.set('resolution',1);});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
  if(budget){
   const fixtures=[];
   for(const [name,x,y,yaw]of (pond?[['pond',-63,187,0],['floodlight',18,217,0]]:[['opening',0,10,0],['floodlight',18,217,0]])){
    await place(x,y,yaw,0);const times=[];
    for(let i=0;i<34;i++){
     const ms=await page.evaluate(async()=>{__verge.state.player.yaw+=.0001;const t=performance.now();__verge.render();await RCScene3D.whenPresented();const gl=__vergeScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;while((status=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-t;});if(i>=10)times.push(ms);
    }
    times.sort((a,b)=>a-b);fixtures.push({name,median:times[12],p95:times[22],samples:24,...await read()});
   }
   assert.deepEqual(errors,[]);const report={passed:true,before,software,method:'CPU submit through GPU fence,2ms polling; software fixed960x540; bounded fixture,not whole-level FPS',fixtures,errors};fs.writeFileSync(out+'/budget.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,before,software,fixtures:fixtures.map(f=>({name:f.name,median:f.median,p95:f.p95,res:f.resolution,draws:f.draws,triangles:f.triangles})),errors}));return;
  }
  for(const [name,x,y,yaw,pitch]of [['opening',0,10,0,0],['audit-row',0,100,0,0],['floodlight',18,217,0,-.20],['warm-window',-90.3923,204,-1.3,0],['range',0,550,0,0],['shade',75,66,Math.PI/2,-.22]]){await place(x,y,yaw,pitch);await shot(name+'-2560');}
  const original=await read();assert.equal(original.lanterns,28);assert.deepEqual(original.ambient,[.005]);assert.equal(original.plants.reduce((n,p)=>n+p.capacity,0),1610);for(const p of original.plants)assert.equal(p.type,before?'MeshBasicMaterial':'MeshLambertMaterial');
  for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await place(18,217,0,-.2);await shot('floodlight-'+width);}
  // Isolate actual plant geometry/materials and an existing floodlight. No fake
  // fill or replacement shader: with all sources off the old material still glows.
  const response=await page.evaluate(async()=>{
   const THREE=await import('./vendor/three/three.module.js'),{world,renderer,lights,understoryCulling}=__vergeScene();understoryCulling?.restore();world.updateMatrixWorld(true);
   const plants=[],sources=[];world.traverse(o=>{if(o.name.startsWith('CourseUnderstory-'))plants.push(o);if(o.isLight)sources.push({o,power:o.intensity,layer:o.layers.mask});});
   let target=null;const source=lights[0].source,m=new THREE.Matrix4(),v=new THREE.Vector3();for(const o of plants)for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);v.setFromMatrixPosition(m);const distance=Math.hypot(v.x-source.position.x,v.z-source.position.z);if(v.y>.16&&distance<2.5&&(!target||distance<target.distance))target={name:o.name,distance,x:v.x,y:v.y,z:v.z};}if(!target)throw Error('No actual floodlit plant');
   const cam=new THREE.PerspectiveCamera(40,1,.05,15);cam.position.set(target.x+1.3,1.1,target.z+1.5);cam.lookAt(target.x,target.y,target.z);cam.layers.set(7);
   const saved=plants.map(o=>o.layers.mask),fog=world.fog,oldTarget=renderer.getRenderTarget(),oldColor=renderer.getClearColor(new THREE.Color()).clone(),oldAlpha=renderer.getClearAlpha();
   const rt=new THREE.WebGLRenderTarget(256,256),pixels=new Uint8Array(256*256*4),results=[];
   try{
    world.fog=null;for(const o of plants)o.layers.enable(7);for(const s of sources){s.o.layers.enable(7);s.o.intensity=0;}renderer.setRenderTarget(rt);renderer.setClearColor(0,1);
    for(const power of [1,.2,0,1]){source.intensity=18*power;renderer.clear();renderer.render(world,cam);renderer.readRenderTargetPixels(rt,0,0,256,256,pixels);let total=0,visible=0;for(let i=0;i<pixels.length;i+=4){const l=pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722;total+=l;if(l>1)visible++;}results.push({power,total,visible});}
   }finally{world.fog=fog;plants.forEach((o,i)=>o.layers.mask=saved[i]);for(const s of sources){s.o.layers.mask=s.layer;s.o.intensity=s.power;}renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldColor,oldAlpha);rt.dispose();}
   return {target,results};
  });
  if(before)assert.equal(response.results[0].total,response.results[2].total);else{assert(response.results[0].visible>50);assert(response.results[0].total>response.results[1].total*1.5);assert.equal(response.results[2].total,0);assert.equal(response.results[0].total,response.results[3].total);}
  await page.setViewportSize({width:1280,height:720});await place(0,10,0,0);const start=await page.evaluate(()=>({x:__verge.state.player.x,y:__verge.state.player.y}));await page.keyboard.down('ArrowUp');await page.evaluate(()=>advanceTime(400));await page.keyboard.up('ArrowUp');const walked=await page.evaluate(()=>({x:__verge.state.player.x,y:__verge.state.player.y}));assert(Math.hypot(walked.x-start.x,walked.y-start.y)>1);await page.keyboard.press('Escape');await page.evaluate(()=>advanceTime(300));assert.equal(await page.evaluate(()=>__verge.state.mode),'paused');await page.keyboard.press('Escape');await page.evaluate(()=>__verge.state.reducedMotion=true);await draw();await shot('keyboard-pass');
  const warm=await read();for(let i=0;i<24;i++){await page.evaluate(()=>__verge.state.player.yaw+=.012);await draw();}const stable=await read();assert.deepEqual(stable.memory,warm.memory);assert.equal(stable.programs,warm.programs);
  const matrices=await page.evaluate(()=>{const s=__vergeScene();s.understoryCulling?.restore();const out=[];s.world.traverse(o=>{if(o.name.startsWith('CourseUnderstory-')){let h=2166136261;for(const b of new Uint8Array(o.instanceMatrix.array.buffer)){h^=b;h=Math.imul(h,16777619);}out.push({name:o.name,count:o.count,hash:h>>>0});}});return out;});
  assert.deepEqual(errors,[]);const report={passed:true,before,software,views,response,start,walked,warm,stable,matrices,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,before,software,response,memory:stable.memory,programs:stable.programs,matrices,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
