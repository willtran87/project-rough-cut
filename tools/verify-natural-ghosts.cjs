const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const reduced=process.argv.includes('--reduced'),zero=process.argv.includes('--zero-density'),fallback=process.argv.includes('--fallback');
 const out=(process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/visible-ghosts-20261107')+(reduced?'/reduced':'')+(zero?'/zero-density':'')+(fallback?'/fallback':'');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__natural={state,resetFirstHole,render,spatialEffectsFrame,sites:SPECTRAL_COURSE_FIGURES};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__natural&&JSON.parse(render_game_to_text()).assets.course.ready);
  // Use default game state, actual player controls and the live directors.
  // No hand-picked view, relocated Joe, forced sighting or modified ghost site.
  await p.evaluate(({reduced,zero})=>{const t=__natural;t.resetFirstHole();t.state.mode='first_hole';t.state.manualTime=true;t.state.transitionAlpha=0;t.state.reducedMotion=reduced;if(zero)t.state.effectsDensity=0;t.render();},{reduced,zero});
  // Separate explicit integration case: no authored candidate is available.
  if(fallback)await p.evaluate(()=>__natural.sites.splice(0));
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  await p.keyboard.press('e');await p.keyboard.down('w');await p.evaluate(()=>advanceTime(600));await p.keyboard.up('w');
  let first=null;
  for(let i=0;i<350;i++){
   await p.evaluate(()=>advanceTime(100));
   const s=await p.evaluate(()=>{const t=__natural,h=t.state.hole,f=RCScene3D.stats().effects;return {time:h.elapsed,mode:t.state.mode,tutorial:h.tutorialVisible,player:{x:t.state.player.x,y:t.state.player.y},joe:h.joe.mode,phase:h.tensionDirector.phase,suppressed:t.spatialEffectsFrame().suppressScares,ghost:f.ghost,ambient:f.ambientSighting,preferences:{apparitions:t.state.apparitions,reducedMotion:t.state.reducedMotion,density:t.state.effectsDensity}};});
   if(i%10===0)samples.push(s);
   if(s.ghost?.visible&&s.ambient?.alpha>.25){first=s;await p.evaluate(()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/natural-sighting-2560.png'});break;}
  }
  fs.writeFileSync(out+'/natural-run.json',JSON.stringify({first,samples,errors},null,2));assert(first,'No visible ambient ghost within 35 seconds of normal opening play');assert.deepEqual(errors,[]);
  if(fallback)assert.equal(first.ambient.site,-1);
  if(reduced){assert.equal(first.ghost.behaviorPhase,'still');assert.equal(first.ghost.distance,0);assert.equal(first.ghost.walkWeight,0);for(const key of ['headYaw','headNod','sway','shoulderRoll','jawDrop','torsoTurn'])assert.equal(first.ghost[key],0);assert(!(await p.evaluate(()=>RCScene3D.stats().effects.feedback.ghostTear)));}
  const clock=await p.evaluate(async()=>{
   const {createGhostSightings}=await import('/ghost-motion.js'),q=createGhostSightings();let fallbackCalls=0;
   const f=()=>{fallbackCalls++;return {x:0,y:50};};const a=q.sample(0,true,[{x:100,y:100}],()=>false,f),b=q.sample(.25,true,[],()=>false,f);
   q.sample(.5,false,[],()=>false,f);return {a,b,hidden:q.sample(.75,true,[],()=>false,f),fallbackCalls};
  });assert.equal(clock.a.index,-1);assert.equal(clock.a.key,clock.b.key);assert.equal(clock.b.alpha,0);assert.equal(clock.b.phase,'warning');assert.equal(clock.fallbackCalls,1);assert.equal(clock.hidden,null);
  await p.evaluate(()=>{roughCutRebuild.setComfort('apparitions',false);__natural.render();});await p.evaluate(()=>RCScene3D.whenPresented());assert(!(await p.evaluate(()=>RCScene3D.stats().effects.ghost.visible)));
  console.log(JSON.stringify({passed:true,firstSighting:first.time,source:first.ambient.site===-1?'open-ground':'authored',player:first.player,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
