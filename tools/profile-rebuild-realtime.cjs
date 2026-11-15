const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
const percentile=(a,q)=>[...a].sort((a,b)=>a-b)[Math.min(a.length-1,Math.ceil(a.length*q)-1)];
(async()=>{const out=path.resolve('output/rebuild/realtime');fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true}),results=[];
try{for(const build of ['baseline','rebuilt']){
 const source=fs.readFileSync(build==='baseline'?'output/rebuild/baseline/game.js':'web/game.js','utf8'),context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__rt={state,resetFirstHole};\n  window.advanceTime = (milliseconds) => {')}));
 await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>window.__rt&&JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:60000});
 await page.evaluate(()=>{const t=__rt;t.resetFirstHole();t.state.mode='first_hole';t.state.transitionAlpha=0;t.state.hole.tutorialVisible=false;t.state.hole.practiceDrill.active=false;});await page.waitForTimeout(1200);
 for(const scene of ['turn','maintenance','chase','pause','retry']){
 await page.evaluate(scene=>{const t=__rt;t.resetFirstHole();const s=t.state,h=s.hole;s.mode=scene==='pause'?'paused':'first_hole';s.manualTime=false;s.transitionAlpha=0;h.tutorialVisible=false;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;s.player.y=scene==='maintenance'?420:45;h.joe.x=100;h.joe.y=700;h.joe.patrolPause=9999;window.__raf=[];window.__stop=false;let last=performance.now();function capture(now){const dt=now-last;last=now;if(__stop)return;__raf.push(dt);if(scene!=='pause')s.player.yaw+=dt*.0005;if(scene==='chase'){h.joe.x=s.player.x+18;h.joe.y=s.player.y+22;h.joe.mode='chase';h.detection=1;}requestAnimationFrame(capture);}requestAnimationFrame(capture);},scene);
 await page.waitForTimeout(2400);const frames=await page.evaluate(()=>{__stop=true;return __raf.slice(2);});const result={build,scene,samples:frames.length,medianMs:percentile(frames,.5),p95Ms:percentile(frames,.95),maxMs:Math.max(...frames),over50:frames.filter(n=>n>50).length};results.push(result);console.log(JSON.stringify(result));
 }
 if(errors.length)throw Error(errors.join('\n'));await context.close();
 }
 const report={sourceHash:require('node:crypto').createHash('sha256').update(fs.readFileSync('web/game.js')).digest('hex'),rendererHash:require('node:crypto').createHash('sha256').update(fs.readFileSync('web/course-renderer.js')).digest('hex'),platform:os.platform(),cpu:os.cpus()[0].model,browser:browser.version(),viewport:[1280,720],method:'Real requestAnimationFrame intervals, ordinary game loop; scripted turning and fixture positions; headless browser on shared host, not device certification',results};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
