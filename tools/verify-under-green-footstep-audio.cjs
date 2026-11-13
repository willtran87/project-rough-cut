const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/under-green/footstep-audio',errors=[];fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.evaluate(()=>advanceTime(17));
  const cases=await p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js');const results=[];
   for(const fps of [60,30,15])for(const kind of ['walk','turn','stop']){
    const r=createRun();r.mode='playing';Object.assign(r.player,{x:2,y:57,yaw:Math.PI+.4,pitch:-.14});Object.assign(r.joe,{x:0,y:51,yaw:0,phase:'walk',speed:0,walk:0});__underGreen.run=r;
    const rows=[];
    for(let frame=0;frame<fps*3;frame++){
     const t=frame/fps;r.time=t;r.joe.age=t;
     if(kind==='turn'){r.joe.phase='turn';r.joe.yaw=t*1.2;r.joe.turnRate=1.2;r.joe.turnDistance=t*1.2*.2;}
     else if(kind==='walk'||t<.8){r.joe.speed=2.1;r.joe.y=51+t*2.1;r.joe.walk=t*2.1;}
     else{r.joe.speed=0;r.joe.phase='water-wait';}
     advanceTime(0);const s=JSON.parse(render_game_to_text());
     advanceTime(0);const duplicate=JSON.parse(render_game_to_text());
     rows.push({t,serial:s.graphics.actor.footsteps.serial,heights:s.graphics.actor.soleHeights,audio:s.audio.counts.joeSteps,last:s.audio.lastFootstep,duplicateAudio:duplicate.audio.counts.joeSteps});
    }
    results.push({fps,kind,rows});
   }return results;
  });
  const totals=[];
  for(const c of cases){
   let changes=0;
   for(let i=1;i<c.rows.length;i++){
    const before=c.rows[i-1],row=c.rows[i],delta=row.serial-before.serial;
    assert.equal(row.audio-before.audio,delta,`${c.kind}/${c.fps}: cue does not match contact`);
    assert.equal(row.duplicateAudio,row.audio);changes+=delta;
    if(delta){assert.equal(row.last.time,row.t);assert(row.heights[row.last.foot]<=.0081);}
   }
   assert(changes>0,`${c.kind}/${c.fps}: no contacts`);
   if(c.kind==='stop')assert.equal(c.rows.at(-1).audio,c.rows.find(r=>r.t>=1.8).audio,'Idle feet must stay silent');
   totals.push({kind:c.kind,fps:c.fps,contacts:changes});
  }
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const before=(await read()).audio.counts.joeSteps;
  await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).audio.counts.joeSteps,before);
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));assert.equal((await read()).audio.counts.joeSteps,before);
  await p.click('#sound');assert((await read()).comfort.muted);
  const muted=await p.evaluate(()=>{const r=__underGreen.run;for(let i=0;i<45;i++){r.time+=1/30;r.joe.phase='turn';r.joe.turnRate=1.2;r.joe.yaw+=1.2/30;advanceTime(0);}return JSON.parse(render_game_to_text());});
  assert.equal(muted.audio.counts.joeSteps,before);await p.click('#sound');await p.evaluate(()=>advanceTime(0));assert.equal((await read()).audio.counts.joeSteps,before,'Unmute cannot replay dropped contacts');
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';__underGreen.run=r;advanceTime(0);});assert.equal((await read()).audio.counts.joeSteps,0,'Fresh run has no phantom step');
  // Use the normal simulation/render cadence for the real pursuit integration.
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(1);r.mode='playing';Object.assign(r.player,{x:0,y:57,yaw:Math.PI,pitch:-.08});Object.assign(r.joe,{x:0,y:47,phase:'walk',last:{x:0,y:57},seen:true});__underGreen.run=r;advanceTime(0);});
  for(let i=0;i<60;i++)await p.evaluate(()=>advanceTime(32));
  const pursuit=await read();assert(pursuit.audio.counts.joeSteps>0);await p.screenshot({path:out+'/pursuit-2560.png'});
  const voices=await p.evaluate(async()=>{
   const {createUnderGreenAudio}=await import('./under-green-audio.js');const {createRun}=await import('./under-green-sim.js');
   const audio=createUnderGreenAudio(),r=createRun();r.mode='playing';r.time=1;Object.assign(r.player,{x:0,y:52,yaw:Math.PI});
   audio.start();audio.update(r);
   const contacts=[0,1].map(foot=>({owner:r,serial:foot+1,time:1,foot,x:foot*.2,y:50,height:.002,phase:'walk'}));
   audio.footContacts(r,contacts);await new Promise(resolve=>setTimeout(resolve,25));const both=audio.stats();audio.footContacts(r,contacts);const duplicate=audio.stats();
   r.mode='paused';audio.update(r);await new Promise(resolve=>setTimeout(resolve,220));const paused=audio.stats();audio.dispose();return {both,duplicate,paused};
  });
  fs.writeFileSync(out+'/voice-diagnostic.json',JSON.stringify(voices,null,2));
  assert.equal(voices.both.counts.joeSteps,2);assert(voices.both.footGains.every(g=>g>0));assert.equal(voices.both.voices,16);assert.equal(voices.both.waterVoices,8);
  assert.equal(voices.duplicate.counts.joeSteps,2);assert(voices.paused.footGains.every(g=>g<.001));
  fs.writeFileSync(out+'/samples.json',JSON.stringify(cases,null,2));assert.deepEqual(errors,[]);
  const result={passed:true,totals,pursuitSteps:pursuit.audio.counts.joeSteps,checks:['contact/cue correspondence at60/30/15Hz','duplicate render, idle, pause/resume, mute/unmute and retry silence','ordinary simulation pursuit emits synchronized cues','two simultaneous contacts retain independent envelopes; repeated event delivery is deduplicated; pause cancels both'],errors};fs.writeFileSync(out+'/verified.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
