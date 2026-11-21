// Player Brightness: shared campaign preference (80-160%, default 100%).
// Checks clamping/defaults in the store, then in each chapter that the default
// leaves the 3D view untouched, the slider changes it live, and the value
// persists across reload and into the other chapters. Needs the static server
// on 127.0.0.1:4187. Set BRIGHTNESS_SHOTS=<dir> to save Final Cut opening
// screenshots at 100% and 140%.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const fixture=require('./lib/campaign-fixture.cjs');
const BASE='http://127.0.0.1:4187',KEY='rough-cut.settings.v1';
const checks=[];

async function storeChecks(){
 const store=await import(pathToFileURL(path.join(__dirname,'../web/preference-store.js')).href);
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 assert.equal(store.campaignPreferences().brightness,1);
 for(const [stored,expected] of [[1.3,1.3],[5,1.6],[.1,.8],[-2,.8],['1.4',1],[null,1],[true,1],[NaN,1]]){
  store.writeRecord(KEY,{brightness:stored});assert.equal(store.campaignPreferences().brightness,expected,`stored ${stored}`);
 }
 globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.equal(store.campaignPreferences().brightness,1);
 delete globalThis.localStorage;
 checks.push('Store: default 1, clamps to 0.8-1.6, ignores malformed values and blocked storage');
}

const chapters=['back-nine','under-green','final-cut'];
async function open(page,chapter){
 await page.goto(`${BASE}/${chapter}.html?test`);
 await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
}
const view=page=>page.evaluate(()=>{const c=document.getElementById('game'),i=document.querySelector('[data-campaign=brightness]'),o=document.querySelector('[data-campaign-value=brightness]');
 let stored;try{stored=JSON.parse(localStorage.getItem('rough-cut.settings.v1')||'{}').brightness;}catch{}
 return {inline:c.style.filter,computed:getComputedStyle(c).filter,slider:i&&Number(i.value),label:o&&o.textContent,stored,hud:getComputedStyle(document.body).filter};});
const slide=(page,value)=>page.evaluate(v=>{const i=document.querySelector('[data-campaign=brightness]');i.value=String(v);i.dispatchEvent(new Event('input',{bubbles:true}));},value);

(async()=>{
 await storeChecks();
 const shots=process.env.BRIGHTNESS_SHOTS;if(shots)fs.mkdirSync(shots,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];
 try{
  for(const chapter of chapters){
   const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
   page.on('pageerror',e=>errors.push(`${chapter}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${chapter}: ${m.text()}`);});
   await fixture.unlockChapters(page);await fixture.skipStories(page);
   await open(page,chapter);
   let v=await view(page);
   assert.equal(v.inline,'',`${chapter} default inline filter`);assert.equal(v.computed,'none',`${chapter} default computed filter`);
   assert.equal(v.slider,1);assert.equal(v.label,'100%');assert.equal(v.stored,undefined,'default is not written');
   if(chapter==='final-cut'&&shots){await page.click('#primary');await page.evaluate(()=>advanceTime(0));await page.screenshot({path:path.join(shots,'final-cut-opening-100.png')});}
   await slide(page,1.4);v=await view(page);
   assert.equal(v.inline,'brightness(1.4)');assert.equal(v.label,'140%');assert.equal(v.stored,1.4);assert.equal(v.hud,'none','HUD/page is not filtered');
   if(chapter==='final-cut'&&shots){await page.evaluate(()=>advanceTime(0));await page.screenshot({path:path.join(shots,'final-cut-opening-140.png')});}
   await page.reload();await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
   v=await view(page);assert.equal(v.inline,'brightness(1.4)',`${chapter} after reload`);assert.equal(v.slider,1.4);assert.equal(v.label,'140%');
   // Carries into every other chapter, including Night Order.
   for(const other of chapters.filter(c=>c!==chapter)){await open(page,other);v=await view(page);assert.equal(v.inline,'brightness(1.4)',`${chapter} -> ${other}`);assert.equal(v.label,'140%');}
   await page.goto(`${BASE}/index.html`);await page.waitForFunction(()=>window.RCScene3D?.brightness&&window.render_game_to_text,null,{timeout:120000});
   assert.equal(await page.evaluate(()=>RCScene3D.brightness()),1.4,`${chapter} -> Night Order`);
   assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('game')).filter),'none','Night Order HUD canvas is not CSS-filtered');
   // Out-of-range stored values clamp; returning to 100% removes the filter.
   await page.evaluate(k=>{const r=JSON.parse(localStorage.getItem(k));r.brightness=9;localStorage.setItem(k,JSON.stringify(r));},KEY);
   await open(page,chapter);v=await view(page);assert.equal(v.inline,'brightness(1.6)');assert.equal(v.label,'160%');
   await slide(page,0);v=await view(page);assert.equal(v.inline,'brightness(0.8)');assert.equal(v.stored,.8);
   await slide(page,1);v=await view(page);assert.equal(v.inline,'');assert.equal(v.computed,'none');assert.equal(v.stored,1);
   checks.push(`${chapter}: default unfiltered, live slider, reload, carries to other chapters and Night Order, clamps`);
   await context.close();
  }
  // Night Order: canvas-drawn settings row drives the 3D scene pass only.
  const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(`night-order: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`night-order: ${m.text()}`);});
  await fixture.unlockChapters(page);await fixture.skipStories(page);
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'../web/game.js'),'utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__bright={state,applySliderSetting,resetSettingsCategory,selectSettingsCategory,settingDisplayValue,SETTINGS_ROWS,SETTINGS_CATEGORIES};\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto(`${BASE}/index.html`);await page.waitForFunction(()=>window.__bright&&window.RCScene3D?.brightness,null,{timeout:120000});
  let n=await page.evaluate(()=>{const t=__bright,row=t.SETTINGS_ROWS.find(r=>r.id==='brightness');return {row,state:t.state.brightness,scene:RCScene3D.brightness(),display:t.settingDisplayValue(row),category:t.SETTINGS_CATEGORIES.find(c=>c.ids.includes('brightness'))?.name};});
  assert.equal(n.row.label,'BRIGHTNESS');assert.equal(n.state,1);assert.equal(n.scene,1);assert.equal(n.display,'100%');assert.equal(n.category,'ATMOSPHERE');
  n=await page.evaluate(()=>{const t=__bright,row=t.SETTINGS_ROWS.find(r=>r.id==='brightness');t.applySliderSetting(row,1.4);const a={state:t.state.brightness,scene:RCScene3D.brightness(),display:t.settingDisplayValue(row),stored:JSON.parse(localStorage.getItem('rough-cut.settings.v1')).brightness};t.applySliderSetting(row,7);a.high=t.state.brightness;return a;});
  assert.equal(n.state,1.4);assert.equal(n.scene,1.4);assert.equal(n.display,'140%');assert.equal(n.stored,1.4);assert.equal(n.high,1.6);
  await page.unroute('**/game.js*');await open(page,'final-cut');assert.equal((await view(page)).inline,'brightness(1.6)','Night Order -> Final Cut');
  checks.push('Night Order: BRIGHTNESS row in Atmosphere, applies to the 3D scene pass only, persists and clamps');
  await context.close();
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
 console.log(JSON.stringify({passed:true,checks,shots:shots?['final-cut-opening-100.png','final-cut-opening-140.png'].map(f=>path.join(shots,f)):[]},null,1));
})().catch(e=>{console.error(e);process.exit(1);});
