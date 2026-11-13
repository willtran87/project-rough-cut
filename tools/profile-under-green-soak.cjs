// Real-time production-renderer soak. Replays recorded ordinary simulation
// inputs from the existing map-aware QA pilot; this is not a human playtest.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),seconds=Number(process.argv.find(a=>a.startsWith('--seconds='))?.split('=')[1]||300);
const label=software?'software':'hardware',out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/soak';
const audioVoiceCapacity=16; // Eight outlet sources and eight non-water voices.
const viewportText=process.argv.find(a=>a.startsWith('--viewport='))?.slice(11)||'1280x720';
assert(/^\d+x\d+$/.test(viewportText),'Use --viewport=WIDTHxHEIGHT');
const [width,height]=viewportText.split('x').map(Number),viewport={width,height};
const preferences={fov:Number(process.argv.find(a=>a.startsWith('--fov='))?.slice(6)||58),resolution:Number(process.argv.find(a=>a.startsWith('--resolution='))?.slice(13)||1)};
assert(width>=320&&width<=7680&&height>=180&&height<=4320,'Unsupported profiling viewport');
assert(preferences.fov>=45&&preferences.fov<=85&&preferences.resolution>=.5&&preferences.resolution<=1,'Use supported preference values');
const percentile=(a,q)=>{const s=a.slice().sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(s.length*q))]||0;};
(async()=>{
 assert(seconds>=10&&seconds<=3600);fs.mkdirSync(out,{recursive:true});
 const {traverse}=await import('./probe-under-green-folded.mjs'),{createRun,step}=await import('../web/under-green-sim.js');
 const tapes=[];
 for(const options of [{dodge:true},{wet:true,dodge:true},{sprint:true,dodge:true},{cp:3,dodge:true}]){
  const inputTape=[],expected=traverse({...options,inputTape}),r=createRun(options.cp||0);r.mode='playing';
  for(const row of inputTape)step(r,{...row.input,lookX:Math.atan2(Math.sin(row.yaw-r.player.yaw),Math.cos(row.yaw-r.player.yaw))});
  assert.equal(expected.mode,'complete','Profiling fixture must escape');
  assert.equal(r.mode,expected.mode);assert(Math.hypot(r.player.x-expected.p.x,r.player.y-expected.p.y)<.001);
  assert.equal(r.waterHits,expected.waterHits);assert(Math.abs(r.elapsed-expected.elapsed)<1/60);
  tapes.push({options,inputTape,expected:{mode:expected.mode,x:expected.p.x,y:expected.p.y,seconds:expected.elapsed,waterHits:expected.waterHits}});
 }
 const browser=await chromium.launch({headless:true,args:[...(software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']),'--enable-precise-memory-info']});
 try{
  const p=await browser.newPage({viewport}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(preferences=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify(preferences)),preferences);
  await p.addInitScript(()=>{
   const live=new Set(),proto=WebGL2RenderingContext.prototype,add=proto.fenceSync,remove=proto.deleteSync;
   window.__soakFences={live:0,max:0};
   proto.fenceSync=function(...args){const f=add.apply(this,args);if(f)live.add(f);__soakFences.live=live.size;__soakFences.max=Math.max(__soakFences.max,live.size);return f;};
   proto.deleteSync=function(f){live.delete(f);__soakFences.live=live.size;return remove.call(this,f);};
  });
  await p.route('**/under-green.js',route=>{
   const source=fs.readFileSync('web/under-green.js','utf8')
    .replace('function input(dt=1/60){','function input(dt=1/60){if(window.__soakInput)return window.__soakInput(run);')
    .replace('if(test)window.__underGreen={','if(true)window.__underGreen={');
   return route.fulfill({contentType:'application/javascript',body:source});
  });
  await p.route('**/under-green-scene.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-scene.js','utf8').replace(' return {draw,drainJoeFootsteps:',' window.__soakRenderer=renderer;return {draw,drainJoeFootsteps:')}));
  const load=Date.now();await p.goto('http://127.0.0.1:4187/under-green.html');await p.waitForFunction(()=>window.__soakRenderer&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  const readyMs=Date.now()-load;await p.click('#primary');
  await p.evaluate(async({tapes,seconds})=>{
   const {createRun}=await import('./under-green-sim.js'),{createLocalTelemetry}=await import('./local-telemetry.js');
   const s=window.__soak={started:performance.now(),seconds,scenario:0,cursor:0,completed:[],errors:[],raf:[],longTasks:[],last:performance.now(),done:false,gc:false};
   __soakFences.max=__soakFences.live;
   const start=()=>{const r=createRun(tapes[s.scenario].options.cp||0);r.mode='playing';r.telemetry=createLocalTelemetry();__underGreen.run=r;__underGreen.clearInput();s.cursor=0;};
   start();
   window.__soakInput=r=>{
    if(!['playing','aftermath'].includes(r.mode)||s.done)return {};
    const row=tapes[s.scenario].inputTape[s.cursor++];
    if(!row){if(!s.errors.length)s.errors.push('Input tape exhausted before outcome');return {};}
    return {...row.input,lookX:Math.atan2(Math.sin(row.yaw-r.player.yaw),Math.cos(row.yaw-r.player.yaw))};
   };
   new PerformanceObserver(list=>{for(const e of list.getEntries())if(!s.gc)s.longTasks.push({start:e.startTime-s.started,duration:e.duration});}).observe({type:'longtask',buffered:false});
   function sample(now){if(s.done)return;if(!s.gc&&now-s.last<1000)s.raf.push(now-s.last);s.last=now;requestAnimationFrame(sample);}requestAnimationFrame(sample);
   s.timer=setInterval(()=>{
    const r=__underGreen.run;
    if(['complete','caught'].includes(r.mode)){
     const expected=tapes[s.scenario].expected,error=Math.hypot(r.player.x-expected.x,r.player.y-expected.y);
     const timeError=Math.abs(r.elapsed-expected.seconds),matchesExpected=r.mode===expected.mode&&error<.001&&r.waterHits===expected.waterHits&&timeError<1/60;
     s.completed.push({scenario:s.scenario,mode:r.mode,seconds:r.elapsed,error,waterHits:r.waterHits,expected,timeError,matchesExpected,events:r.events.length,telemetryEvents:r.telemetry.events.length});
     if(!matchesExpected)s.errors.push('Live input replay diverged from verified simulation');
     s.scenario=(s.scenario+1)%tapes.length;start();
    }
    if(performance.now()-s.started>=seconds*1000||s.errors.length){s.done=true;clearInterval(s.timer);__underGreen.run.mode='paused';__underGreen.render();}
   },50);
  },{tapes,seconds});
  const cdp=await p.context().newCDPSession(p),samples=[];
  await cdp.send('Performance.enable');
  const sample=async()=>{
   await p.evaluate(()=>__soak.gc=true);await cdp.send('HeapProfiler.collectGarbage');
   const heap=await cdp.send('Runtime.getHeapUsage'),metrics=await cdp.send('Performance.getMetrics');
   const state=await p.evaluate(()=>{
    const s=__soak,r=__underGreen.run,snapshot=JSON.parse(render_game_to_text()),g=snapshot.graphics,renderer=__soakRenderer;
    s.gc=false;s.last=performance.now();
    return {wall:(performance.now()-s.started)/1000,scenario:s.scenario,mode:r.mode,done:s.done,cursor:s.cursor,completed:s.completed.length,
     viewport:{width:innerWidth,height:innerHeight},preferences:{fov:snapshot.comfort.fov,resolution:snapshot.comfort.resolution},
     player:{x:r.player.x,y:r.player.y,yaw:r.player.yaw},simulationSeconds:r.elapsed,
     resources:{...renderer.info.memory,programs:renderer.info.programs.length},contextLost:renderer.getContext().isContextLost(),
     graphics:{gpu:g.gpu,software:g.software,captureBuffer:g.captureBuffer,frames:g.frames,draws:g.draws,triangles:g.triangles,resolution:g.resolution,resolutionScale:g.resolutionScale,camera:g.camera,budget:g.budget,completionP95:g.completionP95,completionAverage:g.completionAverage},
     audio:JSON.parse(render_game_to_text()).audio,events:r.events.length,telemetry:r.telemetry?.events.length,fences:{...__soakFences}};
   });
   state.heap=heap;state.domNodes=metrics.metrics.find(m=>m.name==='Nodes')?.value;state.raf=await p.evaluate(()=>__soak.raf.splice(0));
   state.rafStats={frames:state.raf.length,median:percentile(state.raf,.5),p95:percentile(state.raf,.95),p99:percentile(state.raf,.99)};
   samples.push(state);fs.writeFileSync(`${out}/${label}-partial.json`,JSON.stringify({readyMs,seconds,samples,errors},null,2));
   console.log(JSON.stringify({label,wall:state.wall.toFixed(1),completed:state.completed,scenario:state.scenario,heapMiB:(heap.usedSize/1048576).toFixed(2),resources:state.resources,raf:state.rafStats,resolution:state.graphics.resolution,completionP95:state.graphics.completionP95}));return state;
  };
  let current=await sample();
  while(!current.done){await p.waitForTimeout(Math.min(30000,Math.max(1000,(seconds-current.wall)*1000)));current=await sample();}
  const drainMs=await p.evaluate(async()=>{
   const start=performance.now();await __underGreen.whenPresented();const gl=__soakRenderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
   while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU drain timed out');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(f);return performance.now()-start;
  });
  // Profiling is finished. Freeze one full-page gameplay view for inspection.
  await p.evaluate(()=>{__underGreen.run.mode='playing';advanceTime(0);});await p.screenshot({path:`${out}/${label}-ending.png`});
  const result=await p.evaluate(()=>({completed:__soak.completed,errors:__soak.errors,longTasks:__soak.longTasks}));errors.push(...result.errors);
  // GPU buffers/textures upload lazily as districts enter view. Compare after
  // the first complete route, rather than treating first-time uploads as leaks.
  const stable=samples.filter(s=>s.completed>0),first=stable[0]||samples[0],last=samples.at(-1),heapGrowth=last.heap.usedSize-first.heap.usedSize;
  const plateau=stable.every(s=>JSON.stringify(s.resources)===JSON.stringify(first.resources)),voices=samples.every(s=>s.audio.voices===audioVoiceCapacity&&s.audio.voiceCapacity===audioVoiceCapacity&&s.audio.waterVoices===8);
  const coverage=seconds<240||new Set(result.completed.map(r=>r.scenario)).size===4,queue=!software||samples.every(s=>s.fences.max<=1);
  const report={method:'Production captureBuffer=false; real RAF/fixed-step simulation; verified map-aware input tapes; GC before sampled heap (GC gaps excluded from RAF samples); 30-second samples. Stability comparison starts after first complete route to allow first-time uploads. Local desktop/software evidence, not physical-device qualification.',label,seconds,readyMs,drainMs,passed:errors.length===0&&plateau&&voices&&coverage&&queue&&!samples.some(s=>s.contextLost)&&heapGrowth<5*1048576,samples,result,heapGrowth,resourcesStable:plateau,voicesStable:voices,errors};
  report.audioVoiceCapacity=audioVoiceCapacity;
  report.viewport=viewport;report.preferences=preferences;report.browserVersion=browser.version();
  fs.writeFileSync(`${out}/${label}.json`,JSON.stringify(report,null,2));
  assert.deepEqual(errors,[]);assert(plateau,'Renderer resources grew after warmup');assert(voices,'Audio voice count changed');assert(heapGrowth<5*1048576,'Post-GC heap grew by 5MiB');assert(!samples.some(s=>s.contextLost));
  if(software)assert(samples.every(s=>s.fences.max<=1),'Software GPU queue grew');
  if(seconds>=240)assert(new Set(result.completed.map(r=>r.scenario)).size===4,'Full-route/checkpoint scenarios were not all exercised');
  console.log(JSON.stringify({label,passed:true,completed:result.completed.length,heapGrowth,resourcesStable:plateau,voicesStable:voices,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
