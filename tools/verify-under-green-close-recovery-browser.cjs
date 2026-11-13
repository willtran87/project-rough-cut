const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/close-recovery';
 const tapes=JSON.parse(fs.readFileSync(out+'/current-examples.json')).filter(t=>t.inputs);
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const views=[],results=[],errors=[];let pauseVerified=false;
 try{
  for(const [width,height,device]of [[2560,1600,'keyboard'],[1280,720,'gamepad'],[844,390,'touch'],[390,844,'touch']]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:device==='touch',isMobile:width<500});
   const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   if(device==='gamepad')await p.addInitScript(()=>{window.recoveryPad={id:'Close recovery test',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[recoveryPad];});
   const cdp=device==='touch'?await context.newCDPSession(p):null;
   await p.goto('http://127.0.0.1:4187/under-green.html?test');
   await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   async function burst(input,frames){
    const action=input.forward>0?'forward':input.forward<0?'back':input.strafe>0?'right':input.strafe<0?'left':null;
    if(device==='keyboard'){
     const key={forward:'w',back:'s',right:'d',left:'a'}[action];if(key)await p.keyboard.down(key);
     await p.evaluate(n=>advanceTime(n*1000/60-1e-6),frames);if(key)await p.keyboard.up(key);
    }else if(device==='gamepad'){
     await p.evaluate(i=>{recoveryPad.axes[0]=i.strafe||0;recoveryPad.axes[1]=-(i.forward||0);},input);
     await p.evaluate(n=>advanceTime(n*1000/60-1e-6),frames);
     await p.evaluate(()=>{recoveryPad.axes[0]=recoveryPad.axes[1]=0;});
    }else{
     if(action){const b=await p.locator(`[data-key="${action}"]`).boundingBox();assert(b);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}]});}
     await p.evaluate(n=>advanceTime(n*1000/60-1e-6),frames);
     if(action)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
   }
   for(const tape of tapes){
    if(device==='gamepad')await p.evaluate(()=>{recoveryPad.axes[0]=recoveryPad.axes[1]=0;advanceTime(1000/60);});
    await p.evaluate(r=>{__underGreen.run=structuredClone(r);__underGreen.clearInput();advanceTime(0);},tape.initial);
    if(device==='touch')await p.touchscreen.tap(width/2,height/2);
    let frame=0;
    for(const stage of [{name:'surge',frame:tape.hitFrame},{name:'displacement',frame:tape.hitFrame+6},{name:'bank',frame:tape.inputs.length}]){
     while(frame<stage.frame){
      const input=tape.inputs[frame];let stop=frame+1;
      while(stop<stage.frame&&JSON.stringify(tape.inputs[stop])===JSON.stringify(input))stop++;
      await burst(input,stop-frame);frame=stop;
     }
     const state=await p.evaluate(()=>{advanceTime(0);const r=__underGreen.run;return {mode:r.mode,time:r.time,elapsed:r.elapsed,player:r.player,hits:r.waterHits,inputMethod:JSON.parse(render_game_to_text()).inputMethod,touch:!document.getElementById('touch').hidden,caption:document.getElementById('caption').textContent};});
     const expected=tape.frames[stage.frame-1];
     assert.equal(state.mode,expected.mode);assert.equal(state.hits,expected.hits);
     assert(Math.hypot(state.player.x-expected.player.x,state.player.y-expected.player.y)<1e-7,JSON.stringify({name:tape.name,width,stage:stage.name,state,expected}));
     if(stage.name==='surge')assert(state.player.recovery,'Real late entry must start a continuous shove');
     if(device==='touch')assert(state.touch);
     if(stage.name==='bank'){
      assert.equal(state.inputMethod,device);assert.equal(state.hits,1);assert(!state.player.recovery);
      assert(Math.abs(state.elapsed-tape.final.elapsed)<1e-7);results.push({name:tape.name,width,device,...state});
     }
     await p.evaluate(()=>__underGreen.whenPresented());const file=`${out}/${tape.name}-${stage.name}-${width}.png`;
     await p.screenshot({path:file});views.push({name:tape.name,stage:stage.name,width,height,device,file,...state});
     fs.writeFileSync(out+'/browser-partial.json',JSON.stringify({views,results,errors,pauseVerified},null,2));
     if(!pauseVerified&&stage.name==='surge'&&device==='keyboard'){
      await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(0));const before=await p.evaluate(()=>JSON.stringify(__underGreen.run));
      await p.evaluate(()=>advanceTime(1000));assert.equal(await p.evaluate(()=>JSON.stringify(__underGreen.run)),before);
      await p.click('#primary');pauseVerified=true;
     }
    }
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,results,errors,pauseVerified,limits:['Seeded dry-bank fixtures, then ordinary keyboard/browser-touch events and emulated controller polling.','Checks both-bank approaches and recovery steering; not a full chapter run or physical-device/human acceptance.']},null,2));
  console.log(JSON.stringify({passed:true,replays:results.length,views:views.length,errors,pauseVerified}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
