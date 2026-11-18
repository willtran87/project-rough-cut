const fs=require('node:fs'),{chromium}=require('playwright');
const root='output/back-nine-visual-upgrade/'+(process.argv.includes('--face')?'player-face':'player'),out=root+'/budget';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const results=[];
 for(const baseline of [true,false]){
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  for(const name of ['back-nine-scene.js','chase-runner.js','runner-materials.js'])await p.route('**/'+name+'*',r=>{let source=fs.readFileSync((baseline?root+'/baseline-source/':'web/')+name,'utf8');if(name==='back-nine-scene.js')source=source.replace('return {scene,camera,update,draw()','return window.__budgetWorld={scene,camera,renderer,runner,update,draw()');return r.fulfill({contentType:'application/javascript',body:source});});
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const result=await p.evaluate(async()=>{
   const {createRun}=await import('./back-nine-sim.js'),r=createRun(1),w=__budgetWorld;r.mode='driving';r.time=20;r.grace=0;r.foot={x:-12,y:371,yaw:-.4,viewYaw:-.4,speed:0,onFoot:true,invulnerable:0};Object.assign(r.cart,{x:0,y:300,health:0});Object.assign(r.joe,{x:-5,y:330,speed:8});__backNine.run=r;await advanceTime(0);w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();
   const rows=[],gl=w.renderer.getContext();
   for(const actor of [false,true]){
    w.runner.root.visible=actor;const times=[];
    for(let i=0;i<56;i++){const t=performance.now();w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(fence);if(i>=8)times.push(performance.now()-t);}
    times.sort((a,b)=>a-b);rows.push({actor,median:times[24],p95:times[45],draws:w.stats().draws,triangles:w.stats().triangles});
   }
   return {rows,graphics:JSON.parse(render_game_to_text()).graphics};
  });
  await p.screenshot({path:`${out}/${baseline?'before':'after'}.png`});results.push({baseline,...result,errors});await p.close();
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({baseline:r.baseline,rows:r.rows,errors:r.errors}))));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
