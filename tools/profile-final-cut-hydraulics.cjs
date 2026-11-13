const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const reference=`import * as THREE from './vendor/three/three.module.js';
import {RIG_BANK} from './final-cut-rig.js';
export function createFinalCutHydraulics(body,materials,audit){const geometry=new THREE.BoxGeometry(2.4,.08,.08),bars=[-1,1].map(sign=>{const mesh=new THREE.Mesh(geometry,materials.brass);body.add(mesh);audit('reference-hydraulic-'+sign,mesh);return {sign,mesh};});return {update(left,right){for(const {sign,mesh}of bars){const a=sign<0?left:right,c=Math.cos(a),s=Math.sin(a);mesh.position.set(sign*(RIG_BANK.hinge+1.3*c-.25*s),RIG_BANK.height+1.3*s+.25*c,-RIG_BANK.forward);mesh.rotation.z=sign*a;}},stats:()=>({reference:'former rigid bars'}),dispose(){}};}`;
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),reports=[];try{
 for(const detailed of [false,true,true,false]){
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(!detailed)await p.route('**/final-cut-hydraulics.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:reference}));
  await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  for(const phase of ['arrival','extended','folded','collapse']){
   await p.evaluate(async phase=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun(phase==='arrival'?{}:phase==='collapse'?{checkpoint:2,ending:{age:3.6,wreck:{x:12.5,y:74,yaw:-Math.PI/2}}}:{checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode=phase==='collapse'?'aftermath':'playing';
    if(['extended','folded'].includes(phase)){Object.assign(r.rig,{x:0,y:50,yaw:0,phase:'announce',deployment:phase==='extended'?1:.5,distance:.7,reelAngle:-.9});Object.assign(r.player,{x:3.6,y:55.2,yaw:Math.atan2(-.7,-4.2),pitch:.12});}
    if(phase==='collapse')Object.assign(r.player,{x:16,y:81,yaw:Math.atan2(-4,-7),pitch:.12});__finalCut.run=r;await advanceTime(0);
   },phase);
   const data=await p.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4),samples=[];for(let i=0;i<16;i++){const start=performance.now();__finalCut.draw();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(i>=4)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);return {median:samples[6],p95:samples[11],samples,graphics:JSON.parse(render_game_to_text()).graphics};});reports.push({detailed,phase,...data});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({detailed,views:reports.slice(-4).map(({phase,median,p95})=>({phase,median,p95}))}));await p.close();
 }
 fs.mkdirSync('output/final-cut/hydraulics',{recursive:true});fs.writeFileSync('output/final-cut/hydraulics/profile.json',JSON.stringify({method:'Former rigid-bar geometry / connected hydraulics / connected hydraulics / former bars in one SwiftShader browser. Current simulation/clearance for both. Four warmups plus twelve frozen full-RGBA-readback draws/view at 960x540. Includes readback and host variability; not sustained gameplay FPS or complete performance qualification.',reports},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
