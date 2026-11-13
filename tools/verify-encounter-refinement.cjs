/* Controlled encounters exercise real inputs and authoritative simulation.
 * These checks do not replace the deferred human balance/playtest sessions. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
  const out='output/encounter-refinement';fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
  await page.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const source=fs.readFileSync('web/game.js','utf8');
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__encounter={state,resetFirstHole,render,updateJoe,updateCloseEscape,stationPlan,announceJoeState,NIGHT_ORDER_ACTIONS,lineBlockerBetween};\n  window.advanceTime = (milliseconds) => {')}));
  const tick=n=>page.evaluate(n=>advanceTime(n*1000/60),n);
  const read=()=>page.evaluate(()=>{const s=__encounter.state,h=s.hole;return {mode:s.mode,checks:h.nightOrderActionsCompleted,quiet:h.quietLog,clean:h.fieldSignalBreakaway.completed,distraction:h.distraction,signal:h.distractionTimer,escape:h.engagement.closeEscape,joe:h.joe,player:s.player,filing:h.escapeFiling};});
  const render=()=>page.evaluate(()=>__encounter.render());
  const reset=async()=>{await page.evaluate(()=>{const t=__encounter,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.inputMethod='keyboard';s.guidedHints=false;Object.assign(s.hole,{tutorialVisible:false,controlHintTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:100,y:30,patrolPause:9999});});await tick(1);};
  const station=async index=>{await page.evaluate(i=>{const t=__encounter,a=t.NIGHT_ORDER_ACTIONS[i];Object.assign(t.state.player,{x:a.x,y:a.y-6,yaw:0,pitch:0});},index);await tick(1);};
  const close=async()=>{await reset();await page.evaluate(()=>{const s=__encounter.state,h=s.hole;Object.assign(s.player,{x:0,y:180,yaw:0});Object.assign(h.joe,{x:0,y:173,effectLastX:0,effectLastY:173,effectHeading:Math.PI/2,mode:'chase',alert:1});h.hasLineOfSight=true;h.detection=1;});await tick(1);};
  try{
    await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>window.__encounter&&JSON.parse(render_game_to_text()).assets.course.ready);
    await reset();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:60000});
    await station(0);await page.keyboard.press('e');let s=await read();assert.deepEqual(s.checks,['audit-bell']);assert.equal(s.distraction.sourceId,'audit-bell');assert(s.signal>6);assert(s.joe.reactionTimer>0);
    await tick(10);await page.screenshot({path:out+'/bell.png'});assert.equal((await read()).checks.length,1);
    checks.push('Normal Use rings the bell once, draws Joe, and starts an orientation beat');

    await reset();await station(1);await page.keyboard.press('1');await tick(30);assert((await read()).quiet.progress>.4);
    await page.keyboard.down('w');await tick(1);await page.keyboard.up('w');assert.equal((await read()).quiet,null);assert.equal((await read()).checks.length,0);
    await station(1);await page.keyboard.press('1');await tick(105);s=await read();assert.deepEqual(s.checks,['field-log']);assert.deepEqual(s.clean,['field-log']);assert.equal(s.signal,0);
    await reset();await station(1);await page.keyboard.press('2');s=await read();assert.deepEqual(s.checks,['field-log']);assert(s.signal>5);
    checks.push('Quiet filing requires stillness and cancels on movement; loud filing remains immediate');

    await reset();await station(2);
    const planCases=await page.evaluate(()=>{const t=__encounter,h=t.state.hole,a=t.NIGHT_ORDER_ACTIONS[2],cases=[];
      for(const kind of ['valid','expired','nearby','chase','visible','appeal']){
        h.distraction={kind:kind==='appeal'?'appeal':'golf_ball',x:kind==='nearby'?a.x:-20,y:kind==='nearby'?a.y:570,ballId:3};h.distractionTimer=kind==='expired'?.5:4;
        h.joe.mode=kind==='chase'?'chase':'investigate';h.hasLineOfSight=kind==='visible';cases.push({kind,active:t.stationPlan(a).active});
      }return cases;});assert.deepEqual(planCases.map(c=>c.active),[true,false,false,false,false,false]);
    await page.evaluate(()=>{const h=__encounter.state.hole;h.distraction={kind:'golf_ball',x:-20,y:570,ballId:3};h.distractionTimer=4;Object.assign(h.joe,{x:-20,y:570,effectLastX:-20,effectLastY:570,mode:'investigate'});h.hasLineOfSight=false;h.detection=0;});await tick(1);await render();await page.screenshot({path:out+'/release-ready.png'});
    const readiness=await page.evaluate(()=>JSON.parse(render_game_to_text()).readiness);for(const id of ['field_action_commitment_preview','field_signal_breakaway_destination_continuity'])assert.equal(readiness.checks.find(c=>c.id===id).passed,true,id+' with silent release');
    const before=await read();await page.keyboard.press('e');s=await read();assert.deepEqual(s.checks,['release-review']);assert.deepEqual(s.clean,['release-review']);assert.deepEqual(s.distraction,before.distraction);assert.equal(s.signal,before.signal);await page.keyboard.press('e');assert.equal((await read()).checks.length,1);await render();await page.screenshot({path:out+'/release-success.png'});
    await tick(270);assert.notEqual((await read()).joe.mode,'investigate','Original diversion expires normally');
    await reset();await station(2);await page.keyboard.press('e');s=await read();assert.equal(s.distraction.sourceId,'release-review');assert(s.signal>4.9);
    checks.push('A valid distant golf lure masks release signing without stealing or extending the lure; unsafe/expired cases stay loud');

    await close();s=await read();assert.equal(s.mode,'first_hole');assert(s.escape.remaining>.6);assert.equal(s.escape.activations,1);
    const frozen=s.escape.remaining;await page.keyboard.press('Escape');await tick(90);assert.equal((await read()).escape.remaining,frozen);await page.keyboard.press('Escape');
    await page.keyboard.down('w');await tick(36);await page.keyboard.up('w');s=await read();assert.equal(s.mode,'first_hole');assert(s.player.y>190);assert.equal(s.joe.y,173);
    await tick(12);assert.equal((await read()).mode,'first_hole');
    await page.evaluate(()=>{const s=__encounter.state;Object.assign(s.player,{x:s.hole.joe.x,y:s.hole.joe.y});});await tick(1);assert.equal((await read()).mode,'defeat','Recontact cannot refresh the window');
    await close();await tick(45);assert.equal((await read()).mode,'defeat','Standing in reach still loses');
    await reset();const rearm=await page.evaluate(()=>{const t=__encounter,h=t.state.hole,e=h.engagement.closeEscape;e.armed=false;h.hasLineOfSight=false;h.joe.mode='patrol';Object.assign(t.state.player,{x:0,y:600});t.updateCloseEscape(7.9);const early=e.armed;t.updateCloseEscape(.11);return {early,armed:e.armed};});assert.deepEqual(rearm,{early:false,armed:true});
    const held=await page.evaluate(()=>{const t=__encounter,h=t.state.hole,e=h.engagement.closeEscape;e.armed=false;e.safeSeconds=0;h.joe.mode='chase';t.updateCloseEscape(9);const chase=e.armed;h.joe.mode='patrol';h.hasLineOfSight=true;t.updateCloseEscape(9);return {chase,visible:e.armed};});assert.deepEqual(held,{chase:false,visible:false});
    checks.push('Close escape permits real movement, freezes on Pause, expires into capture, rejects immediate reuse, and rearms only after safety');

    await close();
    for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]){
      await page.setViewportSize({width,height});await page.evaluate(w=>{__encounter.state.inputMethod=w===844?'touch':'keyboard';__encounter.state.hole.captions.push({text:'UNRELATED ADVICE',age:0,duration:9});},width);await render();
      assert.equal(await page.locator('[data-q=goal]').textContent(),'JOE BRACES THE MOWER · BEHIND');assert.equal(await page.locator('[data-q=context]').textContent(),'MOVE OFF ITS LINE NOW');assert(await page.locator('[data-q=caption]').isHidden());assert(await page.locator('[data-q=threat]').isHidden());
      for(const selector of ['.q-objective','.q-context','.q-resources']){const b=await page.locator(selector).boundingBox();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=width+1&&b.y+b.height<=height+1,selector+' fits '+width);}
      await page.screenshot({path:out+'/danger-'+width+'.png'});
    }
    checks.push('Urgent HUD has one status and one instruction; captions and choices yield at four viewport sizes');
    await page.setViewportSize({width:2560,height:1600});await reset();
    for(const intent of ['orienting','inspecting','searching']){
      await page.evaluate(intent=>{const s=__encounter.state,h=s.hole;Object.assign(s.player,{x:0,y:180,yaw:0});Object.assign(h.joe,{x:0,y:204,effectHeading:-Math.PI/2,effectSpeed:0,mode:intent==='searching'?'search':'investigate',reactionTimer:intent==='orienting'?.4:0});h.engagement.inspection=intent==='inspecting'?{x:0,y:204}:null;},intent);
      for(let i=0;i<18;i++)await page.evaluate(()=>{__encounter.state.hole.elapsed+=1/60;__encounter.render();});
      const actor=await page.evaluate(()=>RCScene3D.stats().joeModel);assert.equal(actor.intent,intent);assert(actor.handError<.005);await page.screenshot({path:out+'/joe-'+intent+'.png'});
      const frozen=await page.evaluate(()=>{const before=RCScene3D.stats().joeModel.headRotation;for(let i=0;i<20;i++)__encounter.render();return {before,after:RCScene3D.stats().joeModel.headRotation};});assert.deepEqual(frozen.before,frozen.after);
    }
    checks.push('Joe orientation, inspection and search poses keep his grip and freeze when simulation time is unchanged');
    await reset();
    const ropes=await page.evaluate(()=>RCScene3D.stats().pixelWorld.objects.filter(o=>o.kind==='boundary-rope'));assert.equal(ropes.length,88);
    assert(ropes.every(r=>Math.abs(r.position[0])===13.1));await page.evaluate(()=>Object.assign(__encounter.state.player,{x:108,y:340,yaw:0}));await page.keyboard.down('d');await tick(90);await page.keyboard.up('d');s=await read();assert(s.player.x<=112&&s.player.x>=108);const edgeY=s.player.y;await page.keyboard.down('w');await tick(30);await page.keyboard.up('w');assert((await read()).player.y>edgeY+2);
    await page.evaluate(()=>Object.assign(__encounter.state.player,{x:100,y:340,yaw:Math.PI/2}));await render();await page.screenshot({path:out+'/border.png'});assert.deepEqual(await page.evaluate(()=>RCScene3D.stats().pixelWorld.objects.filter(o=>o.kind==='boundary-rope')),ropes);
    checks.push('88 fixed rope spans mark the existing side boundary; collision and travel along it remain intact');

    await reset();await page.evaluate(()=>{const t=__encounter,s=t.state;s.hole.keyCollected=true;s.hole.nightOrderActionsCompleted=t.NIGHT_ORDER_ACTIONS.map(a=>a.id);Object.assign(s.player,{x:-18,y:690,yaw:0});});await tick(1);await page.keyboard.press('e');assert((await read()).filing.active);await tick(180);assert.equal((await read()).mode,'victory');
    await reset();await page.evaluate(()=>{const t=__encounter,s=t.state;s.hole.drainUnlocked=true;s.hole.nightOrderActionsCompleted=t.NIGHT_ORDER_ACTIONS.map(a=>a.id);Object.assign(s.player,{x:-78,y:690,yaw:0});});await tick(1);await page.keyboard.press('e');assert((await read()).filing.active);await tick(180);assert.equal((await read()).mode,'victory');
    checks.push('Completed checks still lead through ordinary shed and drain filing/sealing to victory');
    assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
  }catch(e){await page.screenshot({path:out+'/failure.png'});fs.writeFileSync(out+'/failure.json',JSON.stringify(await read(),null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
