const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/range-cadence/advised',tapes=JSON.parse(fs.readFileSync(out+'/tapes.json'));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],views=[],results=[];
 try{
  for(const [width,height] of [[2560,1600],[1280,720],[844,390],[390,844]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<500});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto('http://127.0.0.1:4187/under-green.html?test');
   await page.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   await page.evaluate(()=>advanceTime(0));await page.click('#primary');
   for(const tape of tapes){
    await page.evaluate(t=>{__underGreen.run=structuredClone(t.initial);__underGreen.clearInput();window.rangeTape={inputs:t.inputs,index:0};advanceTime(0);},tape);
    const stages=tape.stages.filter(s=>['range-a-approach','range-b-approach','range-b-entry','sluice-entry','water-recovery'].includes(s.stage));
    stages.push({stage:'result',frame:tape.inputs.length});
    for(const stage of stages){
     const state=await page.evaluate(async stop=>{
      const {step}=await import('./under-green-sim.js'),{WATERS,waterState}=await import('./under-green-course.js');
      const t=window.rangeTape,r=__underGreen.run;
      while(t.index<stop){const frame=t.inputs[t.index++];r.player.yaw=frame.yaw;step(r,frame.input);if(t.index%12===0)advanceTime(0);}
      advanceTime(0);
      const node=document.getElementById('water-read'),name=document.getElementById('water-name').textContent;
      const water=WATERS.find(w=>w.name===name),phase=water?waterState(water,r.time,r.bypass,r.bypassAt):null;
      return {mode:r.mode,player:{x:r.player.x,y:r.player.y},hits:r.waterHits,seconds:r.elapsed,water:water?.id,phase,visible:!node.hidden,danger:node.dataset.danger,title:document.getElementById('water-phase').textContent,touch:!document.getElementById('touch').hidden,offset:WATERS.find(w=>w.id==='range-b').offset,keeperOffset:WATERS.find(w=>w.id==='sluice').offset};
     },stage.frame);
     assert.equal(state.offset,4);
     assert.equal(state.keeperOffset,3.25);
     if(state.visible)assert.equal(state.danger,String(state.phase.danger),'HUD danger and physical water disagree');
     if(width<900&&state.mode==='playing')assert(state.touch,'Actual touch interface must be present');
     if(stage.stage==='result'){
      assert.equal(state.mode,tape.final.mode);assert.equal(state.hits,tape.final.hits);
      assert(Math.hypot(state.player.x-tape.final.player.x,state.player.y-tape.final.player.y)<1e-7);
      assert(Math.abs(state.seconds-tape.final.seconds)<1e-7);results.push({name:tape.name,width,...state});
     }
     await page.evaluate(()=>__underGreen.whenPresented());
     const file=`${out}/${tape.name}-${stage.stage}-${width}.png`;await page.screenshot({path:file});views.push({name:tape.name,stage:stage.stage,width,height,file,...state});
    }
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,results,errors,limits:['Recorded ordinary-input simulation tapes with perfect route knowledge; not human sessions.','Touch UI is enabled in emulated desktop browser contexts, not physical phone qualification.','No new geometry is authored in this timing pass; still views do not prove all-space clearance.']},null,2));
  console.log(JSON.stringify({passed:true,views:views.length,replays:results.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
