const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const baseline=process.argv.includes('--baseline'),out='output/final-cut-spatial-recovery',base='http://127.0.0.1:4187',key='rough-cut.spatial.v1';
const near=(a,b,label)=>assert(Math.abs(a-b)<1e-5,`${label}: ${a} != ${b}`);
(async()=>{
 fs.mkdirSync(out,{recursive:true});if(baseline)assert(!fs.existsSync(out+'/baseline.json'));
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],views=[],checks=[];
 try{
  const context=await b.newContext({viewport:{width:2560,height:1600}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   const key='rough-cut.spatial.v1';if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({resolution:1,controller:1,acceleration:false,extension:{keep:42}}));
   const set=Storage.prototype.setItem,get=Storage.prototype.getItem;window.rejectSpatial=false;window.rejectSpatialRead=false;
   Storage.prototype.setItem=function(k,v){if(k===key&&rejectSpatial)throw new DOMException('QA write rejection','QuotaExceededError');return set.call(this,k,v);};
   Storage.prototype.getItem=function(k){if(k===key&&rejectSpatialRead)throw new DOMException('QA read rejection','SecurityError');return get.call(this,k);};
  });
  const ready=()=>p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000}),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const control=name=>p.locator(`[data-spatial=${name}]`),status=p.locator('#spatial-settings-status');
  await p.goto(base+'/final-cut.html?test');await ready();await tick(0);await p.locator('#comfort summary').click();const before=await read();
  await p.evaluate(()=>rejectSpatial=true);await control('resolution').fill('0.75');await control('controller').fill('1.5');await control('acceleration').check();await tick(0);
  const storedDuring=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),session=await p.evaluate(()=>__finalCut.spatialStore.get());
  assert.equal(storedDuring.resolution,1);assert.equal(storedDuring.controller,1);assert.equal(storedDuring.acceleration,false);assert.equal(session.resolution,.75);assert.equal(session.controller,1.5);assert.equal(session.acceleration,true);
  const warning=await status.count()?await status.innerText():'';if(baseline)assert.equal(warning,'');else assert.match(warning,/session.*storage is unavailable/i);
  near((await read()).graphics.width/before.graphics.width,.75,'actual scene resolution');
  // A successful write in another preference group cannot hide this failure.
  await p.locator('[data-campaign=muted]').check();if(!baseline)assert.equal(await status.innerText(),warning);
  if(!baseline)for(const [width,height]of [[2560,1600],[1280,720]]){await p.setViewportSize({width,height});await status.scrollIntoViewIfNeeded();const bounds=await status.boundingBox();assert(bounds.y>=0&&bounds.y+bounds.height<=height);await p.screenshot({path:`${out}/warning-${width}.png`});views.push({width,height,bounds});}
  await p.locator('#primary').click();await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),r=createRun();r.mode='playing';Object.assign(r.player,{x:16,y:8,yaw:0});__finalCut.run=r;});await tick(0);
  await p.keyboard.down('w');await tick(1000/60);await p.keyboard.up('w');near((await read()).player.y-8,.0336,'unsaved easing applies');await tick(100);
  await p.evaluate(()=>{window.recoveryPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[recoveryPad];});await tick(1000/60);const yaw=(await read()).player.yaw;
  await p.evaluate(()=>recoveryPad.axes=[0,0,1,0]);await tick(100);near((await read()).player.yaw-yaw,2.2*.1*1.5,'unsaved sensitivity applies');await p.evaluate(()=>recoveryPad.axes=[0,0,0,0]);await tick(1000/60);await p.keyboard.press('Escape');
  checks.push('Failed writes leave storage unchanged but live resolution, easing and controller sensitivity work');
  // Peer writes a different field before recovery; pending fields must merge.
  const peer=await context.newPage();await peer.route('**/settings-peer',r=>r.fulfill({contentType:'text/html',body:'<title>Preference peer</title>'}));await peer.goto(base+'/settings-peer');await peer.evaluate(key=>{const r=JSON.parse(localStorage.getItem(key));r.fov=73;r.extension.peer=true;localStorage.setItem(key,JSON.stringify(r));},key);await peer.close();await p.bringToFront();
  await p.evaluate(()=>rejectSpatial=false);await control('touch').fill('1.25');const recovered=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(recovered.resolution,.75);assert.equal(recovered.controller,1.5);assert.equal(recovered.acceleration,true);assert.equal(recovered.fov,73);assert.deepEqual(recovered.extension,{keep:42,peer:true});if(!baseline)assert.equal(await status.innerText(),'');
  checks.push('Recovery flushes all pending spatial edits and preserves unrelated peer fields');
  if(!baseline){
   await p.reload();await ready();await tick(0);await p.locator('#comfort summary').click();assert(await control('acceleration').isChecked());assert.equal(await control('controller').inputValue(),'1.5');assert.equal(await control('fov').inputValue(),'73');
   await p.evaluate(()=>{rejectSpatial=true;rejectSpatialRead=true;});await control('mouse').fill('1.75');assert.match(await status.innerText(),/session/);assert.equal(await p.evaluate(()=>__finalCut.spatialStore.get().mouse),1.75);
   await p.evaluate(()=>{rejectSpatial=false;rejectSpatialRead=false;});await control('fov').fill('70');assert.equal(await status.innerText(),'');assert.equal(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).mouse,key),1.75);
   await p.goto(base+'/under-green.html?test');await ready();await tick(0);await p.locator('#comfort summary').click();assert.equal(await control('fov').inputValue(),'70');assert.equal(await control('mouse').inputValue(),'1.75');assert(await control('acceleration').isChecked());checks.push('Recovered edits survive reload and chapter navigation; unavailable reads retain usable session controls');
   for(const [width,height]of [[844,390],[390,844]]){
    const tc=await b.newContext({viewport:{width,height},hasTouch:true,isMobile:true}),t=await tc.newPage();t.on('pageerror',e=>errors.push(e.message));await t.goto(base+'/final-cut.html?test');await t.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await t.evaluate(()=>advanceTime(0));await t.locator('#comfort summary').tap();await t.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='rough-cut.spatial.v1')throw new DOMException('QA failure','QuotaExceededError');return set.call(this,k,v);};});await t.locator('[data-spatial=acceleration]').check();const s=t.locator('#spatial-settings-status');assert.match(await s.innerText(),/session/);await s.scrollIntoViewIfNeeded();const bounds=await s.boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width&&bounds.y>=0&&bounds.y+bounds.height<=height);await t.screenshot({path:`${out}/warning-touch-${width}.png`});views.push({width,height,touch:true,bounds});await tc.close();
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${baseline?'baseline':'verified'}.json`,JSON.stringify({baseline,warning,storedDuring,session,recovered,checks,views,errors},null,2));console.log(JSON.stringify({baseline,warning,checks,views:views.length,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
