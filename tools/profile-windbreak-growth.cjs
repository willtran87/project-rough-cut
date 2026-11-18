const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2],native=process.argv.includes('--native');if(!out)throw Error('Provide output directory');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:native?['--use-angle=d3d11','--ignore-gpu-blocklist']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/back-nine-scene.js*',r=>{
   const baseline=r.request().url().includes('qa-windbreak-baseline');
   let body=fs.readFileSync(baseline?'output/back-nine-visual-upgrade/windbreak-growth/baseline-source/back-nine-scene.js':'web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()',baseline?'return {scene,camera,renderer,update,draw()':'return window.__mistProfileWorld={scene,camera,renderer,update,draw()');
   if(baseline)body=body.replace("'./back-nine-shrub-craft.js'","'./back-nine-shrub-craft.js?qa-windbreak-baseline'");
   return r.fulfill({contentType:'application/javascript',body});
  });
  await p.route('**/back-nine-shrub-craft.js?qa-windbreak-baseline',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/back-nine-visual-upgrade/windbreak-growth/baseline-source/back-nine-shrub-craft.js','utf8')}));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const results=await p.evaluate(async native=>{
   const {createChaseScene}=await import('./back-nine-scene.js?qa-windbreak-baseline'),{createRun}=await import('./back-nine-sim.js');
   const current=__mistProfileWorld,renderer=current.renderer;await __backNine.whenPresented();
   const baseline=await createChaseScene(renderer,!native),worlds={baseline,current},gl=renderer.getContext();
   renderer.setSize(960,540,false);for(const w of Object.values(worlds)){w.camera.aspect=16/9;w.camera.updateProjectionMatrix();}
   const fence=async()=>{const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(sync,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(sync);};
   const results=[];
   for(const [name,x,y,yaw,foot]of [['nursery-side',-7,124,-.65,true],['range-side',-14,420,-.65,true],['unaffected-road',0,25,0,false]]){
    const runs={};for(const [key,w]of Object.entries(worlds)){
     const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;Object.assign(r.cart,{x,y,yaw,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0});
     if(foot){Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};}
     runs[key]=r;w.resetCamera();for(let i=0;i<6;i++){w.update(r,{});w.draw();await fence();}
    }
    const timings={baseline:[],current:[]},stats={};
    // Both worlds are already prepared on the same renderer. Alternate short
    // blocks so loading, fresh-context warmup and host drift do not determine
    // which candidate receives the favourable measurement window.
    for(const key of ['baseline','current','current','baseline','current','baseline']){
     const w=worlds[key];for(let i=0;i<16;i++){const start=performance.now();w.update(runs[key],{});w.draw();await fence();if(i>=4)timings[key].push(performance.now()-start);}
     const s=w.stats();stats[key]={draws:s.draws,triangles:s.triangles,programs:s.programs,textures:s.textures};
    }
    const result={name};for(const key of ['baseline','current']){const times=timings[key].sort((a,b)=>a-b);result[key]={samples:times.length,median:times[18],p95:times[34],...stats[key],times};}results.push(result);
   }
   current.dispose();baseline.dispose();return results;
  },native);
  assert.deepEqual(errors,[]);for(const r of results){console.log(JSON.stringify({name:r.name,baseline:{median:r.baseline.median,p95:r.baseline.p95},current:{median:r.current.median,p95:r.current.p95}}));}
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,native,resolution:[960,540],method:'Two prepared worlds on one renderer; alternating short blocks, GPU completion fenced, same run/camera. Shared host remains a source of timing noise.',results,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
