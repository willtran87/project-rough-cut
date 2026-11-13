// Render retained simulation input tapes. These are placement fixtures, not human sessions.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/pressure-envelopes',examples=JSON.parse(fs.readFileSync(out+'/examples.json'));
 const selected=examples.filter(e=>e.kind==='protected-recovery');
 assert(selected.length>0,'No actual protected recovery tape available');
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],views=[];
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4187/under-green.html?test');
  await page.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  await page.evaluate(()=>advanceTime(0));await page.click('#primary');
  for(const example of selected){
   await page.evaluate(example=>{__underGreen.run=example.initial;__underGreen.clearInput();window.pressureTape={inputs:example.inputs,index:0};advanceTime(0);},example);
   const first=await page.evaluate(async()=>{
    const {step}=await import('./under-green-sim.js'),t=window.pressureTape,r=__underGreen.run;
    while(t.index<t.inputs.length){step(r,t.inputs[t.index++]);if(r.player.recovery?.protected)break;}
    advanceTime(0);return {frame:t.index,protected:!!r.player.recovery?.protected,player:{...r.player},joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase}};
   });
   assert(first.protected);
   await page.evaluate(()=>__underGreen.whenPresented());
   await page.screenshot({path:`${out}/${example.channel}-protected-2560.png`});
   // Inspect the actor behind the player at the same simulation instant.
   await page.evaluate(()=>{__underGreen.run.player.rearAngle=Math.PI;advanceTime(0);});
   if(example.channel==='spillway'){
    const advice=await page.locator('#water-advice').innerText();
    assert.match(advice,/East dry walkway/);assert(!/[←→]/.test(advice),'HUD must not keep a forward-view arrow when looking backward');
   }
   await page.evaluate(()=>__underGreen.whenPresented());
   await page.screenshot({path:`${out}/${example.channel}-rear-2560.png`});
   await page.evaluate(()=>{__underGreen.run.player.rearAngle=0;advanceTime(0);});
   const end=await page.evaluate(async channel=>{
    const {step}=await import('./under-green-sim.js'),{WATERS,waterLocal}=await import('./under-green-course.js'),t=window.pressureTape,r=__underGreen.run;
    while(t.index<t.inputs.length)step(r,t.inputs[t.index++]);
    const water=WATERS.find(w=>w.id===channel),local=waterLocal(r.player,water);
    advanceTime(0);return {mode:r.mode,seconds:r.elapsed,waterHits:r.waterHits,rejoined:(water.forward||1)*local.y>=water.depth/2+.5&&Math.abs(local.x)<=water.width/2-.35,player:{x:r.player.x,y:r.player.y},joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase}};
   },example.channel);
   assert.equal(end.mode,example.row.mode);assert.equal(end.waterHits,example.row.waterHits);
   assert(end.rejoined,'Dry routes must rejoin the destination bank');
   assert(Math.abs(end.seconds-example.row.seconds)<1e-8);
   await page.evaluate(()=>__underGreen.whenPresented());await page.screenshot({path:`${out}/${example.channel}-recovered-2560.png`});
   views.push({channel:example.channel,stance:example.row.stance,phase:example.row.phase,initialGap:example.row.actualGap,first,end});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,errors,limits:['Retained fixture input tapes replayed through the actual simulation and renderer.','Rear views are inspection-only at a frozen instant; no position or enemy-state changes during a tape.','Still images and perfect-information pilots do not establish human cue recognition, comfortable controls or fairness.']},null,2));
  console.log(JSON.stringify({passed:true,channels:views.map(v=>v.channel),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
