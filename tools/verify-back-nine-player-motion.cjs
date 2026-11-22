const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2],software=process.argv.includes('--software');if(!out)throw Error('Output directory required');
const cases=[{name:'idle-inhale',idle:2},{name:'idle-exhale',idle:3.7},{name:'running',run:1},{name:'first-recovery',run:1,stop:.1},{name:'second-recovery',run:1,stop:.3},{name:'settled',run:1,stop:.6},{name:'reverse-stop',run:1,stop:.1,reverse:true},{name:'slope-stop',run:1,stop:.3,x:25,y:260,yaw:-.7},{name:'reduced',run:1,stop:.3,reduced:true}];
cases.push({name:'brake-detail',run:1,stop:.1,inspect:true},{name:'settled-detail',run:1,stop:.6,inspect:true},{name:'restart-detail',run:1,stop:.07,resume:.07,inspect:true},{name:'breath-detail',idle:2,inspect:true});
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__playerWorld={runner,scene,camera,renderer,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 for(const spec of cases){
  const sample=await p.evaluate(async spec=>{
   const {createRun}=await import('./back-nine-sim.js'),{blocked}=await import('./back-nine-course.js'),w=__playerWorld,r=createRun(0,0,713),x=spec.x??20,y=spec.y??65,yaw=spec.yaw||0;
   r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x,y,yaw,viewYaw:yaw,moveYaw:yaw,speed:0,onFoot:true,invulnerable:0,travelSign:spec.reverse?-1:1};__backNine.run=r;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();
   const total=(spec.run||0)+(spec.stop||0)+(spec.idle||0)+(spec.resume||0);
   for(let i=0;i<=Math.round(total*60);i++){const t=i/60,f=r.foot;r.time=20+t;f.speed=spec.resume&&t>=spec.run+spec.stop?6.6:t<(spec.run||0)?Math.min(6.6,t*22):0;f.x+=Math.sin(yaw)*f.speed/60*f.travelSign;f.y+=Math.cos(yaw)*f.speed/60*f.travelSign;if(blocked(f,.5))throw Error('Fixture crosses collision');w.update(r,{reducedMotion:!!spec.reduced});}
   if(spec.inspect){const {terrainHeight}=await import('./course-terrain.js'),f=r.foot,h=terrainHeight(f.x,f.y);w.camera.position.set(f.x+2.4,h+1.25,-f.y-.5);w.camera.lookAt(f.x,h+.9,-f.y);w.camera.updateMatrixWorld();w.runner.root.visible=true;}
   w.draw();const state=JSON.parse(render_game_to_text()),T=await import('./vendor/three/three.module.js'),torch=w.runner.root.getObjectByName('RunnerWorkLight');torch.updateWorldMatrix(true,false);
   const emitter=torch.localToWorld(new T.Vector3(-.18,1.28,-.24)),source=new T.Vector3().fromArray(state.graphics.headlights.player.position),lightSourceError=emitter.distanceTo(source);if(lightSourceError>1e-8)throw Error('Work light detached from emitter: '+lightSourceError);
   return {name:spec.name,state,lightSourceError};
  },spec);samples.push(sample);await p.screenshot({path:path.join(out,spec.name+'-2560.jpg'),type:'jpeg',quality:94});console.log('captured',spec.name);
 }
 for(const[width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();__playerWorld.update(__backNine.run,{reducedMotion:true});__playerWorld.draw();});await p.screenshot({path:path.join(out,'reduced-'+width+'.jpg'),type:'jpeg',quality:93});}
 let contract=null;
 {
  contract=await p.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{terrainHeight}=await import('./course-terrain.js'),runner=__playerWorld.runner,boots=[],v=new T.Vector3(),expect=new T.Vector3();runner.root.traverse(o=>{if(o.name==='boot')boots.push(o);});
   let worstPlant=null,samples=0,minClearance=Infinity,maxPlantedClearance=0,maxReach=0,maxPlantedSlide=0,maxDuplicate=0,meshes=0;runner.root.traverse(o=>{if(o.isMesh)meshes++;});
   const rows=[];
   for(const hz of [15,30,60])for(const kind of ['forward-stop','reverse-stop','arc-stop','pivot-stop','resume','rapid-resume','reverse-resume','reduced'])for(const start of [[20,65],[25,260],[-12,371]]){
    const foot={x:start[0],y:start[1],yaw:0,viewYaw:0,moveYaw:0,speed:0,travelSign:kind==='reverse-stop'?-1:1};runner.update(null,0,false,null,0);let last=null;
    for(let frame=0;frame<hz*3;frame++){
     const time=frame/hz,moving=time<1||kind==='resume'&&time>2||kind==='rapid-resume'&&time>1.07||kind==='reverse-resume'&&time>1.2;foot.speed=kind==='pivot-stop'||!moving?0:Math.min(6.6,time*22);if(kind==='reverse-resume'&&time>1.2)foot.travelSign=-1;if((kind==='arc-stop'||kind==='pivot-stop')&&moving)foot.yaw+=1.2/hz;foot.moveYaw=foot.viewYaw=foot.yaw;foot.x+=Math.sin(foot.yaw)*foot.speed/hz*foot.travelSign;foot.y+=Math.cos(foot.yaw)*foot.speed/hz*foot.travelSign;
     const immutable=JSON.stringify(foot);runner.update(foot,1/hz,kind==='reduced',null,20+time);runner.root.position.y+=terrainHeight(foot.x,foot.y);runner.root.updateMatrixWorld(true);if(JSON.stringify(foot)!==immutable)throw Error('Presentation mutated player');const pose=runner.stats(),now=[];
     for(let i=0;i<2;i++){
      const f=pose.footing[i],ankle=boots[i].getWorldPosition(new T.Vector3());runner.root.localToWorld(expect.set(f.x,f.y,f.z));maxReach=Math.max(maxReach,ankle.distanceTo(expect));
      let floor=Infinity;boots[i].traverse(m=>{if(m.isMesh)for(let j=0;j<m.geometry.attributes.position.count;j++){v.fromBufferAttribute(m.geometry.attributes.position,j).applyMatrix4(m.matrixWorld);floor=Math.min(floor,v.y-terrainHeight(v.x,-v.z));}});minClearance=Math.min(minClearance,floor);if(f.planted)maxPlantedClearance=Math.max(maxPlantedClearance,floor);
      if(last?.[i].planted&&f.planted){const slide=ankle.distanceTo(last[i].ankle);if(slide>maxPlantedSlide){maxPlantedSlide=slide;worstPlant={hz,kind,start,time,index:i,from:last[i].ankle.toArray(),to:ankle.toArray(),pose};}}now.push({ankle,planted:f.planted});
     }
     runner.update(foot,0,kind==='reduced',null,20+time);runner.root.position.y+=terrainHeight(foot.x,foot.y);runner.root.updateMatrixWorld(true);for(let i=0;i<2;i++)maxDuplicate=Math.max(maxDuplicate,boots[i].getWorldPosition(v).distanceTo(now[i].ankle));last=now;samples++;
    }
    rows.push({hz,kind,start,balance:runner.stats().balance});
   }
   if(minClearance<-.012||maxPlantedClearance>.035||maxReach>.025||maxPlantedSlide>.018||maxDuplicate>.0001)throw Error(JSON.stringify({minClearance,maxPlantedClearance,maxReach,maxPlantedSlide,maxDuplicate,worstPlant}));
   // The new upper-body pivot resets for defeat; actual geometry still rests
   // on the original flat support plane through frontal and side falls.
   let deathFloor=Infinity;const foot={x:0,y:70,yaw:0,viewYaw:0,speed:0};
   for(const yaw of [0,Math.PI/2,Math.PI])for(const age of [0,.2,.5,.9,1.2]){runner.update(foot,1/60,false,{yaw,startYaw:0,age,strength:.8},30+age);runner.root.updateMatrixWorld(true);runner.root.traverse(m=>{if(m.isMesh)for(let j=0;j<m.geometry.attributes.position.count;j++){v.fromBufferAttribute(m.geometry.attributes.position,j).applyMatrix4(m.matrixWorld);deathFloor=Math.min(deathFloor,v.y);}});}
   if(deathFloor<.014)throw Error('Defeat no longer grounded: '+deathFloor);
   return {samples,meshes,minClearance,maxPlantedClearance,maxReach,maxPlantedSlide,maxDuplicate,deathFloor,rows};
  });
  await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.stringify(__backNine.run));await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),frozen);await p.click('#primary');await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(17));assert.equal(await p.evaluate(()=>__backNine.run.checkpoint),0);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,software,samples,contract,errors},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
