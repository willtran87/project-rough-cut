const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/ghost-scheduling-20261108/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__gs={state,resetFirstHole,render,sites:SPECTRAL_COURSE_FIGURES,obstacles:COURSE_OBSTACLES,spatialEffectsFrame,triggerHorrorEvent};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__gsGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures});'}));
 const render=async()=>{await p.evaluate(()=>__gs.render());await p.evaluate(async()=>RCScene3D.whenPresented());};
 const sample=async()=>p.evaluate(async wait=>{const t=__gs;t.state.hole.elapsed+=.1;t.render();if(wait)await RCScene3D.whenPresented();return RCScene3D.stats().effects;},software);
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__gs&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__gs,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:true});const h=s.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.elapsed=100;h.messageTimer=h.zoneBannerTimer=0;Object.assign(h.joe,{x:100,y:700,mode:'search'});h.hasLineOfSight=false;h.detection=0;Object.assign(h.tensionDirector,{reliefSeconds:0,encounterActive:true,accentCooldown:999});
   const site=t.sites[0];t.sites.splice(0,t.sites.length,site);const obstacles=t.obstacles.filter(o=>(o.blocks||o.id.includes('pond'))&&!o.lightRadius);
   const clear=(x,y)=>!obstacles.some(o=>(((x-o.x)*.1152)/((o.radiusX||o.radius)*.16+.5))**2+(((y-o.y)*.16)/((o.radiusY||o.radius)*.16+.5))**2<1);
   const views=Array.from({length:24},(_,i)=>({x:site.x+Math.sin(i*Math.PI/12)*45/.72,y:site.y-Math.cos(i*Math.PI/12)*45})).filter(v=>Math.abs(v.x)<103&&v.y>10&&v.y<705&&clear(v.x,v.y)).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x));
   const view=views.find(v=>Array.from({length:20},(_,i)=>{const k=i/20;return clear(v.x+(site.x-v.x)*k,v.y+(site.y-v.y)*k);}).every(Boolean));Object.assign(s.player,{...view,yaw:Math.atan2((site.x-view.x)*.72,site.y-view.y),pitch:0});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().effects?.ghost?.ready,null,{timeout:90000});
  const before=await p.evaluate(()=>({gpu:__gsGpu(),simulation:JSON.stringify({player:__gs.state.player,joe:__gs.state.hole.joe,detection:__gs.state.hole.detection})}));
  let fx,firstVisible=null;for(let i=1;i<=110;i++){fx=await sample();if(fx.ghost.visible&&!firstVisible)firstVisible=i/10;}
  assert(firstVisible!==null&&firstVisible<=10.5,'Continuous accent cooldown and distant search must not starve sightings');assert.equal(fx.cadence.preemptions,1);assert(fx.ghost.visible);await render();await p.screenshot({path:out+'/deferred-ghost-2560.png'});
  assert.equal(await p.evaluate(()=>JSON.stringify({player:__gs.state.player,joe:__gs.state.hole.joe,detection:__gs.state.hole.detection})),before.simulation);
  // No cosmetic event can cut into the reserved warning/encounter.
  const eventCounts=await p.evaluate(()=>{const t=__gs,h=t.state.hole;h.joe.mode='patrol';h.tensionDirector.accentCooldown=0;h.tensionDirector.encounterActive=false;const before=h.horrorDirector.eventCount;t.triggerHorrorEvent('peripheral_groundskeeper');return {before,after:h.horrorDirector.eventCount};});assert.equal(eventCounts.before,eventCounts.after);
  const key=fx.ambientSighting.key;await p.evaluate(()=>__gs.state.hole.tensionDirector.accentCooldown=999);fx=await sample();assert.equal(fx.ambientSighting.key,key);assert(fx.ghost.visible);
  const frozen=fx.cadence;await p.evaluate(()=>__gs.state.mode='paused');await render();await render();assert.deepEqual(await p.evaluate(()=>RCScene3D.stats().effects.cadence),frozen);await p.evaluate(()=>__gs.state.mode='first_hole');
  for(const protection of ['map','aim','filing','chase','relief','near']){
   const saved=await p.evaluate(kind=>{const h=__gs.state.hole,saved={joe:{...h.joe}};if(kind==='map')h.mapOpen=true;if(kind==='aim')h.ballAim.active=true;if(kind==='filing')Object.assign(h.escapeFiling,{active:true,duration:2,progress:0,route:'shed'});if(kind==='chase')h.joe.mode='chase';if(kind==='relief')h.tensionDirector.reliefSeconds=5;if(kind==='near'){Object.assign(h.joe,{x:__gs.state.player.x,y:__gs.state.player.y+12,mode:'patrol'});h.horrorDirector.manifestation={type:'peripheral_groundskeeper',seed:999,side:1,seconds:1,duration:2};}return saved;},protection);
   fx=await sample();assert(!fx.ghost.visible,protection+' must win');assert(fx.ghostScheduling.blocked);
   await p.evaluate(saved=>{const h=__gs.state.hole;h.mapOpen=false;h.ballAim.active=false;h.escapeFiling.active=false;h.tensionDirector.reliefSeconds=0;h.horrorDirector.manifestation=null;Object.assign(h.joe,saved.joe);h.joe.mode='patrol';h.tensionDirector.accentCooldown=0;},saved);
   for(let i=0;i<31;i++)fx=await sample();assert(fx.ghost.visible,'Return after '+protection);
  }
  await p.evaluate(()=>{__gs.state.reducedMotion=true;__gs.state.effectsDensity=0;});await render();assert((await p.evaluate(()=>RCScene3D.stats().effects.ghost)).visible);
  for(const [width,height]of [[1280,720],[844,390]]){await p.setViewportSize({width,height});await render();await p.screenshot({path:out+'/ghost-'+width+'.png'});}
  await p.evaluate(()=>__gs.state.apparitions=false);await render();assert(!await p.evaluate(()=>RCScene3D.stats().effects.ghost.visible));
  assert.deepEqual(await p.evaluate(()=>__gsGpu()),before.gpu);assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,firstVisible,before:before.gpu,final:fx.cadence,errors},null,2));console.log(JSON.stringify({passed:true,software,firstVisible,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
