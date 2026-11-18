const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const baseline=process.argv.includes('--baseline'),software=process.argv.includes('--software'),dpr=process.argv.includes('--dpr2')?2:1,noPools=process.argv.includes('--no-pools');
 const out='output/level-one-hd-foundation/'+(baseline?'before':'after')+(software?'-software':'')+(dpr===2?'-dpr2':'')+(noPools?'-physical-light':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600},deviceScaleFactor:dpr}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__hd={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 const sceneSource=fs.readFileSync((baseline?'output/level-one-hd-foundation/baseline-source':'web')+'/scene-3d.js','utf8');
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:sceneSource+'\nwindow.__hdScene=()=>({renderer,world,camera});'}));
 if(baseline)await page.route('**/course-viewport.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-hd-foundation/baseline-source/course-viewport.js','utf8')}));
 if(noPools)await page.route('**/floodlight-response.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/floodlight-response.js','utf8').replace('light.pool.material.opacity=.14*p;','light.pool.material.opacity=light.source?0:.14*p;')}));
 const draw=()=>page.evaluate(async()=>{__hd.render();await RCScene3D.whenPresented();return RCScene3D.stats();});
 async function info(){return page.evaluate(()=>{const c=document.getElementById('game'),r=c.getBoundingClientRect(),s=RCScene3D.stats();return {css:[r.width,r.height],buffer:[c.width,c.height],scene:s.resolution,presentation:s.presentationResolution,aspect:s.cameraAspect,software:s.quality.softwareRenderer,gpu:s.gpu,quality:s.quality,resources:__hdScene().renderer.info.memory,programs:__hdScene().renderer.info.programs.length};});}
 try{
  await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__hd);await page.locator('#game').click();
  await page.evaluate(()=>{const t=__hd,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol'});Object.assign(s.player,{x:0,y:1,yaw:0,pitch:-.08});RCSpatialControls.set('resolution',1);});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:150000});await draw();
  for(const [name,x,y,yaw,pitch]of [['opening',0,1,0,-.08],['service',-80,210,-1.3,0],['ground',0,200,0,-.24]]){await page.evaluate(v=>Object.assign(__hd.state.player,v),{x,y,yaw,pitch});await draw();views.push({name,...await info()});await page.screenshot({path:out+'/'+name+'-2560.png'});}
  if(!baseline&&!software){assert(views[0].scene[0]>2400);assert.deepEqual(views[0].buffer,views[0].scene);}
  const timings=[];
  for(let i=0;i<50;i++){
   const ms=await page.evaluate(async()=>{__hd.state.hole.elapsed+=1/60;__hd.state.player.yaw+=.004;const t=performance.now();__hd.render();await RCScene3D.whenPresented();const gl=__hdScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;while((status=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-t;});if(i>=10)timings.push(ms);
  }
  await page.evaluate(()=>RCSpatialControls.set('resolution',.5));await draw();const half=await info();if(!baseline&&!software)assert(Math.abs(half.scene[0]*2-views[0].scene[0])<=2);await page.evaluate(()=>RCSpatialControls.set('resolution',1));
  for(const [width,height]of [[1920,1080],[1280,720],[390,844]]){await page.setViewportSize({width,height});await draw();const row={name:'viewport-'+width,...await info()};views.push(row);if(!baseline&&!software){assert.deepEqual(row.buffer,row.scene);assert(Math.abs(row.scene[0]/row.scene[1]-row.aspect)<.004);}await page.screenshot({path:out+'/viewport-'+width+'.png'});}
  await page.evaluate(()=>__hd.state.mode='paused');await draw();await page.setViewportSize({width:1920,height:1080});await draw();const paused=await info();if(!baseline&&!software)assert(paused.scene[0]>1700);
  await page.evaluate(()=>__hd.state.mode='menu');await draw();const menu=await info();assert.deepEqual(menu.buffer,[1280,720]);
  await page.evaluate(()=>__hd.state.mode='first_hole');await draw();const restored=await info();if(!baseline&&!software)assert.deepEqual(restored.buffer,restored.scene);
  const sorted=timings.sort((a,b)=>a-b),report={passed:true,baseline,software,dpr,views,half,paused,menu,restored,frameMs:{median:sorted[Math.floor(sorted.length/2)],p95:sorted[Math.floor(sorted.length*.95)],samples:sorted.length,method:'CPU submission through explicit GPU fence completion,2ms polling'},errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,baseline,software,dpr,scene:views[0].scene,buffer:views[0].buffer,frameMs:report.frameMs,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
