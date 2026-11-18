const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const software=process.argv.includes('--software'),before=process.argv.includes('--before'),budget=process.argv.includes('--budget');
 const out=(process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/level-one-runoff')+'/'+(before?'before-':'after-')+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__runoffGame={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(before?'output/level-one-runoff/baseline-source/scene-3d.js':'web/scene-3d.js','utf8').replace('const softwareBudget=createSoftwareFrameBudget()','const softwareBudget=createSoftwareFrameBudget({scales:[.75]})')+'\nwindow.__runoffScene=()=>({waterSurfaces,pixelWorld,renderer,world,camera});'}));
 if(before)for(const n of ['pixel-water.js','pixel-world-props.js'])await page.route('**/'+n+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-runoff/baseline-source/'+n,'utf8')}));
 const draw=()=>page.evaluate(async()=>{__runoffGame.render();await RCScene3D.whenPresented();});
 const read=()=>page.evaluate(()=>{const s=RCScene3D.stats(),r=__runoffScene().renderer;return {water:s.water,resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles,memory:{...r.info.memory},programs:r.info.programs.length,lanterns:s.pathLanterns.pairs.length*2};});
 const shot=async name=>{await draw();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:93});};
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__runoffGame);await page.locator('#game').click();
  await page.evaluate(()=>{const t=__runoffGame,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:false});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});Object.assign(s.player,{x:70,y:238,yaw:0,pitch:-.3});RCSpatialControls.set('resolution',1);});
  await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
  if(budget){
   await page.evaluate(()=>Object.assign(__runoffGame.state.player,{x:30,y:257,yaw:1.87,pitch:-.55}));await draw();
   const times=[];for(let i=0;i<34;i++){
    const ms=await page.evaluate(async()=>{__runoffGame.state.hole.elapsed+=.05;const t=performance.now();__runoffGame.render();await RCScene3D.whenPresented();const gl=__runoffScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let s;while((s=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(s===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-t;});if(i>=10)times.push(ms);
   }times.sort((a,b)=>a-b);assert.deepEqual(errors,[]);const report={passed:true,before,software,median:times[12],p95:times[22],samples:24,stats:await read(),errors};fs.writeFileSync(out+'/budget.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,before,software,median:report.median,p95:report.p95,resolution:report.stats.resolution,draws:report.stats.draws,triangles:report.stats.triangles}));return;
  }
  for(const [name,x,y,yaw,pitch]of [['approach',70,226,0,-.15],['outfall',30,257,1.87,-.55],['side',26,263,1.5,-.35],['other-pond',-63,201,0,-.65]]){
   assert(await page.evaluate(v=>{Object.assign(__runoffGame.state.player,v);return !__runoffGame.obstacleAtPosition(v.x,v.y,2.4);},{x,y,yaw,pitch}),name+' legal camera');await shot(name);views.push({name,...await read()});
  }
  await page.evaluate(()=>Object.assign(__runoffGame.state.player,{x:30,y:257,yaw:1.87,pitch:-.55}));await draw();
  if(!before){
   const readRunoff=async()=>(await read()).water.find(w=>w.runoff).runoff;
   for(let i=0;i<4;i++){await page.evaluate(()=>__runoffGame.state.hole.elapsed+=.1);await draw();await shot('contact-'+i);}
   const impact=await readRunoff();assert(impact.contacts.length>0);assert.equal((await read()).water.filter(w=>w.runoff).length,1);checks.push('Exactly one physical eastern outfall; the other ponds have no contact generator');
   await page.evaluate(()=>__runoffGame.state.hole.reviewLightsOutTimer=5);await shot('outage');assert.equal((await read()).water.find(w=>w.runoff).reflection.power,0);assert.deepEqual(await readRunoff(),impact);
   await page.evaluate(()=>__runoffGame.state.hole.reviewLightsOutTimer=0);await shot('restored');assert.equal((await read()).water.find(w=>w.runoff).reflection.power,1);checks.push('Actual floodlight outage/restoration changes source power without restarting contact motion');
   const fixed=await readRunoff();await draw();assert.deepEqual(await readRunoff(),fixed);await page.keyboard.press('Escape');await page.evaluate(()=>advanceTime(600));assert.deepEqual(await readRunoff(),fixed);await page.keyboard.press('Escape');checks.push('Repeated rendering and real pause freeze droplets and ripples');
   await page.evaluate(()=>__runoffGame.state.reducedMotion=true);await draw();assert.equal((await readRunoff()).contacts.length,0);assert.equal((await readRunoff()).drops.length,0);await shot('reduced');await page.evaluate(()=>__runoffGame.state.reducedMotion=false);checks.push('Reduced motion clears drops and ring motion');
   const resources=await read();let peak=0;
   for(let i=0;i<60;i++){await page.evaluate(()=>__runoffGame.state.hole.elapsed+=.1);await draw();const c=await readRunoff();peak=Math.max(peak,c.contacts.length);assert(c.contacts.length<=3);assert(c.drops.length<=1);}
   assert.deepEqual((await read()).memory,resources.memory);assert.equal((await read()).programs,resources.programs);checks.push('60 updates keep the bounded pool and GPU resources stable');
   const lip=(await readRunoff()).lip;await page.keyboard.down('d');await page.evaluate(()=>advanceTime(160));await page.keyboard.up('d');await draw();assert.deepEqual((await readRunoff()).lip,lip);await shot('walking');checks.push('Real keyboard traversal preserves the world-anchored outfall');
  }
  // Re-aim after the keyboard traversal so narrow viewports inspect the same
  // physical detail instead of cropping it out of the much narrower field.
  if(!before)await page.evaluate(()=>{const c=__runoffScene().camera.position,p=__runoffGame.state.player,lip=RCScene3D.stats().water.find(w=>w.runoff).runoff.lip,dx=lip[0]-c.x,dz=lip[2]-c.z;p.yaw=Math.atan2(dx,-dz);p.pitch=Math.atan2(.34-c.y,Math.hypot(dx,dz));});
  for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await shot('outfall-'+width);}
  if(!before){
   await page.evaluate(()=>{const scene=__runoffScene(),m=scene.world.getObjectByName('PondRunoffDroplets');window.__runoffDisposed={geometry:0,material:0};window.__oldRunoff=m;for(const o of [m,scene.world.getObjectByName('PondContactRipples')]){o.geometry.addEventListener('dispose',()=>__runoffDisposed.geometry++);o.material.addEventListener('dispose',()=>__runoffDisposed.material++);}RCScene3D.reset();});await draw();await page.waitForFunction(()=>__runoffScene().world.getObjectByName('PondRunoffDroplets')!==__oldRunoff&&RCScene3D.stats().ready,null,{timeout:180000});await draw();assert.deepEqual(await page.evaluate(()=>__runoffDisposed),{geometry:2,material:2});checks.push('Rebuild disposes old droplet and ripple geometry/material exactly once');
  }
  assert.deepEqual(errors,[]);assert.equal((await read()).lanterns,28);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,checks,views,final:await read(),errors},null,2));console.log(JSON.stringify({passed:true,out,checks,views:views.map(v=>({name:v.name,resolution:v.resolution})),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
