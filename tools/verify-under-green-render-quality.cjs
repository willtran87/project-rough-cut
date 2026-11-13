const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),out='output/under-green/render-quality';fs.mkdirSync(out,{recursive:true});
 try{
  const context=await b.newContext({viewport:{width:2560,height:1600}}),p=await context.newPage(),errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=()=>p.evaluate(()=>advanceTime(0));
  const visit=async url=>{await p.goto('http://127.0.0.1:4187/'+url);await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick();};
  await visit('under-green.html');assert.equal((await read()).graphics.captureBuffer,false);
  await p.locator('#comfort summary').click();await p.locator('#scene-resolution').fill('0.75');await tick();assert.equal((await read()).comfort.resolution,.75);
  // An unrelated field added by another chapter must survive the next UI change.
  await p.evaluate(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({...JSON.parse(localStorage.getItem('rough-cut.spatial.v1')),extension:'keep',mouse:1.3})));
  await p.locator('#scene-resolution').fill('0.5');await tick();assert.deepEqual((await read()).graphics.resolution,[800,500]);
  const stored=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.spatial.v1')));assert.equal(stored.extension,'keep');assert.equal(stored.mouse,1.3);
  await visit('under-green.html?test');assert.equal((await read()).graphics.captureBuffer,true);assert.equal((await read()).comfort.resolution,.5);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await tick();await p.locator('#comfort summary').click();await p.locator('#scene-resolution').scrollIntoViewIfNeeded();
   const bounds=await p.locator('.resolution-setting').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width);
   await p.screenshot({path:`${out}/settings-${width}.png`});await p.click('#primary');
   await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(1);r.mode='playing';r.time=6;r.messageTime=0;Object.assign(r.player,{x:0,y:57,yaw:0});r.joe.phase='absent';__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
   const before=await read(),hudBefore=await p.locator('#water-read').boundingBox();assert.equal(before.graphics.resolutionScale,.5);
   await p.screenshot({path:`${out}/half-${width}.png`});await p.keyboard.press('Escape');
   if(!(await p.locator('#comfort').evaluate(e=>e.open)))await p.locator('#comfort summary').click();
   await p.locator('#scene-resolution').fill('1');await p.click('#primary');await tick();
   const after=await read(),hudAfter=await p.locator('#water-read').boundingBox();assert.equal(after.graphics.resolutionScale,1);
   assert.deepEqual(after.player,before.player);assert.deepEqual(hudAfter,hudBefore);assert.equal(after.seconds,before.seconds);
   assert(Math.abs(after.graphics.resolution[0]-before.graphics.resolution[0]*2)<=1);assert(Math.abs(after.graphics.resolution[1]-before.graphics.resolution[1]*2)<=1);
   await p.screenshot({path:`${out}/full-${width}.png`});views.push({width,height,half:before.graphics.resolution,full:after.graphics.resolution,hud: hudAfter});
   await p.keyboard.press('Escape');await p.locator('#scene-resolution').fill('0.5');await p.locator('#comfort summary').click();await tick();
  }
  await p.goto('http://127.0.0.1:4187/');await p.waitForFunction(()=>window.RCSpatialControls);assert.equal(await p.evaluate(()=>RCSpatialControls.get().resolution),.5);assert.equal(await p.locator('[data-spatial="resolution"]').inputValue(),'0.5');
  await p.evaluate(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({seen:true,skip:true})));
  await visit('back-nine.html?test');assert.deepEqual((await read()).graphics.resolution,[640,360]);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,checks:['normal framebuffer is not preserved; explicit test framebuffer is preserved','scene resolution persists across three playable chapters and preserves unrelated fields','four-size settings bounds, low/full quality gameplay, unchanged player/timing and native HUD geometry'],errors},null,2));
  console.log(JSON.stringify({passed:true,views,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
