const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/joe-startup-20261107';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__patrol={state,resetFirstHole,render,variants:RUN_VARIANTS,joeObstacleOnSegment};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__patrol&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const s=__patrol.state;__patrol.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;__patrol.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const samples=[];
  for(let t=0;t<=60;t++){
   if(t)await p.evaluate(()=>advanceTime(1000));
   samples.push(await p.evaluate(()=>{const s=__patrol.state,h=s.hole,j=h.joe;return {time:h.elapsed,mode:s.mode,x:j.x,y:j.y,joeMode:j.mode,pause:j.patrolPause,index:j.patrolIndex,speed:j.effectSpeed,obstacle:j.routeObstacle,stuck:j.stuckTimer,tutorial:h.tutorialVisible};}));
   if([0,2,10,25,60].includes(t)){await p.evaluate(async()=>{__patrol.render();await RCScene3D.whenPresented();});await p.screenshot({path:out+'/patrol-'+t+'.png'});}
  }
  const sweep=await p.evaluate(()=>{const check=__patrol.joeObstacleOnSegment,a={x:-47.0375,y:441.08177};return {outward:check(a,{x:a.x+.1,y:a.y-.1})?.id,inward:check(a,{x:a.x-.1,y:a.y+.1})?.id,through:check(a,{x:-95,y:465})?.id};});assert(!sweep.outward);assert(sweep.inward);assert(sweep.through);
  let stalled=0,maxStall=0;for(let i=1;i<samples.length;i++){stalled=Math.hypot(samples[i].x-samples[i-1].x,samples[i].y-samples[i-1].y)<.01?stalled+1:0;maxStall=Math.max(maxStall,stalled);}assert(maxStall<5,'Patrol cannot remain stranded at a collider');
  const variants=await p.evaluate(()=>__patrol.variants.map(v=>({id:v.id,hold:v.joeStart.hold})));const starts=[];
  for(let index=0;index<variants.length;index++){
   await p.evaluate(index=>{const t=__patrol;t.resetFirstHole(t.variants[index]);t.state.mode='first_hole';t.state.manualTime=true;t.render();},index);
   await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
   starts.push(await p.evaluate(index=>{const t=__patrol,s=t.state,a={x:s.hole.joe.x,y:s.hole.joe.y};advanceTime(2000);const j=s.hole.joe,moved=Math.hypot((j.x-a.x)*.72,j.y-a.y);s.mode='paused';const before=JSON.stringify(j);advanceTime(1000);return {id:t.variants[index].id,moved,pauseStable:JSON.stringify(j)===before,elapsed:s.hole.elapsed};},index));
  }
  fs.writeFileSync(out+'/samples.json',JSON.stringify({samples,starts,sweep,maxStall,errors},null,2));console.log(JSON.stringify({firstTwoSeconds:samples.slice(0,3),waypointAt60:samples[60].index,starts,maxStall,sweep,errors}));
  if(!process.argv.includes('--baseline')){assert(Math.hypot((samples[2].x-samples[0].x)*.72,samples[2].y-samples[0].y)>5,'Joe should roam in the first two seconds');assert(samples.slice(2).some(s=>s.index!==samples[0].index),'Joe should advance patrol waypoints');for(const s of starts){assert(s.moved>5,s.id+' should start roaming');assert(s.pauseStable,'Pause must freeze Joe');}assert.deepEqual(errors,[]);}
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

