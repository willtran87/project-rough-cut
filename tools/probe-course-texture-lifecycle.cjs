const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const hardware=process.argv.includes('--hardware'),verify=process.argv.includes('--verify'),exercise=process.argv.includes('--exercise'),cancel=process.argv.includes('--cancel'),out='output/course-texture-lifecycle/'+(hardware?'hardware':'software')+(cancel?'-cancel':exercise?'-exercise':verify?'-final':'-before');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:hardware?['--use-angle=d3d11']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],rows=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const instrument=`
 const trackedTextures=new Map(),textureAdd=THREE.Texture.prototype.addEventListener;
 THREE.Texture.prototype.addEventListener=function(type,fn){if(type==='dispose'&&!trackedTextures.has(this))trackedTextures.set(this,{cycle:window.__textureCycle||0});return textureAdd.call(this,type,fn);};
 window.__textureScene=()=>({renderer,world,parallax,compositor,trackedTextures,sceneTarget,joeModel});
 `;
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+instrument}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__textureGame={state,resetFirstHole,render,variants:RUN_VARIANTS,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__textureGame);await p.locator('#game').click();
  await p.evaluate(()=>{const t=__textureGame,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x:0,y:65,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:690,mode:'patrol',patrolPause:9999});t.render();});
  if(exercise)await p.evaluate(()=>{
   window.__textureSetup=index=>{const t=__textureGame,s=t.state;t.resetFirstHole(t.variants[index]);Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x:24,y:65,yaw:-.8,pitch:-.15});Object.assign(s.hole.joe,{x:0,y:80,walkMeters:0,effectSpeed:0,effectHeading:Math.PI/2,mode:'patrol',patrolPause:9999});t.render();};__textureSetup(0);
  });
  for(let cycle=0;cycle<(exercise?6:4);cycle++){
   if(cycle)await p.evaluate(({cycle,exercise})=>{window.__textureCycle=cycle;if(exercise)__textureSetup(cycle%3);else{RCScene3D.reset();__textureGame.render();}},{cycle,exercise});
   if(cancel&&(cycle===1||cycle===2)){
    await p.waitForFunction(()=>{const s=__textureScene();let allocated=false;s.world.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton.boneTexture&&s.renderer.properties.get(o.skeleton.boneTexture).__webglTexture)allocated=true;});return RCScene3D.stats().preparing&&allocated;},null,{timeout:180000,polling:'raf'});
    await p.evaluate(()=>{window.__cancelledCourseWorld=__textureScene().world;RCScene3D.reset();__textureGame.render();});
   }
   await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});
   await p.evaluate(async()=>{__textureGame.render();await RCScene3D.whenPresented();});
   const row=await p.evaluate(cycle=>{
    const {renderer:r,world,parallax,compositor,trackedTextures}=__textureScene(),owners=new Map();
    const add=(t,name)=>{if(t?.isTexture){if(!trackedTextures.has(t))trackedTextures.set(t,{cycle});const a=owners.get(t)||[];a.push(name);owners.set(t,a);}};
    for(const [scene,name]of [[world,'world'],[parallax.scene,'sky'],[compositor,'compositor']])scene.traverse(o=>{
     if(o.isSkinnedMesh)add(o.skeleton?.boneTexture,name+':'+o.name+':skeleton');
     if(o.isLight){add(o.shadow?.map?.texture,name+':'+o.type+':shadow');add(o.shadow?.mapPass?.texture,name+':'+o.type+':shadowPass');}
     for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){
      for(const [k,v]of Object.entries(m))add(v,name+':'+o.name+':'+k);
      for(const [k,u]of Object.entries(r.properties.get(m).uniforms||{}))add(u.value,name+':'+o.name+':uniform:'+k);
     }
    });
    const live=[];
    for(const [t,meta]of trackedTextures)if(r.properties.get(t).__webglTexture){
     if(owners.has(t))meta.owners=owners.get(t);
     live.push({uuid:t.uuid,cycle:meta.cycle,shared:!!t.userData.sharedPixelArt,name:t.name,kind:t.image?.constructor?.name,width:t.image?.width,height:t.image?.height,owners:owners.get(t)||[],oldOwners:meta.owners||[]});
    }
    return {cycle,variant:__textureGame.state.hole.variantId,world:world.uuid,gpu:RCScene3D.stats().gpu,memory:{...r.info.memory},live:live.length,orphans:live.filter(t=>t.cycle<cycle&&!t.shared&&!t.owners.length)};
   },cycle);rows.push(row);console.log(JSON.stringify(row));
   if(exercise){
    const visual=await p.evaluate(()=>{
     const {renderer:r,sceneTarget,world}=__textureScene(),id=__textureGame.state.hole.variantId;
     if(__textureGame.obstacleAtPosition(24,65))throw Error('Player fixture overlaps collision');
     const pixels=new Uint8Array(sceneTarget.width*sceneTarget.height*4);r.readRenderTargetPixels(sceneTarget,0,0,sceneTarget.width,sceneTarget.height,pixels);window.__textureReferences??={};const old=__textureReferences[id];let changed=0;
     if(old){for(let i=0;i<pixels.length;i++)if(old[i]!==pixels[i])changed++;}else __textureReferences[id]=pixels;
     const skeletons=new Set();world.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton);});
     return {changed,compared:!!old,skeletons:skeletons.size,validBones:[...skeletons].every(s=>s.boneTexture&&r.properties.get(s.boneTexture).__webglTexture),handError:RCScene3D.stats().joeModel.handError};
    });row.visual=visual;assert(visual.skeletons>0&&visual.validBones&&visual.handError<.005);assert.equal(visual.changed,0,'Returning to a variant must preserve its rendered image');
   }
  }
  const checks=[];
  if(exercise){
   assert.equal(new Set(rows.map(r=>r.world)).size,6,'Changing production variants must actually rebuild each world');
   checks.push('Six real variant changes replace worlds, retain exact repeat pixels and create working fresh skeleton textures');
   const animated=await p.evaluate(async()=>{
    const {world}=__textureScene();let skeleton;world.traverse(o=>{if(o.isSkinnedMesh)skeleton=o.skeleton;});const before=skeleton.boneTexture.image.data.slice(),s=__textureGame.state;s.reducedMotion=false;
    for(let i=0;i<8;i++){s.hole.elapsed+=.1;s.hole.joe.walkMeters+=1;s.hole.joe.y+=1;s.hole.joe.effectSpeed=10;__textureGame.render();await RCScene3D.whenPresented();}
    return {changed:skeleton.boneTexture.image.data.some((v,i)=>v!==before[i]),grip:RCScene3D.stats().joeModel.handError};
   });assert(animated.changed&&animated.grip<.005);checks.push('Rebuilt Joe updates bone animation and preserves the mower grip');
   await p.keyboard.press('Escape');const paused=await p.evaluate(()=>JSON.stringify(__textureGame.state.player));await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.stringify(__textureGame.state.player)),paused);await p.keyboard.press('Escape');
   const before=await p.evaluate(()=>__textureGame.state.player.y);await p.keyboard.down('w');await p.evaluate(()=>advanceTime(300));await p.keyboard.up('w');assert(await p.evaluate(y=>__textureGame.state.player.y>y,before));checks.push('Real keyboard pause/resume and movement work after repeated rebuilds');
   for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{__textureGame.render();await RCScene3D.whenPresented();});await p.screenshot({path:out+'/joe-'+width+'.png'});}
  }
  fs.writeFileSync(out+'/report.json',JSON.stringify({rows,checks,errors},null,2));assert.deepEqual(errors,[]);
  if(verify){assert(rows.every(r=>r.orphans.length===0),'No prior-scene texture may remain allocated without an owner');assert(rows.every(r=>r.memory.textures===rows[0].memory.textures),'Repeated scene resets must keep texture count stable');}
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
