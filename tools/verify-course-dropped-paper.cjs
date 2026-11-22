const fs=require('node:fs'),assert=require('node:assert/strict');
const {restoreFullIndexReference}=require('./fixtures/full-index-reference.cjs');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const before=false,software=process.argv.includes('--software'),out=`output/level-one-dropped-paper/${before?'before':'after'}-${software?'software':'native'}`;fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__stoneGame={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('softwareBudget=createSoftwareFrameBudget()','softwareBudget=createSoftwareFrameBudget({scales:[.625]})').replace('understoryCulling?.update(camera);','if(window.__habitatAllInstances)understoryCulling?.restore();else understoryCulling?.update(camera);')+'\nwindow.__stoneScene=()=>({world,renderer,camera,currentData,pixelWorld,sceneTarget,environmentGuidance});'}));
 await p.route('**/pixel-world-props.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/pixel-world-props.js','utf8').replace('    if(stone){const courses=', '    if(!stone)r.userData.hedgeCore={position:Array.from(g.attributes.position.array),normal:Array.from(g.attributes.normal.array),index:Array.from(g.index.array)};\n    if(stone){const courses=').replace('function updateCulling(camera){',`function updateCulling(camera){if(window.__stoneNoCull){cullValid=false;for(const m of culledMeshes){if(m.userData.fullIndices)(${restoreFullIndexReference.toString()})(m);else m.visible=true;}return;}`)}));


 const draw=()=>p.evaluate(async()=>{__stoneGame.render();await RCScene3D.whenPresented();});
 const place=async(x,y,yaw=0,pitch=-.12)=>{const pose=await p.evaluate(v=>{const t=__stoneGame;v.x=Math.max(-108,Math.min(108,v.x));v.y=Math.max(1,Math.min(710,v.y));if(t.obstacleAtPosition(v.x,v.y,2.4)){search:for(let ring=1;ring<7;ring++)for(let a=0;a<12;a++){const x=v.x+Math.cos(a*Math.PI/6)*ring*6,y=v.y+Math.sin(a*Math.PI/6)*ring*6;if(Math.abs(x)<108&&y>1&&y<710&&!t.obstacleAtPosition(x,y,2.4)){v.x=x;v.y=y;break search;}}}Object.assign(t.state.player,v);return {...v,legal:Math.abs(v.x)<110&&v.y>=0&&v.y<720&&!t.obstacleAtPosition(v.x,v.y,2.4)};},{x,y,yaw,pitch});assert(pose.legal);await draw();};
 const shot=async name=>{await draw();await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:94});const view=await p.evaluate(name=>{const r=__stoneScene(),s=RCScene3D.stats();return {name,pose:{...__stoneGame.state.player},resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles,memory:{...r.renderer.info.memory},programs:r.renderer.info.programs.length};},name);
  if(software){view.culling=await p.evaluate(async()=>{const r=__stoneScene(),t=r.sceneTarget,read=()=>{const a=new Uint8Array(t.width*t.height*4);r.renderer.readRenderTargetPixels(t,0,0,t.width,t.height,a);return a;},a=read();window.__stoneNoCull=true;window.__habitatAllInstances=true;__stoneGame.render();await RCScene3D.whenPresented();const b=read();window.__stoneNoCull=false;window.__habitatAllInstances=false;__stoneGame.render();await RCScene3D.whenPresented();const restored=read();let max=0,changed=0,restoredChanged=0;const pixels=[];for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);max=Math.max(max,d);if(a[i]!==restored[i])restoredChanged++;if(d){changed++;if(pixels.length<40)pixels.push({x:Math.floor(i/4)%t.width,y:t.height-1-Math.floor(i/4/t.width),delta:d});}}return {maxChannelDelta:max,changedChannels:changed,culledBytes:a.length,referenceBytes:b.length,restoredChangedChannels:restoredChanged,pixels};});assert.equal(view.culling.changedChannels,0,name+' full geometry must match visible pixels exactly');assert.equal(view.culling.restoredChangedChannels,0,name+' reference must restore the original packed view');}

  views.push(view);
 };
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__stoneGame);await p.evaluate(()=>{const t=__stoneGame,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true,effectsDensity:0});Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});advanceTime(17);});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await draw();
  const inventory=await p.evaluate(()=>{const r=__stoneScene(),s=RCScene3D.stats(),lights=[],courses=[],interiors=[],hedgeCores=[],growth=[];r.world.traverse(o=>{if(o.isLight)lights.push({type:o.type,intensity:o.intensity,position:o.position.toArray()});if(o.userData.stoneCourses)courses.push(o.userData.stoneCourses);if(o.userData.hedgeCore)hedgeCores.push(o.userData.hedgeCore);if(o.userData.hedgeGrowth)growth.push(o.userData.hedgeGrowth);if(o.userData.solidInterior)interiors.push(o.userData.solidInterior.map(p=>p.toArray()));});return {objects:s.pixelWorld.objects.map(({bounds,...o})=>o),obstacles:r.currentData.obstacles,lanterns:s.pathLanterns,lights,courses,interiors,hedgeCores,growth};});assert.equal(inventory.courses.length,6);assert.equal(inventory.lanterns.pairs.length*2,28);

  if(process.argv.includes('--timing')){
   const timings=[];
   for(const [name,x,y,yaw,pitch]of [['paper-lit',-36.88728,352.53024,1.333185,-.721968],['paper-dark',-106.0106,395.66802,-.159159,-.721968],['opening',0,10,0,0]]){
    await place(x,y,yaw,pitch);
    const measured=await p.evaluate(async()=>{
     const r=__stoneScene(),pixel=new Uint8Array(4),frame=async()=>{const t=performance.now();__stoneGame.render();await RCScene3D.whenPresented();r.renderer.readRenderTargetPixels(r.sceneTarget,0,0,1,1,pixel);return performance.now()-t;};
     for(let i=0;i<12;i++)await frame();const groups=[];
     for(let round=0;round<3;round++){const samples=[];for(let i=0;i<12;i++)samples.push(await frame());samples.sort((a,b)=>a-b);groups.push({median:samples[6],p95:samples[11],samples});}
     return {groups,resolution:RCScene3D.stats().resolution,draws:RCScene3D.stats().drawCalls};
    });timings.push({name,...measured});
   }
   assert.deepEqual(errors,[]);fs.writeFileSync(out+'/timing.json',JSON.stringify({before,software,timings,errors},null,2));console.log(JSON.stringify({before,software,timings:timings.map(t=>({name:t.name,medians:t.groups.map(g=>g.median)}))}));return;
  }

  const clues=await p.evaluate(()=>__stoneScene().environmentGuidance.stats().paperClues);
  const cameraFile='tools/fixtures/night-order/dropped-paper-cameras.json';
  const cameras=(before||software)?JSON.parse(fs.readFileSync(cameraFile,'utf8')):await p.evaluate(async clues=>{
   const THREE=await import('./vendor/three/three.module.js'),r=__stoneScene(),t=__stoneGame;
   window.__stoneNoCull=true;window.__habitatAllInstances=true;t.render();await RCScene3D.whenPresented();
   r.world.updateMatrixWorld(true);
   const meshes=[];r.world.traverse(o=>{if(!o.isMesh||o.name==='CourseDroppedPaper')return;let visible=true;for(let q=o;q;q=q.parent)if(!q.visible)visible=false;if(visible)meshes.push(o);});
   const ray=new THREE.Raycaster(),result=[];
   for(const c of clues){let chosen=null;
    for(const radius of [1.8,2.4,3]){for(const offset of [0,.5,-.5,1,-1,1.5,-1.5,Math.PI]){
     const angle=c.angle+offset,x=c.x+Math.sin(angle)*radius,z=c.z+Math.cos(angle)*radius,px=x/.1152,py=-z/.16;
     if(Math.abs(px)>=108||py<1||py>710||t.obstacleAtPosition(px,py,2.4))continue;
     const origin=new THREE.Vector3(x,1.65,z),target=new THREE.Vector3(c.x,.065,c.z),delta=target.clone().sub(origin),distance=delta.length();
     ray.set(origin,delta.normalize());ray.far=distance-.12;const hits=ray.intersectObjects(meshes,false);
     if(hits.length)continue;
     chosen={x:px,y:py,yaw:Math.atan2(c.x-x,z-c.z),pitch:Math.atan2(.065-1.65,radius),radius,clear:true};break;
    }if(chosen)break;}
    if(!chosen)throw new Error('No clear legal paper approach: '+JSON.stringify(c));result.push(chosen);
   }
   window.__stoneNoCull=false;window.__habitatAllInstances=false;t.render();await RCScene3D.whenPresented();return result;
  },clues);
  fs.writeFileSync(out+'/cameras.json',JSON.stringify(cameras,null,2));
  fs.writeFileSync(out+'/clues.json',JSON.stringify({clues,cameras},null,2));
  for(let i=0;i<clues.length;i++){const c=cameras[i];await place(c.x,c.y,c.yaw,c.pitch);await shot('paper-'+i);}
  if(process.argv.includes('--preview'))return;
  for(const i of [0,6]){const c=cameras[i],target=clues[i],radius=3.6;await place((target.x-Math.sin(c.yaw)*radius)/.1152,-(target.z+Math.cos(c.yaw)*radius)/.16,c.yaw,Math.atan2(.065-1.65,radius));await shot('approach-'+i);}
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});for(const i of [0,3,6]){const c=cameras[i];await place(c.x,c.y,c.yaw,c.pitch);await shot('paper-'+i+'-'+width);}}
  await p.setViewportSize({width:1280,height:720});await place(0,230,0,-.1);const start=await p.evaluate(()=>({...__stoneGame.state.player}));await p.keyboard.down('w');await p.evaluate(()=>advanceTime(400));await p.keyboard.up('w');await p.keyboard.down('d');await p.evaluate(()=>advanceTime(250));await p.keyboard.up('d');await draw();const end=await p.evaluate(()=>({...__stoneGame.state.player,legal:!__stoneGame.obstacleAtPosition(__stoneGame.state.player.x,__stoneGame.state.player.y,2.4)}));assert(end.legal&&Math.hypot(end.x-start.x,end.y-start.y)>1);await shot('walked');
  await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>__stoneGame.state.mode),'paused');await p.keyboard.press('Escape');await draw();
  const warm=await p.evaluate(()=>({memory:{...__stoneScene().renderer.info.memory},programs:__stoneScene().renderer.info.programs.length}));for(let i=0;i<12;i++){await p.evaluate(()=>__stoneGame.state.player.yaw+=.015);await draw();}const stable=await p.evaluate(()=>({memory:{...__stoneScene().renderer.info.memory},programs:__stoneScene().renderer.info.programs.length}));assert.deepEqual(stable,warm);
  const paper=await p.evaluate(()=>{const m=__stoneScene().world.getObjectByName('CourseDroppedPaper');if(!m)return null;window.__paperDisposed={geometry:0,material:0,map:0};for(const [key,o]of [['geometry',m.geometry],['material',m.material],['map',m.material.map]])o.addEventListener('dispose',()=>__paperDisposed[key]++);return {triangles:m.geometry.attributes.position.count/3,type:m.material.type,map:[m.material.map.image.width,m.material.map.image.height],castShadow:m.castShadow,receiveShadow:m.receiveShadow};});
  if(!before){assert.equal(paper.triangles,112);assert.equal(paper.type,'MeshLambertMaterial');assert.deepEqual(paper.map,[512,320]);}
  await p.evaluate(()=>RCScene3D.reset());await draw();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await draw();const rebuilt=await p.evaluate(()=>{let n=0,papers=0;__stoneScene().world.traverse(o=>{if(o.userData.stoneCourses)n++;if(o.name==='CourseDroppedPaper')papers++;});return {courses:n,papers,disposed:window.__paperDisposed};});assert.equal(rebuilt.courses,6);if(!before){assert.equal(rebuilt.papers,1);assert.deepEqual(rebuilt.disposed,{geometry:1,material:1,map:1});}assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,wholeWorldCullingExact:views.every(v=>!v.culling||v.culling.maxChannelDelta===0),before,software,inventory,views,start,end,warm,stable,rebuilt,clues,paper,errors},null,2));console.log(JSON.stringify({passed:true,before,software,views:views.length,stable,paper,rebuilt,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
