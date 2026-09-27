/* Exercise real loading promises, decoder fallback and renderer reuse. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=path.resolve('output/a27/raster');fs.mkdirSync(out,{recursive:true});
 const source=fs.readFileSync('web/game.js','utf8'),browser=await chromium.launch({headless:true}),results=[];
 try{for(const scenario of ['prepared','unavailable','rejected']){
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(scenario=>{
   if(scenario==='unavailable')window.createImageBitmap=undefined;
   if(scenario==='rejected')window.createImageBitmap=()=>Promise.reject(new Error('decoder fixture'));
   if(scenario==='prepared'){const original=window.createImageBitmap;window.__rasterPending=0;window.__rasterCalls=0;window.createImageBitmap=async(...args)=>{window.__rasterPending++;window.__rasterCalls++;try{await new Promise(r=>setTimeout(r,25));return await original(...args);}finally{window.__rasterPending--;}};}
  },scenario);
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__raster={assetLoading,preparedImageSources,drawableImage,normalizeDisplayText,DISPLAY_TEXT_REPLACEMENTS,state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.keyboard.press('Enter');
  if(scenario==='prepared'){
   await page.waitForFunction(()=>window.__rasterPending>0);
   assert.equal(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).assets.course.ready),false);
  }
  await page.waitForFunction(()=>{const s=window.render_game_to_text&&JSON.parse(window.render_game_to_text());return s&&s.mode==='first_hole'&&s.assets.course.ready&&s.assets.results.ready;},null,{timeout:60000});
  const data=await page.evaluate(()=>{const t=window.__raster;
   const entries=t.assetLoading.entries.filter(e=>e.status==='loaded');
   const reused=entries.every(e=>t.drawableImage(e.image)===t.drawableImage(e.image));
   const dimensions=entries.every(e=>{const d=t.drawableImage(e.image);return d.width===e.image.naturalWidth&&d.height===e.image.naturalHeight;});
   const text=t.DISPLAY_TEXT_REPLACEMENTS.every(([from,to])=>t.normalizeDisplayText('USE '+from+' NOW')==='USE '+to+' NOW')&&t.normalizeDisplayText('ENTER: RING BELL')==='ENTER: RING BELL';
   t.resetFirstHole();t.state.mode='first_hole';t.state.manualTime=true;t.state.hole.tutorialVisible=false;t.state.transitionAlpha=0;t.render();
   return {reused,dimensions,text,prepared:entries.filter(e=>e.rasterPrepared).length,total:entries.length,pending:window.__rasterPending||0,calls:window.__rasterCalls||0,unsettled:t.assetLoading.entries.filter(e=>e.status==='loading').map(e=>({label:e.label,phase:e.phase}))};});
  assert(data.reused&&data.dimensions&&data.text);assert(data.unsettled.every(e=>e.phase!=='course'&&e.phase!=='results'),JSON.stringify(data));assert.equal(data.prepared,scenario==='prepared'?data.total:0);
  await page.screenshot({path:path.join(out,scenario+'.png')});assert.deepEqual(errors,[]);
  results.push({scenario,...data,errors});await page.close();
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({sourceHash:require('node:crypto').createHash('sha256').update(source).digest('hex'),passed:true,results},null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
