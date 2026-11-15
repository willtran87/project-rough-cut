const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.render_game_to_text);
  await page.locator('canvas').click();await page.keyboard.press('Space');await page.keyboard.press('Enter');
  const wait=async n=>page.waitForFunction(n=>{const s=JSON.parse(render_game_to_text()).openingStory;return s.active&&s.ready&&s.slide===n;},n);
  await wait(1);await page.keyboard.press('KeyF');await page.waitForFunction(()=>Boolean(document.fullscreenElement));
  assert.equal(await page.locator('#opening-story').evaluate(e=>e.open),true);
  await page.keyboard.press('KeyF');await page.waitForFunction(()=>!document.fullscreenElement);
  await page.evaluate(()=>{window.mockPad={connected:true,id:'Opening test controller',index:0,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.mockPad]});});
  const press=async index=>{await page.evaluate(i=>{mockPad.buttons[i]={pressed:true,value:1};},index);await page.waitForTimeout(120);};
  const release=async()=>{await page.evaluate(()=>mockPad.buttons.forEach(b=>{b.pressed=false;b.value=0;}));await page.waitForTimeout(100);};
  await press(0);await wait(2);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>JSON.parse(render_game_to_text()).openingStory.slide),2,'Held A cannot repeat');
  await release();await press(14);await wait(1);await release();await press(1);
  await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode==='first_hole',null,{timeout:90000});
  await page.waitForFunction(()=>!RCScene3D.isPreparing(),null,{timeout:120000});
  assert.equal(await page.locator('#night-order').isVisible(),true,'Held B must not dismiss the guide');
  await release();assert.deepEqual(errors,[]);
  fs.writeFileSync('output/level-one-opening/controller-verification.json',JSON.stringify({passed:true,fullscreenRoundTrip:true,gamepadNextBackSkip:true,noHeldButtonLeak:true,errors},null,2));
  console.log('PASS: fullscreen round trip, controller Next/Back/Skip and held-input guide protection');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
