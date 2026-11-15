const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/range-recovery',tapes=JSON.parse(fs.readFileSync(out+'/reposition-tapes.json'));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],views=[],geometry=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  const configurations=[[2560,1600],[1280,720],[844,390],[390,844]].map(size=>({size,tape:tapes[0],prefix:''}));
  configurations.push({size:[2560,1600],tape:tapes.find(t=>t.name==='long-turn'),prefix:'long-turn-'});
  for(const {size:[width,height],tape,prefix}of configurations){
   await p.setViewportSize({width,height});
   await p.evaluate(initial=>{__underGreen.run=structuredClone(initial);__underGreen.clearInput();window.repositionView={stage:0,frame:0};advanceTime(0);},tape.initial);
   for(const stage of ['plan','moving','aim','contact']){
    const state=await p.evaluate(async({stage,inspect})=>{
     const {step}=await import('./under-green-sim.js'),{wrap}=await import('./under-green-course.js');
     const r=__underGreen.run,samples=[];
     for(let i=0;i<500&&r.mode==='playing';i++){
      // Inspection inputs keep the visible actor framed, without changing
      // player position or any pursuit/attack state.
      step(r,{lookX:wrap(Math.atan2(r.joe.x-r.player.x,r.joe.y-r.player.y)-r.player.yaw)});
      window.repositionView.frame++;
      if(window.repositionView.frame%3===0){advanceTime(0);if(inspect&&window.repositionView.frame%12===0){const a=JSON.parse(render_game_to_text()).graphics.actor;samples.push({frame:window.repositionView.frame,phase:r.joe.phase,handError:a.handError,footError:a.footError,geometry:__underGreen.inspectJoeGeometry()});}}
      const ready=stage==='plan'?!!r.joe.attackReposition:stage==='moving'?!!r.joe.attackReposition&&r.joe.speed>.1:stage==='aim'?r.joe.phase==='windup'&&r.joe.age>.65&&!r.joe.attackReposition:r.mode==='caught';
      if(ready)break;
     }
     advanceTime(0);return {mode:r.mode,frame:window.repositionView.frame,joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase,speed:r.joe.speed,plan:r.joe.attackReposition},samples};
    },{stage,inspect:width===2560});
    if(stage==='contact')assert.equal(state.mode,'caught');else assert.equal(state.mode,'playing');
    if(stage==='moving')assert(state.joe.speed>.1);
    geometry.push(...state.samples);delete state.samples;
    await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/${prefix}${stage}-${width}.png`});views.push({stage:prefix+stage,width,height,...state});
   }
  }
  // Replay the same ordinary-input sidestep/route in the browser as in Node.
  await p.setViewportSize({width:390,height:844});
  const escape=await p.evaluate(async tape=>{
   const {step}=await import('./under-green-sim.js');__underGreen.run=structuredClone(tape.initial);__underGreen.clearInput();
   for(let i=0;i<tape.inputs.length;i++){step(__underGreen.run,tape.inputs[i]);if(i%3===0)advanceTime(0);}
   advanceTime(0);const r=__underGreen.run;return {mode:r.mode,player:r.player,hits:r.waterHits};
  },tapes[1]);
  assert.equal(escape.mode,'playing');assert.equal(escape.hits,tapes[1].final.waterHits);assert(Math.hypot(escape.player.x-tapes[1].final.player.x,escape.player.y-tapes[1].final.player.y)<1e-7);
  await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:out+'/escape-390.png'});
  fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:errors.length===0&&geometry.every(g=>g.handError<.015&&g.footError<.015&&!g.geometry.hits.length),views,geometry,escape,errors,limits:['Four viewport sizes are desktop emulation, not physical-device qualification.','Actor inspection follows with look input; no forced camera behavior was added to the game.','Geometry samples inspect real rendered meshes at 0.2-second intervals, not every possible pose.']},null,2));
  assert(geometry.length>10);
  for(const g of geometry){assert(g.handError<.015&&g.footError<.015);assert.deepEqual(g.geometry.hits,[],`Scenery hit at frame ${g.frame}`);}
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,views:views.length,geometrySamples:geometry.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
