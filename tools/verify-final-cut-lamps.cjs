const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/final-cut/lamps/${software?'software':'hardware'}`;
const instrument=`
 window.__lampAudit=()=>{scene.updateMatrixWorld(true);return {fixtures:lamps.fixtures.map(f=>{
  const meshes=f.group.children,points=meshes.flatMap(m=>{const p=m.geometry.attributes.position;return Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)]);});
  const excess=Math.max(...points.flatMap(p=>[Math.abs(p[0])-f.spec.w/2,Math.abs(p[1])-f.spec.h/2,Math.abs(p[2])-f.spec.d/2]));
  const glass=meshes.find(m=>m.name==='FinaleLamp-glass');
  return {id:f.id,excess,vertices:points.length,glassColors:new Set(glass.geometry.attributes.color.array).size,channel:f.channel,position:f.group.getWorldPosition(new THREE.Vector3()).toArray(),matrix:f.group.matrixWorld.elements.slice(),registered:meshes.every(m=>contactMeshes.some(c=>c.mesh===m&&c.id===f.id)),beamGap:f.id.startsWith('headlamp-')?headlights.lights[lamps.fixtures.filter(q=>q.id.startsWith('headlamp-')).indexOf(f)].position.z-(-f.spec.forward-f.spec.d/2):null};
 }),light:headlights.lights.map(l=>({position:l.getWorldPosition(new THREE.Vector3()).toArray(),intensity:l.intensity})),reveal:rigLampState(lastRun),stats:lamps.stats(),resources:{geometry:renderer.info.memory.geometries,textures:renderer.info.memory.textures}};};
 window.__lampClose=id=>{const f=lamps.fixtures.find(f=>f.id===id);scene.updateMatrixWorld(true);camera.position.copy(f.group.localToWorld(new THREE.Vector3(.35,.19,-.68)));camera.up.set(0,1,0).transformDirection(f.group.matrixWorld);camera.lookAt(f.group.localToWorld(new THREE.Vector3(0,0,-f.spec.d/2)));renderer.autoClear=false;renderer.clear();renderer.render(backdrop.scene,backdrop.camera);renderer.clearDepth();renderer.render(scene,camera);renderer.autoClear=true;};
`;
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',instrument+'await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 const poses=[];
 for(const yaw of [0,Math.PI/2,Math.PI,3*Math.PI/2])for(const phase of ['turn','align','announce','pass']){
  const result=await p.evaluate(async({yaw,phase})=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:0,y:50,yaw,phase,attack:{entry:['south','west','north','east'][Math.round(yaw/(Math.PI/2))],axis:Math.abs(Math.sin(yaw))>.5?'x':'y',from:{x:0,y:50},to:{x:Math.sin(yaw)*60,y:50+Math.cos(yaw)*60},yaw,source:'mowing schedule'},age:0,deployment:phase==='pass'?1:0,speed:0});Object.assign(r.player,{x:0,y:55.5,yaw:Math.PI,pitch:-.05});__finalCut.run=r;await advanceTime(0);return __lampAudit();},{yaw,phase});
  assert.equal(result.fixtures.length,5);for(const f of result.fixtures){assert(f.excess<1e-7,JSON.stringify(f));assert(f.vertices>1000&&f.glassColors>=4);assert(f.id==='cab-lamp'||f.registered);if(f.beamGap!==null)assert(Math.abs(f.beamGap+.03)<1e-8);}
  assert.equal(result.light[0].intensity,phase==='pass'?48:0);assert.equal(result.light[1].intensity,result.light[0].intensity);assert.equal(result.reveal.marker,phase==='pass'?1:.04);poses.push({yaw,phase,...result});
 }
 const warning=[];
 for(const remaining of [.35,.175,0]){
  const result=await p.evaluate(async remaining=>{const {attackWarning}=await import('./final-cut-ambush.js');Object.assign(__finalCut.run.rig,{phase:'announce',age:attackWarning(__finalCut.run)-remaining,deployment:.45});await advanceTime(0);return __lampAudit();},remaining);
  const expected=remaining===.35?0:remaining===.175?.5:1;
  assert(Math.abs(result.reveal.beam-expected)<1e-8);assert(Math.abs(result.reveal.marker-(.04+.96*expected))<1e-8);assert(Math.abs(result.light[0].intensity-48*expected)<1e-6);warning.push({remaining,...result});
 }
 // Capture built fixtures with the production renderer and real scene lights.
 await p.evaluate(async()=>{Object.assign(__finalCut.run.rig,{yaw:0,phase:'pass',deployment:1});await advanceTime(0);});
 await p.screenshot({path:out+'/front.png',timeout:120000});
 for(const id of ['headlamp-1','wing-1-lamp','cab-lamp']){await p.evaluate(id=>__lampClose(id),id);await p.screenshot({path:out+'/'+id+'.png',timeout:120000});}
 const endings=[];
 for(const age of [0,4,8,12]){
  const result=await p.evaluate(async age=>{const {createRun,snapshot}=await import('./final-cut-sim.js');const r=createRun({checkpoint:2,ending:{age}});r.mode='aftermath';__finalCut.run=r;await advanceTime(0);const before=__lampAudit();__finalCut.run=createRun(snapshot(r));__finalCut.run.mode='aftermath';await advanceTime(0);return {age,before,restored:__lampAudit()};},age);
  assert.deepEqual(result.before.fixtures.map(f=>f.matrix),result.restored.fixtures.map(f=>f.matrix));assert.deepEqual(result.before.light,result.restored.light);assert.equal(result.before.light[0].intensity,48*Math.max(0,1-age/8));endings.push(result);
 }
 await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(0));const paused=await p.evaluate(()=>__lampAudit());await p.evaluate(()=>advanceTime(1000));assert.deepEqual(await p.evaluate(()=>__lampAudit()),paused);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,errors,poses,warning,endings,paused,graphics:await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics)},null,2));console.log(JSON.stringify({passed:true,software,poses:poses.length,warning:warning.length,endings:endings.length,stats:paused.stats,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
