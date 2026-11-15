const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const replayArg=process.argv.find(a=>a.startsWith('--replay=')),replaySeed=replayArg?Number(replayArg.split('=')[1]):null;
const overlookStart=process.argv.includes('--overlook-start'),compact=process.argv.includes('--compact');
const maintenance=process.argv.includes('--maintenance');
const routeOnly=process.argv.find(a=>a.startsWith('--route='))?.slice(8);if(routeOnly)assert(['direct','garage','drain'].includes(routeOnly));
const visualLure=process.argv.includes('--visual-lure'),software=process.argv.includes('--software');
if(replaySeed!==null)assert([0,1,2].includes(replaySeed));
const tactics=process.argv.includes('--balls'),crossings=process.argv.includes('--crossings'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||(replaySeed!==null?`output/final-cut/replays/plan-${replaySeed}`:crossings?'output/final-cut/crossings/routes':tactics?'output/final-cut/balls/routes':'output/final-cut/arrival'),base='http://127.0.0.1:4187/final-cut.html?test';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const errors=[],checks=[],runs=[],shots=[],openingWaits=[],ballEvidence=[];
 for(const route of routeOnly?[routeOnly]:replaySeed!==null?['direct']:['direct','garage','drain']){
  const context=await browser.newContext({viewport:{width:2560,height:1600}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(replaySeed!==null)await page.addInitScript(()=>localStorage.setItem('rough-cut.final-cut.v1',JSON.stringify({version:1,checkpoint:2,won:true,completed:true})));
  await page.goto(base+(route==='direct'?'':'&from='+route));await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.evaluate(()=>advanceTime(0));
  if(replaySeed!==null){await page.locator('#replay-options summary').click();await page.locator('#replay-plan').selectOption(String(replaySeed));}
  await page.locator('#primary').click();
  while(await page.locator('#final-cut-story').evaluate(d=>d.open)){await page.locator('[data-story=next]').waitFor({state:'visible'});await page.locator('[data-story=next]').click();}
  const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>page.evaluate(ms=>advanceTime(ms),ms),shot=async name=>{await tick(0);if(!compact||/(overlook|fork-2560|win-cutscene|completed)$/.test(name)){await page.screenshot({path:`${out}/${name}.png`});shots.push(name);}};
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await shot(`${route}-entry-${width}`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await page.setViewportSize({width:2560,height:1600});
  await page.evaluate(()=>{window.pad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[pad];});await tick(50);
  const axes=async(a,sprint=false)=>page.evaluate(({a,sprint})=>{pad.axes=a;pad.buttons[7].pressed=sprint;},{a,sprint}),neutral=async()=>{await axes([0,0,0,0]);await tick(17);};
  async function face(yaw){for(let k=0;k<50;k++){const p=(await read()).player,d=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw));if(Math.abs(d)<.002)break;await axes([0,0,Math.sign(d),0]);await tick(Math.min(250,Math.abs(d)/2.2*1000));}await neutral();}
  async function go(x,y){for(let k=0;k<650;k++){const state=await read(),p=state.player,dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);assert.equal(state.mode,'final_cut_playing',`Caught on route ${route} approaching ${x},${y}`);if(d<.035){await neutral();return;}const f=(dx*Math.sin(p.yaw)+dy*Math.cos(p.yaw))/d,s=(dx*Math.cos(p.yaw)-dy*Math.sin(p.yaw))/d;await axes([s,-f,0,0]);await tick(Math.min(350,d/3.84*1000));}throw Error(`Movement stuck ${route} ${x},${y}: ${JSON.stringify((await read()).player)}`);}
  async function use(x,y,id){const p=(await read()).player;await face(Math.atan2(x-p.x,y-p.y));assert.equal((await read()).action?.id,id);await page.evaluate(()=>{pad.buttons[0].pressed=true;});await tick(17);await page.evaluate(()=>{pad.buttons[0].pressed=false;});await tick(17);}
  async function cross(x,y){for(let k=0;k<100;k++){
   const safe=await page.evaluate(async({x,y})=>{const {step}=await import('./final-cut-sim.js'),r=structuredClone(__finalCut.run),p=r.player,dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy),input={forward:(dx*Math.sin(p.yaw)+dy*Math.cos(p.yaw))/d,strafe:(dx*Math.cos(p.yaw)-dy*Math.sin(p.yaw))/d};for(let n=0;n<Math.ceil(d/3.84*60);n++)step(r,input,1/60);return r.mode!=='caught';},{x,y});
   if(safe){await go(x,y);return;}await tick(400);
  }throw Error('No crossing window');}
  const initial=await read();assert.equal(initial.route,route);if(replaySeed!==null)assert.equal(initial.cutPlan.seed,replaySeed);assert(!initial.arrival.requested);assert.equal(initial.rig.phase,'waiting');
  if(route!=='direct'){await go(-2,-15);await face(0);await go(-2,-2);}await face(.16);await shot(`${route}-overlook`);assert((await read()).arrival.reached);
  if(route==='direct'){await tick(await page.evaluate(async()=>(await import("./final-cut-arrival.js")).BOARD_READY*1000));const before=await read();assert(before.arrival.ready&&!before.arrival.requested);assert.equal(before.rig.phase,'waiting');await page.keyboard.press('Escape');await tick(500);assert.equal((await read()).seconds,before.seconds);await page.locator('#primary').click();await neutral();}
  if(overlookStart){await go(-2,2.5);await use(-3.5,4.1,'course-access');await face(Math.atan2(32,23.5));}else{await go(-2,17.3);await use(-3.5,17.3,'course-access');await face(Math.atan2(32,8.7));}await tick(4000);await shot(`${route}-deployment`);assert(!(await read()).arrival.open);if(overlookStart)await go(-2,17.3);
  // Actual input may press against the rail but cannot enter the first strip.
  await axes([-Math.sin((await read()).player.yaw),-Math.cos((await read()).player.yaw),0,0]);await tick(900);await neutral();assert((await read()).player.y<19.3);
  // Branch arrivals can request the round before Joe has finished boarding.
  // Bound the whole remaining sequence, including the accelerating pass,
  // instead of assuming every entry reaches this rail at the same clock time.
  const openingBudget=await page.evaluate(async()=>{const {BOARD_READY}=await import('./final-cut-arrival.js'),{CUT_DURATION}=await import('./final-cut-drive.js');return Math.max(0,BOARD_READY-__finalCut.run.arrival.age)+8+4+CUT_DURATION+1;});
  let openingWait=0;
  while(!(await read()).arrival.open&&openingWait<openingBudget){const held=await read();assert.equal(held.mode,'final_cut_playing');assert(held.player.y<19.3,'Player crossed the closed arrival rail');await tick(250);openingWait+=.25;}
  let state=await read();if(!state.arrival.open)fs.writeFileSync(out+'/'+route+'-gate-timeout.json',JSON.stringify(state,null,2));assert(state.arrival.open,`${route}: rail did not open; phase=${state.rig.phase}, age=${state.rig.age}, x=${state.rig.x}, boarding=${state.arrival.age}`);assert.equal(state.rig.phase,'pass');assert.equal(state.rig.lane,0);assert.equal(state.rig.direction,-1);assert(state.rig.x<-6);assert(state.broken.includes('hospitality-table'));openingWaits.push({route,budget:openingBudget,waited:openingWait,x:state.rig.x,phase:state.rig.phase});await shot(`${route}-pass-cleared`);await tick(800);await face(0);
  await cross(-2,33);await go(16,33);await go(16,38);await go(10,38);await go(8.5,38);await use(8,39,'pump');assert((await read()).pump);
  if(maintenance){await go(11.5,38.2);await use(11.5,36.5,'record');assert((await read()).loadLimit);await go(6.9,38.2);await face(0);await shot(`${route}-maintenance-diagram`);}
  await go(16,38);await go(15.6,42);
  if(crossings){
   await face(0);for(let k=0;k<400;k++){const j=(await read()).rig;if(j.phase==='announce'&&j.lane===1&&j.attack?.axis!=='y'&&j.age<.2)break;await tick(100);}
   assert.equal((await read()).rig.phase,'announce');assert.equal((await read()).rig.lane,1);
   // Observe the shortened warning when it occurs. The four-metre approach
   // now outlasts the cue, so verify its persisted event after entering cover.
   assert((await read()).crossings.middleWarning);await shot(`${route}-middle-cover-warning`);
   await go(16,46);await page.evaluate(()=>{pad.buttons[4].pressed=true;});await tick(17);assert((await read()).player.crouch);assert((await read()).crossings.middleAnnounced);
   await tick(100);await axes([0,1,0,0]);await tick(1200);await neutral();await page.evaluate(()=>{pad.buttons[4].pressed=false;});await tick(17);
   assert((await read()).player.y<43.3);for(let k=0;k<80&&!(await read()).cut.includes('rough-1-2');k++)await tick(200);
   assert((await read()).crossings.middleCut);await shot(`${route}-middle-cover-gone`);
  }
  if(tactics){await face(0);for(let k=0;k<400;k++){const j=(await read()).rig;if(j.phase==='announce'&&j.lane===1)break;await tick(250);}assert.equal((await read()).rig.lane,1);assert.equal((await read()).rig.phase,'announce');
   // A warning at the far headland does not guarantee an audible landing:
   // the bank attenuates the ball to24m. Wait for the committed machine to
   // approach our x before charging; keep the real input and hearing rules.
   let nearby=false;for(let k=0;k<600;k++){const s=await read(),j=s.rig,along=j.direction*(j.x-s.player.x);if(j.phase==='pass'&&j.lane===1&&j.attack?.axis!=='y'&&along>=-10&&along<=-7.5){nearby=true;break;}await tick(100);}assert(nearby,'No nearby committed middle pass for an audible shot');
   await page.evaluate(()=>{pad.buttons[2].pressed=true;});await tick(1250);assert((await read()).ballAim.active&&!(await read()).ballAim.blocked);await shot(`${route}-ball-aim`);await page.evaluate(()=>{pad.buttons[2].pressed=false;});await tick(17);assert.equal((await read()).stats.balls,1);assert.equal((await read()).rig.lane,1);
   const releaseState=await read();await tick(1200);const landed=await page.evaluate(()=>({state:JSON.parse(render_game_to_text()),lure:__finalCut.run.lure}));assert(landed.lure?.source==='golf ball'||landed.state.stats.ballRedirects===1,'The actual landing must be heard');ballEvidence.push({route,release:releaseState.rig,landing:landed.state.rig,ball:landed.state.worldBalls.at(-1),heard:true});for(let k=0;k<400&&!(await read()).stats.ballRedirects;k++)await tick(250);if(!(await read()).stats.ballRedirects)fs.writeFileSync(out+'/'+route+'-ball-timeout.json',JSON.stringify({release:releaseState,timeout:await read()},null,2));assert.equal((await read()).stats.ballRedirects,1);assert.equal((await read()).rig.lane,2);assert.equal((await read()).rig.evidence,'golf ball');await shot(`${route}-ball-selected`);
  }
  await cross(16,58);await face(Math.atan2(-5.4,.4));
  if(crossings){for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await shot(`${route}-fork-${width}`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}await page.setViewportSize({width:2560,height:1600});}
  const finalRoute=replaySeed===2||crossings&&route!=='direct'?'open':'bank',forkBall=crossings&&route==='drain';
  if(forkBall){
   const prior=await read();await go(12,60);await face(Math.atan2(4,-10));
   // Finish looking before waiting for the sound window. Turning afterwards
   // used up that window on the faster continuous passes.
   let audible=false;for(let k=0;k<720;k++){const s=await read();if(s.rig.phase==='pass'&&s.rig.lane>=1&&s.rig.attack?.axis!=='y'&&Math.abs(s.rig.x-12)<3){audible=true;break;}await tick(100);}assert(audible,'No audible nearby pass at fork');
   await page.evaluate(()=>{pad.buttons[2].pressed=true;});await tick(340);assert(!(await read()).ballAim.blocked);await shot(`${route}-fork-ball-aim`);
   await page.evaluate(()=>{pad.buttons[2].pressed=false;});await tick(17);assert.equal((await read()).stats.balls,prior.stats.balls+1);
   const releaseState=await read();await tick(800);const landing=await page.evaluate(()=>({state:JSON.parse(render_game_to_text()),lure:__finalCut.run.lure}));
   if(landing.lure?.source!=='golf ball'&&landing.state.stats.ballRedirects===prior.stats.ballRedirects)fs.writeFileSync(out+'/'+route+'-fork-unheard.json',JSON.stringify({release:releaseState,landing},null,2));
   assert(landing.lure?.source==='golf ball'||landing.state.stats.ballRedirects===prior.stats.ballRedirects+1,'Fork landing must actually be heard');
   ballEvidence.push({route,kind:'fork',release:releaseState.rig,landing:landing.state.rig,ball:landing.state.worldBalls.at(-1),heard:true});
   for(let k=0;k<400&&(await read()).stats.ballRedirects===prior.stats.ballRedirects;k++)await tick(250);
   assert.equal((await read()).stats.ballRedirects,prior.stats.ballRedirects+1);assert.equal((await read()).rig.lane,1);assert.equal((await read()).rig.evidence,'golf ball');await shot(`${route}-fork-ball-selected`);
  }
  const path=await page.evaluate(async name=>(await import('./final-cut-route-layout.js')).FINAL_ROUTES[name],finalRoute);
  for(const point of path){await cross(point.x,point.y);if(crossings)await shot(`${route}-path-${point.x}-${point.y}`);}
  let visualSelection=null;
  if(visualLure){
   await go(-5,74);await face(Math.PI/2);await shot(`${route}-visual-exposure`);
   for(let k=0;k<800;k++){const state=await read();assert.equal(state.mode,'final_cut_playing');if(state.rig.trapApproach&&state.rig.evidence==='observed player'){visualSelection={seconds:state.seconds,player:state.player,rig:state.rig};break;}await tick(200);}
   assert(visualSelection,'The visible player must earn the flooded-swale approach');assert.equal((await read()).stats.lures,0);assert.equal((await read()).stats.balls,0);await shot(`${route}-visual-selected`);
   if(route==='direct'){
    for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
     await page.setViewportSize({width,height});await shot(`${route}-visual-guidance-${width}`);
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     assert(await page.locator('#objective').evaluate(el=>el.scrollHeight<=el.clientHeight&&el.getBoundingClientRect().right<=innerWidth));
    }await page.setViewportSize({width:2560,height:1600});
   }
   await go(-5,82);await go(-8,85);
  }else{await go(-8,85);await go(-9.1,85);await use(-9.6,85,'bell');}
  await go(-16,86);await face(Math.atan2(24,-12));await shot(`${route}-lure`);
  for(let k=0;k<100&&!(await read()).won;k++)await tick(1500);state=await read();assert(state.won&&state.mode==='final_cut_aftermath');
  // Same input path in the safe coda. Only the assertion changes after victory.
  async function roadGo(x,y){for(let k=0;k<180;k++){const p=(await read()).player,dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);if(d<.035){await neutral();return;}const f=(dx*Math.sin(p.yaw)+dy*Math.cos(p.yaw))/d,s=(dx*Math.cos(p.yaw)-dy*Math.sin(p.yaw))/d;await axes([s,-f,0,0]);await tick(Math.min(350,d/3.84*1000));}throw Error('Road blocked');}
  await roadGo(-9,86);await roadGo(-8,86);await roadGo(0,92);await roadGo(0,105);await use(0,104,'road');state=await read();assert.equal(state.mode,'final_cut_complete');assert.equal(state.runFacts.captures,0);assert.deepEqual(state.stats.crossings,[0,1,2]);assert(state.mastery.includes(tactics||forkBall?'borrowed-attention':'read-the-wake'));await page.locator('#ending-image').evaluate(img=>img.decode());if(await page.locator('#final-cut-story').evaluate(d=>d.open)){await page.waitForFunction(()=>JSON.parse(render_game_to_text()).story.ready);await shot(`${route}-win-cutscene`);await page.locator('[data-story=next]').click();await page.waitForFunction(()=>JSON.parse(render_game_to_text()).story.ready);await shot(`${route}-road-cutscene`);await page.locator('[data-story=next]').click();}await shot(`${route}-completed`);
  if(visualLure){assert.equal(state.stats.lures,0);assert.equal(state.stats.balls,0);}
  runs.push({route,plan:state.cutPlan,finalRoute,seconds:state.runFacts.elapsed,captures:state.runFacts.captures,balls:state.stats.balls,ballRedirects:state.stats.ballRedirects,bellUses:state.stats.lures,visualSelection,mastery:state.mastery});await context.close();
 }
 checks.push(visualLure?`${runs.length} uninterrupted browser finales (${runs.map(r=>r.route).join('/')}) earn a sight-based swale approach, retreat and physical trap with no bell or ball use; no live-state placement or mutation`:replaySeed!==null?'Completed-result fixture unlocks actual plan selector; after Replay, an uninterrupted ordinary Gamepad API run earns every crossing, pump, bell, physical trap and road completion without live-state placement or mutation':`${runs.length} uninterrupted browser finales from real ${runs.map(r=>r.route).join('/')} spawns: Gamepad API movement/look/Use, course rail, three crossings, pump, bell, physical collapse, road and completion; no live-state placement or mutation`);
 if(tactics)checks.push('Each route uses real X hold/release to place a ball on the final strip; Joe keeps his middle pass committed, then selects the landed sound before the player completes the crossings and bell ending');
 if(crossings)checks.push(`${runs.length} real-input middle-cover retreats; tested final routes: ${[...new Set(runs.map(r=>r.finalRoute))].join('/')}; any drain run throws back to the middle strip from the fork before the final crossing; four-size fork checks${compact?', representative screenshots retained':''}`);
 if(overlookStart)checks.push('Each uninterrupted route requests the round with the new physical terrace control, watches from elevation and then descends to the rail');
 checks.push(`Four viewport sizes for each distinct entry; shared overlook, actual deployment, cleared-pass opening, lure and completion checks${compact?'; compact representative screenshots retained':'; full screenshots retained'}`);
 if(replaySeed!==null){assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,runs,openingWaits,shots,errors},null,2));console.log(JSON.stringify({passed:true,checks,runs,openingWaits,shots:shots.length,errors}));return;}
 // Separate explicit fixtures inspect the existing single actor during its
 // relocation and climb, including the frame before/after reparenting.
 const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));
 const poses=await p.evaluate(async()=>{const {BOARD_WALK,BOARD_TURN,BOARD_CLIMB,BOARD_READY}=await import('./final-cut-arrival.js'),start=BOARD_WALK+BOARD_TURN;return [['bay',0],['walk',BOARD_WALK/2],['board-low',start+BOARD_CLIMB*.3],['board-high',start+BOARD_CLIMB*.7],['seated',BOARD_READY]];});
 const samples=[];for(const [name,age]of poses){
  const state=await p.evaluate(async age=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({arrival:{age,reached:true}});r.mode='playing';Object.assign(r.player,{x:24,y:18,yaw:Math.atan2(r.arrival.joe.x-24,r.arrival.joe.y-18),pitch:-.05});__finalCut.run=r;await advanceTime(0);return JSON.parse(render_game_to_text());},age);assert.equal(state.graphics.joe.actors,1);assert.equal(state.graphics.joe.parent,name==='seated'?'rig':'world');assert(state.graphics.joe.handError<.05);samples.push({name,age,joe:state.graphics.joe});await p.screenshot({path:`${out}/joe-${name}.png`});shots.push('joe-'+name);
 }
 checks.push('Separate close-view fixtures confirm the one existing Joe actor walks, climbs and reparents into the cab; no second seated actor');
 // Atlas batching must leave the record collectible and scoreboard mutable.
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:11.5,y:35,yaw:0,pitch:.12});__finalCut.run=r;await advanceTime(0);});
 assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).action?.id,'record');
 await p.screenshot({path:`${out}/record-before.png`});shots.push('record-before');await p.keyboard.press('e');await p.evaluate(()=>advanceTime(17));
 assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).loadLimit);await p.screenshot({path:`${out}/record-collected.png`});shots.push('record-collected');
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:2});r.mode='aftermath';Object.assign(r.player,{x:12,y:82,yaw:0,pitch:-.4});__finalCut.run=r;await advanceTime(0);});
 await p.screenshot({path:`${out}/excellent-board.png`});shots.push('excellent-board');checks.push('Separate actual-Use record collection and completed-machine scoreboard captures verify mutable signs remain outside the static atlas');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,runs,openingWaits,ballEvidence,samples,shots,errors},null,2));console.log(JSON.stringify({passed:true,checks,runs,openingWaits,shots:shots.length,errors},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
