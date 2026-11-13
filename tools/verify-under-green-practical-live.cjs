const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/under-green/visual-upgrade/practicals/live';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4187/under-green.html?test');await page.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await page.click('#primary');await page.keyboard.press('Escape');
  for(const f of [{name:'gallery',x:0,y:12,yaw:0,elapsed:0},{name:'keeper-flood',x:12,y:23,yaw:Math.PI,elapsed:20}]){
   // Deliberately never call advanceTime: exercise ordinary requestAnimationFrame
   // and the real completed-frame resolution controller.
   await page.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=90;r.elapsed=f.elapsed;r.bypass=true;r.bypassAt=20;r.lessonCrossed=true;r.joe.phase='absent';Object.assign(r.player,f);__underGreen.run=r;__underGreen.clearInput();},f);
   await page.waitForTimeout(24000);if(f.name==='keeper-flood')await page.evaluate(()=>__underGreen.run.elapsed=48);const before=await page.evaluate(()=>JSON.parse(render_game_to_text()));const started=Date.now();await page.waitForTimeout(3000);const after=await page.evaluate(()=>JSON.parse(render_game_to_text()));
   assert(after.graphics.frames>before.graphics.frames+20);assert(after.graphics.budget.samples>20);assert.equal(after.mode,'under_green_playing');assert.equal(after.graphics.practicalLighting.sources,17);if(f.name==='keeper-flood')assert.equal(after.flood.depth,.38,'Timing sample must cover actual high flood');
   views.push({name:f.name,frames:after.graphics.frames-before.graphics.frames,intervalMs:Date.now()-started,resolution:after.graphics.resolution,budget:after.graphics.budget,completionAverage:after.graphics.completionAverage,completionP95:after.graphics.completionP95,flood:after.flood,seconds:after.seconds});
   await page.screenshot({path:`${out}/${f.name}.png`});console.log(JSON.stringify(views.at(-1)));
  }
  await page.keyboard.press('Escape');const paused=await page.evaluate(()=>JSON.parse(render_game_to_text()));await page.waitForTimeout(500);assert.equal((await page.evaluate(()=>JSON.parse(render_game_to_text()))).elapsed,paused.elapsed);
  const performanceAccepted=views.every(v=>v.frames/(v.intervalMs/1000)>=27&&v.completionP95<=38);assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,checkScope:'frame advancement and pause; performance acceptance reported separately',performanceAccepted,targetFps:30,views,errors},null,2));console.log(JSON.stringify({passed:true,performanceAccepted,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
