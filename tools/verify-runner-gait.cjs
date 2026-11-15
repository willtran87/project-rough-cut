const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/back-nine-experience/runner-gait',software=process.argv.includes('--software');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__uploads=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__uploads++;return f.apply(this,a);};});
  const expose=s=>s.replace('return {scene,camera,update,draw()','return window.__gaitWorld={scene,camera,renderer,runner,update,draw()');
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:expose(fs.readFileSync('web/back-nine-scene.js','utf8'))}));
  await p.route('**/__gait-chase-runner.js',r=>r.fulfill({contentType:'application/javascript',path:out+'/baseline-source/chase-runner.js'}));
  await p.route('**/__gait-back-nine-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/baseline-source/back-nine-scene.js','utf8').replace("'./chase-runner.js'","'./__gait-chase-runner.js'").replace('return {scene,camera,update,draw()','return {scene,camera,renderer,runner,update,draw()')}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const result=await p.evaluate(async()=>{
   const {createChaseScene}=await import('./__gait-back-nine-scene.js'),T=await import('./vendor/three/three.module.js');
   const current=__gaitWorld,reference=await createChaseScene(current.renderer,true),v=new T.Vector3();window.__gaitReference=reference;
   const totals=[];
   for(const [label,w]of [['baseline',reference],['current',current]]){
    const runner=w.runner,rows=[];let worstReach=null,worstPlant=null;let minY=Infinity,maxError=0,plantedTravel=0,plantedSamples=0,nearFloorTravel=0,nearFloorSamples=0,duplicateDifference=0;
    const shoes=[];runner.root.traverse(o=>{if(o.name===(label==='current'?'boot':'boot-shin'))shoes.push(o);});
    for(const fps of [60,30,15])for(const kind of ['straight','reverse','arc','pivot','stop-resume','reduced']){
     const f={x:0,y:70,yaw:0,viewYaw:0,moveYaw:0,speed:0,travelSign:1};let last=null;
     runner.update(null,0,false,null,0);
     for(let frame=0;frame<fps*3;frame++){
      const time=frame/fps,dt=1/fps,speed=kind==='pivot'||kind==='stop-resume'&&time>=1&&time<2?0:Math.min(6.6,time*22);
      f.speed=speed;f.travelSign=kind==='reverse'?-1:1;if(kind==='arc'||kind==='pivot')f.yaw+=dt*1.5;
      f.moveYaw=f.viewYaw=f.yaw;f.x+=Math.sin(f.yaw)*speed*dt*f.travelSign;f.y+=Math.cos(f.yaw)*speed*dt*f.travelSign;
      runner.update(f,dt,kind==='reduced',null,time);runner.root.updateMatrixWorld(true);
      const pose=runner.stats(),feet=shoes.map((shoe,i)=>{
       const pos=shoe.localToWorld(new T.Vector3(0,label==='current'?-.055:-.425,-.04));
       let floor=Infinity;shoe.traverse(o=>{if(o.isMesh)for(let n=0;n<o.geometry.attributes.position.count;n++){v.fromBufferAttribute(o.geometry.attributes.position,n).applyMatrix4(o.matrixWorld);floor=Math.min(floor,v.y);}});
       minY=Math.min(minY,floor);
       if(label==='current'){
        const target=pose.footing[i],ankle=shoe.getWorldPosition(new T.Vector3()),expected=runner.root.localToWorld(new T.Vector3(target.x,target.y,target.z));const err=ankle.distanceTo(expected);if(err>maxError){maxError=err;worstReach={kind,fps,time,index:i,target,actual:ankle.toArray(),expected:expected.toArray(),pose};}
       }
       return {x:pos.x,y:pos.y,z:pos.z,floor,planted:!!pose.footing?.[i].planted};
      });
      if(last&&time>.5)for(let i=0;i<2;i++){
       const d=Math.hypot(feet[i].x-last[i].x,feet[i].z-last[i].z);
       if(feet[i].planted&&last[i].planted){if(d>plantedTravel){plantedTravel=d;worstPlant={kind,fps,time,index:i,before:last[i],after:feet[i],pose};}plantedSamples++;}
       if(kind==='straight'&&feet[i].floor<.04&&last[i].floor<.04){nearFloorTravel+=d;nearFloorSamples++;}
      }
      if(label==='current'){
       runner.update(f,0,kind==='reduced',null,time);runner.root.updateMatrixWorld(true);
       for(let i=0;i<2;i++){const again=shoes[i].localToWorld(new T.Vector3(0,-.055,-.04));duplicateDifference=Math.max(duplicateDifference,Math.hypot(again.x-feet[i].x,again.y-feet[i].y,again.z-feet[i].z));}
      }
      if(frame%6===0)rows.push({kind,fps,time,feet,pose});last=feet;
     }
    }
    let meshes=0,vertices=0;runner.root.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;}});
    totals.push({label,worstReach,worstPlant,minY,maxError,plantedTravel,plantedSamples,nearFloorTravel,nearFloorSamples,duplicateDifference,meshes,vertices,rows});
   }
   return totals;
  });
  fs.writeFileSync(`${out}/${software?'software':'hardware'}-gait.json`,JSON.stringify({result,errors},null,2));console.log(JSON.stringify(result.map(({rows,...r})=>r)));
  const [before,after]=result;assert(after.minY>-.006,'Soles cannot enter the floor');assert(after.maxError<.025,'Foot target stays within leg reach');assert(after.plantedSamples>100);assert(after.plantedTravel<.006,'Planted foot cannot skate');assert(after.duplicateDifference<.0001,'Same-time render cannot move the model');assert.equal(after.meshes,before.meshes);assert.equal(after.vertices,before.vertices);
  assert(after.nearFloorTravel/after.nearFloorSamples<before.nearFloorTravel/before.nearFloorSamples*.5,'Measured near-floor travel improves over the prior stride');
  const actual=await p.evaluate(async()=>{
   const {createRun,updateRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js'),T=await import('./vendor/three/three.module.js');
   const w=__gaitWorld,rows=[],v=new T.Vector3();
   for(const kind of ['fence-slide','gap','reverse-turn','stop-restart','look-back']){
    const r=createRun(1);r.mode='driving';r.time=20;r.grace=999;Object.assign(r.cart,{x:0,y:305});Object.assign(r.joe,{x:0,y:250});leaveBrokenCart(r);r.time+=2;
    Object.assign(r.foot,kind==='fence-slide'?{x:-31,y:349.1,yaw:Math.PI/4}:kind==='gap'?{x:-36.5,y:337,yaw:0}:{x:0,y:330,yaw:0});r.foot.viewYaw=r.foot.moveYaw=r.foot.yaw;
    w.runner.update(null,0,false,null,r.time);let minFloor=Infinity,maxReach=0,maxFacing=0,vertices=0,immutable=true;
    for(let n=0;n<180;n++){
     const input={throttle:kind==='reverse-turn'?-1:kind==='stop-restart'&&n>45&&n<95?0:1,steer:kind==='reverse-turn'?.35:0,rear:kind==='look-back'&&n<90};
     updateRun(r,input,1/60);const snapshot=JSON.stringify(r);w.runner.update(r.foot,1/60,false,null,r.time);immutable&&=snapshot===JSON.stringify(r);w.runner.root.updateMatrixWorld(true);
     const pose=w.runner.stats();maxFacing=Math.max(maxFacing,Math.abs(Math.atan2(Math.sin(pose.facing-r.foot.moveYaw),Math.cos(pose.facing-r.foot.moveYaw))));
     let i=0;w.runner.root.traverse(o=>{if(o.name==='boot'){
      const f=pose.footing[i++],expected=w.runner.root.localToWorld(new T.Vector3(f.x,f.y,f.z));maxReach=Math.max(maxReach,o.getWorldPosition(v).distanceTo(expected));
      if(n%6===0)o.traverse(m=>{if(m.isMesh)for(let k=0;k<m.geometry.attributes.position.count;k++){v.fromBufferAttribute(m.geometry.attributes.position,k).applyMatrix4(m.matrixWorld);minFloor=Math.min(minFloor,v.y);vertices++;}});
     }});
    }
    rows.push({kind,minFloor,maxReach,maxFacing,vertices,immutable,position:{x:r.foot.x,y:r.foot.y},mode:r.mode});
   }
   return rows;
  });
  fs.writeFileSync(`${out}/${software?'software':'hardware'}-actual.json`,JSON.stringify(actual,null,2));console.log(JSON.stringify({actual}));
  for(const r of actual){assert(r.immutable,'Presentation cannot change the simulation');assert(r.minFloor>-.006);assert(r.maxReach<.025,JSON.stringify(r));assert(r.maxFacing<=Math.PI/12+.0001);assert.equal(r.mode,'driving');}
  for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){
   await p.setViewportSize({width,height});
   for(const near of [true,false]){
    const framing=await p.evaluate(async near=>{
     const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js'),T=await import('./vendor/three/three.module.js');
     const w=__gaitWorld,r=createRun();r.mode='driving';r.time=20;r.grace=999;Object.assign(r.cart,{x:0,y:40});Object.assign(r.joe,{x:0,y:20});leaveBrokenCart(r);r.time+=3;if(!near)Object.assign(r.foot,{x:0,y:70});r.foot.yaw=r.foot.viewYaw=r.foot.moveYaw=0;__backNine.run=r;
     document.getElementById('hud').hidden=false;w.camera.aspect=w.renderer.domElement.width/w.renderer.domElement.height;w.camera.updateProjectionMatrix();w.resetCamera();w.update(r,{reducedMotion:true});w.draw();w.renderer.getContext().finish();w.runner.root.updateMatrixWorld(true);
     const v=new T.Vector3(),bounds={left:Infinity,right:-Infinity,bottom:Infinity,top:-Infinity};w.runner.root.traverse(m=>{if(m.isMesh)for(let n=0;n<m.geometry.attributes.position.count;n++){v.fromBufferAttribute(m.geometry.attributes.position,n).applyMatrix4(m.matrixWorld).project(w.camera);bounds.left=Math.min(bounds.left,v.x);bounds.right=Math.max(bounds.right,v.x);bounds.bottom=Math.min(bounds.bottom,v.y);bounds.top=Math.max(bounds.top,v.y);}});
     return {near,visible:w.runner.root.visible,clearance:w.stats().cameraClearance,...bounds};
    },near);
    assert(framing.visible&&framing.clearance>.99);assert(framing.bottom>-.95&&framing.top<.95&&framing.left>-.95&&framing.right<.95,JSON.stringify(framing));
    await p.screenshot({path:`${out}/${software?'software':'hardware'}-follow-${near?'wreck':'open'}-${width}.png`});
   }
   for(const [name,offset]of [['side',[3.5,1.15,0]],['front',[0,1.15,-3.5]],['gameplay',null]]){
    await p.evaluate(async({offset})=>{
     const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js');const w=__gaitWorld,r=createRun();r.mode='driving';r.time=20;r.grace=999;Object.assign(r.cart,{x:6,y:70});leaveBrokenCart(r);Object.assign(r.foot,{x:0,y:70,yaw:0,viewYaw:0,moveYaw:0,speed:6.6});r.time+=3;Object.assign(r.joe,{x:7,y:42});__backNine.run=r;w.update(r,{});
     w.runner.update(null,0,false,null,0);for(let i=0;i<80;i++){r.foot.y=70+i*6.6/60;w.runner.update(r.foot,1/60,false,null,23+i/60);}w.camera.aspect=w.renderer.domElement.width/w.renderer.domElement.height;w.camera.updateProjectionMatrix();
     if(offset){w.camera.position.set(offset[0],offset[1],-r.foot.y+offset[2]);w.camera.lookAt(0,1,-r.foot.y);}else{w.camera.position.set(0,3.2,-r.foot.y+6);w.camera.lookAt(0,1.5,-r.foot.y-4);}
     document.getElementById('hud').hidden=!!offset;w.draw();w.renderer.getContext().finish();
    },{offset});
    await p.screenshot({path:`${out}/${software?'software':'hardware'}-${name}-${width}.png`});
   }
  }
  assert.deepEqual(errors,[]);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
