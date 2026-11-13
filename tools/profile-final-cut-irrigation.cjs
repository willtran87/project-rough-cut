const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const reports=[];try{
 for(const enabled of [false,true,true,false]){
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  if(!enabled)await p.route('**/final-cut-irrigation.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'export function createFinalCutIrrigation(){return {update(){},stats:()=>({disabledForCostProbe:true}),dispose(){}}}'}));
  await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  for(const phase of ['arrival','pump','water','collapse']){
   await p.evaluate(async phase=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun(phase==='water'?{checkpoint:1}:phase==='collapse'?{checkpoint:2,ending:{age:4.5,wreck:{x:12.5,y:74,yaw:-Math.PI/2}}}:{});r.mode=phase==='collapse'?'aftermath':'playing';if(phase==='pump')Object.assign(r.player,{x:8,y:37.4,yaw:0,pitch:.12});if(phase==='water'||phase==='collapse')Object.assign(r.player,{x:20,y:82,yaw:Math.atan2(-12,-8),pitch:.13});__finalCut.run=r;await advanceTime(0);},phase);
   const data=await p.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4),samples=[];for(let i=0;i<16;i++){const start=performance.now();__finalCut.draw();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(i>=4)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);return {median:samples[6],p95:samples[11],samples,graphics:JSON.parse(render_game_to_text()).graphics};});reports.push({enabled,phase,...data});
  }
  console.log(JSON.stringify({enabled,errors,reports:reports.slice(-4).map(({phase,median,p95})=>({phase,median,p95}))}));await p.close();
 }
 fs.mkdirSync('output/final-cut/irrigation',{recursive:true});fs.writeFileSync('output/final-cut/irrigation/profile.json',JSON.stringify({method:'Irrigation omitted/enabled/enabled/omitted in one SwiftShader browser. 960x540, four warmups and twelve frozen full-RGBA-readback draws per phase. Omitted reference removes the entire new module, not a reconstruction of the old water effect. Includes readback cost; not sustained gameplay FPS or an old-vs-new regression claim.',reports},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
