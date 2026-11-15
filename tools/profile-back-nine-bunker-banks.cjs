const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2],native=process.argv.includes('--native'),tessellation=process.argv.includes('--bank-tessellation');
if(!out)throw Error('Provide an output directory');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:native?['--use-angle=d3d11','--ignore-gpu-blocklist']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];
 try{
  for(const baseline of (process.argv.includes('--reverse')?[false,true]:[true,false])){
   const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   for(const file of ['back-nine-scene.js','back-nine-planting.js'])await p.route('**/'+file+'*',r=>{
    let body=fs.readFileSync((baseline?(tessellation?'output/back-nine-visual-upgrade/bunker-depth/baseline-source':'output/back-nine-visual-upgrade/bunker-banks/baseline-source'):'web')+'/'+file,'utf8');
    if(file==='back-nine-scene.js')body=body.replace('return {scene,camera,update,draw()','return window.__bankWorld={scene,camera,renderer,update,draw()');
    return r.fulfill({contentType:'application/javascript',body});
   });
   await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
   await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
   for(const [name,x,y,yaw,foot]of [['sand-entry',14,225,.3,true],['road-through',-28,465,0,false]]){
    const result=await p.evaluate(async({x,y,yaw,foot})=>{
     const {createRun}=await import('./back-nine-sim.js'),r=createRun(0,0,713),w=__bankWorld,gl=w.renderer.getContext();
     r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;
     Object.assign(r.cart,{x,y,yaw,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0});
     if(foot){Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};}
     await __backNine.whenPresented();w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.resetCamera();
     const timings=[];for(let i=0;i<40;i++){
      const start=performance.now();w.update(r,{});w.draw();
      const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
      while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(fence);
      if(i>=8)timings.push(performance.now()-start);
     }
     timings.sort((a,b)=>a-b);const s=w.stats();return{samples:timings.length,median:timings[16],p95:timings[30],draws:s.draws,triangles:s.triangles,programs:s.programs,textures:s.textures};
    },{x,y,yaw,foot});
    results.push({baseline,name,...result});console.log(JSON.stringify(results.at(-1)));
   }
   assert.deepEqual(errors,[]);await p.close();
  }
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,native,resolution:[960,540],results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
