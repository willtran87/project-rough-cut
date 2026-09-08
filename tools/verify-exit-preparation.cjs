/* Exit preparation matrix. Controlled setups use intercepted test-only access.
 * node tools/verify-exit-preparation.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
(async () => {
  const out = path.resolve('output/exit-preparation');
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[], checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const source=fs.readFileSync(path.resolve('web/game.js'),'utf8');
  await page.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:source.replace(
    '  window.advanceTime = (milliseconds) => {',
    '  window.__routeTest = {state, resetFirstHole, RUN_VARIANTS, NIGHT_ORDER_ACTIONS, activePlayerGuidanceTarget, currentHoleObjective, activeKeyPoint, activeSprinklerPoint};\n  window.advanceTime = (milliseconds) => {')}));
  const tick=n=>page.evaluate(n=>window.advanceTime(n*1000/60),n);
  const press=async()=>{await page.keyboard.down('Enter');await tick(1);await page.keyboard.up('Enter');await tick(1);};
  const route=()=>page.evaluate(()=>{const t=window.__routeTest;return {route:t.activePlayerGuidanceTarget(), objective:t.currentHoleObjective(),key:t.state.hole.keyCollected,drain:t.state.hole.drainUnlocked,completed:t.state.hole.nightOrderActionsCompleted.length};});
  const reset=async index=>{
    await page.evaluate(index=>{const t=window.__routeTest;t.resetFirstHole();t.state.mode='first_hole';t.state.manualTime=true;
      const h=t.state.hole;h.variantIndex=index;h.variantId=t.RUN_VARIANTS[index].id;h.tutorialVisible=false;h.practiceDrill.active=false;
      h.controlHintTimer=0;h.zoneBannerTimer=0;h.joe.x=-100;h.joe.y=690;h.joe.patrolPause=100;
      t.state.player.x=86;t.state.player.y=148;t.state.transitionAlpha=0;
    },index);await tick(1);
  };
  const shot=async name=>{
    for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]) {
      await page.setViewportSize({width,height});await tick(1);await page.screenshot({path:path.join(out,`${name}-${width}.png`)});
    }
  };
  try {
    await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>typeof window.advanceTime==='function');
    await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>{const s=JSON.parse(window.render_game_to_text());return s.assets.course.loaded===42&&s.assets.results.loaded===4;},null,{timeout:60000});
    await tick(180);
    await reset(0);
    await page.evaluate(()=>{const t=window.__routeTest;
      t.state.hole.nightOrderActionsCompleted=['audit-bell'];
      t.state.player.x=29;t.state.player.y=100;
      t.state.hole.navigationGuide.targetId='sprinkler';
    });await tick(1);
    assert.equal((await route()).route.id,'shed-key');
    checks.push('Preparation accounts for onward travel: choose the key ahead instead of returning to the closer tee valve');
    for(let variant=0;variant<3;variant++) {
      await reset(variant);
      assert.equal((await route()).route.id,'audit-bell');
      await press();
      assert.equal((await route()).route.id,'field-signal-break-audit-bell');
      await tick(400);
      const prep=await route();
      assert.ok(['shed-key','sprinkler'].includes(prep.route.id));
      assert.match(prep.objective,/^PREPARE EXIT/);
      assert.equal(prep.completed,1);
      if(variant===0) await shot('prepare-exit');
      for(const branch of ['shed','drain']) {
        await reset(variant);
        await page.evaluate(branch=>{
          const t=window.__routeTest,h=t.state.hole;
          h.nightOrderActionsCompleted=['audit-bell'];
          const p=branch==='shed'?t.activeKeyPoint():t.activeSprinklerPoint();
          t.state.player.x=p.x;t.state.player.y=p.y;
          h.navigationGuide.targetId=null;
        },branch);await tick(1);
        assert.equal((await route()).route.id,branch==='shed'?'shed-key':'sprinkler');
        await press();
        const secured=await route();
        assert.equal(branch==='shed'?secured.key:secured.drain,true);
        assert.equal(secured.completed,1);
        assert.equal(secured.route.id,'field-log');
        assert.match(secured.objective,/FIELD CHECKS 1\/3/);
        if(variant===0&&branch==='shed') await shot('exit-secured');
        await page.evaluate(()=>{const t=window.__routeTest;t.state.hole.nightOrderActionsCompleted=t.NIGHT_ORDER_ACTIONS.map(a=>a.id);});
        assert.equal((await route()).route.id,branch==='shed'?'maintenance-shed':'drain-exit');
        checks.push(`Variant ${variant+1}, ${branch}: prepare after first check, explicit pickup, remaining checks, then committed exit`);
      }
    }
    assert.deepEqual(errors,[]);
    const snapshot=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));
    fs.writeFileSync(path.join(out,'final-state.json'),JSON.stringify(snapshot,null,2));
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,checks,errors},null,2));
    console.log(JSON.stringify({passed:true,checks,errors},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
