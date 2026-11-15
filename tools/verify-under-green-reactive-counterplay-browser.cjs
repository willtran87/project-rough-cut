const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/reactive-counterplay',study=JSON.parse(fs.readFileSync(out+'/expanded.json'));
 const selected=[study.reports[0].rows.find(r=>r.moment==='refused'&&r.delay===.25&&r.side===-1),study.reports[1].rows.find(r=>r.moment==='refused'&&r.delay===.25&&r.side===1),study.reports[0].rows.find(r=>r.moment==='refused'&&r.delay===.5&&r.side===-1)].map(row=>({row,tape:JSON.parse(fs.readFileSync(row.file))}));
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],results=[],errors=[];
 try{
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   const context=await b.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<500}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.evaluate(()=>advanceTime(0));
   if(width<900)await p.touchscreen.tap(width/2,height/2);
   const capture=async(name)=>{if(width<900){await p.touchscreen.tap(width/2,height/2);await p.evaluate(()=>advanceTime(0));}await p.evaluate(()=>__underGreen.whenPresented());const state=await p.evaluate(()=>({mode:__underGreen.run.mode,time:__underGreen.run.time,message:__underGreen.run.message,messageTime:__underGreen.run.messageTime,useFeedbackUntil:__underGreen.run.useFeedbackUntil,gate:__underGreen.run.gate,caption:document.getElementById('caption').textContent,action:document.getElementById('use').textContent,objective:document.getElementById('objective').textContent,touch:!document.getElementById('touch').hidden}));const file=`${out}/${name}-${width}.png`;await p.screenshot({path:file});views.push({name,width,height,file,...state});fs.writeFileSync(out+'/browser-partial.json',JSON.stringify({views,results,errors},null,2));return state;};
   // A future exit requirement is explained before the control becomes usable.
   await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(2);r.mode='playing';r.messageTime=0;__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
   const approach=await capture('approach');assert.match(approach.objective,/ahead of Joe.*outside/);
   const closure=JSON.parse(fs.readFileSync(out+'/closing-fixture.json'));
   await p.evaluate(initial=>{__underGreen.run=structuredClone(initial);__underGreen.clearInput();advanceTime(0);},closure.initial);
   if(width<900)await p.locator('#use').tap();else await p.keyboard.press('e');await p.evaluate(frames=>advanceTime(frames*1000/60-1e-6),closure.frames);
   const closing=await capture('active-closure');assert(closing.gate>0&&closing.gate<1);assert.match(closing.caption,/Stay inside/);
   assert.match(closing.objective,/Stay inside/);
   await p.keyboard.down('r');await p.evaluate(()=>advanceTime(300));await p.keyboard.up('r');const rear=await capture('closure-rear');assert.match(rear.caption,/Stay inside/);assert(await p.locator('#use').isHidden());
   assert(await p.locator('#water-read').isHidden(),'crossing advice must not invite abandoning active closure');
   await p.keyboard.press('Escape');const paused=await p.locator('#paused-objective').innerText();assert.match(paused,/Stay inside/);await p.click('#primary');await p.evaluate(()=>advanceTime(0));
   if(width<900)await p.touchscreen.tap(width/2,height/2);
   await p.evaluate(initial=>{__underGreen.run=structuredClone(initial);__underGreen.clearInput();advanceTime(0);},closure.initial);
   if(width<900)await p.locator('#use').tap();else await p.keyboard.press('e');await p.evaluate(()=>advanceTime(1000/60));
   await p.keyboard.down('s');await p.keyboard.down('r');await p.evaluate(()=>advanceTime(400));await p.keyboard.up('s');await p.keyboard.up('r');
   await p.evaluate(async()=>{const {WATERS}=await import('./under-green-course.js'),p=__underGreen.run.player,w=WATERS.find(w=>w.id==='sluice');p.yaw=Math.atan2(w.x-p.x,w.y-p.y)-(p.rearAngle||0);advanceTime(0);});
   const cancelled=await capture('closure-abandoned');assert.match(cancelled.caption,/Closure cancelled/);assert(await p.locator('#water-read').isVisible());
   // Request the actual interlock at the preserved failed-run position.
   await p.evaluate(initial=>{__underGreen.run=structuredClone(initial);__underGreen.run.messageTime=0;__underGreen.clearInput();advanceTime(0);},selected[0].tape.initial);
   if(width<900)await p.locator('#use').tap();else await p.keyboard.press('e');await p.evaluate(()=>advanceTime(1000/60));
   const denied=await capture('threshold-refused');assert.equal(denied.gate,0);assert.match(denied.caption,/threshold is blocked.*spillway on a safe opening.*run back/);
   // Expire only the event banner: the queried control still owes an answer.
   await p.evaluate(()=>{__underGreen.run.messageTime=0;advanceTime(0);});const persistent=await capture('persistent-answer');assert.match(persistent.caption,/spillway on a safe opening/);
   await p.evaluate(()=>{__underGreen.run.player.yaw+=Math.PI;advanceTime(0);});const away=await capture('look-away');assert(!away.caption.includes('spillway on a safe opening'));
   // Immediate attack instructions must still supersede the longer recovery tactic.
   await p.evaluate(run=>{__underGreen.run=structuredClone(run);__underGreen.clearInput();advanceTime(0);},study.reports[0].moments.find(m=>m.name==='rev').run);
   const danger=await capture('attack-priority');assert.match(danger.caption,/trimmer|blade/i);assert(!danger.caption.includes('spillway'));
   for(let index=0;index<selected.length;index++){
    const {row,tape}=selected[index];
    await p.evaluate(t=>{__underGreen.run=structuredClone(t.initial);__underGreen.run.messageTime=0;__underGreen.run.message='';__underGreen.clearInput();window.counterplayReplay={inputs:t.inputs,index:0};advanceTime(0);},tape);
    const stages=tape.result.samples.filter(s=>s.event).map(s=>({name:s.event,frame:s.frame}));stages.push({name:'outcome',frame:tape.inputs.length});
    for(const stage of stages){
     const state=await p.evaluate(async frame=>{const {step}=await import('./under-green-sim.js');const r=__underGreen.run,t=counterplayReplay;while(t.index<frame){const input=t.inputs[t.index++];r.player.yaw=input.yaw;step(r,input.input);if(t.index%12===0)advanceTime(0);}advanceTime(0);return {mode:r.mode,time:r.time,elapsed:r.elapsed,hits:r.waterHits,player:r.player,gate:r.gate};},stage.frame);
     await capture(`route-${index}-${stage.name}`);
     if(stage.name==='outcome'){assert.equal(state.mode,tape.final.mode);assert.equal(state.hits,tape.final.waterHits);assert(Math.abs(state.elapsed-tape.final.elapsed)<1e-7);assert(Math.hypot(state.player.x-tape.final.player.x,state.player.y-tape.final.player.y)<1e-7);results.push({width,index,source:row.file,...state});}
    }
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,results,views,errors,limits:['Ordinary E / browser-touch Use checks current refusal; continuous recovery tapes replay recorded ordinary movement with scripted map/phase/attack knowledge.','Historical message text is cleared at replay start without changing time or either actor; it is not used as evidence for current guidance.','No human comprehension, physical-device turn ergonomics or universal recovery claim.']},null,2));console.log(JSON.stringify({passed:true,replays:results.length,views:views.length,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
