const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/foliage-mower-performance';
const stats=a=>{a.sort((a,b)=>a-b);return {count:a.length,median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],over65:a.filter(x=>x>65).length};};
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
 try{for(const version of ['baseline','current','current','baseline']){
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__starts=[];});
  await p.route('**/back-nine.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(version==='baseline'?out+'/baseline/back-nine.js':'web/back-nine.js','utf8').replace('world.draw();frames++;','window.__starts.push(performance.now());world.draw();frames++;')}));
  await p.route('**/software-frame-budget.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/software-frame-budget.js','utf8').replace('scale:()=>scales[level]','scale:()=>.75')}));
  // Same expensive composition; only presentation scheduling is under test.
  await p.route('**/back-nine-sim.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-sim.js','utf8').replace('export function updateRun(run,input,dt){',"export function updateRun(run,input,dt){if(run.mode==='driving'){run.time+=dt;run.lookBack=true;return;}")}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  await p.click('#primary');await p.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js'),r=createRun(1);r.mode='driving';r.grace=999;r.time=10;r.lookBack=true;Object.assign(r.cart,{x:-29,y:443,yaw:-1.2,speed:8});Object.assign(r.joe,{x:-26,y:429,speed:12});__backNine.run=r;});
  await p.waitForTimeout(2500);await p.evaluate(()=>__starts=[]);await p.waitForTimeout(12000);
  const data=await p.evaluate(()=>({starts:__starts,graphics:JSON.parse(render_game_to_text()).graphics}));assert.deepEqual(data.graphics.resolution,[960,540]);assert.deepEqual(errors,[]);
  const intervals=data.starts.slice(1).map((t,i)=>t-data.starts[i]);results.push({version,intervals,stats:stats([...intervals]),graphics:data.graphics});console.log(version,results.at(-1).stats);
  if(version==='current'){
   await p.keyboard.press('Escape');await p.waitForTimeout(250);const before=await p.evaluate(()=>__starts.length);await p.waitForTimeout(350);assert.equal(await p.evaluate(()=>__starts.length),before,'paused presentation must stop');
   await p.click('#primary');await p.waitForTimeout(250);assert.ok(await p.evaluate(()=>__starts.length)>before,'resume must draw');
   await p.evaluate(()=>advanceTime(100));const manual=await p.evaluate(()=>__starts.length);await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>__starts.length),manual,'manual stepping must cancel wakes');
   await p.setViewportSize({width:2560,height:1600});await p.evaluate(()=>advanceTime(16.67));await p.screenshot({path:out+'/pacing-2560.png'});
  }
  await p.close();
 }
 const summary=Object.fromEntries(['baseline','current'].map(v=>[v,stats(results.filter(r=>r.version===v).flatMap(r=>r.intervals))]));fs.writeFileSync(out+'/pacing-comparison.json',JSON.stringify({summary,results},null,2));console.log(summary);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
