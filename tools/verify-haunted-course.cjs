const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/haunted-course-20261108/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__haunt={state,resetFirstHole,render,updateExperienceEncounters,spatialEffectsFrame,actions:NIGHT_ORDER_ACTIONS,updateJoe,sites:SPECTRAL_COURSE_FIGURES};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__hauntRender=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures});'}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__haunt&&JSON.parse(render_game_to_text()).assets.course.ready);
  async function reset(){await p.evaluate(()=>{const t=__haunt,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});const h=s.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.elapsed=100;h.messageTimer=h.zoneBannerTimer=h.controlHintTimer=0;h.interactionPromptOwner=null;h.prompt='';Object.assign(s.player,{x:0,y:210,yaw:0,pitch:-.08});Object.assign(h.joe,{x:100,y:700,mode:'patrol',patrolPause:9999});h.hasLineOfSight=false;h.detection=0;h.tensionDirector.reliefSeconds=h.tensionDirector.accentCooldown=0;h.tensionDirector.encounterActive=false;t.render();});}
  await reset();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});await p.evaluate(async()=>RCScene3D.whenPresented());
  const baseline=await p.evaluate(()=>__hauntRender()),looks=[];
  for(const y of software?[35,215,315,675]:[35,125,215,315,400,490,580,675]){
   await p.evaluate(y=>{const t=__haunt;Object.assign(t.state.player,{x:0,y,yaw:0});t.state.hole.elapsed+=.2;t.render();},y);await p.evaluate(async()=>RCScene3D.whenPresented());
   await p.screenshot({path:out+'/zone-'+y+'.png'});const s=await p.evaluate(()=>RCScene3D.stats());looks.push({y,look:s.effects.zoneLook,limits:s.effects.limits,counts:s.effects.counts});assert(s.effects.zoneLook);assert(s.effects.counts.mist<=(software?10:24));
  }
  assert(new Set(looks.map(x=>x.look.fog)).size===looks.length);assert.deepEqual(await p.evaluate(()=>__hauntRender()),baseline,'Zone variation reuses textures and prepared programs');checks.push('Distinct spatial zone palettes, bounded mist pool and no new programs/textures');
  await reset();
  const cadence=await p.evaluate(async()=>{
   const t=__haunt,h=t.state.hole,records=[];h.elapsed=200;h.tensionDirector.accentCooldown=5;t.render();await RCScene3D.whenPresented();
   records.push(RCScene3D.encounterPhase());h.tensionDirector.accentCooldown=0;
   for(let i=0;i<45;i++){h.elapsed+=1;t.render();await RCScene3D.whenPresented();const e=RCScene3D.stats().effects;records.push({phase:e.cadence.phase,alpha:e.ambientSighting?.alpha,ghost:e.ghost.visible});}
   return records;
  });
  assert.equal(cadence[0],'suppressed');assert(cadence.some(x=>x.phase==='warning'&&x.alpha===0&&!x.ghost));assert(cadence.some(x=>x.phase==='encounter'&&x.ghost));assert(cadence.filter(x=>x.phase==='recovery').length>=14);checks.push('Actual renderer: accent suppression, invisible warning, visible encounter and sustained recovery');
  await reset();
  const finale=await p.evaluate(()=>{
   const t=__haunt,h=t.state.hole,e=h.engagement.experience,d=h.tensionDirector;h.nightOrderActionsCompleted=t.actions.map(a=>a.id);h.drainUnlocked=true;h.fieldSignalBreakaway.sourceId=null;
   t.updateExperienceEncounters(.1);const route=e.finaleRoute;h.elapsed+=9;d.reliefSeconds=d.accentCooldown=0;h.messageTimer=0;h.tacticalPayoff=null;
   const blocked=[];
   for(const guard of ['chase','lure','filing','map']){
    h.joe.mode=guard==='chase'?'chase':'patrol';h.distraction=guard==='lure'?{kind:'golf_ball',x:20,y:400}:null;h.distractionTimer=guard==='lure'?5:0;h.escapeFiling.active=guard==='filing';h.mapOpen=guard==='map';t.updateExperienceEncounters(.1);blocked.push(e.finaleSweep);
   }
   h.mapOpen=false;h.escapeFiling.active=false;h.distraction=null;h.distractionTimer=0;h.joe.mode='patrol';
   const before={x:h.joe.x,y:h.joe.y};t.updateExperienceEncounters(.1);const announced={...h.distraction},after={x:h.joe.x,y:h.joe.y},fx=t.spatialEffectsFrame();t.updateExperienceEncounters(1);
   const count=h.engagement.events.filter(e=>e.type==='closing_round').length;
   h.joe.mode='chase';t.updateJoe(.05);const interrupted={timer:h.distractionTimer,kind:h.distraction?.kind||null,state:e.finaleSweep};t.updateJoe(.05);const resumed=h.distraction?.kind||null;
   e.finaleSweep='waiting';e.finaleAt=h.elapsed-36;h.joe.mode='chase';t.updateExperienceEncounters(.1);const expired=e.finaleSweep;
   h.joe.mode='patrol';t.updateExperienceEncounters(.1);
   return {route,blocked,before,after,announced,expired,interrupted,resumed,fx:{ready:fx.finaleReady,exit:fx.exit},count};
  });
  assert.equal(finale.route,'drain');assert(finale.blocked.every(s=>s==='waiting'));assert.equal(finale.announced.kind,'closing_round');assert.deepEqual(finale.before,finale.after);assert.equal(finale.count,1);assert.equal(finale.expired,'skipped');assert(finale.fx.ready&&finale.fx.exit.y===699);checks.push('Final inspection is once-only, targets completed desk, never teleports, preserves chase/lure/filing/map and expires safely');
  assert.deepEqual(finale.interrupted,{timer:0,kind:null,state:'interrupted'});assert.equal(finale.resumed,null);checks.push('Live pursuit permanently cancels a closing inspection; it cannot resume after sight breaks');
  await p.evaluate(()=>{const t=__haunt;Object.assign(t.state.player,{x:-78,y:674,yaw:0});t.state.reducedMotion=true;t.state.hole.elapsed+=.2;t.render();});await p.evaluate(async()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/prepared-exit.png'});
  for(const [width,height]of [[1280,720],[844,390]]){await p.setViewportSize({width,height});await p.evaluate(()=>__haunt.render());await p.evaluate(async()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/exit-'+width+'.png'});}
  const stats=await p.evaluate(()=>RCScene3D.stats());assert(stats.effects.original.count<=stats.effects.original.limit);assert(stats.effects.original.drawCalls<=2);
  const sound=await p.evaluate(async()=>{
   const {createAtmosphericAudio}=await import('/atmospheric-audio.js');const c=new OfflineAudioContext(2,48000*3,48000),noise=c.createBuffer(1,48000,48000);
   const f=createAtmosphericAudio(c,c.destination,noise),base={active:true,volume:1,player:{x:0,z:0,yaw:0},apparitions:true,pressure:0};
   const warning=f.update({...base,time:0,encounterPhase:'warning'}).hush;
   f.update({...base,time:1,encounterPhase:'encounter',ghost:{key:'one',x:3,z:-6,phase:'notice'}});
   const recovery=f.update({...base,time:2,encounterPhase:'recovery',ghost:{key:'blocked',x:3,z:-6,phase:'rush'}}).hush;
   const closing=f.update({...base,time:3,encounterPhase:'quiet',finale:true}).hush;
   const audio=await c.startRendering(),state=f.stats();let peak=0;for(const v of audio.getChannelData(0))peak=Math.max(peak,Math.abs(v));f.dispose();return {warning,recovery,closing,peak,state};
  });
  assert.equal(sound.warning,.46);assert.equal(sound.recovery,1);assert.equal(sound.closing,.72);assert.equal(sound.state.counts.ghost_notice,1);assert(!sound.state.counts.ghost_rush);assert(sound.peak>0&&sound.peak<.15);assert.equal(sound.state.voices,0);assert(sound.state.maxVoices<=6);checks.push('Audio hush follows warning/recovery/finale, priority suppresses rush, bounded voices finish cleanly');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,checks,looks,cadence,finale,stats,sound,errors},null,2));console.log(JSON.stringify({passed:true,software,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
