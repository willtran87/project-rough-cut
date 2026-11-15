const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/software-rendering',software=process.argv.includes('--software'),reports=[];fs.mkdirSync(out,{recursive:true});let b;
 try{for(const before of (process.argv.includes('--current-only')?[false]:[true,false])){
  // Separate browser/GPU processes: the unbounded baseline can leave seconds
  // of queued work after its movement test. Closing a page alone contaminates
  // the next variant's cold-start measurements with that old backlog.
  b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  const label=(before?'before':'after')+(software?'-software':'-hardware'),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(before){
   for(const file of ['joe-model.js','scene-3d.js','pixel-world-props.js','pixel-trees.js','tree-geometry-worker.js','pixel-buildings.js','pixel-landscape.js','software-frame-budget.js','render-preparation.js','terrain-finish.js','baked-terrain.js','pixel-art.js','parallax-scene.js','atmospheric-audio.js'])if(fs.existsSync(out+'/before/'+file))await p.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/before/'+file,'utf8')}));
   if(fs.existsSync(out+'/joe-original.glb'))await p.route('**/joe-pixel-rig.glb*',r=>r.fulfill({contentType:'model/gltf-binary',body:fs.readFileSync(out+'/joe-original.glb')}));
  }
  const source=fs.readFileSync(before?out+'/before/game.js':'web/game.js','utf8');await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__load={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
  await p.addInitScript(()=>{window.__loadingFrames=[];window.__longTasks=[];new PerformanceObserver(list=>{for(const e of list.getEntries())__longTasks.push({time:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});let last;function frame(now){if(last!==undefined&&window.RCScene3D?.isPreparing())__loadingFrames.push(now-last);last=now;if(!window.__stopLoad)requestAnimationFrame(frame);}requestAnimationFrame(frame);});
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__load&&JSON.parse(render_game_to_text()).assets.course.ready);
  const profiler=process.argv.includes('--cpu')?await p.context().newCDPSession(p):null;
  if(profiler){await profiler.send('Profiler.enable');await profiler.send('Profiler.start');}
  const tracer=process.argv.includes('--trace')?await p.context().newCDPSession(p):null;
  if(tracer)await tracer.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,cc,gpu,toplevel',transferMode:'ReturnAsStream'});
  await p.evaluate(()=>{const t=__load,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:690});window.__loadStart=performance.now();t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  const loading=await p.evaluate(()=>{__stopLoad=true;return {elapsed:performance.now()-__loadStart,maxLoadingFrame:Math.max(0,...__loadingFrames),longTasks:__longTasks.filter(t=>t.time>=__loadStart),stats:RCScene3D.stats()};});
  // The old ready flag preceded GPU completion. Measure an actually completed
  // first scene too, so earlier readiness cannot conceal a driver backlog.
  loading.firstSceneElapsed=await p.evaluate(async()=>{
   __load.render();await RCScene3D.whenPresented?.();
   const gl=document.getElementById('game').getContext('webgl2'),sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
   try{while(true){const status=gl.clientWaitSync(sync,0,0);if(status===gl.ALREADY_SIGNALED||status===gl.CONDITION_SATISFIED)break;if(status===gl.WAIT_FAILED)throw Error('First scene fence failed');await new Promise(requestAnimationFrame);}}finally{gl.deleteSync(sync);}
   return performance.now()-__loadStart;
  });
  if(profiler){const {profile}=await profiler.send('Profiler.stop');fs.writeFileSync(out+'/'+label+'-startup.cpuprofile',JSON.stringify(profile));const nodes=new Map(profile.nodes.map(n=>[n.id,n])),totals=new Map();for(let i=0;i<profile.samples.length;i++){const f=nodes.get(profile.samples[i]).callFrame,key=f.functionName+' '+f.url.split('/').pop()+':'+(f.lineNumber+1);totals.set(key,(totals.get(key)||0)+profile.timeDeltas[i]/1000);}loading.cpu=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,24);fs.writeFileSync(out+'/'+label+'-startup-cpu.json',JSON.stringify(loading.cpu,null,2));}
  if(tracer){const done=new Promise(resolve=>tracer.once('Tracing.tracingComplete',resolve));await tracer.send('Tracing.end');const {stream}=await done;let trace='';while(true){const chunk=await tracer.send('IO.read',{handle:stream});trace+=chunk.data;if(chunk.eof)break;}await tracer.send('IO.close',{handle:stream});fs.writeFileSync(out+'/'+label+'-startup-trace.json',trace);}
  for(const [view,x,y,yaw]of [['opening',0,65,0],['border',100,340,1.57],['shed',-18,684,0]]){
   await p.evaluate(async v=>{const s=__load.state;Object.assign(s.player,v);s.hole.elapsed=1;s.time=1;__load.render();await RCScene3D.whenPresented?.();},{x,y,yaw});await p.screenshot({path:out+'/'+label+'-visual-'+view+'.png'});
  }
  await p.evaluate(()=>{const s=__load.state;Object.assign(s.player,{x:0,y:12,yaw:0,pitch:0});s.hole.joe.patrolPause=9999;s.keys.clear();__load.render();});await p.evaluate(()=>RCScene3D.whenPresented?.());
  await p.evaluate(()=>{__load.state.manualTime=false;window.__travelStart={time:performance.now(),y:__load.state.player.y};});await p.keyboard.down('w');await p.waitForTimeout(2000);await p.keyboard.up('w');
  const travel=await p.evaluate(()=>{__load.state.manualTime=true;return {seconds:(performance.now()-__travelStart.time)/1000,distance:__load.state.player.y-__travelStart.y,clock:__load.state.hole.elapsed};});
  const art=await p.evaluate(()=>{const s=RCScene3D.stats();return {objects:s.pixelWorld.objects.map(o=>({kind:o.kind,position:o.position,hull:o.hull,form:o.form})),textures:s.pixelArt.loaded,errors:s.pixelArt.errors,joe:s.joeModel};});
  assert.deepEqual(errors,[]);assert.deepEqual(art.errors,[]);reports.push({label,loading,art,travel,errors});await b.close();b=null;
 }
 if(reports.length===2){assert.deepEqual(reports[1].art.objects,reports[0].art.objects);assert.equal(reports[1].art.joe.triangles,reports[0].art.joe.triangles);}
 fs.writeFileSync(out+(process.argv.includes('--current-only')?'/current-startup-':'/loading-and-art-')+(software?'software':'hardware')+'.json',JSON.stringify({passed:true,reports},null,2));console.log(JSON.stringify(reports.map(r=>({label:r.label,elapsed:r.loading.elapsed,firstSceneElapsed:r.loading.firstSceneElapsed,travel:r.travel,maxLoadingFrame:r.loading.maxLoadingFrame,longTasks:r.loading.longTasks,prepare:r.loading.stats.preparation,errors:r.errors})),null,2));
 }finally{await b?.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
