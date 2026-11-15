// Read-only browser audit: route diagnostic hooks into responses, never runtime files.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/startup-resource-audit-20261107';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const [file,suffix] of [['scene-3d.js','\nwindow.__resourceScene=()=>({renderer,world,staticRoot,dynamicRoot,compositor,parallax});'],['pixel-art.js','\nif(typeof window!=="undefined")window.__resourceArt=async()=>({images:await Promise.all([...images].map(async([name,p])=>{const i=await p;return {name,width:i?.width,height:i?.height};})),textures:[...textures].map(([name,t])=>({name,width:t.image.width,height:t.image.height}))});']]){
   await page.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/'+file,'utf8')+suffix}));
  }
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__load={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
  await page.addInitScript(()=>{
   window.__audit={tasks:[],frames:[],images:[],gl:{}};
   new PerformanceObserver(l=>{for(const e of l.getEntries())__audit.tasks.push({start:e.startTime,ms:e.duration});}).observe({type:'longtask',buffered:true});
   const ImageOriginal=window.Image;window.Image=function(...args){const i=new ImageOriginal(...args);i.addEventListener('load',()=>__audit.images.push({src:i.src.split('/').pop(),width:i.naturalWidth,height:i.naturalHeight}));return i;};window.Image.prototype=ImageOriginal.prototype;
   let prev;function raf(t){if(prev&&window.RCScene3D?.isPreparing())__audit.frames.push(t-prev);prev=t;if(!__audit.done)requestAnimationFrame(raf);}requestAnimationFrame(raf);
   for(const method of ['bufferData','bufferSubData','texImage2D','texSubImage2D','generateMipmap','compileShader','linkProgram','finish']){
    const proto=WebGL2RenderingContext.prototype,original=proto[method];
    proto[method]=function(...args){const start=performance.now();try{return original.apply(this,args);}finally{const ms=performance.now()-start,s=__audit.gl[method]||(__audit.gl[method]={calls:0,ms:0,maxMs:0,bytesSubmitted:0});s.calls++;s.ms+=ms;s.maxMs=Math.max(s.maxMs,ms);if(method==='bufferData')s.bytesSubmitted+=typeof args[1]==='number'?args[1]:args[1]?.byteLength||0;if(method==='bufferSubData')s.bytesSubmitted+=args[2]?.byteLength||0;}};
   }
  });
  const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>window.__load&&JSON.parse(render_game_to_text()).assets.course.ready);
  const before=await page.evaluate(()=>({time:performance.now(),images:__audit.images.length}));
  await page.evaluate(()=>{const t=__load,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:690});window.__loadStart=performance.now();t.render();});
  await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  const {profile}=await cdp.send('Profiler.stop');fs.writeFileSync(out+'/startup.cpuprofile',JSON.stringify(profile));
  const nodes=new Map(profile.nodes.map(n=>[n.id,n])),totals=new Map();for(let i=0;i<profile.samples.length;i++){const f=nodes.get(profile.samples[i]).callFrame,key=f.functionName+' '+f.url.split('/').pop()+':'+(f.lineNumber+1);totals.set(key,(totals.get(key)||0)+profile.timeDeltas[i]/1000);}
  const report=await page.evaluate(async()=>{
   __audit.done=true;const {renderer,world,compositor,parallax}=__resourceScene(),stats=RCScene3D.stats(),geometries=new Set(),textures=new Set(),materials=new Set(),groups={};
   function geometryBytes(g){const arrays=new Set();for(const a of Object.values(g.attributes))arrays.add(a.data?.array||a.array);if(g.index)arrays.add(g.index.array);for(const attrs of Object.values(g.morphAttributes))for(const a of attrs)arrays.add(a.data?.array||a.array);return [...arrays].reduce((s,a)=>s+a.byteLength,0);}
   function scan(root,category){root?.traverse(o=>{if(o.geometry&&!geometries.has(o.geometry)){geometries.add(o.geometry);const label=o.isSkinnedMesh?'skinnedActor':category;const g=groups[label]||(groups[label]={geometries:0,bytes:0,triangles:0});g.geometries++;g.bytes+=geometryBytes(o.geometry);g.triangles+=(o.geometry.index?.count||o.geometry.attributes.position?.count||0)/3;}for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});}
   scan(world,'world');scan(compositor,'compositor');scan(parallax?.scene,'parallax');
   const textureList=[...textures].map(t=>({name:t.name||t.image?.src?.split('/').pop()||t.type,width:t.image?.width||0,height:t.image?.height||0,mipmaps:t.generateMipmaps,rgbaEstimateBytes:(t.image?.width||0)*(t.image?.height||0)*4*(t.generateMipmaps?4/3:1)})).sort((a,b)=>b.rgbaEstimateBytes-a.rgbaEstimateBytes);
   const objectKinds={};for(const o of stats.pixelWorld?.objects||[])objectKinds[o.kind]=(objectKinds[o.kind]||0)+1;if(stats.pixelWorld)delete stats.pixelWorld.objects;
   return {sceneReadyMs:performance.now()-__loadStart,loadStart:__loadStart,stats,objectKinds,rendererMemory:renderer.info.memory,programs:renderer.info.programs.length,materials:materials.size,geometry:groups,textures:textureList,art:await __resourceArt(),audit:__audit};
  });
  report.beforeScene=before;report.cpu=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,35);report.metrics=(await cdp.send('Performance.getMetrics')).metrics;report.errors=errors;
  fs.writeFileSync(out+'/hardware.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({readyMs:report.sceneReadyMs,stats:report.stats,objectKinds:report.objectKinds,memory:report.rendererMemory,programs:report.programs,materials:report.materials,geometry:report.geometry,textureMiB:report.textures.reduce((s,t)=>s+t.rgbaEstimateBytes,0)/1048576,topTextures:report.textures.slice(0,8),imageCount:report.audit.images.length,imageMiB:report.audit.images.reduce((s,i)=>s+i.width*i.height*4,0)/1048576,artTextures:report.art.textures.length,artCanvasMiB:report.art.textures.reduce((s,i)=>s+i.width*i.height*4,0)/1048576,maxLoadingGap:Math.max(...report.audit.frames),longTasks:report.audit.tasks.filter(t=>t.start>=report.loadStart).sort((a,b)=>b.ms-a.ms).slice(0,8),gl:report.audit.gl,cpu:report.cpu.slice(0,18),metrics:report.metrics.filter(m=>/JSHeap/.test(m.name)),errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
