/* Diagnostic fixtures only: repeatable render workloads, not input-earned play. */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const { chromium } = require(path.join(os.homedir(), '.codex/skills/develop-web-game/node_modules/playwright'));
let source = fs.readFileSync('web/game.js','utf8');
if(process.argv.includes('--software-cache')) source=source.replace('buffer.getContext("2d");\r\n    bufferContext.imageSmoothingEnabled','buffer.getContext("2d", { willReadFrequently: true });\r\n    bufferContext.imageSmoothingEnabled');
const out = path.resolve(process.argv[2] || 'output/a27/performance/baseline'); fs.mkdirSync(out,{recursive:true});
const names = ['drawCourseBackdrop','drawCourseObstacle','drawJoeOnCourse','drawFirstHoleOverlay','drawGroundFog','drawScreenTexture','cachedAtlasCell','drawMenu','drawPause'];
const injected = `
  const profilePhases = {};
  const slowDraws = [];
  ${process.argv.includes('--draw-calls') ? `const originalDrawImage=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){const start=performance.now();try{return originalDrawImage.call(this,image,...args);}finally{const ms=performance.now()-start;if(ms>8)slowDraws.push({ms,source:image.src||image.__profileSource||'canvas',dimensions:[image.width,image.height],args,stack:new Error().stack});}};` : ''}
  ${names.map(name=>`{const original=${name}; ${name}=function(...args){const start=performance.now();try{return original.apply(this,args);}finally{profilePhases.${name}=(profilePhases.${name}||0)+performance.now()-start;}};}`).join('\n')}
  {const original=cachedAtlasCell;cachedAtlasCell=function(image,cell){const result=original(image,cell);result.__profileSource=image.src;return result;};}
  window.__profile = {state,resetFirstHole,render,update,runtimePerformance,beginGameplayPerformanceWindow,profilePhases,slowDraws};
`;
const percentile=(a,q)=>[...a].sort((x,y)=>x-y)[Math.ceil(a.length*q)-1];
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[];
 try { for(let repeat=1;repeat<=(process.argv.includes('--once')?1:3);repeat++){
  const context=await browser.newContext({viewport:{width:1280,height:720}}), page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {',injected+'\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(window.render_game_to_text()).assets.course.ready,null,{timeout:60000});
  const cdp=await context.newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  for(const workload of ['cold-turn','maintenance-turn','chase-turn','menu','pause','retry']){
   const frames=await page.evaluate(async workload=>{
    const t=window.__profile;t.state.manualTime=true;t.resetFirstHole();t.state.mode='first_hole';t.state.transitionAlpha=0;
    t.state.player.x=0;t.state.player.y=workload==='maintenance-turn'?420:45;
    const h=t.state.hole;h.tutorialVisible=false;h.practiceDrill.active=false;h.controlHintTimer=0;h.zoneBannerTimer=0;h.joe.x=90;h.joe.y=680;h.joe.patrolPause=100;
    t.beginGameplayPerformanceWindow();const frames=[];
    for(let i=0;i<180;i++){
     for(const key in t.profilePhases)delete t.profilePhases[key];
     t.slowDraws.length=0;
     if(workload==='retry'&&i%30===0){t.resetFirstHole();t.state.hole.tutorialVisible=false;t.state.hole.practiceDrill.active=false;t.state.transitionAlpha=0;}
     if(workload==='chase-turn'){h.joe.x=t.state.player.x+18;h.joe.y=t.state.player.y+22;h.joe.mode='chase';h.detection=1;}
     t.state.mode=workload==='menu'?'menu':workload==='pause'?'paused':'first_hole';
     const start=performance.now();t.update(1/60);const updateMs=performance.now()-start;
     t.state.player.yaw=i*.035;t.render();
     frames.push({index:i,renderMs:t.runtimePerformance.lastRenderMs,updateMs,phases:{...t.profilePhases},slowDraws:[...t.slowDraws]});
     if(i%10===9)await new Promise(resolve=>setTimeout(resolve,0));
    }
    return frames;
   },workload);
   const times=frames.map(f=>f.renderMs), phases={}; for(const f of frames)for(const [k,v]of Object.entries(f.phases))phases[k]=(phases[k]||0)+v;
   const result={repeat,workload,averageMs:times.reduce((a,b)=>a+b,0)/times.length,p95Ms:percentile(times,.95),maximumMs:Math.max(...times),over50:frames.filter(f=>f.renderMs>50),phaseTotals:phases,frames};
   results.push(result);console.log(JSON.stringify({repeat,workload,averageMs:result.averageMs,p95Ms:result.p95Ms,maximumMs:result.maximumMs,over50:result.over50.length}));
   if(repeat===1)await page.screenshot({path:path.join(out,workload+'.png')});
  }
  const profile=await cdp.send('Profiler.stop');fs.writeFileSync(path.join(out,`cpu-${repeat}.json`),JSON.stringify(profile.profile));
  if(errors.length)throw Error(errors.join('\n'));await context.close();
 }}finally{await browser.close();}
 const report={sourceHash:crypto.createHash('sha256').update(source).digest('hex'),fixture:true,instrumented:true,results};
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
