// Map cost to actual views reached by the ordinary-input pilot. Fixed-pose
// complete framebuffer readback is diagnostic, not production FPS acceptance.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/route-view-costs';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const {traverse}=await import('./probe-under-green-folded.mjs');const fixtures=[],outcomes=[];
 for(const [scenario,options]of [{dodge:true},{wet:true,dodge:true},{sprint:true,dodge:true},{cp:3,dodge:true}].entries()){
  let next=0;
  const result=traverse({...options,inspect:r=>{if(r.elapsed<next)return;next+=2;const state=structuredClone(r);delete state.telemetry;fixtures.push({scenario,state});}});
  assert.equal(result.mode,'complete');outcomes.push({scenario,seconds:result.elapsed,waterHits:result.waterHits});
 }
 fs.writeFileSync(`${out}/fixtures.json`,JSON.stringify({outcomes,fixtures}));
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85,resolution:.5})));
  await p.route('**/under-green-scene.js',route=>{
   const source=fs.readFileSync('web/under-green-scene.js','utf8'),marker=' return {draw,drainJoeFootsteps:';assert(source.includes(marker));
   return route.fulfill({contentType:'application/javascript',body:source.replace(marker,' window.__routeRenderer=renderer;'+marker)});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__routeRenderer&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  for(const fixture of fixtures){
   const row=await p.evaluate(({scenario,state})=>{
    __underGreen.run=state;__underGreen.clearInput();advanceTime(0);
    const gl=__routeRenderer.getContext(),buffer=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);
    function frame(){const start=performance.now();advanceTime(0);const submitted=performance.now();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,buffer);return {cpu:submitted-start,completed:performance.now()-start};}
    for(let i=0;i<3;i++)frame();const samples=[];for(let i=0;i<8;i++)samples.push(frame());
    const sorted=samples.map(s=>s.completed).sort((a,b)=>a-b),cpu=samples.map(s=>s.cpu).sort((a,b)=>a-b),snapshot=JSON.parse(render_game_to_text()),g=snapshot.graphics;
    return {scenario,seconds:state.elapsed,district:snapshot.district,player:{x:state.player.x,y:state.player.y,yaw:state.player.yaw},joe:{x:state.joe.x,y:state.joe.y,phase:state.joe.phase},median:sorted[4],p95:sorted[7],cpuMedian:cpu[4],samples,draws:g.draws,triangles:g.triangles,actorCulled:g.actorCulled,water:g.water,resolution:g.resolution};
   },fixture);views.push(row);
   fs.writeFileSync(`${out}/partial.json`,JSON.stringify({outcomes,views,errors},null,2));
   if(views.length%20===0)console.log(JSON.stringify({views:views.length,total:fixtures.length,last:{scenario:row.scenario,seconds:row.seconds,median:row.median}}));
  }
  const ranked=views.slice().sort((a,b)=>b.median-a.median);
  for(const row of ranked.slice(0,4)){
   const fixture=fixtures.find(f=>f.scenario===row.scenario&&f.state.elapsed===row.seconds);await p.evaluate(f=>{__underGreen.run=f.state;advanceTime(0);},fixture);
   await p.screenshot({path:`${out}/slow-${row.scenario}-${Math.round(row.seconds)}.png`});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/report.json`,JSON.stringify({method:'Two-second snapshots from four actual simulation-pilot traversals. Three warmups/eight full RGBA readback frames per pose. Fixed 480x300 scene at 2560x1600/FOV85; captureBuffer=true. Diagnostic CPU submission/readback cost, not sustained FPS. Sequential view order and host variability can affect costs.',outcomes,views,errors},null,2));
  console.log(JSON.stringify({views:views.length,slowest:ranked.slice(0,12).map(({samples,water,...r})=>r),errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
