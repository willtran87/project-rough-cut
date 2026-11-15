const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2],before=process.argv.includes('--before'),software=process.argv.includes('--software');if(!out)throw Error('Output directory required');
const views=[['club-west',-14.5,790,-Math.PI/2],['club-front',4,778,Math.PI],['garage-wall',-31.5,806,-Math.PI/2],['shelter',0,300,0],['low-basin',24,246,Math.PI],['hill',21,65,0]];
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(before?'output/back-nine-visual-upgrade/camera-clearance/baseline-source/back-nine-scene.js':'web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__cameraWorld={scene,camera,update,draw()')}));
 if(before)await p.route('**/runner-camera.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/back-nine-visual-upgrade/camera-clearance/baseline-source/runner-camera.js','utf8')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const capture=async name=>{await p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));const camera=await p.evaluate(()=>({position:__cameraWorld.camera.position.toArray(),quaternion:__cameraWorld.camera.quaternion.toArray()}));samples.push({name,state,camera});await p.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:93});console.log('captured',name);return state;};
 const stage=async(x,y,yaw)=>p.evaluate(async({x,y,yaw})=>{const{createRun}=await import('./back-nine-sim.js'),{blocked}=await import('./back-nine-course.js');if(blocked({x,y},.5))throw Error('Invalid viewpoint '+x+','+y);const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x,y,yaw,health:100});Object.assign(r.joe,{x:35,y:50,speed:0});__backNine.run=r;await advanceTime(0);},{x,y,yaw});
 const motion=[];
 for(const foot of [false,true])for(const reducedMotion of [false,true]){
  await stage(-14.5,790,0);
  const result=await p.evaluate(({foot,reducedMotion})=>{
   const r=__backNine.run,w=__cameraWorld;
   if(foot){r.foot={x:-14.5,y:790,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};r.cart.x=35;r.cart.y=10;}
   w.resetCamera();let violations=0,maxStep=0,last=null,minBoom=Infinity,jump=null;
   // Independent segment/solid-wall intersection, using the visible clubhouse.
   function crosses(a,b){let lo=0,hi=1;for(const[k,min,max]of [['x',-12.1,20.1],['z',-808.1,-781.9],['y',-.1,9.7]]){const d=b[k]-a[k];if(Math.abs(d)<1e-8){if(a[k]<min||a[k]>max)return false;}else{const p=(min-a[k])/d,q=(max-a[k])/d;lo=Math.max(lo,Math.min(p,q));hi=Math.min(hi,Math.max(p,q));}}return lo<=hi&&hi>=0&&lo<=1;}
   for(let i=0;i<=360;i++){
    const actor=foot?r.foot:r.cart;actor.yaw=i*Math.PI/180;if(foot)actor.viewYaw=actor.yaw;r.time+=1/60;
    w.update(r,{reducedMotion});const eye=w.camera.position;
    if(crosses({x:actor.x,y:foot?1.2:2.45,z:-actor.y},eye))violations++;
    minBoom=Math.min(minBoom,Math.hypot(eye.x-actor.x,eye.z+actor.y));
    if(last){const step=Math.hypot(eye.x-last.x,eye.y-last.y,eye.z-last.z);if(step>maxStep){maxStep=step;jump={frame:i,from:last,to:{x:eye.x,y:eye.y,z:eye.z},clearance:w.stats().cameraClearance};}}last={x:eye.x,y:eye.y,z:eye.z};
   }
   for(let i=0;i<180;i++){r.time+=1/60;w.update(r,{reducedMotion});const actor=foot?r.foot:r.cart;if(crosses({x:actor.x,y:foot?1.2:2.45,z:-actor.y},w.camera.position))violations++;}
   const settledOffset=Math.hypot(w.camera.position.x+14.5,w.camera.position.z+790-(foot?4.5:6.5));
   return {foot,reducedMotion,frames:541,violations,maxStep,minBoom,jump,settledOffset};
  },{foot,reducedMotion});
  console.log(JSON.stringify(result));fs.writeFileSync(path.join(out,'last-result.json'),JSON.stringify(result,null,2));
  if(!before){assert.equal(result.violations,0,'Presented eye must remain outside clubhouse');assert(result.maxStep<1,'No metre-scale single-frame camera jumps');assert(result.settledOffset<.05,'Camera returns behind actor after turn');}motion.push(result);
 }
 fs.writeFileSync(path.join(out,'motion.json'),JSON.stringify({passed:true,before,software,motion,errors},null,2));assert.deepEqual(errors,[]);
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
