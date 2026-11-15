const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='output/pickup-key-20261113';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:{interact:'Enter',sprint:'ShiftRight'}})));
  await page.goto('http://127.0.0.1:4187/final-cut.html?test');
  await page.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const migration=await page.evaluate(async()=>{
   const {actionBindings}=await import('./control-profiles.js');
   return {partial:actionBindings('onFoot',{interact:'Enter'},0),custom:actionBindings('onFoot',{interact:'Enter',sprint:'ShiftRight'},0),occupied:actionBindings('onFoot',{interact:'Enter',focus:'KeyE'},0),explicit:actionBindings('onFoot',{interact:'Enter'},3)};
  });
  assert.equal(migration.partial.interact,'KeyE');assert.equal(migration.custom.interact,'KeyE');assert.equal(migration.custom.sprint,'ShiftRight');assert.equal(migration.occupied.focus,'KeyE');assert.equal(migration.occupied.interact,'Enter');assert.equal(migration.explicit.interact,'Enter');
  await page.locator('#primary').click();
  await page.evaluate(async()=>{
   const {createRun}=await import('./final-cut-sim.js');
   const r=createRun({ballCount:2,groundBalls:[{x:16,y:9}]});r.mode='playing';Object.assign(r.player,{x:16,y:8,yaw:0});__finalCut.run=r;advanceTime(0);
  });
  const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
  assert.equal((await read()).bindings.interact,'KeyE');assert.equal((await read()).bindings.sprint,'ShiftRight');
  assert.equal((await read()).action.id,'recover-ball');assert.match(await page.locator('#use').innerText(),/^E.*Recover golf ball/);
  await page.screenshot({path:out+'/before.png'});
  await page.keyboard.press('Enter');await page.evaluate(()=>advanceTime(17));assert.equal((await read()).balls,2);assert.equal((await read()).worldBalls.length,1);
  await page.keyboard.press('e');await page.evaluate(()=>advanceTime(17));assert.equal((await read()).balls,3);assert.equal((await read()).worldBalls.length,0);
  await page.screenshot({path:out+'/after.png'});
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,migration,checks:['Legacy partial Enter binding migrates to E','Unrelated custom sprint preserved','Explicit modern mappings and occupied E preserved','Live pickup prompt shows E','Enter does not collect; E collects the ball'],errors},null,2));console.log('PASS: saved-control migration, live E pickup, Enter inactive, matching prompt.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
