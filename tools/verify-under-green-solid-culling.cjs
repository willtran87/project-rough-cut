const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/solid-culling';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({resolution:.5,fov:85})));
  await p.route('**/course-batch-culling.js',route=>{
   let s=fs.readFileSync('web/course-batch-culling.js','utf8');assert(s.includes('!occlusion?.hidden(p.bounds)')&&s.includes('occlusion?.update(camera);'));
   s=s.replace('!occlusion?.hidden(p.bounds)','!(window.__disableSolid?false:occlusion?.hidden(p.bounds))').replace('occlusion?.update(camera);','if(!window.__disableSolid)occlusion?.update(camera);');
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.route('**/under-green.js',route=>{const s=fs.readFileSync('web/under-green.js','utf8'),m='if(test)window.__underGreen={';assert(s.includes(m));return route.fulfill({contentType:'application/javascript',body:s.replace(m,'window.__solidPrefs=prefs;'+m)});});
  await p.route('**/under-green-scene.js',route=>{const s=fs.readFileSync('web/under-green-scene.js','utf8'),m=' return {draw,drainJoeFootsteps:';assert(s.includes(m));return route.fulfill({contentType:'application/javascript',body:s.replace(m,'window.__solidAudit={renderer,batchCulling,solidOcclusion};'+m)});});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__solidAudit&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const fixtures=JSON.parse(fs.readFileSync('output/under-green/route-view-costs/fixtures.json','utf8')).fixtures;
  async function compare(f,options={}){
   const row=await p.evaluate(({fixture,options})=>{
    const {scenario,state}=fixture;Object.assign(__solidPrefs,{fov:85,resolution:.5,...options});if(options.pitch!==undefined)state.player.pitch=options.pitch;if(options.eyeHeight!==undefined)state.player.eyeHeight=options.eyeHeight;
    __underGreen.run=state;const a=__solidAudit;advanceTime(0);const gl=a.renderer.getContext(),bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);
    const pixels=()=>{advanceTime(0);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return bytes.slice();};
    window.__disableSolid=true;a.batchCulling.restore();pixels();const before=pixels(),full=JSON.parse(render_game_to_text()).graphics;
    window.__disableSolid=false;a.batchCulling.restore();const after=pixels(),culled=JSON.parse(render_game_to_text()).graphics;
    let changed=0;for(let i=0;i<after.length;i++)if(after[i]!==before[i])changed++;
    __underGreen.inspectCameraClearance([]);const qa=a.batchCulling.stats(),resumed=pixels();let resumeChanges=0;for(let i=0;i<after.length;i++)if(after[i]!==resumed[i])resumeChanges++;
    advanceTime(0);return {scenario,seconds:state.elapsed,options,viewport:[innerWidth,innerHeight],resolution:culled.resolution,changed,resumeChanges,fullTriangles:full.triangles,culledTriangles:culled.triangles,restored:qa.parts===qa.visible,stationaryUploads:a.batchCulling.stats().indexValuesUploaded};
   },{fixture:f,options});views.push(row);fs.writeFileSync(`${out}/partial.json`,JSON.stringify({views,errors},null,2));assert.equal(row.changed,0,JSON.stringify(row));assert.equal(row.resumeChanges,0,JSON.stringify(row));assert(row.restored);assert.equal(row.stationaryUploads,0);return row;
  }
  for(const f of fixtures)await compare(f);
  console.log(JSON.stringify({routeViews:views.length,changed:0}));
  const selected=[[0,2],[1,42],[2,30],[3,8]].map(([s,t])=>fixtures.find(f=>f.scenario===s&&Math.round(f.state.elapsed)===t));
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const resolution of [.5,1])for(const fov of [45,58,85])for(const f of selected)await compare(f,{resolution,fov});
   await compare(selected[0],{resolution:1,fov:85});await p.screenshot({path:`${out}/roots-${width}.png`});console.log(JSON.stringify({width,views:views.length}));
  }
  await p.setViewportSize({width:2560,height:1600});
  for(const f of selected)for(const pitch of [-.85,.85])for(const eyeHeight of [1.12,1.65])await compare(f,{resolution:1,fov:85,pitch,eyeHeight});
  const motion=[];
  for(const f of [selected[0],fixtures.find(f=>f.scenario===0&&Math.round(f.state.elapsed)===36)]){
   const row=await p.evaluate(f=>{
    const a=__solidAudit,gl=a.renderer.getContext(),runs=[];Object.assign(__solidPrefs,{resolution:.5,fov:85});__underGreen.run=structuredClone(f.state);advanceTime(0);const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);
    for(const disabled of [true,false,false,true]){
     window.__disableSolid=disabled;__underGreen.run=structuredClone(f.state);a.batchCulling.restore();const origin={...f.state.player},samples=[],cpu=[];
     for(let i=0;i<68;i++){
      Object.assign(__underGreen.run.player,{x:origin.x+i*.004,y:origin.y+i*.015,yaw:origin.yaw+i*.002});
      const start=performance.now();advanceTime(0);const submitted=performance.now();gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);if(i>=4){samples.push(performance.now()-start);cpu.push(submitted-start);}
     }
     const sorted=samples.slice().sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);runs.push({disabled,median:sorted[32],p95:sorted[60],cpuMedian:cpu[32],samples});
    }
    return {scenario:f.scenario,seconds:f.state.elapsed,runs};
   },f);motion.push(row);console.log(JSON.stringify({...row,runs:row.runs.map(({samples,...r})=>r)}));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/verified.json`,JSON.stringify({passed:true,views,motion,errors,method:'Actual integration, optional cover disabled for A/B; exact full framebuffer equality and full QA restoration. Moving-view ABBA timings include CPU submission and full RGBA readback; not sustained FPS or physical-device acceptance.'},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
