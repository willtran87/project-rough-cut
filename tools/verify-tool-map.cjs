const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/tool-map-20261108/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__tools={state,resetFirstHole,render,maintenanceTimers,windMaintenanceTimer,updateExperienceEncounters};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__tools&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__tools,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});const h=s.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.elapsed=100;h.messageTimer=h.zoneBannerTimer=h.controlHintTimer=0;Object.assign(s.player,{x:18,y:225,yaw:0});Object.assign(h.joe,{x:100,y:100,mode:'patrol',patrolPause:9999});h.hasLineOfSight=false;h.detection=0;t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const render=async()=>{await p.evaluate(()=>__tools.render());await p.evaluate(async()=>RCScene3D.whenPresented());await p.waitForTimeout(120);};
  await render();assert.equal(await p.locator('#course-tools').isVisible(),false);
  await p.evaluate(()=>{roughCutRebuild.toggleMap();__tools.render();});await render();
  const ready=await p.evaluate(()=>roughCutRebuild.tools());assert.equal(ready.items.length,4);assert(ready.items.every(t=>t.status==='READY'));assert.deepEqual(ready.items.map(t=>t.marker),['A','B','C','D']);
  await p.screenshot({path:out+'/map-2560.png'});
  // Read-only map must not mutate a navigation choice or simulation state.
  assert.equal(await p.evaluate(()=>{const t=__tools,s=t.state;const before=JSON.stringify({p:s.player,joe:s.hole.joe,e:s.hole.engagement,route:s.hole.rebuild.preferredExit});for(let i=0;i<10;i++)roughCutRebuild.tools();return before===JSON.stringify({p:s.player,joe:s.hole.joe,e:s.hole.engagement,route:s.hole.rebuild.preferredExit});}),true);
  await p.evaluate(()=>{roughCutRebuild.toggleMap();advanceTime(17);});await p.keyboard.press('e');await p.evaluate(()=>roughCutRebuild.toggleMap());await render();assert.match(await p.locator('[data-tool="pond-circuit"] .course-tool-status').innerText(),/^DARK · 16s$/);
  await p.evaluate(()=>__tools.updateExperienceEncounters(16.1));await render();assert.equal(await p.locator('[data-tool="pond-circuit"] .course-tool-status').innerText(),'SPENT');
  await p.evaluate(()=>__tools.windMaintenanceTimer(__tools.maintenanceTimers()[0]));await render();assert.equal(await p.locator('[data-tool="timer:maze-cart"] .course-tool-status').innerText(),'RINGS IN 4s');assert.equal(await p.locator('[data-tool="timer:release-cart"] .course-tool-status').innerText(),'WAIT');
  await p.evaluate(()=>__tools.updateExperienceEncounters(4));await render();assert.equal(await p.locator('[data-tool="timer:maze-cart"] .course-tool-status').innerText(),'RINGING · 6s');
  // Map protects the player from new investigation commitments; an ignored timer refunds.
  await p.evaluate(()=>__tools.updateExperienceEncounters(6));await render();assert.equal(await p.locator('[data-tool="timer:maze-cart"] .course-tool-status').innerText(),'READY');
  for(const [width,height]of [[1280,720],[844,390]]){
   await p.setViewportSize({width,height});await render();await p.screenshot({path:out+'/map-'+width+'.png'});
   const bounds=await p.evaluate(()=>{const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};return {panel:box('course-tools'),routes:box('route-choices'),shell:box('game-shell'),overflow:[...document.querySelectorAll('.course-tool')].some(n=>n.scrollWidth>n.clientWidth)};});
   assert(!bounds.overflow);assert(bounds.panel.bottom<bounds.routes.y,'Tools overlap exit choices');assert(bounds.panel.x>=bounds.shell.x&&bounds.panel.right<=bounds.shell.right&&bounds.panel.bottom<=bounds.shell.bottom);
  }
  await p.locator('[data-route="drain"]').click();assert.equal(await p.evaluate(()=>roughCutRebuild.route().selected),'drain');
  await p.keyboard.press('Escape');await render();assert.equal(await p.locator('#course-tools').isVisible(),false);await p.keyboard.press('Escape');await render();assert.equal(await p.locator('#course-tools').isVisible(),true);
  await p.evaluate(()=>{__tools.state.hole.practiceDrill.active=true;__tools.state.hole.practiceDrill.completed=false;__tools.state.player.y=0;});await render();assert.equal(await p.locator('#course-tools').isVisible(),false);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,ready,checks:['Read-only map preserves movement, Joe, choices and state','Live circuit cut, expiry and spent status','Timer winding, ringing, busy and refund status','No overflow/exit-choice overlap at responsive sizes','Exit selection, pause and practice visibility'],errors},null,2));console.log(JSON.stringify({passed:true,software,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
