const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];
 try{
  const p=await browser.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/back-nine.html');
  const slide=n=>p.waitForFunction(n=>{if(!window.render_game_to_text)return false;const s=JSON.parse(render_game_to_text()).openingStory;return s.active&&s.ready&&s.slide===n;},n);
  await slide(1);await p.keyboard.press('KeyF');await p.waitForFunction(()=>!!document.fullscreenElement);await p.keyboard.press('KeyF');await p.waitForFunction(()=>!document.fullscreenElement);
  await p.evaluate(()=>{window.mockPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[mockPad]});});
  const press=async i=>{await p.evaluate(i=>mockPad.buttons[i]={pressed:true,value:1},i);await p.waitForTimeout(120);};
  const release=async()=>{await p.evaluate(()=>mockPad.buttons.forEach(b=>{b.pressed=false;b.value=0;}));await p.waitForTimeout(100);};
  await press(0);await slide(2);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).openingStory.slide),2);
  await release();await press(14);await slide(1);await release();await press(1);
  await p.waitForFunction(()=>JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.waitForTimeout(200);
  assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).mode),'back_nine_briefing');assert.match(await p.locator('#guide-controls').innerText(),/RT accelerates/);
  await release();await press(0);assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).mode),'back_nine_driving');await release();await press(9);await release();assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).mode),'back_nine_paused');
  await p.close();
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),t=await context.newPage();t.on('pageerror',e=>errors.push(e.message));
  await t.addInitScript(()=>localStorage.setItem('rough-cut.settings.v1',JSON.stringify({volume:0,subtitles:false})));
  // Test skipping a failed asset without a stuck loading state.
  await t.route('**/back-nine-opening/01-other-side.webp',r=>r.abort());
  await t.goto('http://127.0.0.1:4187/back-nine.html');await t.locator('.opening-retry').waitFor({state:'visible'});
  assert(await t.locator('.opening-sound').isHidden());assert.equal(await t.locator('#opening-story').getAttribute('data-reduced'),'true');
  await t.locator('[data-opening="skip"]').tap();await t.waitForFunction(()=>JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  assert.match(await t.locator('#guide-controls').innerText(),/Drive \/ Reverse/);assert.equal(await t.evaluate(()=>JSON.parse(render_game_to_text()).seconds),0);
  await t.locator('#primary').scrollIntoViewIfNeeded();await t.screenshot({path:'output/back-nine-opening/touch-guide-controls.png'});await t.locator('#primary').tap();
  assert.equal(await t.evaluate(()=>JSON.parse(render_game_to_text()).mode),'back_nine_driving');assert(await t.locator('#touch').isVisible());
  await t.screenshot({path:'output/back-nine-opening/touch-driving.png'});await context.close();
  assert.deepEqual(errors,[]);fs.writeFileSync('output/back-nine-opening/controls.json',JSON.stringify({passed:true,fullscreen:true,controllerNextBackSkip:true,heldInputSafe:true,controllerStartPause:true,touchGuide:true,touchStart:true,missingArtSkip:true,systemReducedMotion:true,subtitlesHidden:true,errors},null,2));console.log('PASS: controller, held-input protection, fullscreen, touch guide/start, missing-art skip, system reduced motion');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
