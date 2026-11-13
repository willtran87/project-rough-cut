/* Controlled interaction fixtures, not human balance or completion evidence. */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict');
const {chromium} = require(path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
(async () => {
  const out = path.resolve('output/engagement-2026-11-05'); fs.mkdirSync(out, {recursive:true});
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:2560,height:1600}}), errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  const source = fs.readFileSync('web/game.js','utf8');
  await page.route('**/game.js*', route => route.fulfill({contentType:'application/javascript',body:source.replace(
    '  window.advanceTime = (milliseconds) => {',
    '  window.__engagement = {state,resetFirstHole,render,updateQuietLog,updateTacticalPayoff,showTacticalPayoff,focusedSurvivalPresentation,focusedMapButtonGeometry,activeSprintReviews,NIGHT_ORDER_ACTIONS,floodlightPower,getPlayerEnvironmentState,stationPlan,TOUCH_CONTROLS};\n  window.advanceTime = (milliseconds) => {')}));
  const tick = n => page.evaluate(n => window.advanceTime(n*1000/60), n);
  const read = () => page.evaluate(() => {const t=window.__engagement,h=t.state.hole;return {
    mode:t.state.mode,checks:[...h.nightOrderActionsCompleted],quiet:h.quietLog,signal:h.distractionTimer,
    clean:[...h.fieldSignalBreakaway.completed],balls:h.golfBalls,reserve:h.reviewBallReserve,
    reviews:[...h.reviewsCleared],rewards:h.reviewRewardChoices,lights:h.reviewLightsOutTimer,armed:h.engagement.blackoutArmed,
    power:t.floodlightPower(),payoff:h.tacticalPayoff,hud:t.focusedSurvivalPresentation(),map:h.mapOpen,
  };});
  const reset = async kind => {
    await page.evaluate(kind => {
      const t=window.__engagement,s=t.state;s.keys.clear();t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;
      const h=s.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;
      h.joe.x=100;h.joe.y=30;h.joe.patrolPause=1000;
      const p=kind==='review'?t.activeSprintReviews()[0]:kind==='log'?t.NIGHT_ORDER_ACTIONS[1]:{x:0,y:70};
      s.player.x=p.x;s.player.y=p.y;s.player.yaw=0;
    },kind); await tick(1);
  };
  const shot = async name => {await page.screenshot({path:path.join(out,name+'.png')});};
  try {
    await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(window.render_game_to_text()).assets.course.ready,null,{timeout:60000});
    await reset('log');await page.keyboard.down('c');await tick(1);await shot('quiet-ready-2560');
    const quietReadiness=await page.evaluate(()=>JSON.parse(window.render_game_to_text()).readiness);
    for(const id of ['field_action_commitment_preview','field_signal_breakaway_destination_continuity','loud_station_commitment_pressure_read'])
      assert.equal(quietReadiness.checks.find(c=>c.id===id).passed,true,id);
    await page.keyboard.press('Enter');await tick(30);
    let s=await read();assert.equal(s.checks.length,0);assert(s.quiet.progress>.4);assert.equal(s.signal,0);
    await shot('quiet-progress-2560');await page.keyboard.press('Escape');const frozen=(await read()).quiet.progress;await tick(120);assert.equal((await read()).quiet.progress,frozen);
    await page.keyboard.press('Escape');await page.keyboard.down('c');await tick(80);await page.keyboard.up('c');
    s=await read();assert.deepEqual(s.checks,['field-log']);assert.equal(s.quiet,null);assert.equal(s.signal,0);assert.deepEqual(s.clean,['field-log']);
    await page.keyboard.press('Enter');assert.equal((await read()).checks.length,1);await shot('quiet-success-2560');
    checks.push('Quiet filing requires elapsed crouched stillness, freezes on pause, completes once without signal, and earns clean credit');

    for(const cancel of ['move','stand','sight']) {
      await reset('log');await page.keyboard.down('c');await tick(1);await page.keyboard.press('Enter');await tick(25);
      if(cancel==='move'){await page.keyboard.down('w');await tick(1);await page.keyboard.up('w');}
      if(cancel==='stand'){await page.keyboard.up('c');await tick(1);}
      if(cancel==='sight')await page.evaluate(()=>{const t=window.__engagement;t.state.hole.hasLineOfSight=true;t.updateQuietLog(1/60,false);});
      s=await read();assert.equal(s.quiet,null,cancel);assert.equal(s.checks.length,0,cancel);await page.keyboard.up('c');
    }
    await reset('log');await page.keyboard.press('Enter');s=await read();assert.equal(s.checks.length,1);assert(s.signal>5.5);assert.equal(s.clean.length,0);
    checks.push('Movement, standing, and exposure cancel quietly without credit; standing Use still stamps instantly with the loud signal');

    await reset('review');await tick(20);assert.equal((await read()).reviews.length,0);
    await page.keyboard.press('Enter');s=await read();assert.equal(s.reserve,1);assert.equal(s.lights,0);assert.equal(s.rewards[0].reward,'ball');
    await page.keyboard.press('Enter');assert.equal((await read()).reserve,1);
    await reset('review');await page.keyboard.down('c');await tick(1);await shot('review-choice-2560');await page.keyboard.press('Enter');await page.keyboard.up('c');
    s=await read();assert.equal(s.balls,4);assert.equal(s.reserve,0);assert.equal(s.rewards[0].reward,'lights_out');assert.equal(s.lights,0);assert(s.armed);
    await tick(120);assert((await read()).armed);
    await page.evaluate(()=>{const s=window.__engagement.state;s.player.x=18;s.player.y=242;s.hole.blackoutTimer=0;s.hole.horrorDirector.lightFailureSeconds=0;});await tick(1);
    s=await read();assert(s.lights>17.9,JSON.stringify(s));assert(s.power<.1);assert.equal(s.armed,false);
    const before=s.lights;await page.keyboard.press('Escape');await tick(120);assert.equal((await read()).lights,before);await page.keyboard.press('Escape');
    await shot('review-lights-out-2560');await tick(1100);s=await read();assert.equal(s.lights,0);assert(s.power>.5);
    checks.push('Reviews require Use, grant exactly the selected reward, dim actual floodlight power, pause, expire and restore power');

    for(const kind of ['log','review']) {
      await reset(kind);await page.evaluate(()=>{
        window.engagementPad={connected:true,id:'QA',mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
        Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.engagementPad]});
      });await tick(1);
      await page.evaluate(()=>{window.engagementPad.buttons[4]={pressed:true,value:1};window.engagementPad.buttons[0]={pressed:true,value:1};});await tick(1);
      if(kind==='log'){assert((await read()).quiet);await tick(100);assert.deepEqual((await read()).clean,['field-log']);}
      else assert.equal((await read()).rewards[0].reward,'lights_out');
      await page.evaluate(()=>{window.engagementPad.connected=false;});await tick(1);
    }
    for(const kind of ['log','review']) {
      await reset(kind);await page.setViewportSize({width:844,height:390});
      const points=await page.evaluate(()=>{const t=window.__engagement,r=document.querySelector('canvas').getBoundingClientRect();return ['crouch','interact'].map(k=>{const c=t.TOUCH_CONTROLS[k];return {clientX:r.x+c.x/1280*r.width,clientY:r.y+c.y/720*r.height};});});
      await page.dispatchEvent('canvas','pointerdown',{pointerType:'touch',pointerId:21,button:0,...points[0]});
      await page.dispatchEvent('canvas','pointerdown',{pointerType:'touch',pointerId:22,button:0,...points[1]});await tick(1);
      await page.dispatchEvent('canvas','pointerup',{pointerType:'touch',pointerId:22,button:0,...points[1]});
      if(kind==='log'){assert((await read()).quiet);await shot('touch-quiet-844');await tick(100);assert.deepEqual((await read()).clean,['field-log']);}
      else assert.equal((await read()).rewards[0].reward,'lights_out');
      await page.dispatchEvent('canvas','pointerup',{pointerType:'touch',pointerId:21,button:0,...points[0]});await tick(1);
    }
    await page.setViewportSize({width:2560,height:1600});
    checks.push('Simultaneous controller LB+A and two-finger touch Crouch+Use select both new choices correctly');

    await reset('travel');await page.evaluate(()=>{const t=window.__engagement,h=t.state.hole;h.distraction={kind:'golf_ball',ballId:7,x:60,y:140};h.distractionTimer=4;h.joe.mode='investigate';h.hasLineOfSight=false;t.updateTacticalPayoff(0);t.render();});
    s=await read();assert.equal(s.payoff.kind,'diversion');assert(s.hud.payoff);await shot('outsmarted-2560');
    await page.evaluate(()=>{const t=window.__engagement;t.state.hole.joe.mode='chase';t.updateTacticalPayoff(1);});
    s=await read();assert.equal(s.hud.payoff,null);assert.equal(s.payoff.remaining,2.8);
    await page.evaluate(()=>{const t=window.__engagement;t.state.hole.joe.mode='investigate';t.updateTacticalPayoff(1);});assert((await read()).payoff.remaining<2);
    checks.push('Accepted ball diversion confirms cause; chase overrides confirmation and pauses its remaining display time');
    await page.evaluate(()=>{const t=window.__engagement;t.state.hole.distractionTimer=0;t.updateTacticalPayoff(0);});assert.equal((await read()).payoff,null);

    await reset('travel');
    const lightComparison=await page.evaluate(()=>{const t=window.__engagement,h=t.state.hole;t.state.player.x=18;t.state.player.y=242;h.blackoutTimer=0;h.horrorDirector.lightFailureSeconds=0;
      h.reviewLightsOutTimer=0;const lit=t.getPlayerEnvironmentState().lightExposure;h.reviewLightsOutTimer=18;const dark=t.getPlayerEnvironmentState().lightExposure;return {lit,dark};});
    assert(lightComparison.lit>lightComparison.dark+.1,JSON.stringify(lightComparison));
    checks.push('Lights-out reward reduces authoritative player exposure, not only the rendered beam; expired lure advice retires');

    await reset('travel');
    for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]) {
      await page.setViewportSize({width,height});await tick(1);await shot(`travel-${width}`);
      assert.equal((await read()).hud.bounds.left.height,78);
      const b=await page.evaluate(()=>window.__engagement.focusedMapButtonGeometry()),canvas=await page.locator('canvas').boundingBox();
      await page.mouse.click(canvas.x+(b.x+b.width/2)*canvas.width/1280,canvas.y+(b.y+b.height-3)*canvas.height/720);
      assert.equal((await read()).map,true);await page.keyboard.press('h');assert.equal((await read()).map,false);
      await reset('log');await page.keyboard.down('c');await tick(1);await page.keyboard.press('Enter');await tick(35);await shot(`quiet-${width}`);await page.keyboard.up('c');
      await reset('travel');
    }
    checks.push('Short HUD and actual map hit target work at four viewports; quiet progress captured at all sizes');
    await page.setViewportSize({width:2560,height:1600});
    for(const [name,y] of [['water',220],['clubhouse',315],['range',600]]) {
      await reset('travel');await page.evaluate(y=>{const t=window.__engagement;t.state.player.y=y;t.state.hole.joe.y=20;},y);await tick(1);await shot(`zone-${name}`);
    }
    await reset('travel');s=await read();assert.equal(s.quiet,null);assert.equal(s.payoff,null);assert.equal(s.lights,0);assert.deepEqual(s.rewards,[]);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,checks,errors,sourceHash:require('node:crypto').createHash('sha256').update(source).digest('hex')},null,2));
    console.log(JSON.stringify({passed:true,checks,errors}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
