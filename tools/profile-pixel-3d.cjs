const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
const pct=(a,q)=>[...a].sort((a,b)=>a-b)[Math.min(a.length-1,Math.ceil(a.length*q)-1)];
(async()=>{
  const out=path.resolve('output/pixel-3d/performance');fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[];
  try{for(const art of ['illustrated','pixel-3d']){
    const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],source=fs.readFileSync('web/game.js','utf8');
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__rt={state,resetFirstHole};\n  window.advanceTime = (milliseconds) => {')}));
    await page.goto('http://127.0.0.1:4187/?art='+art);await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>window.__rt&&JSON.parse(render_game_to_text()).assets.course.ready);
    for(const y of [45,420,580]){
      await page.evaluate(y=>{const {state:s,resetFirstHole}=__rt;resetFirstHole();s.mode='first_hole';s.manualTime=false;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.controlHintTimer=0;s.hole.zoneBannerTimer=0;s.player.y=y;s.player.x=0;s.hole.joe.x=100;s.hole.joe.y=700;s.hole.joe.patrolPause=9999;},y);
      await page.waitForTimeout(1000);await page.waitForFunction(()=>RCScene3D.stats().pixelArt.pending===0);
      await page.evaluate(()=>{window.__samples=[];window.__stop=false;let previous=null;function tick(now){if(__stop)return;if(previous!==null)__samples.push(now-previous);previous=now;const h=__rt.state.hole;h.joe.x=100;h.joe.y=700;h.joe.patrolPause=9999;h.joe.mode='patrol';h.detection=0;requestAnimationFrame(tick);}requestAnimationFrame(tick);window.__turn=setInterval(()=>document.querySelector('canvas').dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',buttons:1,movementX:12})),80);});
      await page.waitForTimeout(5000);
      const s=await page.evaluate(()=>{__stop=true;clearInterval(__turn);return {frames:__samples,mode:__rt.state.mode,stats:RCScene3D.stats()};});
      if(s.mode!=='first_hole'||!s.frames.length)throw Error('Invalid benchmark state: '+s.mode);
      const r={art,courseY:y,samples:s.frames.length,medianMs:pct(s.frames,.5),p95Ms:pct(s.frames,.95),p99Ms:pct(s.frames,.99),over50:s.frames.filter(n=>n>50).length,gpu:s.stats.gpu,drawCalls:s.stats.drawCalls,triangles:s.stats.triangles};results.push(r);console.log(JSON.stringify(r));
    }
    if(errors.length)throw Error(errors.join('\n'));await page.close();
  }
  const hashes=Object.fromEntries(['web/game.js','web/scene-3d.js','web/pixel-world-props.js'].map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({method:'Five-second unrecorded samples of real requestAnimationFrame intervals at three held course positions per art treatment; ordinary game loop and DOM pointer turns. D3D11 requested; actual GPU recorded. A short comparison, not sustained qualification or physical input latency.',browser:browser.version(),viewport:[1280,720],hashes,results},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
