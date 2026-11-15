const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out='output/final-cut/floodlight-reveal/profile-'+(software?'software':'hardware')+'.json';
const sources={baseline:fs.readFileSync('output/final-cut/floodlight-reveal/baseline/final-cut-scene.js','utf8'),current:fs.readFileSync('web/final-cut-scene.js','utf8')};
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});const reports=[];
 try{for(const variant of ['baseline','current','current','baseline']){
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:sources[variant]}));
  await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  for(const [name,pose]of [['arrival',{x:-2,y:2.5,yaw:.05,pitch:.2}],['fork',{x:16,y:58,yaw:-.8,pitch:.12}],['green',{x:0,y:82,yaw:0,pitch:.3}],['collapse',{x:0,y:82,yaw:1.7,pitch:.2}]]){
   const report=await p.evaluate(async({name,pose})=>{
    if(name==='collapse'){const {createRun}=await import('./final-cut-sim.js');const run=createRun({checkpoint:2,ending:{age:4}});run.mode='aftermath';__finalCut.run=run;}
    Object.assign(__finalCut.run.player,pose);await advanceTime(0);
    const gl=document.querySelector('canvas').getContext('webgl2'),pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4),samples=[];
    for(let i=0;i<16;i++){const start=performance.now();__finalCut.draw();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(i>=4)samples.push(performance.now()-start);}
    samples.sort((a,b)=>a-b);return {median:samples[6],p95:samples[11],samples,graphics:JSON.parse(render_game_to_text()).graphics};
   },{name,pose});reports.push({variant,name,...report});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({variant,views:reports.slice(-4).map(({name,median,p95,graphics})=>({name,median,p95,draws:graphics.draws,triangles:graphics.triangles}))}));await p.close();
 }
 fs.writeFileSync(out,JSON.stringify({method:'Same browser, sequential ABBA comparison of saved pre-floodlight scene and current scene. Four warmup plus twelve frozen draws per view, each followed by full RGBA readPixels. Includes synchronous readback; not sustained gameplay FPS or device qualification.',software,reports},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
