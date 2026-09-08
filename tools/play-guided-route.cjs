/* Ordinary-input route probe; no state injection or teleporting.
 * node tools/play-guided-route.cjs [output-directory]
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
(async () => {
  const out = path.resolve(process.argv[2] || 'output/guided-route');
  const tactical = process.argv.includes('--tactical');
  const sprint = process.argv.includes('--sprint');
  fs.mkdirSync(out, {recursive:true});
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1280,height:720}});
  const errors = [], events = [];
  page.on('pageerror', e => errors.push(e.message));
  const tick = n => page.evaluate(n => window.advanceTime(n*1000/60), n);
  const read = () => page.evaluate(() => {
    const s = JSON.parse(window.render_game_to_text());
    return {mode:s.mode, player:s.player, checks:s.hole.fieldChecks,
      guide:s.hole.navigationReadability.firstPersonGuidance, joe:s.hole.joe,
      key:s.hole.keyCollected, drain:s.hole.drainUnlocked,
      interaction:s.hole.interactionPromptOwner, filing:s.hole.escapeFiling};
  });
  const input = async (keys, frames) => {
    for (const key of keys) await page.keyboard.down(key);
    await tick(frames);
    for (const key of keys) await page.keyboard.up(key);
  };
  try {
    await page.goto('http://127.0.0.1:4187');
    await page.waitForFunction(() => typeof window.advanceTime === 'function');
    await page.locator('canvas').click(); await page.keyboard.press('Space');
    await page.waitForFunction(() => {const s=JSON.parse(window.render_game_to_text());return s.assets.course.loaded===42&&s.assets.results.loaded===4;},null,{timeout:60000});
    await tick(180); await input(['Enter'],2); await tick(1); await input(['Enter'],2);
    let last = '', stuck = 0, old = null, s, lastChip = -100;
    for (let step=0;step<1500;step++) {
      s = await read();
      const signature = [s.mode,s.guide.targetId,s.checks.completed,s.key,s.drain].join('|');
      if(signature!==last) { events.push({step, ...s}); console.log(signature, s.player.x,s.player.progress); last=signature; }
      if(s.mode!=='first_hole') break;
      if(s.filing.active || s.filing.sealing) {await tick(12);continue;}
      if(tactical && s.joe.distance<55 && step-lastChip>70) {
        await input(['Space',s.player.x>0?'ArrowLeft':'ArrowRight'],24);
        await tick(1);lastChip=step;
      }
      const owner = s.interaction?.targetId;
      if(['audit-bell','field-log','release-review','shed-key','sprinkler','maintenance-shed','drain-exit'].includes(owner)) {
        await input(['Enter'],1); await tick(1);
      }
      if(s.checks.signalBreakaway?.reached) {await input(['c'],12);continue;}
      const waypoint = s.guide.nextWaypoint;
      if(!waypoint) {await tick(12);continue;}
      const dx = waypoint.x-s.player.x, dy=waypoint.y-s.player.progress;
      const keys=[];
      if(Math.abs(dx)>1.4) keys.push(dx>0?'ArrowRight':'ArrowLeft');
      if(Math.abs(dy)>1.4) keys.push(dy>0?'ArrowUp':'ArrowDown');
      if(!keys.length) {if(Math.abs(dx)>Math.abs(dy)) keys.push(dx>0?'ArrowRight':'ArrowLeft');else keys.push(dy>0?'ArrowUp':'ArrowDown');}
      if(sprint || (tactical && (s.joe.distance<65 || s.checks.signalBreakaway))) keys.push('Shift');
      const movement = old ? Math.hypot(s.player.x-old.x,s.player.progress-old.y):10;
      stuck = movement<0.08 ? stuck+1:0;
      if(stuck>30) {events.push({reason:'stuck',step,...s});break;}
      old={x:s.player.x,y:s.player.progress};
      await input(keys, 6);
    }
    await page.screenshot({path:path.join(out,'final.png')});
    fs.writeFileSync(path.join(out,'route.json'),JSON.stringify({errors,events,final:await read()},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
