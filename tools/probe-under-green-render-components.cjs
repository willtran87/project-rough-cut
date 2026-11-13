// Component omissions are diagnostic only; none of these variants may ship.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/route-view-costs/components';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],rows=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({resolution:.5,fov:85})));
  await p.route('**/under-green-scene.js',route=>{
   let s=fs.readFileSync('web/under-green-scene.js','utf8');const marker=' return {draw,drainJoeFootsteps:';assert(s.includes(marker));
   s=s.replace('renderer.render(backdrop.scene,backdrop.camera);',"if(window.__omitComponent!=='backdrop')renderer.render(backdrop.scene,backdrop.camera);")
    .replace('const actorVisible=joe.root.visible;',"if(window.__omitComponent==='actor')joe.root.visible=false;const actorVisible=joe.root.visible;")
    .replace('renderStarted=performance.now();',"for(const l of [...lampLights,playerLight])l.visible=window.__omitComponent!=='point-lights';renderStarted=performance.now();")
    .replace(marker,'window.__componentRenderer=renderer;'+marker);
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.route('**/under-green-water.js',route=>{
   let s=fs.readFileSync('web/under-green-water.js','utf8'),marker='if(count)drops.instanceMatrix.needsUpdate=true;';assert(s.includes(marker));
   s=s.replace(marker,marker+"if(window.__omitComponent==='water'){for(const v of surfaces)v.group.visible=false;drops.visible=false;}");
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__componentRenderer&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const fixtures=JSON.parse(fs.readFileSync('output/under-green/route-view-costs/fixtures.json','utf8')).fixtures;
  for(const [scenario,second]of [[0,2],[0,36],[3,8]])for(const component of ['backdrop','water','actor','point-lights']){
   const f=fixtures.find(f=>f.scenario===scenario&&Math.round(f.state.elapsed)===second);assert(f);
   const row=await p.evaluate(({scenario,state,component})=>{
    __underGreen.run=state;advanceTime(0);const gl=__componentRenderer.getContext(),bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4),runs=[];
    const frame=()=>{const start=performance.now();advanceTime(0);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return performance.now()-start;};
    for(const omitted of [false,true,true,false]){window.__omitComponent=omitted?component:null;for(let i=0;i<6;i++)frame();const samples=[];for(let i=0;i<16;i++)samples.push(frame());const sorted=samples.slice().sort((a,b)=>a-b);runs.push({omitted,median:sorted[8],p95:sorted[15],samples});}
    return {scenario,seconds:state.elapsed,component,runs};
   },{...f,component});rows.push(row);fs.writeFileSync(`${out}/partial.json`,JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({...row,runs:row.runs.map(({samples,...r})=>r)}));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({diagnosticOnly:true,method:'ABBA full framebuffer readback; omissions change visuals and cannot qualify a runtime change.',rows,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
