const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/no-checkpoints';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],checks=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const ready=async()=>{await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));};
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const fresh=s=>{assert.equal(s.player.x,0);assert.equal(s.player.y,5);assert.equal(s.player.yaw,0);assert.equal(s.elapsed,0);assert.equal(s.seconds,0);assert.equal(s.checkpoint,0);assert(!s.bypass&&!s.evidence&&!s.lessonCrossed&&!s.closing);assert.equal(s.gate,0);assert.equal(s.waterHits,0);assert.equal(s.joe.phase,'absent');assert.equal(s.joe.age,0);assert.equal(s.joe.evidence,'none');};
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await ready();
  for(const version of [1,2,3,4]){
   await p.evaluate(version=>{
    localStorage.setItem('rough-cut.under-green.v1',JSON.stringify({version,unlocked:true,checkpoint:3,bypass:true,evidence:true,lessonCrossed:true,bunkerRouteObserved:true,difficulty:'relentless',completed:false}));
    localStorage.setItem('rough-cut.back-nine.v1',JSON.stringify({sentinel:'sibling-progress'}));
   },version);
   await p.reload();await ready();fresh(await read());assert.equal(await p.locator('#primary').textContent(),'Enter the drain');assert.equal(await p.locator('#pressure').inputValue(),'relentless');
   const save=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.under-green.v1')));assert.equal(save.version,4);assert(!('checkpoint' in save));assert(!save.evidence);
  }
  checks.push('Legacy and current saves cannot restore checkpoints, pump, record or pursuit; pressure preference survives');
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  // Real movement through a former checkpoint boundary must not create one.
  await p.evaluate(()=>{const r=__underGreen.run;Object.assign(r.player,{x:-3.7,y:73,yaw:-Math.PI/2});r.time=24;r.messageTime=0;advanceTime(0);});
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(150));await p.keyboard.up('w');
  assert.equal((await read()).checkpoint,0);assert(!(await p.evaluate(()=>__underGreen.run.events)).some(e=>e.type==='checkpoint'));
  // A progressed defeat fixture exercises the actual retry button/handler.
  async function progressed(mode='caught'){
   await p.evaluate(mode=>{const r=__underGreen.run;Object.assign(r,{mode,checkpoint:3,bypass:true,bypassAt:40,evidence:true,lessonCrossed:true,bunkerRouteObserved:true,gate:.5,closing:false,waterHits:4,elapsed:80,time:80,saveSerial:r.saveSerial+1,finished:mode==='complete'});Object.assign(r.player,{x:12,y:3,yaw:Math.PI});Object.assign(r.joe,{phase:'sweep',age:.4,sawBunkerRoute:true,evidence:'sight'});advanceTime(0);},mode);
  }
  for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){
   await p.setViewportSize({width,height});await progressed();assert.equal(await p.locator('#primary').textContent(),'Retry from the start');
   assert.doesNotMatch(await p.locator('#retry-progress').textContent(),/stays open|is kept|checkpoint/);
   await p.screenshot({path:`${out}/caught-${width}.png`});
   await p.click('#primary');await p.evaluate(()=>advanceTime(0));fresh(await read());
   assert.equal(await p.locator('#caption').textContent(),'');assert(await p.locator('#record-status').isHidden());
   await p.screenshot({path:`${out}/fresh-${width}.png`});views.push({width,height});
  }
  checks.push('No checkpoint is awarded; actual retry clears full attempt state at desktop and phone sizes');
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('w');await p.keyboard.press('Escape');
  const paused=await read();await p.evaluate(()=>advanceTime(1000));assert.deepEqual((await read()).player,paused.player);assert.equal((await read()).seconds,paused.seconds);
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));assert.deepEqual((await read()).player,paused.player);
  await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(0));fresh(await read());
  await progressed('playing');await p.reload();await ready();fresh(await read());
  checks.push('Pause/resume retains the current attempt; manual restart and page reload reset to the entrance');
  await progressed('complete');const completion=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.under-green.v1')));assert(completion.completed&&completion.evidence);
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));fresh(await read());await p.reload();await ready();fresh(await read());
  const retained=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.under-green.v1')));assert(retained.completed&&retained.evidence);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.back-nine.v1')).sentinel),'sibling-progress');
  checks.push('Replay and completed-save reload start fresh while earned completion/evidence credit and sibling saves remain intact');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
