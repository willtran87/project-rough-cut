const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root='output/back-nine-visual-upgrade/beacon-finish',software=process.argv.includes('--software'),afterOnly=process.argv.includes('--after-only'),out=root+'/'+(software?'software':'native')+(afterOnly?'-final':'');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const results=[];
 for(const baseline of (afterOnly?[false]:[true,false])){
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__uploads=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){__uploads++;return f.apply(this,args);};});
  await p.route('**/back-nine-scene.js*',r=>{const s=fs.readFileSync((baseline?root+'/baseline-source/':'web/')+'back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__beaconFinish={scene,camera,renderer,mower,mowerLight,headlamp,update,draw()');return r.fulfill({contentType:'application/javascript',body:s});});
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  async function stage(kind,time=20.8,options={}){return p.evaluate(async({kind,time,options})=>{
   const {createRun}=await import('./back-nine-sim.js'),r=createRun(0,0,713);r.mode='driving';r.time=time;r.grace=0;r.departure.phase='finished';r.story.seen=7;r.story.choiceSeen=0xffff;r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;Object.assign(r.cart,{x:30,y:64,health:0});r.foot={x:0,y:64,yaw:Math.PI,viewYaw:Math.PI,moveYaw:Math.PI,speed:0,onFoot:true,invulnerable:0};Object.assign(r.joe,{x:0,y:50,yaw:0,speed:12,mode:'chase'});
   if(kind==='wet'){Object.assign(r.foot,{x:-12,y:236});Object.assign(r.joe,{x:-12,y:226});r.tactics.floodUntil[0]=60;}
   if(kind==='near-player'){Object.assign(r.foot,{x:0,y:55});}
   __backNine.run=r;await advanceTime(0);const w=__beaconFinish;w.update(r,options);
   if(kind==='close'){const o=w.mower.root.position;w.camera.position.set(o.x+3.2,o.y+2.6,o.z-5.5);w.camera.lookAt(o.x,o.y+1.65,o.z-.4);w.camera.updateMatrixWorld();w.mower.root.visible=true;}
   w.draw();w.renderer.getContext().finish();return {intensity:w.mowerLight.intensity,graphics:w.stats()};
  },{kind,time,options});}
  async function shot(name){const metrics=await p.evaluate(()=>{const w=__beaconFinish,gl=w.renderer.getContext(),width=gl.drawingBufferWidth,height=gl.drawingBufferHeight,pixels=new Uint8Array(width*height*4);w.draw();gl.finish();gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let redClipped=0,redSum=0,redPixels=0;for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2];if(r>g*1.3&&r>b*1.3&&r>35){redPixels++;redSum+=r;if(r>=250)redClipped++;}}return {width,height,redClipped,redPixels,redMean:redSum/Math.max(1,redPixels),intensity:w.mowerLight.intensity,programs:w.stats().programs,textures:w.stats().textures,uploads:__uploads};});await p.screenshot({path:`${out}/${baseline?'before':'after'}-${name}.png`});views.push({name,...metrics});}
  for(const kind of ['close','gameplay','near-player','wet']){await stage(kind);await shot(kind+'-peak');await stage(kind,21.6);await shot(kind+'-trough');}
  for(const [name,options]of [['reduced',{reducedMotion:true}],['no-flash',{flash:0}]]){await stage('gameplay',20.8,options);await shot(name);const powers=[];for(let i=0;i<12;i++)powers.push((await stage('gameplay',20+i*.2,options)).intensity);assert.equal(Math.min(...powers),Math.max(...powers));}
  await stage('gameplay');const warm=views.at(-1);const moving=await p.evaluate(()=>{const w=__beaconFinish;for(let i=0;i<96;i++){__backNine.run.time+=1/60;w.update(__backNine.run,{});w.draw();}return {uploads:__uploads,programs:w.stats().programs,textures:w.stats().textures};});assert.equal(moving.uploads,warm.uploads);assert.equal(moving.programs,warm.programs);assert.equal(moving.textures,warm.textures);
  await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(0));const paused=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.beacon);await p.evaluate(()=>advanceTime(600));assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.beacon),paused);await p.click('#primary');
  if(!baseline)for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await stage('gameplay');await shot('gameplay-'+width);}
  assert.deepEqual(errors,[]);results.push({baseline,views,moving,errors});await p.close();
 }
 fs.writeFileSync(out+'/diagnostic.json',JSON.stringify({passed:false,software,results},null,2));
 const after=results.at(-1).views.find(v=>v.name==='close-peak');let before=null;
 if(afterOnly){assert(after.redPixels>1000,'Beacon warning must remain visible');assert(after.redClipped/after.redPixels<.02,'Peak red must preserve surface detail');}
 else{before=results[0].views.find(v=>v.name==='close-peak');assert(after.redClipped<before.redClipped*.2,'Near mower red clipping must fall by at least80%');assert(after.redPixels>before.redPixels*.4,'Beacon warning must remain visible');}
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,afterOnly,results},null,2));console.log(JSON.stringify({passed:true,software,before,after}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
