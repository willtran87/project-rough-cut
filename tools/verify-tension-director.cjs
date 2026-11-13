const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require(path.join(require('node:os').homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
(async () => {
  const out = 'output/tension-director-20261107'; fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const p = await browser.newPage({ viewport: { width: 2560, height: 1600 } }), checks = [], errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.route('**/game.js*', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync('web/game.js', 'utf8').replace('  window.advanceTime = (milliseconds) => {',
    '  window.__tension={state,resetFirstHole,render,updateTensionDirector,updateHorrorDirector,stageTensionIntercept,tensionDirectorInterceptPoint,triggerHorrorEvent,stageSilentStalk,stageCoverAudit,updateShelterMemory,getPlayerEnvironmentState,spatialEffectsFrame,reactiveScoreState,observeCoverMemory,COURSE_OBSTACLES};\n  window.advanceTime = (milliseconds) => {') }));
  async function reset() {
    await p.evaluate(() => {
      const t = __tension, s = t.state; t.resetFirstHole(); s.mode = 'first_hole'; s.manualTime = true;
      s.transitionAlpha = 0; s.keys.clear(); s.guidedHints = false; s.flashes = true;
      const h = s.hole; h.tutorialVisible = false; h.practiceDrill.active = false; h.elapsed = 100;
      h.controlHintTimer = h.zoneBannerTimer = h.detection = 0;
      Object.assign(s.player, { x: 100, y: 20, yaw: Math.PI, pitch: 0 });
      Object.assign(h.joe, { x: 0, y: 180, mode: 'patrol', patrolIndex: 0, patrolPause: 9999 });
      h.tensionDirector.beatTimer = 9999; t.render();
    });
  }
  try {
    await p.goto('http://127.0.0.1:4187'); await p.locator('canvas').click(); await p.keyboard.press('Space');
    await p.waitForFunction(() => window.__tension && JSON.parse(render_game_to_text()).assets.course.ready);
    await reset(); await p.waitForFunction(() => RCScene3D.stats().ready && RCScene3D.stats().joeModel?.ready, null, { timeout: 90000 });
    const warning = await p.evaluate(() => {
      const t = __tension, h = t.state.hole, d = h.tensionDirector, j = h.joe;
      const before = { x: j.x, y: j.y }; t.stageTensionIntercept(t.tensionDirectorInterceptPoint());
      const staged = { seconds: d.pendingIntercept.seconds, phase: d.phase, scares: t.spatialEffectsFrame().suppressScares };
      h.horrorDirector.eventTimer = h.horrorDirector.visualFlashTimer = 0;
      for (let i = 0; i < 210; i++) { t.updateTensionDirector(1 / 60, true); t.updateHorrorDirector(1 / 60, true); }
      const during = { pending: !!d.pendingIntercept, mode: j.mode, events: h.horrorDirector.eventCount, flashes: h.horrorDirector.visualFlashCount };
      for (let i = 0; i < 20; i++) t.updateTensionDirector(1 / 60, true);
      return { before, after: { x: j.x, y: j.y }, staged, during, phase: d.phase, kind: h.distraction?.kind, mode: j.mode };
    });
    assert.equal(warning.staged.seconds, 3.8); assert.equal(warning.staged.phase, 'warning'); assert(warning.staged.scares);
    assert(warning.during.pending); assert.equal(warning.during.mode, 'patrol'); assert.equal(warning.during.events + warning.during.flashes, 0);
    assert.equal(warning.phase, 'approach'); assert.equal(warning.kind, 'patrol_reposition'); assert.equal(warning.mode, 'investigate'); assert.deepEqual(warning.before, warning.after);
    checks.push('3.8-second warning reserves the scare budget; approach uses an ordinary patrol destination without teleporting');

    await reset(); const protectedActions = await p.evaluate(() => {
      const t = __tension, h = t.state.hole, results = [];
      for (const name of ['aim', 'map', 'filing', 'status', 'exit']) {
        h.ballAim.active = name === 'aim'; h.mapOpen = name === 'map'; h.quietLog = name === 'filing' ? {} : null;
        h.statusRequest.active = name === 'status'; h.escapeFiling.active = name === 'exit';
        t.stageTensionIntercept(t.tensionDirectorInterceptPoint()); t.updateTensionDirector(.1, false);
        h.horrorDirector.eventTimer = h.horrorDirector.visualFlashTimer = 0; t.updateHorrorDirector(.1, false);
        results.push({ name, pending: !!h.tensionDirector.pendingIntercept, events: h.horrorDirector.eventCount, flashes: h.horrorDirector.visualFlashCount, suppressed: t.spatialEffectsFrame().suppressScares });
      }
      return results;
    });
    assert(protectedActions.every(r => !r.pending && !r.events && !r.flashes && r.suppressed));
    checks.push('Aim, map, quiet filing, status and exit commitments cancel staged patrol changes and suppress cosmetic scares');

    await reset(); const cover = await p.evaluate(() => {
      const t = __tension, h = t.state.hole, d = h.tensionDirector;
      const unknown=t.stageCoverAudit({id:'test-cover'},'repeated_use');
      t.observeCoverMemory(h.shelterMemory,{kind:'sight',time:h.elapsed,point:{x:78,y:71}},t.COURSE_OBSTACLES,h.elapsed);
      const shelter=h.shelterMemory.observedShelter;
      d.reliefSeconds = 10; const recovery = t.stageCoverAudit(shelter, 'repeated_use');
      d.reliefSeconds = 0; d.accentCooldown = 5; const spacing = t.stageCoverAudit(shelter, 'repeated_use');
      d.accentCooldown = 0; const staged = t.stageCoverAudit(shelter, 'repeated_use');
      h.ballAim.active = true; t.updateShelterMemory(.1, false, t.getPlayerEnvironmentState());
      return { unknown, recovery, spacing, staged, cancelled: d.coverAudit === null, mode: h.joe.mode };
    });
    assert(!cover.unknown && !cover.recovery && !cover.spacing && cover.staged && cover.cancelled); assert.equal(cover.mode, 'patrol');
    checks.push('Memorized-cover warnings also respect recovery, shared spacing and protected commitments');

    await reset(); const recovery = await p.evaluate(() => {
      const t = __tension, h = t.state.hole, d = h.tensionDirector;
      h.joe.mode = 'chase'; for (let i = 0; i < 600; i++) t.updateTensionDirector(1 / 60, true);
      h.joe.mode = 'patrol'; for (let i = 0; i < 120; i++) t.updateTensionDirector(1 / 60, false);
      const early = d.recoveries; h.joe.mode = 'search'; t.updateTensionDirector(.1, false);
      h.joe.mode = 'patrol'; for (let i = 0; i < 120; i++) t.updateTensionDirector(1 / 60, false);
      const reset = d.recoveries; for (let i = 0; i < 65; i++) t.updateTensionDirector(1 / 60, false);
      const earned = { phase: d.phase, count: d.recoveries, seconds: d.reliefSeconds, score: t.reactiveScoreState().gain };
      h.horrorDirector.eventTimer = h.horrorDirector.visualFlashTimer = 0;
      for (let i = 0; i < 300; i++) { t.updateTensionDirector(1 / 60, true); t.updateHorrorDirector(1 / 60, true); }
      const quiet = { count: d.recoveries, events: h.horrorDirector.eventCount, flashes: h.horrorDirector.visualFlashCount };
      h.joe.mode = 'chase'; t.updateTensionDirector(.1, true);
      return { early, reset, earned, quiet, override: d.phase, mode: h.joe.mode };
    });
    assert.equal(recovery.early, 0); assert.equal(recovery.reset, 0); assert.equal(recovery.earned.phase, 'recovery');
    assert.equal(recovery.earned.count, 1); assert(recovery.earned.seconds >= 9 && recovery.earned.seconds <= 14);
    assert.equal(recovery.quiet.count, 1); assert.equal(recovery.quiet.events + recovery.quiet.flashes, 0);
    assert.equal(recovery.override, 'confrontation'); assert.equal(recovery.mode, 'chase');
    checks.push('Recovery requires three continuously clear seconds, triggers once, and never disables a new real chase');

    await reset(); const spacing = await p.evaluate(() => {
      const t = __tension, h = t.state.hole, d = h.tensionDirector;
      h.horrorDirector.eventTimer = h.horrorDirector.visualFlashTimer = 0;
      t.updateHorrorDirector(.1, true);
      const first = h.horrorDirector.visualFlashCount + h.horrorDirector.eventCount;
      for (let i = 0; i < 480; i++) { t.updateTensionDirector(1 / 60, true); t.updateHorrorDirector(1 / 60, true); }
      const second = h.horrorDirector.visualFlashCount + h.horrorDirector.eventCount;
      for (let i = 0; i < 100; i++) { t.updateTensionDirector(1 / 60, true); t.updateHorrorDirector(1 / 60, true); }
      return { first, second, third: h.horrorDirector.visualFlashCount + h.horrorDirector.eventCount, cooldown: d.accentCooldown };
    });
    assert.equal(spacing.first, 1); assert.equal(spacing.second, 1); assert.equal(spacing.third, 2);
    checks.push('Due flashes and manifestations take separate windows at least nine simulated seconds apart');

    await reset(); const audible = await p.evaluate(() => {
      const t = __tension, h = t.state.hole;
      t.stageSilentStalk(); h.tensionDirector.silentStalk.phase = 'silent';
      Object.assign(h.joe, { x: t.state.player.x, y: t.state.player.y + 60 });
      t.updateTensionDirector(1 / 60, false);
      return { stalk: h.tensionDirector.silentStalk, mode: h.joe.mode, beat: h.tensionDirector.lastBeat };
    });
    assert.equal(audible.stalk, null); assert.equal(audible.mode, 'patrol'); assert.equal(audible.beat, 'mower_restart_on_contact');
    checks.push('A nearby Joe immediately exits staged engine silence without changing his movement or mode');

    const audio = await p.evaluate(async () => {
      const { createAtmosphericAudio } = await import('/atmospheric-audio.js');
      const c = new OfflineAudioContext(2, 48000 * 3, 48000), noise = c.createBuffer(1, 48000, 48000);
      const a = createAtmosphericAudio(c, c.destination, noise, () => {});
      const frame = { time: 50, active: true, volume: 1, pressure: .8, apparitions: true, player: { x: 20, z: -52, yaw: 0 }, ghost: { key: 'g', x: 20, z: -50 } };
      const warning = a.update({ ...frame, suspensePhase: 'warning' }); const warningEvents = a.stats().events;
      const recovery = a.update({ ...frame, time: 51, suspensePhase: 'recovery' }); const stats = a.stats(); a.dispose();
      return { warning, warningEvents, recovery, stats };
    });
    assert.equal(audio.warning.hush, .46 * audio.stats.bedGain); assert.equal(audio.warningEvents, 0); assert.equal(audio.recovery.hush, audio.stats.bedGain);
    assert.equal(audio.stats.counts.insects, 1); assert(!audio.stats.counts.radio && !audio.stats.counts.ghost);
    checks.push('Warnings duck flavor audio; recovery restores insects without radio, ghost accents or random hush');

    await reset(); await p.evaluate(() => {
      const t = __tension, s = t.state; Object.assign(s.player, { x: 0, y: 228, yaw: 0, pitch: -.08 });
      Object.assign(s.hole.joe, { x: 70, y: 420 }); t.stageTensionIntercept(t.tensionDirectorInterceptPoint()); t.render();
    });
    await p.evaluate(() => RCScene3D.whenPresented()); await p.screenshot({ path: out + '/warning-2560.png' });
    const stats = await p.evaluate(() => RCScene3D.stats()); fs.writeFileSync(out + '/scene-stats.json', JSON.stringify(stats, null, 2));
    await p.evaluate(() => { const t = __tension, h = t.state.hole; h.tensionDirector.pendingIntercept = null; h.tensionDirector.reliefSeconds = 10; h.captions = []; h.messageTimer = h.stateBannerTimer = 0; t.updateTensionDirector(.01, false); t.render(); });
    await p.evaluate(() => RCScene3D.whenPresented()); await p.screenshot({ path: out + '/recovery-2560.png' });
    await p.setViewportSize({ width: 1280, height: 720 }); await p.evaluate(() => __tension.render());
    await p.evaluate(() => RCScene3D.whenPresented()); await p.screenshot({ path: out + '/recovery-1280.png' });
    await p.keyboard.press('Escape'); const paused = await p.evaluate(() => JSON.stringify(__tension.state.hole.tensionDirector));
    await p.evaluate(() => advanceTime(3000)); assert.equal(await p.evaluate(() => JSON.stringify(__tension.state.hole.tensionDirector)), paused);
    checks.push('Paused simulation freezes pacing; warning and recovery render at 2560×1600 and 1280×720');
    assert.deepEqual(errors, []); fs.writeFileSync(out + '/verification.json', JSON.stringify({ passed: true, checks, errors, warning, recovery, spacing, audio }, null, 2));
    console.log(JSON.stringify({ passed: true, checks, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
