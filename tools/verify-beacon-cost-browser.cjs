const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const software=process.argv.includes('--software'),tag=software?'software':'hardware',out='output/back-nine-experience/beacon-cost';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__buffers++;return f.apply(this,a);};});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__beacon={scene,camera,renderer,mowerLight,beaconShadows,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const start=await p.evaluate(()=>({buffers:__buffers,graphics:JSON.parse(render_game_to_text()).graphics})),shots=[];
 for(const [name,x,y,jx,jy,yaw]of [['cover',-13,425,-25,434,0],['emerging',-13,425,-8,434,0],['garage',-23,785,-30,790,0],['foot',-13,425,-8,434,0]])for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){
  await p.setViewportSize({width,height});await p.evaluate(async a=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(a.y>700?2:1);r.mode='driving';r.time=11.2;r.grace=999;Object.assign(r.cart,{x:a.x,y:a.y,yaw:a.yaw});Object.assign(r.joe,{x:a.jx,y:a.jy,yaw:0});if(a.name==='foot'){const{leaveBrokenCart}=await import('./chase-player.js');leaveBrokenCart(r);r.time+=2;}__backNine.run=r;__beacon.resetCamera();await advanceTime(0);}, {name,x,y,jx,jy,yaw});
  await p.screenshot({path:`${out}/${tag}-${name}-${width}.png`});shots.push({name,width,height,stats:await p.evaluate(()=>__beacon.stats())});
 }
 await p.setViewportSize({width:1280,height:720});
 const proof=await p.evaluate(async()=>{
  const T=await import('./vendor/three/three.module.js'),{createRun}=await import('./back-nine-sim.js'),r=createRun(1);r.mode='driving';r.time=11.2;r.grace=999;Object.assign(r.cart,{x:-13,y:425,yaw:0});Object.assign(r.joe,{x:-25,y:434,yaw:0});const w=__beacon,l=w.mowerLight,gl=w.renderer.getContext();
  function draw(){w.update(r,{reducedMotion:false,flash:1});w.draw();gl.finish();}
  function pixel(x,y){const v=new T.Vector3(x,.14,-y).project(w.camera),rgba=new Uint8Array(4);assertBounds(v);gl.readPixels(Math.floor((v.x*.5+.5)*gl.drawingBufferWidth),Math.floor((v.y*.5+.5)*gl.drawingBufferHeight),1,1,gl.RGBA,gl.UNSIGNED_BYTE,rgba);return [...rgba];}
  function assertBounds(v){if(Math.abs(v.x)>=1||Math.abs(v.y)>=1)throw Error('Ground sample outside driving camera');}
  w.resetCamera();draw();const blocked=pixel(-5,434);l.intensity=0;w.draw();gl.finish();const ambient=pixel(-5,434);l.shadow.intensity=0;draw();const leaking=pixel(-5,434);l.shadow.intensity=1;draw();
  const before=w.beaconShadows.stats().updates;for(let i=0;i<60;i++){r.time+=1/60;draw();}const stationary=w.beaconShadows.stats().updates;
  Object.assign(r.joe,{x:-8,y:434});draw();const exposed=pixel(-5,434),moved=w.beaconShadows.stats().updates;
  const stable=[];for(const reducedMotion of [false,true])for(const flash of [0,1]){const powers=[];for(let i=0;i<12;i++){r.time+=.2;w.update(r,{reducedMotion,flash});w.draw();powers.push(l.intensity);}stable.push({reducedMotion,flash,min:Math.min(...powers),max:Math.max(...powers)});}
  // Camera culling is unrelated to the light's view: a rear glance cannot
  // remove the occluders used by the beacon.
  r.joe.x=-25;r.joe.y=434;r.time=11.2;draw();const front=pixel(-5,434);w.update(r,{rear:true});w.draw();draw();const afterRear=pixel(-5,434);
  const v=new T.Vector3(-5,.14,-434).project(w.camera),ray=new T.Raycaster();ray.setFromCamera({x:v.x,y:v.y},w.camera);const hit=ray.intersectObjects(w.scene.children,true).filter(h=>h.object.visible).slice(0,3).map(h=>({position:h.point.toArray(),material:h.object.material.type,color:h.object.material.color.toArray(),name:h.object.name}));return {sample:{v:v.toArray(),hit,camera:w.camera.position.toArray(),size:[gl.drawingBufferWidth,gl.drawingBufferHeight],viewport:gl.getParameter(gl.VIEWPORT)},blocked,ambient,leaking,exposed,front,afterRear,before,stationary,moved,stable};
 });
 fs.writeFileSync(`${out}/${tag}-proof-diagnostic.json`,JSON.stringify({proof,stats:await p.evaluate(()=>__beacon.stats())},null,2));
 assert.deepEqual(proof.blocked,proof.ambient,'Covered ground must match the beacon-off reference');assert(proof.leaking[0]>proof.blocked[0]+3,'The same ground must receive red light when occlusion is disabled');assert(proof.exposed[0]>proof.blocked[0]+8,'Moving around cover must restore red warning');assert.deepEqual(proof.front,proof.afterRear);assert.equal(proof.before,proof.stationary);assert(proof.moved>proof.stationary);
 for(const s of proof.stable)if(s.reducedMotion||s.flash===0)assert.equal(s.min,s.max);
 const end=await p.evaluate(()=>({buffers:__buffers,graphics:__beacon.stats()}));assert.equal(end.buffers,start.buffers);assert.equal(end.graphics.programs,start.graphics.programs);assert.equal(end.graphics.textures,start.graphics.textures);assert.deepEqual(errors,[]);
 fs.writeFileSync(`${out}/${tag}-browser.json`,JSON.stringify({passed:true,start,shots,proof,end,errors},null,2));console.log(JSON.stringify({passed:true,software,proof,buffers:end.buffers-start.buffers,programs:end.graphics.programs,textures:end.graphics.textures,shadow:end.graphics.beaconShadows,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
