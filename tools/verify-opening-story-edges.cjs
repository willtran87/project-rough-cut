const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],out='output/level-one-opening';
 try{
  const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    localStorage.setItem('rough-cut.settings.v1',JSON.stringify({volume:0,ambienceVolume:.3,mowerVolume:.4,subtitles:false,reducedMotion:true}));
    // Exercise a browser that denies only the new intro preference storage.
    const write=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='rough-cut.opening-story.v1')throw new DOMException('Blocked','SecurityError');return write.call(this,k,v);};
  });
  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {',`  window.__edge={state,enterMenu,render,audio:()=>({master:masterGain?.gain.value,mower:mowerBusGain?.gain.value,ambience:ambienceBusGain?.gain.value})};\n  window.advanceTime = (milliseconds) => {`)}));
  let unblockCourse;const blockedCourse=new Promise(r=>unblockCourse=r);
  await page.route('**/rough-cut-field-kit-v1.webp',async r=>{await blockedCourse;await r.continue();});
  let failArt=true;
  await page.route('**/level-one-opening/01-last-shift.webp',r=>failArt?r.abort():r.continue());
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__edge);
  await page.locator('canvas').tap();await page.keyboard.press('Space');await page.keyboard.press('Enter');
  await page.locator('.opening-retry').waitFor({state:'visible'});
  assert.equal(await page.locator('.opening-sound').isVisible(),false);
  const audio=await page.evaluate(()=>__edge.audio());assert.equal(audio.master,0);assert(Math.abs(audio.mower-.4)<.001);assert(Math.abs(audio.ambience-.3)<.001);
  assert.equal(await page.locator('.opening-mist').evaluate(e=>getComputedStyle(e).animationName),'none');
  // Retry works, and skipping remains available during either art or course loading.
  failArt=false;await page.locator('.opening-retry').tap();await page.waitForFunction(()=>JSON.parse(render_game_to_text()).openingStory.ready);
  await page.locator('.opening-preference input').check();
  await page.locator('[data-opening="skip"]').tap();
  assert.equal(await page.evaluate(()=>__edge.state.pendingCourseStart),true);
  assert.equal(await page.locator('#opening-story').evaluate(e=>e.open),false);
  unblockCourse();
  await page.waitForFunction(()=>__edge.state.mode==='first_hole',null,{timeout:90000});
  await page.waitForFunction(()=>!RCScene3D.isPreparing(),null,{timeout:120000});
  assert.equal(await page.evaluate(()=>__edge.state.hole.tutorialVisible),true);
  assert.equal(await page.locator('#opening-story').evaluate(e=>e.open),false,'Asset settlement must never reopen a skipped prologue');
  assert.equal(await page.evaluate(()=>JSON.parse(render_game_to_text()).openingStory.retainedImages),0);
  await page.locator('[data-brief-start]').tap();
  assert.equal(await page.evaluate(()=>__edge.state.inputMethod),'touch');
  assert.equal(await page.evaluate(()=>__edge.state.hole.tutorialVisible),false);
  // Hold one illustration in flight, skip it, then let it settle: it must not
  // resurrect art, steal focus or advance the already-visible guide.
  let releaseImage;const imagePending=new Promise(r=>releaseImage=r);
  await page.unroute('**/level-one-opening/01-last-shift.webp');
  await page.route('**/level-one-opening/01-last-shift.webp',async r=>{await imagePending;await r.continue();});
  await page.evaluate(()=>{__edge.enterMenu();__edge.state.menuIndex=3;__edge.render();});
  await page.keyboard.press('Enter');await page.locator('[data-opening="skip"]').tap();
  releaseImage();await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>__edge.state.mode),'first_hole');assert.equal(await page.evaluate(()=>__edge.state.hole.tutorialVisible),true);
  assert.equal(await page.locator('.opening-image img').count(),0);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/edge-verification.json',JSON.stringify({passed:true,failedImageRetry:true,skipDuringLoading:true,lateDecodeHarmless:true,storageBlocked:true,systemReducedMotion:true,savedAudio:audio,subtitlesOff:true,touchHandoff:true,errors},null,2));
  console.log('PASS: image failure/retry, skip during slow loads, late decode, denied storage, audio settings, touch and system reduced motion');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
