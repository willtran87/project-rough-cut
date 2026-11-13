const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/course-portrait/'+(software?'software':'hardware');
 fs.mkdirSync(out,{recursive:true});const errors=[],views=[],checks=[];
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const c=await b.newContext({viewport:{width:2560,height:1600},hasTouch:true,isMobile:true}),p=await c.newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__portrait={state,resetFirstHole,render,TOUCH_CONTROLS,actions:NIGHT_ORDER_ACTIONS};\n  window.advanceTime = (milliseconds) => {')}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
 const draw=()=>p.evaluate(async()=>{__portrait.render();await RCScene3D.whenPresented();});
 const read=()=>p.evaluate(()=>({player:{...__portrait.state.player},mode:__portrait.state.mode,touch:{...__portrait.state.touch},focus:__portrait.state.hole.focus,crouched:__portrait.state.hole.crouched,run:JSON.parse(render_game_to_text()).touchRun}));
 const cdp=await c.newCDPSession(p),contacts=new Map();
 const send=type=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[...contacts].map(([id,q])=>({id,...q,radiusX:6,radiusY:6,force:1}))});
 const start=async(id,q)=>{contacts.set(id,q);await send('touchStart');};
 const move=async(id,q)=>{contacts.set(id,q);await send('touchMove');};
 const end=async id=>{const q=contacts.get(id);contacts.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:contacts.size?[{id,...q}]:[]});};
 const center=id=>p.evaluate(id=>{const r=document.querySelector(`[data-touch-control="${id}"]`).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},id);
 const tap=async id=>{await start(8,await center(id));await end(8);await tick(17);};
 const capture=async name=>{
  await draw();await p.screenshot({path:out+'/'+name+'.png'});
  const view=await p.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
   return {screen:[innerWidth,innerHeight],canvas:rect(document.querySelector('#game')),aspect:RCScene3D.stats().cameraAspect,resolution:RCScene3D.stats().resolution,
    controls:[...document.querySelectorAll('[data-touch-control]')].map(e=>({id:e.dataset.touchControl,...rect(e)})),messages:rect(document.querySelector('.q-messages')),resources:rect(document.querySelector('.q-resources'))};
  });views.push({name,...view});return view;
 };
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__portrait);await p.locator('#game').click();
  await p.evaluate(()=>{
   const s=__portrait.state;__portrait.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,inputMethod:'touch',transitionAlpha:0,guidedHints:false,apparitions:false});
   Object.assign(s.hole,{tutorialVisible:false,messageTimer:0,zoneBannerTimer:0,elapsed:100});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';
   Object.assign(s.player,{x:0,y:40,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:20,mode:'patrol',patrolPause:9999});
  });await tick(17);await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{__portrait.state.hole.tutorialVisible=true;});await tick(17);await draw();
  await p.locator('[data-brief-start]').tap();await tick(17);assert(!(await p.evaluate(()=>__portrait.state.hole.tutorialVisible)));checks.push('Portrait briefing scrolls to its actual touch start button and enters play');
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[320,568]]){
   await p.setViewportSize({width,height});await tick(17);const v=await capture('view-'+width);
   if(height>width){
    assert(Math.abs(v.aspect-v.canvas.width/v.canvas.height)<.01);assert(v.canvas.height>height*.9);
    for(const r of v.controls){assert(r.width>=44&&r.height>=44,JSON.stringify(r));assert(r.x>=0&&r.y>=0&&r.x+r.width<=width+1&&r.y+r.height<=height+1,JSON.stringify(r));}
   }else assert.equal(v.aspect,16/9);
  }
  await p.evaluate(()=>RCQualityUI.render({scale:1.3,zone:'Release corridor',goal:'Finish the field checks and reach an exit',context:'Complete the three field checks, find the shed key or open the drain valve, then use your chosen exit and stay still until the filing finishes.',caption:'JOE MOWER RATTLES BEHIND THE STONE WALL - FOOTSTEPS APPROACH FROM THE LEFT',resources:'4 balls | 2/3 checks | Shed key',touch:__portrait.TOUCH_CONTROLS}));
  await p.screenshot({path:out+'/text-stress-320.png'});
  const stack=await p.evaluate(()=>{
   const m=document.querySelector('.q-messages'),r=m.getBoundingClientRect(),pause=document.querySelector('[data-touch-control=pause]').getBoundingClientRect(),resources=document.querySelector('.q-resources').getBoundingClientRect(),objective=document.querySelector('.q-objective').getBoundingClientRect();
   return {objectiveRight:objective.right,pauseLeft:pause.left,top:r.top,bottom:r.bottom,headerBottom:Math.max(pause.bottom,objective.bottom),resourcesTop:resources.top,scrollable:m.scrollHeight>m.clientHeight,scrollTop:m.scrollTop};
  });assert(stack.objectiveRight<stack.pauseLeft);assert(stack.top>=stack.headerBottom&&stack.bottom<=stack.resourcesTop,JSON.stringify(stack));assert(stack.scrollable&&stack.scrollTop>0);
  const beforeScroll=await read();await start(9,{x:160,y:stack.bottom-30});await move(9,{x:160,y:stack.bottom+30});await end(9);
  await p.waitForFunction(value=>document.querySelector('.q-messages').scrollTop<value,stack.scrollTop);assert.deepEqual((await read()).player,beforeScroll.player);
  await p.locator('.q-messages').focus();await p.keyboard.press('Home');await p.waitForFunction(()=>document.querySelector('.q-messages').scrollTop===0);await p.locator('#game').focus();
  checks.push('320px maximum text size keeps header/buttons separate and long messages in a scrollable region above controls');
  await p.setViewportSize({width:390,height:844});await tick(17);await draw();
  await start(10,{x:195,y:350});await end(10);await tick(17);await draw();
  const pad=await center('move'),forward={x:pad.x,y:pad.y-40},look={x:195,y:350},before=await read();
  await start(1,pad);await move(1,forward);await start(2,look);await p.waitForFunction(()=>__portrait.state.touch.moveY>.5);await tick(500);assert((await read()).player.y>before.player.y+5);
  await move(2,{x:look.x+35,y:look.y-20});await p.waitForFunction(()=>__portrait.state.player.yaw>.1);await tick(17);assert((await read()).player.yaw>before.player.yaw);
  await end(2);await end(1);await tick(17);assert.equal((await read()).touch.moveX,0);assert.equal((await read()).touch.moveY,0);checks.push('Portrait multitouch moves and turns simultaneously; release stops movement');
  await p.evaluate(()=>{__portrait.state.touchSprintToggle=true;});await tap('sprint');assert((await read()).run.active);await tap('sprint');assert(!(await read()).run.active);
  await start(7,await center('lookBack'));await tick(100);assert((await read()).touch.lookBackPointerId!==null);await capture('rear-390');await end(7);await tick(100);
  await start(6,await center('aim'));await tick(400);assert(await p.evaluate(()=>__portrait.state.hole.ballAim.active));await capture('chip-390');assert(await p.locator('[data-q=progressLabel]').isVisible());const charge=await p.evaluate(()=>__portrait.state.hole.ballAim.power);assert.equal(await p.locator('.q-context progress').evaluate(e=>e.value),charge);await end(6);await tick(100);assert(await p.evaluate(()=>!!__portrait.state.hole.ballFlight));await tick(2000);checks.push('Portrait Run toggle, Rear and charged Chip use real touch regions');
  await p.evaluate(()=>{const h=__portrait.state.hole;h.engagement.experience.arrival={age:2,phase:'latched',lockAt:.55,phoneCaptionShown:true};Object.assign(h.joe,{x:100,y:20,mode:'patrol',patrolPause:9999});h.hasLineOfSight=h.playerAudible=false;h.detection=0;h.ballFlight=null;});await tick(17);await capture('phone-390');await p.evaluate(()=>{__portrait.state.hole.engagement.experience.arrival.phase='skipped';});
  await start(3,await center('crouch'));await tick(100);assert((await read()).crouched);await end(3);await tick(100);
  await start(4,await center('focus'));await tick(100);assert((await read()).focus);const focused=await capture('listen-390');assert(focused.canvas.height>800);assert(await p.locator('.q-listening-header').isVisible());
  const focusPad=await center('move'),focusBefore=await read();await start(11,focusPad);await move(11,{x:focusPad.x,y:focusPad.y-40});await tick(300);assert((await read()).player.y!==focusBefore.player.y);await end(11);
  await end(4);await tick(100);assert(!(await read()).focus);assert(!(await p.locator('.q-listening-header').isVisible()));checks.push('Crouch and listening focus respond to real touches; held Listen keeps portrait controls usable during movement');
  await draw();await tap('pause');assert.equal((await read()).mode,'paused');await p.keyboard.press('Escape');await tick(17);await draw();assert.equal((await read()).mode,'first_hole');
  await p.locator('.q-map').tap();await tick(17);assert(await p.evaluate(()=>__portrait.state.hole.mapOpen));await p.keyboard.press('h');await tick(17);await draw();assert(!(await p.evaluate(()=>__portrait.state.hole.mapOpen)));checks.push('Pause/resume and map round trips restore portrait gameplay');
  await start(5,await center('move'));const movingPad=await center('move');await move(5,{x:movingPad.x,y:movingPad.y-40});await tick(50);await p.setViewportSize({width:844,height:390});await tick(17);assert.equal((await read()).touch.moveY,0);await end(5);await capture('rotated-844');checks.push('Rotation clears active movement and restores landscape camera');
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{const s=__portrait.state,h=s.hole;Object.assign(s.player,{x:-78,y:683,yaw:0,pitch:0});h.keyCollected=h.drainUnlocked=true;h.nightOrderActionsCompleted=__portrait.actions.map(a=>a.id);Object.assign(h.joe,{x:100,y:20,mode:'patrol',patrolPause:9999});});await tick(17);await draw();await tap('interact');assert(await p.evaluate(()=>__portrait.state.hole.escapeFiling.active));await tick(5000);assert.equal((await read()).mode,'victory');checks.push('Portrait Use files the ready drain and reaches victory');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,views,checks,errors},null,2));console.log(JSON.stringify({passed:true,software,checks,errors}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,state:await read(),views,checks,errors},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
