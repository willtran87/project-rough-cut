const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),baseline=process.argv.includes('--baseline'),live=process.argv.includes('--live');
const scale=Number(process.argv.find(a=>a.startsWith('--scale='))?.split('=')[1]||1);
const liveFrames=Number(process.argv.find(a=>a.startsWith('--frames='))?.split('=')[1]||240);
const viewportText=process.argv.find(a=>a.startsWith('--viewport='))?.slice(11)||'1280x720';
assert(/^\d+x\d+$/.test(viewportText));const [width,height]=viewportText.split('x').map(Number);
const fov=Number(process.argv.find(a=>a.startsWith('--fov='))?.slice(6)||58);
const variant=process.argv.find(a=>a.startsWith('--variant='))?.slice(10)||'normal';
assert(['normal','no-backdrop','no-water','no-point-lights','finite-lights'].includes(variant));
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/rendering',label=(software?'software':'hardware')+(baseline?'-baseline':'-current')+(scale===1?'':'-scale-'+scale)+(live?'-live':'')+(liveFrames===240?'':'-'+liveFrames)+(variant==='normal'?'':'-'+variant);
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width,height}}),errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(({scale,fov})=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({resolution:scale,fov})),{scale,fov});
  if(variant==='finite-lights')await p.route('**/finite-light-material.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('tools/fixtures/under-green-finite-light-candidate.js','utf8')}));
  for(const file of ['under-green.js','under-green-scene.js'])await p.route('**/'+file,r=>{
   let source=fs.readFileSync(baseline?path.join(out,'baseline',file):path.join('web',file),'utf8');
   if(file==='under-green.js'){
    assert(source.includes('if(test)window.__underGreen={'),'Missing runtime instrumentation marker');
    source=source.replace('if(test)window.__underGreen={','if(true)window.__underGreen={setManual(v){manual=v;last=performance.now();},');
   }else{
    const marker=baseline?' return {draw,resize,':' return {draw,drainJoeFootsteps:';
    assert(source.includes(marker),'Missing scene instrumentation marker');
    source=source.replace(marker,' window.__profileUG={renderer};'+marker);
    if(variant==='no-backdrop'){
     assert(source.includes('renderer.render(backdrop.scene,backdrop.camera);'));
     source=source.replace('renderer.render(backdrop.scene,backdrop.camera);','');
    }
    if(variant==='no-point-lights'){
     assert(source.includes('scene.add(playerLight);')&&source.includes('scene.add(light);'));
     source=source.replace('scene.add(playerLight);','playerLight.visible=false;scene.add(playerLight);').replace('scene.add(light);','light.visible=false;scene.add(light);');
    }
    if(variant==='finite-lights'){
     const marker="resize();onProgress('Warming the underground course…');";assert(source.includes(marker));
     if(!source.includes("import {specializeFiniteLights}"))source="import {specializeFiniteLights} from './finite-light-material.js';\n"+source;
     source=source.replace(marker,"scene.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))specializeFiniteLights(m);});"+marker);
    }
   }
   return r.fulfill({contentType:'application/javascript',body:source});
  });
  if(variant==='no-water')await p.route('**/under-green-water.js',r=>{
   let source=fs.readFileSync('web/under-green-water.js','utf8');
   const marker='if(count)drops.instanceMatrix.needsUpdate=true;';assert(source.includes(marker));
   source=source.replace(marker,marker+'for(const v of surfaces)v.group.visible=false;drops.visible=false;');
   return r.fulfill({contentType:'application/javascript',body:source});
  });
  const start=Date.now();await p.goto('http://127.0.0.1:4187/under-green.html');
  await p.waitForFunction(()=>window.__profileUG&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});const readyMs=Date.now()-start;
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  for(const [name,x,y,yaw,time,jx,jy]of [['roots',0,12,0,3,0,36],['bunker',-20,70,Math.PI,6,-20,73],['range',12,36,Math.PI,90,12,39]]){
   const result=await p.evaluate(async a=>{
    const [name,x,y,yaw,time,jx,jy]=a,{createRun}=await import('./under-green-sim.js'),{rangeY}=await import('./under-green-layout.js');
    const r=createRun(2);r.mode='playing';r.time=time;r.messageTime=0;Object.assign(r.player,{x,y:x>6?rangeY(y):y,yaw});Object.assign(r.joe,{x:jx,y:jx>6?rangeY(jy):jy,yaw,phase:'walk',age:.5});
    __underGreen.run=r;__underGreen.clearInput();advanceTime(0);
    const gl=__profileUG.renderer.getContext(),samples=[];
    async function one(){
     const started=performance.now();advanceTime(0);const submitted=performance.now(),fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
     while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-started>10000)throw Error('GPU completion timed out');await new Promise(r=>setTimeout(r,2));}
     gl.deleteSync(fence);return {cpu:submitted-started,completed:performance.now()-started};
    }
    for(let i=0;i<4;i++)await one();for(let i=0;i<24;i++)samples.push(await one());
    const sorted=samples.map(s=>s.completed).sort((a,b)=>a-b),cpu=samples.map(s=>s.cpu).sort((a,b)=>a-b);
    return {name,median:sorted[12],p95:sorted[22],max:sorted[23],cpuMedian:cpu[12],samples,graphics:JSON.parse(render_game_to_text()).graphics,context:gl.getContextAttributes(),heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null};
   },[name,x,y,yaw,time,jx,jy]);views.push(result);console.log(JSON.stringify({label,name,median:result.median,p95:result.p95,cpu:result.cpuMedian,resolution:result.graphics.resolution,gpu:result.graphics.gpu}));
   await p.screenshot({path:`${out}/${label}-${name}.png`});
  }
  let cadence=null;
  if(live){
   cadence=await p.evaluate(async liveFrames=>{
    const {createRun}=await import('./under-green-sim.js'),r=createRun(0);r.mode='playing';Object.assign(r.player,{x:0,y:12});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);
    const renderer=__profileUG.renderer,resources=()=>({...renderer.info.memory,programs:renderer.info.programs.length});
    const before=resources(),framesBefore=JSON.parse(render_game_to_text()).graphics.frames,samples=[],started=performance.now();let last=started;__underGreen.setManual(false);
    await new Promise(resolve=>{function sample(now){samples.push(now-last);last=now;if(samples.length>=liveFrames){__underGreen.setManual(true);resolve();}else requestAnimationFrame(sample);}requestAnimationFrame(sample);});
    const wallMs=performance.now()-started,sorted=samples.slice(6).sort((a,b)=>a-b),gl=renderer.getContext(),drainStart=performance.now(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
    while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-drainStart>10000)throw Error('Live rendering did not drain');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(f);
    const graphics=JSON.parse(render_game_to_text()).graphics;
    return {frames:samples.length,renderedFrames:graphics.frames-framesBefore,resolution:graphics.resolution,completionAverage:graphics.completionAverage,completionP95:graphics.completionP95,budget:graphics.budget,wallMs,simulatedSeconds:r.time,median:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],max:Math.max(...sorted),gpuDrainMs:performance.now()-drainStart,before,after:resources(),samples};
   },liveFrames);console.log(JSON.stringify({label,cadence:{...cadence,samples:undefined}}));
   await p.screenshot({path:`${out}/${label}-ending.png`});
  }
  fs.writeFileSync(`${out}/${label}.json`,JSON.stringify({label,readyMs,viewport:{width,height},fov,variant,method:'24 fixed-view frames after four warmups; CPU submission and GPU-fence completion, including 2ms polling overhead; no simulation advancement. Removed-component variants are diagnostic only, never acceptance evidence.',views,cadence,errors},null,2));
  if(errors.length)throw Error(errors.join('\n'));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
