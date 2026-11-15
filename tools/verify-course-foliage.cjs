const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-foliage';const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__bufferAllocations=0;const original=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){__bufferAllocations++;return original.apply(this,args);};});
 await p.route('**/parallax-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/parallax-scene.js','utf8').replace('if (!reducedMotion && !paused) motionTime += dt;', 'motionTime=0;')}));
 await p.route('**/back-nine-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()', 'return window.__profileWorld={scene,camera,renderer,update,draw()')}));
 await p.route('**/__baseline-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`${out}/baseline-source/back-nine-scene.js`,'utf8').replace("'./course-pines.js'","'./__baseline-pines.js'")}));
 const pine=fs.readFileSync(`${out}/baseline-source/course-pines.js`,'utf8');
 await p.route('**/__baseline-pines.js',r=>r.fulfill({contentType:'application/javascript',body:pine}));
 await p.route('**/__baseline-course.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`${out}/baseline-source/back-nine-course.js`,'utf8')}));
 await p.route('**/__baseline-sim.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-sim.js','utf8').replace("'./back-nine-course.js'","'./__baseline-course.js'")}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 await p.evaluate(async()=>{const{createChaseScene}=await import('./__baseline-scene.js');window.__reference=await createChaseScene(__profileWorld.renderer,true);});
 const views=[];
 for(const [name,x,y,yaw,rear,jx,jy]of [['opening',0,40,0,false,0,20],['alarm',-25.2,150,0,false,5,144],['wet',-29,443,0,false,2,420],['foliage',-29,443,-1.2,true,-24,421],['mower',0,40,0,true,0,31],['finale',-23,790,0,false,-20,770],['lit-edge',35,443,1.5,false,30,430],['lit-rear',35,443,.5,true,30,430],['left-edge',-35,430,-1.5,false,-32,422],['wet-forward',15,469,.2,false,16,450],['wet-rear',15,469,.2,true,16,450],...Array.from({length:8},(_,i)=>['turn-'+i,-25,143+i*4,i*.4,false,5,131])]){
  const result=await p.evaluate(async a=>{const[name,x,y,yaw,rear,jx,jy]=a,{createRun}=await import('./back-nine-sim.js');const r=createRun(y>580?2:y>300?1:0);r.mode='driving';r.time=5;r.grace=0;Object.assign(r.cart,{x,y,yaw});Object.assign(r.joe,{x:jx,y:jy});r.decoys.last=0;r.decoys.ring=4;r.decoys.used=1;
   const current=__profileWorld,reference=__reference,renderer=current.renderer,gl=renderer.getContext();renderer.setSize(960,540,false);for(const w of [reference,current]){w.resetCamera();w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.update(r,{rear,reducedMotion:true});}
   async function draw(w){const start=performance.now();w.update(r,{rear,reducedMotion:true});w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);return performance.now()-start;}
   function pixels(){const b=new Uint8Array(960*540*4);gl.readPixels(0,0,960,540,gl.RGBA,gl.UNSIGNED_BYTE,b);return b;}
   await draw(reference);const original=pixels(),beforeBuffers=__bufferAllocations;await draw(current);const newBuffers=__bufferAllocations-beforeBuffers,optimized=pixels();let changed=0,max=0;for(let i=0;i<original.length;i++){const delta=Math.abs(original[i]-optimized[i]);if(delta)changed++;max=Math.max(max,delta);}
   const timings=[];if(['wet','foliage','lit-edge'].includes(name))for(const optimized of [false,true,true,false]){const w=optimized?current:reference;await draw(w);const times=[];for(let i=0;i<24;i++)times.push(await draw(w));times.sort((a,b)=>a-b);timings.push({optimized,median:times[12],p95:times[22]});}
   await draw(current);return {name,changed,max,newBuffers,timings,reference:reference.stats(),current:current.stats()};
  },[name,x,y,yaw,rear,jx,jy]);views.push(result);console.log(JSON.stringify({name,changed:result.changed,max:result.max,newBuffers:result.newBuffers,timings:result.timings}));await p.screenshot({path:`${out}/verified-${name}-2560.png`});assert.equal(result.changed,0,`${name}: visible pixels changed`);assert.equal(result.newBuffers,0,`${name}: first-use geometry allocation`);assert.equal(result.current.pines.uploadedMatrices,0,'Stable tree selection must not re-upload matrices');
 }
 const moving=await p.evaluate(async()=>{
  const sim=await import('./back-nine-sim.js'),oldSim=await import('./__baseline-sim.js'),course=await import('./back-nine-course.js');if(!course.navigationStats().baked)throw Error('Browser navigation bake invalid');
  const current=sim.createRun(1),old=oldSim.createRun(1);for(const r of [current,old]){r.mode='driving';r.grace=0;r.tension.phase='stalk';Object.assign(r.cart,{x:-29,y:443,speed:4});Object.assign(r.joe,{x:2,y:420,speed:5,lastSeen:{x:-29,y:449},seenAge:.2});}
  __profileWorld.resetCamera();__reference.resetCamera();const gl=__profileWorld.renderer.getContext(),samples={baseline:[],optimized:[]};
  async function frame(name,r,step,w,input,rear){const start=performance.now(),plans=r.joe.plans;step(r,input,1/60);const simulation=performance.now()-start;w.update(r,{rear,reducedMotion:false});w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);samples[name].push({total:performance.now()-start,simulation,replanned:r.joe.plans!==plans});}
  for(let i=0;i<180;i++){const turn=course.angleDelta(Math.atan2(-28-current.cart.x,480-current.cart.y),current.cart.yaw),input={throttle:current.cart.speed<5.5?1:0,steer:course.clamp(turn*2,-1,1)},rear=i%90>=45;
   if(i%2){await frame('optimized',current,sim.updateRun,__profileWorld,input,rear);await frame('baseline',old,oldSim.updateRun,__reference,input,rear);}else{await frame('baseline',old,oldSim.updateRun,__reference,input,rear);await frame('optimized',current,sim.updateRun,__profileWorld,input,rear);}
   if(JSON.stringify(current)!==JSON.stringify(old))throw Error('Moving chase behavior changed at '+i);
  }
  const summarize=list=>{const total=list.map(s=>s.total).sort((a,b)=>a-b),replans=list.filter(s=>s.replanned).map(s=>s.simulation);return {median:total[90],p95:total[171],max:total[179],maxSimulation:Math.max(...list.map(s=>s.simulation)),replans};};
  return {frames:180,baseline:summarize(samples.baseline),optimized:summarize(samples.optimized),navigation:course.navigationStats()};
 });console.log(JSON.stringify({moving}));
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/comparison.json`,JSON.stringify({passed:true,views,moving,errors},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
