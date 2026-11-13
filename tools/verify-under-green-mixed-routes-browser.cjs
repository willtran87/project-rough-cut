const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/mixed-routes',baseline=process.argv.includes('--baseline');
 const tapes=JSON.parse(fs.readFileSync(out+'/tapes.json'));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const views=[],replays=[],errors=[];let clearance=null;
 try{
  for(const [width,height]of baseline?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<500});
   const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.goto('http://127.0.0.1:4187/under-green.html?test'+(baseline?'':'&playtest'));
   await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   for(const tape of tapes){
    await p.evaluate(t=>{__underGreen.run=structuredClone(t.initial);__underGreen.clearInput();window.mixedTape={index:0,inputs:t.inputs};advanceTime(0);},tape);
    const stages=tape.stages.flatMap(s=>s.name==='middle'?[s,{...s,name:'middle-east',yaw:Math.PI/2},{...s,name:'middle-south',yaw:Math.PI}]:[s]);
    stages.push({name:'result',frame:tape.inputs.length});
    for(const stage of stages){
     const state=await p.evaluate(async s=>{
      const {step}=await import('./under-green-sim.js');const t=window.mixedTape,r=__underGreen.run;
      while(t.index<s.frame){const f=t.inputs[t.index++];r.player.yaw=f.yaw;step(r,f.input);if(t.index%12===0)advanceTime(0);}
      if(s.yaw!==undefined)r.player.yaw=s.yaw;
      advanceTime(0);
      return {mode:r.mode,player:{x:r.player.x,y:r.player.y,yaw:r.player.yaw},hits:r.waterHits,seconds:r.elapsed,touch:!document.getElementById('touch').hidden,caption:document.getElementById('caption').textContent};
     },stage);
     if(width<900&&state.mode==='playing')assert(state.touch);
     if(stage.name==='result'){
      assert.equal(state.mode,tape.final.mode);assert.equal(state.hits,tape.final.hits);
      assert(Math.hypot(state.player.x-tape.final.player.x,state.player.y-tape.final.player.y)<1e-7);
      assert(Math.abs(state.seconds-tape.final.seconds)<1e-7);replays.push({name:tape.name,width,...state});
     }
     await p.evaluate(()=>__underGreen.whenPresented());
     const file=`${out}/${baseline?'baseline-':''}${tape.name}-${stage.name}-${width}.png`;
     await p.screenshot({path:file});views.push({name:tape.name,stage:stage.name,width,height,file,...state});
    }
    if(!baseline){
     const details=p.locator('#local-playtest');
     if(!await details.evaluate(el=>el.open))await details.locator('summary').click();
     await p.locator('#playtest-kind').selectOption('automated');
     const downloading=p.waitForEvent('download');await p.locator('#playtest-download').click();
     const download=await downloading,file=`${out}/${tape.name}-report-${width}.json`;await download.saveAs(file);
     const report=JSON.parse(fs.readFileSync(file)),attempt=report.attempts.at(-1);
     assert.equal(attempt.outcome,'escaped');assert.equal(attempt.crossings.find(c=>c.id==='range').choice,'mixed');
     for(const [i,id]of ['range-a','range-b'].entries()){
      const c=attempt.crossings.find(c=>c.id===id);assert.equal(c.parent,'range');assert.equal(c.choice,tape.name.split('-')[i]);assert(c.finished);
     }
    }
   }
   if(!baseline&&width===2560){
    clearance=await p.evaluate(async()=>{
     const {createRun}=await import('./under-green-sim.js'),{solid,onFloor}=await import('./under-green-course.js'),{rangeY}=await import('./under-green-layout.js');
     const r=createRun(3);r.mode='playing';r.joe.phase='absent';__underGreen.run=r;advanceTime(0);
     const poses=[];
     for(let x=12;x<=21;x+=1.5)for(const offset of [-.8,0,.8,1.25]){
      const y=rangeY(23.5)+offset;if(solid({x,y},.3))continue;
      for(const height of [1.12,1.65])for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const pitch of [-.85,0,.85])for(const fov of [45,85])poses.push({x,y,height,yaw,pitch,fov,aspect:innerWidth/innerHeight});
     }
     const samples=__underGreen.inspectCameraClearance(poses);
     return {count:samples.length,hits:samples.filter(s=>s.hits.length),mastInsideWalkableFloor:onFloor(16.5,rangeY(26)+.12),scope:'Static middle-junction camera volume at sampled walkable positions, two heights, four headings, extreme pitch and FOV. Not all-space actor clearance.'};
    });
    assert(!clearance.mastInsideWalkableFloor);assert.deepEqual(clearance.hits,[]);
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/${baseline?'baseline-browser':'browser'}.json`,JSON.stringify({passed:true,views,replays,errors,clearance,limits:['Ordinary-input tapes with perfect phase/route knowledge; no human wayfinding claim.','Middle landing look views turn the camera without advancing time; replay resumes recorded yaw.','Actual touch UI in emulated browser contexts, not physical-device qualification.']},null,2));
  console.log(JSON.stringify({passed:true,views:views.length,replays:replays.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
