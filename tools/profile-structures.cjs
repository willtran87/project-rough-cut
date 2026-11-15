const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[];
 try{for(const version of !process.argv.includes('--after-only')&&fs.existsSync('output/structures/scene-before.js')&&fs.existsSync('output/structures/pixel-world-before.js')?['before','after']:['after']){
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  if(version==='before')for(const [url,file] of [['scene-3d.js','scene-before.js'],['pixel-world-props.js','pixel-world-before.js']])await p.route('**/'+url+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/structures/'+file,'utf8')}));
  const source=fs.readFileSync('web/game.js','utf8');await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__perf&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__perf;t.resetFirstHole();const s=t.state;s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;Object.assign(s.hole,{tutorialVisible:false,controlHintTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.joe.x=100;s.hole.joe.y=100;t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:60000});
  for(const [name,x,y,yaw] of [['service',-89,202,-.65],['clubhouse',92,278,.60],['shed',-18,670,0]]){
   await p.evaluate(v=>{Object.assign(__perf.state.player,v);__perf.render();},{x,y,yaw});await p.waitForTimeout(500);
   const sample=await p.evaluate(()=>new Promise(resolve=>{const intervals=[];let start,last;function step(now){if(start===undefined)start=now;if(last!==undefined)intervals.push(now-last);last=now;__perf.render();if(now-start>=5000)resolve({intervals,stats:RCScene3D.stats()});else requestAnimationFrame(step);}requestAnimationFrame(step);}));
   const a=sample.intervals.sort((a,b)=>a-b),s=sample.stats,r={version,name,medianMs:a[Math.floor(a.length*.5)],p95Ms:a[Math.floor(a.length*.95)],maxMs:Math.max(...a),over50:a.filter(n=>n>50).length,triangles:s.triangles,drawCalls:s.drawCalls,gpu:s.gpu};results.push(r);console.log(JSON.stringify(r));
  }if(errors.length)throw Error(errors.join('\n'));await p.close();
 }}finally{await browser.close();}
 fs.writeFileSync('output/structures/performance.json',JSON.stringify({method:'Isolated 1280x720 five-second real RAF render samples at each building; identical cameras, simulation held. Before routes archived pre-change building modules. Includes new 2048 shadow map. Not sustained gameplay or physical mobile qualification.',results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
