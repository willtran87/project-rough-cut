/* Controlled causal regressions; completion paths use play-complete-route. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=path.resolve(process.env.ROUGH_CUT_QA_OUT || 'output/a-grade-closure/causal');fs.mkdirSync(out,{recursive:true});
 const source=fs.readFileSync('web/game.js','utf8'),browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 const names='state,resetFirstHole,updateJoe,joeDirectionalPresentation,joeDirectionalCell,syncLessonInputDevice,practicalLessonPresentation,updateExperienceEvidence,COURSE_OBSTACLES,lineBlockerBetween,obstacleAtPosition,PLAYER_COLLISION_RADIUS,playerNextActionPresentation,render,NIGHT_ORDER_ACTIONS';
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {',`  window.__closure={${names}};\n  window.advanceTime = (milliseconds) => {`)}));
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(window.render_game_to_text()).assets.course.ready);
  const reset=()=>page.evaluate(()=>{const t=window.__closure,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.player={x:0,y:660,yaw:0,heading:Math.PI/2};s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.concealment=0;s.hole.noise=0;Object.assign(s.hole.joe,{x:0,y:635,mode:'patrol',effectHeading:Math.PI/2,patrolPause:1000});});
  for(const cause of ['sight','sound']){
   await reset();
   const transitions=await page.evaluate(cause=>{const t=window.__closure,h=t.state.hole;h.detection=.9;
    h.noise=cause==='sound'?.7:0;h.joe.effectHeading=cause==='sound'?-Math.PI/2:Math.PI/2;
    const results=[];for(let i=0;i<7;i++){t.updateJoe(.1);results.push({mode:h.joe.mode,cause:h.detectionSource,confirmed:h.contactConfirmationSeconds});h.joe.x=0;h.joe.y=635;}return results;
   },cause);
   assert(transitions.slice(0,6).every(t=>t.mode!=='chase'),JSON.stringify(transitions));assert.equal(transitions[6].mode,'chase');assert.equal(transitions[0].cause,cause);
  }
  checks.push('Existing .9 awareness still gives fresh sight and sound at least .65 seconds before chase');
  await reset();
  const contact=await page.evaluate(()=>{const t=window.__closure,h=t.state.hole;h.contactConfirmationSeconds=.4;h.joe.effectHeading=-Math.PI/2;t.updateJoe(.2);const drained=h.contactConfirmationSeconds;h.joe.y=650;h.joe.effectHeading=Math.PI/2;t.updateJoe(.01);return {drained,mode:h.joe.mode};});
  assert.equal(contact.drained,0);assert.equal(contact.mode,'chase');checks.push('Broken contact drains acquisition; deliberate close contact retains immediate pursuit');
  await reset();
  const wallCapture=await page.evaluate(()=>{const t=window.__closure,s=t.state;s.hole.joe.y=652;
   // A thin fixture isolates close capture from the authored course layout.
   const wall={id:'qa-thin-cover',x:0,y:656,radius:1,radiusX:18,radiusY:1,blocks:true,sight:true,coverRadius:12,draw:false};
   t.COURSE_OBSTACLES.push(wall);const blocked=t.lineBlockerBetween(s.hole.joe,s.player);t.updateJoe(0);const protectedMode=s.mode;
   t.COURSE_OBSTACLES.pop();t.updateJoe(0);return {blocked,protectedMode,openMode:s.mode};});
  assert.equal(wallCapture.blocked,'qa-thin-cover');assert.equal(wallCapture.protectedMode,'first_hole');assert.equal(wallCapture.openMode,'defeat');
  checks.push('Close capture respects a solid-cover ray; identical open-ground contact captures normally');
  await reset();
  const poses=await page.evaluate(()=>{const t=window.__closure,h=t.state.hole,j=h.joe;j.effectSpeed=0;return [1,2,3].map(view=>['listen','investigate','search','chase'].map(mode=>{j.mode=mode==='listen'?'patrol':mode;h.contactConfirmationSeconds=mode==='listen'?.2:0;const p=t.joeDirectionalPresentation(view);return {pose:p.pose,stationary:p.stationary,y:p.cell.y};}));});
  for(const row of poses){assert.deepEqual(row.map(p=>p.pose),[0,1,2,3]);assert(row.every(p=>p.stationary));}
  const motion=await page.evaluate(()=>{const t=window.__closure,j=t.state.hole.joe;j.mode='chase';j.effectSpeed=12;return [0,1.7,3.3,4.9].map(m=>{j.walkMeters=m;const p=t.joeDirectionalPresentation(1);return {x:p.cell.x,stationary:p.stationary,lean:p.lean};});});
  assert.deepEqual(motion.map(p=>p.x),[0,384,768,1152]);assert(motion.every(p=>!p.stationary&&p.lean<0));checks.push('All side/rear states have authored stopped poses; moving pursuit retains four distance-driven gait frames');
  await reset();
  const devices=await page.evaluate(()=>{const t=window.__closure,s=t.state;s.learnedControlsByDevice={keyboard:{move:true,look:true,chip:true,cover:true}};s.lessonInputMethod=null;s.inputMethod='keyboard';t.syncLessonInputDevice();const keyboard=s.learnedControls.move;s.inputMethod='touch';t.syncLessonInputDevice();const touch=t.practicalLessonPresentation();s.inputMethod='gamepad';t.syncLessonInputDevice();const pad=t.practicalLessonPresentation();s.inputMethod='keyboard';t.syncLessonInputDevice();return {keyboard,touch,pad,restored:s.learnedControls.move};});
  assert(devices.keyboard&&devices.restored);assert.equal(devices.touch.id,'move');assert(devices.touch.instruction.includes('LEFT PAD'));assert(devices.pad.instruction.includes('LEFT STICK'));checks.push('Mastered keyboard controls cannot hide first-use touch or controller lessons; switching back restores mastery');
  await reset();await page.evaluate(()=>{const t=window.__closure,s=t.state,a=t.NIGHT_ORDER_ACTIONS[0];s.player.x=a.x;s.player.y=a.y;s.hole.joe.x=100;s.hole.joe.y=650;window.advanceTime(1000/60);s.inputMethod='touch';s.lessonInputMethod='keyboard';});
  assert.equal(await page.evaluate(()=>window.__closure.practicalLessonPresentation()),null);
  assert.match(await page.evaluate(()=>window.__closure.playerNextActionPresentation().text),/RING BELL/);
  checks.push('Switching devices beside a usable station preserves its action prompt above basic movement lessons');
  // Review actual renderer at close range, every view, stopped and moving.
  for(const [view,heading] of [[1,0],[2,Math.PI/2],[3,Math.PI]])for(const mode of ['patrol','listen','investigate','search','chase']){
   await reset();await page.evaluate(({heading,mode})=>{const s=window.__closure.state,h=s.hole;s.player.y=650;h.joe.y=668;h.joe.effectHeading=heading;h.joe.mode=mode==='listen'?'patrol':mode;h.joe.effectSpeed=0;h.contactConfirmationSeconds=mode==='listen'?.2:0;h.joe.renderViewIndex=undefined;s.hole.messageTimer=0;s.hole.stateBannerTimer=0;},{heading,mode});
   // Zero-time rendering preserves the controlled pose without advancing AI.
   await page.evaluate(()=>window.__closure.render());await page.screenshot({path:path.join(out,`pose-${view}-${mode}.png`)});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({sourceHash:require('node:crypto').createHash('sha256').update(source).digest('hex'),passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
