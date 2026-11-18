const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const out='output/final-cut/runtime-performance/verification';fs.mkdirSync(out,{recursive:true});
const sceneHook=`window.__renderProbe={renderer,gl,scene,camera,shadowLights};`;
const loopHook=`window.__loopProbe=()=>{
 const saved={world,run,manual,last,nextGameplayFrame,update,draw,raf:window.requestAnimationFrame},reports=[];
 try{world={poll:()=>false};run={mode:'playing'};window.requestAnimationFrame=()=>0;
  for(const hz of [60,120,144,240]){let updates=0,draws=0,elapsed=0;manual=false;last=0;nextGameplayFrame=0;update=dt=>{updates++;elapsed+=dt;};draw=()=>{draws++;return true;};
   for(let i=0;i<=hz*2;i++)frame(i*1000/hz);reports.push({hz,updates,draws,elapsed});}
 }finally{({world,run,manual,last,nextGameplayFrame,update,draw}=saved);window.requestAnimationFrame=saved.raf;}return reports;
};`;
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],comparisons=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.removeItem('rough-cut.final-cut.v1');localStorage.setItem('rough-cut.final-cut-story.v1',JSON.stringify({skipIntro:true}));});
 await page.route('**/final-cut-scene.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('web/final-cut-scene.js','utf8').replace('await renderer.compileAsync(scene,camera);',sceneHook+'await renderer.compileAsync(scene,camera);')}));
 await page.route('**/final-cut.js?*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('web/final-cut.js','utf8')+'\n'+loopHook}));
 await page.goto('http://127.0.0.1:4187/final-cut.html?test');await page.waitForFunction(()=>window.__loopProbe&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
 await page.evaluate(()=>advanceTime(0));const pacing=await page.evaluate(()=>__loopProbe());for(const p of pacing){assert(p.draws<=122&&p.draws>=119,JSON.stringify(p));assert(Math.abs(p.elapsed-2)<.02,JSON.stringify(p));}checks.push('60/120/144/240 Hz: about 120 updates/presentations per two seconds with unchanged elapsed simulation time');
 for(const name of ['overlook','shelter','machine','collapse']){
 await page.evaluate(async name=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun(name==='overlook'?{}:name==='collapse'?{checkpoint:2,ending:{age:4}}:{checkpoint:1});r.mode=name==='collapse'?'aftermath':'playing';
 if(name!=='overlook'&&name!=='collapse')Object.assign(r.rig,{x:-12,y:50,yaw:Math.PI/2,direction:1,phase:'pass',deployment:1});
 const poses={shelter:{x:10,y:40,yaw:Math.PI,pitch:.35},machine:{x:-2,y:45,yaw:Math.atan2(-10,5),pitch:.08},collapse:{x:16,y:81,yaw:Math.atan2(-4,-7),pitch:.12}};if(poses[name])Object.assign(r.player,poses[name]);__finalCut.run=r;await advanceTime(0);},name);
 const comparison=await page.evaluate(()=>{const {renderer,gl,scene,shadowLights}=__renderProbe,pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4),results=[];let reference;
  const original=renderer.render;try{for(const forced of [false,true,false]){renderer.render=function(s,c){if(s===scene&&forced)shadowLights.forEach(l=>l.shadow.needsUpdate=true);return original.call(this,s,c);};__finalCut.draw();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(!reference)reference=pixels.slice();let different=0,max=0;for(let i=0;i<pixels.length;i++){const d=Math.abs(pixels[i]-reference[i]);if(d)different++;max=Math.max(max,d);}results.push({forced,different,max,graphics:JSON.parse(render_game_to_text()).graphics.presentation,draws:renderer.info.render.calls,triangles:renderer.info.render.triangles});}}finally{renderer.render=original;}return results;});
 comparison.forEach(c=>assert.equal(c.different,0,JSON.stringify({name,c})));comparisons.push({name,comparison});await page.screenshot({path:`${out}/${name}-2560.png`});
 }
 checks.push('Cached offscreen shadows match forced fresh shadows pixel-for-pixel in four gameplay views and on return');
 // Exercise actual GPU backpressure without stalling the driver: hold its
 // nonblocking fence status at TIMEOUT while submitting through the scene API.
 const backpressure=await page.evaluate(async()=>{const {createFinalCutScene}=await import('./final-cut-scene.js');const canvas=document.createElement('canvas');canvas.style.cssText='width:640px;height:400px';document.body.append(canvas);const w=await createFinalCutScene(canvas);const {gl}=__renderProbe,original=gl.clientWaitSync;try{w.render(__finalCut.run);gl.clientWaitSync=()=>gl.TIMEOUT_EXPIRED;const before=w.stats().presentation;for(let i=0;i<10;i++)w.render(__finalCut.run);const held=w.stats().presentation;gl.clientWaitSync=original;await w.whenPresented();w.render(__finalCut.run);await w.whenPresented();return {before,held,resumed:w.stats().presentation};}finally{gl.clientWaitSync=original;w.dispose();canvas.remove();}});
 assert.equal(backpressure.held.submittedFrames,backpressure.before.submittedFrames);assert.equal(backpressure.held.skippedFrames-backpressure.before.skippedFrames,10);assert.equal(backpressure.resumed.submittedFrames,backpressure.before.submittedFrames+1);checks.push('Busy GPU queues no extra scenes; drawing resumes after the fence completes');
 // The extra scene is disposed; restore the original probe for later captures.
 await page.reload();await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await page.locator('#primary').click();
 const before=JSON.parse(await page.evaluate(()=>render_game_to_text()));await page.keyboard.down('w');await page.evaluate(()=>advanceTime(600));await page.keyboard.up('w');const moved=JSON.parse(await page.evaluate(()=>render_game_to_text()));assert(Math.hypot(moved.player.x-before.player.x,moved.player.y-before.player.y)>.3);
 await page.keyboard.press('Escape');assert.equal(JSON.parse(await page.evaluate(()=>render_game_to_text())).mode,'final_cut_paused');const time=JSON.parse(await page.evaluate(()=>render_game_to_text())).seconds;await page.evaluate(()=>advanceTime(500));assert.equal(JSON.parse(await page.evaluate(()=>render_game_to_text())).seconds,time);await page.locator('#primary').click();assert.equal(JSON.parse(await page.evaluate(()=>render_game_to_text())).mode,'final_cut_playing');checks.push('Real start, keyboard movement, pause freeze and resume');
 for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){await page.setViewportSize({width,height});await page.evaluate(()=>advanceTime(0));await page.screenshot({path:`${out}/gameplay-${width}.png`});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({checks,pacing,comparisons,backpressure,errors},null,2));console.log(JSON.stringify({checks,pacing,backpressure,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
