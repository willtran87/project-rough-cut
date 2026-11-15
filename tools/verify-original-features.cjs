const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const software=process.argv.includes('--software'),out='output/original-features-20261107/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],results=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__restoredScene={world:()=>world,programs:()=>renderer.info.programs.length};'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__restore={state,resetFirstHole,render,activeChangeRequest,emergencyAppealState,spatialEffectsFrame};\n  window.advanceTime = (milliseconds) => {')}));
 const snap=async name=>{const fx=await p.evaluate(async()=>{__restore.render();await RCScene3D.whenPresented();return RCScene3D.stats().effects;});assert(fx.original.count<=fx.original.limit);assert(fx.original.drawCalls<=2);results.push({name,original:fx.original,cost:fx.updateMs});await p.screenshot({path:out+'/'+name+'.png'});return fx;};
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__restore&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__restore,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.elapsed=100;s.hole.tensionDirector.reliefSeconds=0;Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol',patrolPause:9999});const a=t.activeChangeRequest();Object.assign(s.player,{x:a.x,y:a.y-7,yaw:0,pitch:-.6});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const doc=await snap('document');assert(doc.original.documents.request);const programs=await p.evaluate(()=>__restoredScene.programs());
  await p.keyboard.press('e');assert(await p.evaluate(()=>__restore.state.hole.changeRequestCollected));const collected=await snap('collected');assert(!collected.original.documents.request);
  await p.evaluate(()=>{const s=__restore.state;Object.assign(s.hole.joe,{x:s.player.x,y:s.player.y+20,mode:'chase'});s.hole.distractionTimer=0;s.hole.distraction=null;s.hole.elapsed+=.1;});
  assert(await p.evaluate(()=>__restore.emergencyAppealState().eligible));await p.keyboard.press('e');assert(await p.evaluate(()=>__restore.state.hole.appealUsed));await p.evaluate(()=>{const s=__restore.state,a=s.hole.appealDocument;Object.assign(s.player,{x:a.x,y:a.y-7,yaw:0,pitch:-.65});s.hole.elapsed+=.1;});assert((await snap('appeal')).original.documents.appeal);
  const events=['boundary_knock','hedge_breath','submerged_lights','door_cycle','hedge_breach','black_sprinklers','range_volley','release_sweep'];
  for(const [i,name]of events.entries()){
   await p.evaluate(({name,i})=>{const s=__restore.state,h=s.hole;h.tensionDirector.reliefSeconds=0;h.joe.mode='patrol';h.tensionDirector.omen=null;h.appealDocument=null;s.reducedMotion=false;s.effectsDensity=1;Object.assign(s.player,{x:0,y:name==='submerged_lights'?215:80+i*60,yaw:0,pitch:-.15});h.zoneSetPiece={...h.zoneSetPiece,active:name,seed:i+10,timer:3,duration:6};h.elapsed+=1;__restore.render();},{name,i});
   // Observe fixed event anchor, then view it from a clear nearby position.
   const anchor=await p.evaluate(async()=>{await RCScene3D.whenPresented();return RCScene3D.stats().effects.original.anchor;});assert(anchor);
   await p.evaluate(a=>{const s=__restore.state;Object.assign(s.player,{x:a.x/.1152,y:-(a.z+5)/.16,yaw:0,pitch:-.12});s.hole.elapsed+=.1;},anchor);
   const event=await snap(name);assert(event.original.zone>0,name+' has no visible geometry');assert.deepEqual(event.original.anchor,anchor);
   const state=await p.evaluate(()=>JSON.stringify({player:__restore.state.player,joe:__restore.state.hole.joe,detection:__restore.state.hole.detection}));await p.evaluate(()=>__restore.render());assert.equal(await p.evaluate(()=>JSON.stringify({player:__restore.state.player,joe:__restore.state.hole.joe,detection:__restore.state.hole.detection})),state);
  }
  for(const type of ['grass_line','birds_scatter','fog_wake']){
   await p.evaluate(type=>{const s=__restore.state;s.hole.zoneSetPiece.active=null;s.hole.tensionDirector.omen={type,x:0,y:80,seed:55,side:1,seconds:3,duration:6};Object.assign(s.player,{x:0,y:52,yaw:0,pitch:-.1});s.hole.elapsed+=1;},type);
   const f=await snap(type);assert.equal(f.original.omen,type);if(type==='fog_wake')assert(f.counts.mist>0);else assert(f.original.warning>0);
  }
  await p.evaluate(()=>{const s=__restore.state;s.reducedMotion=true;s.hole.elapsed+=.1;});const reduced=await snap('reduced');assert.equal(reduced.original.omen,null);assert.equal(reduced.original.zone,0);
  await p.evaluate(()=>{const s=__restore.state;s.effectsDensity=0;s.reducedMotion=false;s.hole.cadenceRead.forecast={path:[{x:-2,y:65},{x:0,y:70},{x:2,y:75}],timer:4,duration:6};s.hole.cutTraceMemory={x:0,y:70,timer:3,duration:6,freshness:'fresh'};s.hole.elapsed+=.1;});assert((await snap('tactical-zero-density')).original.tactical>0);
  await p.evaluate(()=>{const s=__restore.state,h=s.hole;s.effectsDensity=1;h.tensionDirector.omen=null;h.cadenceRead.forecast=null;h.cutTraceMemory=null;h.messageTimer=0;h.detection=0;h.joe.mode='search';h.searchTimer=8;h.searchContext={kind:'status_ack',target:{x:0,y:70},color:'#c0b671',sourceLabel:'ROUGH STATUS GRID'};Object.assign(s.player,{x:0,y:50,yaw:0,pitch:-.5});h.elapsed+=.2;});
  assert((await snap('status-grid')).original.tactical>0);assert((await p.locator('body').innerText()).includes('ROUGH GRID'));
  await p.evaluate(()=>{__restore.state.player.yaw=Math.PI;__restore.state.hole.elapsed+=.2;});await snap('status-behind');assert((await p.locator('body').innerText()).includes('BEHIND'));
  await p.evaluate(()=>{const s=__restore.state;s.hole.searchTimer=0;s.hole.joe.mode='patrol';s.hole.zoneSetPiece.timer=0;s.hole.tensionDirector.omen={type:'grass_line',x:0,y:80,seconds:0,duration:6};s.hole.elapsed+=.2;});const expired=await snap('expired');assert.equal(expired.original.tactical,0);assert.equal(expired.original.zone,0);assert.equal(expired.original.omen,null);
  await p.evaluate(()=>{const s=__restore.state;Object.assign(s.player,{x:-18,y:660,yaw:0,pitch:.1});s.hole.elapsed+=.2;});const exit=await snap('exit-beacon');
  // Exit presentation moved to objective/environment guidance. The legacy
  // renderer must not add a duplicate sweep; verify the current exit state.
  assert.equal(exit.original.zone,0);assert.equal(await p.evaluate(()=>RCScene3D.stats().objectiveCues.exits.find(e=>e.route==='shed').phase),'locked');
  const beforePause=await p.evaluate(()=>JSON.stringify(RCScene3D.stats().effects.original));await p.evaluate(()=>{__restore.state.mode='paused';__restore.render();__restore.render();});assert.equal(await p.evaluate(()=>JSON.stringify(RCScene3D.stats().effects.original)),beforePause);await p.evaluate(()=>__restore.state.mode='first_hole');
  assert.equal(await p.evaluate(()=>__restoredScene.programs()),programs,'No new shader program on first event');
  for(const [w,h]of [[1280,720],[844,390]]){await p.setViewportSize({width:w,height:h});await snap('viewport-'+w);}
  await p.evaluate(()=>{RCScene3D.reset();__restore.render();});await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});assert.equal(await p.evaluate(()=>{let n=0;__restoredScene.world().traverse(o=>{if(o.name==='OriginalFeatures')n++;});return n;}),1);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verification.json',JSON.stringify({passed:true,software,results,errors},null,2));console.log(JSON.stringify({passed:true,software,cases:results.length,maxCost:Math.max(...results.map(r=>r.cost)),errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
