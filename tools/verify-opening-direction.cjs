const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/opening-direction';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
 const src=fs.readFileSync('web/game.js','utf8'),marker='  window.advanceTime = (milliseconds) => {';assert(src.includes(marker));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:src.replace(marker,'  window.__direction={state,render,pushThreatCaption,playerNextActionPresentation};\n'+marker)}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>{const s=__direction.state,h=s.hole;return {mode:s.mode,player:s.player,caption:h.captions,goal:__direction.playerNextActionPresentation(),practice:h.practiceDrill.active};});
 const render=async()=>{await p.evaluate(()=>__direction.render());await p.evaluate(()=>RCScene3D.whenPresented());};
 const shot=async name=>{await render();await p.screenshot({path:out+'/'+name+'.png'});};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__direction);await p.locator('#game').click();
  for(let i=0;i<5;i++){if((await read()).mode==='first_hole')break;await p.keyboard.press('Space');await tick(400);}
  await p.waitForFunction(()=>{advanceTime(16);return RCScene3D.stats().ready&&!document.querySelector('[data-brief-start]')?.disabled;},null,{timeout:120000});await p.locator('[data-brief-start]').click();await tick(650);
  assert.match((await read()).goal.text,/AUDIT BELL/);assert((await read()).practice,'Optional practice remains available');await shot('arrival-2560');
  const cue=await p.evaluate(()=>RCScene3D.stats().objectiveCues);assert.equal(cue.batches,2);assert.equal(cue.clearNavigation,false);assert.equal(cue.visibleSigns,1);assert.equal(cue.approachDraw.sign.count,6);assert(cue.approachDraw.body.count>0);assert.deepEqual(cue.atlas,[960,672]);assert.equal(cue.anchors.find(a=>a.id==='audit-approach').y,40);assert(cue.depthTest&&cue.depthWrite);
  await p.keyboard.down('w');await tick(700);await p.keyboard.up('w');await shot('approach-2560');
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('approach-'+width);assert.match(await p.locator('[data-q=goal]').innerText(),/AUDIT BELL/);}
  checks.push('Fresh UI opening keeps required Audit Bell objective and optional practice; physical first-path sign uses existing two batches/atlas and normal depth');
  await p.setViewportSize({width:2560,height:1600});
  await p.evaluate(()=>{const s=__direction.state,h=s.hole;Object.assign(s.player,{x:0,y:0,yaw:0,pitch:0});h.captions=[];h.messageTimer=0;h.stateBannerLockTimer=0;h.engagement.experience.arrival.phoneDismissed=true;s.threatCaptions=true;s.soundCaptions=true;s.freeLook=true;Object.assign(h.joe,{x:0,y:100});__direction.pushThreatCaption('MOWER ENGINE',h.joe,'mower',10,'bearing-test');});await render();let c=(await read()).caption[0];assert.equal(c.direction,'AHEAD');const point=c.sourcePoint,age=c.age;
  // Real pointer turns process through simulation input; extra renders do not
  // age/replay the cue, and its source must not track an unheard moving Joe.
  for(let i=0;i<16;i++){await p.dispatchEvent('#game','pointermove',{pointerType:'mouse',buttons:1,movementX:40,movementY:0});await tick(17);}await render();c=(await read()).caption[0];assert.equal(c.direction,'LEFT');assert(c.age>age&&c.age<age+.3);const turnedAge=c.age;await render();await render();assert.equal((await read()).caption[0].age,turnedAge);await shot('caption-turned');assert.match(await p.locator('[data-q=caption]').innerText(),/LEFT/);
  await p.evaluate(()=>Object.assign(__direction.state.hole.joe,{x:100,y:-100}));await render();c=(await read()).caption[0];assert.deepEqual(c.sourcePoint,point);assert.equal(c.direction,'LEFT');
  await p.evaluate(()=>{const t=__direction;t.pushThreatCaption('MOWER ENGINE',t.state.hole.joe,'mower',10,'bearing-test');});await render();assert.notDeepEqual((await read()).caption[0].sourcePoint,point);assert.equal((await read()).caption.length,1);
  await p.evaluate(()=>{const t=__direction;t.pushThreatCaption('LOCAL NOTICE',null,'world',10,'bearing-test');});await render();assert.equal((await read()).caption[0].direction,null);assert.equal((await read()).caption[0].sourcePoint,null);
  checks.push('Real pointer turn updates DOM bearing without aging/replaying caption; source is a sound-position snapshot, keyed new sound refreshes it, source-less notice clears direction');
  await p.evaluate(()=>{const t=__direction;Object.assign(t.state.player,{x:0,y:0,yaw:0});t.pushThreatCaption('DISTANT GATE',{x:0,y:100},'world',10,'bearing-test');});await p.keyboard.down('r');await tick(400);await p.keyboard.up('r');assert.equal((await read()).caption[0].direction,'BEHIND');
  await p.keyboard.press('Escape');const paused=(await read()).caption[0].age;await tick(1000);await render();assert.equal((await read()).caption[0].age,paused);await p.keyboard.press('Escape');
  await p.evaluate(()=>{__direction.state.hole.nightOrderActionsCompleted=['audit-bell'];});await render();assert.equal((await p.evaluate(()=>RCScene3D.stats().objectiveCues.state))[0].done,true);await shot('sign-completed');
  checks.push('Rear glance and pause preserve caption semantics; completed first check updates sign state without changing navigation');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,errors,cue},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }catch(e){await shot('failure');fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,state:await read(),errors},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
