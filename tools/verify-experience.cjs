/* Browser acceptance for the experience pass. Test-only source interception
 * isolates geometry and choice rules; it does not certify human fun/balance. */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
(async () => {
  const out = path.resolve(process.env.ROUGH_CUT_QA_OUT || 'output/experience'); fs.mkdirSync(out, {recursive:true});
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:2560,height:1600}});
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const source = fs.readFileSync('web/game.js', 'utf8');
  await page.route('**/game.js*', r => r.fulfill({contentType:'application/javascript',body:source.replace(
    '  window.advanceTime = (milliseconds) => {',
    '  window.__experienceTest = {state,resetFirstHole,SETTINGS_ROWS,settingsRowGeometry,nextSettingsFieldPage,savePreferences,readSavedPreferences,turnCamera,cameraRelativeMovement,stationPlan,joeFacingSeesPoint,directionalViewIndex,escapeReadiness,NIGHT_ORDER_ACTIONS,SHED_EXIT,DRAIN_EXIT,activeKeyPoint,activeSprinklerPoint,planObjectiveApproach,obstacleAtPosition,movePlayerBy,worldDistance,interactWithCourse,activeRunVariant,RUN_VARIANTS,beginGameplayPerformanceWindow};\n  window.advanceTime = (milliseconds) => {')}));
  const tick = n => page.evaluate(n => window.advanceTime(n * 1000/60), n);
  const read = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
  const reset = async () => {
    await page.evaluate(() => {const t=window.__experienceTest;t.resetFirstHole(); const s=t.state,h=s.hole;
      s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();h.tutorialVisible=false;
      h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;h.joe.x=100;h.joe.y=50;h.joe.patrolPause=1000;
      s.player.x=0;s.player.y=660;s.player.yaw=0;}); await tick(1);
  };
  const shot = async name => {await tick(1);await page.screenshot({path:path.join(out,`${name}.png`)});};
  try {
    await page.goto('http://127.0.0.1:4187'); await page.waitForFunction(() => typeof window.advanceTime==='function');
    await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>{const a=JSON.parse(window.render_game_to_text()).assets;return a.course.ready&&a.course.failed===0&&a.results.ready;},null,{timeout:60000});
    await tick(180);await page.keyboard.press('Enter');await tick(1);
    for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]) {
      await page.setViewportSize({width,height});await shot(`briefing-${width}`);
    }
    await page.keyboard.press('Enter'); await reset();
    const movements = [];
    for(const keys of [['w'],['s'],['a'],['d'],['w','d']]) {
      await reset();const before=(await read()).player;
      for(const key of keys)await page.keyboard.down(key);await tick(12);for(const key of keys)await page.keyboard.up(key);
      const after=(await read()).player;
      movements.push(Math.hypot((after.x-before.x)*.72,after.progress-before.progress));
    }
    // Real terrain may apply the existing 8% mowed-lane bonus during a burst.
    assert(Math.max(...movements)/Math.min(...movements)<1.10,JSON.stringify(movements));
    const lengths=await page.evaluate(()=>{const t=window.__experienceTest,values=[];for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const input of [{x:1,y:0},{x:0,y:1},{x:Math.SQRT1_2,y:Math.SQRT1_2}]){t.state.player.yaw=yaw;const m=t.cameraRelativeMovement(input);values.push(Math.hypot(m.x*.72,m.y));}return values;});
    assert(lengths.every(n=>Math.abs(n-1)<1e-9));
    const gait = await page.evaluate(()=>{const t=window.__experienceTest,s=t.state,values=[];
      for(const [dx,dy] of [[1/.72,0],[0,1],[Math.SQRT1_2/.72,Math.SQRT1_2]]) {
        s.player.x=0;s.player.y=660;const before=s.hole.travelDistance;
        const applied=t.movePlayerBy(dx,dy);values.push([applied,s.hole.travelDistance-before,s.hole.lastMovementRequestedDistance]);
      }return values;});
    assert(gait.flat().every(n=>Math.abs(n-1)<1e-8),JSON.stringify(gait));
    checks.push({name:'Camera-relative speed, gait and footsteps use physical meters; actual keyboard bursts stay within the terrain bonus',movements,gait});
    const camera = await page.evaluate(()=>{const t=window.__experienceTest,s=t.state; s.lookSensitivity=.4;s.player.yaw=0;t.turnCamera(.2);const slow=s.player.yaw;
      s.lookSensitivity=1.8;s.player.yaw=0;t.turnCamera(.2);const fast=s.player.yaw;
      s.invertLook=true;s.player.yaw=0;t.turnCamera(.2);const inverted=s.player.yaw;
      s.freeLook=false;s.player.yaw=0;t.turnCamera(.2);const fixed=s.player.yaw;
      s.freeLook=true;s.lookSensitivity=1;s.invertLook=false;return {slow,fast,inverted,fixed};});
    assert(camera.fast>camera.slow*4);assert(camera.inverted<0);assert.equal(camera.fixed,0);
    checks.push({name:'Sensitivity, inversion and fixed-view option affect actual camera rotation',camera});
    const facing=await page.evaluate(()=>{const t=window.__experienceTest,j={x:0,y:350,effectHeading:Math.PI/2,mode:'patrol'};
      return [t.joeFacingSeesPoint(j,{x:0,y:370}),t.joeFacingSeesPoint(j,{x:0,y:330}),t.joeFacingSeesPoint(j,{x:0,y:345}),t.joeFacingSeesPoint({...j,mode:'chase'},{x:0,y:330})];});
    assert.deepEqual(facing,[true,false,true,true]);checks.push({name:'Joe facing matches distant sight; close awareness and pursuit remain active',facing});

    await reset();await page.evaluate(()=>{const s=window.__experienceTest.state;s.player.x=0;s.player.y=10;s.player.yaw=Math.PI/2;
      s.hole.practiceDrill.active=true;s.hole.joe.x=100;s.hole.joe.y=600;});
    for(let attempt=1;attempt<=2;attempt++) {
      await page.keyboard.down('Space');await tick(20);await page.keyboard.up('Space');await tick(300);
      const practice=await page.evaluate(()=>{const h=window.__experienceTest.state.hole;return {misses:h.practiceDrill.misses,balls:h.golfBalls,onCourse:h.recoverableBalls.length};});
      assert.equal(practice.misses,attempt);
      assert.equal(practice.balls,attempt===1?4:3);assert.equal(practice.onCourse,attempt===1?0:1);
    }
    checks.push({name:'Actual first practice miss returns one ball; second miss consumes one, with no duplicate world copy'});

    for(const [id,choice,seconds] of [['audit-bell',false,6.4],['field-log',false,5.6],['field-log',true,0],['release-review',false,5],['release-review',true,3]]) {
      await reset();await page.evaluate(({id,choice})=>{const t=window.__experienceTest,s=t.state,h=s.hole,a=t.NIGHT_ORDER_ACTIONS.find(a=>a.id===id);
        s.player.x=a.x;s.player.y=a.y;h.joe.x=0;h.joe.y=50;h.hasLineOfSight=false;
        if(choice&&id==='field-log'){h.crouched=true;s.keys.add('KeyC');}
        if(choice&&id==='release-review'){h.distraction={x:0,y:500,kind:'golf_ball'};h.distractionTimer=6;h.joe.mode='investigate';}
      },{id,choice});
      await page.keyboard.press('Enter');
      if(id==='field-log'&&choice) await tick(100);
      const state = await page.evaluate(()=>{const h=window.__experienceTest.state.hole;return {seconds:h.distractionTimer,choice:h.lastStationChoice,completed:h.nightOrderActionsCompleted.length};});
      assert(Math.abs(state.seconds-seconds)<.05,JSON.stringify(state));assert.equal(state.completed,1);
      await page.keyboard.press('Enter');assert.equal((await read()).hole.fieldChecks.completed,1);
      await shot(`${id}-${choice?'tactic':'normal'}`);
      checks.push({name:`${id}: ${choice?'prepared':'ordinary'} Use completes once and emits advertised signal`,seconds:state.seconds});
    }

    await reset();
    const access = await page.evaluate(()=>{
      const t=window.__experienceTest,s=t.state,results=[];
      for(let variant=0;variant<3;variant++) {
        t.resetFirstHole(t.RUN_VARIANTS[variant]);s.mode='first_hole';s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;
        const targets=[...t.NIGHT_ORDER_ACTIONS,{...t.activeKeyPoint(),id:'shed-key',radius:12},{...t.activeSprinklerPoint(),id:'sprinkler',radius:13},{...t.SHED_EXIT,id:'maintenance-shed'},{...t.DRAIN_EXIT,id:'drain-exit'}];
        for(const target of targets) for(const offset of [-60,0,60]) {
          let origin={x:Math.max(-106,Math.min(106,target.x+offset)),y:Math.max(8,target.y-48)};
          if(t.obstacleAtPosition(origin.x,origin.y)) {
            let found=false;for(let y=origin.y;y>=Math.max(4,origin.y-40)&&!found;y-=4)for(let x=-104;x<=104;x+=4)if(!t.obstacleAtPosition(x,y)){origin={x,y};found=true;break;}
            if(!found)throw new Error('No traversable approach start');
          }
          s.player.x=origin.x;s.player.y=origin.y;
          const route=t.planObjectiveApproach(target,origin);let steps=0;
          if(!route.path.length&&t.worldDistance(s.player,target)>=target.radius)throw new Error(`No path ${variant} ${target.id}`);
          for(const waypoint of route.path) {
            for(let frame=0;frame<3000&&t.worldDistance(s.player,waypoint)>.18;frame++) {
              const dx=(waypoint.x-s.player.x)*.72,dy=waypoint.y-s.player.y,d=Math.hypot(dx,dy),step=Math.min(d,.4);
              const moved=t.movePlayerBy(dx/d*step/.72,dy/d*step);steps++;
              if(moved<.0001)throw new Error(`Blocked ${variant} ${target.id} at ${s.player.x},${s.player.y}`);
            }
          }
          const distance=t.worldDistance(s.player,target);
          if(distance>=target.radius)throw new Error(`Out of reach ${variant} ${target.id}: ${distance}`);
          results.push({variant,id:target.id,offset,distance:Number(distance.toFixed(2)),steps});
        }
      } return results;
    });
    assert.equal(access.length,63);checks.push({name:'63 collision-driven approaches across all mandatory stations, pickups and exits in all three variants',cases:access.length});
    fs.writeFileSync(path.join(out,'access-matrix.json'),JSON.stringify(access,null,2));

    await reset();await page.setViewportSize({width:2560,height:1600});
    for(const [name,x,y,yaw,heading] of [['joe-front',0,330,0,-Math.PI/2],['joe-side',0,330,0,0],['joe-back',0,330,0,Math.PI/2],['shed-front',-18,680,0,0],['shed-east',35,706,-Math.PI/2,0],['shed-west',-65,706,Math.PI/2,0]]) {
      await reset();await page.evaluate(({name,x,y,yaw,heading})=>{const t=window.__experienceTest,s=t.state,h=s.hole;
        s.player.x=x;s.player.y=y;s.player.yaw=yaw;h.joe.x=0;h.joe.y=name.startsWith('joe')?355:40;h.joe.effectHeading=heading;h.joe.effectLastX=h.joe.x;h.joe.effectLastY=h.joe.y;
        h.joe.patrolPause=1000;h.nightOrderActionsCompleted=t.NIGHT_ORDER_ACTIONS.map(a=>a.id);h.keyCollected=true;
      },{name,x,y,yaw,heading});await shot(name);
    }
    for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]) {
      await reset();await page.setViewportSize({width,height});await page.evaluate(()=>{const s=window.__experienceTest.state;s.uiScale=1.3;});await shot(`large-text-${width}`);
      await page.evaluate(()=>{const t=window.__experienceTest;t.state.mode='settings';t.state.settingsReturnMode='paused';t.state.settingsIndex=0;});await shot(`settings-mix-${width}`);
      await page.evaluate(()=>{const t=window.__experienceTest;t.state.settingsIndex=t.SETTINGS_ROWS.findIndex(r=>r.id==='look_sensitivity');});await shot(`settings-comfort-${width}`);
      const sliderPoint=await page.evaluate(()=>{const t=window.__experienceTest,r=t.settingsRowGeometry(t.state.settingsIndex),box=document.querySelector('canvas').getBoundingClientRect();
        const compact=r.height===100,x=compact?r.x+18+(r.width-144)*.86:r.x+10+144*.86,y=r.y+(compact?76:23);
        return {x:box.x+x/1280*box.width,y:box.y+y/720*box.height};});
      await page.mouse.click(sliderPoint.x,sliderPoint.y);assert.equal((await read()).settings.lookSensitivity,1.6);
      await page.evaluate(()=>{window.__experienceTest.state.lookSensitivity=1;});
    }
    for (const [width,height] of [[2560,1600],[1280,720],[844,390]]) {
      await reset();await page.setViewportSize({width,height});
      await page.evaluate(()=>{const t=window.__experienceTest,s=t.state,h=s.hole;s.uiScale=1.3;h.joe.mode='search';h.joe.x=90;h.joe.y=570;h.hasLineOfSight=false;h.searchTimer=20;});
      await shot(`search-large-text-${width}`);
    }
    const saved = await page.evaluate(()=>{const t=window.__experienceTest,s=t.state;
      s.lookSensitivity=1.6;s.stickDeadzone=.15;s.focusedHud=false;s.clearScenery=false;s.uiScale=1.2;s.freeLook=false;t.savePreferences();
      return t.readSavedPreferences();});
    assert.equal(saved.lookSensitivity,1.6);assert.equal(saved.stickDeadzone,.15);assert.equal(saved.focusedHud,false);assert.equal(saved.freeLook,false);assert.equal(saved.uiScale,1.2);
    checks.push({name:'Comfort settings round-trip through real browser storage; both settings pages captured at four viewport sizes'});
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,checks,errors},null,2));
    console.log(JSON.stringify({passed:true,checks,errors},null,2));
  } catch(e) {await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify(await read(),null,2));throw e;}
  finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
