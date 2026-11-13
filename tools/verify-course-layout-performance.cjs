const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/course-layout',b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__buffers++;return f.apply(this,a);};});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__beaconPerfPerf={scene,camera,renderer,update,draw()')}));
 const modules=['back-nine-scene','back-nine-landscape'];for(const m of modules)await p.route('**/__beaconPerf-old-'+m+'.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`${out}/baseline-source/${m}.js`,'utf8').replace(/'\.\/([^']+)\.js'/g,(match,name)=>modules.includes(name)?`'./__beaconPerf-old-${name}.js'`:match)}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));await p.evaluate(async()=>{const{createChaseScene}=await import('./__beaconPerf-old-back-nine-scene.js');window.__beaconPerfOld=await createChaseScene(__beaconPerfPerf.renderer,true);});
 const cases=[],focus=process.argv.find(a=>a.startsWith('--focus='))?.slice(8);
 for(const [name,x,y,yaw,rear]of [['fairway',12,67,.18,false],['court',-10,191,0,false],['bunker',-28,455,0,false],['foliage',-29,443,-1.2,true],['club',-28,713,0,false]]){
  if(focus&&focus!==name)continue;
  const result=await p.evaluate(async a=>{
   const[name,x,y,yaw,rear]=a,{createRun}=await import('./back-nine-sim.js'),r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{x,y,yaw,speed:8,health:15,surface:name==='wet'?'wet':'rough'});Object.assign(r.joe,{x:x+2,y:y-12,speed:12});const w=[__beaconPerfOld,__beaconPerfPerf],renderer=__beaconPerfPerf.renderer,gl=renderer.getContext();renderer.setSize(960,540,false);
   for(const v of w){v.camera.aspect=16/9;v.camera.updateProjectionMatrix();}
   const samples=[[],[]],stats=[[],[]];
   async function draw(which,n){r.time=10+n/30;r.distance=20+n*8/30;r.cart.y=y+n*8/30;r.joe.y=r.cart.y-12;const t=performance.now();w[which].update(r,{rear,reducedMotion:false});const cpu=performance.now()-t;w[which].draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);return {total:performance.now()-t,cpu};}
   for(const which of[0,1]){w[which].resetCamera();for(let n=0;n<6;n++)await draw(which,n);}
   const buffers=__buffers;
   for(const which of[0,1,1,0]){w[which].resetCamera();for(let n=0;n<48;n++){samples[which].push(await draw(which,n));const s=w[which].stats();stats[which].push({draws:s.draws,triangles:s.triangles});}}
   const summary=s=>{const t=s.map(x=>x.total).sort((a,b)=>a-b),c=s.map(x=>x.cpu).sort((a,b)=>a-b);return {median:t[48],p95:t[91],max:t[95],cpuP95:c[91]};};return {name,newBuffers:__buffers-buffers,timing:samples.map(summary),draws:stats.map(v=>[Math.min(...v.map(s=>s.draws)),Math.max(...v.map(s=>s.draws))]),triangles:stats.map(v=>[Math.min(...v.map(s=>s.triangles)),Math.max(...v.map(s=>s.triangles))])};
  },[name,x,y,yaw,rear]);cases.push(result);console.log(JSON.stringify(result));assert.equal(result.newBuffers,0);fs.writeFileSync(out+(focus?'/moving-'+focus+'.json':'/moving-performance.json'),JSON.stringify({cases,errors},null,2));
 }assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
