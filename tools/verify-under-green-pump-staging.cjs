const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/under-green/pump-staging',errors=[],checks=[];fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  async function fixture(){return p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js'),{LEVER,WATERS,lineClear,solid}=await import('./under-green-course.js');
   const r=createRun(1);r.mode='playing';r.time=30;r.elapsed=30;r.messageTime=0;Object.assign(r.player,{x:LEVER.x-1.7,y:LEVER.y,yaw:Math.PI/2});Object.assign(r.joe,{x:-20,y:54,yaw:Math.PI,phase:'walk',last:{x:r.player.x,y:r.player.y}});
   __underGreen.run=r;__underGreen.clearInput();advanceTime(0);
   const targets=['bypass','return'].map(id=>WATERS.find(w=>w.id===id));return {operator:{...r.player},lines:__underGreen.inspectView(targets.map(w=>({...w,height:1.2}))),safe:!solid(r.player,.3)};
  });}
  const views=[];
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});const view=await fixture();assert(view.safe);assert(view.lines.every(l=>l.clear),JSON.stringify(view));assert(view.lines.find(l=>l.id==='bypass').inView);assert.equal((await read()).action.id,'bypass');
   let before=await read();assert.equal(before.graphics.pump.gauges.find(g=>g.id==='bypass').level,1);assert.equal(before.graphics.pump.gauges.find(g=>g.id==='return').level,.02);
   assert(await p.locator('#water-read').isHidden(),'An outlet outside the current view must not own the hazard card');assert.equal(await p.locator('#caption').innerText(),'','Optional pursuit text yields to the available interaction');
   await p.screenshot({path:`${out}/before-${width}.png`});await p.keyboard.press('e');await tick(200);const during=await read();
   assert(during.bypass);assert(during.graphics.pump.handle<0&&during.graphics.pump.handle>-1);assert.equal(during.waters.find(w=>w.id==='bypass').danger,false);
   assert.equal(during.graphics.pump.gauges.find(g=>g.id==='bypass').level,during.waters.find(w=>w.id==='bypass').level);
   const camera={yaw:during.player.yaw,pitch:during.player.pitch};assert.equal(camera.yaw,view.operator.yaw);assert.equal(camera.pitch,view.operator.pitch);
   await p.screenshot({path:`${out}/draining-${width}.png`});await tick(2000);let after=await read();assert(after.graphics.pump.latched);assert.equal(after.graphics.pump.gauges.find(g=>g.id==='return').level,1);
   await p.screenshot({path:`${out}/after-${width}.png`});
   // Turn freely toward the rear channel: no cutscene or mandatory camera turn.
   await p.evaluate(()=>{const r=__underGreen.run;r.player.yaw=Math.atan2(-20-r.player.x,49-r.player.y);advanceTime(0);});
   assert(!(await p.locator('#water-read').isHidden()));assert.equal(await p.locator('#water-name').innerText(),'BYPASS RETURN');
   await tick(600);await p.screenshot({path:`${out}/return-${width}.png`});const reaction=await read();views.push({width,height,...view,reaction:{joe:reaction.joe,draws:reaction.graphics.draws,gauges:reaction.graphics.pump.gauges}});
  }
  checks.push('Marked operator position has unobstructed rendered-geometry sightlines to the onward and return outlets, with distinct freely chosen views at four sizes');
  checks.push('Real Use changes physical water, live gauges, rotating handle and latch; free camera remains unchanged throughout activation');
  await fixture();await p.keyboard.press('e');await tick(200);const mid=await read();await p.keyboard.press('Escape');await tick(2000);assert.deepEqual((await read()).graphics.pump,mid.graphics.pump);await p.click('#primary');await tick(2000);
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.under-green.v1')));assert(saved.bypass);await p.reload();await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);
  const restored=await read();assert(restored.bypass&&restored.graphics.pump.latched);assert.equal(restored.audio.counts.pipeKnocks,0);assert.equal(restored.graphics.pump.gauges.find(g=>g.id==='return').level,1);
  checks.push('Pause freezes the mechanism; reload preserves the operated state without replaying the pressure sequence');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
