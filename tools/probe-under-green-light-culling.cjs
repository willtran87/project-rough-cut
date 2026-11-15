// Candidate evaluation in one warmed context; no production source mutation.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const variant=process.argv.find(a=>a.startsWith('--variant='))?.slice(10)||'light';assert(['light','geometry','both'].includes(variant));
const out=`output/under-green/light-culling/${variant}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85,resolution:2/3})));
  await p.route('**/under-green-scene.js',route=>{
   let source=fs.readFileSync('web/under-green-scene.js','utf8');
   const expose=' return {draw,drainJoeFootsteps:',update='playerLight.position.copy(camera.position);';
   assert(source.includes(expose)&&source.includes(update));
   if(!source.includes('import {createCourseBatchCulling}'))source="import {createCourseBatchCulling} from './course-batch-culling.js';\n"+source;
   source=source.replace('const batchCulling=software?createCourseBatchCulling():null;','const batchCulling=null;');
   assert(source.includes('const structureMeshes=[],')&&source.includes('mesh.name=batch.type;'));
   source=source.replace('const structureMeshes=[],','const geometryCulling=createCourseBatchCulling(),cullingPieces=new Map();const structureMeshes=[],')
    .replace('mesh.name=batch.type;','geometry.computeBoundingBox();cullingPieces.set(mesh,geometryCulling.register(mesh,batch.parts));mesh.name=batch.type;');
   source=source.replace(expose,' window.__ugLight={renderer,scene,camera,structureMeshes,geometryCulling,cullingPieces,lights:[...lampLights,playerLight]};'+expose)
    .replace(update,update+'window.__ugLightUpdate?.();');
   return route.fulfill({contentType:'application/javascript',body:source});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');
  await p.waitForFunction(()=>window.__ugLight&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  await p.evaluate(async variant=>{
   const {createLocalLightCulling}=await import('./local-light-culling.js');
   const a=__ugLight;a.culling=createLocalLightCulling();a.full=[];
   for(const mesh of a.structureMeshes){mesh.geometry.computeBoundingBox();a.full.push([mesh,mesh.material]);a.culling.register(mesh,a.cullingPieces.get(mesh));}
   a.scene.add(a.culling.preparation);await a.renderer.compileAsync(a.scene,a.camera);a.scene.remove(a.culling.preparation);
   window.__ugLightUpdate=()=>{if(a.enabled){if(variant!=='light')a.geometryCulling.update(a.camera);if(variant!=='geometry')a.culling.update(a.lights);}};
   a.select=enabled=>{a.enabled=enabled;a.geometryCulling.restore();if(enabled){if(variant!=='geometry')a.culling.update([]);__ugLightUpdate();}else for(const [m,material]of a.full)m.material=material;};
  },variant);
  for(const [name,x,y,yaw,time]of [
   ['roots',0,12,0,3],['junction',0,38,Math.PI/2,5],['bunker',-20,70,Math.PI,6],
   ['pump',-20,40,-Math.PI/2,30],['range',12,36,Math.PI,90],['keeper',12,13,Math.PI,6],
  ]){
   const result=await p.evaluate(async({name,x,y,yaw,time})=>{
    const {createRun}=await import('./under-green-sim.js'),{rangeY}=await import('./under-green-layout.js');
    const r=createRun(2);r.mode='playing';r.time=time;Object.assign(r.player,{x,y:x>6?rangeY(y):y,yaw});__underGreen.run=r;
    const a=__ugLight,gl=a.renderer.getContext();
    function pixels(){advanceTime(0);const data=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;}
    a.select(false);for(let i=0;i<8;i++)pixels();const before=pixels();a.select(true);const after=pixels();
    let changed=0,max=0;for(let i=0;i<before.length;i++){const d=Math.abs(before[i]-after[i]);if(d)changed++;max=Math.max(max,d);}
    const timings=[];
    async function frame(){const started=performance.now();advanceTime(0);const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-started>10000)throw Error('GPU timed out');await new Promise(resolve=>setTimeout(resolve,2));}gl.deleteSync(fence);return performance.now()-started;}
    for(const enabled of [false,true,true,false]){a.select(enabled);for(let i=0;i<4;i++)await frame();const samples=[];for(let i=0;i<16;i++)samples.push(await frame());const sorted=[...samples].sort((a,b)=>a-b);timings.push({enabled,median:sorted[8],p95:sorted[15],samples});}
    a.select(true);const final=pixels();let finalChanged=0;for(let i=0;i<before.length;i++)if(before[i]!==final[i])finalChanged++;
    return {name,changed,max,finalChanged,timings,culling:a.culling.stats(),geometryCulling:a.geometryCulling.stats(),graphics:JSON.parse(render_game_to_text()).graphics};
   },{name,x,y,yaw,time});
   views.push(result);await p.screenshot({path:`${out}/${name}.png`});
   fs.writeFileSync(`${out}/probe.json`,JSON.stringify({passed:views.every(v=>v.changed===0&&v.finalChanged===0)&&errors.length===0,views,errors},null,2));
   console.log(JSON.stringify({name,changed:result.changed,max:result.max,culling:result.culling,timings:result.timings.map(({samples,...t})=>t)}));
  }
  assert.deepEqual(errors,[]);assert(views.every(v=>v.changed===0&&v.finalChanged===0),'Candidate changed pixels; inspect probe.json');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
