const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.argv[2]||'output/back-nine-visual-upgrade/storm/native',baseline=process.argv.includes('--baseline'),software=process.argv.includes('--software');fs.mkdirSync(out,{recursive:true});fs.rmSync(out+'/report.json',{force:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const file of ['parallax-scene.js','back-nine-scene.js'])await p.route('**/'+file+'*',route=>{
  let source=fs.readFileSync((baseline?'output/back-nine-visual-upgrade/storm/baseline-source/':'web/')+file,'utf8');
  if(file==='parallax-scene.js')source=source.replace('return { scene, camera, update, stats,','return window.__stormBackdrop={ scene, camera, update, stats,');
  else source=source.replace('const hemi=new THREE.HemisphereLight','const hemi=window.__stormHemi=new THREE.HemisphereLight').replace('const moon=new THREE.DirectionalLight','const moon=window.__stormMoon=new THREE.DirectionalLight').replace(' const scene=new THREE.Scene();',' window.__stormRenderer=renderer;const scene=new THREE.Scene();');
  route.fulfill({contentType:'application/javascript',body:source});
 });
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>({state:JSON.parse(render_game_to_text()),moon:__stormMoon.intensity,hemi:__stormHemi.intensity}));
 const present=()=>p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});
 const shot=async name=>{await present();await p.screenshot({path:`${out}/${name}.png`});samples.push({name,...await read()});console.log(name,JSON.stringify(samples.at(-1).state.graphics.parallax));};
 await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x:0,y:90,yaw:0,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0});__backNine.run=r;});await shot('start-2560');
 if(!baseline){
  assert((await read()).state.graphics.parallax.stormCanopy.densityReady);const initial=(await read()).state.graphics,initialPrograms=await p.evaluate(()=>__stormRenderer.info.programs.map(p=>p.cacheKey));
  const probes=await p.evaluate(async()=>{
   const THREE=await import('./vendor/three/three.module.js'),{stormCoordinates,stormOpacity,sampleStormDensity}=await import('./back-nine-storm-sky.js');
   let canopy;__stormBackdrop.scene.traverse(o=>{if(o.material?.uniforms?.densityMap)canopy=o;});
   const source=canopy.material,material=source.clone(),map=source.uniforms.densityMap.value,canvas=map.image;
   const rgba=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height).data,data=new Uint8Array(canvas.width*canvas.height);
   for(let i=0;i<data.length;i++)data[i]=rgba[i*4];
   material.fragmentShader=material.fragmentShader.replace('gl_FragColor=vec4(color,opacity*smoothstep(-.03,.14,direction.y));','gl_FragColor=vec4(vec3(opacity*smoothstep(-.03,.14,direction.y)),1.0);').replace('#include <tonemapping_fragment>','').replace('#include <colorspace_fragment>','');
   material.transparent=false;material.depthTest=false;
   const renderer=new THREE.WebGLRenderer({antialias:false}),target=new THREE.WebGLRenderTarget(64,64),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(4,1,.1,1200),mesh=new THREE.Mesh(canopy.geometry,material);scene.add(mesh);camera.lookAt(-280,280,-720);camera.updateMatrixWorld();
   const direction=new THREE.Vector3((32.5/64)*2-1,(32.5/64)*2-1,.5).unproject(camera).sub(camera.position).normalize();
   const buffer=new Uint8Array(4),result=[];renderer.setRenderTarget(target);
   for(const time of [0,45,90,135,180]){material.uniforms.windTime.value=time;renderer.render(scene,camera);renderer.readRenderTargetPixels(target,32,32,1,1,buffer);const uv=stormCoordinates(direction,time),expected=stormOpacity(...uv.map(v=>sampleStormDensity(data,canvas.width,canvas.height,...v)),direction.y);result.push({time,gpu:buffer[0]/255,cpu:expected,error:Math.abs(buffer[0]/255-expected)});}
   target.dispose();material.dispose();renderer.dispose();renderer.forceContextLoss();return result;
  });
  assert(probes.every(p=>p.error<.035),'GPU density and CPU moon sampling agree');fs.writeFileSync(out+'/gpu-probes.json',JSON.stringify(probes,null,2));
  // Step only the backdrop clock for a reproducible long cloud traversal,
  // preserving the actual gameplay camera and world lighting on final draw.
  const progression=await p.evaluate(()=>{const b=__stormBackdrop,view=b.camera.clone(),r=__backNine.run,result=[];for(let i=0;i<1800;i++){r.time+=.1;b.update(view,r.time,false,false);if(i%100===0)result.push(b.stats().stormCanopy);}return result;});
  assert(Math.max(...progression.map(s=>s.moonCoverage))-Math.min(...progression.map(s=>s.moonCoverage))>.15,'clouds vary moon occlusion');await shot('clouds-180-2560');
  const turn=async yaw=>{await p.evaluate(yaw=>{const r=__backNine.run;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x:0,y:90,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;},yaw);await present();};
  const before=await read(),orientation=await p.evaluate(()=>__stormBackdrop.camera.quaternion.toArray());await turn(1.8);const turned=await read();assert.equal(turned.state.graphics.parallax.moonCoverage,before.state.graphics.parallax.moonCoverage);assert.equal(turned.moon,before.moon);assert.notDeepEqual(await p.evaluate(()=>__stormBackdrop.camera.quaternion.toArray()),orientation,'actual camera turns');
  for(const yaw of [Math.PI/2,Math.PI,-Math.PI/2]){await turn(yaw);await shot('heading-'+Math.round(yaw*100));}
  await turn(0);
  await p.keyboard.press('Escape');const paused=(await read()).state.graphics.parallax;await p.evaluate(()=>advanceTime(1500));assert.deepEqual((await read()).state.graphics.parallax,paused);await p.locator('#primary').click();
  await p.evaluate(()=>{const c=document.getElementById('chase-reduced');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));});await present();const reduced=(await read()).state.graphics.parallax;await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).state.graphics.parallax.stormCanopy.motionTime,reduced.stormCanopy.motionTime);
  await p.evaluate(()=>{const c=document.getElementById('chase-reduced');c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}));});
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('storm-'+width);}
  const end=(await read()).state.graphics,endPrograms=await p.evaluate(()=>__stormRenderer.info.programs.map(p=>p.cacheKey));fs.writeFileSync(out+'/program-changes.json',JSON.stringify({initial:initialPrograms.length,end:endPrograms.length,added:endPrograms.filter(k=>!initialPrograms.includes(k))},null,2));assert.equal(end.programs,initial.programs);assert.equal(end.textures,initial.textures);
  await p.keyboard.press('Escape');await p.locator('#restart').click();await p.evaluate(()=>advanceTime(17));const reset=await read();assert(reset.state.graphics.parallax.stormCanopy.motionTime<1);assert.equal(await p.evaluate(()=>__backNine.run.checkpoint),0);
  fs.writeFileSync(out+'/progression.json',JSON.stringify(progression,null,2));
  const legacy=await p.evaluate(async()=>{const active=__stormBackdrop,{createParallax}=await import('./parallax-scene.js'),view=active.camera.clone(),sky=createParallax({storm:.97,night:.92});sky.update(view,0,true,false);const before=sky.stats();sky.update(view,0,true,false,{progress:1,skyScale:.8,moonScale:.92,cloudWidth:2,cloudHeight:1.2,cloudOpacity:.8});sky.update(view,0,true,false);const restored=sky.stats();sky.dispose();window.__stormBackdrop=active;return {before,restored};});
  assert.equal(legacy.before.clouds,9);assert.equal(legacy.before.cloudWidth,1.3395);assert.equal(legacy.before.cloudOpacity,.6546);assert.deepEqual(legacy.before,legacy.restored);fs.writeFileSync(out+'/legacy-defaults.json',JSON.stringify(legacy,null,2));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,baseline,software,samples,errors},null,2));console.log('PASS',out);
}finally{await browser.close();}})().catch(e=>{fs.writeFileSync(out+'/report.json',JSON.stringify({passed:false,error:e.stack},null,2));console.error(e);process.exitCode=1;});
