const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/recovery-control',examples=JSON.parse(fs.readFileSync(out+'/examples.json'));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const views=[],replays=[],errors=[];let pauseVerified=false;
 try{
  for(const [width,height,device]of [[2560,1600,'keyboard'],[1280,720,'gamepad'],[844,390,'touch'],[390,844,'touch']]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:device==='touch',isMobile:width<500});
   const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   if(device==='gamepad')await p.addInitScript(()=>{window.recoveryPad={id:'Recovery input check',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[recoveryPad];});
   const cdp=device==='touch'?await context.newCDPSession(p):null;
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   async function burst(input,frames){
    const action=input.forward>0?'forward':input.forward<0?'back':input.strafe>0?'right':input.strafe<0?'left':null;
    if(device==='keyboard'){
     const key={forward:'w',back:'s',right:'d',left:'a'}[action];if(key)await p.keyboard.down(key);
     await p.evaluate(n=>advanceTime(n*(1000/60)-1e-6),frames);if(key)await p.keyboard.up(key);
    }else if(device==='gamepad'){
     await p.evaluate(i=>{recoveryPad.axes[0]=i.strafe||0;recoveryPad.axes[1]=-(i.forward||0);},input);
     await p.evaluate(n=>advanceTime(n*(1000/60)-1e-6),frames);
     await p.evaluate(()=>{recoveryPad.axes[0]=recoveryPad.axes[1]=0;});
    }else{
     if(action){const b=await p.locator(`[data-key="${action}"]`).boundingBox();assert(b);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}]});}
     await p.evaluate(n=>advanceTime(n*(1000/60)-1e-6),frames);
     if(action)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
   }
   for(const tape of examples){
    const name=`${tape.row.channel}-${tape.row.steer}`;
    // Honor the existing neutral-input guard at the menu/game boundary before
    // installing the dry-bank fixture. advanceTime(0) renders but does not poll.
    if(device==='gamepad')await p.evaluate(()=>{recoveryPad.axes[0]=recoveryPad.axes[1]=0;advanceTime(1000/60);});
    await p.evaluate(r=>{__underGreen.run=structuredClone(r);__underGreen.clearInput();advanceTime(0);},tape.initial);
    let frame=0;
    const stages=[{name:'hit',frame:tape.hitFrame},{name:'steer',frame:Math.min(tape.hitFrame+12,tape.endFrame-1)},{name:'bank',frame:tape.endFrame},{name:'retreat',frame:tape.inputs.length}];
    for(const stage of stages){
     while(frame<stage.frame){
      const input=tape.inputs[frame].input;let stop=frame+1;
      while(stop<stage.frame&&JSON.stringify(tape.inputs[stop].input)===JSON.stringify(input))stop++;
      await burst(input,stop-frame);frame=stop;
     }
     const state=await p.evaluate(()=>{advanceTime(0);const r=__underGreen.run;return {mode:r.mode,player:{x:r.player.x,y:r.player.y,yaw:r.player.yaw,pitch:r.player.pitch},recovery:r.player.recovery,hits:r.waterHits,seconds:r.elapsed,inputMethod:JSON.parse(render_game_to_text()).inputMethod,touch:!document.getElementById('touch').hidden,caption:document.getElementById('caption').textContent};});
     if(stage.name==='hit')assert(state.recovery,'Ordinary input must trigger an actual surge recovery: '+JSON.stringify({name,width,frame,state,expected:tape.hitState.player}));
     if(device==='touch')assert(state.touch);
     if(stage.name==='retreat'){
      assert.equal(state.mode,tape.final.mode);assert.equal(state.hits,1);
      assert(Math.hypot(state.player.x-tape.final.player.x,state.player.y-tape.final.player.y)<1e-7);
      assert(Math.abs(state.seconds-tape.final.elapsed)<1e-7);assert.equal(state.inputMethod,device);
      replays.push({name,width,device,...state});
     }
     await p.evaluate(()=>__underGreen.whenPresented());const file=`${out}/${name}-${stage.name}-${width}.png`;
     await p.screenshot({path:file});views.push({name,stage:stage.name,width,height,device,file,...state});
     if(!pauseVerified&&device==='keyboard'&&stage.name==='hit'){
      await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(0));
      const before=await p.evaluate(()=>JSON.stringify(__underGreen.run));await p.evaluate(()=>advanceTime(1000));
      assert.equal(await p.evaluate(()=>JSON.stringify(__underGreen.run)),before);await p.click('#primary');pauseVerified=true;
     }
    }
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,replays,errors,pauseVerified,limits:['Valid seeded dry-bank states; real keyboard events, browser touch events and emulated gamepad polling drive the complete late-entry/recovery sequence.','Emulation is not physical-device ergonomics or unfamiliar-player validation.','Render samples do not establish all-space actor clearance.']},null,2));
  console.log(JSON.stringify({passed:true,views:views.length,replays:replays.length,pauseVerified,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
