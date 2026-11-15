const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
(async()=>{
 const software=process.argv.includes('--software'),out='output/level-one-approach-wear/interleaved-'+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],rows=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('softwareBudget=createSoftwareFrameBudget()','softwareBudget=createSoftwareFrameBudget({scales:[.625]})')+'\nwindow.__cost=()=>({THREE,renderer,world,camera,parallax,sceneTarget,currentData});'}));
 await p.route('**/paper-guidance-baseline.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-approach-wear/baseline-source/environment-guidance.js','utf8')}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__perf);
  await p.evaluate(()=>{const t=__perf,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true,effectsDensity:0});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  await p.evaluate(async()=>{const r=__cost(),{createEnvironmentGuidance}=await import('./paper-guidance-baseline.js');window.__paperCurrent=[r.world.getObjectByName('EnvironmentalGuidance')];window.__paperBaseline=new r.THREE.Group();createEnvironmentGuidance(__paperBaseline,r.currentData,{scale:.16,xScale:.1152,craftedPaper:true});const unused=__paperBaseline.getObjectByName('CourseDroppedPaper');unused.removeFromParent();unused.geometry.dispose();unused.material.map.dispose();unused.material.dispose();const {loadBakedTerrain}=await import('./baked-terrain.js');const bitmap=await loadBakedTerrain(r.currentData,.16,.1152,false);if(!bitmap)throw Error('Missing baseline terrain');r.world.traverse(o=>{if(o.userData.lanternGround)window.__wearGround=o;});window.__wearCurrent=__wearGround.material.map;window.__wearBefore=new r.THREE.Texture(bitmap);for(const k of ['colorSpace','magFilter','minFilter','generateMipmaps','anisotropy','flipY','wrapS','wrapT'])__wearBefore[k]=__wearCurrent[k];__wearBefore.needsUpdate=true;__paperBaseline.visible=false;r.world.add(__paperBaseline);});
  for(const [view,x,y,yaw,pitch]of [['release',98.1501,594.15446,-.068541,-.721968],['service',-79.62519,394.59308,-.846446,-.721968],['opening',0,10,0,0]]){
   await p.evaluate(async v=>{Object.assign(__perf.state.player,v);__perf.render();await RCScene3D.whenPresented();},{x,y,yaw,pitch});
   for(const mode of ['before','after','after','before','before','after']){
    const row=await p.evaluate(async({view,mode})=>{
     const {renderer:r,world,camera,parallax,sceneTarget}=__cost(),gl=r.getContext(),pixels=new Uint8Array(sceneTarget.width*sceneTarget.height*4),times=[];
     __paperBaseline.visible=mode==='before';for(const o of __paperCurrent)o.visible=mode==='after';__wearGround.material.map=mode==='before'?__wearBefore:__wearCurrent;
     try{r.setRenderTarget(sceneTarget);gl.finish();for(let i=0;i<24;i++){
      await new Promise(requestAnimationFrame);const start=performance.now();r.autoClear=false;r.clear();r.render(parallax.scene,parallax.camera);r.clearDepth();r.render(world,camera);r.autoClear=true;
      gl.finish();gl.readPixels(0,0,sceneTarget.width,sceneTarget.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(i>=12)times.push(performance.now()-start);
     }times.sort((a,b)=>a-b);return {view,mode,median:times[6],p95:times[11],resolution:[sceneTarget.width,sceneTarget.height],draws:r.info.render.calls,triangles:r.info.render.triangles};}
     finally{__wearGround.material.map=__wearCurrent;__paperBaseline.visible=false;for(const o of __paperCurrent)o.visible=true;r.autoClear=true;r.setRenderTarget(null);}
    },{view,mode});rows.push(row);console.log(JSON.stringify(row));
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({method:'Same-world original guidance/terrain versus integrated ground wear. Identical existing printed-paper mesh and lighting retained. All other geometry/camera/source state fixed. Each block24frames,12warmups discarded, full RGBA readback after gl.finish included. Before/after order reverses. Current cached moon-shadow map shared. Isolated render cost, not end-to-end gameplay FPS.',rows,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
