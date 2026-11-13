const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/level-one-organic-ghosts/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__ghostCheck={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 const draw=()=>p.evaluate(async()=>{__ghostCheck.render();await RCScene3D.whenPresented();return RCScene3D.stats().effects;});
 try{
  await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__ghostCheck);await p.locator('#game').click();
  await p.evaluate(()=>{const t=__ghostCheck,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:true});s.keys.clear();Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';s.hole.tensionDirector.reliefSeconds=0;Object.assign(s.player,{x:0,y:40,yaw:0,pitch:-.05});Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol'});});
  await draw();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().effects?.ghost.ready,null,{timeout:120000});
  let first=null,peak=null,fade=null,peakPose=null;
  for(let i=0;i<250;i++){
   await p.evaluate(()=>__ghostCheck.state.hole.elapsed+=.1);const f=await draw(),g=f.ghost;samples.push({time:i*.1,ghost:g,ambient:f.ambientSighting,schedule:f.ghostScheduling});
   if(g.visible&&!first){first=g;await p.screenshot({path:out+'/fade-in-2560.png'});}
   if(g.alpha>.45&&!peak){peak=g;peakPose=await p.evaluate(()=>({...__ghostCheck.state.player}));await p.screenshot({path:out+'/moving-2560.png'});}
   if(peak&&g.alpha>.03&&g.alpha<.15&&!fade){fade=g;await p.screenshot({path:out+'/fade-out-2560.png'});}
   if(fade&&!g.visible)break;
  }
  fs.writeFileSync(out+'/samples.json',JSON.stringify(samples,null,2));assert(first&&peak&&fade,'Expected a full natural scheduled sighting');assert(first.alpha<.06);assert(peak.softFade);assert.equal(peak.movementPattern,'curved-drift');assert(peak.walkWeight>.2);assert(Math.hypot(peak.position[0]-first.position[0],peak.position[2]-first.position[2])>.2);
  for(let i=1;i<samples.length;i++){const a=samples[i-1].ghost,b=samples[i].ghost;assert(Math.abs(a.alpha-b.alpha)<.06,'Opacity jumped');if(a.visible&&b.visible)assert(Math.hypot(a.position[0]-b.position[0],a.position[2]-b.position[2])<.1,'Position jumped');}
  // Wait for the next ordinary scheduled sighting, then check pause and interruption.
  let current;
  for(let i=0;i<600;i++){await p.evaluate(()=>__ghostCheck.state.hole.elapsed+=.1);current=(await draw()).ghost;if(current.alpha>.4)break;}
  assert(current.alpha>.4);const paused=await draw();assert.deepEqual(paused.ghost.position,current.position);assert.equal(paused.ghost.alpha,current.alpha);
  await p.evaluate(position=>{const player=__ghostCheck.state.player;player.yaw=Math.atan2(position[0]-player.x*.1152,-(position[2]+player.y*.16));},current.position);
  for(const [width,height] of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await draw();await p.screenshot({path:out+'/moving-'+width+'.png'});}
  await p.evaluate(()=>{__ghostCheck.state.hole.joe.mode='chase';__ghostCheck.state.hole.elapsed+=.1;});const interrupted=(await draw()).ghost;assert(interrupted.visible&&interrupted.alpha>.3);
  await p.evaluate(()=>__ghostCheck.state.hole.elapsed+=.6);const middle=(await draw()).ghost;assert(middle.alpha>0&&middle.alpha<interrupted.alpha);assert.notEqual(middle.headYaw,interrupted.headYaw);assert(Math.hypot(middle.position[0]-interrupted.position[0],middle.position[2]-interrupted.position[2])>.01,'Interrupted fade keeps travelling');
  await p.evaluate(()=>__ghostCheck.state.hole.elapsed+=.7);assert.equal((await draw()).ghost.visible,false);
  await p.evaluate(()=>{__ghostCheck.state.hole.joe.mode='patrol';__ghostCheck.state.reducedMotion=true;});
  for(let i=0;i<600;i++){await p.evaluate(()=>__ghostCheck.state.hole.elapsed+=.1);current=(await draw()).ghost;if(current.alpha>.3)break;}
  assert(current.alpha>.3);assert.equal(current.walkWeight,0);assert.equal(current.behaviorPhase,'still');
  await p.evaluate(()=>{roughCutRebuild.setComfort('apparitions',false);__ghostCheck.state.hole.elapsed+=.1;});assert.equal((await draw()).ghost.visible,false);assert.deepEqual(errors,[]);
  const report={passed:true,software,firstAlpha:first.alpha,peakAlpha:peak.alpha,movement:Math.hypot(peak.position[0]-first.position[0],peak.position[2]-first.position[2]),drawCalls:peak.drawCalls,triangles:peak.triangles,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
