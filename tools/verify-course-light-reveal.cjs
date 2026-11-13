const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const before=process.argv.includes('--before'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/course-light-reveal/'+(before?'before':'final');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/local-light-culling.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(before?'output/course-light-reveal/before-local-light-culling.js':'web/local-light-culling.js','utf8').replace('return {register,update,preparation,dispose,','globalThis.__lightEntries=entries;return {register,update,preparation,dispose,')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('pixelWorld?.localLighting?.update(coursePointLights);',before?'pixelWorld?.localLighting?.update(nearLamp?[nearLamp]:[]);':'pixelWorld?.localLighting?.update(coursePointLights);')+'\nwindow.__lightScene=()=>({renderer,world,camera,parallax,sceneTarget,nearLamp,pixelWorld,coursePointLights});'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__lightGame={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__lightGame);await p.locator('#game').click();
  await p.evaluate(()=>{const t=__lightGame,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:690,mode:'patrol',patrolPause:9999});RCSpatialControls.set('resolution',.5);t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});
  const compare=()=>p.evaluate(stableSort=>{
   const {renderer:r,world,camera,parallax,sceneTarget,nearLamp,pixelWorld}=__lightScene(),gl=r.getContext(),pixels=new Uint8Array(sceneTarget.width*sceneTarget.height*4),full=pixels.slice();
   if(stableSort){const ids=new Map(__lightEntries.map(e=>[e.lite,e.full.id]));r.setOpaqueSort((a,b)=>a.groupOrder-b.groupOrder||a.renderOrder-b.renderOrder||(ids.get(a.material)??a.material.id)-(ids.get(b.material)??b.material.id)||a.materialVariant-b.materialVariant||a.z-b.z||a.id-b.id);}
   const draw=target=>{r.setRenderTarget(sceneTarget);r.autoClear=false;r.clear();r.render(parallax.scene,parallax.camera);r.clearDepth();r.render(world,camera);r.autoClear=true;gl.readPixels(0,0,sceneTarget.width,sceneTarget.height,gl.RGBA,gl.UNSIGNED_BYTE,target);};
   const saved=__lightEntries.map(e=>e.mesh.material);draw(pixels);for(const e of __lightEntries)e.mesh.material=e.full;draw(full);__lightEntries.forEach((e,i)=>e.mesh.material=saved[i]);r.setRenderTarget(null);
   let changed=0,maxDelta=0;for(let i=0;i<pixels.length;i++){const d=Math.abs(pixels[i]-full[i]);if(d)changed++;maxDelta=Math.max(maxDelta,d);}
   const suspects=[];
   if(changed&&globalThis.__diagnoseLight){
    const candidates=__lightEntries.filter(e=>e.mesh.visible&&e.mesh.material!==e.full),scratch=full.slice();
    function investigate(group){
     if(!group.length)return;for(const e of group)e.mesh.material=e.full;draw(scratch);let difference=0;for(let i=0;i<scratch.length;i++)if(scratch[i]!==pixels[i])difference++;
     for(const e of group)e.mesh.material=e.lite;
     if(!difference)return;
     if(group.length===1){const e=group[0],current=e.mesh.geometry.boundingBox.clone().applyMatrix4(e.mesh.matrixWorld);suspects.push({difference,bounds:[e.bounds.min.toArray(),e.bounds.max.toArray()],current:[current.min.toArray(),current.max.toArray()],key:e.full.customProgramCacheKey(),distance:e.bounds.distanceToPoint(nearLamp.position),lampDistance:nearLamp.distance,matrix:e.mesh.matrixWorld.toArray(),uniforms:r.properties.get(e.full).uniforms?.pointLights?.value});return;}
     const half=Math.ceil(group.length/2);investigate(group.slice(0,half));investigate(group.slice(half));
    }
    investigate(candidates);r.setRenderTarget(null);
   }
   return {changed,maxDelta,suspects,lamp:{position:nearLamp.position.toArray(),power:nearLamp.intensity},lighting:pixelWorld.localLighting.stats()};
  },process.argv.includes('--stable-sort'));
  await p.evaluate(v=>globalThis.__diagnoseLight=v,process.argv.includes('--diagnose'));
  // Arrival at a lantern facing away, followed by a turn with stationary light.
  for(const [name,x,y]of [['entrance',0,12],['lantern',0,32],['opening',0,65],['hedge',-28,110],['pond',6.2,219.9],['shed',-18,684]]){
   for(const yaw of [Math.PI,0,Math.PI/2,-Math.PI/2,0]){
    await p.evaluate(async v=>{Object.assign(__lightGame.state.player,v);__lightGame.render();await RCScene3D.whenPresented();},{x,y,yaw,pitch:-.15});
    views.push({name,yaw,...await compare()});
   }
   if(['lantern','shed'].includes(name)){await p.evaluate(async()=>{__lightGame.render();await RCScene3D.whenPresented();});await p.screenshot({path:out+'/'+name+'-2560.png'});}
  }
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{Object.assign(__lightGame.state.player,{x:0,y:32,yaw:0,pitch:-.15});__lightGame.render();await RCScene3D.whenPresented();});views.push({name:'viewport-'+width,...await compare()});await p.evaluate(async()=>{__lightGame.render();await RCScene3D.whenPresented();});await p.screenshot({path:out+'/lantern-'+width+'.png'});}
  const lifecycle=before?null:await p.evaluate(async()=>{
   const old=__lightScene().coursePointLights.slice();globalThis.__oldCourseLights=old;RCScene3D.reset();__lightGame.render();await RCScene3D.whenPresented();return {oldCount:old.length};
  }).then(async initial=>{
   await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});
   await p.evaluate(async()=>{__lightGame.render();await RCScene3D.whenPresented();});
   const inventory=await p.evaluate(()=>{const s=__lightScene(),actual=[];s.world.traverse(o=>{if(o.isPointLight)actual.push(o);});return {count:actual.length,complete:actual.length===s.coursePointLights.length&&actual.every(o=>s.coursePointLights.includes(o)),fresh:s.coursePointLights.every(o=>!__oldCourseLights.includes(o))};});
   assert(inventory.complete&&inventory.fresh&&inventory.count===initial.oldCount);views.push({name:'rebuilt',...await compare()});return {oldCount:initial.oldCount,...inventory};
  });
  const mismatches=views.filter(v=>v.changed);const result={before,views,lifecycle,mismatches:mismatches.length,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(result,null,2));console.log(JSON.stringify({before,views:views.length,mismatches,lifecycle,errors}));assert.deepEqual(errors,[]);if(!before)assert.equal(mismatches.length,0,'Visible lighting must match unculled shader');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
