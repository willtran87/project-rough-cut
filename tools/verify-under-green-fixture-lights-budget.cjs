const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const moving=process.argv.includes('--moving'),software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass71/budget/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),pages=[],errors=[],results=[];
 try{
  for(const enabled of [false,true]){
   const p=await b.newPage({viewport:{width:software?960:2560,height:software?600:1600}});p.on('pageerror',e=>errors.push(e.stack));pages.push(p);
   for(const name of ['under-green-scene','under-green-pump-scene','under-green-release-scene'])await p.route('**/'+name+'.js',r=>{let s=fs.readFileSync(enabled?'web/'+name+'.js':'output/under-green/visual-pass71/source/'+name+'-before.js','utf8');if(name==='under-green-scene'){const marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));s=s.replace(marker,' window.__tonalProbe={renderer,scene};'+marker);}return r.fulfill({contentType:'application/javascript',body:s});});
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  }
  for(const [name,x,y,yaw,pitch,elapsed]of [['gallery',0,8,0,.1,0],['crossing',0,19,0,-.05,0],['pump',-25.7,40,Math.PI/2,-.27,0],['range',12,35,Math.PI,.05,0],['keeper',12,13.5,-2.4,.05,0]]){
   for(const p of pages)await p.evaluate(async({x,y,yaw,pitch,elapsed})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=26.3;r.elapsed=elapsed;r.joe.phase='absent';r.gate=1;Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{x,y,yaw,pitch,elapsed});
   async function frame(i,step=0){return pages[i].evaluate(async({moving,step,yaw})=>{if(moving)__underGreen.run.player.yaw=yaw+Math.sin(step*.15)*.4;const gl=__tonalProbe.renderer.getContext(),start=performance.now();advanceTime(0);const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;do{status=gl.clientWaitSync(f,0,0);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');if(status===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));if(performance.now()-start>10000)throw Error('GPU timeout');}while(status===gl.TIMEOUT_EXPIRED);gl.deleteSync(f);return performance.now()-start;},{moving,step,yaw});}
   for(let n=0;n<6;n++){await frame(0,n);await frame(1,n);}
   const samples=[[],[]];for(let n=0;n<24;n++)for(const i of n%2?[1,0]:[0,1])samples[i].push(await frame(i,n));
   const stats=[];for(let i=0;i<2;i++){
    const g=await pages[i].evaluate(()=>{const g=JSON.parse(render_game_to_text()).graphics,missingColors=[];__tonalProbe.scene.traverse(o=>{if(o.isMesh&&!o.geometry.attributes.color)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.vertexColors)missingColors.push({name:o.name,type:m.type});});return {missingColors,draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,resolution:g.resolution,practicals:g.practicalLighting};});stats.push(g);await pages[i].screenshot({path:`${out}/${i?'on':'off'}-${name}.jpg`,quality:90});
   }
   assert.deepEqual(stats[1].missingColors,[]);
   const summarize=s=>{const v=[...s].sort((a,b)=>a-b);return {median:v[12],p95:v[22],samples:s};};results.push({name,off:summarize(samples[0]),on:summarize(samples[1]),stats});fs.writeFileSync(out+'/progress.json',JSON.stringify({completed:results.map(r=>r.name)}));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,moving,results,errors},null,2));console.log(JSON.stringify({passed:true,software,moving,results:results.map(r=>({name:r.name,off:r.off.median,on:r.on.median}))}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
