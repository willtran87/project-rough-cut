// Diagnostic draw omissions isolate component cost; omitted images are not candidates.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out='output/under-green/visual-pass80/profile';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--ignore-gpu-blocklist']}),errors=[],rows=[];
try{const p=await b.newPage({viewport:{width:960,height:600}});p.on('pageerror',e=>errors.push(e.stack));
await p.route('**/under-green-scene.js',r=>{let s=fs.readFileSync('web/under-green-scene.js','utf8'),mark=' return {draw,inspectCastShadow:';assert(s.includes(mark));s=s.replace(mark,' window.__cost={renderer,scene,camera};'+mark);return r.fulfill({contentType:'application/javascript',body:s});});
await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__cost&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
await p.evaluate(()=>{const a=__cost,original=a.renderer.renderBufferDirect.bind(a.renderer);a.omit='none';a.calls=[];a.renderer.renderBufferDirect=function(camera,scene,g,m,o,group){const name=o.name||o.parent?.name||m.type;const kind=m.transparent?'transparent':m.isMeshPhongMaterial?'phong':m.isMeshLambertMaterial?'lambert':'other';const skip=a.omit===kind||a.omit==='roots'&&name==='root'||a.omit==='ground'&&/floor|mudBank|bankEarth|walkway|sand|ceiling/.test(name)||a.omit==='walls'&&/stone|Stone|galleryRender|galleryWall/.test(name);a.calls.push({name,kind,skip,triangles:(g.index?.count||g.attributes.position.count)/3,program:m.customProgramCacheKey()});if(!skip)return original(camera,scene,g,m,o,group);};});
for(const [name,x,y,yaw]of [['gallery',0,8,0],['crossing',0,19,0],['keeper',12,13.5,-2.4]]){
await p.evaluate(async({x,y,yaw})=>{const {createRun}=await import('./under-green-sim.js');let r=createRun();r.mode='playing';r.time=26.3;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch:.1});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{x,y,yaw});
for(const omit of ['none','phong','lambert','transparent','roots','ground','walls']){
const result=await p.evaluate(async omit=>{__cost.omit=omit;const gl=__cost.renderer.getContext(),samples=[],cpu=[];for(let n=0;n<16;n++){__cost.calls=[];const start=performance.now();advanceTime(0);const submit=performance.now(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;do{status=gl.clientWaitSync(f,0,0);if(status===gl.WAIT_FAILED)throw Error('fence failed');if(performance.now()-start>10000)throw Error('timeout');if(status===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));}while(status===gl.TIMEOUT_EXPIRED);gl.deleteSync(f);if(n>=4){samples.push(performance.now()-start);cpu.push(submit-start);}}return {samples,cpu,calls:__cost.calls,graphics:JSON.parse(render_game_to_text()).graphics};},omit);
const sorted=[...result.samples].sort((a,b)=>a-b),row={name,omit,median:sorted[6],p95:sorted[11],...result};rows.push(row);console.log(JSON.stringify({name,omit,median:row.median,p95:row.p95,cpu:result.cpu.sort((a,b)=>a-b)[6]}));fs.writeFileSync(out+'/progress.json',JSON.stringify({rows,errors},null,2));
}
await p.evaluate(()=>{__cost.omit='none';advanceTime(0);});await p.screenshot({path:out+'/'+name+'.jpg',quality:90});
}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({diagnosticOnly:true,rows,errors},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
