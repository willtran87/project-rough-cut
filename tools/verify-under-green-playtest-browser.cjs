const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/playtest';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600},acceptDownloads:true}),errors=[],checks=[],views=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{window.__pad={id:'Playtest menu check',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[__pad];});
  const ready=()=>p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000}),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await ready();await tick(0);await p.click('#primary');await tick(100);assert.equal(await p.locator('#local-playtest').count(),0);assert.equal(await p.evaluate(()=>__underGreen.run.telemetry??null),null);
  checks.push('Ordinary entry has no recorder UI or automatic telemetry');
  await p.goto('http://127.0.0.1:4187/under-green.html?test&playtest');await ready();await tick(0);await p.click('#primary');
  await p.keyboard.down('w');await tick(5400);await p.keyboard.up('w');assert(await p.locator('#local-playtest').isHidden());
  await p.keyboard.press('Escape');await tick(0);await p.locator('#local-playtest summary').click();
  await p.locator('#playtest-kind').selectOption('automated');await p.locator('#playtest-water').pressSequentially('Flow stops; cross to the far bank.');await p.locator('#playtest-water').press('Enter');await p.locator('#playtest-water').pressSequentially('F and WASD are text here.');
  assert.equal(await p.evaluate(()=>__underGreen.run.mode),'paused');assert.equal(await p.evaluate(()=>!!document.fullscreenElement),false);assert.match(await p.locator('#playtest-water').inputValue(),/\nF and WASD/);
  await p.locator('#playtest-decision').fill('Automated input crossed the protected lesson.');
  const download=async name=>{const event=p.waitForEvent('download');await p.click('#playtest-download');const d=await event;await d.saveAs(`${out}/${name}.json`);return JSON.parse(fs.readFileSync(`${out}/${name}.json`,'utf8'));};
  const first=await download('first');assert.equal(first.sessionKind,'automated');assert.equal(first.attempts.length,1);assert(first.attempts[0].endProgress.lessonCrossed);assert(Math.abs(first.attempts[0].activeSeconds-5.4)<1e-6);
  const pausedSeconds=first.attempts[0].activeSeconds;await tick(1000);const paused=await download('paused');assert.equal(paused.attempts[0].activeSeconds,pausedSeconds);
  checks.push('Actual downloaded JSON includes observed play and explicit classification; multiline typing and pause never control the game');
  // Physical windup fixture; outcome and retry still use ordinary input/UI.
  await p.click('#primary');const fixture=JSON.parse(fs.readFileSync('output/under-green/navigation/service-encounter.json','utf8'));
  await p.evaluate(r=>{__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},fixture);await p.keyboard.down('w');await tick(1700);await p.keyboard.up('w');assert.equal(await p.evaluate(()=>__underGreen.run.mode),'caught');
  const failed=await download('caught');assert.equal(failed.attempts.at(-1).outcome,'caught');assert(failed.attempts.at(-1).failure);assert.equal(failed.attempts.at(-1).outcomes.captures,1);
  await p.click('#primary');await tick(100);await p.keyboard.press('Escape');await tick(0);const retried=await download('retried');assert.equal(retried.attempts.at(-2).outcome,'caught');assert.equal(retried.attempts.at(-1).startProgress.checkpoint,2);assert(retried.attempts.at(-1).startProgress.bypass);
  checks.push('Real capture, checkpoint retry and durable bypass facts survive in separate attempt records');
  // Gamepad can reach the recorder, its fields and export without mouse focus.
  await p.locator('#local-playtest summary').focus();await tick(200);
  async function press(index){await p.evaluate(i=>{__pad.buttons[i]={pressed:true,value:1};},index);await tick(32);await p.evaluate(i=>{__pad.buttons[i]={pressed:false,value:0};},index);await tick(32);}
  let reached=false;for(let i=0;i<10;i++){await press(13);if(await p.evaluate(()=>document.activeElement.id==='playtest-download')){reached=true;break;}}assert(reached);
  const controllerDownload=p.waitForEvent('download');await press(0);const d=await controllerDownload;await d.saveAs(`${out}/controller.json`);assert(JSON.parse(fs.readFileSync(`${out}/controller.json`)).attempts.length>=3);
  checks.push('Shared controller menu reaches text fields and activates local export');
  // Staged approaches use the ordinary simulation and keyboard controls. They
  // qualify the report fields, not first-time player pacing or comprehension.
  async function place(v){await p.evaluate(async v=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(v.cp||0);r.mode='playing';Object.assign(r,v.run);Object.assign(r.player,v.player);Object.assign(r.joe,v.joe);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},v);}
  await place({cp:1,player:{x:0,y:52.8,yaw:0},run:{time:9},joe:{x:0,y:43,phase:'walk',last:{x:0,y:52.8}}});
  await p.keyboard.down('w');await tick(2800);await p.screenshot({path:`${out}/crossing-2560.png`});await tick(3200);await p.keyboard.up('w');await p.keyboard.press('Escape');await tick(0);
  const crossed=await download('crossed'),crossing=crossed.attempts.at(-1).crossings.find(c=>c.id==='spillway');
  assert(crossing.finished);assert.equal(crossing.choice,'wet');assert.equal(crossing.partial,false);assert.equal(crossing.waterHits,0);assert(crossing.seconds>5&&crossing.seconds<6);assert(crossing.arrivalPhases.spillway);
  await place({player:{x:0,y:64,yaw:0,waterEntry:{spillway:-1}},run:{time:2},joe:{phase:'enter',age:-100}});await tick(900);await p.keyboard.press('Escape');await tick(0);
  const surged=await download('surged'),hit=surged.attempts.at(-1),partial=hit.crossings.find(c=>c.id==='spillway');
  assert.equal(hit.waterHits,1);assert(partial.partial&&!partial.finished);assert.equal(partial.waterHits,1);assert(hit.events.some(e=>e.type==='water-hit'&&e.id==='spillway'));
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),{SLUICE}=await import('./under-green-course.js');const r=createRun(3,true);r.mode='playing';Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
  await p.keyboard.press('e');await tick(1500);assert.equal(await p.evaluate(()=>__underGreen.run.mode),'aftermath');await tick(4600);
  const escaped=await download('escaped'),last=escaped.attempts.at(-1);assert.equal(last.outcome,'escaped');assert(last.outcomes.secured);assert(last.endProgress.evidence&&last.endProgress.bypass);assert(last.events.some(e=>e.type==='secured'));assert(last.events.some(e=>e.type==='complete'));
  checks.push('Actual wet crossing, partial surge recovery and valid gate closure export truthful route, water-hit and escape outcomes');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.locator('#playtest-kind').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/form-${width}.png`});
   await p.locator('#playtest-download').scrollIntoViewIfNeeded();const bounds=await p.locator('#playtest-download').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width);assert(bounds.y>=0&&bounds.y+bounds.height<=height);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`${out}/download-${width}.png`});views.push({width,height,bounds});
  }
  await p.reload();await ready();await tick(0);await p.locator('#local-playtest summary').click();const reloaded=await download('reloaded');assert.equal(reloaded.attempts.length,0);assert.equal(reloaded.observations.waterRule,'');assert.equal(reloaded.sessionKind,'unclassified');
  assert.equal(await p.evaluate(()=>Object.keys(localStorage).some(k=>k.includes('playtest'))),false);
  checks.push('Recording and notes are page-local; reload clears them without overwriting gameplay saves');
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
