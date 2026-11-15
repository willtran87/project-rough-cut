const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),label=software?'software':'hardware';
const out='output/under-green/finite-lights';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/finite-light-material.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('tools/fixtures/under-green-finite-light-candidate.js','utf8')}));
  await p.route('**/under-green-scene.js',route=>{
   let source=fs.readFileSync('web/under-green-scene.js','utf8');
   const marker=' return {draw,drainJoeFootsteps:';assert(source.includes(marker));
   source=source.replace(marker,' window.__lightAudit={renderer,scene};'+marker);
   return route.fulfill({contentType:'application/javascript',body:source});
  });
  await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85,resolution:1})));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');
  await p.waitForFunction(()=>window.__lightAudit&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const result=await p.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{specializeFiniteLights}=await import('./finite-light-material.js');
   const renderer=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setSize(160,160);renderer.outputColorSpace=T.SRGBColorSpace;
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(60,1,.1,100);camera.position.set(0,0,12);
   scene.background=new T.Color(0x071317);scene.fog=new T.Fog(0x071317,8,32);scene.add(new T.HemisphereLight(0x718899,0x101915,.4));
   const light=new T.PointLight(0xffc680,3.7,16,1.3);scene.add(light);
   const geometry=new T.SphereGeometry(3,24,16),full=new T.MeshLambertMaterial({color:0x899a82}),fast=full.clone();
   specializeFiniteLights(fast);const hook=fast.onBeforeCompile;specializeFiniteLights(fast);const idempotent=hook===fast.onBeforeCompile;
   const clone=fast.clone(),cloneBefore=clone.onBeforeCompile;specializeFiniteLights(clone);const clonePrepared=cloneBefore!==clone.onBeforeCompile;
   const mesh=new T.Mesh(geometry,full);scene.add(mesh);const gl=renderer.getContext(),cases=[];
   function pixels(material){mesh.material=material;renderer.render(scene,camera);const data=new Uint8Array(160*160*4);gl.readPixels(0,0,160,160,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;}
   for(const reach of [0,4,9,16])for(const x of [0,3.99,4,4.01,12,40])for(const decay of [1.3,2]){
    light.position.set(x,2,4);light.distance=reach;light.decay=decay;
    const a=pixels(full),b=pixels(fast);let changed=0,max=0;
    for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)changed++;max=Math.max(max,d);}
    cases.push({reach,x,decay,changed,max});
   }
   geometry.dispose();full.dispose();fast.dispose();clone.dispose();renderer.dispose();
   return {cases,idempotent,clonePrepared};
  });
  assert(result.idempotent&&result.clonePrepared);assert(result.cases.every(c=>c.changed===0),JSON.stringify(result.cases.filter(c=>c.changed)));
  // Actual chapter views: compile both versions on the same meshes, then
  // compare GPU pixels at the same state/time. No simulation or light changes.
  const views=[];
  for(const [name,x,y,yaw,time]of [['roots',0,12,0,3],['bunker',-20,70,Math.PI,6],['range',12,36,Math.PI,90]]){
   const view=await p.evaluate(async({name,x,y,yaw,time,timing})=>{
    const {createRun}=await import('./under-green-sim.js'),{rangeY}=await import('./under-green-layout.js'),{specializeFiniteLights}=await import('./finite-light-material.js');
    const r=createRun(2);r.mode='playing';r.time=time;Object.assign(r.player,{x,y:x>6?rangeY(y):y,yaw});__underGreen.run=r;
    const {scene,renderer}=__lightAudit,gl=renderer.getContext(),materials=new Set();scene.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshLambertMaterial)materials.add(m);});
    window.__lightVariants??=[...materials].map(m=>{const full=[m.onBeforeCompile,m.customProgramCacheKey];specializeFiniteLights(m);return {m,full,fast:[m.onBeforeCompile,m.customProgramCacheKey]};});
    const select=key=>{for(const v of __lightVariants){[v.m.onBeforeCompile,v.m.customProgramCacheKey]=v[key];v.m.needsUpdate=true;}};
    function pixels(){advanceTime(0);const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return bytes;}
    select('full');for(let i=0;i<8;i++)advanceTime(0);
    const before=pixels();
    select('fast');
    const after=pixels();let changed=0,max=0;for(let i=0;i<before.length;i++){const d=Math.abs(before[i]-after[i]);if(d)changed++;max=Math.max(max,d);}
    const timings=[];
    if(timing){
     async function frame(){const started=performance.now();advanceTime(0);const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
      while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-started>10000)throw Error('GPU timing timeout');await new Promise(resolve=>setTimeout(resolve,2));}
      gl.deleteSync(fence);return performance.now()-started;
     }
     for(const key of ['full','fast','fast','full']){select(key);for(let i=0;i<4;i++)await frame();const samples=[];for(let i=0;i<16;i++)samples.push(await frame());const sorted=[...samples].sort((a,b)=>a-b);timings.push({shader:key,median:sorted[8],p95:sorted[15],samples});}
     select('fast');pixels();
    }
    window.__restoreLightAudit=()=>select('full');
    return {name,changed,max,resolution:[gl.drawingBufferWidth,gl.drawingBufferHeight],materials:materials.size,timings};
   },{name,x,y,yaw,time,timing:process.argv.includes('--timing')});
   views.push(view);await p.screenshot({path:`${out}/${label}-${name}.png`});await p.evaluate(()=>__restoreLightAudit());
   fs.writeFileSync(`${out}/${label}-partial.json`,JSON.stringify({passed:false,...result,views,errors},null,2));
   assert.equal(view.changed,0,JSON.stringify(view));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${label}.json`,JSON.stringify({passed:true,...result,views,errors},null,2));
  console.log(JSON.stringify({passed:true,label,boundaries:result.cases.length,views:views.map(v=>({...v,timings:v.timings.map(({samples,...t})=>t)}))}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
