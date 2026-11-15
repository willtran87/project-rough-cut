const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/back-nine-experience/buffer-budget',baseline=process.argv.includes('--baseline'),software=process.argv.includes('--software'),label=(software?'software':'hardware')+(baseline?'-baseline':'-candidate');
 fs.mkdirSync(out+'/baseline-source',{recursive:true});
 for(const f of ['course-render-preparation.js','back-nine.html'])if(!fs.existsSync(out+'/baseline-source/'+f))fs.copyFileSync('web/'+f,out+'/baseline-source/'+f);
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers={calls:0,bytes:0,batches:[]};const original=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(target,data,...args){__buffers.calls++;__buffers.bytes+=typeof data==='number'?data:data?.byteLength||0;return original.call(this,target,data,...args);};});
  let source=fs.readFileSync((baseline?out+'/baseline-source':'web')+'/course-render-preparation.js','utf8');
  source=source.replace('renderer.render(warm,camera);batches++;','const beforeBytes=__buffers.bytes,beforeCalls=__buffers.calls,begin=performance.now();renderer.render(warm,camera);__buffers.batches.push({reported:bytes,actual:__buffers.bytes-beforeBytes,calls:__buffers.calls-beforeCalls,meshes:group.children.length,ms:performance.now()-begin});batches++;');
  assert(source.includes('beforeBytes=__buffers.bytes'),'Instrumentation must match current source');
  await p.route('**/course-render-preparation.js*',r=>r.fulfill({contentType:'application/javascript',body:source}));
  const start=Date.now();await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  const elapsed=Date.now()-start,result=await p.evaluate(()=>({buffers:__buffers,graphics:JSON.parse(render_game_to_text()).graphics}));
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${label}-${Date.now()}.json`,JSON.stringify({label,elapsed,...result,errors},null,2));
  console.log(JSON.stringify({label,elapsed,batches:result.buffers.batches.length,reported:result.buffers.batches.reduce((s,b)=>s+b.reported,0),actual:result.buffers.batches.reduce((s,b)=>s+b.actual,0),maxActual:Math.max(...result.buffers.batches.map(b=>b.actual)),uploads:result.buffers.calls,programs:result.graphics.programs,textures:result.graphics.textures}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
