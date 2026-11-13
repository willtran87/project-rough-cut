const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const label=process.argv.find(a=>a.startsWith('--label='))?.slice(8)||'baseline';
(async()=>{const out='output/back-nine-rendering';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/back-nine-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()', 'return window.__profileWorld={scene,camera,renderer,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({resolution:.75})));
 const start=Date.now();await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});const readyMs=Date.now()-start;await p.click('#primary');await p.evaluate(()=>advanceTime(0));const views=[];
 for(const [name,x,y,yaw,rear,jx,jy]of [['opening',0,40,0,false,0,20],['alarm',-25.2,150,0,false,5,144],['wet',-29,443,0,false,2,420],['foliage',-29,443,-1.2,true,-24,421],['mower',0,40,0,true,0,31],['finale',-23,790,0,false,-20,770]]){
  const v=await p.evaluate(async a=>{const [name,x,y,yaw,rear,jx,jy]=a,{createRun}=await import('./back-nine-sim.js');const r=createRun(y>580?2:y>300?1:0);r.mode='driving';r.grace=0;r.time=4;Object.assign(r.cart,{x,y,yaw,speed:8});Object.assign(r.joe,{x:jx,y:jy,speed:10});r.lookBack=rear;__backNine.run=r;
   await __backNine.whenPresented();const w=__profileWorld,gl=w.renderer.getContext();w.renderer.setSize(960,540,false);const samples=[];
   async function drain(){const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(fence);}
   for(let i=0;i<29;i++){const start=performance.now();w.update(r,{rear,reducedMotion:true});w.draw();await drain();samples.push(performance.now()-start);}
   const warm=samples.slice(5).sort((a,b)=>a-b);return {name,first:samples[0],median:warm[12],p95:warm[22],max:Math.max(...samples),graphics:w.stats()};
  },[name,x,y,yaw,rear,jx,jy]);views.push(v);await p.screenshot({path:`${out}/${label}-${name}.png`});console.log(JSON.stringify({name,first:v.first,median:v.median,p95:v.p95,max:v.max,draws:v.graphics.draws}));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${label}.json`,JSON.stringify({readyMs,views,errors},null,2));console.log(JSON.stringify({readyMs,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
