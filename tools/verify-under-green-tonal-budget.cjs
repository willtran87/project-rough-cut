const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass28-budget/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),pages=[],errors=[],results=[];
 try{
  for(const enabled of [false,true]){
   const p=await b.newPage({viewport:{width:software?960:2560,height:software?600:1600}});p.on('pageerror',e=>errors.push(e.stack));pages.push(p);
   await p.route('**/under-green-scene.js',r=>{const s=fs.readFileSync('web/under-green-scene.js','utf8'),marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));return r.fulfill({contentType:'application/javascript',body:s.replace(marker,' window.__tonalProbe={renderer,scene};'+marker)});});
   // Compare actual shader variants; zero-strength uniforms would still run
   // the same arithmetic and cannot measure the cost of the added grade.
   if(!enabled)await p.route('**/under-green-tonal-grade.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-tonal-grade.js','utf8').replace('const strength=.42;','const strength=0;')}));
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  }
  for(const [name,x,y,yaw,pitch]of [['gallery',0,12,0,.05],['pump',-23.4,42,-1,.05]]){
   for(const p of pages)await p.evaluate(async({x,y,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=26.3;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{x,y,yaw,pitch});
   async function frame(i){return pages[i].evaluate(async()=>{const gl=__tonalProbe.renderer.getContext(),start=performance.now();advanceTime(0);const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;do{status=gl.clientWaitSync(f,0,0);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');if(status===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));if(performance.now()-start>10000)throw Error('GPU timeout');}while(status===gl.TIMEOUT_EXPIRED);gl.deleteSync(f);return performance.now()-start;});}
   for(let n=0;n<6;n++){await frame(0);await frame(1);}
   const samples=[[],[]];for(let n=0;n<24;n++)for(const i of n%2?[1,0]:[0,1])samples[i].push(await frame(i));
   const stats=[];for(let i=0;i<2;i++){
    const g=await pages[i].evaluate(()=>{const g=JSON.parse(render_game_to_text()).graphics,materials=new Set();__tonalProbe.scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});const water=[...materials].filter(m=>m.userData.drainColorRole==='water');return {draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,resolution:g.resolution,grade:g.tonalGrade,waterMaterials:water.length,gradedWater:water.filter(m=>m.customProgramCacheKey().includes('drain-detail-grade')).length};});stats.push(g);assert(g.waterMaterials>0);assert.equal(g.gradedWater,0);await pages[i].screenshot({path:`${out}/${i?'on':'off'}-${name}.png`});
   }
   for(const key of ['draws','triangles','textures','programs'])assert.equal(stats[0][key],stats[1][key]);
   const summarize=s=>{const v=[...s].sort((a,b)=>a-b);return {median:v[12],p95:v[22],samples:s};};results.push({name,off:summarize(samples[0]),on:summarize(samples[1]),stats});fs.writeFileSync(out+'/progress.json',JSON.stringify({completed:results.map(r=>r.name)}));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,results,errors},null,2));console.log(JSON.stringify({passed:true,software,results:results.map(r=>({name:r.name,off:r.off.median,on:r.on.median}))}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
