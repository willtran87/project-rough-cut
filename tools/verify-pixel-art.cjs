const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const { chromium } = require(path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
(async () => {
  const out = path.resolve('output/pixel-restoration/acceptance'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2560, height: 1600 } }), errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || /GL_INVALID|texSubImage|INVALID_VALUE/.test(m.text())) errors.push(m.text()); });
  const source = fs.readFileSync('web/game.js', 'utf8');
  await page.route('**/game.js*', r => r.fulfill({ contentType: 'application/javascript', body: source.replace('  window.advanceTime = (milliseconds) => {', '  window.__art={state,resetFirstHole};\n  window.advanceTime = (milliseconds) => {') }));
  const tick = () => page.evaluate(() => advanceTime(1000 / 60));
  const ready = async () => { await tick(); await page.waitForFunction(() => RCScene3D.stats().pixelArt.pending === 0); await tick(); };
  const reset = () => page.evaluate(() => {
    __art.resetFirstHole(); const s = __art.state, h = s.hole; s.mode = 'first_hole'; s.manualTime = true; s.transitionAlpha = 0;
    s.keys.clear(); s.inputMethod = 'keyboard'; h.tutorialVisible = false; h.practiceDrill.active = false;
    h.controlHintTimer = 0; h.zoneBannerTimer = 0; h.joe.x = 100; h.joe.y = 690; h.joe.patrolPause = 9999;
    Object.assign(s.player, { x: 0, y: 12, yaw: 0, pitch: 0 });
  });
  const snap = async name => { await ready(); await page.screenshot({ path: path.join(out, `${name}.png`) }); };
  try {
    await page.goto('http://127.0.0.1:4187'); await page.locator('canvas').click(); await page.keyboard.press('Space');
    await page.waitForFunction(() => window.__art && JSON.parse(render_game_to_text()).assets.course.ready);
    await reset(); await snap('opening-2560');
    const initial = await page.evaluate(() => RCScene3D.stats());
    assert.equal(initial.artStyle, 'original-pixel-art'); assert.deepEqual(initial.resolution, [1280, 720]); assert.deepEqual(initial.pixelArt.errors, []);
    checks.push('Original art loads without missing textures; pixel world uses nearest sampling at 1280×720 with sharp native HUD');
    for (const [name, x, y, yaw] of [
      ['cart-front', 40, 58, Math.PI / 2], ['cart-side', 70, 38, 0], ['cart-rear', 96, 58, -Math.PI / 2],
      ['cart-oblique', 47, 38, .6], ['hedge', -78, 15, 0], ['field-log', -98, 408, 0], ['shed', -18, 684, 0], ['drain', -78, 684, 0]
    ]) { await reset(); await page.evaluate(p => Object.assign(__art.state.player, p), { x, y, yaw }); await snap(name); }
    checks.push('Textured solid props captured from front, side, rear and oblique views at their collision footprints');
    for (const [name, heading] of [['front', -Math.PI / 2], ['right', 0], ['back', Math.PI / 2], ['left', Math.PI]]) {
      await reset(); await page.evaluate(heading => { const s = __art.state; s.player.y = 180; Object.assign(s.hole.joe, { x: 0, y: 195, effectHeading: heading, effectSpeed: 0, effectLastX: 0, effectLastY: 195 }); }, heading);
      await snap('joe-' + name); assert.equal(await page.evaluate(()=>RCScene3D.stats().joeView), {front:0,right:1,back:2,left:3}[name]);
    }
    checks.push('Original Joe and red mower show all four authored directions');
    for (const [width, height] of [[1280, 720], [800, 600], [844, 390]]) {
      await page.setViewportSize({ width, height }); await reset(); await snap('opening-' + width);
      if (width === 844) { await page.evaluate(() => { __art.state.inputMethod = 'touch'; }); await snap('touch-844'); }
    }
    checks.push('High-resolution 2560×1600 plus 1280×720, 800×600 and 844×390 captures');
    await page.evaluate(() => RCSpatialControls.set('resolution', .5)); await ready(); assert.deepEqual(await page.evaluate(() => RCScene3D.stats().resolution), [640, 360]);
    await page.evaluate(() => RCSpatialControls.set('resolution', 1)); await ready(); assert.deepEqual(await page.evaluate(() => RCScene3D.stats().resolution), [1280, 720]);
    await page.evaluate(() => RCSpatialControls.set('resolution', .75));
    await reset(); await ready(); assert.equal(await page.evaluate(() => RCScene3D.stats().pixelArt.pending), 0);
    checks.push('Low scene resolution and scene rebuild preserve decoded art');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ passed: true, checks, errors, renderer: await page.evaluate(() => RCScene3D.stats()) }, null, 2));
    console.log(JSON.stringify({ passed: true, checks, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
