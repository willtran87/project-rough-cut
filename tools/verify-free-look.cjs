/* Controlled prerequisites isolate camera/control regressions from pursuit balance. */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
(async () => {
  const extended = process.argv.includes('--perf-extended');
  const out = path.resolve(extended ? 'output/a-grade-closure/turn-investigation/extended' : 'output/free-look'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const source = fs.readFileSync('web/game.js', 'utf8');
  await page.route('**/game.js*', r => r.fulfill({ contentType: 'application/javascript', body: source.replace(
    '  window.advanceTime = (milliseconds) => {',
    '  window.__viewTest = {state, resetFirstHole, worldToScreen, cameraRelativePoint, guidanceDirection, clearanceInstruction, NIGHT_ORDER_ACTIONS, SHED_EXIT, DRAIN_EXIT, beginGolfBallAim, golfBallAimTarget, enterPause, resumeFirstHole, beginGameplayPerformanceWindow};\n  window.advanceTime = (milliseconds) => {') }));
  const tick = n => page.evaluate(n => window.advanceTime(n * 1000 / 60), n);
  const read = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
  const reset = async (yaw = 0, y = 660) => {
    await page.evaluate(({ yaw, y }) => {
      const t = window.__viewTest; t.resetFirstHole();
      t.state.mode = 'first_hole'; t.state.manualTime = true; t.state.transitionAlpha = 0;
      t.state.player = { x: 0, y, heading: Math.PI / 2, yaw };
      const h = t.state.hole; h.tutorialVisible = false; h.practiceDrill.active = false;
      h.controlHintTimer = 0; h.zoneBannerTimer = 0; h.joe.x = 90; h.joe.y = 50; h.joe.patrolPause = 100;
    }, { yaw, y }); await tick(1);
  };
  const shot = async name => page.screenshot({ path: path.join(out, name + '.png') });
  try {
    await page.goto('http://127.0.0.1:4187'); await page.waitForFunction(() => typeof window.advanceTime === 'function');
    await page.locator('canvas').click(); await page.keyboard.press('Space');
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).assets.course.ready, null, { timeout: 60000 });
    await tick(180); await page.keyboard.press('Enter'); await tick(2); await page.keyboard.press('Enter'); await tick(90);

    if (!process.argv.includes('--perf-only') && !extended) {
    for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      for (const [key, axis, sign] of [['w', 'y', 1], ['s', 'y', -1], ['a', 'x', -1], ['d', 'x', 1]]) {
        await reset(yaw);
        const origin = await page.evaluate(() => ({ ...window.__viewTest.state.player }));
        await page.keyboard.down(key); await tick(8); await page.keyboard.up(key); await tick(1);
        const delta = await page.evaluate(origin => {
          const t = window.__viewTest, p = t.state.player;
          const dx = (p.x - origin.x) * .72, dy = p.y - origin.y;
          return { x: dx * Math.cos(origin.yaw) - dy * Math.sin(origin.yaw),
            y: dx * Math.sin(origin.yaw) + dy * Math.cos(origin.yaw) };
        }, origin);
        assert(delta[axis] * sign > .2, `${key} at ${yaw}: ${JSON.stringify(delta)}`);
        assert(Math.abs(delta[axis === 'x' ? 'y' : 'x']) < .01);
      }
      await reset(yaw, 350);
      const aim = await page.evaluate(() => {
        const t = window.__viewTest; t.beginGolfBallAim('keyboard');
        const target = t.golfBallAimTarget(); return { target, relative: t.cameraRelativePoint(target), screen: t.worldToScreen(target.x, target.y) };
      });
      assert(Math.abs(aim.relative.x) < .01); assert(aim.relative.y > 10); assert(Math.abs(aim.screen.x - 640) < 1);
      await page.keyboard.press('Escape'); await tick(1);
    }
    checks.push('WASD moves in all four camera-relative directions at all cardinal headings; centered shots project ahead at every heading');

    for (const [yaw, expected] of [[0, 'CLEAR AHEAD'], [Math.PI / 2, 'CLEAR LEFT'], [Math.PI, 'STEP BACK'], [-Math.PI / 2, 'CLEAR RIGHT']]) {
      await reset(yaw, 350);
      assert.equal(await page.evaluate(() => window.__viewTest.clearanceInstruction({ x: 0, y: 380 })), expected);
    }
    await reset(Math.PI / 2); await page.keyboard.down('r'); await tick(40);
    await page.keyboard.down('w'); await tick(8); await page.keyboard.up('w'); await page.keyboard.up('r'); await tick(40);
    const rearReturn = await page.evaluate(() => ({ ...window.__viewTest.state.player }));
    assert(rearReturn.x > 1); assert(Math.abs(rearReturn.y - 660) < .01); assert(Math.abs(rearReturn.yaw - Math.PI / 2) < .01);
    checks.push('Clearance directions rotate with the view; rear glance preserves movement and returns to the chosen heading');

    await reset(0, 660);
    await page.evaluate(() => { const t = window.__viewTest; t.beginGolfBallAim('keyboard'); t.state.player.yaw = Math.PI / 2; });
    await page.keyboard.press('Space');
    const flight = await page.evaluate(() => window.__viewTest.state.hole.ballFlight);
    assert(flight && flight.target.x > 1); assert(Math.abs(flight.target.y - 660) < .1);
    checks.push('Releasing a chip immediately after a turn uses the latest camera heading');

    await reset(); await page.mouse.click(600, 320);
    await page.waitForFunction(() => document.pointerLockElement === document.querySelector('canvas'));
    await page.mouse.move(760, 320); await tick(1);
    assert(Math.abs((await read()).player.cameraYawRadians) > .1);
    await page.keyboard.press('Escape'); await tick(1);
    assert.equal((await read()).mode, 'paused');
    await page.waitForFunction(() => !document.pointerLockElement);
    const pausedYaw = (await read()).player.cameraYawRadians;
    await page.mouse.move(400, 300); await tick(1); assert.equal((await read()).player.cameraYawRadians, pausedYaw);
    await page.keyboard.press('Escape'); await tick(1);
    checks.push('Actual mouse pointer lock turns the camera; Escape pauses/releases the cursor; paused movement does not turn');

    await reset();
    await page.evaluate(() => { window.viewPad = { connected: true, id: 'QA', mapping: 'standard', axes: [0, 0, .8, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) }; Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [window.viewPad] }); });
    await tick(30); assert((await read()).player.cameraYawRadians > .4);
    await page.evaluate(() => { window.viewPad.connected = false; }); await tick(2);
    const stoppedYaw = (await read()).player.cameraYawRadians; await tick(10); assert.equal((await read()).player.cameraYawRadians, stoppedYaw);
    checks.push('Synthetic right stick turns; disconnect stops rotation');

    await reset(); await page.setViewportSize({ width: 844, height: 390 }); await tick(1);
    const point = async (x, y) => page.evaluate(({ x, y }) => { const r = document.querySelector('canvas').getBoundingClientRect(); return { clientX: r.x + x / 1280 * r.width, clientY: r.y + y / 720 * r.height }; }, { x, y });
    await page.dispatchEvent('canvas', 'pointerdown', { pointerType: 'touch', pointerId: 10, button: 0, ...await point(116, 520) });
    await page.dispatchEvent('canvas', 'pointerdown', { pointerType: 'touch', pointerId: 11, button: 0, ...await point(700, 300) });
    await page.dispatchEvent('canvas', 'pointermove', { pointerType: 'touch', pointerId: 11, ...await point(850, 300) });
    await tick(8); assert((await read()).player.cameraYawRadians > .5); await shot('touch-turn');
    await page.dispatchEvent('canvas', 'pointercancel', { pointerType: 'touch', pointerId: 11 });
    await page.dispatchEvent('canvas', 'pointerup', { pointerType: 'touch', pointerId: 10 });
    assert.equal(await page.evaluate(() => window.__viewTest.state.touch.lookPointerId), null);
    checks.push('Synthetic touch supports simultaneous movement and swipe look, with cancellation cleanup');

    for (const route of ['shed', 'drain']) {
      await reset(Math.PI);
      await page.evaluate(route => { const t = window.__viewTest, h = t.state.hole, exit = route === 'shed' ? t.SHED_EXIT : t.DRAIN_EXIT;
        h.nightOrderActionsCompleted = t.NIGHT_ORDER_ACTIONS.map(a => a.id); h.keyCollected = route === 'shed'; h.drainUnlocked = route === 'drain'; t.state.player.x = exit.x; t.state.player.y = exit.y - 10;
      }, route); await tick(1); await page.keyboard.down('w'); await tick(1); await page.keyboard.press('Enter'); await tick(2);
      assert.equal((await read()).hole.escapeFiling.active, true); await tick(150); assert.equal((await read()).mode, 'victory'); await page.keyboard.up('w');
    }
    checks.push('Both exits still file through victory while facing back with approach input held');

    for (const [area, y] of [['opening', 45], ['station', 148], ['shed', 690]]) {
      for (const [direction, yaw] of [['north', 0], ['east', Math.PI / 2], ['south', Math.PI], ['west', -Math.PI / 2]]) {
        await reset(yaw, y); await page.setViewportSize({ width: 2560, height: 1600 }); await tick(1); await shot(`${area}-${direction}-2560`);
      }
    }
    for (const [width, height] of [[1280, 720], [800, 600], [844, 390]]) {
      await reset(Math.PI / 2, 148); await page.setViewportSize({ width, height }); await tick(1); await shot(`station-east-${width}`);
    }
    }
    await reset(0, 45); await page.setViewportSize({ width: 1280, height: 720 });
    await page.evaluate(() => window.__viewTest.beginGameplayPerformanceWindow());
    const turnSamples = [], sampleCount = extended ? 600 : 60;
    for (let i = 0; i < sampleCount; i++) {
      await page.dispatchEvent('canvas', 'pointermove', { pointerType: 'mouse', buttons: 1, movementX: 12 }); await tick(1);
      if (extended) turnSamples.push((await read()).performance.lastRenderMs);
    }
    assert.deepEqual(errors, []);
    const readiness = (await read()).readiness;
    if (extended) {
      const sorted = [...turnSamples].sort((a,b) => a-b);
      const timing = { sourceHash: require('node:crypto').createHash('sha256').update(source).digest('hex'), frames: sampleCount, averageMs: turnSamples.reduce((a,b) => a+b,0)/sampleCount, p95Ms: sorted[Math.ceil(sampleCount*.95)-1], maximumMs: sorted.at(-1), samples: turnSamples, errors };
      timing.passed = timing.averageMs <= 12 && timing.p95Ms <= 16.7;
      fs.writeFileSync(path.join(out,'all-frame-timing.json'), JSON.stringify(timing,null,2));
      assert(timing.passed, 'The complete 600-frame turn sample must meet the unchanged render budget');
    }
    assert.deepEqual(readiness.failedIds, [], 'Every release gate, including continuous-turn frame budget, must pass');
    fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify({ passed: true, checks, readiness: { passed: readiness.passed, failedIds: readiness.failedIds, frameBudget: readiness.checks.find(c => c.id === 'gameplay_frame_budget') }, performance: (await read()).performance, errors }, null, 2));
    console.log(JSON.stringify({ passed: true, checks, readiness: readiness.failedIds, errors }, null, 2));
  } catch (e) { console.error('Original failure:', e); await shot('failure'); fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify(await read(), null, 2)); throw e; }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
