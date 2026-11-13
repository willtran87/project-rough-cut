const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const baseline=process.argv.includes('--baseline'),base='http://127.0.0.1:4187',key='rough-cut.settings.v1',out='output/campaign-settings/recovery/'+(baseline?'before':'after');
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const results=[],errors=[];
 for(const chapter of ['under-green','back-nine','final-cut']){
  const context=await b.newContext({viewport:{width:2560,height:1600}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   const key='rough-cut.settings.v1';if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({volume:.72,muted:false,reducedMotion:false,subtitleSize:1,extension:{keep:42}}));
   localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({seen:true,skip:true}));
   const set=Storage.prototype.setItem;window.__rejectCampaign=false;
   Storage.prototype.setItem=function(k,v){if(k===key&&window.__rejectCampaign)throw new DOMException('Temporary test storage failure','QuotaExceededError');return set.call(this,k,v);};
  });
  const ready=()=>p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const visit=async chapter=>{await p.goto(`${base}/${chapter}.html?test`);await ready();await p.evaluate(()=>advanceTime(0));await p.locator(`#${chapter==='back-nine'?'chase-comfort':'comfort'} summary`).click();};
  const control=name=>p.locator(`[data-campaign="${name}"]`),status=p.locator('[data-settings-status]');
  await visit(chapter);await p.evaluate(()=>{window.__rejectCampaign=true;});
  await control('volume').fill('0.25');await control('subtitleSize').fill('1.4');await control('reducedMotion').check();
  assert.match(await status.innerText(),/session.*storage is unavailable/i);
  const during=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(during.volume,.72);assert.equal(await control('volume').inputValue(),'0.25');assert(await control('reducedMotion').isChecked());
  const views=[];
  for(const [width,height]of baseline?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await status.scrollIntoViewIfNeeded();const rect=await status.boundingBox();assert(rect.x>=0&&rect.x+rect.width<=width&&rect.y>=0&&rect.y+rect.height<=height);await p.screenshot({path:`${out}/${chapter}-${width}.png`});views.push({width,height,rect});
  }
  // A separate same-origin tab changes an unrelated field while this panel has
  // failed writes pending. Recovery must merge into its latest stored record.
  const peer=await context.newPage();await peer.route('**/settings-peer',r=>r.fulfill({contentType:'text/html',body:'<title>Settings peer fixture</title>'}));await peer.goto(base+'/settings-peer');
  await peer.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.ambienceVolume=.35;s.extension={keep:42,peer:true};localStorage.setItem(key,JSON.stringify(s));},key);await peer.close();
  await p.evaluate(()=>{window.__rejectCampaign=false;});await control('muted').check();assert.equal(await status.innerText(),'');
  const saved=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(saved.muted,true);assert.equal(saved.ambienceVolume,.35);assert.deepEqual(saved.extension,{keep:42,peer:true});
  if(baseline){assert.equal(saved.volume,.72);assert.equal(saved.subtitleSize,1);assert.equal(saved.reducedMotion,false);}
  else{
   assert.equal(saved.volume,.25);assert.equal(saved.subtitleSize,1.4);assert.equal(saved.reducedMotion,true);
   // Once a pending edit is saved, it must not be replayed over a newer value
   // from another tab on the panel's next unrelated change.
   const later=await context.newPage();await later.route('**/settings-peer',r=>r.fulfill({contentType:'text/html',body:'<title>Later settings peer fixture</title>'}));await later.goto(base+'/settings-peer');
   await later.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.volume=.6;localStorage.setItem(key,JSON.stringify(s));},key);await later.close();await control('effectsVolume').fill('0.45');
   assert.equal(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).volume,key),.6);
   await p.reload();await ready();await p.evaluate(()=>advanceTime(0));await p.locator(`#${chapter==='back-nine'?'chase-comfort':'comfort'} summary`).click();
   for(const [name,value]of [['volume','0.6'],['subtitleSize','1.4'],['ambienceVolume','0.35'],['effectsVolume','0.45']])assert.equal(await control(name).inputValue(),value);
   assert(await control('reducedMotion').isChecked());assert(await control('muted').isChecked());
   const next={'under-green':'back-nine','back-nine':'final-cut','final-cut':'under-green'}[chapter];await visit(next);assert.equal(await control('volume').inputValue(),'0.6');assert.equal(await control('subtitleSize').inputValue(),'1.4');assert(await control('reducedMotion').isChecked());assert(await control('muted').isChecked());
  }
  results.push({chapter,during,saved,views});await context.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,baseline,meaning:baseline?'Reproduced loss of earlier failed writes in all three shared DOM consumers':'Pending edits survive recovery, reload and chapter transition; unrelated peer edits survive',results,errors},null,2));console.log(JSON.stringify({passed:true,baseline,chapters:results.map(r=>r.chapter),errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
