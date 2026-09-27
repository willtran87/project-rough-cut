const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const snapshots=process.argv.includes('--snapshots');
 const out=path.resolve(process.env.ROUGH_CUT_QA_OUT || (snapshots?'output/a-grade-closure/soak-investigation':'output/a-grade-closure/soak'));fs.mkdirSync(out,{recursive:true});
 const source=fs.readFileSync('web/game.js','utf8'),browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],samples=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {',
  '  window.__soak={state,resetFirstHole,startEncounterRehearsal,enterMenu,atlasCellCache,horrorOverlayCache,mowerWakeStampCache,assetLoading,preparedImageSources};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(window.render_game_to_text()).assets.course.ready);
  const cdp=await page.context().newCDPSession(page);
  for(let run=1;run<=200;run++){
   await page.evaluate(()=>{const t=window.__soak,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.joe.x=100;s.hole.joe.y=650;s.hole.joe.patrolPause=1000;});
   await page.keyboard.down('w');await page.evaluate(()=>window.advanceTime(200));await page.keyboard.up('w');
   await page.keyboard.down('Space');await page.evaluate(()=>window.advanceTime(300));await page.keyboard.up('Space');await page.evaluate(()=>window.advanceTime(750));
   await page.evaluate(()=>{const t=window.__soak,h=t.state.hole;h.rehearsalCheckpoint={x:0,y:100,yaw:0,elapsed:20,joe:{x:100,y:400},checks:['audit-bell'],key:true,drain:false,balls:3};t.startEncounterRehearsal();window.advanceTime(167);t.enterMenu();});
   if(run%40===0){await cdp.send('HeapProfiler.collectGarbage');const sample={run,...await cdp.send('Runtime.getHeapUsage'),...await cdp.send('Memory.getDOMCounters'),
    caches:await page.evaluate(()=>{const t=window.__soak,rasters=t.assetLoading.entries.filter(e=>e.rasterPrepared);return {atlas:t.atlasCellCache.size,horror:t.horrorOverlayCache.size,wake:t.mowerWakeStampCache.size,rasters:rasters.length,rasterPixelBytes:rasters.reduce((sum,e)=>sum+e.image.naturalWidth*e.image.naturalHeight*4,0)};})};samples.push(sample);console.log(JSON.stringify(sample));
    if(snapshots&&[40,200].includes(run)){const chunks=[],collect=event=>chunks.push(event.chunk);cdp.on('HeapProfiler.addHeapSnapshotChunk',collect);await cdp.send('HeapProfiler.takeHeapSnapshot');cdp.off('HeapProfiler.addHeapSnapshotChunk',collect);fs.writeFileSync(path.join(out,`heap-${run}.json`),chunks.join(''));}
   }
  }
  const late=samples.slice(-3),spread=Math.max(...late.map(s=>s.usedSize))-Math.min(...late.map(s=>s.usedSize));
  assert(spread<500000,JSON.stringify(samples));assert(late.every(s=>s.nodes===late[0].nodes&&s.jsEventListeners===late[0].jsEventListeners&&JSON.stringify(s.caches)===JSON.stringify(late[0].caches)));
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({sourceHash:require('node:crypto').createHash('sha256').update(source).digest('hex'),passed:true,samples,lateSpreadBytes:spread,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
