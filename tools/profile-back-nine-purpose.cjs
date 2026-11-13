const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-purpose',b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/back-nine-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()', 'return window.__purposeWorld={scene,camera,renderer,update,draw()')}));
 await p.route('**/__purpose-baseline.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`${out}/baseline-source/back-nine-scene.js`,'utf8')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 await p.evaluate(async()=>{const{createChaseScene}=await import('./__purpose-baseline.js');window.__oldPurpose=await createChaseScene(__purposeWorld.renderer,true);});
 const results=[];
 for(const [name,x,y,yaw,cp]of [['yard',20,150,.65,0],['range',24,464,.65,1],['wet',-29,443,0,1]])results.push(await p.evaluate(async({name,x,y,yaw,cp})=>{
  const{createRun}=await import('./back-nine-sim.js'),r=createRun(cp);r.mode='driving';r.time=5;Object.assign(r.cart,{x,y,yaw});Object.assign(r.joe,{x:0,y:y-20});const renderer=__purposeWorld.renderer,gl=renderer.getContext();renderer.setSize(960,540,false);
  for(const w of [__oldPurpose,__purposeWorld]){w.resetCamera();w.camera.aspect=16/9;w.camera.updateProjectionMatrix();}
  async function draw(w){const start=performance.now();w.update(r,{reducedMotion:true});w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);return performance.now()-start;}
  const timings=[];for(const current of [false,true,true,false]){const w=current?__purposeWorld:__oldPurpose;await draw(w);const times=[];for(let i=0;i<24;i++)times.push(await draw(w));times.sort((a,b)=>a-b);timings.push({current,median:times[12],p95:times[22],draws:w.stats().draws,triangles:w.stats().triangles});}return {name,timings};
 },{name,x,y,yaw,cp}));
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/performance.json`,JSON.stringify({results,errors},null,2));console.log(JSON.stringify(results));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
