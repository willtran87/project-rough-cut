const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/shading-cost';fs.mkdirSync(out,{recursive:true});
const hook=`window.__shadeCost=()=>{
 const meshes=[],localLights=[];scene.traverse(m=>{if(m.isMesh)meshes.push(m);if(m.isLight&&!m.isDirectionalLight&&!m.isHemisphereLight&&!m.isAmbientLight)localLights.push(m);});
 const originals=meshes.map(m=>({visible:m.visible,receive:m.receiveShadow})),lights=localLights.map(l=>l.visible),reeds=scene.getObjectByName('AmbushReedScreens'),colorWrite=reeds.material.colorWrite,depthWrite=reeds.material.depthWrite;
 const pixels=new Uint8Array(width*height*4),reports=[];
 for(const mode of ['normal','cached-shadows','no-shadow-receivers','no-shadow-maps','no-shadows-or-local-lights','no-rig-surfaces','no-reed-color','normal']){
  meshes.forEach((m,i)=>{m.visible=originals[i].visible;m.receiveShadow=mode==='no-shadow-receivers'?false:originals[i].receive;});localLights.forEach((l,i)=>l.visible=mode==='no-shadows-or-local-lights'?false:lights[i]);
  renderer.shadowMap.enabled=!['no-shadow-maps','no-shadows-or-local-lights'].includes(mode);reeds.material.colorWrite=mode==='no-reed-color'?false:colorWrite;reeds.material.depthWrite=mode==='no-reed-color'?false:depthWrite;
  if(mode==='no-rig-surfaces')rig.traverse(m=>{if(m.isMesh)m.visible=false;});
  const draw=()=>{if(mode!=='cached-shadows')headlights.lights.forEach(l=>l.shadow.needsUpdate=true);renderer.render(scene,camera);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);};
  for(let i=0;i<2;i++)draw();const times=[];for(let i=0;i<5;i++){const start=performance.now();draw();times.push(performance.now()-start);}times.sort((a,b)=>a-b);
  reports.push({mode,median:times[2],max:times[4],calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});
 }
 meshes.forEach((m,i)=>{m.visible=originals[i].visible;m.receiveShadow=originals[i].receive;});localLights.forEach((l,i)=>l.visible=lights[i]);renderer.shadowMap.enabled=true;reeds.material.colorWrite=colorWrite;reeds.material.depthWrite=depthWrite;
 return {reports,lights:localLights.map(l=>({type:l.type,intensity:l.intensity,distance:l.distance,shadow:l.castShadow})),heavy:meshes.map(m=>({name:m.name,material:Object.keys(materials).find(k=>materials[k]===m.material)||m.material.type,instances:m.count||1,triangles:(m.geometry.index?.count||m.geometry.attributes.position?.count||0)/3*(m.isInstancedMesh?m.count:1),parent:m.parent.type,shadow:m.castShadow})).sort((a,b)=>b.triangles-a.triangles).slice(0,15)};
};`;
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:960,height:540}});page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');assert(source.includes('await renderer.compileAsync(scene,camera);'));await page.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);')}));
 await page.goto('http://127.0.0.1:4187/final-cut.html?test',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__shadeCost&&JSON.parse(render_game_to_text()).ready);
 await page.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:0,y:49.38,yaw:0,phase:'pass',age:3,deployment:1});Object.assign(r.player,{x:5,y:55,yaw:Math.atan2(-4,3.1),pitch:.14});__finalCut.run=r;await advanceTime(0);});
 const data=await page.evaluate(()=>__shadeCost());assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({data,errors},null,2));console.log(JSON.stringify({data,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
