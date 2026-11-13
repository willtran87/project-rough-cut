const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/joe-pursuit-2026-11-13';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results={},errors=[];
 try{for(const version of ['baseline','tuned']){
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const dir=version==='baseline'?out+'/baseline-source':'web';
  await p.route('**/joe-navigation.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(dir+'/joe-navigation.js','utf8')}));
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(dir+'/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__pursuit={state,resetFirstHole,render,updateJoe,updateJoeMowerEffects,moveJoeToward,planJoeRoute,joeNavigationPointClear,joeObstacleOnSegment,worldDistance,COURSE_OBSTACLES};\n  window.advanceTime = (milliseconds) => {')}));
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__pursuit);
  const reset=()=>p.evaluate(()=>{const t=__pursuit,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();const h=s.hole;Object.assign(h,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0,noise:1,detection:1,contactConfirmationSeconds:1});h.practiceDrill.active=false;h.statusRequest.issued=h.statusRequest.resolved=true;h.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x:40,y:100,yaw:Math.PI,pitch:-.12});Object.assign(h.joe,{x:40,y:20,effectLastX:40,effectLastY:20,effectHeading:Math.PI/2,driveSpeed:0,mode:'chase',alert:1,reactionTimer:0});});
  await reset();await p.evaluate(()=>__pursuit.render());await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&!RCScene3D.isPreparing(),null,{timeout:120000});await reset();
  const position=()=>p.evaluate(()=>{const t=__pursuit,s=t.state;for(let y=40;y<650;y+=10)for(const x of [0,20,-20,40,-40]){const a={x,y},b={x,y:y+80};if(!t.joeNavigationPointClear(a)||!t.joeNavigationPointClear(b)||t.joeObstacleOnSegment(a,b,2.2))continue;Object.assign(s.hole.joe,{...a,effectLastX:x,effectLastY:y,effectHeading:Math.PI/2});Object.assign(s.player,{x,y:y+28});s.hole.lastMovementAppliedDistance=.4;return;}throw Error('No exposed pursuit lane');});
  await position();const chase=await p.evaluate(()=>{const t=__pursuit,h=t.state.hole,j=h.joe,rows=[],start=j.y;for(let i=0;i<60;i++){t.state.player.y+=28/60;h.elapsed+=1/60;t.updateJoe(1/60);t.updateJoeMowerEffects(1/60);rows.push({speed:j.driveSpeed,y:j.y,mode:j.mode,visible:h.hasLineOfSight});}return {peak:Math.max(...rows.map(r=>r.speed)),travel:j.y-start,end:rows.at(-1)};});
  await p.evaluate(async()=>{__pursuit.render();await RCScene3D.whenPresented();});await p.screenshot({path:out+'/'+version+'-chase-2560.png'});
  await reset();await position();const reaction=await p.evaluate(()=>{const t=__pursuit,h=t.state.hole;Object.assign(h.joe,{mode:'patrol',patrolPause:9999});h.contactConfirmationSeconds=0;let frames=0;for(;frames<120&&h.joe.mode!=='chase';frames++){h.elapsed+=1/60;t.updateJoe(1/60);}return frames/60;});
  const movingGoal=await p.evaluate(()=>{const t=__pursuit,j=t.state.hole.joe,h=t.state.hole;h.engagement.closeEscape.phase='none';h.engagement.closeEscape.remaining=0;
   for(const o of t.COURSE_OBSTACLES.filter(o=>o.blocks))for(const side of [-1,1]){
    const rx=(o.radiusX||o.radius||10)/.72+12,ry=(o.radiusY||o.radius||10)+12,start={x:Math.max(-108,Math.min(108,o.x-rx)),y:o.y-side*ry},target={x:Math.max(-108,Math.min(108,o.x+rx)),y:o.y+side*ry},next={x:target.x,y:target.y+3};
    if(!t.joeNavigationPointClear(start)||!t.joeNavigationPointClear(next)||!t.joeObstacleOnSegment(start,next))continue;const path=t.planJoeRoute(start,target,2.2);if(path.length<2||t.joeObstacleOnSegment(path.at(-2),next))continue;
    Object.assign(j,{...start,routePath:path,routeTarget:{...target},repathTimer:.4,driveSpeed:0,effectHeading:0,reactionTimer:0,mode:'chase'});const retained=JSON.stringify(path.slice(0,-1));t.moveJoeToward(next,0,1/60);
    return {obstacle:o.id,error:t.worldDistance(j.routePath.at(-1),next),retained:retained===JSON.stringify(j.routePath.slice(0,-1)),last:j.routePath.at(-1),target:next};
   }throw Error('No moving-goal fixture');
  });
  results[version]={chase,reaction,movingGoal};
  if(version==='tuned'){
   const paths=await p.evaluate(()=>{const t=__pursuit,h=t.state.hole,j=h.joe,rows=[];h.engagement.closeEscape.phase='none';h.engagement.closeEscape.remaining=0;
    for(const hz of [30,60,120])for(const o of t.COURSE_OBSTACLES.filter(o=>o.blocks))for(const side of [-1,1]){
     const rx=(o.radiusX||o.radius||10)/.72+12,ry=(o.radiusY||o.radius||10)+12,start={x:Math.max(-108,Math.min(108,o.x-rx)),y:o.y-side*ry},target={x:Math.max(-108,Math.min(108,o.x+rx)),y:o.y+side*ry};
     if(start.y<4||target.y>710||!t.joeNavigationPointClear(start)||!t.joeNavigationPointClear(target)||!t.planJoeRoute(start,target,2.2).length)continue;
     Object.assign(j,{...start,effectLastX:start.x,effectLastY:start.y,effectHeading:Math.PI/2,driveSpeed:0,routePath:[],routeTarget:null,repathTimer:0,stuckTimer:0,reactionTimer:0,mode:'chase'});
     let collision=false,steps=0,peak=0;for(;steps<hz*40&&t.worldDistance(j,target)>.5;steps++){const before={x:j.x,y:j.y};t.moveJoeToward(target,43,1/hz);peak=Math.max(peak,j.driveSpeed);if(t.joeObstacleOnSegment(before,j,1.9)){collision=true;break;}}
     rows.push({id:o.id,side,hz,seconds:steps/hz,collision,remaining:t.worldDistance(j,target),peak});
    }return rows;
   });fs.writeFileSync(out+'/fast-paths.json',JSON.stringify(paths,null,2));assert(paths.length>180);for(const r of paths){assert(!r.collision,JSON.stringify(r));assert(r.remaining<.6,JSON.stringify(r));}results.tuned.fastPaths=paths.length;
   for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await reset();await position();await p.evaluate(async()=>{const t=__pursuit;for(let i=0;i<60;i++){t.state.player.y+=28/60;t.state.hole.elapsed+=1/60;t.updateJoe(1/60);t.updateJoeMowerEffects(1/60);}t.render();await RCScene3D.whenPresented();});await p.screenshot({path:out+'/chase-'+width+'.png'});}
  }
  await p.close();
 }
 assert(results.tuned.chase.peak>results.baseline.chase.peak*1.15);assert(results.tuned.chase.travel>results.baseline.chase.travel*1.1);assert(results.tuned.reaction<results.baseline.reaction);assert(results.baseline.movingGoal.error>2.9);assert(results.tuned.movingGoal.error<.01);assert(results.tuned.movingGoal.retained);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,results,errors},null,2));console.log(JSON.stringify({passed:true,results,errors}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,results,errors},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
