// Diagnostic first/repeated walking laps, ordinary production scheduling.
// One-second observations identify workload and uploads; not a budget soak.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/first-use';
fs.mkdirSync(out,{recursive:true});
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const manifest=Object.fromEntries(fs.readdirSync('web').filter(f=>/\.(js|css|html)$/.test(f)).map(f=>[`web/${f}`,hash(`web/${f}`)]));
function replace(source,from,to){assert(source.includes(from),`Instrumentation marker missing: ${from}`);return source.replace(from,to);}
(async()=>{
 const {traverse}=await import('./probe-under-green-folded.mjs'),{createRun,step}=await import('../web/under-green-sim.js');
 const tape=[],expected=traverse({dodge:true,inputTape:tape}),run=createRun();run.mode='playing';
 for(const row of tape)step(run,{...row.input,lookX:Math.atan2(Math.sin(row.yaw-run.player.yaw),Math.cos(row.yaw-run.player.yaw))});
 assert.equal(run.mode,'complete');assert.equal(run.mode,expected.mode);assert.equal(run.waterHits,expected.waterHits);assert(Math.hypot(run.player.x-expected.p.x,run.player.y-expected.p.y)<.001);assert(Math.abs(run.elapsed-expected.elapsed)<1/60);
 const contract={seconds:run.elapsed,waterHits:run.waterHits,x:run.player.x,y:run.player.y};
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{
   localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85,resolution:1}));
   const proto=WebGL2RenderingContext.prototype,counts=window.__uploadCounts={};
   for(const name of ['texImage2D','texStorage2D','bufferData','bufferSubData','linkProgram']){counts[name]=0;const original=proto[name];proto[name]=function(...args){counts[name]++;return original.apply(this,args);};}
  });
  await p.route('**/under-green.js',route=>{
   let s=fs.readFileSync('web/under-green.js','utf8').replace(/\r\n/g,'\n');
   s=replace(s,'function input(dt=1/60){','function input(dt=1/60){if(window.__lapInput)return window.__lapInput(run);');
   s=replace(s,'if(test)window.__underGreen={','if(true)window.__underGreen={');
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.route('**/under-green-scene.js',route=>{
   let s=fs.readFileSync('web/under-green-scene.js','utf8').replace(/\r\n/g,'\n');
   s=replace(s,'  if(fence){gl.deleteSync(fence);fence=null;}','  const auditStart=performance.now();if(fence){gl.deleteSync(fence);fence=null;}');
   s=replace(s,'  return true;\n }\n resize();','  auditCpu.sum+=performance.now()-auditStart;auditCpu.count++;return true;\n }\n resize();');
   s=replace(s,' return {draw,drainJoeFootsteps:',` const auditCpu={sum:0,count:0};window.__lapScene=()=>({frames,drawCalls,triangles,actorCulled,resolution:[canvas.width,canvas.height],scale:budget.scale(),completion:completionTimes.slice(),cpu:{...auditCpu},resources:{...renderer.info.memory,programs:renderer.info.programs.length},captureBuffer,gpu});return {draw,drainJoeFootsteps:`);
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  const load=Date.now();await p.goto('http://127.0.0.1:4187/under-green.html');await p.waitForFunction(()=>window.__lapScene&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  const readyMs=Date.now()-load;await p.click('#primary');
  await p.evaluate(async({tape,contract})=>{
   const {createRun}=await import('./under-green-sim.js'),{district}=await import('./under-green-course.js'),{createLocalTelemetry}=await import('./local-telemetry.js');
   const s=window.__lapAudit={started:performance.now(),lap:0,cursor:0,rows:[],outcomes:[],errors:[],done:false};
   let prior=null;
   function sample(){const r=__underGreen.run,g=__lapScene(),now=performance.now(),uploads={...__uploadCounts};
    const row={wall:(now-s.started)/1000,lap:s.lap,seconds:r.elapsed,mode:r.mode,district:district(r.player),player:{x:r.player.x,y:r.player.y,yaw:r.player.yaw},joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase},waterHits:r.waterHits,bypass:r.bypass,gate:r.gate,frames:g.frames,draws:g.drawCalls,triangles:g.triangles,actorCulled:g.actorCulled,resolution:g.resolution,scale:g.scale,resources:g.resources,uploads,captureBuffer:g.captureBuffer};
    if(prior){row.fps=(g.frames-prior.frames)/((now-prior.now)/1000);row.cpuAverage=(g.cpu.sum-prior.cpu.sum)/Math.max(1,g.cpu.count-prior.cpu.count);row.uploadDelta=Object.fromEntries(Object.keys(uploads).map(k=>[k,uploads[k]-prior.uploads[k]]));}
    const sorted=g.completion.sort((a,b)=>a-b);row.completionP95=sorted[Math.floor(sorted.length*.95)]||0;
    s.rows.push(row);prior={now,frames:g.frames,cpu:g.cpu,uploads};
   }
   function start(){const r=createRun();r.mode='playing';r.telemetry=createLocalTelemetry();__underGreen.run=r;__underGreen.clearInput();s.cursor=0;prior=null;sample();}
   window.__lapInput=r=>{if(s.done||!['playing','aftermath'].includes(r.mode))return {};const row=tape[s.cursor++];if(!row){s.errors.push('Tape exhausted');return {};}return {...row.input,lookX:Math.atan2(Math.sin(row.yaw-r.player.yaw),Math.cos(row.yaw-r.player.yaw))};};
   start();s.sampler=setInterval(sample,1000);
   s.monitor=setInterval(()=>{const r=__underGreen.run;
    if(['complete','caught'].includes(r.mode)){sample();const error=Math.hypot(r.player.x-contract.x,r.player.y-contract.y),matched=r.mode==='complete'&&error<.001&&r.waterHits===contract.waterHits&&Math.abs(r.elapsed-contract.seconds)<1/60;s.outcomes.push({lap:s.lap,mode:r.mode,seconds:r.elapsed,waterHits:r.waterHits,error,matched});if(!matched)s.errors.push('Outcome divergence');s.lap++;if(s.lap<2&&!s.errors.length)start();}
    if(s.lap>=2||s.errors.length||performance.now()-s.started>240000){if(s.lap<2&&!s.errors.length)s.errors.push('Diagnostic timed out');s.done=true;clearInterval(s.monitor);clearInterval(s.sampler);__underGreen.run.mode='paused';}
   },50);
  },{tape,contract});
  let state;
  do{await p.waitForTimeout(10000);state=await p.evaluate(()=>({done:__lapAudit.done,lap:__lapAudit.lap,rows:__lapAudit.rows.length,last:__lapAudit.rows.at(-1)}));console.log(JSON.stringify({lap:state.lap,rows:state.rows,last:state.last&&{seconds:state.last.seconds,district:state.last.district,fps:state.last.fps}}));}while(!state.done);
  const result=await p.evaluate(()=>({rows:__lapAudit.rows,outcomes:__lapAudit.outcomes,errors:__lapAudit.errors,gpu:__lapScene().gpu}));
  const changed=Object.entries(manifest).filter(([f,h])=>!fs.existsSync(f)||hash(f)!==h).map(([f])=>f);
  const report={method:'Two identical verified walking input tapes through production real-time update/render/audio/HUD. One-second observations and upload-call counters add diagnostic overhead; CPU timings measure submitted scene work, not GPU completion. No forced GC or cold-cache claim. Not the budget acceptance soak.',readyMs,contract,errors:[...errors,...result.errors],...result,source:{manifest,changed}};
  report.errors=[...errors,...result.errors];fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));
  await p.evaluate(()=>{__underGreen.run.mode='aftermath';advanceTime(0);});await p.screenshot({path:`${out}/ending.png`});
  assert.deepEqual(report.errors,[]);assert.equal(result.outcomes.length,2);assert(result.outcomes.every(x=>x.matched));assert(result.rows.every(x=>x.captureBuffer===false));
  console.log(JSON.stringify({passed:true,rows:result.rows.length,outcomes:result.outcomes,changed}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
