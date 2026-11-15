const fs=require('node:fs');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage();
  await p.route('**/under-green-actor.js?footwork-baseline',route=>route.fulfill({contentType:'application/javascript',body:require('./under-green-actor-baseline.cjs')(fs.readFileSync('web/under-green-actor.js','utf8'))}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');
  await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));
  const result=await p.evaluate(async()=>{
   const THREE=await import('./vendor/three/three.module.js');
   const current=await import('./under-green-actor.js'),baseline=await import('./under-green-actor.js?footwork-baseline');
   const {createRun}=await import('./under-green-sim.js');
   const materials=Object.fromEntries(['red','iron','brass','rubber','steel','lamp'].map(k=>[k,new THREE.MeshLambertMaterial()]));
   const scene=new THREE.Scene(),rows=[];
   for(const [variant,module]of [['baseline',baseline],['current',current]]){
   const actor=await module.createTrimmerJoe(scene,materials),r=createRun();r.mode='playing';let frame=0;
   function update(kind){
    r.time=++frame/60;r.joe.age=r.time;r.joe.phase=kind==='walk'?'walk':'turn';r.joe.speed=kind==='walk'?2.1:0;
    if(kind==='walk'){r.joe.y+=2.1/60;r.joe.walk+=2.1/60;r.joe.turnRate=0;}
    else{r.joe.yaw+=1.2/60;r.joe.turnRate=1.2;r.joe.turnDistance=(r.joe.turnDistance||0)+.004;}
    actor.update(r,false);actor.drainFootsteps?.();
   }
   for(const kind of ['walk','turn']){
    for(let i=0;i<200;i++)update(kind);
    const samples=[];
    for(let batch=0;batch<12;batch++){
     const start=performance.now();for(let i=0;i<500;i++)update(kind);samples.push((performance.now()-start)/500);
    }
    samples.sort((a,b)=>a-b);rows.push({variant,kind,batches:12,updatesPerBatch:500,medianMs:samples[6],p95BatchMeanMs:samples[11],samples});
   }
   actor.dispose();
   }
   Object.values(materials).forEach(m=>m.dispose());
   return {method:'Isolated actor update CPU time; baseline is pre-footwork; current includes leg IK, sole constraints and contact detection; excludes GPU and scene update. Batch means are not frame-time percentiles.',userAgent:navigator.userAgent,rows};
  });
  fs.mkdirSync('output/under-green/footstep-audio',{recursive:true});fs.writeFileSync('output/under-green/footstep-audio/actor-profile.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
