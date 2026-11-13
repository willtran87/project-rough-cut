const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/final-cut/visual-ground/profile-${software?'software':'hardware'}.json`;
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});try{
 const results=[],errors=[];
 for(const finish of [false,true]){
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(!finish){const source=fs.readFileSync('web/final-cut-scene.js','utf8');assert(source.includes('const groundFinish=finishFinalCutGround(materials);'));await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('const groundFinish=finishFinalCutGround(materials);','const groundFinish={stats:()=>({disabled:true}),dispose(){}};')}));}
  await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  for(const [name,x,y,yaw,pitch,cut]of [['edge',-20.5,35,-.89,.55,true],['overlook',-2,0,0,.16,true],['standing-rough',-16,20.2,0,.1,false]]){
   const result=await p.evaluate(async({x,y,yaw,pitch,cut})=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:cut?SECTORS.map(s=>s.id):[]});r.mode='playing';Object.assign(r.player,{x,y,yaw,pitch});Object.assign(r.rig,{x:39,y:50,phase:'disabled'});__finalCut.run=r;await advanceTime(0);
    const gl=document.querySelector('#game').getContext('webgl2'),values=[];let first;
    for(let i=0;i<36;i++){r.player.yaw=yaw+(i%12)*.002;r.time+=1/60;const t=performance.now();__finalCut.draw();gl.finish();const ms=performance.now()-t;if(i>=12)values.push(ms);if(i===11)first=JSON.parse(render_game_to_text()).graphics;await new Promise(requestAnimationFrame);}
    values.sort((a,b)=>a-b);const last=JSON.parse(render_game_to_text()).graphics;return {median:values[12],p95:values[22],samples:values,render:[last.width,last.height],resources:[first.geometries,first.textures,last.geometries,last.textures],draws:last.draws,triangles:last.triangles,gpu:last.gpu};
   },{x,y,yaw,pitch,cut});assert.equal(result.resources[0],result.resources[2]);assert.equal(result.resources[1],result.resources[3]);results.push({finish,name,...result});
  }await p.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out,JSON.stringify({passed:true,software,errors,results,method:'Same current geometry/turf/ceiling materials, with only groundFinish disabled via test interception for baseline. Twelve warmup and 24 timed JS draw plus gl.finish calls per fixture. No asynchronous presentation fence is timed; this is not GPU completion, full gameplay FPS, or the complete FV71 budget.'},null,2));console.log(JSON.stringify({out,results:results.map(r=>[r.finish,r.name,r.median,r.p95])}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
