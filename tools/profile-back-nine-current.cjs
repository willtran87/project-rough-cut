const fs=require('node:fs'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__profile={scene,camera,renderer,practicalLights,headlights,mowerLight,components:{storyArt,tracks,garageMotion,sceneryContacts,greenFlags,breakFragments,irrigationArt,ghosts,clippings,experienceArt,courseFeatures,hurdleArt,destructionArt,runner,riderMotion,headlights,nightShadows,beaconShadows,courseDetail,contactShadows,localMist,windbreakArt,riderCulling,staffSighting,batchCulling,localLights,pines,backdrop},update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const results=await p.evaluate(async()=>{
  const {createRun}=await import('./back-nine-sim.js'),r=createRun();r.mode='driving';r.time=20;r.cart.x=-29;r.cart.y=443;r.joe.x=-27;r.joe.y=433;r.joe.speed=14;r.tactics.floodUntil[1]=100;r.tactics.floodUntil[2]=100;
  const w=__profile,gl=w.renderer.getContext();w.renderer.setSize(640,360,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.update(r,{reducedMotion:true});
  const lights=[],meshes=[];w.scene.traverse(o=>{if(o.isLight)lights.push({o,intensity:o.intensity});if(o.isMesh)meshes.push({o,visible:o.visible});});
  const results=[];
  for(const mode of ['all']){
   w.practicalLights.setStrength(mode==='no-practical'?0:1);for(const l of lights)l.o.intensity=mode==='no-dynamic-lights'&&(l.o.isPointLight||l.o.isSpotLight)?0:l.intensity;
   for(const m of meshes)m.o.visible=m.visible&&!(mode==='no-contacts'&&m.o.name.startsWith('SceneryContact'))&&!(mode==='no-alpha'&&m.o.material?.alphaTest>0);
   const times=[];for(let i=0;i<22;i++){const start=performance.now();w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(fence);if(i>3)times.push(performance.now()-start);}times.sort((a,b)=>a-b);results.push({mode,median:times[9],p95:times.at(-1)});
  }
  const cpu={};for(const [name,o]of Object.entries(w.components)){if(!o?.update)continue;const f=o.update;cpu[name]=0;o.update=function(...args){const t=performance.now();const v=f.apply(this,args);cpu[name]+=performance.now()-t;return v;};}
  for(const state of [...r.destruction.props,...Object.values(r.destruction.features)])Object.assign(state,{brokenAt:r.time,dx:.2,dy:1,power:1});
  const start=performance.now();for(let n=0;n<100;n++){r.time+=1/60;r.cart.y+=.035;r.joe.y+=.035;w.update(r,{reducedMotion:false});}cpu.total=performance.now()-start;for(const k of Object.keys(cpu))cpu[k]/=100;results.push({cpu:Object.fromEntries(Object.entries(cpu).sort((a,b)=>b[1]-a[1]))});return results;
 });fs.mkdirSync('output/back-nine-visual-upgrade/final-polish',{recursive:true});fs.writeFileSync('output/back-nine-visual-upgrade/final-polish/software-profile.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
