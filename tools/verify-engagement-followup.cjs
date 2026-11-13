/* Controlled acceptance fixtures. Human enjoyment and device comfort are tested later. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
  const out=path.resolve('output/engagement-followup');fs.mkdirSync(out,{recursive:true});
  const source=fs.readFileSync('web/game.js','utf8'),browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {',
    '  window.__followup={state,resetFirstHole,render,updateJoe,updateEngagement,fieldBreakawayTarget,activeFieldActionBreakaway,resolveFieldSignalBreakaway,fieldActionCommitmentPreview,lineBlockerBetween,obstacleAtPosition,planJoeRoute,NIGHT_ORDER_ACTIONS,COURSE_OBSTACLES,FIELD_NOTES,nearbyFieldNote,readFieldJournal,courseInteractionPromptPresentation,floodlightPowerAt,rangeLightingHint,escapeFilingPreview,joeWorldLabelState};\n  window.advanceTime = (milliseconds) => {')}));
  const tick=n=>page.evaluate(n=>window.advanceTime(n*1000/60),n);
  const shot=async name=>{await tick(1);return page.screenshot({path:path.join(out,name+'.png')});};
  const reset=()=>page.evaluate(()=>{const t=window.__followup,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.freeLook=true;s.guidedHints=true;s.uiScale=1;
    const h=s.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;h.joe.x=100;h.joe.y=30;h.joe.patrolPause=1000;s.player.x=0;s.player.y=600;s.player.yaw=0;});
  try {
    await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(window.render_game_to_text()).assets.course.ready,null,{timeout:60000});
    for(const crouch of [false,true]) {
      await reset();await page.evaluate(()=>{const t=window.__followup,a=t.NIGHT_ORDER_ACTIONS[2];t.state.player.x=a.x;t.state.player.y=a.y;});
      if(crouch)await page.keyboard.down('c');await tick(1);
      const preview=await page.evaluate(()=>{const t=window.__followup;return t.fieldActionCommitmentPreview(t.NIGHT_ORDER_ACTIONS[2]);});
      assert.equal(preview.coverId,crouch?'range-exit-right':'range-cart-east');await shot(crouch?'release-hedge-2560':'release-cart-2560');
      await page.keyboard.press('Enter');await page.keyboard.up('c');await tick(1);
      const route=await page.evaluate(()=>{const t=window.__followup,a=t.NIGHT_ORDER_ACTIONS[2],target=t.fieldBreakawayTarget(a);return {cover:t.state.hole.engagement.releaseCover,target,blocker:t.lineBlockerBetween(a,target),collision:t.obstacleAtPosition(target.x,target.y)?.id,path:t.planJoeRoute(a,target,2),active:t.activeFieldActionBreakaway(),readiness:JSON.parse(window.render_game_to_text()).readiness};});
      assert.equal(route.cover,crouch?'hedge':'cart');assert.equal(route.target.coverId,preview.coverId);assert.equal(route.blocker,preview.coverId);assert.equal(route.collision,undefined);assert(route.path.length>0);assert.equal(route.active.coverId,preview.coverId);
      for(const id of ['field_action_commitment_preview','field_signal_breakaway_destination_continuity','field_signal_breakaway_routes'])assert.equal(route.readiness.checks.find(c=>c.id===id).passed,true,id);
      // Resolve actual target/cover semantics separately from the ordinary-input route runner.
      const outcome=await page.evaluate(()=>{const t=window.__followup,h=t.state.hole,target=t.fieldBreakawayTarget(t.NIGHT_ORDER_ACTIONS[2]);t.state.player.x=target.x;t.state.player.y=target.y;h.noise=0;h.fieldSignalBreakaway.quietSeconds=1;h.fieldSignalBreakaway.quietReady=true;t.resolveFieldSignalBreakaway(h.distraction);return h.fieldSignalBreakaway.lastOutcome;});
      assert.equal(outcome.completed,true,JSON.stringify(outcome));
    }
    checks.push('Both release retreats preview, freeze after commitment, have collision-free covered destinations, and resolve their own clean-break credit');
    await reset();
    const lighting=await page.evaluate(()=>{const t=window.__followup,h=t.state.hole,lights=t.COURSE_OBSTACLES.filter(o=>o.id.startsWith('range-light'));return [0,1,2].map(variant=>{h.variantIndex=variant;h.elapsed=4;const a=lights.map(l=>t.floodlightPowerAt(l));t.state.reducedMotion=true;const calm=lights.map(l=>t.floodlightPowerAt(l));t.state.reducedMotion=false;h.elapsed=12;return {a,calm,b:lights.map(l=>t.floodlightPowerAt(l)),hint:t.rangeLightingHint()};});});
    assert(lighting[1].a[0]<lighting[1].a[2]);assert(lighting[2].a[0]>lighting[2].a[2]);assert(lighting[2].b[0]<lighting[2].b[2]);for(const l of lighting)assert.deepEqual(l.a,l.calm);
    checks.push({name:'Variants alter authoritative lighting lanes; slow Closing Shift alternates and comfort mode keeps identical light truth',lighting});
    await reset();
    const inspection=await page.evaluate(()=>{const t=window.__followup,h=t.state.hole,s=t.state;s.player.x=0;s.player.y=660;h.joe.x=0;h.joe.y=690;h.distraction={x:0,y:693,kind:'golf_ball',ballId:51};h.distractionTimer=5;h.joe.mode='investigate';const start={x:h.joe.x,y:h.joe.y};t.updateJoe(.05);return {start,end:{x:h.joe.x,y:h.joe.y},inspection:h.engagement.inspection,seconds:h.engagement.inspectionSeconds,heading:h.joe.effectHeading,label:t.joeWorldLabelState().label};});
    assert(inspection.inspection);assert.deepEqual(inspection.start,inspection.end);assert(inspection.seconds>0);assert(inspection.label.includes('INSPECTING'));
    await page.evaluate(()=>{const t=window.__followup;t.state.hole.lineBlockedBy=null;t.state.hole.joe.barkTimer=0;});
    await shot('joe-inspects-2560');
    const override=await page.evaluate(()=>{const t=window.__followup,h=t.state.hole;t.state.player.x=h.joe.x;t.state.player.y=h.joe.y-10;h.joe.effectHeading=-Math.PI/2;t.updateJoe(.05);return {mode:h.joe.mode,inspection:h.engagement.inspection};});
    assert.equal(override.mode,'chase');assert.equal(override.inspection,null);
    checks.push('Joe physically stops at evidence and inspects it; fresh close sight overrides the distraction');
    await reset();
    const discovery=await page.evaluate(()=>{const t=window.__followup,o=t.COURSE_OBSTACLES.find(o=>o.id==='clubhouse-board');t.state.player.x=o.x+17;t.state.player.y=o.y;t.state.player.yaw=-Math.PI/2;return {note:t.nearbyFieldNote(),prompt:t.courseInteractionPromptPresentation()};});
    assert.equal(discovery.note.id,'clubhouse-board');assert.equal(discovery.prompt.owner.targetId,'clubhouse-board');await tick(1);await shot('discovery-ready-2560');await page.keyboard.press('Enter');
    const journal=await page.evaluate(()=>({notes:window.roughCutStudy.journal(),events:window.roughCutStudy.snapshot().engagement.events}));assert(journal.notes.some(n=>n.id==='clubhouse-board'));assert(journal.events.some(e=>e.type==='discovery'));
    await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>window.roughCutStudy.snapshot().engagement.notes)).length,1);await shot('discovery-read-2560');
    for(const [width,height] of [[1280,720],[800,600],[844,390]]) {await page.setViewportSize({width,height});await shot('discovery-read-'+width);}
    await page.setViewportSize({width:2560,height:1600});
    await reset();assert((await page.evaluate(()=>window.roughCutStudy.journal())).some(n=>n.id==='clubhouse-board'));
    checks.push('Optional board discovery uses ordinary Use, grants no duplicate credit, and persists independently across retries');
    await page.keyboard.press('f');await page.waitForFunction(()=>document.fullscreenElement===document.documentElement);await page.evaluate(()=>document.exitFullscreen());
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('study-launch').hidden);await page.locator('#study-launch').click();
    assert(await page.locator('#study-dialog').evaluate(d=>d.open));await shot('journal-2560');
    await page.locator('[data-section="feedback"]').click();
    for(const name of ['fun','clarity','tension','comfort'])await page.locator(`[name="${name}"]`).selectOption('4');
    await page.locator('[name="replay"]').selectOption('Maybe');await page.locator('[name="choices"]').fill('QA fixture only — no human participant. Enter, Space, WASD must stay inside this form.');
    await page.locator('[name="choices"]').press('Enter');await tick(3);assert.equal(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).mode),'paused');
    await page.locator('button[type="submit"]').click();assert.match(await page.locator('#study-save-status').textContent(),/Saved locally/);
    const downloadPromise=page.waitForEvent('download');await page.locator('#study-download').click();const download=await downloadPromise;const exportPath=path.join(out,'fixture-report.json');await download.saveAs(exportPath);
    const report=JSON.parse(fs.readFileSync(exportPath,'utf8'));assert.equal(report.reports[0].feedback.fun,'4');assert.equal(report.currentRun.version,2);assert.equal(report.currentRun.ruleset,'quality-reset-20261106');
    for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]) {
      await page.setViewportSize({width,height});await shot(`feedback-${width}`);
      const bounds=await page.locator('#study-dialog').evaluate(d=>{const r=d.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,overflow:d.scrollWidth>d.clientWidth};});
      assert(bounds.x>=0&&bounds.y>=0&&bounds.right<=width&&bounds.bottom<=height);assert.equal(bounds.overflow,false);
    }
    await page.setViewportSize({width:2560,height:1600});await page.locator('[data-section="setup"]').click();await page.locator('[data-comfort="1"]').click();
    const comfort=await page.evaluate(()=>window.roughCutStudy.snapshot().comfort);assert.equal(comfort.reducedMotion,true);assert.equal(comfort.sensitivity,.65);
    for(const side of [-1,0,1])await page.locator(`[data-audio="${side}"]`).click();await shot('test-guide-2560');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#study-dialog').evaluate(d=>d.open),false);
    assert.equal(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).mode),'paused');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).mode),'first_hole');
    checks.push('Accessible dialog stays inside all four viewports, isolates typed input, saves/export reports, applies comfort presets, auditions audio, and closes without resuming play');
    const preflight=await page.evaluate(()=>{const t=window.__followup;t.state.hole.joe.mode='chase';t.state.hole.filingReduction=.36;return t.escapeFilingPreview('drain');});assert(Math.abs(preflight.holdSeconds-1.34)<1e-9);assert(preflight.text.includes('LURE OR BREAK SIGHT'));
    checks.push('Final filing preflight reports the actual discounted hold duration and danger advice');
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,checks,errors,sourceHash:require('node:crypto').createHash('sha256').update(source).digest('hex')},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
  } catch(e){await shot('failure');throw e;} finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
