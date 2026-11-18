const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root='output/back-nine-visual-upgrade/beacon-finish',out=root+'/distance-budget';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const results=[];
 for(const baseline of [true,false]){
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync((baseline?root+'/baseline-source/':'web/')+'back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__beaconDistance={scene,camera,renderer,mowerLight,headlamp,update,draw()')}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');
  const result=await p.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{createRun}=await import('./back-nine-sim.js'),{terrainHeight}=await import('./course-terrain.js'),r=createRun(0,0,713),w=__beaconDistance;r.mode='driving';r.time=20.8;r.grace=0;r.departure.phase='finished';r.story.seen=7;r.story.choiceSeen=65535;r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.foot={x:0,y:64,yaw:Math.PI,viewYaw:Math.PI,speed:0,onFoot:true,invulnerable:0};Object.assign(r.cart,{x:30,y:64,health:0});Object.assign(r.joe,{x:0,y:50,yaw:0,speed:12});__backNine.run=r;await advanceTime(0);w.update(r,{flash:1});w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.draw();
   // Calibration block reuses the actual mower steel shader. Distant turf's
   // authored night floor can mask all red contribution even in the baseline.
   let steel;w.scene.traverse(o=>{if(o.material?.name==='BackNineMower:iron')steel=o.material;});if(!steel)throw Error('Missing mower steel');const target=new T.Mesh(new T.BoxGeometry(2,2,2),steel);target.position.set(10,1,-20);target.receiveShadow=true;w.scene.add(target);
   const gl=w.renderer.getContext(),points=[],ray=new T.Raycaster(),rgba=new Uint8Array(4),visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};w.scene.updateMatrixWorld(true);
   for(const [x,y,h]of [[-10,20],[-5,20],[0,17],[5,20],[10,20,1],[-12,24],[12,24]]){
    const v=new T.Vector3(x,h??terrainHeight(x,y)+.02,-y).project(w.camera);if(Math.abs(v.x)>=1||Math.abs(v.y)>=1)continue;ray.setFromCamera(v,w.camera);const hit=ray.intersectObjects(w.scene.children,true).find(h=>visible(h.object));if(!hit)continue;
    const distance=hit.point.distanceTo(w.mowerLight.position);if(distance<28.05)continue;points.push({x,y,distance,hit:hit.point.toArray(),px:Math.floor((v.x*.5+.5)*960),py:Math.floor((v.y*.5+.5)*540)});
   }
   const sample=key=>{w.draw();gl.finish();for(const p of points){gl.readPixels(p.px,p.py,1,1,gl.RGBA,gl.UNSIGNED_BYTE,rgba);p[key]=[...rgba];}};
   const power=w.mowerLight.intensity;sample('on');w.mowerLight.intensity=0;sample('off');w.mowerLight.intensity=power;
   const times=[];for(let i=0;i<56;i++){const t=performance.now();w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(fence);if(i>=8)times.push(performance.now()-t);}times.sort((a,b)=>a-b);
   return {points,power,median:times[24],p95:times[45],graphics:w.stats()};
  });await p.screenshot({path:out+'/'+(baseline?'before':'after')+'.png'});assert.deepEqual(errors,[]);results.push({baseline,...result,errors});await p.close();
 }
 fs.writeFileSync(out+'/diagnostic.json',JSON.stringify({passed:false,results},null,2));assert(results[0].points.length>=3);assert.deepEqual(results[1].points,results[0].points,'Far illuminated and beacon-off pixels must be identical');assert(results[1].points.some(p=>p.on[0]>p.off[0]+3),'Distant red illumination must remain visible');assert.equal(results[0].graphics.draws,results[1].graphics.draws);assert.equal(results[0].graphics.triangles,results[1].graphics.triangles);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,results},null,2));console.log(JSON.stringify({passed:true,results:results.map(r=>({baseline:r.baseline,points:r.points,median:r.median,p95:r.p95,draws:r.graphics.draws,triangles:r.graphics.triangles,errors:r.errors}))}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
