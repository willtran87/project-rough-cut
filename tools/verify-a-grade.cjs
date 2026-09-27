/* Controlled feature/lifecycle tests. Full input-only routes run separately. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=path.resolve(process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/a-grade-closure/acceptance');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/game.js','utf8');
 const names='state,resetFirstHole,SETTINGS_ROWS,selectSettingsCategory,settingsVisibleIndices,applyComfortPreset,replayPracticalLessons,practicalLessonPresentation,routeThreadVisible,stableJoeViewIndex,readSavedPreferences,readSavedCareer,updateExperienceEvidence,startEncounterRehearsal,recordVictory,enterMenu,saveCareer,NIGHT_ORDER_ACTIONS,SHED_EXIT,DRAIN_EXIT,courseZoneAt,courseObstacleVisualMetrics,COURSE_OBSTACLES,nearestObstacleClearance,obstacleAtPosition,focusedSurvivalPresentation';
 const audit=`const atlasAudit=new Map(); const auditedAtlasCell=cachedAtlasCell;
 cachedAtlasCell=function(image,cell){
  if(image.naturalWidth>0){if(cell.x<0||cell.y<0||cell.width<=0||cell.height<=0||cell.x+cell.width>image.naturalWidth||cell.y+cell.height>image.naturalHeight)throw Error('Atlas cell outside source: '+image.src+' '+JSON.stringify(cell));
   atlasAudit.set(image.src+'|'+[cell.x,cell.y,cell.width,cell.height].join(','),{image:image.src,cell,dimensions:[image.naturalWidth,image.naturalHeight]});}
  return auditedAtlasCell(image,cell);
 };`;
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {',`  ${audit}\nwindow.__grade={${names},atlasAudit};\n  window.advanceTime = (milliseconds) => {`)}));
 const tick=n=>page.evaluate(n=>window.advanceTime(n*1000/60),n);
 const reset=async()=>{await page.evaluate(()=>{const t=window.__grade,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.messageTimer=0;s.hole.controlHintTimer=0;s.hole.zoneBannerTimer=0;s.hole.joe.x=100;s.hole.joe.y=650;s.hole.joe.patrolPause=1000;});await tick(1);};
 const input=async(key,n)=>{await page.keyboard.down(key);await tick(n);await page.keyboard.up(key);await tick(1);};
 const shot=async name=>{await tick(1);await page.screenshot({path:path.join(out,name+'.png')});};
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).assets.course.ready,null,{timeout:60000});await tick(180);await reset();
  await page.evaluate(()=>window.__grade.replayPracticalLessons());assert.equal(await page.evaluate(()=>window.__grade.practicalLessonPresentation().id),'move');
  await input('w',24);assert.equal(await page.evaluate(()=>window.__grade.state.learnedControls.move),true);
  await page.dispatchEvent('canvas','pointermove',{pointerType:'mouse',buttons:1,movementX:220});await tick(1);assert.equal(await page.evaluate(()=>window.__grade.state.learnedControls.look),true);
  await input('Space',30);assert.equal(await page.evaluate(()=>window.__grade.state.learnedControls.chip),true);
  assert.equal(await page.evaluate(()=>window.__grade.readSavedPreferences().learnedControls.chip),true);
  checks.push('Actual movement, turning and chip input retire lessons and persist demonstrated mastery');
  await page.evaluate(()=>{const t=window.__grade,s=t.state;s.mode='settings';s.settingsPage='mix';s.settingsReturnMode='paused';t.selectSettingsCategory(1);});
  const elapsed=await page.evaluate(()=>window.__grade.state.hole.elapsed);await page.keyboard.press('2');await tick(20);
  assert.deepEqual(await page.evaluate(()=>{const s=window.__grade.state;return [s.lookSensitivity,s.reducedMotion,s.freeLook,s.hole.elapsed];}),[.65,true,true,elapsed]);
  await page.keyboard.press('3');assert.equal(await page.evaluate(()=>window.__grade.state.freeLook),false);await page.keyboard.press('1');assert.equal(await page.evaluate(()=>window.__grade.state.freeLook),true);
  await page.evaluate(()=>window.__grade.selectSettingsCategory(2));await page.keyboard.press('t');assert.deepEqual(await page.evaluate(()=>window.__grade.state.learnedControls),{});
  checks.push('Keyboard-accessible comfort presets leave simulation paused; replay lessons resets mastery explicitly');
  await page.evaluate(()=>{window.gradePad={connected:true,id:'QA',axes:[0,0,.8,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.gradePad]});window.__grade.selectSettingsCategory(1);window.gradePad.buttons[5].pressed=true;});await tick(1);
  assert.equal(await page.evaluate(()=>window.__grade.state.lookSensitivity),.65);
  const preview=await page.evaluate(()=>window.__grade.state.lookPreviewYaw);await tick(12);assert(await page.evaluate(()=>window.__grade.state.lookPreviewYaw)>preview);
  assert.equal(await page.evaluate(()=>window.__grade.state.hole.elapsed),elapsed);
  await page.evaluate(()=>{window.gradePad.connected=false;window.__grade.selectSettingsCategory(2);});await tick(1);
  const box=await page.locator('canvas').boundingBox();await page.mouse.click(box.x+618/1280*box.width,box.y+610/720*box.height);await tick(1);
  assert.equal(await page.evaluate(()=>window.__grade.settingsVisibleIndices().length),2);
  await page.mouse.click(box.x+618/1280*box.width,box.y+610/720*box.height);await tick(1);assert.equal(await page.evaluate(()=>window.__grade.settingsVisibleIndices().length),6);
  await page.evaluate(()=>window.__grade.selectSettingsCategory(1));
  const previewBeforeTouch=await page.evaluate(()=>window.__grade.state.lookPreviewYaw);
  const contact={pointerType:'touch',pointerId:91,button:0,clientX:box.x+500/1280*box.width,clientY:box.y+535/720*box.height};
  await page.dispatchEvent('canvas','pointerdown',contact);await page.dispatchEvent('canvas','pointermove',{...contact,clientX:box.x+600/1280*box.width});await tick(1);
  assert(await page.evaluate(()=>window.__grade.state.lookPreviewYaw)>previewBeforeTouch);
  await page.dispatchEvent('canvas','pointercancel',contact);assert.equal(await page.evaluate(()=>window.__grade.state.lookPreviewPointer),null);
  assert.equal(await page.evaluate(()=>window.__grade.state.hole.elapsed),elapsed);
  checks.push('Touch preview uses actual contact displacement and releases on cancellation without advancing the run');
  checks.push('Controller bumpers select comfort presets, stick previews paused look, and pointer MORE returns from the two-row page');
  const causes=await page.evaluate(()=>{const t=window.__grade,h=t.state.hole;h.joe.mode='search';h.hasLineOfSight=false;h.detection=.4;return ['trail','wake','sound'].map(source=>{h.detectionSource=source;return t.focusedSurvivalPresentation().threat;});});assert.deepEqual(causes,['FOUND TRACKS','SAW MOVEMENT','HEARD YOU']);checks.push('Focused HUD distinguishes actual trail, wake and sound evidence');
  await reset();await page.evaluate(()=>{const s=window.__grade.state;s.routeGuidance=false;s.hole.blockedTimer=0;});assert.equal(await page.evaluate(()=>window.__grade.routeThreadVisible()),false);
  const routeHints=await page.evaluate(()=>{const t=window.__grade,s=t.state;const result=['gamepad','touch'].map(method=>{s.inputMethod=method;return t.focusedSurvivalPresentation().navigation;});s.inputMethod='keyboard';return result;});assert.deepEqual(routeHints,['HOLD LT FOR ROUTE','HOLD LISTEN FOR ROUTE']);
  await page.keyboard.down('q');await tick(1);assert.equal(await page.evaluate(()=>window.__grade.routeThreadVisible()),true);await page.keyboard.up('q');await tick(1);
  await page.keyboard.press('h');assert.equal(await page.evaluate(()=>window.__grade.routeThreadVisible()),true);await page.keyboard.press('h');
  checks.push('Hidden guidance can be revealed by real Listen and Map inputs');
  const views=await page.evaluate(()=>{const t=window.__grade,s=t.state,j={x:0,y:300},result=[];for(const facing of [.9,.69,.67,.7,.66,.5]){const a=Math.acos(facing);s.player.x=Math.cos(-a)*60/.72;s.player.y=300+Math.sin(-a)*60;result.push(t.stableJoeViewIndex(0,j));}return result;});assert.deepEqual(views,[0,0,0,0,0,1]);checks.push('Directional hysteresis holds through small boundary oscillations then switches after a deliberate turn');
  await reset();await page.keyboard.down('w');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.evaluate(()=>window.__grade.state.mode),'paused');assert.equal(await page.evaluate(()=>window.__grade.state.keys.size),0);await page.keyboard.up('w');checks.push('Window focus loss pauses and releases held movement');
  await page.evaluate(()=>{const t=window.__grade;localStorage.setItem('rough-cut.settings.v1','{broken');localStorage.setItem('rough-cut.career.v1','null');const prefs=t.readSavedPreferences(),career=t.readSavedCareer();if(prefs.freeLook!==true||!career.routes)throw Error('Invalid storage recovery');});checks.push('Malformed settings and career data recover to usable defaults');
  await page.evaluate(()=>{localStorage.removeItem('rough-cut.settings.v1');localStorage.removeItem('rough-cut.career.v1');});
  const cdp=await page.context().newCDPSession(page),heap=[];
  for(let run=0;run<60;run++){
   await reset();await input('w',12);await input('Space',18);await tick(45);
   await page.evaluate(()=>{const t=window.__grade,h=t.state.hole;h.rehearsalCheckpoint={x:0,y:100,yaw:0,elapsed:20,joe:{x:100,y:400},checks:['audit-bell'],key:true,drain:false,balls:3};t.startEncounterRehearsal();});await tick(10);
   await page.evaluate(()=>window.__grade.enterMenu());
   if(run%10===9){await cdp.send('HeapProfiler.collectGarbage');heap.push({run:run+1,...await cdp.send('Runtime.getHeapUsage')});}
  }
  const warm=heap.slice(-3).map(h=>h.usedSize);
  assert(Math.max(...warm)-Math.min(...warm)<1e6,JSON.stringify(heap));checks.push('60 retries/chips/rehearsals return to menu; post-GC samples at sessions 40, 50 and 60 stay within 1 MB');
  for(const [width,height] of [[2560,1600],[1280,720],[800,600],[844,390]]){
   await page.setViewportSize({width,height});await reset();await page.evaluate(()=>{const s=window.__grade.state;s.routeGuidance=true;s.uiScale=1.3;});await shot(`opening-${width}`);
   await page.evaluate(()=>{const t=window.__grade,s=t.state;s.mode='settings';s.settingsPage='mix';t.selectSettingsCategory(1);});await shot(`presets-${width}`);
   for(const mode of ['patrol','investigate','search','chase']){await reset();await page.evaluate(mode=>{const s=window.__grade.state;s.player.y=330;s.hole.joe.x=60;s.hole.joe.y=365;s.hole.joe.mode=mode;s.hole.joe.patrolPause=1000;s.hole.searchTimer=20;s.hole.detection=mode==='chase'?1:.25;s.hole.hasLineOfSight=mode==='chase';s.hole.stateBannerTimer=0;},mode);await shot(`${mode}-${width}`);}
  }
  await page.setViewportSize({width:2560,height:1600});
  for(const [name,y] of [['tee',10],['audit',135],['water',235],['clubhouse',315],['maintenance',425],['dead-green',505],['range',600],['exits',675]])for(const [view,yaw] of [['north',0],['east',Math.PI/2],['south',Math.PI],['west',-Math.PI/2]]){
   await reset();await page.evaluate(({y,yaw})=>{const t=window.__grade,s=t.state,candidates=[];for(let x=-100;x<=100;x+=5)for(let dy=-10;dy<=10;dy+=5){const p={x,y:y+dy};if(!t.obstacleAtPosition(p.x,p.y)&&t.nearestObstacleClearance(p)>10)candidates.push(p);}candidates.sort((a,b)=>Math.abs(a.x)+Math.abs(a.y-y)*2-Math.abs(b.x)-Math.abs(b.y-y)*2);if(!candidates.length)throw Error('No clear audit position');Object.assign(s.player,candidates[0],{yaw});s.learnedControls={move:true,look:true,chip:true,cover:true};},{y,yaw});await shot(`${name}-${view}`);
  }
  checks.push('HUD, presets and enemy states captured at four sizes; eight zones captured from all four headings');
  const atlasAudit=await page.evaluate(()=>[...window.__grade.atlasAudit.values()]);
  checks.push('Every atlas crop exercised by priming and all zone/headings remains inside its source image');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({sourceHash:require('node:crypto').createHash('sha256').update(source).digest('hex'),passed:true,checks,heap,atlasAudit,errors},null,2));console.log(JSON.stringify({passed:true,checks,heap,atlasCells:atlasAudit.length,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
