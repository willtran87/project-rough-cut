const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const option=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
 const out=option('output')||'output/under-green/reactive-routes';fs.mkdirSync(out,{recursive:true});
 const source=option('source'),all=JSON.parse(fs.readFileSync(source||out+'/full-observed-tapes.json'));
 const selected=[];
 if(source){assert(all.length>0,'Explicit source must contain tapes');selected.push(...all);}
 else for(const choices of ['dry-dry','dry-wet','wet-dry','wet-wet']){
  const matches=all.filter(t=>!t.failed&&t.row.branches.map(b=>b.choice).join('-')===choices);
  const tape=matches.find(t=>t.row.crouch)||matches[0];assert(tape,choices);selected.push(tape);
 }
 const failed=all.find(t=>t.failed);if(!source&&failed)selected.push(failed);
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[],views=[],errors=[];
 try{
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   const context=await b.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<500}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   for(const tape of selected){
    // Held rear view cannot silently turn the player's travel heading.
    for(let i=1;i<tape.inputs.length;i++)if(tape.inputs[i-1].input.rear&&tape.inputs[i].input.rear)assert(Math.abs(tape.inputs[i].yaw-tape.inputs[i-1].yaw)<1e-8);
    await p.evaluate(t=>{__underGreen.run=structuredClone(t.initial);__underGreen.clearInput();window.reactiveTape={index:0,inputs:t.inputs};advanceTime(0);},tape);
    const stages=tape.row.branches.map(c=>({name:c.channel+'-'+c.choice,frame:Math.round((c.time-tape.initial.time)*60)}));
    const walking=tape.row.stances.find(c=>c.reason==='walking-window');if(walking)stages.push({name:'walking-choice',frame:Math.round((walking.time-tape.initial.time)*60)});
    if(tape.failed)stages.push({name:'before-capture',frame:Math.max(0,tape.inputs.length-25)});
    stages.push({name:'outcome',frame:tape.inputs.length});stages.sort((a,b)=>a.frame-b.frame);
    for(const stage of stages){
     const state=await p.evaluate(async frame=>{
      const {step}=await import('./under-green-sim.js'),t=reactiveTape,r=__underGreen.run;
      while(t.index<frame){const input=t.inputs[t.index++];r.player.yaw=input.yaw;step(r,input.input);if(t.index%12===0)advanceTime(0);}
      advanceTime(0);await __underGreen.whenPresented();return {mode:r.mode,seconds:r.elapsed,player:{x:r.player.x,y:r.player.y},hits:r.waterHits,touch:!document.getElementById('touch').hidden,phase:document.getElementById('water-phase').textContent,caption:document.getElementById('caption').textContent};
     },stage.frame);
     if(width<900&&state.mode==='playing')assert(state.touch);
     if(stage.name==='outcome'){assert.equal(state.mode,tape.final.mode);assert.equal(state.hits,tape.final.hits);assert(Math.abs(state.seconds-tape.final.seconds)<1e-7);assert(Math.hypot(state.player.x-tape.final.player.x,state.player.y-tape.final.player.y)<1e-7);results.push({name:tape.name,width,...state});}
     const file=`${out}/replay-${tape.name}-${stage.name}-${width}.png`;await p.screenshot({path:file});views.push({name:tape.name,stage:stage.name,width,height,file,...state});
    }
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,results,views,errors,limits:['Recorded ordinary movement/stance/rear inputs replayed through simulation, with scripted map/yaw knowledge; not human gameplay.','Current physical input and binding activation is independently covered by the walking-option browser test.','Includes a retained captured attempt; replay agreement is not an assertion that that policy should survive.']},null,2));console.log(JSON.stringify({passed:true,replays:results.length,views:views.length,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
