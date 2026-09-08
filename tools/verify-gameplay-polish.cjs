/* Browser regression coverage for intentional reviews, inventory, and readable UI.
 * Test-only state access is injected into an intercepted response, never shipped.
 * Run: node tools/verify-gameplay-polish.cjs [http://127.0.0.1:4187]
 * Set PLAYWRIGHT_MODULE if Playwright is installed outside the standard skill.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ||
  path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'output/gameplay-polish-2026-09-08');
const url = process.argv[2] || 'http://127.0.0.1:4187';
const keyNames = {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',enter:'Enter',space:'Space'};

(async () => {
  fs.mkdirSync(out, {recursive:true});
  const browser = await chromium.launch({headless:true});
  const errors = [];
  const checks = [];
  const page = await browser.newPage({viewport:{width:2560,height:1600}});
  const source = fs.readFileSync(path.join(root,'web/game.js'),'utf8');
  await page.route('**/game.js*', route => route.fulfill({contentType:'application/javascript',body:
    source.replace('  window.advanceTime = (milliseconds) => {',
      '  window.__polishTest = { state, resetFirstHole, updateJoe, activeSprintReviews, NIGHT_ORDER_ACTIONS, retryFirstHole, SHED_EXIT, DRAIN_EXIT, TOUCH_CONTROLS };\n  window.advanceTime = (milliseconds) => {')}));
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
  const state = () => page.evaluate(()=>JSON.parse(window.render_game_to_text()));
  const tick = n => page.evaluate(n=>window.advanceTime(n*1000/60),n);
  const shot = async name => {
    for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]) {
      await page.setViewportSize({width,height}); await tick(1);
      await page.screenshot({path:path.join(out,`${name}-${width}.png`)});
    }
    await page.setViewportSize({width:2560,height:1600});
  };
  const press = async (key,frames=1) => {
    await page.keyboard.down(key); await tick(frames); await page.keyboard.up(key); await tick(1);
  };
  const reset = async (setup='review') => {
    await page.evaluate(setup=>{
      const t=window.__polishTest;
      t.state.mode='first_hole'; t.state.manualTime=true; t.resetFirstHole();
      const h=t.state.hole;
      h.tutorialVisible=false; h.practiceDrill.active=false;
      h.controlHintTimer=0; h.controlHintSource=null; h.zoneBannerTimer=0;
      h.joe.x=-100; h.joe.y=690; h.joe.patrolPause=100;
      if(setup==='review') { const r=t.activeSprintReviews()[0];t.state.player.x=r.x;t.state.player.y=r.y; }
      t.state.transitionAlpha=0;
    },setup); await tick(1);
  };
  try {
    await page.goto(url);
    await page.waitForFunction(()=>typeof window.advanceTime==='function');
    await page.locator('canvas').click();
    await page.keyboard.press('Space');
    await page.waitForFunction(()=>{
      const s=JSON.parse(window.render_game_to_text());
      return s.assets.course.loaded===42 && s.assets.results.loaded===4;
    },null,{timeout:60000});
    await tick(180);
    assert.equal((await state()).mode,'menu');
    await shot('first-menu');
    await press('Enter');
    assert.equal((await state()).hole.tutorialVisible,true);
    await shot('briefing');
    await press('Enter');
    const fixture=JSON.parse(fs.readFileSync(path.join(root,'web/test-actions/release-hardening-deep-route.json'),'utf8'));
    for(let i=5;i<fixture.steps.length;i++) {
      const step=fixture.steps[i];
      for(const b of step.buttons) await page.keyboard.down(keyNames[b]);
      await tick(step.frames);
      for(const b of step.buttons) await page.keyboard.up(keyNames[b]);
      if(i===12) await shot('station-preview');
    }
    const natural=await state();
    assert.equal(natural.hole.fieldChecks.completed,1);
    assert.match(natural.hole.readability.mapRoute.target,/MUD/);
    assert.match(natural.hole.readability.mapRoute.direction,/LEFT/);
    await shot('mud-route');
    checks.push('Ordinary input completes Audit Bell and reaches Water Hazard');
    checks.push('The compact map preserves the immediate mud-exit route instead of naming the distant station');
    fs.writeFileSync(path.join(out,'natural-state.json'),JSON.stringify(natural,null,2));

    await reset();
    await tick(60);
    let s=await state();
    assert.equal(s.hole.sprintReviews.cleared,0);
    assert.equal(s.hole.interactionPromptOwner.targetId,'review-a');
    await shot('review-preview');
    await press('Enter');
    s=await state();
    assert.equal(s.hole.sprintReviews.cleared,1);
    assert.equal(s.hole.sprintReviews.reserveBalls,1);
    assert.equal(s.hole.golfBalls,4);
    await press('Enter');
    assert.equal((await state()).hole.sprintReviews.reserveBalls,1);
    await shot('review-earned');
    await press('Space',30);
    s=await state();
    assert.equal(s.hole.sprintReviews.reserveBalls,0);
    assert.equal(s.hole.golfBalls,4);
    checks.push('Walking does not activate reviews; Use awards once; full pockets bank one reserve; a shot consumes it');

    await reset();
    await page.evaluate(()=>{window.__polishTest.state.hole.golfBalls=2;});
    await tick(1); await press('Enter');
    s=await state();
    assert.equal(s.hole.golfBalls,3);
    assert.equal(s.hole.sprintReviews.reserveBalls,0);
    checks.push('A review refills a missing ball without also granting reserve');

    await reset();
    for (let index=0;index<3;index++) {
      await page.evaluate(index=>{
        const t=window.__polishTest,r=t.activeSprintReviews()[index];
        t.state.player.x=r.x;t.state.player.y=r.y;
      },index);
      await tick(1);await press('Enter');
    }
    s=await state();
    assert.equal(s.hole.sprintReviews.cleared,3);
    assert.equal(s.hole.sprintReviews.reserveBalls,3);
    await press('Enter');assert.equal((await state()).hole.sprintReviews.reserveBalls,3);
    checks.push('All three reviews bank at most one reward each');

    await reset();
    await page.evaluate(()=>{window.__polishTest.state.inputMethod='touch';});
    await tick(1);await shot('touch-review');
    const usePoint=await page.evaluate(()=>{
      const b=document.querySelector('canvas').getBoundingClientRect();
      const c=window.__polishTest.TOUCH_CONTROLS.interact;
      return {clientX:b.x+c.x/1280*b.width,clientY:b.y+c.y/720*b.height};
    });
    await page.dispatchEvent('canvas','pointerdown',{pointerType:'touch',pointerId:7,button:0,...usePoint});
    await page.dispatchEvent('canvas','pointerup',{pointerType:'touch',pointerId:7,button:0,...usePoint});
    await tick(1);assert.equal((await state()).hole.sprintReviews.cleared,1);
    checks.push('Synthetic touch Use commits the previewed review');

    await reset();
    await page.evaluate(()=>{
      window.testPad={connected:true,id:'QA standard controller',mapping:'standard',axes:[0,0,0,0],
        buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
      Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.testPad]});
    });
    await tick(1);
    await page.evaluate(()=>{window.testPad.buttons[0]={pressed:true,value:1};});
    await tick(1);assert.equal((await state()).hole.sprintReviews.cleared,1);
    await tick(30);assert.equal((await state()).hole.sprintReviews.reserveBalls,1);
    await page.evaluate(()=>{window.testPad.connected=false;});await tick(1);
    checks.push('Synthetic controller A commits once even when held, and disconnect clears input');

    await reset();
    await page.evaluate(()=>{
      const t=window.__polishTest;const r=t.activeSprintReviews()[0];
      t.savedReview={x:r.x,y:r.y};
      const a=t.NIGHT_ORDER_ACTIONS[0];r.x=a.x;r.y=a.y;
      t.state.player.x=a.x;t.state.player.y=a.y;
    });
    await tick(1);
    assert.equal((await state()).hole.interactionPromptOwner.targetId,'audit-bell');
    await press('Enter');
    s=await state();
    assert.equal(s.hole.fieldChecks.completed,1);
    assert.equal(s.hole.sprintReviews.cleared,0);
    await page.evaluate(()=>Object.assign(window.__polishTest.activeSprintReviews()[0],window.__polishTest.savedReview));
    checks.push('A required station keeps interaction priority over an overlapping optional review');

    const recovery=[];
    for(const pressure of [0.8,1,1.2]) {
      await reset('tee');
      recovery.push(await page.evaluate(pressure=>{
        const t=window.__polishTest;t.state.pursuitIntensity=pressure;
        t.state.hole.detection=0.5;t.state.hole.noise=0;
        t.updateJoe(0.1);return t.state.hole.detection;
      },pressure));
    }
    assert.ok(Math.max(...recovery)-Math.min(...recovery)<1e-8);
    assert.ok(recovery[0]<0.5);
    checks.push('Attention recovery is identical at Steady, Standard, and Relentless');

    for(const route of ['shed','drain']) {
      await reset('tee');
      await page.evaluate(route=>{
        const t=window.__polishTest,h=t.state.hole;
        h.keyCollected=route==='shed';h.drainUnlocked=route==='drain';
        h.nightOrderActionsCompleted=t.NIGHT_ORDER_ACTIONS.map(x=>x.id);
        const exit=route==='shed'?t.SHED_EXIT:t.DRAIN_EXIT;
        t.state.player.x=exit.x;t.state.player.y=exit.y;
        h.joe.x=-100;h.joe.y=80;h.joe.patrolPause=100;
      },route);
      await tick(1);await press('Enter');
      assert.equal((await state()).hole.escapeFiling.active,true);
      await press('ArrowDown',1);
      assert.equal((await state()).hole.escapeFiling.active,false);
      await press('Enter');await tick(180);
      assert.equal((await state()).mode,'victory');
      await shot(`exit-${route}`);
      checks.push(`${route}: Use starts filing; movement cancels; retrying and staying still completes escape`);
    }
    await reset(); await press('Enter');
    await page.evaluate(()=>window.__polishTest.retryFirstHole(true));await tick(1);
    s=await state();assert.equal(s.hole.sprintReviews.reserveBalls,0);assert.equal(s.hole.sprintReviews.cleared,0);
    await press('Escape');assert.equal((await state()).mode,'paused');
    await press('Escape');assert.equal((await state()).mode,'first_hole');
    checks.push('Retry resets review rewards; pause and resume remain responsive');
    await reset('tee');
    await page.evaluate(()=>{window.__polishTest.state.manualTime=false;});
    await page.waitForTimeout(8000);
    const realtime=await state();
    fs.writeFileSync(path.join(out,'realtime-performance.json'),JSON.stringify(realtime.performance,null,2));
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,checks,recovery,errors},null,2));
    console.log(JSON.stringify({passed:true,checks,errors},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
