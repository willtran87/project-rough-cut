const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/environment-guidance-20261108/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__cues={state,resetFirstHole,render,actions:NIGHT_ORDER_ACTIONS,nearestObstacleClearance,completeNightOrderAction,resetSettingsCategory,SETTINGS_ROWS};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__cueGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures,cues:objectiveCues?.stats(),environment:environmentGuidance?.stats()});'}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__cues&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__cues,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});const h=s.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.elapsed=100;h.messageTimer=h.zoneBannerTimer=h.controlHintTimer=0;Object.assign(h.joe,{x:110,y:700,mode:'patrol',patrolPause:9999});h.hasLineOfSight=false;h.detection=0;t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const render=async()=>{await p.evaluate(()=>__cues.render());await p.evaluate(async()=>RCScene3D.whenPresented());};
  async function position(x,y,targetX,targetY){await p.evaluate(({x,y,targetX,targetY})=>{const s=__cues.state;Object.assign(s.player,{x,y,yaw:Math.atan2((targetX-x)*.72,targetY-y),pitch:0});s.hole.interactionPromptOwner=null;s.hole.prompt='';__cues.render();},{x,y,targetX,targetY});await render();}
  await position(0,110,-9,123);await p.screenshot({path:out+'/bell-turn.png'});const before=await p.evaluate(()=>__cueGpu());assert.equal(before.cues.batches,2);assert.equal(before.cues.signs,15);assert.equal(before.cues.visibleSigns,1);assert.equal(before.environment.batches,1);assert(before.environment.triangles<2000);assert(before.cues.depthTest&&before.cues.depthWrite);
  await position(48,139,86,148);await p.screenshot({path:out+'/bell-default.png'});
  await p.evaluate(()=>{__cues.state.mode='paused';__cues.render();});
  await p.locator('#controls-launch').click();await p.locator('#clear-navigation').check();
  assert(await p.evaluate(()=>roughCutRebuild.navigation().clearNavigation));assert(JSON.parse(await p.evaluate(()=>localStorage.getItem('rough-cut.settings.v1'))).clearNavigation);
  await p.screenshot({path:out+'/navigation-setting.png'});
  await p.getByRole('button',{name:'Close',exact:true}).click();await p.evaluate(()=>{__cues.state.mode='first_hole';});await render();
  assert.equal((await p.evaluate(()=>__cueGpu())).cues.visibleSigns,15);await p.screenshot({path:out+'/bell-clear-navigation.png'});
  await p.evaluate(()=>roughCutRebuild.setClearNavigation(false));await render();
  assert.equal((await p.evaluate(()=>__cueGpu())).cues.visibleSigns,1);
  const invariant=await p.evaluate(()=>{const s=__cues.state,snapshot=JSON.stringify({p:s.player,j:s.hole.joe,c:s.hole.nightOrderActionsCompleted});for(let i=0;i<8;i++)roughCutRebuild.setClearNavigation(i%2===0);return snapshot===JSON.stringify({p:s.player,j:s.hole.joe,c:s.hole.nightOrderActionsCompleted});});assert(invariant);
  for(let i=0;i<3;i++){
   const target=await p.evaluate(i=>__cues.actions[i],i);await p.evaluate(i=>{__cues.state.hole.nightOrderActionsCompleted=__cues.actions.slice(0,i).map(a=>a.id);},i);
   if(i>0){await position(0,i===1?330:545,i===1?9:-9,i===1?350:565);await p.screenshot({path:out+'/turn-'+(i+1)+'.png'});}
   await position(i===0?target.x-38:i===1?-90:target.x,i===0?target.y-9:i===1?397:target.y-40,target.x,target.y);await p.screenshot({path:out+'/check-'+(i+1)+'-approach.png'});
   const cue=await p.evaluate(()=>RCScene3D.stats().objectiveCues);assert(cue.state[i].next);assert(cue.state.slice(0,i).every(s=>s.done));
  }
  await p.evaluate(()=>__cues.state.hole.nightOrderActionsCompleted=__cues.actions.map(a=>a.id));await render();const complete=await p.evaluate(()=>RCScene3D.stats().objectiveCues);assert(complete.state.slice(0,3).every(s=>s.done));assert(complete.state.slice(3).every(s=>s.next));await p.screenshot({path:out+'/release-filed.png'});
  const anchors=complete.anchors;for(const id of ['shed-key','sprinkler']){const target=anchors.find(a=>a.id===id);await position(target.x+30,target.y-8,target.x,target.y);await p.screenshot({path:out+'/'+id+'.png'});}
  await p.evaluate(()=>{__cues.state.hole.keyCollected=true;__cues.state.hole.drainUnlocked=true;});await render();assert((await p.evaluate(()=>RCScene3D.stats().objectiveCues.state)).every(s=>s.done&&!s.next));
  const unchanged=await p.evaluate(()=>{const t=__cues,s=t.state,before=JSON.stringify({player:s.player,joe:s.hole.joe,checks:s.hole.nightOrderActionsCompleted});for(let i=0;i<3;i++)t.render();return before===JSON.stringify({player:s.player,joe:s.hole.joe,checks:s.hole.nightOrderActionsCompleted});});assert(unchanged);
  await p.evaluate(()=>{const s=__cues.state;s.hole.nightOrderActionsCompleted=[];s.reducedMotion=true;s.effectsDensity=0;});await position(48,139,86,148);
  const frozen=await p.evaluate(()=>__cueGpu());await p.evaluate(()=>{__cues.state.mode='paused';advanceTime(5000);__cues.state.mode='first_hole';});await render();assert.equal((await p.evaluate(()=>__cueGpu())).cues.updates,frozen.cues.updates);
  for(const [width,height]of [[1280,720],[844,390]]){await p.setViewportSize({width,height});await render();await p.screenshot({path:out+'/bell-'+width+'.png'});await p.evaluate(()=>{__cues.state.mode='paused';__cues.render();});await p.locator('#controls-launch').click();await p.screenshot({path:out+'/settings-'+width+'.png'});assert(await p.locator('#clear-navigation').isVisible());await p.getByRole('button',{name:'Close',exact:true}).click();await p.evaluate(()=>{__cues.state.mode='first_hole';});await render();}
  await position(77,148,86,148);await p.evaluate(()=>advanceTime(17));await p.keyboard.press('e');await render();
  assert(await p.evaluate(()=>__cues.state.hole.nightOrderActionsCompleted.includes('audit-bell')),'Actual Use should complete the bell');assert((await p.evaluate(()=>RCScene3D.stats().objectiveCues.state))[0].done);
  await p.evaluate(()=>{roughCutRebuild.setClearNavigation(true);__cues.state.settingsIndex=__cues.SETTINGS_ROWS.findIndex(r=>r.id==='clear_navigation');__cues.resetSettingsCategory();});
  assert.equal(await p.evaluate(()=>roughCutRebuild.navigation().clearNavigation),false);
  const after=await p.evaluate(()=>__cueGpu());assert.equal(after.programs,before.programs);assert.equal(after.textures,before.textures);assert.deepEqual(errors,[]);
  await p.evaluate(()=>roughCutRebuild.setClearNavigation(true));await p.reload();await p.waitForFunction(()=>window.roughCutRebuild);assert.equal(await p.evaluate(()=>roughCutRebuild.navigation().clearNavigation),true);
  await p.evaluate(()=>roughCutRebuild.setClearNavigation(false));await p.reload();await p.waitForFunction(()=>window.roughCutRebuild);assert.equal(await p.evaluate(()=>roughCutRebuild.navigation().clearNavigation),false);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,before,complete,after,checks:['Three check priorities/completion and two access states','Two opaque depth-tested batches; no resource growth on transitions','Read-only render, pause, reduced motion and density zero','2560x1600, 1280x720 and 844x390 captures'],errors},null,2));console.log(JSON.stringify({passed:true,software,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
