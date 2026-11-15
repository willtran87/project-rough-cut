const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/under-green/footwork',errors=[];fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  const samples=await p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js');const rows=[];
   for(const fps of [60,30,15])for(const kind of ['slow-turn','fast-turn','reverse-turn','stop-resume','attack','reduced-turn']){
    const r=createRun();r.mode='playing';Object.assign(r.player,{x:2,y:56,yaw:Math.PI+.5,pitch:-.15});Object.assign(r.joe,{x:0,y:53,yaw:0,phase:'turn',speed:0,walk:0});__underGreen.run=r;__underGreen.clearInput();
    if(kind==='reduced-turn'){const input=document.getElementById('reduced');input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}
    for(let frame=0;frame<fps*3;frame++){
     const time=frame/fps,j=r.joe;r.time=time;j.age=time;
     if(kind.includes('turn')){
      const rate=kind==='slow-turn'?.65:2.4,sign=kind==='reverse-turn'&&time>=1.5?-1:1;j.turnRate=rate*sign;if(frame)j.yaw+=j.turnRate/fps;j.turnDistance=(j.turnDistance||0)+rate/fps*.2;
     }else if(kind==='stop-resume'){
      j.speed=time<35/60||time>=95/60?2.1:0;j.phase=j.speed?'walk':'water-wait';if(frame&&j.speed){j.y+=j.speed/fps;j.walk+=j.speed/fps;}
     }else{
      j.phase=time<.95?'windup':time<1.4?'sweep':'recover';j.age=time<.95?time:time<1.4?time-.95:time-1.4;j.attackYaw=0;
     }
     advanceTime(0);const a=JSON.parse(render_game_to_text()).graphics.actor;
     const feet=a.footPositions.map(([x,height,z])=>({x:j.x+Math.cos(j.yaw)*x-Math.sin(j.yaw)*z,y:j.y-Math.sin(j.yaw)*x-Math.cos(j.yaw)*z,height}));
     advanceTime(0);const duplicate=JSON.parse(render_game_to_text()).graphics.actor;
     const footing=frame%6===0?__underGreen.inspectJoeFooting():null;rows.push({kind:kind+'-'+fps,frame,time,footing,feet,footError:a.footError,contacts:a.footContacts,handError:a.handError,difference:Object.fromEntries(Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(duplicate[k])).map(k=>[k,{before:a[k],after:duplicate[k]}])),duplicate:JSON.stringify(a)===JSON.stringify(duplicate)});
    }
   }return rows;
  });
  let maxPlantTravel=0,maxFootError=0,maxHandError=0,minHeight=Infinity,maxAirborne=0,plants=0;
  for(let i=0;i<samples.length;i++){
   const s=samples[i],previous=samples[i-1];assert(s.duplicate,`${s.kind}/${s.frame}: duplicate render changed pose ${JSON.stringify(s.difference)}`);
   maxFootError=Math.max(maxFootError,s.footError);maxHandError=Math.max(maxHandError,s.handError);
   s.feet.forEach((f,k)=>{
    minHeight=Math.min(minHeight,f.height);maxAirborne=Math.max(maxAirborne,f.height);
    if(previous?.kind===s.kind&&s.contacts[k]?.planted&&previous.contacts[k]?.planted){plants++;maxPlantTravel=Math.max(maxPlantTravel,Math.hypot(f.x-previous.feet[k].x,f.y-previous.feet[k].y));}
   });
  }
  fs.writeFileSync(out+'/samples.json',JSON.stringify({samples,maxPlantTravel,maxFootError,maxHandError,minHeight,maxAirborne,plants},null,2));
  const groundSamples=samples.filter(s=>s.footing);const minSoleHeight=Math.min(...groundSamples.map(s=>s.footing.minHeight));assert(minSoleHeight>-.002,`Rendered sole penetrates floor: ${minSoleHeight}`);
  assert(maxPlantTravel<.002,`Grounded foot slid ${maxPlantTravel}m/frame`);
  assert(maxFootError<.015,`Unreachable ankle target: ${maxFootError}m`);assert(maxHandError<.015);
  assert(minHeight>.10,`Ankle sank below authored floor clearance: ${minHeight}`);assert(maxAirborne>.17,'No visible foot lift');
  // Actual simulation entrance/turns are also checked by the arrival/clearance suites.
  // These captures isolate the leg presentation at a deliberately unobstructed site.
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const [name,frames]of [['turn',37],['settle',85]]){
    await p.evaluate(async({name,frames})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';Object.assign(r.player,{x:1.7,y:56,yaw:Math.PI+.5,pitch:-.14});Object.assign(r.joe,{x:0,y:53,yaw:0,phase:'turn',speed:0,walk:0});__underGreen.run=r;
     for(let i=0;i<=frames;i++){r.time=i/60;r.joe.yaw=Math.min(i,45)/60*1.2;r.joe.turnRate=i<=45?1.2:0;r.joe.turnDistance=Math.min(i,45)/60*1.2*.2;r.joe.phase=i<=45?'turn':'search';r.joe.age=i/60;advanceTime(0);}
    },{name,frames});
    await p.screenshot({path:`${out}/${name}-${width}.png`});
   }
  }
  assert.deepEqual(errors,[]);const result={passed:true,samples:samples.length,maxPlantTravel,maxFootError,maxHandError,minHeight,maxAirborne,plants,minSoleHeight,groundSamples:groundSamples.length,views:8,errors};fs.writeFileSync(out+'/verified.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
