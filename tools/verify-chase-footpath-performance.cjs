const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/footpath-surfaces',b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const rows=[],errors=[];try{
 for(const [pass,before]of [true,false,false,true].entries()){
  const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  if(before)await p.route('**/chase-route-art.js*',r=>r.fulfill({contentType:'application/javascript',path:out+'/baseline-source/chase-route-art.js'}));
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__footRender={scene,camera,renderer,update,draw()')}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const result=await p.evaluate(async()=>{
   const {createRun}=await import('./back-nine-sim.js'),w=__footRender,gl=w.renderer.getContext(),rows=[];w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();
   async function draw(){const time=performance.now();w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);return performance.now()-time;}
   for(const [name,x,y,foot,rear]of [['range',-36.5,343,true,false],['garage',-33.15,764,true,false],['reservoir',37.25,190,true,false],['foliage-mower',-29,443,false,true]]){
    const r=createRun();r.mode='driving';r.time=10;r.grace=0;Object.assign(r.cart,{x,y,yaw:0,speed:8});if(foot){r.foot={x,y,yaw:0,viewYaw:0,onFoot:true,speed:7.2,invulnerable:0};Object.assign(r.cart,{x:0,y:10,health:0});}Object.assign(r.joe,{x:x+(x>0?-10:10),y:y-12,yaw:0,speed:12});w.resetCamera();w.update(r,{rear});for(let n=0;n<6;n++)await draw();const samples=[];
    for(let n=0;n<48;n++){r.time=12+n/30;const c=r.foot||r.cart;c.y=y+n*.04;r.joe.y=c.y-12;w.update(r,{rear});samples.push(await draw());}
    samples.sort((a,b)=>a-b);const stats=w.stats();rows.push({name,median:samples[24],p95:samples[45],max:samples[47],draws:stats.draws,triangles:stats.triangles,programs:stats.programs,textures:stats.textures});
   }return rows;
  });rows.push({pass,before,views:result});await p.close();fs.writeFileSync(out+'/moving-performance.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify(rows.at(-1)));
 }
 assert.deepEqual(errors,[]);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
