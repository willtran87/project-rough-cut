const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const software=process.argv.includes('--software'),rows=[],errors=[];
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  // Alternate order on a second pair to expose warm-up/order effects. Each
  // variant has the same viewport, camera, simulation time and other assets.
  for(const baseline of [true,false,false,true]){
   const p=await browser.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   if(baseline){
    await p.route('**/under-green-ground-finish.js',r=>r.fulfill({contentType:'application/javascript',body:'export function finishDrainGround(){return {stats:{},dispose(){}};}'}));
    await p.route('**/under-green-atmosphere.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade/pass3-source/under-green-atmosphere.js','utf8')}));
   }
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
   const samples=await p.evaluate(async()=>{
    const {createRun}=await import('./under-green-sim.js'),r=createRun(),gl=document.querySelector('#game').getContext('webgl2');r.mode='playing';r.joe.phase='absent';r.time=0;r.elapsed=0;__underGreen.run=r;__underGreen.clearInput();const out=[];
    for(const [name,x,y,yaw,pitch]of [['entrance',0,8,0,-.5],['pump',-23.5,42,-1,-.6],['range',21,30,Math.PI,-.5]]){
     Object.assign(r.player,{x,y,yaw,pitch});const ms=[];
     for(let i=0;i<140;i++){
      await __underGreen.whenPresented();const start=performance.now();advanceTime(0);gl.finish();const duration=performance.now()-start;if(i>=40)ms.push(duration);
      if(i%20===0)await new Promise(resolve=>setTimeout(resolve,0));
     }
     ms.sort((a,b)=>a-b);const state=JSON.parse(render_game_to_text());out.push({name,p50:ms[50],p95:ms[95],samples:ms.length,resolution:state.graphics.resolution,draws:state.graphics.draws,triangles:state.graphics.triangles,textures:state.graphics.textures});
    }
    return out;
   });rows.push({baseline,samples});await p.close();
  }
  assert.deepEqual(errors,[]);const report={software,method:'Timed JS draw and gl.finish call; asynchronous presentation-fence waits excluded. Static fixtures, 40 warm-up + 100 measured frames. This is a relative draw-submission-cost probe, not gameplay frame pacing or the full performance acceptance gate.',rows,errors};
  fs.writeFileSync('output/under-green/visual-upgrade/ground'+(software?'-software':'')+'/profile.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
