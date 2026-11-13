const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),baseline=process.argv.includes('--baseline'),hz=Number(process.argv.find(a=>a.startsWith('--hz='))?.slice(5)||30),tag=(software?'software':'hardware')+(baseline?'-baseline':'')+(hz===30?'':`-${hz}hz`),out='output/back-nine-experience/runner-terrain';
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__uploads=0;const original=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){__uploads++;return original.apply(this,args);};});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__terrainWorld={scene,camera,renderer,runner,update,draw()')}));
 if(baseline)for(const name of ['runner-gait','chase-runner'])await p.route(`**/${name}.js*`,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`${out}/baseline-source/${name}.js`,'utf8')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const before=await p.evaluate(()=>({uploads:__uploads,programs:__terrainWorld.renderer.info.programs.length,textures:__terrainWorld.renderer.info.memory.textures}));
 const result=await p.evaluate(async hz=>{
  const T=await import('./vendor/three/three.module.js'),{terrainHeight}=await import('./course-terrain.js'),{COURSE}=await import('./back-nine-course.js');
  const runner=__terrainWorld.runner,v=new T.Vector3(),boots=[];runner.root.traverse(o=>{if(o.name==='boot')boots.push(o);});
  const rows=[];let calls=0;runner.root.traverse(o=>{if(o.isMesh)calls++;});
  // Every authored driving route and foot passage, including transverse slopes.
  for(const [id,path] of [...COURSE.paths,...COURSE.footPaths].entries()){
   const foot={x:path[0][0],y:path[0][1],speed:6.6,travelSign:1};let time=20,minClearance=Infinity,maxPlantedClearance=0,maxReach=0,maxPlantSlide=0,prior=null,samples=0,worst=null;
   runner.update(null,0,false,null,time);
   for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),yaw=Math.atan2(dx,dy),steps=Math.ceil(length/(6.6/hz));
    for(let n=0;n<steps;n++){
     const t=n/steps;Object.assign(foot,{x:a[0]+dx*t,y:a[1]+dy*t,yaw,viewYaw:yaw,moveYaw:yaw});time+=1/hz;
     const immutable=JSON.stringify(foot);runner.update(foot,1/hz,false,null,time);if(JSON.stringify(foot)!==immutable)throw Error('Presentation mutated physical player');runner.root.position.y+=terrainHeight(foot.x,foot.y);runner.root.updateMatrixWorld(true);
     const pose=runner.stats(),current=[];
     for(let k=0;k<2;k++){
      const target=pose.footing[k],ankle=boots[k].getWorldPosition(new T.Vector3()),expected=runner.root.localToWorld(new T.Vector3(target.x,target.y,target.z));maxReach=Math.max(maxReach,ankle.distanceTo(expected));
      let floor=Infinity;boots[k].traverse(m=>{if(!m.isMesh)return;const pos=m.geometry.attributes.position;for(let q=0;q<pos.count;q++){v.fromBufferAttribute(pos,q).applyMatrix4(m.matrixWorld);floor=Math.min(floor,v.y-terrainHeight(v.x,-v.z));}});
      if(floor<minClearance){minClearance=floor;worst={x:foot.x,y:foot.y,foot:k,floor,pose:target};}
      if(target.planted)maxPlantedClearance=Math.max(maxPlantedClearance,floor);
      if(prior?.[k].planted&&target.planted)maxPlantSlide=Math.max(maxPlantSlide,ankle.distanceTo(prior[k].ankle));current.push({planted:target.planted,ankle});
     }prior=current;samples++;
    }
   }rows.push({id,samples,minClearance,maxPlantedClearance,maxReach,maxPlantSlide,worst});
  }
  return {rows,draws:calls};
 },hz);
 fs.writeFileSync(`${out}/${tag}-grounding.json`,JSON.stringify({result,errors},null,2));console.log(JSON.stringify({tag,rows:result.rows.map(({worst,...r})=>r),errors}));
 if(!baseline)for(const r of result.rows){assert(r.minClearance>-.012,`terrain penetration ${JSON.stringify(r)}`);assert(r.maxPlantedClearance<.035,`floating sole ${JSON.stringify(r)}`);assert(r.maxReach<.025,`leg reach ${JSON.stringify(r)}`);assert(r.maxPlantSlide<.018,`planted slide ${JSON.stringify(r)}`);}
 for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){
  await p.setViewportSize({width,height});
  for(const [name,x,y,yaw]of [['uphill',25.2,266,-.7],['downhill',27.5,260,-.7],['range',-12,371,-.4]]){
   await p.evaluate(async({x,y,yaw})=>{const {createRun}=await import('./back-nine-sim.js'),{terrainHeight}=await import('./course-terrain.js'),w=__terrainWorld,r=createRun(1);r.mode='driving';r.time=20;r.grace=999;r.foot={x,y,yaw,viewYaw:yaw,moveYaw:yaw,speed:6.6,travelSign:1,invulnerable:0,onFoot:true};Object.assign(r.cart,{x:0,y:300,health:0});Object.assign(r.joe,{x:x-10,y:y-30});__backNine.run=r;w.runner.update(null,0,false,null,20);
    for(let i=0;i<60;i++){r.time+=1/60;r.foot.x+=Math.sin(yaw)*.11;r.foot.y+=Math.cos(yaw)*.11;w.update(r,{reducedMotion:false});}
    await advanceTime(0);w.camera.aspect=w.renderer.domElement.width/w.renderer.domElement.height;w.camera.updateProjectionMatrix();w.draw();w.renderer.getContext().finish();
   },{x,y,yaw});await p.screenshot({path:`${out}/${tag}-${name}-${width}.png`});
  }
 }
 const after=await p.evaluate(()=>({uploads:__uploads,programs:__terrainWorld.renderer.info.programs.length,textures:__terrainWorld.renderer.info.memory.textures}));
 assert.deepEqual(after,before,'Runner poses and slope views add no GPU resources');assert.deepEqual(errors,[]);
 fs.writeFileSync(`${out}/${tag}-verification.json`,JSON.stringify({passed:true,hz,before,after,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
