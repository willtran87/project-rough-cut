/* Ordinary keyboard/mouse input only. Storage selects the course configuration;
 * all checks, pickups and exits must be earned through the live game. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
  const out=path.resolve(process.argv[2]||'output/next-pass/natural');fs.mkdirSync(out,{recursive:true});
  const variant=process.argv.includes('--east')?'eastern_exception':process.argv.includes('--west')?'closing_shift':'standard_review';
  const pressure=process.argv.includes('--steady')?.8:process.argv.includes('--relentless')?1.2:1;
  const route=process.argv.includes('--drain')?'drain':process.argv.includes('--shed')?'shed':null;
  const lateAccess=process.argv.includes('--late-access');
  const sideLure=process.argv.includes('--side-lure');
  const skipBonus=process.argv.includes('--skip-bonus');
  const preAccess=process.argv.includes('--pre-access');
  const waitPatrol=process.argv.includes('--wait-patrol');
  const cautious=process.argv.includes('--cautious');
  const baseUrl=process.env.ROUGH_CUT_QA_URL||'http://127.0.0.1:4187/';
  const localSource=fs.readFileSync('web/game.js','utf8');
  let gameSource=localSource;
  if(process.env.ROUGH_CUT_QA_URL){
    const response=await fetch(new URL('game.js',baseUrl));
    if(!response.ok)throw new Error(`Published game request failed: ${response.status}`);
    gameSource=await response.text();
    if(gameSource.replace(/\r\n/g,'\n')!==localSource.replace(/\r\n/g,'\n'))throw new Error('Published game differs from the local release candidate');
  }
  const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:720}});
  const events=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Read-only route planning chooses an alternate exit; all actor movement,
  // pickups, checks and filing still use ordinary keyboard/mouse controls.
  if(route) {
    await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:gameSource.replace('  window.advanceTime = (milliseconds) => {',
      fs.readFileSync('tools/route-safety-probe.js','utf8')+'\n  window.__courseProbePlan = (route, exit, defer) => {const target=defer?NIGHT_ORDER_ACTIONS.find(a=>!state.hole.nightOrderActionsCompleted.includes(a.id)):exit?(route==="shed"?SHED_EXIT:DRAIN_EXIT):(route==="shed"?activeKeyPoint():activeSprinklerPoint());const p=planObjectiveApproach(target,state.player);return {point:p.point,path:p.path};};\n  window.advanceTime = (milliseconds) => {')}));
  }
  await page.addInitScript(({variant,pressure})=>{
    localStorage.setItem('rough-cut.settings.v1',JSON.stringify({pursuitIntensity:pressure}));
    localStorage.setItem('rough-cut.career.v1',JSON.stringify({selectedVariantId:variant,filedChangeRequests:['standard_review','eastern_exception','closing_shift']}));
  },{variant,pressure});
  const tick=n=>page.evaluate(n=>window.advanceTime(n*1000/60),n);
  const read=()=>page.evaluate(()=>{const s=JSON.parse(window.render_game_to_text()),h=s.hole;return {mode:s.mode,tutorial:h.tutorialVisible,p:s.player,checks:h.fieldChecks,guide:h.navigationReadability.firstPersonGuidance,joe:h.joe,environment:h.environment,key:h.keyCollected,drain:h.drainUnlocked,balls:h.golfBalls,owner:h.interactionPromptOwner,filing:h.escapeFiling,aim:h.ballAim,flight:h.ballFlight,variant:h.variant,outcome:h.escapeRoute||h.outcome};});
  const input=async(keys,n)=>{for(const key of keys)await page.keyboard.down(key);await tick(n);for(const key of keys)await page.keyboard.up(key);};
  const turn=async(angle,current)=>{const delta=Math.atan2(Math.sin(angle-current),Math.cos(angle-current));await page.dispatchEvent('canvas','pointermove',{pointerType:'mouse',buttons:1,movementX:delta/.0025});};
  try{
    await page.goto(baseUrl);await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>typeof window.render_game_to_text==='function'&&JSON.parse(window.render_game_to_text()).assets.course.ready,null,{timeout:60000});
    await tick(180);
    for(let i=0;i<12;i++){const entry=await page.evaluate(()=>{const s=JSON.parse(window.render_game_to_text());return {mode:s.mode,tutorial:s.hole?.tutorialVisible};});console.log('entry',entry);if(entry.mode==='first_hole'&&!entry.tutorial)break;await input(['Enter'],2);await tick(15);}
    let last='',lastThrow=-500,stuck=0,old=null,s,waited=false;
    for(let step=0;step<2600;step++){
      s=await read();const signature=[s.mode,s.checks.completed,s.key,s.drain,s.guide.targetId].join('|');
      if(signature!==last){console.log(step,signature,Math.round(s.p.x),Math.round(s.p.progress));events.push({step,...s});last=signature;}
      if(s.mode!=='first_hole')break;
      if(s.tutorial){await input(['Enter'],2);continue;}
      if(s.filing.active||s.filing.sealing){await tick(10);continue;}
      const unwanted=route==='shed'?['sprinkler','drain-exit']:route==='drain'?['shed-key','maintenance-shed']:[];
      if(s.owner&&!unwanted.includes(s.owner.targetId)&&!(preAccess&&!(route==='shed'?s.key:s.drain)&&['audit-bell','field-log','release-review'].includes(s.owner.targetId))&&['audit-bell','field-log','release-review','shed-key','sprinkler','maintenance-shed','drain-exit'].includes(s.owner.targetId)){
        await input(s.owner.targetId==='field-log'?['c','Enter']:['Enter'],1);continue;
      }
      if(s.checks.signalBreakaway?.reached&&!skipBonus){await input(['c'],8);continue;}
      if(waitPatrol&&!waited&&s.checks.completed===1&&!s.checks.signalBreakaway&&s.environment.hardCover){await input(['c'],360);waited=true;continue;}
      let goal=s.guide.nextWaypoint;
      const access=route==='shed'?s.key:s.drain;
      if(route&&(s.checks.completed>0||preAccess&&!access)&&(!s.checks.signalBreakaway||skipBonus)&&(!access||s.checks.completed===3||skipBonus&&s.checks.signalBreakaway)) {
        const plan=await page.evaluate(({route,exit,defer})=>window.__courseProbePlan(route,exit,defer),{route,exit:s.checks.completed===3&&access,defer:s.checks.completed<3&&(lateAccess&&s.checks.completed<2||access)});
        goal=plan.path.find(p=>Math.hypot((p.x-s.p.x)*.72,p.y-s.p.progress)>1.5)||plan.point;
      }
      // A route planner must yield to the collision-recovery instruction that
      // a human sees, rather than repeatedly pressing into its stale waypoint.
      if(s.p.cameraMotion.movementFeedback.escapeOverride)goal=s.guide.nextWaypoint;
      if(!goal){await tick(6);continue;}
      if(cautious&&s.joe.distance<58&&!s.checks.signalBreakaway?.reached)goal=await page.evaluate(goal=>window.__courseProbeSafeWaypoint(goal),goal);
      const dx=(goal.x-s.p.x)*.72,dy=goal.y-s.p.progress,d=Math.hypot(dx,dy),angle=Math.atan2(dx,dy);
      if(s.joe.distance<(cautious?55:85)&&s.joe.distance>30&&s.joe.mode!=='investigate'&&s.balls>(cautious&&s.checks.completed<2?1:0)&&step-lastThrow>70&&(!s.checks.signalBreakaway||skipBonus)){
        // Place a remote lure opposite onward travel, then restore the route view.
        const lureAngle=sideLure?angle+Math.PI/2*(s.p.x>=s.joe.x?-1:1):angle+Math.PI;
        await turn(lureAngle,s.p.cameraYawRadians||0);await input(['Space'],48);await tick(1);lastThrow=step;s=await read();
      }
      await turn(angle,s.p.cameraYawRadians||0);
      const fleeing=s.joe.mode==='chase'||Boolean(s.checks.signalBreakaway)||s.joe.hasLineOfSight&&s.joe.distance<45||cautious&&s.joe.distance<28;
      const keys=['w'];if(fleeing)keys.push('Shift');else if(s.environment.hardCover&&s.joe.distance<70)keys.push('c');
      const n=Math.max(1,Math.min(8,Math.floor(d/(fleeing?38:keys.includes('c')?14:24)*60)));
      await input(keys,n);
      if(old&&Math.hypot((s.p.x-old.x)*.72,s.p.progress-old.y)<.02)stuck++;else stuck=0;
      old={x:s.p.x,y:s.p.progress};if(stuck>80){events.push({step,reason:'no_progress',...s});break;}
    }
    const final=await read();await page.screenshot({path:path.join(out,'final.png')});
    const evidence=await page.evaluate(()=>window.export_rough_cut_playtest?JSON.parse(window.export_rough_cut_playtest()):null);
    const crypto=require('node:crypto');
    fs.writeFileSync(path.join(out,'route.json'),JSON.stringify({variant,pressure,requestedRoute:route,lateAccess,sideLure,skipBonus,preAccess,waitPatrol,cautious,sourceHash:crypto.createHash('sha256').update(gameSource).digest('hex'),errors,events,final,evidence},null,2));
    console.log(JSON.stringify({mode:final.mode,checks:final.checks.completed,key:final.key,drain:final.drain,errors}));
    if(final.variant.id!==variant || final.mode!=='victory' || final.checks.completed!==3 || !(final.key||final.drain) || route&&evidence?.outcome!==route || errors.length) {
      throw new Error('Course acceptance failed; inspect route.json and final.png');
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
