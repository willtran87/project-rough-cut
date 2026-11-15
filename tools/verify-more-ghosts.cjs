const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/more-ghosts-20261107',reactive=process.argv.includes('--reactive'),software=process.argv.includes('--software');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],behaviors=[],costs=[],gestureCaptures=new Set();let rushCaptured=false,tearCaptured=false,withdrawCaptured=false;
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__ghostTest={state,resetFirstHole,render,sites:SPECTRAL_COURSE_FIGURES,obstacles:COURSE_OBSTACLES};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__ghostTest&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__ghostTest,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.elapsed=100;s.hole.tensionDirector.reliefSeconds=0;s.hole.joe.mode='patrol';Object.assign(s.hole.joe,{x:100,y:700});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().effects?.ghost?.ready,null,{timeout:90000});
  const logic=await p.evaluate(async()=>{
   const {createGhostSightings}=await import('/ghost-motion.js'),q=createGhostSightings(),sites=[{x:1},{x:2}];let calls=0;
   const allowed=s=>{calls++;return true;},a=q.sample(0,true,sites,allowed),b=q.sample(3,true,sites,()=>false),duplicate=q.sample(3,true,sites,allowed);
   const expired=q.sample(14,true,sites,allowed),rest=q.sample(17,true,sites,allowed),next=q.sample(34,true,sites,allowed);
   q.sample(35,false,sites,allowed);const protectedReturn=q.sample(36,true,sites,allowed),reset=q.sample(0,true,sites,allowed);
   return {a,b,duplicate,expired,rest,next,protectedReturn,reset,calls};
  });
  assert.equal(logic.a.key,logic.b.key);assert.deepEqual(logic.b,logic.duplicate);assert(logic.b.alpha>.3);assert.equal(logic.expired,null);assert.equal(logic.rest,null);assert.notEqual(logic.next.index,logic.a.index);assert.equal(logic.protectedReturn,null);assert.equal(logic.reset.index,0);assert.equal(logic.calls,3);
  const sites=await p.evaluate(()=>__ghostTest.sites.map(s=>({...s})));assert.equal(sites.length,14);const results=[];
  const testedLocations=software?3:sites.length;
  for(let i=0;i<testedLocations;i++){
   await p.evaluate(site=>{
    const t=__ghostTest,s=t.state;t.sites.splice(0,t.sites.length,site);s.hole.mapOpen=true;s.hole.elapsed+=.1;t.render();s.hole.mapOpen=false;
    const obstacles=t.obstacles.filter(o=>(o.blocks||o.id.includes('pond'))&&!o.lightRadius);
    const clear=(x,y)=>!obstacles.some(o=>(((x-o.x)*.1152)/((o.radiusX||o.radius)*.16+.5))**2+(((y-o.y)*.16)/((o.radiusY||o.radius)*.16+.5))**2<1);
    const views=Array.from({length:24},(_,i)=>({x:site.x+Math.sin(i*Math.PI/12)*45/.72,y:site.y-Math.cos(i*Math.PI/12)*45})).filter(v=>Math.abs(v.x)<103&&v.y>10&&v.y<705&&clear(v.x,v.y)).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x));
    const view=views.find(v=>Array.from({length:20},(_,i)=>{const k=i/20;return clear(v.x+(site.x-v.x)*k,v.y+(site.y-v.y)*k);}).every(Boolean))||views[0];
    if(!view)throw Error('No safe camera');Object.assign(s.player,{...view,yaw:Math.atan2((site.x-view.x)*.1152,(site.y-view.y)*.16),pitch:0});
   },sites[i]);
   // Allow the .75s protected return, 1.2s warning and .8s reveal.
   for(let k=0;k<32;k++)await p.evaluate(async wait=>{const t=__ghostTest;t.state.hole.elapsed+=.1;t.render();if(wait)await RCScene3D.whenPresented();},software);
   await p.evaluate(()=>RCScene3D.whenPresented());
   const fx=await p.evaluate(()=>RCScene3D.stats().effects);results.push({site:sites[i],sighting:fx.ambientSighting,ghost:fx.ghost});
   if([0,4,8,12].includes(i))await p.screenshot({path:out+'/sighting-'+i+'.png'});
   if(reactive){
    const before=await p.evaluate(()=>JSON.stringify({player:__ghostTest.state.player,joe:__ghostTest.state.hole.joe,detection:__ghostTest.state.hole.detection}));
    for(let k=0;k<(process.argv.includes('--extended')?88:24);k++){
     const sample=await p.evaluate(async wait=>{const t=__ghostTest;t.state.hole.elapsed+=.1;t.render();if(wait)await RCScene3D.whenPresented();return RCScene3D.stats().effects;},software);
     behaviors.push({site:i,...sample.ghost});costs.push(sample.updateMs);
     assert(sample.ghost.drawCalls<=1&&sample.ghost.triangles<6000);
     const pulse=sample.feedback.ghostTear;
     if(['hesitate','feint'].includes(pulse?.kind)&&pulse.strength>.15&&!gestureCaptures.has(pulse.kind)){await p.evaluate(()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/'+pulse.kind+'-2560.png'});gestureCaptures.add(pulse.kind);}
     if(!withdrawCaptured&&sample.ghost.behaviorPhase==='withdraw'&&sample.ghost.walkWeight>.2){await p.evaluate(()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/withdraw-2560.png'});withdrawCaptured=true;}
     if(!tearCaptured&&sample.feedback.ghostTear?.kind==='rush'&&sample.feedback.ghostTear.strength>.1){await p.evaluate(()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/ghost-tear-2560.png'});tearCaptured=true;}
     if(!rushCaptured&&sample.ghost.behaviorPhase==='rush'&&sample.ghost.distance>1){await p.evaluate(()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/rush-2560.png'});rushCaptured=true;}
    }
    assert.equal(await p.evaluate(()=>JSON.stringify({player:__ghostTest.state.player,joe:__ghostTest.state.hole.joe,detection:__ghostTest.state.hole.detection})),before);
   }
  }
  fs.writeFileSync(out+'/coverage.json',JSON.stringify(results,null,2));
  assert.equal(results.filter(r=>r.sighting&&r.ghost.visible).length,testedLocations,'Every tested location must support a clear-footprint sighting');
  assert(results.every(r=>r.ghost.drawCalls<=1&&r.ghost.triangles<=6000));
  if(reactive){assert(rushCaptured);for(const name of ['watcher','stalker','rusher'])assert(behaviors.some(g=>g.behavior===name&&g.noticed));fs.writeFileSync(out+'/behaviors.json',JSON.stringify({behaviors,costs},null,2));}
  if(process.argv.includes('--feedback'))assert(tearCaptured,'A noticed rushing ghost must produce a visible tear pulse');
  if(process.argv.includes('--extended'))assert(withdrawCaptured,'The longer encounter must render its backward walk');
  if(process.argv.includes('--gestures'))assert.deepEqual([...gestureCaptures].sort(),['feint','hesitate']);
  await p.evaluate(sites=>{__ghostTest.sites.splice(0,__ghostTest.sites.length,...sites);__ghostTest.state.apparitions=false;__ghostTest.state.hole.elapsed+=.1;__ghostTest.render();},sites);
  await p.evaluate(()=>RCScene3D.whenPresented());assert(!(await p.evaluate(()=>RCScene3D.stats().effects.ghost.visible)));
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verification.json',JSON.stringify({passed:true,locations:sites.length,visibleLocations:results.filter(r=>r.sighting&&r.ghost.visible).length,reactive,rushCaptured,logic,errors},null,2));console.log(JSON.stringify({passed:true,locations:sites.length,visibleLocations:results.filter(r=>r.sighting&&r.ghost.visible).length,reactive,rushCaptured,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
