const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const probe=process.argv.includes('--probe');
const remapped=process.argv.includes('--remapped'),rearKey=remapped?'y':'r',useKey=remapped?'t':'e';
(async()=>{
 const out='output/on-foot-view-interactions';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],results=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.level-one-opening.v1','{"skip":true}'));
  if(remapped)await p.addInitScript(()=>localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindingVersion:2,keyboardBindings:{interact:'KeyT',look_back:'KeyY',move_up:'KeyI',move_left:'KeyJ',move_down:'KeyK',move_right:'KeyL',chip:'KeyB'}})));
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__viewTest={state,resetFirstHole,NIGHT_ORDER_ACTIONS,nearbyNightOrderAction,interactionVisible,courseInteractionPromptPresentation,lookBackView};\n  window.advanceTime = (milliseconds) => {')}));
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  for(const chapter of ['under-green','index']){
   await p.goto(`http://127.0.0.1:4187/${chapter}.html?test`);
   if(chapter==='under-green'){await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await p.click('#primary');}
   else {await p.waitForFunction(()=>window.__viewTest&&window.roughCutRebuild,null,{timeout:90000});await p.locator('canvas').click();await p.keyboard.press('Space');}
   async function setup(reverse=false){
    await p.evaluate(async({chapter,reverse})=>{
     if(chapter==='under-green'){
      const {createRun}=await import('./under-green-sim.js'),{LEVER}=await import('./under-green-course.js');
      const r=createRun(1);r.mode='playing';r.messageTime=0;Object.assign(r.joe,{phase:'search',x:0,y:5,last:{x:0,y:5}});Object.assign(r.player,{x:LEVER.x-1.7,y:LEVER.y,yaw:Math.PI/2+(reverse?Math.PI:0),pitch:0});__underGreen.run=r;__underGreen.clearInput();
     }else{
      const t=__viewTest;t.resetFirstHole();const s=t.state,h=s.hole,a=t.NIGHT_ORDER_ACTIONS[0];
      s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.freeLook=true;h.tutorialVisible=false;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;h.joe.x=100;h.joe.y=690;h.joe.patrolPause=9999;
      Object.assign(s.player,{x:a.x,y:a.y-8,yaw:reverse?Math.PI:0,pitch:-.1});
     }
    },{chapter,reverse});await tick(17);
    if(chapter==='index')await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:90000});
   }
   const read=()=>p.evaluate(chapter=>{
    if(chapter==='under-green'){const s=JSON.parse(render_game_to_text());return {action:s.action?.id||null,used:s.bypass,heading:s.player.yaw,view:s.player.yaw+(s.player.rearAngle||0),prompt:!document.getElementById('use').hidden,label:document.getElementById('use').textContent};}
    const t=__viewTest;return {action:t.nearbyNightOrderAction()?.action.id||null,used:t.state.hole.nightOrderActionsCompleted.includes(t.NIGHT_ORDER_ACTIONS[0].id),heading:t.state.player.yaw,view:t.lookBackView().angle,mode:t.state.mode,keys:[...t.state.keys],elapsed:t.state.hole.elapsed,prompt:t.courseInteractionPromptPresentation().owner?.targetId||null,label:t.courseInteractionPromptPresentation().text};
   },chapter);
   await setup();const front=await read();await p.keyboard.down(rearKey);await tick(500);const away=await read();
   await p.keyboard.press(useKey);await tick(17);const attemptedAway=await read();await p.keyboard.up(rearKey);await tick(700);const returned=await read();
   await setup(true);const reverse=await read();await p.keyboard.down(rearKey);await tick(500);const visibleRear=await read();
   for(const [width,height]of (probe||remapped?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]])){
    await p.setViewportSize({width,height});await tick(0);await p.screenshot({path:`${out}/${chapter}-${probe?'before':remapped?'remapped':'after'}-rear-${width}.png`});
   }
   await p.setViewportSize({width:2560,height:1600});
   await p.keyboard.press(useKey);await tick(17);const attemptedRear=await read();await p.keyboard.up(rearKey);
   const row={chapter,front,away,attemptedAway,returned,reverse,visibleRear,attemptedRear};results.push(row);
   if(!probe){
    assert(front.action);assert.equal(away.action,null);assert(!attemptedAway.used);assert.equal(returned.action,front.action);
    assert.equal(reverse.action,null);assert.equal(visibleRear.action,front.action);assert(attemptedRear.used);
    assert.equal(away.heading,front.heading);assert.equal(visibleRear.heading,reverse.heading);
    assert(front.label.startsWith(useKey.toUpperCase()));assert(visibleRear.label.startsWith(useKey.toUpperCase()));
    assert(!away.prompt);assert(visibleRear.prompt);
    if(chapter==='under-green'){assert(!away.prompt);assert(visibleRear.prompt);}
   }
  }
  const coaching={};
  if(remapped){
   await p.evaluate(()=>{const t=__viewTest;t.resetFirstHole();const s=t.state,h=s.hole;s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.learnedControls={};s.learnedControlsByDevice={};s.inputMethod='keyboard';h.tutorialVisible=false;h.messageTimer=0;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;h.joe.x=100;h.joe.y=690;h.joe.patrolPause=9999;Object.assign(s.player,{x:0,y:12,yaw:0,pitch:-.25});});await tick(17);
   coaching.move=await p.locator('.q-context').innerText();assert.match(coaching.move,/I\/J\/K\/L/);assert(!coaching.move.includes('WASD'));
   await p.evaluate(()=>{__viewTest.state.learnedControls={move:true,look:true};__viewTest.state.hole.practiceDrill.active=true;__viewTest.state.hole.practiceDrill.completed=false;});await tick(17);
   coaching.lesson=await p.locator('.q-context').innerText();assert.match(coaching.lesson,/hold B\b.*release/i);
   await p.keyboard.down('b');await tick(100);assert(await p.evaluate(()=>__viewTest.state.hole.ballAim.active));
   coaching.aim=await p.locator('.q-context').innerText();assert.match(coaching.aim,/Release B to chip/);await p.screenshot({path:out+'/index-remapped-chip-2560.png'});
   await p.keyboard.up('b');assert(await p.evaluate(()=>!!__viewTest.state.hole.ballFlight));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${probe?'before':remapped?'remapped':'verified'}.json`,JSON.stringify({passed:!probe,results,coaching,errors},null,2));console.log(JSON.stringify({passed:!probe,remapped,coaching,chapters:results.map(r=>({chapter:r.chapter,away:r.away.action,offscreenActivated:r.attemptedAway.used,visibleRear:r.visibleRear.action,rearActivated:r.attemptedRear.used}))}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
