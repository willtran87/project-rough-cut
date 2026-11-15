const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/keeper-counterplay',baseline=process.argv.includes('--baseline');
 const tapes=[-1,1].map(side=>({side,...JSON.parse(fs.readFileSync(`${out}/attempt-${side}.json`))}));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const views=[],errors=[],replays=[];
 try{
  for(const [width,height]of baseline?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<500});
   const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   await p.evaluate(initial=>{__underGreen.run=structuredClone(initial);__underGreen.clearInput();advanceTime(0);},tapes[0].initial);
   await p.locator('#use').click();await p.evaluate(()=>advanceTime(1000/60));
   const denied=await p.evaluate(()=>({caption:document.getElementById('caption').textContent,action:document.getElementById('use').textContent,closing:__underGreen.run.closing,finished:__underGreen.run.finished}));
   assert(!denied.closing&&!denied.finished);
   if(!baseline){assert.match(denied.caption,/Joe is inside/);assert.match(denied.caption,/spillway/);assert.match(denied.action,/blocked/i);}
   await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/${baseline?'baseline-':''}blocked-${width}.png`});views.push({stage:'requested-block',width,height,...denied});
   if(baseline){console.log(JSON.stringify(denied));await context.close();continue;}
   // Presentation-only expiration fixture; gameplay time, Joe and the player
   // remain at the actual failed-use instant. This checks the fallback detail.
   await p.evaluate(()=>{__underGreen.run.messageTime=0;advanceTime(0);});
   const detail=await p.locator('#caption').innerText();assert.match(detail,/spillway/);
   await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/persistent-${width}.png`});views.push({stage:'persistent-detail',width,height,caption:detail});
   for(const tape of tapes){
    await p.evaluate(t=>{__underGreen.run=structuredClone(t.initial);__underGreen.clearInput();window.keeperTape={index:0,inputs:t.inputs};advanceTime(0);},tape);
    const stages=tape.result.samples.filter(s=>s.event).map(s=>({name:s.event,frame:s.frame}));
    stages.push({name:'secured',frame:tape.inputs.length});
    for(const stage of stages){
     const state=await p.evaluate(async stop=>{
      const {step}=await import('./under-green-sim.js'),{keeperInside}=await import('./under-green-course.js');
      const t=window.keeperTape,r=__underGreen.run;
      while(t.index<stop){const i=t.inputs[t.index++];r.player.yaw=i.yaw;step(r,i.input);if(t.index%6===0)advanceTime(0);}
      advanceTime(0);return {mode:r.mode,player:{x:r.player.x,y:r.player.y},joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase},joeInside:keeperInside(r.joe),gate:r.gate,hits:r.waterHits,seconds:r.elapsed,touch:!document.getElementById('touch').hidden};
     },stage.frame);
     if(width<900&&state.mode==='playing')assert(state.touch);
     if(stage.name==='secured'){assert.equal(state.mode,'complete');assert(!state.joeInside);assert.equal(state.hits,tape.final.waterHits);assert.equal(state.gate,1);assert(Math.hypot(state.player.x-tape.final.player.x,state.player.y-tape.final.player.y)<1e-7);replays.push({side:tape.side,width,...state});}
     await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/side${tape.side}-${stage.name}-${width}.png`});views.push({side:tape.side,stage:stage.name,width,height,...state});
    }
   }
   const defeat=JSON.parse(fs.readFileSync(out+'/defeat.json'));
   await p.evaluate(r=>{__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},defeat);
   assert(await p.locator('#panel').isVisible());
   const resultText=await p.locator('#panel').innerText();assert.match(resultText,/run back to the release/);
   await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/defeat-${width}.png`});views.push({stage:'defeat',width,height,text:resultText});
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${baseline?'baseline-browser':'browser'}.json`,JSON.stringify({passed:true,views,replays,errors,limits:['Retained state and ordinary-input tapes; no enemy relocation during recovery.','Persistent-detail view expires only the event banner at the actual denied-use instant.','Emulated touch layouts and scripted tactics do not establish human recognition or physical-device comfort.']},null,2));
  console.log(JSON.stringify({passed:true,views:views.length,replays:replays.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
