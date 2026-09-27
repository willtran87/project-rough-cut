/* Browser network tests: cold loading and bounded transient/permanent failures. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=path.resolve(process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/a-grade-closure/loading');fs.mkdirSync(out,{recursive:true});
 const sourceHash=require('node:crypto').createHash('sha256').update(fs.readFileSync('web/game.js')).digest('hex');
 const visualOnly=process.argv.includes('--visual-only');
 const browser=await chromium.launch({headless:true}),results=[];
 try {for(const scenario of ['cold load','transient failure','permanent failure']) {
  const permanent=scenario==='permanent failure';
  const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  if(!visualOnly)await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1250000,uploadThroughput:125000,connectionType:'cellular4g'});
  let attempts=0;
  await page.route('**/rough-cut-shed-directions-v2.webp*',r=>{attempts++;return permanent||scenario==='transient failure'&&attempts===1?r.abort('failed'):r.continue();});
  const started=Date.now();await page.goto('http://127.0.0.1:4187', {waitUntil:'domcontentloaded'});
  await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>{const s=window.render_game_to_text&&JSON.parse(window.render_game_to_text());return s&&s.mode==='first_hole'&&s.assets.course.ready&&s.assets.results.ready;},null,{timeout:180000});
  const readyMs=Date.now()-started;
  const assets=await page.evaluate(()=>JSON.parse(window.render_game_to_text()).assets);
  assert.equal(attempts,permanent?3:scenario==='cold load'?1:2);assert.equal(assets.course.failed,permanent?1:0);assert.deepEqual(errors,[]);
  await page.evaluate(()=>window.advanceTime(1000/60));
  await page.screenshot({path:path.join(out,scenario.replaceAll(' ','-')+'.png')});
  results.push({scenario,attempts,readyMs,network:visualOnly?'unthrottled local visual recheck':{latencyMs:150,downloadMbps:10},assets,errors});
  await context.close();console.log(results.at(-1).scenario);
 }}finally{await browser.close();}
 const withinBudget=visualOnly||results[0].readyMs<=15000;
 assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync('web/game.js')).digest('hex'),sourceHash,'Source changed during loading qualification');
 fs.writeFileSync(path.join(out,visualOnly?'visual-verification.json':'verification.json'),JSON.stringify({sourceHash,passed:withinBudget,measurement:'first playable frame, including course/result preparation',coldStartBudgetMs:15000,results},null,2));
 assert(withinBudget,'Cold loading exceeds the 15-second qualification budget');
})().catch(e=>{console.error(e);process.exitCode=1;});
