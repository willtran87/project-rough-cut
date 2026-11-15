const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('web/final-cut-machinery.js','utf8'),reference=source.slice(0,source.indexOf('export function createFinalCutMachinery'))+`
export function createFinalCutMachinery(audit){
 const geometry=new THREE.CylinderGeometry(1,1,1,12),material=new THREE.MeshLambertMaterial({color:'#728481'});geometry.rotateZ(Math.PI/2);
 return {addReel(id,parent,x,y,z,length){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(length,.32,.32);parent.add(mesh);audit(id,mesh);mesh.userData.dynamic=true;return mesh;},stats:()=>({reference:'former solid cylindrical reels with current state clocks'}),dispose(){material.dispose();}};
}`;
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),reports=[];try{
 for(const detailed of [false,true,true,false]){
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(!detailed)await p.route('**/final-cut-machinery.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:reference}));
  await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  for(const phase of ['arrival','close','folded','collapse']){
   await p.evaluate(async phase=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun(phase==='arrival'?{}:phase==='collapse'?{checkpoint:2,ending:{age:3.5,wreck:{x:12.5,y:74,yaw:-Math.PI/2}}}:{checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode=phase==='collapse'?'aftermath':'playing';
    if(['close','folded'].includes(phase)){Object.assign(r.rig,{x:0,y:50,yaw:0,phase:'pass',deployment:phase==='close'?1:.5,distance:.7,reelAngle:-.9});Object.assign(r.player,{x:6,y:59,yaw:Math.atan2(-6,-9),pitch:.08});}
    if(phase==='collapse')Object.assign(r.player,{x:16,y:81,yaw:Math.atan2(-5,-7),pitch:.12});__finalCut.run=r;await advanceTime(0);
   },phase);
   const data=await p.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4),samples=[];for(let i=0;i<16;i++){const start=performance.now();__finalCut.draw();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(i>=4)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);return {median:samples[6],p95:samples[11],samples,graphics:JSON.parse(render_game_to_text()).graphics};});reports.push({detailed,phase,...data});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({detailed,views:reports.slice(-4).map(({phase,median,p95})=>({phase,median,p95}))}));await p.close();
 }
 fs.mkdirSync('output/final-cut/machinery',{recursive:true});fs.writeFileSync('output/final-cut/machinery/profile.json',JSON.stringify({method:'Former cylinder geometry / detailed / detailed / former cylinder geometry, one SwiftShader browser. Both references use current simulation clocks. Four warmups and twelve frozen full-RGBA-readback draws per view at 960x540. Readback and host variability included; not sustained gameplay FPS or full release qualification.',reports},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
