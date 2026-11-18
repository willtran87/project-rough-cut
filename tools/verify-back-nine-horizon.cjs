const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2],before=process.argv.includes('--before'),software=process.argv.includes('--software'),contractsOnly=process.argv.includes('--contracts');if(!out)throw Error('Output directory required');
const views=[['nursery',20,65,.12,true],['pump',0,220,0,false],['range',0,420,0,false],['range-east',20,505,Math.PI/2,true],['range-west',-20,505,-Math.PI/2,true],['clubhouse',21,712,.1,true],['return',0,430,Math.PI,true],['garage',-33.76177,769.442,.05788,true]];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/parallax-scene.js*',r=>{
  const baseline=before||r.request().url().includes('qa-horizon-baseline');let body=fs.readFileSync((baseline?'output/back-nine-visual-upgrade/horizon/baseline-source/':'web/')+'parallax-scene.js','utf8');
  if(!r.request().url().includes('qa-horizon-'))body=body.replace('return { scene, camera, update, stats,','return window.__horizonBackdrop={ scene, camera, update, stats,');
  return r.fulfill({contentType:'application/javascript',body});
 });
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__horizonWorld={scene,camera,renderer,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 for(const[name,x,y,yaw,foot]of (contractsOnly?[]:process.argv.includes('--garage')?views.slice(-1):views)){
  await p.evaluate(async({x,y,yaw,foot})=>{const{createRun}=await import('./back-nine-sim.js'),{blocked}=await import('./back-nine-course.js');if(blocked({x,y},foot?.5:1.65))throw Error('Capture point intersects course collision');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x,y,yaw,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0});if(foot){Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};}__backNine.run=r;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();},{x,y,yaw,foot});
  await p.screenshot({path:path.join(out,name+'-2560.jpg'),type:'jpeg',quality:93});samples.push({name,state:await p.evaluate(()=>JSON.parse(render_game_to_text()))});console.log('captured',name);
 }
 for(const[width,height]of (contractsOnly?[]:[[1280,720],[390,844]])){await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});await p.screenshot({path:path.join(out,'garage-'+width+'.jpg'),type:'jpeg',quality:93});}
 let contract=null;
 if(!before){
  assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.parallax.horizon.layers),3);
  await p.keyboard.press('Escape');const time=await p.evaluate(()=>__backNine.run.time);await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>__backNine.run.time),time);await p.click('#primary');
  contract=await verifyBackdrop(p);assert.equal(contract.defaultPixelsChanged,0,'Level 1 default rendering preserved');assert(contract.travelPixelsChanged>100,'travel changes actual horizon projection');assert(contract.turnPixelsChanged>100,'turning changes actual horizon projection');assert.equal(contract.disposedGeometries,3);assert.equal(contract.disposedMaterials,3);assert.equal(contract.texturesDisposed,0);
  await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(17));const run=await p.evaluate(()=>__backNine.run);assert.equal(run.checkpoint,0);assert(run.cart.y<20);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,before,software,errors,samples,contract},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

async function verifyBackdrop(page){return page.evaluate(async()=>{
 const THREE=await import('./vendor/three/three.module.js'),{createParallax}=await import('./parallax-scene.js?qa-horizon-current'),{createParallax:oldParallax}=await import('./parallax-scene.js?qa-horizon-baseline'),Art=await import('./pixel-art.js');
 const renderer=__horizonWorld.renderer,current=createParallax(),baseline=oldParallax();
 const defaults=[];current.scene.traverse(o=>{const m=o.material?.map;if(m)defaults.push([m,m.wrapS,m.wrapT,m.repeat.x,m.repeat.y,m.offset.x,m.offset.y]);});
 const horizon=createParallax({travelScale:.08,showEstate:false,storm:.97,night:.92,stormCanopy:true,estateHorizon:true});
 for(const[m,s,t,x,y,u,v]of defaults)if(m.wrapS!==s||m.wrapT!==t||m.repeat.x!==x||m.repeat.y!==y||m.offset.x!==u||m.offset.y!==v)throw Error('Back Nine mutated shared default texture transform');
 await Promise.all(['rough-cut-cloud-atlas-v2','rough-cut-distant-clubhouse-v1'].map(Art.source));
 const view=new THREE.PerspectiveCamera(64,16/9,.1,145);view.position.set(0,3,-65);view.lookAt(0,3,-100);view.updateMatrixWorld();
 const target=new THREE.WebGLRenderTarget(640,360),oldTarget=renderer.getRenderTarget(),viewport=renderer.getViewport(new THREE.Vector4()),oldClear=renderer.autoClear;
 const render=w=>{renderer.setRenderTarget(target);renderer.autoClear=true;renderer.render(w.scene,w.camera);const pixels=new Uint8Array(640*360*4);renderer.readRenderTargetPixels(target,0,0,640,360,pixels);return pixels;};
 const changed=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n;};
 let defaultPixelsChanged,travelPixelsChanged,turnPixelsChanged,disposedGeometries=0,disposedMaterials=0,texturesDisposed=0;const nodes=[];
 try{
  defaultPixelsChanged=0;
  for(const[x,y,z,yaw]of [[0,3,-65,0],[20,7,-220,1.3],[-18,2,-715,3.1]]){
   view.position.set(x,y,z);view.rotation.set(0,yaw,0);view.updateMatrixWorld();for(const w of [current,baseline])w.update(view,20,false,false);
   defaultPixelsChanged+=changed(render(current),render(baseline));
  }
  view.position.set(0,3,-65);view.lookAt(0,3,-100);view.updateMatrixWorld();horizon.update(view,20,false,false);
  const start=render(horizon),initial=horizon.stats();
  view.position.set(30,4,-710);view.lookAt(30,4,-750);view.updateMatrixWorld();horizon.update(view,20,false,false);const moved=render(horizon);travelPixelsChanged=changed(start,moved);
  const travel=horizon.stats();view.rotateY(Math.PI/2);view.updateMatrixWorld();horizon.update(view,20,false,false);turnPixelsChanged=changed(moved,render(horizon));
  if(initial.moonCoverage!==travel.moonCoverage||initial.moonCoverage!==horizon.stats().moonCoverage)throw Error('View changed world moon coverage');
  horizon.scene.traverse(o=>{if(['far-estate-ridge','wooded-slope','estate-woodland'].includes(o.name)){nodes.push(o);o.geometry.addEventListener('dispose',()=>disposedGeometries++);o.material.addEventListener('dispose',()=>disposedMaterials++);o.material.map.addEventListener('dispose',()=>texturesDisposed++);}});
  for(const layer of travel.layers.filter(l=>nodes.some(n=>n.name===l.name))){const expected=[30*.08*(1-layer.influence),-710*.08*(1-layer.influence)];if(layer.origin.some((x,i)=>Math.abs(x-expected[i])>1e-8))throw Error('Wrong horizon world anchor');}
 }finally{renderer.setRenderTarget(oldTarget);renderer.setViewport(viewport);renderer.autoClear=oldClear;target.dispose();current.dispose();baseline.dispose();horizon.dispose();}
 return {defaultViews:3,defaultPixelsChanged,defaultTexturesUntouched:true,travelPixelsChanged,turnPixelsChanged,disposedGeometries,disposedMaterials,texturesDisposed};
});}
