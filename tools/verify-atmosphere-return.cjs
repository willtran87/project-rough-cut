const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const software=process.argv.includes('--software'),out=(process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/atmosphere-return-20261107')+'/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__atmosPrograms=()=>renderer.info.programs.length;window.__atmosWorld=()=>world;'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__fx={state,resetFirstHole,render,addTurfMark,triggerHorrorVisualFlash,spatialEffectsFrame,spatialCourseData};\n  window.advanceTime = (milliseconds) => {')}));
 const render=()=>p.evaluate(async()=>{__fx.render();await RCScene3D.whenPresented();return RCScene3D.stats().effects;});
 const snap=async name=>{const fx=await render();samples.push({name,fx});await p.screenshot({path:out+'/'+name+'.png'});return fx;};
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('#game').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__fx&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__fx,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.guidedHints=false;s.hole.tensionDirector.reliefSeconds=0;s.hole.elapsed=100;s.time=100;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:-.18});Object.assign(s.hole.joe,{x:9,y:96,mode:'search',effectHeading:Math.PI/2,effectSpeed:10});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  const preparedPrograms=await p.evaluate(()=>__atmosPrograms());
  await p.evaluate(()=>{const t=__fx;for(let i=0;i<12;i++)t.addTurfMark('mowed',i%2?7:3,69+i*2,{heading:Math.PI/2,radius:4});for(let i=0;i<6;i++)t.addTurfMark('track',-2+(i%2),69+i*2,{heading:Math.PI/2,sand:true,duration:40});});
  const opening=await snap('evidence-2560');assert(opening.counts.trails>0);assert(opening.counts.ripples>0);assert(opening.counts.beam>0);assert(opening.drawCalls<=11);assert(opening.original.drawCalls<=2);
  checks.push('Real turf evidence and heading-driven mower cues render within eleven bounded effect draws, including at most two restoration draws');
  const untouched=await p.evaluate(()=>{const s=__fx.state;window.__beforeFX=JSON.stringify({player:s.player,joe:s.hole.joe,marks:s.hole.turfMarks,detection:s.hole.detection});__fx.render();return __beforeFX===JSON.stringify({player:s.player,joe:s.hole.joe,marks:s.hole.turfMarks,detection:s.hole.detection});});assert(untouched);checks.push('Rendering leaves player, Joe, detection and evidence simulation unchanged');
  await p.evaluate(()=>{const s=__fx.state;s.clearScenery=false;s.hole.elapsed+=1;s.hole.horrorDirector.fogSurgeSeconds=1.1;s.hole.crosswind.phase='active';s.hole.crosswind.timer=5;});
  const surge=await snap('wind-and-mist');assert(surge.surge>.5);assert(surge.counts.mist>0);assert(surge.counts.flecks>0);assert(surge.mistOpacity>.20);
  await p.evaluate(()=>{const s=__fx.state;s.hole.elapsed+=1;s.flashes=true;s.hole.horrorDirector.manifestation={type:'peripheral_groundskeeper',seed:42,side:1,seconds:.8,duration:1.6};});
  const nearJoe=await render();assert.equal(nearJoe.ghostScheduling.reason,'real_joe');assert.equal(nearJoe.eventAnchor,null);
  await p.evaluate(()=>{Object.assign(__fx.state.hole.joe,{x:100,y:690,mode:'patrol'});__fx.state.hole.elapsed+=.1;});
  const event=await snap('apparition');assert(event.eventAnchor);assert(event.ghost.ready);assert(event.ghost.visible);assert(event.ghost.triangles<=6000);assert.equal(event.ghost.drawCalls,1);
  assert.equal(event.ghost.poses.length,8);
  const morphology=await p.evaluate(()=>{let mesh;__atmosWorld().getObjectByName('GhostJoe').traverse(o=>{if(o.isMesh)mesh=o;});const g=mesh.geometry,targets=g.morphAttributes.position,walk=targets[mesh.morphTargetDictionary.Walk2],idle=targets[mesh.morphTargetDictionary.IdleHigh],wheel=g.attributes._ghost_wheel;let walkDelta=0,idleDelta=0,wheelVertices=0,wheelDelta=0;for(let i=0;i<walk.count;i++){walkDelta=Math.max(walkDelta,Math.hypot(walk.getX(i),walk.getY(i),walk.getZ(i)));idleDelta=Math.max(idleDelta,Math.hypot(idle.getX(i),idle.getY(i),idle.getZ(i)));if(wheel.getY(i)>.01){wheelVertices++;wheelDelta=Math.max(wheelDelta,Math.hypot(walk.getX(i),walk.getY(i),walk.getZ(i)));}}return {walkDelta,idleDelta,wheelVertices,wheelDelta};});
  assert(morphology.walkDelta>.1);assert(morphology.idleDelta>.005);assert(morphology.wheelVertices>100);assert(morphology.wheelDelta<.0001,'Wheels rotate rigidly, without morph shrinking');
  const motionSamples=[];
  for(let i=0;i<34;i++){
    await p.evaluate(()=>{__fx.state.hole.elapsed+=.1;});const f=await render();
    assert.deepEqual(f.eventAnchor,event.eventAnchor);assert(f.ghost.distance<=.751);assert.equal(f.ghost.drawCalls,1);
    if([5,12,25,33].includes(i)){motionSamples.push(f.ghost);await snap('ghost-motion-'+i);}
  }
  assert(motionSamples.some(s=>s.walkWeight>.5));assert(motionSamples.at(-1).distance>.1);assert.equal(motionSamples.at(-1).walkWeight,0);
  const still=await render();assert.deepEqual((await render()).ghost,still.ghost,'Duplicate render preserves the full pose');
  await p.evaluate(()=>{__fx.state.mode='paused';});const pausedGhost=await render();await p.evaluate(()=>{__fx.state.hole.elapsed+=1;});assert.deepEqual((await render()).ghost,pausedGhost.ghost,'Pause freezes ghost motion and morph weights');await p.evaluate(()=>{__fx.state.mode='first_hole';});
  checks.push('Eight authored morph poses animate a bounded, grounded ghost walk and idle; one draw, rigid wheels, stable anchors and paused poses');
  await p.evaluate(()=>{__fx.state.player.yaw=.35;});const turned=await render();assert.deepEqual(turned.eventAnchor,event.eventAnchor);checks.push('Apparition anchors stay fixed when the viewer turns; normal world depth testing remains enabled');
  await p.evaluate(()=>{const s=__fx.state;s.hole.elapsed+=1;s.hole.horrorDirector.manifestation=null;s.hole.horrorDirector.visualFlash={type:'course_tear',seed:44,side:-1,seconds:.3,duration:.6};});const tear=await snap('course-tear');assert.equal(tear.event,'course_tear');assert.equal(tear.counts.figures,0);assert(tear.feedback.visible);
  await p.evaluate(()=>{const s=__fx.state;s.hole.elapsed+=1;__fx.triggerHorrorVisualFlash('joe_flash',45);const v=s.hole.horrorDirector.visualFlash;if(v.duration<.7||v.duration>.9)throw Error('Unreadable spatial Joe-flash duration');v.seconds=v.duration/2;});assert.equal((await render()).event,'joe_flash');checks.push('Original course-tear and Joe-flash event types select edge interference and a world apparition respectively');
  await p.evaluate(()=>{const s=__fx.state;s.hole.elapsed+=1;s.flashes=false;});assert.equal((await render()).event,null);
  await p.evaluate(()=>{const s=__fx.state;s.flashes=false;s.apparitions=true;s.hole.elapsed+=1;s.hole.horrorDirector.manifestation={type:'peripheral_groundskeeper',seed:46,side:1,seconds:.8,duration:1.6};});
  assert((await render()).ghost.visible,'Slow sightings remain available with flashes disabled');
  await p.evaluate(()=>{roughCutRebuild.setComfort('apparitions',false);});assert(!(await render()).ghost.visible,'Ghost sightings switch applies immediately');
  assert.equal(await p.evaluate(()=>RCFoundation.readComfort().apparitions),false);await p.evaluate(()=>roughCutRebuild.setComfort('apparitions',true));
  await p.keyboard.press('Escape');await render();await p.locator('#controls-launch').click();
  const sightings=p.locator('#controls-dialog [data-feel=apparitions]');assert(await sightings.isVisible());await sightings.uncheck();assert.equal(await p.evaluate(()=>__fx.state.apparitions),false);await sightings.check();await p.screenshot({path:out+'/ghost-comfort-controls.png'});await p.locator('#controls-dialog button').first().click();await p.keyboard.press('Escape');await render();
  checks.push('Ghost sightings have an independent persisted switch; default slow sightings do not require scare flashes');
  await p.evaluate(()=>{const s=__fx.state;s.flashes=true;s.reducedMotion=true;s.hole.elapsed+=1;});const reduced=await render();assert.equal(reduced.event,null);
  await p.evaluate(()=>{__fx.state.hole.elapsed+=1;});assert.equal((await render()).motionTime,reduced.motionTime);checks.push('Flash preference and Reduced Motion suppress scare imagery; decorative motion freezes');
  await p.evaluate(()=>{const s=__fx.state;s.reducedMotion=false;s.hole.horrorDirector.manifestation=null;s.hole.horrorDirector.visualFlash=null;s.hole.joe.mode='chase';s.hole.detection=.8;s.hole.elapsed+=1;});await snap('chase-feedback');
  await p.evaluate(()=>{const s=__fx.state;s.hole.joe.x=100;s.hole.joe.y=690;s.hole.joe.mode='patrol';s.hole.detection=0;s.hole.concealment=.9;s.hole.crouched=true;s.hole.elapsed+=1;});await snap('concealment-feedback');
  const pauseBefore=await render();await p.evaluate(()=>{__fx.state.mode='paused';});await render();await render();const paused=await p.evaluate(()=>({fx:RCScene3D.stats().effects,hidden:document.querySelector('#pixel-feedback').hidden}));assert.equal(paused.fx.motionTime,pauseBefore.motionTime);assert(paused.hidden);checks.push('Pause freezes world atmosphere and hides feedback beneath modal interfaces');
  await p.evaluate(()=>{const s=__fx.state;s.mode='first_hole';s.hole.mapOpen=true;});await render();assert(await p.locator('#pixel-feedback').evaluate(e=>e.hidden));
  await p.evaluate(()=>{const s=__fx.state;s.hole.mapOpen=false;s.hole.concealment=0;s.hole.crouched=false;s.hole.elapsed+=1;s.effectsDensity=0;});const zero=await render();assert.equal(zero.counts.mist,0);assert.equal(zero.counts.flecks,0);assert(zero.counts.trails>0);checks.push('Zero decorative density retains useful ground evidence; Map suppresses screen feedback');
  await p.evaluate(()=>{const s=__fx.state;s.effectsDensity=1;s.clearScenery=true;s.hole.elapsed+=1;});
  await p.evaluate(()=>{const s=__fx.state;Object.assign(s.player,{x:-63,y:187,yaw:0,pitch:-.25});Object.assign(s.hole.joe,{x:100,y:690,mode:'patrol'});s.hole.elapsed+=1;s.hole.horrorDirector.fogSurgeSeconds=0;s.hole.tensionDirector.reliefSeconds=0;s.effectsDensity=1;s.clearScenery=true;s.flashes=false;});
  const pond=await snap('pond-default-mist');assert(pond.counts.mist>0);assert(pond.zoneDensity>1.2);assert(pond.mistOpacity>.17);
  const mistDifference=await p.evaluate(async()=>{
    const c=document.getElementById('game'),gl=c.getContext('webgl2'),a=new Uint8Array(c.width*c.height*4),b=new Uint8Array(a.length),mist=__atmosWorld().getObjectByName('PixelEffect-mist');
    gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,a);const opacity=mist.material.opacity;mist.material.opacity=0;__fx.render();await RCScene3D.whenPresented();gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,b);mist.material.opacity=opacity;
    let changed=0,total=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)changed++;total+=d;}return {changed,mean:total/a.length};
  });assert(mistDifference.changed>1000);checks.push('Pond mist changes visible pixels with default Clear Scenery and no forced surge: '+JSON.stringify(mistDifference));
  await p.evaluate(()=>{const s=__fx.state;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:-.2});s.hole.elapsed=100;s.hole.courseEchoRecord={timeSeconds:120,ghostPath:Array.from({length:12},(_,i)=>({x:3,y:69+i*2,t:90+i,d:i*3}))};s.effectsDensity=0;s.flashes=false;});
  const echo=await snap('saved-run-trail');assert(echo.counts.echo>0);assert.equal(echo.counts.mist,0);assert(!echo.ghost.visible);checks.push('Saved-run trail is spatial and remains visible with decorative atmosphere and scares disabled');
  await p.evaluate(()=>{const s=__fx.state,light=__fx.spatialCourseData().obstacles.find(o=>o.lightRadius);s.hole.courseEchoRecord=null;s.effectsDensity=1;s.clearScenery=false;s.hole.elapsed+=1;Object.assign(s.player,{x:light.x-5,y:light.y-25,yaw:0,pitch:.05});});
  const shafts=await snap('floodlight-haze');assert(shafts.counts.shafts>0);checks.push('Powered course floodlights emit bounded depth-tested haze shafts');
  const finalPrograms=await p.evaluate(()=>__atmosPrograms());assert.equal(finalPrograms,preparedPrograms,'No first-use shader compilation for ghosts, shafts, echo or tears');checks.push('All effect shaders prepared before the first event');
  for(const [name,width,height] of [['1280',1280,720],['800',800,600],['844-touch',844,390]]){
   await p.setViewportSize({width,height});if(name.includes('touch'))await p.evaluate(()=>__fx.state.inputMethod='touch');await snap(name);
   const bounds=await p.evaluate(()=>{const a=document.querySelector('#game').getBoundingClientRect(),b=document.querySelector('#pixel-feedback').getBoundingClientRect();return {dx:Math.abs(a.x-b.x),dy:Math.abs(a.y-b.y),dw:Math.abs(a.width-b.width),dh:Math.abs(a.height-b.height)};});assert(bounds.dx<3&&bounds.dy<3&&bounds.dw<3&&bounds.dh<3);
  }
  checks.push('Feedback anchors to the game canvas at 2560×1600, 1280×720, 800×600 and 844×390 touch');
  for(const sample of samples)for(const [kind,count]of Object.entries(sample.fx.counts))assert(count<=sample.fx.limits[kind],kind);
  await p.evaluate(()=>{RCScene3D.reset();__fx.render();});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await render();assert.equal(await p.locator('#pixel-feedback').count(),1);checks.push('Scene replacement releases the old effect pools and overlay observer');
  // Isolate depth behavior with an actual opaque wall, not just a material flag.
  await p.route('**/__effects-depth',r=>r.fulfill({contentType:'text/html',body:'<html><body style="margin:0"><div style="position:relative;width:1280px;height:720px"><canvas id="game" width="1280" height="720"></canvas></div></body></html>'}));
  await p.goto('http://127.0.0.1:4187/__effects-depth');await p.setViewportSize({width:1280,height:720});
  await p.evaluate(async software=>{
   const T=await import('./vendor/three/three.module.js'),{createPixelEffects}=await import('./pixel-effects.js'),Art=await import('./pixel-art.js'),{waitForGPU}=await import('./render-preparation.js');
   const scene=new T.Scene();scene.background=new T.Color(0x283e39);scene.fog=new T.Fog(0x203a40,18,34);const camera=new T.PerspectiveCamera(58,1280/720,.055,36);camera.position.set(0,1.65,0);camera.updateMatrixWorld();
   const renderer=new T.WebGLRenderer({canvas:document.getElementById('game'),antialias:false,preserveDrawingBuffer:true});renderer.setSize(1280,720);const moon=new T.DirectionalLight(0xffffff,2);scene.add(moon);
   const fx=createPixelEffects(scene,{software,scale:.16,xScale:.1152,moon}),wall=new T.Mesh(new T.BoxGeometry(10,5,1),new T.MeshBasicMaterial({color:0x3d5549}));wall.position.set(0,1.6,-4);wall.visible=false;scene.add(wall);
   const frame={time:1,player:{x:0,y:0},joe:{x:1000,y:1000,mode:'patrol'},yaw:0,fx:{density:0,flashes:true,horror:{manifestation:{type:'peripheral_groundskeeper',seed:9,side:1,seconds:1,duration:2}},fog:{light:'163,181,164',shadow:'91,123,109'}}};
   await fx.ready;while(Art.stats().pending)await new Promise(r=>setTimeout(r,10));fx.update(frame,camera);await renderer.compileAsync(scene,camera);window.__depth={renderer,scene,camera,fx,wall,waitForGPU};
  },software);
  const depth=[];
  for(const [name,wall,show]of [['open-empty',false,false],['open-ghost',false,true],['wall-empty',true,false],['wall-ghost',true,true]]){
   const d=await p.evaluate(async ({wall,show})=>{const t=__depth;t.wall.visible=wall;t.fx.root.visible=show;t.renderer.render(t.scene,t.camera);await t.waitForGPU(t.renderer);const gl=t.renderer.getContext(),a=new Uint8Array(1280*720*4);gl.readPixels(0,0,1280,720,gl.RGBA,gl.UNSIGNED_BYTE,a);let changed=0;if(!show)window.__depthPixels=a;else for(let i=0;i<a.length;i++)if(a[i]!==__depthPixels[i])changed++;return changed;},{wall,show});depth.push({name,changed:d});if(show)await p.screenshot({path:out+'/'+name+'.png'});
  }
  assert(depth[1].changed>100,'The unobstructed textured 3D apparition must actually render');assert.equal(depth[3].changed,0,'A solid wall must completely hide the apparition');checks.push('Framebuffer comparison proves apparition pixels appear in open space and disappear entirely behind an opaque wall');
  const posePixels=await p.evaluate(async()=>{
    const t=__depth;t.wall.visible=false;t.fx.root.visible=true;let mesh;t.fx.root.getObjectByName('GhostJoe').traverse(o=>{if(o.isMesh)mesh=o;});
    const gl=t.renderer.getContext(),a=new Uint8Array(1280*720*4),b=new Uint8Array(a.length);
    for(const [name,pixels]of [['Walk0',a],['Walk3',b]]){mesh.morphTargetInfluences.fill(0);mesh.morphTargetInfluences[mesh.morphTargetDictionary[name]]=1;t.renderer.render(t.scene,t.camera);await t.waitForGPU(t.renderer);gl.readPixels(0,0,1280,720,gl.RGBA,gl.UNSIGNED_BYTE,pixels);}
    let changed=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])changed++;return changed;
  });assert(posePixels>100,'Authored walking poses must change rendered body pixels without moving its world anchor');checks.push('Framebuffer comparison confirms actual body deformation between walking poses at a fixed anchor');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,samples,depth,errors},null,2));console.log(JSON.stringify({passed:true,checks,depth,errors,samples:samples.map(s=>({name:s.name,counts:s.fx.counts,updateMs:s.fx.updateMs}))},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
