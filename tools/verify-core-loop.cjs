/* Focused loop regressions; controlled setups use test-only source interception. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=path.resolve('output/core-loop-2026-09-11');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:2560,height:1600}});
 const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/game.js','utf8');
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__loopTest={state,resetFirstHole,NIGHT_ORDER_ACTIONS,SHED_EXIT,DRAIN_EXIT,courseAttentionPresentation,playerNextActionPresentation};\n  window.advanceTime = (milliseconds) => {')}));
 const tick=n=>page.evaluate(n=>window.advanceTime(n*1000/60),n);
 const read=()=>page.evaluate(()=>{const s=JSON.parse(window.render_game_to_text());return {mode:s.mode,player:s.player,action:s.hole.readability.nextAction,filing:s.hole.escapeFiling,checks:s.hole.fieldChecks};});
 const press=async(key,n=1)=>{await page.keyboard.down(key);await tick(n);await page.keyboard.up(key);await tick(1);};
 const reset=async(route=null)=>{
  await page.evaluate(route=>{const t=window.__loopTest;t.resetFirstHole();t.state.mode='first_hole';t.state.manualTime=true;t.state.transitionAlpha=0;
   const h=t.state.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;
   h.joe.x=100;h.joe.y=50;h.joe.patrolPause=100;
   if(route){h.nightOrderActionsCompleted=t.NIGHT_ORDER_ACTIONS.map(a=>a.id);h.keyCollected=route==='shed';h.drainUnlocked=route==='drain';
    const p=route==='shed'?t.SHED_EXIT:t.DRAIN_EXIT;t.state.player.x=p.x;t.state.player.y=p.y-10;}
   else {t.state.player.x=86;t.state.player.y=148;h.joe.y=690;}
  },route);await tick(1);
 };
 const shots=async name=>{for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]){await page.setViewportSize({width,height});await tick(1);await page.screenshot({path:path.join(out,`${name}-${width}.png`)});}await page.setViewportSize({width:2560,height:1600});};
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>typeof window.advanceTime==='function');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.waitForFunction(()=>{const s=JSON.parse(window.render_game_to_text());return s.assets.course.loaded===42&&s.assets.results.loaded===4;},null,{timeout:60000});await tick(180);
  await press('Enter');await press('Enter');await tick(90);
  assert.equal((await read()).action.text,'TRY A PRACTICE CHIP');await shots('practice-invitation');
  await reset();assert.match((await read()).action.text,/AUDIT BELL/);await shots('station-ready');await press('Enter');
  let s=await read();assert.equal(s.checks.completed,1);assert.equal(s.action.text,'REACH HEDGE TUNNEL');assert.equal(s.action.progress,'CHECK 1/3 COMPLETE');await shots('check-complete');
  await page.evaluate(()=>{const t=window.__loopTest;t.state.player.x=20;t.state.player.y=100;});await tick(1);
  assert.equal((await read()).action.text,'HOLD STILL IN COVER');await shots('cover-hold');await tick(450);
  assert.match((await read()).action.progress,/CHECKS 1\/3/);assert.equal((await read()).action.completedNow,false);
  checks.push('Practice is discoverable; filed check counts once; immediate cover/hold owns action; progress persists after completion feedback');
  for(const route of ['shed','drain']){
   await reset(route);await page.keyboard.down('ArrowUp');await tick(2);const origin=(await read()).player;
   await press('Enter');s=await read();assert.equal(s.filing.active,true);assert.equal(s.filing.approachInputConsumed,true);
   await shots(`${route}-filing`);await tick(150);s=await read();assert.equal(s.mode,'victory');assert.equal(s.player.x,origin.x);assert.equal(s.player.progress,origin.progress);
   await page.keyboard.up('ArrowUp');await tick(1);
   await reset(route);await page.keyboard.down('ArrowUp');await tick(1);await press('Enter');await page.keyboard.up('ArrowUp');await tick(1);await press('ArrowUp');
   assert.equal((await read()).filing.active,false);
   await reset(route);await page.keyboard.down('ArrowUp');await tick(1);await press('Enter');await page.keyboard.up('ArrowUp');await page.keyboard.down('ArrowDown');await tick(1);
   assert.equal((await read()).filing.active,false);await page.keyboard.up('ArrowDown');await tick(1);
   checks.push(`${route}: held approach input is consumed without movement; release and new input or direction change cancels`);
  }
  await reset('shed');
  await page.evaluate(()=>{window.loopPad={connected:true,id:'QA',mapping:'standard',axes:[0,-1,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.loopPad]});});await tick(2);
  await page.evaluate(()=>{window.loopPad.buttons[0]={pressed:true,value:1};});await tick(1);assert.equal((await read()).filing.active,true);
  await page.evaluate(()=>{window.loopPad.buttons[0]={pressed:false,value:0};});await tick(150);assert.equal((await read()).mode,'victory');
  await page.evaluate(()=>{window.loopPad.connected=false;});await tick(1);checks.push('Synthetic controller movement plus A also completes filing');
  await reset('drain');await page.setViewportSize({width:844,height:390});await tick(1);
  const touchPoint=async(x,y)=>page.evaluate(({x,y})=>{const r=document.querySelector('canvas').getBoundingClientRect();return {clientX:r.x+x/1280*r.width,clientY:r.y+y/720*r.height};},{x,y});
  const pad=await touchPoint(116,544),use=await touchPoint(1008,568);
  await page.dispatchEvent('canvas','pointerdown',{pointerType:'touch',pointerId:10,button:0,...pad});await tick(2);
  await page.dispatchEvent('canvas','pointerdown',{pointerType:'touch',pointerId:11,button:0,...use});await tick(1);
  await page.dispatchEvent('canvas','pointerup',{pointerType:'touch',pointerId:11,button:0,...use});
  assert.equal((await read()).filing.active,true);await shots('touch-filing');await tick(150);assert.equal((await read()).mode,'victory');
  await page.dispatchEvent('canvas','pointerup',{pointerType:'touch',pointerId:10,button:0,...pad});await tick(1);
  checks.push('Synthetic touch pad held while tapping Use completes filing; the readable panel clears the touch controls');
  await reset();
  const threat=await page.evaluate(()=>{const t=window.__loopTest,h=t.state.hole;h.joe.mode='chase';h.hasLineOfSight=true;return t.courseAttentionPresentation(h.environment,1).text;});assert.equal(threat,'JOE SEES YOU');
  checks.push('Chase attention explicitly explains visible detection');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify(await read(),null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
