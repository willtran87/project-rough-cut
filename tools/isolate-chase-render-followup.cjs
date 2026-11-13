const fs=require('node:fs'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.error(e));p.on('console',m=>console.log(m.text()));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__w={scene,camera,renderer,backdrop,pines,mower,cart,update,draw()')}));
 await p.route(/\/course-pines\.js(?:\?.*)?$/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/course-pines.js','utf8').replace('scene.add(m);return m;',"m.name='course-pine-'+part.kind;scene.add(m);return m;")}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 for(const view of [['wet-mower',-29,443,-1.2,true],['trees',25,137,0,false],['front',0,80,Math.PI,false]]){
 console.log('view',view[0]);const result=await p.evaluate(async view=>{const [name,x,y,yaw,rear]=view,{createRun}=await import('./back-nine-sim.js'),w=__w,gl=w.renderer.getContext(),r=createRun(1);r.time=10;r.mode='driving';Object.assign(r.cart,{x,y,yaw,speed:8});Object.assign(r.joe,{x:x+3,y:y-14,speed:12});w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.resetCamera();w.update(r,{rear,reducedMotion:true});const visible=new Map(w.scene.children.map(o=>[o,o.visible]));
 const results=[];async function draw(){const t=performance.now();w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);return performance.now()-t;}
 for(const skip of ['none','pines','mower','cart','world','sky','none']){
  console.log('skip',skip);w.backdrop.scene.visible=skip!=='sky';for(const[o,v]of visible)o.visible=v&&!(skip==='pines'&&o.name.startsWith('course-pine-'))&&!(skip==='world'&&o.geometry?.index?.usage===35048&&!o.isInstancedMesh);
  w.mower.root.visible=visible.get(w.mower.root)&&skip!=='mower';w.cart.root.visible=visible.get(w.cart.root)&&skip!=='cart';
  for(let i=0;i<3;i++)await draw();const times=[];for(let i=0;i<12;i++)times.push(await draw());times.sort((a,b)=>a-b);results.push({skip,median:times[6],p95:times[11],draws:w.stats().draws,triangles:w.stats().triangles});
 }for(const[o,v]of visible)o.visible=v;w.backdrop.scene.visible=true;return {name,results};},view);console.log(JSON.stringify(result));fs.appendFileSync('output/chase-render-followup/isolation.jsonl',JSON.stringify(result)+'\n');
 }
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
