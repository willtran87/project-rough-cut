const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/station-identity-20261108/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 let game=fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__station={state,resetFirstHole,render,reviews:activeSprintReviews,actions:NIGHT_ORDER_ACTIONS,freshPracticeDrill,beginGolfBallLanding};window.__sounds={bell:0,latch:0};\n  window.advanceTime = (milliseconds) => {');
 assert(game.includes('  function playPracticeBellCue(worldPoint = state.hole.practiceDrill.target) {'));
 game=game.replace('  function playPracticeBellCue(worldPoint = state.hole.practiceDrill.target) {','  function playPracticeBellCue(worldPoint = state.hole.practiceDrill.target) { window.__sounds.bell++;').replace('  function playEscapeFilingCue(stage) {','  function playEscapeFilingCue(stage) { window.__sounds.latch++;');
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:game}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__stationGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures});'}));
 const render=async()=>{await p.evaluate(()=>__station.render());await p.evaluate(async()=>RCScene3D.whenPresented());await p.waitForTimeout(120);};
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
 const position=async(x,y,tx,ty)=>{await p.evaluate(({x,y,tx,ty})=>{const s=__station.state;Object.assign(s.player,{x,y,yaw:Math.atan2((tx-x)*.72,ty-y),pitch:0});Object.assign(s.hole.joe,{x:110,y:700,mode:'patrol',patrolPause:9999});s.hole.hasLineOfSight=false;s.hole.detection=0;s.hole.statusRequest.active=false;s.hole.messageTimer=s.hole.zoneBannerTimer=0;s.keys.clear();},{x,y,tx,ty});await tick(17);await render();};
 const phase=id=>p.evaluate(id=>RCScene3D.stats().objectiveCues.optional.find(e=>e.id===id)?.phase,id);
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__station&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__station,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});s.hole.tutorialVisible=false;s.hole.practiceDrill=t.freshPracticeDrill(true);s.hole.elapsed=100;t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  await position(0,65,0,94);await p.screenshot({path:out+'/practice-ready.png'});assert.equal(await phase('practice-bell'),'ready');const before=await p.evaluate(()=>__stationGpu());
  // Exercise the actual landing/roll pipeline with a controlled valid shot.
  await p.evaluate(()=>__station.beginGolfBallLanding({start:{x:0,y:65},target:{x:0,y:94},power:.5,joeModeAtCommit:'patrol'}));
  // The bell now rings and moves on actual impact, before ground roll ends.
  await tick(80);await render();assert.equal(await p.evaluate(()=>__sounds.bell),1);let tilt=await p.evaluate(()=>RCScene3D.stats().practiceVisual.tilt);assert(Math.abs(tilt)>.01&&Math.abs(tilt)<.7);await p.screenshot({path:out+'/practice-struck.png'});
  await p.evaluate(()=>__station.state.mode='paused');await tick(1000);await render();assert.equal(await p.evaluate(()=>RCScene3D.stats().practiceVisual.tilt),tilt);await p.evaluate(()=>__station.state.mode='first_hole');
  for(let i=0;i<180&&!await p.evaluate(()=>__station.state.hole.practiceDrill.completed);i++)await tick(17);
  assert(await p.evaluate(()=>__station.state.hole.practiceDrill.completed));assert.equal(await p.evaluate(()=>__sounds.bell),1);await tick(1600);await render();assert.equal(await phase('practice-bell'),'complete');assert.equal(await p.evaluate(()=>RCScene3D.stats().practiceVisual.tilt),-.95);await p.screenshot({path:out+'/practice-complete.png'});
  await p.evaluate(()=>{const t=__station;t.state.hole.practiceDrill=t.freshPracticeDrill(true);t.state.hole.stationFeedback=null;});await position(0,82,0,94);assert.equal(await phase('practice-bell'),'closed');await p.keyboard.press('e');assert.match(await p.evaluate(()=>__station.state.hole.message),/PRACTICE CLOSED/);await position(0,65,0,94);await p.screenshot({path:out+'/practice-closed.png'});
  await p.evaluate(()=>__station.state.hole.practiceDrill=__station.freshPracticeDrill(false));await render();assert.equal(await phase('practice-bell'),'complete');
  const reviews=await p.evaluate(()=>__station.reviews());
  for(let i=0;i<3;i++){
   const a=reviews[i];await position(a.x,a.y-30,a.x,a.y);assert.equal(await phase(a.id),'ready');await p.screenshot({path:out+'/supply-'+i+'-ready.png'});
   await position(a.x,a.y-8,a.x,a.y);const balls=await p.evaluate(()=>__station.state.hole.golfBalls);if(i===1)await p.keyboard.down('c');await p.keyboard.press('e');await p.keyboard.up('c');await tick(80);await render();assert.equal(await phase(a.id),'claimed');assert(await p.locator('#direct-choices').isHidden());assert(await p.evaluate(id=>__station.state.hole.stationFeedback.id===id,a.id));
   if(i===1)assert(await p.evaluate(()=>__station.state.hole.engagement.blackoutArmed));else assert(await p.evaluate(balls=>__station.state.hole.golfBalls>balls||__station.state.hole.reviewBallReserve>0,balls));
   const count=await p.evaluate(()=>__station.state.hole.reviewRewards);await p.keyboard.press('e');await tick(17);assert.equal(await p.evaluate(()=>__station.state.hole.reviewRewards),count);
   await position(a.x,a.y-24,a.x,a.y);await p.screenshot({path:out+'/supply-'+i+'-claimed.png'});
  }
  assert.equal(await p.evaluate(()=>__sounds.latch),3);
  await position(77,148,86,148);await p.keyboard.press('e');await tick(90);await render();assert(await p.evaluate(()=>__station.state.hole.nightOrderActionsCompleted.includes('audit-bell')));assert.equal(await p.evaluate(()=>__sounds.bell),2);assert(Math.abs(await p.evaluate(()=>RCScene3D.stats().stationVisuals.find(e=>e.id==='audit-bell').rotation))>.01);
  await p.evaluate(()=>{__station.state.reducedMotion=true;__station.state.effectsDensity=0;});await render();assert.equal(await p.evaluate(()=>RCScene3D.stats().stationVisuals.find(e=>e.id==='audit-bell').rotation),0);
  for(const [width,height]of [[1280,720],[844,390]]){await p.setViewportSize({width,height});await position(reviews[0].x,reviews[0].y-30,reviews[0].x,reviews[0].y);await p.screenshot({path:out+'/supply-'+width+'.png'});await position(0,65,0,94);await p.screenshot({path:out+'/practice-'+width+'.png'});}
  const after=await p.evaluate(()=>__stationGpu());assert.deepEqual(after,before);const stats=await p.evaluate(()=>RCScene3D.stats());assert.equal(stats.objectiveCues.signs,15);assert.equal(stats.objectiveCues.batches,2);assert.equal(stats.stationVisuals.filter(e=>e.kind==='bell').length,1);assert.equal(stats.stationVisuals.filter(e=>e.kind==='supply').length,3);assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,before,after,visuals:stats.stationVisuals,cues:stats.objectiveCues,errors},null,2));console.log(JSON.stringify({passed:true,software,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
