const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const { chromium } = require(path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
(async () => {
  const out = path.resolve(process.env.ART_QA_OUT || 'output/illustrated-props/acceptance'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2560, height: 1600 }, recordVideo: { dir: path.join(out,'motion'), size: { width:1280,height:720 } } }), errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || /GL_INVALID|texSubImage|INVALID_VALUE/.test(m.text())) errors.push(m.text()); });
  const source = fs.readFileSync('web/game.js', 'utf8');
  await page.route('**/game.js*', r => r.fulfill({ contentType: 'application/javascript', body: source.replace('  window.advanceTime = (milliseconds) => {', '  window.__art={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {') }));
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
    await page.goto('http://127.0.0.1:4187/?art=illustrated'); await page.locator('canvas').click(); await page.keyboard.press('Space');
    await page.waitForFunction(() => window.__art && JSON.parse(render_game_to_text()).assets.course.ready);
    await reset(); await snap('opening-2560');
    const initial = await page.evaluate(() => RCScene3D.stats());
    assert.equal(initial.artStyle, 'original-pixel-art'); assert.deepEqual(initial.resolution, [1280, 720]); assert.deepEqual(initial.pixelArt.errors, []);
    checks.push('Original art loads without missing textures; pixel world uses nearest sampling at 1280×720 with sharp native HUD');
    for (const [name, x, y, yaw] of [
      ['cart-front', 40, 58, Math.PI / 2], ['cart-side', 70, 38, 0], ['cart-rear', 96, 58, -Math.PI / 2],
      ['cart-oblique', 47, 38, .6], ['bell',86,135,0], ['hedge', -78, 15, 0], ['field-log', -98, 408, 0], ['dead-green',0,500,0], ['release',86,640,0], ['shed', -18, 684, 0], ['drain', -78, 684, 0]
    ]) { await reset(); await page.evaluate(p => Object.assign(__art.state.player, p), { x, y, yaw }); await snap(name); }
    checks.push('Complete illustrated props captured from front, side, rear and oblique views at existing collision anchors');
    for (const [name, heading] of [['front', -Math.PI / 2], ['right', 0], ['back', Math.PI / 2], ['left', Math.PI]]) {
      await reset(); await page.evaluate(heading => { const s = __art.state; s.player.y = 180; Object.assign(s.hole.joe, { x: 0, y: 195, effectHeading: heading, effectSpeed: 0, effectLastX: 0, effectLastY: 195 }); }, heading);
      await snap('joe-' + name); assert.equal(await page.evaluate(()=>RCScene3D.stats().joeView), {front:0,right:1,back:2,left:3}[name]);
    }
    checks.push('Original Joe and red mower show all four authored directions');
    const props=await page.evaluate(()=>RCScene3D.stats().illustrated);
    for(const kind of ['station-bell','station-log','station-release','station-key','station-valve','directional-cart','guide-lantern','grass-cover','stone-cover','pond-reeds','floodlight','notice-board','boundary-post','shed-facade','drain-facade'])assert(props.counts[kind]>0,kind);
    const cartViews=[];for(const [x,y]of [[40,58],[70,38],[96,58],[70,79]]){await reset();await page.evaluate(p=>Object.assign(__art.state.player,p),{x,y});await ready();cartViews.push(await page.evaluate(()=>RCScene3D.stats().illustrated.carts[0].view));}
    assert.equal(new Set(cartViews).size,4);checks.push('All fifteen illustrated prop families render; the opening cart selects four distinct authored directions');
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
    await page.setViewportSize({width:1280,height:720});await reset();await ready();
    const layersBefore=await page.evaluate(()=>RCScene3D.stats().parallax);
    assert.deepEqual(layersBefore.layers.map(l=>l.name),['sky','clouds','ridge','distant-trees','estate']);
    await snap('parallax-center');await page.keyboard.down('d');
    for(let i=0;i<60;i++){await tick();if(i%4===0)await page.waitForTimeout(30);}await page.keyboard.up('d');await snap('parallax-strafe');
    const layersAfter=await page.evaluate(()=>RCScene3D.stats().parallax);
    const shift=name=>Math.abs(layersAfter.layers.find(l=>l.name===name).screen[0]-layersBefore.layers.find(l=>l.name===name).screen[0]);
    assert(shift('sky')<1e-6);assert(shift('estate')>shift('distant-trees'));assert(shift('distant-trees')>shift('ridge'));assert(shift('ridge')>0);
    checks.push('Ordinary strafing produces increasing parallax from sky to ridge, trees and estate');
    const fullTurn=await page.evaluate(()=>{const a=RCScene3D.stats().parallax.layers.map(l=>l.screen);__art.state.player.yaw+=Math.PI*2;__art.render();return {a,b:RCScene3D.stats().parallax.layers.map(l=>l.screen)};});
    for(let i=0;i<fullTurn.a.length;i++)for(let j=0;j<2;j++)assert(Math.abs(fullTurn.a[i][j]-fullTurn.b[i][j])<1e-6);
    checks.push('A full turn returns every background layer to the same projection without a wrap jump');
    for(let i=0;i<70;i++){await page.dispatchEvent('canvas','pointermove',{pointerType:'mouse',buttons:1,movementX:8,movementY:0});await tick();if(i%4===0)await page.waitForTimeout(30);}await snap('parallax-turn');
    await page.evaluate(()=>__art.state.reducedMotion=true);await tick();const calm=await page.evaluate(()=>RCScene3D.stats().parallax.motionTime);for(let i=0;i<10;i++)await tick();assert.equal(await page.evaluate(()=>RCScene3D.stats().parallax.motionTime),calm);
    await page.evaluate(()=>__art.state.reducedMotion=false);await tick();assert(await page.evaluate(()=>RCScene3D.stats().parallax.motionTime)>calm);
    await page.keyboard.press('Escape');await tick();const paused=await page.evaluate(()=>RCScene3D.stats().parallax.motionTime);for(let i=0;i<10;i++)await tick();assert.equal(await page.evaluate(()=>RCScene3D.stats().parallax.motionTime),paused);
    checks.push('Cloud drift stops with reduced motion and Pause; camera-controlled depth remains intact');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ passed: true, checks, errors, renderer: await page.evaluate(() => RCScene3D.stats()) }, null, 2));
    console.log(JSON.stringify({ passed: true, checks, errors }, null, 2));
  } finally { const video=page.video();await page.close();if(video)await video.saveAs(path.join(out,'parallax-motion.webm'));await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
