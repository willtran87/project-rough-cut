const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/course-mower-motion';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__motion={state,resetFirstHole,render,moveJoeToward,updateJoeMowerEffects,COURSE_OBSTACLES,joeNavigationPointClear,joeObstacleOnSegment,planJoeRoute,worldDistance,wetStateAt,sandStateAt,joeCoursePressureMultiplier,joePursuitIntensityMultiplier,SPRINKLER_SOAK_ZONES,BUNKER_SAND_ZONES};\n  window.advanceTime = (milliseconds) => {')}));
 const draw=()=>p.evaluate(async()=>{__motion.render();await RCScene3D.whenPresented();}),shot=async name=>{await p.evaluate(()=>{const s=__motion.state;s.player.yaw=Math.atan2((s.hole.joe.x-s.player.x)*.72,s.hole.joe.y-s.player.y);});await draw();await p.screenshot({path:out+'/'+name+'.png'});};
 const reset=()=>p.evaluate(()=>{const t=__motion,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x:30,y:70,yaw:-Math.PI/2,pitch:-.2});Object.assign(s.hole.joe,{x:0,y:50,effectLastX:0,effectLastY:50,effectHeading:Math.PI/2,effectSpeed:0,driveSpeed:0,mode:'chase',alert:1,reactionTimer:0});});
 const travel=(target,frames)=>p.evaluate(({target,frames})=>{const t=__motion,h=t.state.hole,j=h.joe,rows=[];for(let i=0;i<frames;i++){h.elapsed+=1/60;t.moveJoeToward(target,32,1/60);t.updateJoeMowerEffects(1/60);t.render();rows.push({x:j.x,y:j.y,speed:j.driveSpeed,actual:j.effectSpeed,heading:j.effectHeading});}return rows;},{target,frames});
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__motion);await p.locator('#game').click();await reset();await draw();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await reset();
  await p.evaluate(()=>{for(let i=0;i<6;i++){__motion.state.hole.elapsed+=.1;__motion.render();}});
  const launch=await travel({x:0,y:100},12);await shot('accelerating-2560');const cruise=await travel({x:0,y:100},35);await shot('cruise-2560');
  assert(launch[0].speed<2&&launch.at(-1).speed>10&&cruise.at(-1).speed>20);
  const turn=await travel({x:0,y:10},15);await shot('braking-2560');const pivot=await travel({x:0,y:10},45);await shot('pivot-2560');const reverse=await travel({x:0,y:10},45);await shot('reversed-2560');
  const combined=[...launch,...cruise,...turn,...pivot,...reverse];for(let i=1;i<combined.length;i++){const a=combined[i-1],c=combined[i];assert(Math.abs(Math.atan2(Math.sin(c.heading-a.heading),Math.cos(c.heading-a.heading)))<=2.9/60+1e-7);assert(c.speed-a.speed<=64/60+1e-7);}
  assert(Math.min(...[...turn,...pivot].map(s=>s.speed))<1);assert(reverse.at(-1).y<pivot.at(-1).y);
  checks.push('Actual course translation accelerates, brakes for reversal, pivots at bounded speed and resumes in the new direction');
  const presentation=await p.evaluate(()=>{const t=__motion,j=t.state.hole.joe,before={speed:j.driveSpeed,x:j.x,y:j.y};t.updateJoeMowerEffects(1/60);t.updateJoeMowerEffects(1/60);return {before,after:{speed:j.driveSpeed,x:j.x,y:j.y}};});assert.deepEqual(presentation.after,presentation.before);checks.push('Repeated effects updates cannot change physical speed or position');
  const model=await p.evaluate(()=>RCScene3D.stats().joeModel);assert(model.handError<.005);await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.parse(render_game_to_text()).hole.joe.motion);await p.evaluate(()=>advanceTime(2000));assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).hole.joe.motion),frozen);await p.keyboard.press('Escape');checks.push('Pause freezes real motion; rendered grip remains on the handle');
  const paths=await p.evaluate(()=>{const t=__motion,h=t.state.hole,j=h.joe,results=[];h.engagement.closeEscape.phase='none';h.engagement.closeEscape.remaining=0;
   for(const o of t.COURSE_OBSTACLES.filter(o=>o.blocks))for(const side of [-1,1]){
    const rx=(o.radiusX||o.radius||10)/.72+12,ry=(o.radiusY||o.radius||10)+12,start={x:Math.max(-108,Math.min(108,o.x-rx)),y:o.y-side*ry},target={x:Math.max(-108,Math.min(108,o.x+rx)),y:o.y+side*ry};
    if(start.y<4||target.y>710||!t.joeNavigationPointClear(start)||!t.joeNavigationPointClear(target)||!t.planJoeRoute(start,target,2.2).length)continue;
    Object.assign(j,{...start,effectLastX:start.x,effectLastY:start.y,effectHeading:Math.PI/2,driveSpeed:0,routePath:[],routeTarget:null,repathTimer:0,stuckTimer:0,reactionTimer:0});
    let collision=false,steps=0;for(;steps<2400&&t.worldDistance(j,target)>.5;steps++){const before={x:j.x,y:j.y};t.moveJoeToward(target,28,1/60);t.updateJoeMowerEffects(1/60);if(t.joeObstacleOnSegment(before,j,1.9)){collision=true;break;}}
    results.push({id:o.id,side,steps,collision,distance:t.worldDistance(j,target)});
   }return results;
  });fs.writeFileSync(out+'/paths.json',JSON.stringify(paths,null,2));assert(paths.length>40);for(const r of paths){assert(!r.collision,JSON.stringify(r));assert(r.distance<.6,JSON.stringify(r));}checks.push(paths.length+' whole-course obstacle approaches reach their target with swept clearance');
  const terrain=await p.evaluate(()=>{
   const t=__motion,h=t.state.hole,j=h.joe,rows=[];
   for(const kind of ['wet','sand']){
    h.sprinklerSoakTimer=kind==='wet'?24:0;
    const zones=kind==='wet'?t.SPRINKLER_SOAK_ZONES:t.BUNKER_SAND_ZONES;
    let start=null;
    for(const z of zones){for(const dx of [-8,0,8])for(const dy of [-8,0,8]){
     const q={x:z.x+dx,y:z.y+dy},end={x:q.x,y:q.y+12};
     if(t.joeNavigationPointClear(q)&&!t.joeObstacleOnSegment(q,end,2.2)&&(kind==='wet'?t.wetStateAt(q).active&&t.wetStateAt(end).active:t.sandStateAt(q).active&&t.sandStateAt(end).active)){start=q;break;}
    }if(start)break;}
    if(!start)throw Error('Missing physical terrain fixture '+kind);
    Object.assign(j,{...start,effectLastX:start.x,effectLastY:start.y,effectHeading:Math.PI/2,driveSpeed:40,routePath:[],routeTarget:null,repathTimer:0,stuckTimer:0,reactionTimer:0});
    let expected;const target={x:start.x,y:start.y+40};
    for(let i=0;i<18;i++){expected=32*t.joeCoursePressureMultiplier()*t.joePursuitIntensityMultiplier()*(kind==='wet'?.68:.76);t.moveJoeToward(target,32,1/60);t.updateJoeMowerEffects(1/60);}
    rows.push({kind,start,end:{x:j.x,y:j.y},active:kind==='wet'?t.wetStateAt(j).active:t.sandStateAt(j).active,speed:j.driveSpeed,expected});
   }h.sprinklerSoakTimer=0;return rows;
  });for(const r of terrain){assert(r.active);assert(Math.abs(r.speed-r.expected)<.01,JSON.stringify(r));}checks.push('Actual soaked turf and sand apply their lower speed through the bounded braking model');
  await reset();await travel({x:0,y:100},30);await p.evaluate(()=>{const s=__motion.state;s.player.yaw=Math.atan2((s.hole.joe.x-s.player.x)*.72,s.hole.joe.y-s.player.y);});for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('moving-'+width);}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,launch,cruise,turn,pivot,reverse,paths,terrain,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,errors},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
