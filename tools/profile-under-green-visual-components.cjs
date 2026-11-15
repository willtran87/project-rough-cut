// Diagnostic omissions isolate cost; these altered images are never a release candidate.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/visual-upgrade/pass14-profile';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),rows=[],errors=[];
 try{
  for(const variant of ['full','no-practicals','no-stain-shader','basic-shader','occluders-96']){
   const page=await browser.newPage({viewport:{width:480,height:300}});page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/under-green-scene.js',route=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');const marker=' return {draw,drainJoeFootsteps:';assert(s.includes(marker));s=s.replace(marker,' window.__cost={renderer,scene,camera};'+marker);if(variant==='basic-shader')s=s.replace('const scene=new THREE.Scene();','const diagnosticBasic=new THREE.MeshBasicMaterial({color:0x777777});const scene=new THREE.Scene();').replace('try{renderer.render(scene,camera);}', 'try{scene.overrideMaterial=diagnosticBasic;renderer.render(scene,camera);scene.overrideMaterial=null;}');if(variant==='occluders-96')s=s.replace('maxSolids:24','maxSolids:96');return route.fulfill({contentType:'application/javascript',body:s});});
   if(variant==='no-practicals')await page.route('**/under-green-practical-lighting.js',route=>{let s=fs.readFileSync('web/under-green-practical-lighting.js','utf8');assert(s.includes('if(!indices.length)return;'));s=s.replace('if(!indices.length)return;','return;');return route.fulfill({contentType:'application/javascript',body:s});});
   if(variant==='no-stain-shader')await page.route('**/under-green-crafted-surfaces.js',route=>{let s=fs.readFileSync('web/under-green-crafted-surfaces.js','utf8');s=s.replace(' material.onBeforeCompile=s=>{',' return; material.onBeforeCompile=s=>{');return route.fulfill({contentType:'application/javascript',body:s});});
   await page.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__cost&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await page.click('#primary');await page.keyboard.press('Escape');
   for(const [name,x,y,yaw]of [['gallery',0,20,0],['keeper',12,14.6,Math.PI]]){
    const result=await page.evaluate(async({x,y,yaw})=>{
     const {onFloor}=await import('./under-green-course.js');if(!onFloor(x,y))throw Error('Camera outside walkable level');const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=24;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch:-.12});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();
     const gl=__cost.renderer.getContext(),samples=[],cpu=[];
     for(let i=0;i<24;i++){
      const start=performance.now();advanceTime(0);const submit=performance.now(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU timeout');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(f);if(i>=6){samples.push(performance.now()-start);cpu.push(submit-start);}
     }
     const sorted=[...samples].sort((a,b)=>a-b);return {median:sorted[9],p95:sorted[17],cpuMedian:cpu.sort((a,b)=>a-b)[9],samples,graphics:JSON.parse(render_game_to_text()).graphics};
    },{x,y,yaw});rows.push({variant,name,...result});await page.screenshot({path:`${out}/${variant}-${name}.png`});console.log(JSON.stringify({variant,name,median:result.median,p95:result.p95,cpu:result.cpuMedian,draws:result.graphics.draws,triangles:result.graphics.triangles}));fs.writeFileSync(`${out}/partial.json`,JSON.stringify({rows,errors},null,2));
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({diagnosticOnly:true,method:'480x300 SwiftShader, fixed poses, six warmups and 18 GPU-fence-completed samples; omitted components change visuals.',rows,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
