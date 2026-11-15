const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/course-arrival';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__arrivalGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures});'}));
 await page.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__arrival={state,resetFirstHole,render,updateExperienceEncounters,retryFirstHole,startEncounterRehearsal};\n  window.advanceTime = (milliseconds) => {')}));
 const read=()=>page.evaluate(()=>({arrival:__arrival.state.hole.engagement.experience.arrival,events:__arrival.state.hole.engagement.events,mode:__arrival.state.mode,player:__arrival.state.player,impacts:__arrival.state.hole.southGateImpacts,gate:RCScene3D.stats().entryGate}));
 async function shot(name){await page.evaluate(()=>__arrival.render());await page.evaluate(async()=>RCScene3D.whenPresented());await page.screenshot({path:out+'/'+name+'.png'});}
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__arrival);
  await page.locator('#game').click();
  await page.evaluate(()=>{const t=__arrival;t.resetFirstHole();Object.assign(t.state,{mode:'first_hole',manualTime:true,transitionAlpha:0});t.render();});
  await page.waitForFunction(()=>{__arrival.render();return RCScene3D.stats().ready;},null,{timeout:120000});
  const prepared=await page.evaluate(()=>__arrivalGpu());
  await page.evaluate(()=>advanceTime(1200));assert.equal((await read()).arrival.phase,'waiting','Guide must not consume opening');
  await page.locator('[data-brief-start]').click();
  await page.waitForFunction(()=>JSON.parse(render_game_to_text()).audio.announcement.ready,null,{timeout:15000});
  await page.evaluate(()=>advanceTime(600));let s=await read();assert.equal(s.arrival.phase,'latched');assert.equal(s.events.filter(e=>e.type==='course_secured').length,1);assert.equal(s.gate.batches,4);
  await page.evaluate(()=>advanceTime(200));let speech=await page.evaluate(()=>JSON.parse(render_game_to_text()).audio.announcement);assert.equal(speech.starts,1);assert(speech.playing);
  await page.evaluate(()=>{__arrival.state.muted=true;advanceTime(17);});assert.equal(await page.evaluate(()=>JSON.parse(render_game_to_text()).audio.announcement.playing),false);
  await page.evaluate(()=>{__arrival.state.muted=false;advanceTime(17);});assert(await page.evaluate(()=>JSON.parse(render_game_to_text()).audio.announcement.playing));
  await page.keyboard.press('Escape');const before=(await read()).arrival.age;
  await page.evaluate(()=>advanceTime(17));
  assert.equal(await page.evaluate(()=>JSON.parse(render_game_to_text()).audio.announcement.playing),false);
  await page.evaluate(()=>advanceTime(2000));assert.equal((await read()).arrival.age,before);
  await page.keyboard.press('Escape');await page.evaluate(()=>advanceTime(2600));assert.equal((await read()).arrival.phase,'complete');
  await shot('phone-2560');assert(await page.evaluate(()=>RCScene3D.stats().arrivalPhoneVisible));
  assert.deepEqual(await page.evaluate(()=>__arrivalGpu()),prepared,'Opening reuses prepared textures/programs');
  await page.evaluate(()=>{__arrival.state.hole.ballAim.active=true;});await shot('phone-aim-hidden');assert.equal(await page.evaluate(()=>RCScene3D.stats().arrivalPhoneVisible),false);
  await page.evaluate(()=>{__arrival.state.hole.ballAim.active=false;__arrival.state.hole.hasLineOfSight=true;});await shot('phone-danger-hidden');assert.equal(await page.evaluate(()=>RCScene3D.stats().arrivalPhoneVisible),false);
  await page.evaluate(()=>{__arrival.state.hole.hasLineOfSight=false;});
  await page.evaluate(()=>{__arrival.state.hole.mapOpen=true;});await shot('phone-map-hidden');assert.equal(await page.evaluate(()=>RCScene3D.stats().arrivalPhoneVisible),false);
  await page.evaluate(()=>{__arrival.state.hole.mapOpen=false;});
  for(const [width,height] of [[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await shot('phone-'+width);}
  await page.setViewportSize({width:2560,height:1600});
  await page.evaluate(()=>advanceTime(3600));await shot('phone-stowed');assert.equal(await page.evaluate(()=>RCScene3D.stats().arrivalPhoneVisible),false);
  await page.evaluate(()=>{Object.assign(__arrival.state.player,{x:0,y:24,yaw:Math.PI,pitch:0});__arrival.state.hole.controlHintTimer=0;});
  await shot('gate-2560');
  for(const [width,height] of [[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await shot('gate-'+width);}
  await page.setViewportSize({width:2560,height:1600});
  // Real movement into the authoritative south boundary, with the gate ahead.
  await page.evaluate(()=>{const s=__arrival.state;s.player.x=0;s.player.y=3;s.player.yaw=Math.PI;s.hole.practiceDrill.active=false;});
  await page.keyboard.down('w');await page.evaluate(()=>advanceTime(500));await page.keyboard.up('w');
  s=await read();assert(s.player.y>=0&&s.player.y<.8,'Boundary slide stops inside one movement step');assert(s.impacts>0);await shot('gate-contact');
  await page.evaluate(()=>{const t=__arrival;t.resetFirstHole();t.state.mode='first_hole';t.state.hole.tutorialVisible=false;t.state.hole.quickRematch=true;t.updateExperienceEncounters(1);});
  assert.equal((await read()).arrival.phase,'skipped');
  await page.evaluate(()=>{const t=__arrival;t.resetFirstHole();t.state.mode='first_hole';t.state.hole.tutorialVisible=false;t.state.hole.rehearsal=true;t.updateExperienceEncounters(1);});
  assert.equal((await read()).arrival.phase,'skipped');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks:['guide gate','latch once','pause/resume','four gate batches','four viewport captures','actual south-boundary collision','quick retry skip','rehearsal skip','phone visible then stowed','phone yields to map/aim/danger','opening reuses prepared shaders/textures','real PA decode/start/mute/resume/pause'],gate:s.gate,prepared,speech,errors},null,2));
  console.log('Course arrival browser checks passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
