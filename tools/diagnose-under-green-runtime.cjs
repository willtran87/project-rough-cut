// Fixed views from complete pilot routes. Diagnostic timings, not FPS acceptance.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {sceneModule,instrumentScene}=require('./under-green-soak-hooks.cjs');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/runtime-fix/baseline';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const {traverse}=await import('./probe-under-green-folded.mjs'),fixtures=[];
 for(const [scenario,options]of [{dodge:true},{wet:true,dodge:true}].entries()){
  let next=0;const result=traverse({...options,view:{fov:85,aspect:1.6},inspect:r=>{if(r.elapsed<next)return;next+=1;const state=structuredClone(r);delete state.telemetry;fixtures.push({scenario,state});}});assert.equal(result.mode,'complete');
 }
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[];
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85,resolution:1}));window.__geometryUploads=[];window.__pose='startup';});
  await p.route(/\/three\.module\.js(?:\?.*)?$/,route=>{let s=fs.readFileSync('web/vendor/three/three.module.js','utf8');const mark='info.memory.geometries ++;';assert.equal(s.split(mark).length,2);s=s.replace(mark,mark+`window.__geometryUploads.push({pose:window.__pose,id:geometry.id,name:object.name,parent:object.parent?.name,type:geometry.type,vertices:geometry.attributes.position?.count,stack:new Error().stack.split('\\n').slice(1,5)});`);return route.fulfill({contentType:'application/javascript',body:s});});
  await p.route(sceneModule,route=>route.fulfill({contentType:'application/javascript',body:instrumentScene(fs.readFileSync('web/under-green-scene.js','utf8')).replace('window.__soakRenderer=renderer;','window.__soakRenderer=renderer;window.__diagnosticScene=scene;')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__soakRenderer&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  const cdp=await p.context().newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');
  for(const {scenario,state}of fixtures){
   const row=await p.evaluate(async({scenario,state})=>{
    window.__pose={scenario,seconds:state.elapsed};__underGreen.run=state;__underGreen.clearInput();
    const gl=__soakRenderer.getContext(),samples=[],cpu=[];
    for(let n=0;n<6;n++){
     const start=performance.now();advanceTime(0);const submit=performance.now(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
     while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('Fence timeout');await new Promise(r=>setTimeout(r,1));}gl.deleteSync(f);
     if(n>=3){samples.push(performance.now()-start);cpu.push(submit-start);}
    }
    const g=JSON.parse(render_game_to_text()).graphics;
    return {scenario,seconds:state.elapsed,player:{x:state.player.x,y:state.player.y,yaw:state.player.yaw},samples,cpu,draws:g.draws,triangles:g.triangles,resources:{...__soakRenderer.info.memory},lights:g.practicalLighting};
   },{scenario,state});rows.push(row);
   if(rows.length%25===0){console.log(JSON.stringify({views:rows.length,total:fixtures.length,last:row.seconds,geometries:row.resources.geometries}));fs.writeFileSync(out+'/partial.json',JSON.stringify({rows,errors}));}
  }
  const {profile}=await cdp.send('Profiler.stop');fs.writeFileSync(out+'/cpu.json',JSON.stringify(profile));
  const uploads=await p.evaluate(()=>__geometryUploads),counts=new Map();for(const id of profile.samples??[])counts.set(id,(counts.get(id)||0)+1);
  const hot=profile.nodes.map(n=>({function:n.callFrame.functionName,url:n.callFrame.url,line:n.callFrame.lineNumber+1,samples:counts.get(n.id)||0})).sort((a,b)=>b.samples-a.samples).slice(0,35);
  fs.writeFileSync(out+'/report.json',JSON.stringify({diagnosticOnly:true,rows,uploads,hot,errors},null,2));
  console.log(JSON.stringify({hot:hot.slice(0,15),lateUploads:uploads.filter(u=>u.pose?.scenario===1),errors}));assert.deepEqual(errors,[]);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
