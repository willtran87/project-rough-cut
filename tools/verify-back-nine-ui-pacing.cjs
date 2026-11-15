const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2]||'output/back-nine-ui-pacing',index=process.argv.indexOf('--software-browser');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:index<0?undefined:process.argv[index+1],args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/back-nine.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine.js','utf8')
   .replace('function paintUI(){','function paintUI(){window.__paintCount=(window.__paintCount||0)+1;')
   .replace('function busy(){','function busy(){if(window.__holdFrame)return true;')}));
  await page.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  await page.goto('http://127.0.0.1:4187/back-nine.html?test');
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
  await page.click('#primary');
  await page.evaluate(()=>{__backNine.run.grace=100;});
  const start=await page.evaluate(()=>{window.__holdFrame=true;return{paint:__paintCount,state:JSON.parse(render_game_to_text())};});
  await page.keyboard.down('KeyW');await page.waitForTimeout(600);await page.keyboard.up('KeyW');
  const held=await page.evaluate(()=>({paint:__paintCount,state:JSON.parse(render_game_to_text())}));
  assert.equal(held.paint,start.paint,'Busy frames must not repaint the HUD');
  assert.equal(held.state.graphics.frames,start.state.graphics.frames,'Busy frames must not resubmit the world');
  assert(held.state.seconds>start.state.seconds+.25,'Simulation must continue during a presentation stall');
  assert(held.state.player.y>start.state.player.y,'Keyboard movement must continue during a presentation stall');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#title').textContent(),'Chase paused','Pause must paint immediately despite a busy GPU');
  assert(await page.locator('#panel').isVisible());
  const paused=await page.evaluate(()=>JSON.parse(render_game_to_text()));
  await page.waitForTimeout(200);
  assert.equal((await page.evaluate(()=>JSON.parse(render_game_to_text()))).seconds,paused.seconds);
  await page.evaluate(()=>{window.__holdFrame=false;});await page.click('#primary');
  await page.waitForFunction(n=>JSON.parse(render_game_to_text()).graphics.frames>n,held.state.graphics.frames,{timeout:30000});
  await page.evaluate(()=>advanceTime(17));
  assert.equal(await page.locator('#panel').isVisible(),false);
  assert.equal(await page.locator('#hud').evaluate(el=>el.hidden),false);
  assert.equal(await page.locator('#objective').isVisible(),true);
  for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>advanceTime(17));
   await page.screenshot({path:out+`/playing-${width}.jpg`,quality:94});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await page.keyboard.press('Escape');await page.click('#restart');await page.evaluate(()=>advanceTime(17));
  const end=await page.evaluate(()=>JSON.parse(render_game_to_text()));
  assert.equal(end.mode,'back_nine_briefing');assert.equal(end.checkpoint,0);assert.deepEqual(errors,[]);
  assert.match(end.graphics.gpu,/SwiftShader/);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,start,held,end,errors},null,2));
  console.log('PASS: HUD backpressure, responsive keyboard simulation, immediate pause, frozen pause, resume, restart and three viewport layouts.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
