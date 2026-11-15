const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='output/vehicle-contact';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.route('**/back-nine-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()', 'window.__vehicleModels={cart:cart.root,mower:mower.root};return {scene,camera,update,draw()')}));
  await page.goto('http://127.0.0.1:4187/back-nine.html?test');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.click('#primary');await page.evaluate(()=>advanceTime(0));
  const before=await page.evaluate(()=>JSON.parse(render_game_to_text()).graphics),checks=[];
  for(const scenario of [
   {name:'rear-decks',cart:{x:0,y:40},joe:{x:0,y:33,yaw:0,speed:18}},
   {name:'head-on',cart:{x:0,y:30},joe:{x:0,y:37,yaw:Math.PI,speed:17}},
   {name:'side-impact',cart:{x:0,y:40},joe:{x:-8,y:40,yaw:Math.PI/2,speed:16}},
   {name:'angled-impact',cart:{x:0,y:40,yaw:-.5},joe:{x:-7,y:36,yaw:.8,speed:17}},
   {name:'boundary-pin',cart:{x:39,y:30,yaw:Math.PI/2},joe:{x:32,y:30,yaw:Math.PI/2,speed:17}},
   {name:'damaging-rear',damage:true,cart:{x:0,y:40},joe:{x:0,y:33,yaw:0,speed:18}}
  ]){
   const result=await page.evaluate(async s=>{
    const {createRun}=await import('./back-nine-sim.js'),{vehicleOverlap}=await import('./vehicle-contact.js');const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,s.cart,{invulnerable:s.damage?0:20});Object.assign(r.joe,s.joe);__backNine.run=r;
    let touched=false,frames=0;for(;frames<240;frames++){__backNine.simulate(1/60);if(vehicleOverlap(r.cart,r.joe))throw Error('Visible pair overlapped '+s.name);if(r.contact){touched=true;break;}}
    r.lookBack=true;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();return {name:s.name,touched,frames,hits:r.cart.hits,cart:{x:r.cart.x,y:r.cart.y},joe:{x:r.joe.x,y:r.joe.y}};
   },scenario);assert(result.touched,scenario.name);assert.equal(result.hits,scenario.damage?1:0);checks.push(result);await page.screenshot({path:`${out}/${scenario.name}-2560.png`});
  }
  // Check actual rendered geometry, including maximum cart body roll, against
  // the simulation hulls. This catches visual/collision dimensions drifting.
  const geometry=await page.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{VEHICLE_HULLS}=await import('./vehicle-contact.js');const r=__backNine.run;r.cart.steer=1;r.cart.speed=14;r.impact.age=.055;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();
   const failures=[],counts={};for(const[kind,root]of Object.entries(__vehicleModels)){
    root.updateWorldMatrix(true,true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert(),p=new T.Vector3();counts[kind]=0;
    root.traverseVisible(mesh=>{if(!mesh.isMesh)return;if(mesh.isSkinnedMesh)mesh.skeleton.update();const instance=new T.Matrix4();for(let slot=0;slot<(mesh.isInstancedMesh?mesh.count:1);slot++){if(mesh.isInstancedMesh)mesh.getMatrixAt(slot,instance);for(let i=0;i<mesh.geometry.attributes.position.count;i++){mesh.getVertexPosition(i,p);if(mesh.isInstancedMesh)p.applyMatrix4(instance);p.applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse);counts[kind]++;if(!VEHICLE_HULLS[kind].some(h=>Math.abs(p.x)<=h.width+.0001&&Math.abs(-p.z-h.forward)<=h.length+.0001)&&failures.length<10)failures.push({kind,name:mesh.name,x:p.x,forward:-p.z});}}});
   }return {counts,failures};
  });assert.deepEqual(geometry.failures,[],'Rendered vehicle parts extend beyond collision hulls');
  await page.evaluate(async()=>{__backNine.run.impact.age=.16;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});const feedback=await page.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(feedback.graphics.impactParticles,12);assert(Math.abs(feedback.graphics.impactRecoil)>.01);assert(await page.locator('.dashboard').evaluate(e=>e.classList.contains('impact')));assert.match(await page.locator('#caption').innerText(),/STRIKE|HIT/);
  await page.screenshot({path:`${out}/impact-feedback-2560.png`});
  // Small-screen collision views retain the same solid geometry and controls.
  for(const[width,height]of [[1280,720],[844,390]]){await page.setViewportSize({width,height});await page.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented()});await page.screenshot({path:`${out}/contact-${width}.png`});}
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});const reduced=await page.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(reduced.graphics.impactParticles,0);assert.equal(Math.abs(reduced.graphics.impactRecoil),0);assert.match(await page.locator('#caption').innerText(),/STRIKE|HIT/);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>advanceTime(1000));const settled=await page.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(settled.graphics.impactParticles,0);assert.equal(Math.abs(settled.graphics.impactRecoil),0);
  const after=settled.graphics;assert.equal(before.programs,after.programs);assert.equal(before.textures,after.textures);assert.deepEqual(errors,[]);
  const result={passed:true,checks,geometry,programs:after.programs,textures:after.textures,errors};fs.writeFileSync(`${out}/browser.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
