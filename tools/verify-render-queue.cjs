const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/software-rendering';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/game.js','utf8');await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__queue={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>window.__queue&&JSON.parse(render_game_to_text()).assets.course.ready);
  await page.evaluate(()=>{const t=__queue,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:690});t.render();});
  await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  await page.evaluate(async()=>{__queue.render();await RCScene3D.whenPresented();});
  const held=await page.evaluate(()=>{
   const prototype=WebGL2RenderingContext.prototype,wait=prototype.clientWaitSync;
   prototype.clientWaitSync=function(...args){return window.__holdGPU?this.TIMEOUT_EXPIRED:wait.apply(this,args);};
   window.__holdGPU=true;__queue.render();const frames=RCScene3D.stats().frames;
   __queue.state.player.yaw=.5;for(let i=0;i<12;i++)__queue.render();
   return {frames,after:RCScene3D.stats().frames,skipped:RCScene3D.stats().busyFramesSkipped};
  });assert.equal(held.after,held.frames);assert(held.skipped>=12);
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__queue.state.mode),'paused');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});__holdGPU=false;});
  await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>RCScene3D.stats().frames),held.frames,'Hidden tabs must not submit pending views');
  await page.evaluate(()=>{delete document.hidden;});
  const completed=await page.evaluate(async()=>{__holdGPU=false;await Promise.all([RCScene3D.whenPresented(),RCScene3D.whenPresented()]);return RCScene3D.stats().frames;});
  assert.equal(completed,held.frames+1,'The latest paused camera must replace the old image exactly once');
  await page.evaluate(async()=>{__queue.render();await RCScene3D.whenPresented();});assert.equal(await page.evaluate(()=>RCScene3D.stats().frames),completed,'Repeated pause must reuse the submitted image');
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__queue.state.mode),'first_hole');
  await page.evaluate(()=>advanceTime(1000/60));assert((await page.evaluate(()=>RCScene3D.stats().frames))>completed);
  await page.evaluate(async()=>{for(let i=0;i<12;i++)await advanceTime(1000/60);});
  const timing=await page.evaluate(()=>{const r=JSON.parse(render_game_to_text());return {completion:r.performance.rendererCompletion,fps:r.performance.estimatedFps,budget:r.readiness.checks.find(c=>c.id==='gameplay_frame_budget')?.passed};});
  assert(timing.completion.completedSceneSamples>=10);if(timing.completion.p95CompletedSceneMs>16.7)assert.equal(timing.budget,false,'CPU responsiveness must not conceal a slow software GPU');
  assert(timing.fps<=1000/timing.completion.averageCompletedSceneMs+.1);
  assert.deepEqual(errors,[]);
  const report={passed:true,checks:['Hidden tabs suspend pending presentation','Busy software GPU cannot accumulate world submissions','Latest camera survives Pause during GPU backpressure','Multiple presentation waiters settle','Repeated Pause reuses only a submitted image','Resume and deterministic advancement repaint','Readiness and estimated FPS include software GPU completion'],held,completed,timing,errors};
  fs.writeFileSync(out+'/queue-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
