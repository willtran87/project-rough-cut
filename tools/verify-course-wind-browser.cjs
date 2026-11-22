const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const software=process.argv.includes('--software'),before=false,paired=process.argv.includes('--paired'),budget=process.argv.includes('--budget')||paired,out=`output/level-one-wind/${before?'before':'after'}-${software?'software':'native'}`;fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__windGame={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('const softwareBudget=createSoftwareFrameBudget()',budget?'const softwareBudget=createSoftwareFrameBudget({scales:[.75]})':'const softwareBudget=createSoftwareFrameBudget()').replace('function render(ctx,data,frame){','function render(ctx,data,frame){if(window.__windOverride)frame={...frame,fx:{...frame.fx,wind:window.__windOverride}};')+'\nwindow.__windScene=()=>({world,renderer,camera,understoryCulling,courseWind:typeof courseWind===\"undefined\"?null:courseWind});'}));
 if(paired)await p.route('**/course-wind.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/course-wind.js','utf8').replace('function vegetationShader(shader,amplitude=.10){',`function vegetationShader(shader,amplitude=.10){if(globalThis.__windDirect){
  uniforms(shader);shader.vertexShader='attribute vec2 courseWindShelter;\\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',\`
   float courseExposure=courseWindDrive>=0.0?courseWindShelter.x:courseWindShelter.y;
   float courseBend=courseWindDrive*courseExposure*courseGust(vegetationAnchor)*\$\{amplitude.toFixed(3)\}*min(1.0,max(0.0,vegetationWorld.y))*uv.y*uv.y;
   vec3 courseDelta=vec3(courseBend,-abs(courseBend)*.12,courseBend*.18*sin(courseWindClock*.63+vegetationAnchor.y*.17));
   transformed+=vec3(dot(courseDelta,vegetationTransform[0].xyz)/dot(vegetationTransform[0].xyz,vegetationTransform[0].xyz),dot(courseDelta,vegetationTransform[1].xyz)/dot(vegetationTransform[1].xyz,vegetationTransform[1].xyz),dot(courseDelta,vegetationTransform[2].xyz)/dot(vegetationTransform[2].xyz,vegetationTransform[2].xyz));
   #include <project_vertex>\`);return;
 }`)}));
 const draw=()=>p.evaluate(async()=>{__windGame.render();await RCScene3D.whenPresented();});
 const step=async(n=1)=>{for(let i=0;i<n;i++){await p.evaluate(()=>__windGame.state.hole.elapsed+=.05);await draw();}};
 const shot=async name=>{await draw();await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:90});};
 const read=()=>p.evaluate(()=>{const r=__windScene(),s=RCScene3D.stats(),plants=[];r.world.traverse(o=>{if(o.name.startsWith('CourseUnderstory-'))plants.push({count:o.count,capacity:o.instanceMatrix.count,shelter:!!o.geometry.attributes.courseWindShelter});});return {wind:s.wind,plants,lanterns:s.pathLanterns.pairs.length*2,ambient:r.world.children.filter(o=>o.isAmbientLight).map(o=>o.intensity),memory:{...r.renderer.info.memory},programs:r.renderer.info.programs.length,detail:s.visualDetail};});
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__windGame);await p.locator('#game').click();await p.evaluate(()=>{const s=__windGame.state;__windGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:false,effectsDensity:0});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});window.__windOverride={strength:1,direction:1};RCSpatialControls.set('resolution',1);});await draw();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});await step(25);
  if(paired){
   const results=[];
   for(const [name,x,y,yaw]of [['verge',18,217,0],['pond',30,257,1.87]]){
    await p.evaluate(v=>Object.assign(__windGame.state.player,{...v,pitch:-.15}),{x,y,yaw});await draw();
    await p.evaluate(()=>{const r=__windScene(),map=new Map();window.__windVariants=[];r.world.traverse(o=>{if(!o.geometry?.attributes.courseWindShelter)return;const source=o.material;if(!map.has(source)){const clone=source.clone(),key=source.customProgramCacheKey();clone.onBeforeCompile=source.onBeforeCompile;clone.customProgramCacheKey=()=>key+'-direct-wind-reference';clone.userData.localLightSourceId=source.userData.localLightSourceId??source.id;map.set(source,clone);}__windVariants.push({mesh:o,optimized:source,direct:map.get(source)});});});
    const times={direct:[],optimized:[]};
    for(let i=0;i<56;i++){
     const direct=i%4===0||i%4===3,ms=await p.evaluate(async direct=>{globalThis.__windDirect=direct;for(const v of __windVariants)v.mesh.material=direct?v.direct:v.optimized;__windGame.state.hole.elapsed+=.05;const start=performance.now();__windGame.render();await RCScene3D.whenPresented();const gl=__windScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;while((status=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-start;},direct);
     if(i>=8)times[direct?'direct':'optimized'].push(ms);
    }
    const summary=a=>{a.sort((a,b)=>a-b);return {median:a[12],p95:a[22],samples:a.length};};results.push({name,direct:summary(times.direct),optimized:summary(times.optimized)});
    await p.evaluate(()=>{globalThis.__windDirect=false;const unique=new Set();for(const v of __windVariants){v.mesh.material=v.optimized;unique.add(v.direct);}for(const m of unique)m.dispose();});
   }assert.deepEqual(errors,[]);fs.writeFileSync(out+'/paired-budget.json',JSON.stringify({software,method:'Same scene and geometry, ABBA direct trigonometry versus baked phase coefficients',results,errors},null,2));console.log(JSON.stringify({paired:true,software,results,errors}));return;
  }
  if(process.argv.includes('--props')){
   await p.evaluate(()=>Object.assign(__windGame.state.player,{x:80,y:530,yaw:1,pitch:.4}));await draw();
   const target=await p.evaluate(()=>{const r=__windScene();let flag;r.world.traverse(o=>{if(o.geometry?.parameters?.width===1.5&&o.geometry?.parameters?.height===.66)flag=o;});if(!flag)throw Error('Missing pennant');const target=flag.localToWorld(flag.position.clone().set(.7,-.33,0)),eye=r.camera.position,dx=target.x-eye.x,dz=eye.z-target.z;Object.assign(__windGame.state.player,{yaw:Math.atan2(dx,dz),pitch:Math.atan2(target.y-eye.y,Math.hypot(dx,dz))});return target.toArray();});
   await shot('pennant-inspection-a');await step(18);await shot('pennant-inspection-b');await p.evaluate(()=>__windGame.state.reducedMotion=true);await draw();await shot('pennant-inspection-reduced');assert.deepEqual(errors,[]);fs.writeFileSync(out+'/props-report.json',JSON.stringify({passed:true,target,errors}));console.log(JSON.stringify({passed:true,props:true,software,target,errors}));return;
  }
  if(budget){
   const results=[];for(const [name,x,y,yaw]of [['verge',18,217,0],['pond',30,257,1.87]]){
    await p.evaluate(v=>Object.assign(__windGame.state.player,{...v,pitch:-.15}),{x,y,yaw});await draw();const samples=[];
    for(let i=0;i<32;i++){const ms=await p.evaluate(async()=>{__windGame.state.hole.elapsed+=.05;const start=performance.now();__windGame.render();await RCScene3D.whenPresented();const gl=__windScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;while((status=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-start;});if(i>=8)samples.push(ms);}
    samples.sort((a,b)=>a-b);results.push({name,median:samples[12],p95:samples[22],resolution:await p.evaluate(()=>RCScene3D.stats().resolution)});
   }assert.deepEqual(errors,[]);fs.writeFileSync(out+'/budget.json',JSON.stringify({before,software,results,errors},null,2));console.log(JSON.stringify({before,software,results,errors}));return;
  }
  for(const [name,x,y,yaw,pitch]of [['verge',18,217,0,-.2],['pond',30,257,1.87,-.12],['sign',-105,232,-1.57,.25],['pennant',80,530,1,.4]]){await p.evaluate(v=>Object.assign(__windGame.state.player,v),{x,y,yaw,pitch});await shot(name+'-a');await step(15);await shot(name+'-b');}
  const active=await read();assert.equal(active.lanterns,28);assert.deepEqual(active.ambient,[.28]);assert.equal(active.plants.reduce((n,v)=>n+v.capacity,0),4788);
  {assert(active.wind.drive>.99);assert(active.plants.every(v=>v.shelter));
   await p.evaluate(()=>Object.assign(__windGame.state.player,{x:18,y:217,yaw:0,pitch:-.2}));await draw();
   // Compaction must keep the baked shelter paired with the same world plant.
   const pairing=await p.evaluate(()=>{const r=__windScene();let checked=0,maxError=0;r.world.traverse(o=>{if(!o.name.startsWith('CourseUnderstory-'))return;const a=o.geometry.attributes.courseWindShelter,m=o.instanceMatrix.array;for(let i=0;i<o.count;i++){for(const [component,direction]of [[0,1],[1,-1]])maxError=Math.max(maxError,Math.abs(a.array[i*2+component]-r.courseWind.exposure(m[i*16+12],m[i*16+14],direction)));checked++;}});return {checked,maxError};});assert(pairing.checked>0);assert(pairing.maxError<.00001);checks.push({name:'Visible plant shelter follows compacted identity',...pairing});
   const frozen=active.wind;await draw();assert.deepEqual((await read()).wind,frozen);await p.keyboard.press('Escape');await step(3);assert.deepEqual((await read()).wind,frozen);await p.keyboard.press('Escape');
   await p.evaluate(()=>__windOverride.direction=-1);await step(1);assert((await read()).wind.drive>0);await step(40);assert((await read()).wind.drive<-.99);checks.push('Repeated draw/pause freeze the field; wind reverses smoothly');
   await p.evaluate(()=>__windGame.state.reducedMotion=true);await step(2);const reduced=await read();assert.equal(reduced.wind.drive,0);await step(5);assert.deepEqual((await read()).wind,reduced.wind);await shot('wind-reduced');await p.evaluate(()=>__windGame.state.reducedMotion=false);await step(12);
  }
  await p.evaluate(()=>Object.assign(__windGame.state.player,{x:18,y:217,yaw:0,pitch:-.2}));for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('verge-'+width);}
  const warm=await read();await step(10);const end=await read();assert.deepEqual(end.memory,warm.memory);assert.equal(end.programs,warm.programs);checks.push('Warmed resources remain stable;28lanterns/ambient.005/1610plant cards retained');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,before,active,end,checks,errors},null,2));console.log(JSON.stringify({passed:true,software,before,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
