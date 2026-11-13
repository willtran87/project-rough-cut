const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/gameplay-intelligence';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/game.js','utf8');await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__smart={state,resetFirstHole,render,updateJoe,moveJoeToward,planJoeRoute,joeNavigationPointClear,joeObstacleOnSegment,worldDistance,COURSE_OBSTACLES,exitPlanChoices,shotDecisionHint,runStyleSummary,tensionDirectorInterceptPoint,executeTensionIntercept};\n  window.advanceTime = (milliseconds) => {')}));
 const tick=n=>p.evaluate(n=>advanceTime(n*1000/60),n);
 const reset=async()=>{await p.evaluate(()=>{const t=__smart,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.inputMethod='keyboard';s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.controlHintTimer=s.hole.zoneBannerTimer=0;Object.assign(s.hole.joe,{x:100,y:690,patrolPause:9999});t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:90000});};
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__smart&&JSON.parse(render_game_to_text()).assets.course.ready);await reset();
  const evidence=await p.evaluate(()=>{const api=RCJoeNavigation,b=api.fresh();api.observe(b,{x:0,y:200},1);api.observe(b,{x:2,y:200},1.1);const lead=api.pursuit(b,{x:-40,y:200},true,()=>true),hidden=api.pursuit(b,{x:-40,y:200},false,()=>true),blocked=api.pursuit(b,{x:-40,y:200},true,()=>false);return {lead,hidden,blocked,velocity:b.velocity};});
  assert(evidence.lead.x>2&&evidence.lead.x<=2+8/.72);assert.deepEqual(evidence.hidden,{x:2,y:200});assert.deepEqual(evidence.blocked,evidence.hidden);
  checks.push('Visible-motion interception is bounded; sight loss or blocked prediction returns to known evidence');
  const sweep=await p.evaluate(()=>{const b=RCJoeNavigation.fresh(),anchor={x:0,y:210},visited=[];b.velocity={x:20,y:0};let joe={x:0,y:210};for(let i=0;i<500;i++){const next=RCJoeNavigation.search(b,anchor,joe,1/60,()=>true);if(!next)break;if(!next.hold){joe={...next.target};visited.push(joe);}}return {brain:b,visited};});assert.equal(sweep.brain.intent,'search-complete');assert.equal(sweep.brain.search.visited.length,4);assert.equal(new Set(sweep.brain.search.visited.map(p=>JSON.stringify(p))).size,4);
  checks.push('Search checks four fixed evidence-led positions once and ends rather than orbiting indefinitely');
  const paths=await p.evaluate(()=>{const t=__smart,s=t.state,h=s.hole,j=h.joe,results=[];const obstacles=t.COURSE_OBSTACLES.filter(o=>o.blocks&&!o.id.startsWith('shed')).slice(0,18);
    for(const o of obstacles)for(const side of [-1,1]){
      const rx=(o.radiusX||o.radius||10)/.72+12,ry=(o.radiusY||o.radius||10)+12,start={x:Math.max(-108,Math.min(108,o.x-rx)),y:o.y-side*ry},target={x:Math.max(-108,Math.min(108,o.x+rx)),y:o.y+side*ry};
      if(!t.joeNavigationPointClear(start)||!t.joeNavigationPointClear(target))continue;
      Object.assign(j,{...start,routePath:[],routeTarget:null,repathTimer:0,stuckTimer:0,reactionTimer:0,mode:'chase'});h.engagement.closeEscape.remaining=0;
      const route=t.planJoeRoute(start,target,2.2);if(!route.length)continue;
      let collision=false,steps=0;for(;steps<1800&&t.worldDistance(j,target)>.5;steps++){const before={x:j.x,y:j.y};t.moveJoeToward(target,28,1/60);if(t.joeObstacleOnSegment(before,j,1.9)){collision=true;break;}}
      results.push({id:o.id,side,steps,collision,distance:t.worldDistance(j,target)});
    }return results;});fs.writeFileSync(out+'/path-cases.json',JSON.stringify(paths,null,2));assert(paths.length>=12);for(const r of paths){assert(!r.collision,JSON.stringify(r));assert(r.distance<.6,JSON.stringify(r));}
  checks.push(paths.length+' obstacle approaches preserve mower clearance and reach the destination without corner oscillation');
  await reset();await p.evaluate(()=>{const s=__smart.state,h=s.hole;Object.assign(s.player,{x:-100,y:650});Object.assign(h.joe,{x:0,y:180,mode:'search',patrolPause:0});h.lastSeenPlayer={x:0,y:180};h.searchTimer=.01;h.noise=h.detection=0;h.hasLineOfSight=false;__smart.updateJoe(1/60);});
  const relief=await p.evaluate(()=>({mode:__smart.state.hole.joe.mode,relief:__smart.state.hole.tensionDirector.reliefSeconds,intent:__smart.state.hole.joe.brain.intent}));assert.equal(relief.mode,'patrol');assert(relief.relief>=8);assert.equal(relief.intent,'return-to-patrol');
  checks.push('Exhausting a search resumes patrol and grants a real director recovery interval');

  await reset();
  const patrol=await p.evaluate(()=>{const t=__smart,s=t.state,h=s.hole,j=h.joe;
    Object.assign(s.player,{x:0,y:45,yaw:Math.PI});Object.assign(j,{x:0,y:180,mode:'patrol',patrolIndex:0,patrolPause:0});
    const first=t.tensionDirectorInterceptPoint();s.player.x=100;s.player.y=20;const second=t.tensionDirectorInterceptPoint();
    h.tensionDirector.pendingIntercept={...first.point,seconds:0};const before={x:j.x,y:j.y},executed=t.executeTensionIntercept(),after={x:j.x,y:j.y};
    const destination={...h.distraction};t.updateJoe(1/60);const step=t.worldDistance(after,j);
    // New contact must interrupt a director patrol just like any ordinary patrol.
    Object.assign(s.player,{x:j.x,y:j.y+6});h.detection=1;h.contactConfirmationSeconds=1;h.noise=1;h.engagement.closeEscape.remaining=0;t.updateJoe(1/60);
    return {first,second,executed,before,after,step,destination,mode:j.mode};
  });assert.deepEqual(patrol.first,patrol.second);assert(patrol.executed);assert.deepEqual(patrol.before,patrol.after);assert(patrol.step<=1);assert.equal(patrol.destination.kind,'patrol_reposition');assert.equal(patrol.mode,'chase');
  checks.push('Director patrols walk instead of teleporting, ignore hidden player relocation, and yield to fresh contact');

  await reset();await p.evaluate(()=>{__smart.state.hole.mapOpen=true;__smart.render();});await p.waitForTimeout(180);
  const before=await p.evaluate(()=>__smart.exitPlanChoices());assert(before[0].access.includes('Find key'));assert(before[1].access.includes('Open valve'));await p.locator('[data-route=drain]').click();await p.waitForFunction(()=>document.querySelector('[data-route=drain]').getAttribute('aria-pressed')==='true');assert.equal(await p.locator('[data-route=drain]').getAttribute('aria-pressed'),'true');
  await p.evaluate(()=>{__smart.state.hole.keyCollected=true;__smart.state.hole.drainUnlocked=true;});const ready=await p.evaluate(()=>__smart.exitPlanChoices());assert(ready.every(p=>p.access.includes('Access ready')));assert(ready[0].tradeoff.includes('key secured'));
  for(const [width,height]of [[2560,1600],[1280,720],[800,600],[844,390]]){await p.setViewportSize({width,height});await p.evaluate(w=>{__smart.state.inputMethod=w===844?'touch':'keyboard';__smart.render();},width);await p.waitForTimeout(140);await p.screenshot({path:out+'/exit-plans-'+width+'.png'});for(const button of await p.locator('#route-choices button').all()){const box=await button.boundingBox();assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height);}}
  checks.push('Exit plans show real access, distance and hold tradeoffs, select a route, and fit four viewport sizes');
  await p.setViewportSize({width:2560,height:1600});await reset();await p.keyboard.down('Space');await tick(24);const hint=await p.evaluate(()=>__smart.shotDecisionHint());assert(hint.includes('LURE')||hint.includes('DISTRACTION'));await p.screenshot({path:out+'/shot-preview.png'});await p.keyboard.press('Escape');await p.keyboard.up('Space');
  const style=await p.evaluate(()=>{__smart.state.hole.engagement.events.push({type:'station',id:'release-review',signal:0});return __smart.runStyleSummary();});assert.equal(style.title,'OUTSMARTED THE REVIEW');checks.push('Aim previews communicate actual surface/lure behavior and result coaching recognizes the successful tactic');
  await reset();
  const lod=[];for(const [name,distance]of [['near',7],['far',18],['near-return',7]]){
    await p.evaluate(d=>{const s=__smart.state;Object.assign(s.player,{x:0,y:330,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:0,y:330+d/.16,effectHeading:-Math.PI/2,effectSpeed:4,walkMeters:10,mode:'patrol'});s.hole.elapsed+=.1;__smart.render();},distance);await p.screenshot({path:out+'/joe-'+name+'.png'});lod.push(await p.evaluate(()=>RCScene3D.stats().joeModel));
  }
  assert.equal(lod[0].lod,'original');assert.equal(lod[1].lod,'distant');assert(lod[1].activeTriangles<lod[0].activeTriangles*.25);assert.equal(lod[2].lod,'original');assert(lod.every(m=>!m.lodError&&m.lodMeshes===27&&m.handError<.005));
  checks.push('Joe uses the original close-up geometry, a 27-mesh skinned distant LOD, and returns without losing grip or animation state');
  const fallback=await browser.newPage({viewport:{width:1280,height:720}});
  fallback.on('pageerror',e=>errors.push(e.message));
  await fallback.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__fallback={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
  await fallback.route('**/joe-pixel-rig-lod.glb*',r=>r.abort());
  await fallback.goto('http://127.0.0.1:4187');await fallback.locator('canvas').click();await fallback.keyboard.press('Space');
  await fallback.waitForFunction(()=>window.__fallback&&JSON.parse(render_game_to_text()).assets.course.ready);
  await fallback.evaluate(()=>{const t=__fallback;t.resetFirstHole();t.state.mode='first_hole';t.state.manualTime=true;t.render();});
  await fallback.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:90000});
  await fallback.evaluate(()=>{__fallback.state.hole.joe.y=600;__fallback.render();});
  const safe=await fallback.evaluate(()=>RCScene3D.stats().joeModel);assert(safe.lodError);assert.equal(safe.activeTriangles,141248);assert.equal(safe.lod,'original');await fallback.close();
  checks.push('A missing optional distant mesh keeps the original Joe ready and playable');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verification.json',JSON.stringify({passed:true,checks,errors,lod:lod.map(s=>({lod:s.lod,triangles:s.activeTriangles,handError:s.handError}))},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
 }catch(e){await p.screenshot({path:out+'/failure.png'});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
