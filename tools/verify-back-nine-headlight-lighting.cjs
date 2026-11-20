const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const software=process.argv.includes('--software'),root='output/back-nine-visual-upgrade/headlights',out=root+'/'+(software?'software-lighting':'native-lighting');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__lampProof={scene,camera,renderer,headlights,mowerLight,cart,mower,runner,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 // Exact pixel comparisons: switch off the screen finish (grain and bloom vary per frame).
 await p.evaluate(()=>window.__backNine?.world?.finish?.setLevel('off'));
 const proof=await p.evaluate(async()=>{
  const T=await import('./vendor/three/three.module.js'),{createRun}=await import('./back-nine-sim.js'),{terrainHeight}=await import('./course-terrain.js'),r=createRun(1),w=__lampProof,gl=w.renderer.getContext();r.mode='driving';r.time=20;r.grace=999;Object.assign(r.cart,{x:-25,y:434,yaw:Math.PI/2,speed:0});Object.assign(r.joe,{x:-50,y:434,yaw:Math.PI/2,speed:0});__backNine.run=r;
  function update(){w.update(r,{reducedMotion:true});w.mowerLight.intensity=0;w.headlights.mower.intensity=0;}
  function draw(){w.draw();gl.finish();}
  function aim(x,y,z,tx,ty,tz){w.camera.position.set(x,y,z);w.camera.lookAt(tx,ty,tz);w.camera.updateMatrixWorld();}
  function pixel(x,y){const v=new T.Vector3(x,terrainHeight(x,y)+.035,-y).project(w.camera),rgba=new Uint8Array(4);if(Math.abs(v.x)>=1||Math.abs(v.y)>=1)throw Error('Proof sample outside camera');gl.readPixels(Math.floor((v.x*.5+.5)*gl.drawingBufferWidth),Math.floor((v.y*.5+.5)*gl.drawingBufferHeight),1,1,gl.RGBA,gl.UNSIGNED_BYTE,rgba);return [...rgba];}
  update();aim(-9,7,-424,-14,0,-434);draw();const positions=[[-16,434],[-15,434],[-14,434]],blocked=positions.map(v=>pixel(...v));w.headlights.player.intensity=0;draw();const off=positions.map(v=>pixel(...v));w.headlights.player.intensity=85;w.headlights.player.shadow.intensity=0;draw();const uncovered=positions.map(v=>pixel(...v));w.headlights.player.shadow.intensity=1;
  Object.assign(r.cart,{x:-40,y:434});Object.assign(r.joe,{x:-25,y:434});update();w.headlights.player.intensity=0;w.headlights.mower.intensity=125;aim(-9,7,-424,-14,0,-434);draw();const joeBlocked=positions.map(v=>pixel(...v));w.headlights.mower.intensity=0;draw();const joeOff=positions.map(v=>pixel(...v));w.headlights.mower.intensity=125;w.headlights.mower.shadow.intensity=0;draw();const joeUncovered=positions.map(v=>pixel(...v));w.headlights.mower.shadow.intensity=1;
  // A fixed high view shows forward/side/behind samples in the actual course.
  Object.assign(r.cart,{x:0,y:64,yaw:0});Object.assign(r.joe,{x:0,y:0});update();aim(0,24,-64,0,0,-68);draw();
  const samples=[[0,69],[0,73],[0,78],[8,66],[0,59]],on=samples.map(v=>pixel(...v));w.headlights.player.intensity=0;draw();const dark=samples.map(v=>pixel(...v));
  w.cart.body.rotation.y=Math.PI;w.headlights.update(r,w.cart,w.mower,w.runner);w.headlights.mower.intensity=0;draw();const turned=samples.map(v=>pixel(...v));
  return {positions,blocked,off,uncovered,joeBlocked,joeOff,joeUncovered,samples,on,dark,turned,stats:w.stats().headlights};
 });
 await p.screenshot({path:out+'/direction.png'});fs.writeFileSync(out+'/diagnostic.json',JSON.stringify({proof,errors},null,2));
 assert.deepEqual(proof.blocked,proof.off,'A hedge must block the headlight');assert(proof.uncovered.some((v,i)=>v[0]>proof.off[i][0]+2),'Removing occlusion must reveal the forward beam');
 assert.deepEqual(proof.joeBlocked,proof.joeOff,'A hedge must block mower headlights too');assert(proof.joeUncovered.some((v,i)=>v[0]>proof.joeOff[i][0]+2),'Mower beam must illuminate the same ground without cover');
 assert(proof.on.slice(0,3).some((v,i)=>v[0]>proof.dark[i][0]+4),'Forward ground must visibly receive the headlight');assert.deepEqual(proof.on[3],proof.dark[3],'Side ground stays outside the beam');assert.deepEqual(proof.on[4],proof.dark[4],'Rear ground stays outside the beam');assert(proof.turned[4][0]>proof.dark[4][0]+4,'Turning transfers the light to the former rear');assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,proof,errors},null,2));console.log(JSON.stringify({passed:true,software,proof}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
