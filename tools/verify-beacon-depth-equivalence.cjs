const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const software=process.argv.includes('--software'),tag=software?'software':'hardware',out='output/back-nine-experience/beacon-cost',browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/chase-beacon-shadows.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/chase-beacon-shadows.js','utf8').replace('return {collect,build,update,warm,addCaster','return {meshes,faces,moving,sourceIndices:()=>sourceIndices,collect,build,update,warm,addCaster')}));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__depth={scene,camera,renderer,mowerLight,beaconShadows,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const result=await p.evaluate(async()=>{const T=await import('./vendor/three/three.module.js'),{createRun}=await import('./back-nine-sim.js'),w=__depth,b=w.beaconShadows,gl=w.renderer.getContext(),g=new T.BufferGeometry();
  for(const[name,a]of Object.entries(b.faces[0].geometry.attributes))g.setAttribute(name,a);g.setIndex(new T.BufferAttribute(b.sourceIndices().slice(),1));
  const reference=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));reference.layers.set(29);reference.castShadow=true;reference.frustumCulled=false;reference.visible=false;w.scene.add(reference);
  const dynamic=[];for(const c of b.moving)c.object.traverse(o=>{if(o.isMesh)dynamic.push([o,o.customDistanceMaterial]);});
  const size=gl.drawingBufferWidth*gl.drawingBufferHeight*4,a=new Uint8Array(size),z=new Uint8Array(size),cases=[];
  for(const[x,y,jx,jy,yaw,gate]of [[-13,425,-25,434,0,0],[-13,425,-8,434,0,0],[18,164,30,180,-.22,0],[0,312,2,300,0,0],[-29,443,-27,431,-1.2,0],[-23,785,-30,790,0,0],[-23,807,-23,794,0,.5],[-23,807,-23,794,0,1]]){
   const r=createRun(y>700?2:1);r.mode='driving';r.time=11.2;r.grace=999;Object.assign(r.cart,{x,y,yaw});Object.assign(r.joe,{x:jx,y:jy});r.finale={...(r.finale||{}),gate};w.resetCamera();w.update(r,{});
   for(const m of b.meshes)m.visible=true;reference.visible=false;for(const[o,m]of dynamic)o.customDistanceMaterial=m;
   w.mowerLight.shadow.needsUpdate=true;w.draw();gl.finish();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);
   for(const m of b.meshes)m.visible=false;reference.visible=true;for(const[o]of dynamic)o.customDistanceMaterial=undefined;
   w.mowerLight.shadow.needsUpdate=true;w.draw();gl.finish();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,z);
   let changed=0,max=0;for(let i=0;i<size;i++)if(a[i]!==z[i]){changed++;max=Math.max(max,Math.abs(a[i]-z[i]));}cases.push({x,y,jx,jy,gate,changed,max,submitted:b.stats().submittedTriangles,fullReference:g.index.count/3*6});
  }
  return {size:[gl.drawingBufferWidth,gl.drawingBufferHeight],cases};
 });fs.writeFileSync(`${out}/${tag}-equivalence.json`,JSON.stringify({result,errors},null,2));for(const c of result.cases)assert.equal(c.changed,0,JSON.stringify(c));assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,software,...result,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
