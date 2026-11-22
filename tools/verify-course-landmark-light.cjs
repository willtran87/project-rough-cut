const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {restoreFullIndexReference}=require('./fixtures/full-index-reference.cjs');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const before=false,software=process.argv.includes('--software'),preview=process.argv.includes('--preview');
 const base='output/level-one-landmark-light',out=`${base}/${before?'before':'after'}-${software?'software':'native'}`;fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__landmarkGame={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('softwareBudget=createSoftwareFrameBudget()','softwareBudget=createSoftwareFrameBudget({scales:[.625]})').replace('understoryCulling?.update(camera);','if(window.__landmarkNoCull)understoryCulling?.restore();else understoryCulling?.update(camera);')+'\nwindow.__landmarkScene=()=>({world,renderer,camera,currentData,sceneTarget});'}));
 await page.route('**/pixel-world-props.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/pixel-world-props.js','utf8').replace('function updateCulling(camera){',`function updateCulling(camera){if(window.__landmarkNoCull){cullValid=false;for(const m of culledMeshes){if(m.userData.fullIndices)(${restoreFullIndexReference.toString()})(m);else m.visible=true;}return;}`)}));
 const draw=()=>page.evaluate(async()=>{__landmarkGame.render();await RCScene3D.whenPresented();});
 async function shot(name,x,y,yaw,pitch=0){
  const legal=await page.evaluate(v=>{const t=__landmarkGame;if(t.obstacleAtPosition(v.x,v.y,2.4)){search:for(let ring=1;ring<6;ring++)for(let a=0;a<12;a++){const x=v.x+Math.cos(a*Math.PI/6)*ring*6,y=v.y+Math.sin(a*Math.PI/6)*ring*6;if(Math.abs(x)<108&&y>0&&y<710&&!t.obstacleAtPosition(x,y,2.4)){v.x=x;v.y=y;break search;}}}Object.assign(t.state.player,v);return !t.obstacleAtPosition(v.x,v.y,2.4);},{x,y,yaw,pitch});assert(legal,name+' camera must be in playable clearance');await draw();
  await page.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:95});
  const view=await page.evaluate(name=>{const r=__landmarkScene(),s=RCScene3D.stats();return {name,pose:{...__landmarkGame.state.player},camera:r.camera.position.toArray(),resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles,memory:{...r.renderer.info.memory},programs:r.renderer.info.programs.length};},name);
  if(software&&!preview){view.culling=await page.evaluate(async()=>{const r=__landmarkScene(),read=()=>{const t=r.sceneTarget,a=new Uint8Array(t.width*t.height*4);r.renderer.readRenderTargetPixels(t,0,0,t.width,t.height,a);return a;},a=read();window.__landmarkNoCull=true;__landmarkGame.render();await RCScene3D.whenPresented();const b=read();window.__landmarkNoCull=false;__landmarkGame.render();await RCScene3D.whenPresented();const c=read();let changed=0,max=0,restored=0;for(let i=0;i<a.length;i++){if(a[i]!==b[i])changed++;max=Math.max(max,Math.abs(a[i]-b[i]));if(a[i]!==c[i])restored++;}return {changed,max,restored};});assert.equal(view.culling.changed,0,name+' full geometry');assert.equal(view.culling.restored,0,name+' restored geometry');}
  views.push(view);
 }
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__landmarkGame);
  await page.evaluate(()=>{const t=__landmarkGame,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true,effectsDensity:0});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});
  await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});await draw();
  const inventory=await page.evaluate(()=>{const r=__landmarkScene(),s=RCScene3D.stats(),lights=[],rooms=[];r.world.traverse(o=>{if(o.isLight)lights.push({name:o.name,type:o.type,position:o.position.toArray(),color:o.color.getHex(),power:o.intensity,distance:o.distance});if(o.userData.roomKind){const a=o.geometry.attributes;rooms.push({name:o.name,kind:o.userData.roomKind,index:Array.from(o.geometry.index.array),attributes:Object.fromEntries(Object.entries(a).filter(([k])=>k!=='roomLight').map(([k,v])=>[k,Array.from(v.array)])),strength:a.roomLight?Array.from(a.roomLight.array):null});}});return {objects:s.pixelWorld.objects,lights,lanterns:s.pathLanterns,obstacles:r.currentData.obstacles,rooms};});
  assert.equal(inventory.lanterns.pairs.length*2,28);
  assert.equal(inventory.rooms.find(r=>r.kind==='clubhouse').index.length/6,51);
  if(!before){for(const r of inventory.rooms){assert(r.strength.every(v=>v>0&&v<=1));for(let i=0;i<r.strength.length;i+=4)assert(r.strength.slice(i,i+4).every(v=>v===r.strength[i]));if(r.kind==='workshop')assert(r.strength.every(v=>v===1));}assert(new Set(inventory.rooms.find(r=>r.kind==='clubhouse').strength).size>4);}
  if(process.argv.includes('--timing')){
   const timings=[];
   for(const [name,x,y,yaw,pitch]of [['crossing',55,302,1,.03],['west',70,322,Math.PI/2,.06],['opening',0,10,0,0]]){
    await page.evaluate(v=>Object.assign(__landmarkGame.state.player,v),{x,y,yaw,pitch});await draw();
    timings.push(await page.evaluate(async name=>{const r=__landmarkScene(),pixel=new Uint8Array(4),frame=async()=>{const t=performance.now();__landmarkGame.render();await RCScene3D.whenPresented();r.renderer.readRenderTargetPixels(r.sceneTarget,0,0,1,1,pixel);return performance.now()-t;};for(let i=0;i<12;i++)await frame();const groups=[];for(let round=0;round<3;round++){const samples=[];for(let i=0;i<24;i++)samples.push(await frame());samples.sort((a,b)=>a-b);groups.push({median:samples[12],p95:samples[22],samples});}return {name,groups,resolution:RCScene3D.stats().resolution,draws:RCScene3D.stats().drawCalls};},name));
   }
   assert.deepEqual(errors,[]);fs.writeFileSync(out+'/timing.json',JSON.stringify({before,software,timings,errors},null,2));console.log(JSON.stringify({before,software,timings:timings.map(t=>({name:t.name,medians:t.groups.map(g=>g.median)}))}));return;
  }
  for(const v of [['clubhouse',55,302,1.0,.03],['clubhouse-west',70,322,Math.PI/2,.06],['clubhouse-south',60,350,2.1,.03],['clubhouse-north',75,280,.85,.03],['opening',0,10,0,0],['audit-approach',70,130,.45,.03]])await shot(...v);
  if(!preview){for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await shot('clubhouse-'+width,55,302,1,.03);}}
  let behavior=null;
  if(!preview){
   await page.setViewportSize({width:1280,height:720});await shot('walk-start',55,302,1,.03);
   const start=await page.evaluate(()=>({...__landmarkGame.state.player}));await page.keyboard.down('w');await page.evaluate(()=>advanceTime(300));await page.keyboard.up('w');await draw();
   const end=await page.evaluate(()=>({...__landmarkGame.state.player,legal:!__landmarkGame.obstacleAtPosition(__landmarkGame.state.player.x,__landmarkGame.state.player.y,2.4)}));assert(end.legal&&Math.hypot(end.x-start.x,end.y-start.y)>1);
   const occupancy=()=>page.evaluate(()=>Array.from(__landmarkScene().world.getObjectByName('ClubhouseEmptyRooms').geometry.attributes.roomLight?.array||[]));const stableRooms=await occupancy();
   await page.keyboard.press('Escape');await page.evaluate(()=>advanceTime(500));assert.equal(await page.evaluate(()=>__landmarkGame.state.mode),'paused');await page.keyboard.press('Escape');await draw();assert.deepEqual(await occupancy(),stableRooms);
   const warm=await page.evaluate(()=>({memory:{...__landmarkScene().renderer.info.memory},programs:__landmarkScene().renderer.info.programs.length}));
   for(let i=0;i<12;i++){await page.evaluate(()=>{__landmarkGame.state.reducedMotion=false;__landmarkGame.state.player.yaw+=.01;advanceTime(17);});await draw();}assert.deepEqual(await occupancy(),stableRooms);
   const stable=await page.evaluate(()=>({memory:{...__landmarkScene().renderer.info.memory},programs:__landmarkScene().renderer.info.programs.length}));assert.deepEqual(stable,warm);
   await page.evaluate(()=>{const m=__landmarkScene().world.getObjectByName('ClubhouseEmptyRooms');window.__landmarkDisposed={geometry:0,material:0};m.geometry.addEventListener('dispose',()=>__landmarkDisposed.geometry++);m.material.addEventListener('dispose',()=>__landmarkDisposed.material++);RCScene3D.reset();});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await draw();assert.deepEqual(await occupancy(),stableRooms);
   const disposed=await page.evaluate(()=>window.__landmarkDisposed);assert.deepEqual(disposed,{geometry:1,material:1});behavior={start,end,warm,stable,disposed};
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,inventory,views,behavior,errors},null,2));console.log(JSON.stringify({passed:true,before,software,views:views.length,behavior,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
