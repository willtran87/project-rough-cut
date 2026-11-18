const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2],software=process.argv.includes('--software'),before=process.argv.includes('--before');if(!out)throw Error('Output directory required');
const cases=[{name:'idle'},{name:'turn-left',turn:-1.4,speed:12},{name:'turn-right',turn:1.4,speed:12},{name:'braking',speed:14,brake:12},{name:'brace',load:1,speed:3},{name:'reverse',turn:.8,speed:-2.5},{name:'head-right',target:5},{name:'reduced',turn:1.4,speed:12,load:1,reduced:true}];
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync((before?'output/back-nine-visual-upgrade/rider-motion/baseline-source/':'web/')+'back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__riderWorld={rider,mower,scene,camera,renderer,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 for(const spec of (process.argv.includes('--reduced')?cases.filter(s=>s.reduced):cases)){
  const result=await p.evaluate(async spec=>{
   const {createRun}=await import('./back-nine-sim.js'),{blocked}=await import('./back-nine-course.js'),w=__riderWorld,r=createRun(0,0,713);
   if(blocked({x:20,y:55},1.65)||blocked({x:20+(spec.target||0),y:65},.5))throw Error('Fixture intersects collision');
   r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:20,y:55,yaw:-(spec.turn||0),speed:spec.speed||0});r.joe.ram.phase=spec.load?'lineup':'cooldown';r.joe.ram.age=1.8;r.foot={x:20+(spec.target||0),y:65,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0,rearBlend:1};__backNine.run=r;
   await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();
   for(let i=0;i<=60;i++){r.time=20+i/60;r.joe.yaw=(spec.turn||0)*(i/60-1);r.joe.speed=(spec.speed||0)-(spec.brake||0)*i/60;w.update(r,{rear:true,reducedMotion:!!spec.reduced});}
   w.draw();const stats=w.stats();if(stats.riderMotion&&Math.max(...stats.riderMotion.gripError)>.008)throw Error('Lost steering grip');
   return {name:spec.name,state:JSON.parse(render_game_to_text()),rider:stats.riderMotion||null};
  },spec);
  await p.screenshot({path:path.join(out,spec.name+'-2560.jpg'),type:'jpeg',quality:94});samples.push(result);console.log('captured',spec.name);
 }
 await p.keyboard.press('Escape');await p.locator('#chase-reduced').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change'));});await p.click('#primary');await p.keyboard.down('KeyQ');await p.evaluate(()=>advanceTime(17));assert.equal(await p.evaluate(()=>__backNine.run.lookBack),true);
 for(const[width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});await p.screenshot({path:path.join(out,'reduced-'+width+'.jpg'),type:'jpeg',quality:93});if(!before){assert.equal(await p.evaluate(()=>__riderWorld.stats().riderMotion.breath),0);assert.equal(await p.evaluate(()=>__riderWorld.stats().riderCulling.rejected),0);}}
 await p.keyboard.up('KeyQ');
 let contract=null;
 if(!before){
  contract=await p.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{CHASE_RIDER_CENTER,CHASE_RIDER_RADIUS}=await import('./chase-rider-culling.js'),{createRun}=await import('./back-nine-sim.js'),w=__riderWorld,meshes=[],point=new T.Vector3(),center=new T.Vector3(...CHASE_RIDER_CENTER);w.rider.traverseVisible(o=>{if(o.isSkinnedMesh)meshes.push(o);});
   let radius=0,points=0,poses=0,grip=0;const r=createRun(0,0,713);r.mode='driving';r.departure.phase='finished';Object.assign(r.cart,{x:27,y:65,speed:0});Object.assign(r.joe,{x:20,y:55});
   for(const turn of [-1.5,1.5])for(const speed of [-2.5,12,42])for(const load of [0,1])for(const reduced of [false,true]){
    r.time+=1;r.joe.yaw=0;r.joe.speed=speed;r.joe.ram.phase=load?'lineup':'cooldown';r.joe.ram.age=1.8;w.update(r,{reducedMotion:reduced});
    for(let i=0;i<60;i++){r.time+=1/60;r.joe.yaw+=turn/60;w.update(r,{reducedMotion:reduced});}
    w.rider.updateWorldMatrix(true,true);const inverse=w.rider.matrixWorld.clone().invert();
    for(const m of meshes){m.skeleton.update();for(let i=0;i<m.geometry.attributes.position.count;i++){m.getVertexPosition(i,point).applyMatrix4(m.matrixWorld).applyMatrix4(inverse);if(!Number.isFinite(point.length()))throw Error('Nonfinite skinned vertex');radius=Math.max(radius,point.distanceTo(center));points++;}}
    grip=Math.max(grip,...w.stats().riderMotion.gripError);poses++;
   }
   if(radius+.2>CHASE_RIDER_RADIUS)throw Error('Rider motion exceeds conservative culling envelope: '+radius);
   // Compare real rendered pixels with culling disabled around the camera
   // edges; enlarged pose bounds must not make shoulders or fingers disappear.
   w.renderer.setSize(640,360,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();const gl=w.renderer.getContext();let changed=0,visibleRiderPixels=0;w.mower.root.visible=true;
   const read=enabled=>{for(const m of meshes)m.frustumCulled=enabled;w.draw();const p=new Uint8Array(640*360*4);gl.readPixels(0,0,640,360,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
   for(const yaw of [-1.2,-.6,0,.6,1.2]){w.camera.position.set(20,w.mower.root.position.y+2.2,-61);w.camera.rotation.set(0,Math.PI+yaw,0);w.camera.updateMatrixWorld();const a=read(false),b=read(true);for(let i=0;i<a.length;i++)if(a[i]!==b[i])changed++;}
   w.camera.rotation.set(0,Math.PI,0);w.camera.updateMatrixWorld();const visible=read(true);w.rider.visible=false;const hidden=read(true);w.rider.visible=true;for(let i=0;i<visible.length;i+=4)if(visible[i]!==hidden[i]||visible[i+1]!==hidden[i+1]||visible[i+2]!==hidden[i+2])visibleRiderPixels++;if(visibleRiderPixels<10)throw Error('Culling oracle did not show an actual rider');
   if(changed)throw Error('Culling changed animated rider pixels');
   return {poses,points,meshes:meshes.length,radius,padding:CHASE_RIDER_RADIUS-radius,maxGripError:grip,cullingViews:5,cullingChangedPixels:changed,visibleRiderPixels};
  });
  await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.stringify(__backNine.run));await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),frozen);await p.click('#primary');await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(17));assert.equal(await p.evaluate(()=>__backNine.run.checkpoint),0);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,software,before,samples,contract,errors},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
