const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],out='output/under-green/presentation';fs.mkdirSync(out,{recursive:true});
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 async function place({x=0,y=57,yaw=0,time=3,cp=1,joe={phase:'absent'}}={}){await p.evaluate(async v=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(v.cp);r.mode='playing';r.time=v.time;r.elapsed=25;r.messageTime=0;Object.assign(r.player,{x:v.x,y:v.y,yaw:v.yaw});Object.assign(r.joe,v.joe);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},{x,y,yaw,time,cp,joe});}
 const shot=async name=>p.screenshot({path:`${out}/${name}.png`});
 const phases=[];
 for(const [phase,time]of [['low',9],['warning',1.4],['surge',3],['receding',8]]){
  await place({time});const state=await read();assert.equal(state.waters.find(w=>w.id==='spillway').phase,phase);phases.push({phase,graphics:state.graphics});await shot(`spillway-${phase}-2560`);
 }
 assert(phases.every(v=>v.graphics.water.jetsPerChannel.every(j=>j.count===8)));
 assert(phases.every(v=>v.graphics.water.solidStreams===0));
 assert(phases.find(v=>v.phase==='surge').graphics.water.activeSplashes>0);
 assert(phases.find(v=>v.phase==='surge').graphics.water.activeMist>0);
 assert(phases.every(v=>v.graphics.draws<300),'Static water fixtures should be batched');
 checks.push('All four water phases render from the authoritative state with eight nozzle spray paths per channel and batched fixtures');
 for(const [name,x,y,yaw]of [['roots',0,16,.4],['bunker',-30,62,-Math.PI/2],['pump',-22,39,-.8],['range',21,23,Math.PI/2],['keeper',12,2,Math.PI]]){await place({x,y,yaw,cp:2});await shot(`${name}-2560`);}
 for(const [width,height]of [[1280,720],[844,390],[390,844]]){
  await p.setViewportSize({width,height});await place();
  if(width!==1280){await p.dispatchEvent('#game','pointerdown',{pointerId:7,pointerType:'touch',clientX:width/2,clientY:height/2});await p.dispatchEvent('#game','pointerup',{pointerId:7,pointerType:'touch'});await p.evaluate(()=>advanceTime(0));}
  const layout=await p.evaluate(()=>{const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};return {water:rect('water-read'),caption:rect('caption'),objective:rect('objective-card'),touch:rect('touch'),width:innerWidth,height:innerHeight};});
  if(width!==1280){assert(layout.water.bottom<height*.3);assert(layout.caption.bottom<layout.touch.top);assert(await p.locator('#touch').isVisible());}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot(`spillway-surge-${width}`);phases.push({width,height,layout});
 }
 checks.push('Phone and landscape bank-state strip stays in the upper 30%; captions clear the actual touch controls');
 await p.setViewportSize({width:1280,height:720});await place({x:0,y:55,joe:{x:0,y:53.5,phase:'windup',age:.2}});
 await p.evaluate(()=>{__underGreen.run.message='Safe route recorded · checkpoint saved.';__underGreen.run.messageTime=4;advanceTime(0);});
 assert.equal(await p.locator('#caption').textContent(),'','Checkpoint and offscreen attack announcements stay out of the banner');
 await p.evaluate(()=>{__underGreen.run.player.yaw=Math.PI;advanceTime(0);});
 assert.equal(await p.locator('#caption').textContent(),'');assert.equal(await p.locator('#pursuit').textContent(),'');await shot('priority-1280');
 checks.push('Visible and offscreen attacks and checkpoint events do not narrate actions in the banner');
 for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){
  await p.setViewportSize({width,height});await place({x:0,y:54,yaw:Math.PI,time:0,joe:{x:0,y:56,phase:'windup',age:.1}});
  assert.equal(await p.locator('#caption').textContent(),'');await shot(`sound-led-${width}`);
 }
 await p.keyboard.press('Escape');await p.locator('#comfort summary').click();await p.locator('[data-campaign=soundCaptions]').check();await p.click('#primary');
 await place({x:0,y:54,yaw:Math.PI,time:0,joe:{x:0,y:56,phase:'windup',age:.1}});
 assert.match(await p.locator('#caption').textContent(),/Hedge-trimmer engine revs/);assert.doesNotMatch(await p.locator('#caption').textContent(),/Move sideways/);await shot('sound-descriptions-opt-in-390');
 await p.keyboard.press('Escape');await p.locator('[data-campaign=soundCaptions]').uncheck();await p.click('#primary');
 await p.setViewportSize({width:1280,height:720});
 checks.push('Sound descriptions remain opt-in, including urgent offscreen revs; default banner stays quiet at desktop and phone sizes');
 await p.evaluate(async()=>{const {NOTE}=await import('./under-green-layout.js');Object.assign(__underGreen.run.player,{x:NOTE.x,y:NOTE.y-1,yaw:0});Object.assign(__underGreen.run.joe,{phase:'search',x:-5.35,y:45.1});__underGreen.run.messageTime=0;advanceTime(0);});
 assert.equal((await read()).action?.id,'note');assert.equal(await p.locator('#caption').textContent(),'');await shot('record-before-1280');await p.keyboard.press('e');await p.evaluate(()=>advanceTime(17));assert((await read()).evidence);assert.equal(await p.locator('#caption').textContent(),'');await shot('record-after-1280');
 await p.keyboard.press('Escape');assert(await p.locator('#journal').isVisible());assert(await p.locator('#paused-objective').isVisible());
 await p.evaluate(()=>{__underGreen.run.mode='complete';__underGreen.run.finished=true;advanceTime(0);});assert.match(await p.locator('#result').textContent(),/saturated turf/);assert.doesNotMatch(await p.locator('#result').textContent(),/planned chapter/);
 await p.evaluate(()=>{__underGreen.run.mode='paused';advanceTime(0);});
 if(!await p.locator('#comfort').evaluate(e=>e.open))await p.locator('#comfort summary').click();await p.locator('#reduced').check();await p.click('#primary');
 for(const [time,danger]of [[3,true],[3.2,true],[9,false]]){
  await place({time});const state=await read();assert.equal(state.graphics.water.animationTime,0);
  assert.equal(state.graphics.water.jetsPerChannel.find(w=>w.id==='spillway').flowing,danger);
  assert.equal(await p.locator('#water-read').getAttribute('data-danger'),String(danger));
 }
 await shot('reduced-low-1280');checks.push('Reduced motion freezes water animation while actual pressure transitions still update jets and the hazard signal');
 checks.push('Record is reachable in its recess, retained in the journal and acknowledged in the chapter result');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,phases,errors},null,2));console.log(JSON.stringify({passed:true,checks,draws:phases.slice(0,4).map(v=>({phase:v.phase,draws:v.graphics.draws,drops:v.graphics.water.activeDrops})),errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
