const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const noPreserve=process.argv.includes('--no-preserve');
 const moving=process.argv.includes('--moving');
 const before=process.argv.includes('--before'),software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/software-rendering',label=(before?'before':'after')+'-'+(software?'software':'hardware')+(moving?'-moving':'')+(noPreserve?'-no-preserve':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],results=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(before&&!fs.existsSync(out+'/before/joe-model.js'))throw Error('The recorded baseline predates Joe LOD. Supply the matching original joe-model.js snapshot before rerunning --before.');
 if(before)for(const file of ['joe-model.js','scene-3d.js','pixel-world-props.js','pixel-trees.js','pixel-buildings.js','pixel-landscape.js','software-frame-budget.js','render-preparation.js','terrain-finish.js','pixel-art.js','parallax-scene.js'])await p.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/before/'+file,'utf8')}));
 if(before&&fs.existsSync(out+'/before/pixel-effects.js'))await p.route('**/pixel-effects.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/before/pixel-effects.js','utf8')}));
 if(noPreserve)await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('preserveDrawingBuffer:true','preserveDrawingBuffer:false')}));
 const source=fs.readFileSync(before?out+'/before/game.js':'web/game.js','utf8');await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 const sceneSource=process.argv.find(a=>a.startsWith('--scene-source='))?.slice(15);
 if(sceneSource)await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(sceneSource,'utf8')}));
 const worldSource=process.argv.find(a=>a.startsWith('--world-source='))?.slice(15);
 if(worldSource)await p.route('**/pixel-world-props.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(worldSource,'utf8')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('#game').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__perf&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__perf,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';s.hole.joe.x=100;s.hole.joe.y=690;t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  const views=[['opening',0,65,0,0],['border',100,340,1.57,0]];
  if(process.argv.includes('--pond'))views.push(['pond',-63,187,0,-.33]);
  for(const [name,x,y,yaw,pitch]of views){
   await p.evaluate(v=>{Object.assign(__perf.state.player,v);__perf.render();},{x,y,yaw,pitch});await p.waitForTimeout(500);
   const sample=await p.evaluate(moving=>new Promise(resolve=>{
     const intervals=[],rafIntervals=[],submit=[],events=[];let lastResolution;let last,lastDraw,lastCount=RCScene3D.stats().frames,startTime;
     const origin={...__perf.state.player};
     function step(now){
       startTime??=now;if(last!==undefined)rafIntervals.push(now-last);last=now;
       __perf.state.hole.elapsed+=1/60;
       if(moving){__perf.state.player.y=origin.y+.35*intervals.length;__perf.state.player.yaw=origin.yaw+.002*intervals.length;}
       const start=performance.now();__perf.render();submit.push(performance.now()-start);const stats=RCScene3D.stats();
       if(stats.frames!==lastCount){const resolution=stats.resolution.join('x');if(resolution!==lastResolution||(lastDraw!==undefined&&now-lastDraw>150))events.push({sample:intervals.length,interval:lastDraw===undefined?0:now-lastDraw,resolution});lastResolution=resolution;if(lastDraw!==undefined)intervals.push(now-lastDraw);lastDraw=now;lastCount=stats.frames;}
       if(intervals.length>=60||now-startTime>30000)resolve({intervals,submit,rafIntervals,stats,events});else requestAnimationFrame(step);
     }requestAnimationFrame(step);
   }),moving);
   const a=sample.intervals.sort((a,b)=>a-b),b=sample.submit.sort((a,b)=>a-b),s=sample.stats;results.push({name,events:sample.events,medianMs:a[Math.floor(a.length*.5)],p95Ms:a[Math.floor(a.length*.95)],maxMs:Math.max(...a),submitP95:b[Math.floor(b.length*.95)],over50:a.filter(n=>n>50).length,renderedSamples:a.length,rafSamples:sample.rafIntervals.length,rafP95:sample.rafIntervals.sort((a,b)=>a-b)[Math.floor(sample.rafIntervals.length*.95)],busyFramesSkipped:s.busyFramesSkipped||0,gpuCompletionAverageMs:s.gpuFrameAverageMs,gpuCompletionP95Ms:s.gpuFrameP95Ms,triangles:s.triangles,drawCalls:s.drawCalls,resolution:s.resolution,gpu:s.gpu,quality:s.quality,prepareMs:s.prepareMs,gpuDrainMs:s.gpuDrainMs,preparation:s.preparation});await p.screenshot({path:out+'/'+label+'-'+name+'.png'});
  }
  if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(out+'/'+label+'.json',JSON.stringify({label,results,errors,method:'60 actual world-render submissions per view, observed on real RAF at 1280x720. RAF intervals and submitted-frame intervals reported separately to expose GPU backpressure. Deterministic simulation clock; moving advances camera .35 course units and .002 radians per submitted sample.'},null,2));console.log(JSON.stringify({label,results,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
