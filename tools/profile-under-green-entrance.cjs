// Per-frame first/repeated entrance diagnostic. No forced GC or simulated time.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {gameModule,sceneModule,instrumentGame,instrumentScene}=require('./under-green-soak-hooks.cjs');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/entrance-audit/hardware';
const prewarm=process.argv.includes('--prewarm-navigation');
assert(!process.argv.includes('--skip-debris-preparation'),'The obsolete whole-scene debris warmup has been removed; use preserved audit artifacts for that baseline.');
const duration=Number(process.argv.find(a=>a.startsWith('--duration='))?.slice(11)||20),lapCount=Number(process.argv.find(a=>a.startsWith('--laps='))?.slice(7)||2);
fs.mkdirSync(out,{recursive:true});
const replace=(s,a,b)=>{assert.equal(s.split(a).length,2,'Diagnostic marker: '+a);return s.replace(a,b);};
(async()=>{
 const {traverse}=await import('./probe-under-green-folded.mjs'),tape=[];traverse({dodge:true,inputTape:tape,view:{fov:85,aspect:1.6}});
 const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']}),errors=[];
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{
   localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85,resolution:1}));
   window.__entryMeasure=(name,fn)=>{const a=window.__entryAudit;if(!a||a.done)return fn();const t=performance.now();try{return fn();}finally{a.cost[name]=(a.cost[name]||0)+performance.now()-t;}};
   const proto=WebGL2RenderingContext.prototype;
   for(const name of ['bufferData','bufferSubData','texImage2D','texSubImage2D','texStorage2D','linkProgram','getProgramInfoLog','getActiveUniform','getUniformLocation']){
    const original=proto[name];proto[name]=function(...args){const a=window.__entryAudit;if(!a||a.done)return original.apply(this,args);a.calls[name]=(a.calls[name]||0)+1;return __entryMeasure(name,()=>original.apply(this,args));};
   }
  });
  await p.route(gameModule,route=>{
   let s=instrumentGame(fs.readFileSync('web/under-green.js','utf8'));
   s=replace(s,'step(run,i,dt);','__entryMeasure("simulation",()=>step(run,i,dt));');
   s=replace(s,'audio.update(run);if(run.events.length>50)','__entryMeasure("audio",()=>audio.update(run));if(run.events.length>50)');
   s=replace(s,'function frame(t){','function frame(t){const auditStart=performance.now();');
   s=replace(s,'requestAnimationFrame(frame);}',`if(window.__entryAudit&&!__entryAudit.done){const a=__entryAudit;a.rows.push({wall:performance.now()-a.started,lap:a.lap,seconds:run.elapsed,phase:run.joe.phase,age:run.joe.age,player:{x:run.player.x,y:run.player.y},cost:a.cost,calls:a.calls,frameCpu:performance.now()-auditStart,rafGap:a.last===null?0:t-a.last,geometry:__soakRenderer.info.memory.geometries,programs:__soakRenderer.info.programs.length});a.cost={};a.calls={};a.last=t;}requestAnimationFrame(frame);}`);
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.route(sceneModule,route=>{
   let s=instrumentScene(fs.readFileSync('web/under-green-scene.js','utf8'));
   s=replace(s,'joe.update(r,prefs.reduced);','__entryMeasure("actor",()=>joe.update(r,prefs.reduced));');
   s=replace(s,'try{renderer.render(scene,camera);}','try{__entryMeasure("renderer",()=>renderer.render(scene,camera));if(window.__entryAudit&&!__entryAudit.done)__entryAudit.submissions.push({wall:performance.now()-__entryAudit.started,lap:__entryAudit.lap,seconds:r.elapsed});}');
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.route(/\/under-green-navigation\.js$/,route=>{
   let s=fs.readFileSync('web/under-green-navigation.js','utf8');s=s.replaceAll('const nodes=courseGraph();','const nodes=__entryMeasure("navigationGraph",()=>courseGraph());');return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html');await p.waitForFunction(()=>window.__underGreen&&window.__soakRenderer&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  const preparationMs=prewarm?await p.evaluate(async()=>{const {planJoeRoute}=await import('./under-green-navigation.js'),{ARRIVAL}=await import('./under-green-encounters.js');const t=performance.now();planJoeRoute(ARRIVAL.spawn,ARRIVAL.landing,0);return performance.now()-t;}):0;
  if(await p.evaluate(()=>JSON.parse(render_game_to_text()).opening.active))await p.keyboard.press('Escape');
  if(await p.evaluate(()=>__underGreen.run.mode!=='playing'))await p.click('#primary');
  if(await p.evaluate(()=>JSON.parse(render_game_to_text()).opening.active))await p.keyboard.press('Escape');
  await p.waitForFunction(()=>__underGreen.run.mode==='playing');
  const cdp=await p.context().newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');
  await p.evaluate(async({tape,duration,lapCount})=>{
   const {createRun}=await import('./under-green-sim.js');const a=window.__entryAudit={started:performance.now(),lap:0,cursor:0,rows:[],submissions:[],cost:{},calls:{},last:null,done:false,longTasks:[]};
   new PerformanceObserver(list=>{for(const e of list.getEntries())a.longTasks.push({wall:e.startTime-a.started,ms:e.duration});}).observe({type:'longtask'});
   const start=()=>{const r=createRun();r.mode='playing';__underGreen.run=r;__underGreen.clearInput();a.cursor=0;};start();
   window.__soakInput=r=>{const row=tape[a.cursor++];if(!row)throw Error('Entrance tape exhausted');return {...row.input,lookX:Math.atan2(Math.sin(row.yaw-r.player.yaw),Math.cos(row.yaw-r.player.yaw))};};
   a.timer=setInterval(()=>{if(__underGreen.run.elapsed>=duration){a.lap++;if(a.lap<lapCount)start();else{a.done=true;clearInterval(a.timer);__underGreen.run.mode='paused';}}},20);
  },{tape,duration,lapCount});
  await p.waitForFunction(()=>__entryAudit.done,null,{timeout:90000});
  const {profile}=await cdp.send('Profiler.stop');fs.writeFileSync(out+'/cpu.json',JSON.stringify(profile));
  const data=await p.evaluate(()=>({rows:__entryAudit.rows,submissions:__entryAudit.submissions,longTasks:__entryAudit.longTasks,graphics:JSON.parse(render_game_to_text()).graphics}));
  const summarize=rows=>{const sorted=rows.map(r=>r.rafGap).filter(n=>n>0).sort((a,b)=>a-b);return {frames:rows.length,renderedFrames:rows.filter(r=>r.cost.renderer!==undefined).length,rafP95:sorted[Math.floor(sorted.length*.95)],maxGap:sorted.at(-1),maxCpu:Math.max(...rows.map(r=>r.frameCpu)),worst:rows.slice().sort((a,b)=>b.frameCpu-a.frameCpu).slice(0,8)};};
  const presentation={firstSubmissionMs:data.submissions[0]?.wall??Infinity,maxGapMs:Math.max(...data.submissions.map((s,i)=>s.wall-(data.submissions[i-1]?.wall||0))),count:data.submissions.length};
  const laps=Array.from({length:lapCount},(_,lap)=>({lap,...summarize(data.rows.filter(r=>r.lap===lap))}));
  fs.writeFileSync(out+'/report.json',JSON.stringify({diagnosticOnly:true,software,prewarm,preparationMs,presentation,errors,laps,...data},null,2));console.log(JSON.stringify({software,prewarm,preparationMs,presentation,laps,errors}));assert.deepEqual(errors,[]);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
