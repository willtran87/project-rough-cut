const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const software=process.argv.includes('--software'),label=software?'software':'hardware',out='output/back-nine-experience/barriers';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__buffers++;return f.apply(this,a);};});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__barriers={scene,camera,renderer,hurdleArt,tracks,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const before=await p.evaluate(()=>({buffers:__buffers,g:JSON.parse(render_game_to_text()).graphics}));
 const poses=await p.evaluate(async()=>{
  const {createRun}=await import('./back-nine-sim.js'),T=await import('./vendor/three/three.module.js'),w=__barriers,r=createRun(),m=new T.Matrix4(),v=new T.Vector3();r.mode='driving';r.grace=999;const rows=[];
  for(const reduced of [false,true])for(const direction of [-1,1])for(const age of [-1,0,.2,.6,1.2,3]){
   r.courseFX.breaks.forEach(b=>{b.age=age;b.direction=direction;});w.update(r,{reducedMotion:reduced});let minY=Infinity,maxY=0;const mesh=w.hurdleArt.mesh;
   for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,m);for(let n=0;n<mesh.geometry.attributes.position.count;n++){v.fromBufferAttribute(mesh.geometry.attributes.position,n).applyMatrix4(m);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}}
   const pose=Array.from(mesh.instanceMatrix.array);w.update(r,{reducedMotion:reduced});if(JSON.stringify(pose)!==JSON.stringify(Array.from(mesh.instanceMatrix.array)))throw Error('Same-state debris moves');rows.push({reduced,direction,age,minY,maxY,repeatUploads:w.stats().hurdleUploads});
  }return rows;
 });for(const r of poses){assert(r.minY>=.0249);assert.equal(r.repeatUploads,0);if(r.age>=1.2||r.reduced&&r.age>=0)assert(r.maxY<.091,'Settled timber lies flat');}
 async function view(index,age,close=false){await p.evaluate(async({index,age,close})=>{const{createRun}=await import('./back-nine-sim.js'),r=createRun(),g=__backNine.COURSE.hurdles[index];r.mode='driving';r.grace=999;r.time=10;Object.assign(r.cart,{x:g.x,y:g.y-7});Object.assign(r.joe,{x:g.x+5,y:g.y-11});r.courseFX.breaks[index].age=age;__backNine.run=r;await advanceTime(0);if(close){__barriers.camera.position.set(g.x+3.5,2.4,-g.y+6);__barriers.camera.lookAt(g.x,.65,-g.y);__barriers.draw();__barriers.renderer.getContext().finish();}},{index,age,close});}
 for(const index of [6,9])for(const age of [-1,.4,1.2]){await view(index,age,true);await p.screenshot({path:`${out}/${label}-rail-${index}-${age}-2560.png`});}
 for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){await p.setViewportSize({width,height});await view(9,-1);await p.screenshot({path:`${out}/${label}-approach-${width}.png`});}
 // Ordinary input breaks a rail, emits sound once and leaves a usable passage.
 await p.keyboard.down('w');for(let n=0;n<45;n++)await p.evaluate(()=>advanceTime(100));await p.keyboard.up('w');const crossed=await p.evaluate(()=>({...JSON.parse(render_game_to_text()),breaks:__backNine.run.courseFX.breaks,events:__backNine.run.events}));assert(crossed.breaks[9].age>=0);assert(crossed.cart.y>87);assert.equal(crossed.events.filter(e=>e.type==='shortcut').length,1);assert(crossed.audio.coursePlays>=1);
 // Full physical miss, including destruction caused by Joe and the earned
 // escape window. Frames use the real simulation; no injected broken state.
 await p.setViewportSize({width:2560,height:1600});
 await p.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js'),{beginRamWindup}=await import('./mower-ram.js'),r=createRun();r.mode='driving';r.grace=0;r.time=20;r.tension.phase='stalk';r.foot={x:-22,y:65,yaw:0,viewYaw:0,speed:0,invulnerable:0,onFoot:true,surface:'rough'};Object.assign(r.cart,{x:25,y:20,health:0,failedAt:0});Object.assign(r.joe,{x:-22,y:35,yaw:0,speed:6,seenAge:0});r.joe.lastSeen={x:-22,y:65};beginRamWindup(r);__backNine.run=r;});
 const missFrames=[];let frameNow=0;
 await p.keyboard.down('w');await p.keyboard.down('d');await p.keyboard.down('q');
 for(const frame of [38,180,258,284,285,315,360,600]){
  while(frameNow<frame){const steps=Math.min(3,frame-frameNow);await p.evaluate(ms=>advanceTime(ms),steps*1000/60);frameNow+=steps;}
  if(frame===38)await p.keyboard.up('d');if(frame===284)await p.keyboard.down('a');if(frame===315)await p.keyboard.up('a');
  if(![180,258,285,360,600].includes(frame))continue;
  const result=await p.evaluate(frame=>{const r=__backNine.run;return {frame,mode:r.mode,phase:r.joe.ram.phase,joe:[r.joe.x,r.joe.y],player:[r.foot.x,r.foot.y],broken:r.courseFX.breaks[6].age,tracks:__barriers.tracks.stats(),cue:{...r.courseFX.cue},brokenIndices:r.courseFX.breaks.flatMap((b,i)=>b.age>=0?[i]:[]),audio:JSON.parse(render_game_to_text()).audio};},frame);
  missFrames.push(result);assert.equal(result.mode,'driving');await p.screenshot({path:`${out}/${label}-miss-${frame}-2560.png`});
  if(frame===285){for(const [width,height]of [[1280,720],[844,390]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});await p.screenshot({path:`${out}/${label}-miss-${frame}-${width}.png`});}await p.setViewportSize({width:2560,height:1600});}
 }
 await p.keyboard.up('w');await p.keyboard.up('q');
 assert(missFrames.find(f=>f.frame===258).broken>=0);assert.equal(missFrames.find(f=>f.frame===285).phase,'missed');assert(missFrames.at(-1).tracks.segments>0);assert(missFrames.at(-1).tracks.segments<=24);
 fs.writeFileSync(`${out}/${label}-miss-diagnostic.json`,JSON.stringify({crossedAudio:crossed.audio.coursePlays,missFrames},null,2));
 for(const f of missFrames)assert.equal(f.audio.coursePlays,crossed.audio.coursePlays+f.brokenIndices.length,'Exactly one sound for each physically broken rail');assert.deepEqual(missFrames.at(-1).brokenIndices,[6,9]);assert(missFrames.at(-1).audio.ramLaunchPlays>crossed.audio.ramLaunchPlays);
 const after=await p.evaluate(()=>({buffers:__buffers,g:JSON.parse(render_game_to_text()).graphics}));assert.equal(after.buffers,before.buffers);assert.equal(after.g.programs,before.g.programs);assert.equal(after.g.textures,before.g.textures);assert.equal(after.g.hurdlePieces,72);assert.deepEqual(errors,[]);
 fs.writeFileSync(`${out}/${label}-browser.json`,JSON.stringify({passed:true,before,poses,crossed,missFrames,after,errors},null,2));console.log(JSON.stringify({passed:true,software,poses:poses.length,verticesAboveGround:true,pieces:after.g.hurdlePieces,newBuffers:after.buffers-before.buffers,programs:after.g.programs,textures:after.g.textures,missFrames:missFrames.map(f=>({frame:f.frame,phase:f.phase,broken:f.broken,tracks:f.tracks,coursePlays:f.audio.coursePlays})),errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
