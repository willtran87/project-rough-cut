const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],out='output/under-green/build';fs.mkdirSync(out,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const ready=()=>page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
  const tick=ms=>page.evaluate(ms=>advanceTime(ms),ms);
  await page.goto('http://127.0.0.1:4187/under-green.html?test');await ready();
  await page.evaluate(()=>{localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:{interact:'KeyT',look_back:'KeyY'},volume:.23,reducedMotion:true,extension:'keep'}));localStorage.setItem('rough-cut.under-green-comfort.v1',JSON.stringify({reduced:false}));localStorage.setItem('rough-cut.back-nine.v1',JSON.stringify({version:1,checkpoint:2}));});
  await page.reload();await ready();await tick(0);assert((await read()).comfort.reduced);await page.click('#primary');
  async function place(v){await page.evaluate(async v=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(v.cp||1);r.mode='playing';Object.assign(r,v.run);Object.assign(r.player,{yaw:0},v.player);Object.assign(r.joe,v.joe||{phase:'absent'});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},v);}
  const {LEVER,SLUICE}=await page.evaluate(async()=>{const c=await import('./under-green-course.js');return {LEVER:c.LEVER,SLUICE:c.SLUICE};});
  await place({player:{x:LEVER.x-1.7,y:LEVER.y,yaw:Math.PI/2}});assert.match(await page.locator('#use').textContent(),/^T ·/);assert.match(await page.locator('#hint').textContent(),/Y rear/);
  await page.keyboard.press('e');await tick(17);assert(!(await read()).bypass);
  await page.keyboard.press('t');await tick(17);assert((await read()).bypass);assert.equal((await read()).checkpoint,2);
  await page.reload();await ready();await tick(0);assert((await read()).bypass);assert.equal((await read()).checkpoint,2);
  checks.push('Actual remapped T action and Y prompt; pump interaction records checkpoint 2 immediately');
  await place({run:{time:40,bypass:true,bypassAt:39},player:{x:-20,y:54,yaw:Math.PI}});
  assert.match(await page.locator('#water-phase').textContent(),/1\.0s TO SURGE/);await page.screenshot({path:out+'/truthful-warning-2560.png'});
  await place({run:{time:9},player:{x:0,y:48}});assert.match(await page.locator('#water-phase').textContent(),/^WAIT/);await page.screenshot({path:out+'/approach-advice-2560.png'});
  await place({cp:3,player:{x:SLUICE.x-5,y:SLUICE.y+1}});assert(await page.locator('#use').isHidden());
  await place({cp:3,player:{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI}});assert(await page.locator('#use').isVisible());await page.screenshot({path:out+'/console-reach-2560.png'});
  checks.push('Browser warning and approach advice agree with phase; console prompt requires actual reach');
  await page.keyboard.press('Escape');await page.locator('#comfort').evaluate(e=>e.open=true);
  assert.equal(await page.locator('#master-volume').inputValue(),'0.23');
  await page.locator('#master-volume').evaluate(e=>{e.value='.31';e.dispatchEvent(new Event('input'));});
  await page.uncheck('#reduced');
  const pref=await page.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')));assert.equal(pref.volume,.31);assert.equal(pref.reducedMotion,false);assert.equal(pref.extension,'keep');assert.equal(pref.keyboardBindings.interact,'KeyT');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.back-nine.v1')).checkpoint),2);
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await place({run:{time:9},player:{x:0,y:58}});await page.screenshot({path:`${out}/advice-${width}.png`});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  // Visit both current chapters, rather than only testing preference functions.
  await page.evaluate(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
  await page.goto('http://127.0.0.1:4187/back-nine.html');await ready();
  assert.equal(await page.locator('#chase-reduced').isChecked(),false);
  await page.locator('#chase-reduced').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change'));});
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')).volume),.31);
  await page.goto('http://127.0.0.1:4187/under-green.html?test');await ready();assert((await read()).comfort.reduced);
  checks.push('Campaign volume and reduced motion persist across both branches; local legacy override cannot disable global preference');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser-rules.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
