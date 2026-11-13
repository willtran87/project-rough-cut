const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/signal-batches-candidate';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],rows=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({resolution:.5,fov:85})));
  await p.route('**/under-green-signal-batches.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('tools/fixtures/under-green-signal-batches.js','utf8')}));
  await p.route('**/under-green-scene.js',route=>{
   let s=fs.readFileSync('web/under-green-scene.js','utf8');
   const marker=' return {draw,drainJoeFootsteps:',draw='renderStarted=performance.now();';assert(s.includes(marker)&&s.includes(draw));
   s=s.replace(draw,'window.__updateSignalBatches?.();'+draw).replace(marker,'window.__signalAudit={scene,renderer,waterObjects,materials};'+marker);
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__signalAudit&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  await p.evaluate(async()=>{const {createBankSignalBatches}=await import('./under-green-signal-batches.js');const a=__signalAudit;a.batches=createBankSignalBatches(a.scene,a.waterObjects,a.materials);window.__updateSignalBatches=()=>a.batches.update(!!window.__batchSignals);});
  const fixtures=JSON.parse(fs.readFileSync('output/under-green/route-view-costs/fixtures.json','utf8')).fixtures;
  const selected=[[0,2],[0,36],[1,40],[1,52],[3,8]];
  for(const [scenario,second]of selected){
   const f=fixtures.find(f=>f.scenario===scenario&&Math.round(f.state.elapsed)===second);assert(f);
   const row=await p.evaluate(({scenario,state})=>{
    __underGreen.run=state;advanceTime(0);const gl=__signalAudit.renderer.getContext(),bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);
    function frame(){const start=performance.now();advanceTime(0);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return performance.now()-start;}
    window.__batchSignals=false;for(let i=0;i<3;i++)frame();const before=bytes.slice();window.__batchSignals=true;frame();let changed=0,maxDifference=0;for(let i=0;i<bytes.length;i++){const d=Math.abs(bytes[i]-before[i]);if(d)changed++;maxDifference=Math.max(maxDifference,d);}
    const runs=[];
    for(const enabled of [false,true,true,false]){window.__batchSignals=enabled;for(let i=0;i<3;i++)frame();const samples=[];for(let i=0;i<16;i++)samples.push(frame());const sorted=samples.slice().sort((a,b)=>a-b);runs.push({enabled,median:sorted[8],p95:sorted[15],draws:JSON.parse(render_game_to_text()).graphics.draws,samples,batches:__signalAudit.batches.stats()});}
    return {scenario,seconds:state.elapsed,changed,maxDifference,runs};
   },f);rows.push(row);fs.writeFileSync(`${out}/partial.json`,JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({...row,runs:row.runs.map(({samples,...r})=>r)}));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({rows,errors,method:'Candidate only; complete RGBA readback ABBA comparisons of selected real route poses. Not sustained FPS.'},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
