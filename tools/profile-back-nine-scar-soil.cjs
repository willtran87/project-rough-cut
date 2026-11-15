const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/back-nine-visual-upgrade/scar-soil/budget';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const results=[];
 for(const baseline of [true,false]){
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  for(const file of ['back-nine-scene.js','back-nine-mower-scars.js'])await p.route('**/'+file+'*',route=>{
   let source=fs.readFileSync((baseline?'output/back-nine-visual-upgrade/scar-soil/baseline-source/':'web/')+file,'utf8');
   if(file==='back-nine-scene.js')source=source.replace('const tracks=createBackNineMowerScars','const tracks=window.__scarTracks=createBackNineMowerScars').replace('return {scene,camera,update,draw()','return window.__scarWorld={scene,camera,renderer,update,draw()');
   route.fulfill({contentType:'application/javascript',body:source});
  });
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const result=await p.evaluate(async()=>{
   const {createRun}=await import('./back-nine-sim.js'),r=createRun(0,0,713),w=__scarWorld,gl=w.renderer.getContext();r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;
   Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x:20,y:43,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};Object.assign(r.joe,{x:20,y:43,yaw:0,speed:10,mode:'pursuing'});r.joe.ram.phase='none';__scarTracks.update(r);
   for(let i=1;i<=96;i++){r.time+=.05;r.joe.y=43+i*.5;r.joe.x=20+3*Math.sin(i*.025);r.joe.yaw=Math.atan2(.075*Math.cos(i*.025),.5);__scarTracks.update(r);}r.joe.speed=0;
   await __backNine.whenPresented();w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.resetCamera();
   const samples={visible:[],hidden:[]},stats={};
   for(const mode of ['visible','hidden','hidden','visible'])for(let n=0;n<24;n++){
    const start=performance.now();w.update(r,{});for(const b of __scarTracks.batches)b.mesh.visible=mode==='visible'&&b.used>0;
    const cpu=performance.now()-start;w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(fence);
    if(n>=4)samples[mode].push({cpu,total:performance.now()-start});stats[mode]=w.stats();
   }
   return Object.fromEntries(Object.entries(samples).map(([mode,values])=>{const times=values.map(v=>v.total).sort((a,b)=>a-b),cpu=values.map(v=>v.cpu).sort((a,b)=>a-b);return [mode,{samples:times.length,median:times[20],p95:times[38],cpuP95:cpu[38],draws:stats[mode].draws,triangles:stats[mode].triangles,programs:stats[mode].programs,textures:stats[mode].textures}];}));
  });
  assert.deepEqual(errors,[]);results.push({baseline,result,errors});console.log(JSON.stringify(results.at(-1)));await p.close();
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,resolution:[960,540],results},null,2));
 }finally{await browser.close();}})().catch(e=>{fs.writeFileSync(out+'/report.json',JSON.stringify({passed:false,error:e.stack},null,2));console.error(e);process.exitCode=1;});
