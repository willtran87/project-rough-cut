const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),label=software?'software':'hardware',out='output/vehicle-refinement';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{window.__allocations=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){__allocations++;return f.apply(this,args);};});
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()', 'window.__cartParts=cart;return window.__damageWorld={scene,camera,renderer,update,draw()')}));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const before=await p.evaluate(()=>({stats:__damageWorld.stats(),buffers:__allocations}));
  async function view(health,age=0,reduced=false,close=true){return p.evaluate(async({health,age,reduced,close})=>{
   const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js');const r=createRun();r.mode='driving';r.time=10;Object.assign(r.cart,{x:0,y:40,health,speed:0});Object.assign(r.joe,{x:0,y:22,speed:0});
   if(!health){leaveBrokenCart(r);r.time+=age;}__backNine.run=r;await advanceTime(0);
   const w=__damageWorld;w.resetCamera();w.update(r,{reducedMotion:reduced});
   if(close){w.camera.position.set(4.6,3.6,-34.9);w.camera.lookAt(0,1.1,-40);}
   w.draw();await __backNine.whenPresented();
   const transforms=[];__cartParts.body.children.filter(x=>x.isGroup&&x.name.startsWith('cart-')).forEach(x=>transforms.push({name:x.name,position:x.position.toArray(),rotation:x.rotation.toArray(),scale:x.scale.toArray()}));
   const headlights=__cartParts.body.children.find(g=>g.name==='cart-hood').children.filter(m=>m.material?.isMeshBasicMaterial).some(m=>m.visible);return {stats:w.stats(),transforms,buffers:__allocations,foot:!!r.foot,headlights};
  },{health,age,reduced,close});}
  for(const health of [100,90,75,55,35,15,0]){const v=await view(health,health===0?3.2:0);checks.push({health,...v});await p.screenshot({path:`${out}/${label}-health-${health}-2560.png`});assert(Math.abs(v.stats.cartDamage.severity-(1-health/100))<1e-6);assert.equal(v.stats.cartDamage.stage,({100:'intact',90:'scuffed',75:'dented',55:'buckled',35:'battered',15:'critical',0:'wrecked'})[health]);assert.equal(v.headlights,health>0);}
  const frames=[];for(const age of [0,.2,.45,.8,1.3,2,3.2]){const v=await view(0,age);frames.push(v);await p.screenshot({path:`${out}/${label}-collapse-${age}.png`});}
  assert.notDeepEqual(frames[0].transforms,frames[3].transforms);assert.notDeepEqual(frames[3].transforms,frames[6].transforms);assert(frames[6].stats.cartDamage.settled);
  const settled=await view(0,9);assert.deepEqual(settled.transforms,frames[6].transforms,'Debris stops moving');
  const ground=await p.evaluate(async()=>{const T=await import('./vendor/three/three.module.js'),v=new T.Vector3(),result={};__cartParts.root.updateMatrixWorld(true);for(const part of __cartParts.body.children.filter(g=>['cart-hood','cart-bumper','cart-hatch'].includes(g.name))){let min=Infinity;part.traverse(m=>{if(!m.isMesh)return;for(let i=0;i<m.geometry.attributes.position.count;i++){v.fromBufferAttribute(m.geometry.attributes.position,i).applyMatrix4(m.matrixWorld);min=Math.min(min,v.y);}});result[part.name]=min;}return result;});for(const min of Object.values(ground))assert(min>=.024,'Loose part sinks into road');
  await p.evaluate(async()=>{const w=__damageWorld;w.camera.position.set(-4,2.8,-44.5);w.camera.lookAt(0,.8,-40);w.draw();await __backNine.whenPresented();});await p.screenshot({path:`${out}/${label}-wreck-front-2560.png`});
  const reduced=await view(0,0,true);assert.deepEqual(reduced.transforms,frames[6].transforms,'Reduced motion shows settled wreck');
  await view(0,.45,false,false);await p.screenshot({path:`${out}/${label}-escape-camera-2560.png`});
  // Same run, pause/render repeatedly: no advancing collapse or geometry uploads.
  const pause=await p.evaluate(async()=>{const w=__damageWorld,r=__backNine.run;r.mode='paused';const a=w.stats().cartDamage;for(let i=0;i<12;i++)w.update(r);return {a,b:w.stats().cartDamage};});assert.deepEqual(pause.a,pause.b);
  const repaired=await view(100);assert.equal(repaired.stats.cartDamage.stage,'intact');assert(repaired.headlights);for(const t of repaired.transforms){assert.deepEqual(t.position,[0,0,0]);assert.deepEqual(t.scale,[1,1,1]);assert(t.rotation.slice(0,3).every(v=>v===0));}
  for(const [width,height]of [[1280,720],[844,390]]){await p.setViewportSize({width,height});await view(15,0,false,false);await p.screenshot({path:`${out}/${label}-driving-${width}.png`});await view(0,.45,false,false);await p.screenshot({path:`${out}/${label}-escape-${width}.png`});}
  const impacts=await p.evaluate(async()=>{
   const {createRun,updateRun}=await import('./back-nine-sim.js'),{repairCart}=await import('./chase-player.js');const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{x:0,y:35});Object.assign(r.joe,{x:0,y:30,speed:16});const stages=[],w=__damageWorld;let hits=0;
   for(let i=0;i<2400&&!r.foot;i++){updateRun(r,{},1/60);if(r.cart.hits!==hits){hits=r.cart.hits;w.update(r,{reducedMotion:true});stages.push({health:r.cart.health,...w.stats().cartDamage});}}
   const protection=r.foot?.invulnerable;
   const repair=createRun();repair.mode='driving';repair.cart.health=15;w.update(repair);repairCart(repair,100);w.update(repair);const restored=w.stats().cartDamage;
   const stable=restored.geometryUpdates;for(let i=0;i<60;i++)w.update(repair);return {stages,protection,restored,stable:w.stats().cartDamage.geometryUpdates===stable};
  });
  assert(impacts.stages.length>=7);assert.equal(impacts.stages.at(-1).stage,'wrecked');assert(impacts.protection>=4.9);assert.equal(impacts.restored.stage,'intact');assert.equal(impacts.restored.wearLayers,0);assert(impacts.stable);assert(new Set(impacts.stages.map(s=>s.stage)).size>=5);
  const after=await p.evaluate(()=>({stats:__damageWorld.stats(),buffers:__allocations}));assert.equal(after.buffers,before.buffers,'All damage buffers prepared before play');assert.equal(after.stats.programs,before.stats.programs);assert.equal(after.stats.textures,before.stats.textures);assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/${label}-damage.json`,JSON.stringify({passed:true,before,checks,frames,pause,impacts,after,errors},null,2));console.log(JSON.stringify({passed:true,software,programs:after.stats.programs,textures:after.stats.textures,newBuffers:after.buffers-before.buffers,hits:impacts.stages.length,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
