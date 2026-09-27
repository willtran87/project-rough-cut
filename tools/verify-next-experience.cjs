/* Controlled acceptance of new UI, record isolation and rehearsal lifecycle.
 * Ordinary full-course inputs are covered separately by play-complete-route. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=path.resolve('output/next-pass/acceptance');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/game.js','utf8'),names='state,resetFirstHole,SETTINGS_ROWS,SETTINGS_CATEGORIES,settingsCategory,settingsVisibleIndices,selectSettingsCategory,resetSettingsCategory,applySliderSetting,updateRehearsalCheckpoint,startEncounterRehearsal,recordVictory,saveCareer,enterMenu,validCareerRecord,compatibleCourseEchoRecord,RUN_RULESET,RUN_VARIANTS,joeDirectionalCell,focusedSurvivalPresentation,NIGHT_ORDER_ACTIONS,SHED_EXIT,resultActionGeometry';
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {',`  window.__next={${names}};\n  window.advanceTime = (milliseconds) => {`)}));
 const tick=n=>page.evaluate(n=>window.advanceTime(n*1000/60),n);
 const reset=()=>page.evaluate(()=>{const t=window.__next,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.controlHintTimer=0;s.hole.zoneBannerTimer=0;s.hole.joe.x=100;s.hole.joe.y=600;s.hole.joe.patrolPause=1000;});
 const click=async(x,y)=>{const b=await page.locator('canvas').boundingBox();await page.mouse.click(b.x+x/1280*b.width,b.y+y/720*b.height);await tick(1);};
 const shot=async n=>{await tick(1);await page.screenshot({path:path.join(out,n+'.png')});};
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).assets.course.ready,null,{timeout:60000});await tick(180);await reset();
  await page.keyboard.press('h');assert.equal(await page.evaluate(()=>window.__next.state.hole.mapOpen),true);await shot('map-open-2560');
  await click(899,215);assert.equal(await page.evaluate(()=>window.__next.state.hole.mapOpen),false);
  await click(1167,215);assert.equal(await page.evaluate(()=>window.__next.state.hole.mapOpen),true);await page.keyboard.press('h');assert.equal(await page.evaluate(()=>window.__next.state.hole.mapOpen),false);
  checks.push('Map opens and closes through actual keyboard and pointer input');
  const allIds=await page.evaluate(()=>{const t=window.__next;return {rows:t.SETTINGS_ROWS.map(r=>r.id).sort(),categories:t.SETTINGS_CATEGORIES.flatMap(c=>c.ids).sort()};});assert.deepEqual(allIds.rows,allIds.categories);
  for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>{const s=window.__next.state;s.mode='settings';s.settingsPage='mix';s.settingsReturnMode='paused';});
   for(let category=0;category<5;category++){await click(180+category*224,128);assert.equal(await page.evaluate(()=>window.__next.settingsCategory()),category);await shot(`settings-${category}-${width}`);}
  }
  await page.evaluate(()=>{const t=window.__next;t.selectSettingsCategory(1);t.state.lookSensitivity=1.8;t.state.invertLook=true;t.state.volume=.25;});
  await click(390,610);assert.deepEqual(await page.evaluate(()=>{const s=window.__next.state;return [s.lookSensitivity,s.invertLook,s.volume];}),[1,false,.25]);
  const before=await page.evaluate(()=>({yaw:window.__next.state.player.yaw,elapsed:window.__next.state.hole.elapsed}));
  const b=await page.locator('canvas').boundingBox();await page.dispatchEvent('canvas','pointermove',{pointerType:'mouse',buttons:1,movementX:120,clientX:b.x+b.width/2,clientY:b.y+b.height*535/720});await tick(20);
  const after=await page.evaluate(()=>({yaw:window.__next.state.player.yaw,elapsed:window.__next.state.hole.elapsed,preview:window.__next.state.lookPreviewYaw}));assert.equal(after.yaw,before.yaw);assert.equal(after.elapsed,before.elapsed);assert(after.preview>0);
  checks.push('All settings categorized exactly once; category reset preserves other settings; look preview leaves paused simulation unchanged');
  await reset();
  const checkpoint=await page.evaluate(()=>{const t=window.__next,s=t.state,h=s.hole;s.player.x=0;s.player.y=100;h.elapsed=30;h.hasLineOfSight=false;h.nightOrderActionsCompleted=['audit-bell'];h.keyCollected=true;t.updateRehearsalCheckpoint();return h.rehearsalCheckpoint;});assert(checkpoint);assert.equal(checkpoint.checks.length,1);
  await page.evaluate(()=>{const s=window.__next.state;s.mode='defeat';s.time=3;s.resultIndex=1;});await page.keyboard.press('Enter');await tick(1);
  const rehearsal=await page.evaluate(()=>{const t=window.__next,s=t.state;return {mode:s.mode,rehearsal:s.hole.rehearsal,checks:s.hole.nightOrderActionsCompleted,key:s.hole.keyCollected,original:JSON.stringify(s.rehearsalCareer),stored:localStorage.getItem('rough-cut.career.v1')};});assert.equal(rehearsal.mode,'first_hole');assert.equal(rehearsal.rehearsal,true);assert.deepEqual(rehearsal.checks,['audit-bell']);assert.equal(rehearsal.key,true);
  const result=await page.evaluate(()=>{const t=window.__next,s=t.state;s.career.escapes+=50;t.saveCareer();const r=t.recordVictory('shed');t.enterMenu();return {unranked:r.unranked,newBest:r.newBest,career:JSON.stringify(s.career),stored:localStorage.getItem('rough-cut.career.v1')};});assert(result.unranked);assert.equal(result.newBest,false);assert.equal(result.career,rehearsal.original);assert.equal(result.stored,rehearsal.stored);
  checks.push('Defeat rehearsal restores earned checkpoint, isolates career writes and scores, and restores career on exit');
  await reset();
  const compatibility=await page.evaluate(()=>{const t=window.__next,s=t.state,record={score:999,timeSeconds:90,grade:'A',route:'shed',variantId:t.RUN_VARIANTS[0].id,overtime:false,ghostPath:[{x:0,y:0,t:0},{x:0,y:100,t:5}]};s.career.routes.shed={...record,ruleset:'legacy',pressure:1};s.career.routes.drain=null;s.career.legacyRecords=[];const old=t.compatibleCourseEchoRecord(record.variantId,false);s.career.routes.shed.ruleset=t.RUN_RULESET;s.career.routes.shed.pressure=.8;const pressure=t.compatibleCourseEchoRecord(record.variantId,false);s.career.routes.shed.pressure=s.pursuitIntensity;const valid=t.compatibleCourseEchoRecord(record.variantId,false);s.career.legacyRecords=[s.career.routes.shed];s.career.routes.shed={...record,variantId:t.RUN_VARIANTS[1].id,ruleset:t.RUN_RULESET,pressure:1};const archived=t.compatibleCourseEchoRecord(record.variantId,false);return {old,pressure,valid:!!valid,archived:!!archived,legacy:t.validCareerRecord(record).ruleset};});assert.equal(compatibility.old,null);assert.equal(compatibility.pressure,null);assert(compatibility.valid&&compatibility.archived);assert.equal(compatibility.legacy,'legacy');
  await page.evaluate(()=>{const t=window.__next;t.state.settingsReturnMode='paused';t.applySliderSetting(t.SETTINGS_ROWS.find(r=>r.id==='pursuit_intensity'),.8);});assert.equal(await page.evaluate(()=>window.__next.recordVictory('shed').unranked),true);
  checks.push('Echo comparisons isolate ruleset, course variant and pressure; compatible archived runs remain available; mid-run pressure change is unranked');
  const frames=await page.evaluate(()=>{const t=window.__next,j=t.state.hole.joe;j.effectSpeed=10;const walking=[0.1,1.7,3.3,4.9].map(m=>{j.walkMeters=m;return t.joeDirectionalCell(1).x;});j.effectSpeed=0;j.walkMeters=12;const a=t.joeDirectionalCell(2);j.walkMeters=25;const b=t.joeDirectionalCell(2);return {walking,a,b};});assert.deepEqual(frames.walking,[0,384,768,1152]);assert.deepEqual(frames.a,frames.b);checks.push('Directional walking advances with distance; stopped Joe holds a stable frame');
  await reset();await page.setViewportSize({width:2560,height:1600});await shot('opening-2560');await page.setViewportSize({width:844,height:390});await shot('opening-844');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
