const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2],native=process.argv.includes('--native');if(!out)throw Error('Output directory required');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:native?['--use-angle=d3d11','--ignore-gpu-blocklist']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__estateWorld={scene,camera,renderer,backdrop,update,draw()')}));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const results=await p.evaluate(async()=>{
   const {createRun}=await import('./back-nine-sim.js'),w=__estateWorld,r=w.renderer,gl=r.getContext(),group=w.backdrop.scene.getObjectByName('distant-estate-structures'),lamp=group.getObjectByName('distant-estate-lamp');
   await __backNine.whenPresented();r.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();
   const fence=async()=>{const s=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(s,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(s);};
   const pixels=()=>{w.draw();const a=new Uint8Array(960*540*4);gl.readPixels(0,0,960,540,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;};
   const changed=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n;};
   const results=[];
   for(const[name,x,y,yaw]of [['cottage',20,65,.46],['tower',-26,76,-.78],['barn',21,712,1.95]]){
    const run=createRun(0,0,713);run.mode='driving';run.time=20;run.grace=0;run.departure.phase='finished';run.tension.cooldown=run.hunt.cooldown=100;run.panic.armed=false;
    Object.assign(run.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(run.joe,{x:0,y:10,speed:0});run.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};
    w.resetCamera();for(let i=0;i<6;i++){w.update(run,{});w.draw();await fence();}
    group.visible=true;lamp.visible=true;const on=pixels();lamp.visible=false;const unlit=pixels();lamp.visible=true;group.visible=false;const off=pixels();group.visible=true;
    const timings={baseline:[],current:[]},stats={};
    for(const key of ['baseline','current','current','baseline','current','baseline']){
     group.visible=key==='current';for(let i=0;i<16;i++){const start=performance.now();w.update(run,{});w.draw();await fence();if(i>=4)timings[key].push(performance.now()-start);}
     const s=w.stats();stats[key]={draws:s.draws,triangles:s.triangles,programs:s.programs,textures:s.textures};
    }
    group.visible=true;const result={name,structurePixels:changed(on,off),lampPixels:changed(on,unlit)};
    for(const key of ['baseline','current']){const times=timings[key].sort((a,b)=>a-b);result[key]={samples:times.length,median:times[18],p95:times[34],...stats[key]};}results.push(result);
   }
   return results;
  });
  assert.deepEqual(errors,[]);for(const r of results){assert(r.structurePixels>20);assert(r.lampPixels>0);assert.equal(r.current.triangles,r.baseline.triangles);assert.equal(r.current.draws,r.baseline.draws+4);console.log(JSON.stringify(r));}
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,native,resolution:[960,540],method:'Same prepared world, architecture visibility alternated; 36 GPU-fenced samples per variant per view. Pixel readback includes near-scene occlusion. Shared host timing noise remains.',results,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
