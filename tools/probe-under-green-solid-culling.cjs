// Diagnostic integration of existing conservative opaque-cover projection.
// Runtime files remain unchanged while pixels and completed work are compared.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const focus=process.argv.includes('--focus'),conservative=process.argv.includes('--conservative');
const highPitch=process.argv.includes('--high-pitch');
const out='output/under-green/solid-culling-candidate'+(conservative?'/conservative':'')+(focus?'/focus':'')+(highPitch?'/high-pitch':'');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],rows=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(resolution=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({resolution,fov:85})),highPitch?1:.5);
  await p.route('**/course-batch-culling.js',route=>{
   let s=fs.readFileSync('web/course-batch-culling.js','utf8');const marker='if(p.visible)visible++;';assert(s.includes(marker));
   s=s.replace('!occlusion?.hidden(p.bounds)','true').replace('occlusion?.update(camera);','');
   s=s.replace(marker,'if(p.visible&&window.__hideSolid?.(p.bounds))p.visible=false;'+marker).replace('return {register,update,restore,','window.__solidEntries=entries;return {register,update,restore,');
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.route('**/under-green-scene.js',route=>{
   let s=fs.readFileSync('web/under-green-scene.js','utf8'),marker=' return {draw,drainJoeFootsteps:';assert(s.includes(marker));
   s=s.replace('batchCulling?.update(camera);','window.__solidUpdate?.(camera);batchCulling?.update(camera);').replace(marker,'window.__solidAudit={renderer,scene,camera,layout,batchCulling};'+marker);
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__solidAudit&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  await p.evaluate(async conservative=>{
   const T=await import('./vendor/three/three.module.js'),{createSolidOcclusion}=await import('./solid-occlusion.js'),a=__solidAudit;
   a.cover=createSolidOcclusion();const identity=new T.Matrix4(),matrix=new T.Matrix4(),prior=new T.Matrix4();let valid=false;
   for(const w of a.layout.walls){const h=w.covered?4.2:1.8,inset=.005;a.cover.add(new T.Box3(new T.Vector3(w.x-w.w/2+inset,inset,-w.y-w.d/2+inset),new T.Vector3(w.x+w.w/2-inset,h-inset,-w.y+w.d/2-inset)),identity);}
   window.__solidUpdate=camera=>{if(!window.__solidEnabled)return;camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);if(valid&&matrix.equals(prior))return;valid=true;prior.copy(matrix);a.cover.update(camera);};
   const ids=new WeakMap();a.hiddenBounds=[];
   window.__hideSolid=box=>{if(!window.__solidEnabled||(conservative&&Math.min(box.max.x-box.min.x,box.max.y-box.min.y,box.max.z-box.min.z)<.01)||!a.cover.hidden(box))return false;if(!ids.has(box)){ids.set(box,a.hiddenBounds.length);a.hiddenBounds.push(box);}return !window.__solidSubset||window.__solidSubset.has(ids.get(box));};
   a.select=value=>{window.__solidEnabled=value;a.batchCulling.restore();};
  },conservative);
  const fixtures=JSON.parse(fs.readFileSync('output/under-green/route-view-costs/fixtures.json','utf8')).fixtures;
  for(const f of fixtures.filter(f=>!focus||(f.scenario===1&&Math.round(f.state.elapsed)===42)||(f.scenario===2&&Math.round(f.state.elapsed)===30))){
   const row=await p.evaluate(({scenario,state,focus,highPitch})=>{
    if(highPitch){state.player.pitch=.85;state.player.eyeHeight=1.65;}
    __underGreen.run=state;advanceTime(0);const a=__solidAudit,gl=a.renderer.getContext(),bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);
    function frame(){const start=performance.now();advanceTime(0);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return performance.now()-start;}
    a.select(false);for(let i=0;i<2;i++)frame();const before=bytes.slice(),full=JSON.parse(render_game_to_text()).graphics;
    a.select(false);frame();let repeatedFullChanges=0;for(let i=0;i<bytes.length;i++)if(bytes[i]!==before[i])repeatedFullChanges++;
    a.select(true);frame();const culled=JSON.parse(render_game_to_text()).graphics;let changed=0,maxDifference=0;const pixels=[];for(let i=0;i<bytes.length;i++){const d=Math.abs(bytes[i]-before[i]);if(d){changed++;if(pixels.length<30)pixels.push({x:Math.floor(i/4)%gl.drawingBufferWidth,y:Math.floor(i/4/gl.drawingBufferWidth),channel:i%4,before:before[i],after:bytes[i]});}maxDifference=Math.max(maxDifference,d);}
    const isolated=[];
    if(changed&&focus){
     const differs=ids=>{window.__solidSubset=new Set(ids);a.select(true);frame();for(let i=0;i<bytes.length;i++)if(bytes[i]!==before[i])return true;return false;};
     const search=ids=>{if(!differs(ids))return;if(ids.length===1){const box=a.hiddenBounds[ids[0]];const entry=window.__solidEntries.find(e=>e.parts.some(p=>p.bounds===box));isolated.push({id:ids[0],material:entry?.mesh.name,bounds:{min:box.min.toArray(),max:box.max.toArray()}});return;}const mid=Math.floor(ids.length/2);search(ids.slice(0,mid));search(ids.slice(mid));};
     search(a.hiddenBounds.map((_,i)=>i));window.__solidSubset=null;
    }
    const runs=[];
    if([2,36,40,52,8].includes(Math.round(state.elapsed))){
     for(const enabled of [false,true,true,false]){a.select(enabled);for(let i=0;i<3;i++)frame();const samples=[];for(let i=0;i<12;i++)samples.push(frame());const sorted=samples.slice().sort((a,b)=>a-b);runs.push({enabled,median:sorted[6],p95:sorted[11],samples});}
    }
    return {scenario,seconds:state.elapsed,changed,maxDifference,repeatedFullChanges,pixels,isolated,full:{draws:full.draws,triangles:full.triangles},culled:{draws:culled.draws,triangles:culled.triangles},runs,occluders:a.cover.count()};
   },{...f,focus,highPitch});rows.push(row);fs.writeFileSync(`${out}/partial.json`,JSON.stringify({rows,errors},null,2));
   if(row.changed)await p.screenshot({path:`${out}/changed-${row.scenario}-${Math.round(row.seconds)}.png`});
   if(rows.length%20===0)console.log(JSON.stringify({views:rows.length,changed:rows.filter(r=>r.changed).length,last:row.runs.length?row.runs.map(({samples,...r})=>r):row.culled}));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({candidateOnly:true,rows,errors,method:'Conservative opaque wall hulls; full framebuffer equality, fixed-pose ABBA complete RGBA readback. Does not establish moving-camera cost or sustained FPS.'},null,2));
  console.log(JSON.stringify({views:rows.length,changed:rows.filter(r=>r.changed).map(({runs,...r})=>r),timings:rows.filter(r=>r.runs.length).map(r=>({scenario:r.scenario,seconds:r.seconds,full:r.full,culled:r.culled,runs:r.runs.map(({samples,...s})=>s)}))}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
