const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/lesson';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],views=[];
  p.on('pageerror',e=>errors.push(e.message));
  const cdp=await p.context().newCDPSession(p);
  const ready=()=>p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await ready();await tick(0);await p.click('#primary');
  await p.keyboard.down('w');await tick(3800);await p.keyboard.up('w');
  const before=await p.evaluate(()=>structuredClone(__underGreen.run));assert(!before.lessonCrossed);assert.equal(before.waterHits,0);
  assert.equal(await p.locator('#water-read').getAttribute('data-lesson'),'true');
  await p.keyboard.down('w');await tick(1600);await p.keyboard.up('w');
  let s=await read();assert(s.lessonCrossed);assert.equal(s.waterHits,0);assert.equal(s.checkpoint,0);assert.equal(s.joe.phase,'absent');
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.under-green.v1')));assert(saved.lessonCrossed);assert.equal(saved.checkpoint,0);
  const after=await p.evaluate(()=>{__underGreen.run.player.yaw=Math.PI;advanceTime(0);return structuredClone(__underGreen.run);});
  assert.equal(await p.locator('#water-read').getAttribute('data-lesson'),'false');assert(await p.locator('#water-phase').isVisible());
  checks.push('Ordinary W movement clears the first crossing without waiting or a water hit; coaching retires and saves before checkpoint 1');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const [name,r]of [['before',before],['after',after]]){
    await p.evaluate(r=>{__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},r);
    if(width<900){
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:width*.65,y:height*.4}]});
     await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tick(0);assert(await p.locator('#touch').isVisible());
    }
    assert(await p.locator('#water-phase').isVisible());assert.equal(await p.locator('#water-read').getAttribute('data-lesson'),String(name==='before'));
    const bounds=await p.locator('#water-read').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
    assert(bounds.left>=0&&bounds.right<=width&&bounds.top>=0&&bounds.bottom<=height);
    await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/${name}-${width}.png`});views.push({width,height,name,bounds});
   }
  }
  checks.push('Before/after layouts preserve essential phase signals at four sizes, including touch-control composition');
  await p.setViewportSize({width:1280,height:720});await p.reload();await ready();await tick(0);s=await read();assert(s.lessonCrossed);assert.equal(s.checkpoint,0);assert.equal(s.message,'');
  await p.click('#primary');await p.keyboard.down('w');await tick(3800);await p.keyboard.up('w');assert.equal(await p.locator('#water-read').getAttribute('data-lesson'),'false');
  // Terminal fixtures exercise UI transitions; actual capture geometry has its own regression.
  await p.evaluate(()=>{Object.assign(__underGreen.run,{mode:'caught',bypass:true,evidence:true});advanceTime(0);});await p.click('#primary');await tick(0);
  s=await read();assert(s.lessonCrossed&&s.bypass&&s.evidence);assert.equal(s.message,'');
  await p.keyboard.press('Escape');await p.click('#restart');await tick(0);s=await read();assert(s.lessonCrossed&&s.evidence);assert(!s.bypass);assert.equal(s.message,'');
  await p.evaluate(()=>{Object.assign(__underGreen.run,{mode:'complete',finished:true,bypass:true});advanceTime(0);});await p.click('#primary');await tick(0);s=await read();assert(s.lessonCrossed);assert(!s.bypass);assert.equal(s.mode,'under_green_playing');
  checks.push('Reload and retry retain learned crossing; explicit restart and completion replay reset world progress while retaining coaching history');
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const {WATERS}=await import('./under-green-course.js');const w=WATERS.find(w=>w.lesson),r=createRun();r.mode='playing';r.time=(6.4-w.offset+12)%12;r.player.y=w.y-w.depth/2-.6;__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
  await p.keyboard.down('w');for(let i=0;i<30;i++){await tick(1000/60);s=await read();if(s.player.recovery)break;}await p.keyboard.up('w');assert(s.player.recovery);assert.equal(s.waterHits,1);assert(!s.lessonCrossed);assert.equal(s.joe.phase,'absent');assert.match(await p.locator('#caption').innerText(),/Wait for a full crossing window/);assert(!/Joe/.test(await p.locator('#caption').innerText()));
  checks.push('Protected missed crossing shows recovery advice without inventing an active Joe or retiring the lesson');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
