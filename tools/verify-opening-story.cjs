const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/level-one-opening';fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const software=process.argv.includes('--software');
  const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  const errors=[],results={software,slides:[],layouts:[]};
  try{
    const page=await browser.newPage({viewport:{width:2560,height:1600}}),requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.url().includes('/level-one-opening/'))requests.push(r.url().split('/').pop());});
    await page.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {',`  window.__openingTest={state,enterMenu,render,updateAudio,readAudio:()=>({motor:motorGain?.gain.value,wind:ambienceGain?.gain.value,hum:ambienceDroneGain?.gain.value,master:masterGain?.gain.value,mowerBus:mowerBusGain?.gain.value,ambienceBus:ambienceBusGain?.gain.value,context:audioContext?.state})};\n  window.advanceTime = (milliseconds) => {`)}));
    await page.goto('http://127.0.0.1:4187');
    await page.waitForFunction(()=>window.render_game_to_text);
    await page.locator('canvas').click();await page.keyboard.press('Space');
    await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode==='menu');
    await sleep(250);
    assert(requests.every(n=>n==='01-last-shift.webp'),'Only the first illustration is requested before Start');
    await page.keyboard.press('Enter');
    const waitSlide=async n=>page.waitForFunction(n=>{const s=JSON.parse(render_game_to_text()).openingStory;return s.active&&s.slide===n&&s.ready;},n,{timeout:20000});
    await waitSlide(1);
    const before=await page.evaluate(()=>({elapsed:__openingTest.state.hole.elapsed,player:JSON.stringify(__openingTest.state.player),joe:JSON.stringify(__openingTest.state.hole.joe),frames:RCScene3D.stats().frames}));
    await page.keyboard.press('ArrowRight');await waitSlide(2);await page.keyboard.press('ArrowLeft');await waitSlide(1);
    // Native focus stays within the modal; no arrow/space enters gameplay.
    await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.closest('#opening-story')!==null));
    await page.locator('#opening-story').focus();
    for(let n=1;n<=5;n++){
      await waitSlide(n);await sleep(750);
      const sample=await page.evaluate(()=>({story:JSON.parse(render_game_to_text()).openingStory,audio:__openingTest.readAudio(),image:{width:document.querySelector('.opening-image img').naturalWidth,height:document.querySelector('.opening-image img').naturalHeight},focused:document.activeElement.id}));
      assert(sample.story.retainedImages<=2);assert.equal(sample.image.width,1672);assert.equal(sample.image.height,941);
      if(n===5)assert(sample.audio.motor<.00001,'Final engine must fall silent');
      results.slides.push(sample);
      await page.screenshot({path:`${out}/${software?'software-':''}slide-${n}-2560.png`});
      if(n<5)await page.keyboard.press('ArrowRight');
    }
    const after=await page.evaluate(()=>({elapsed:__openingTest.state.hole.elapsed,player:JSON.stringify(__openingTest.state.player),joe:JSON.stringify(__openingTest.state.hole.joe),frames:RCScene3D.stats().frames}));
    assert.deepEqual(after,before,'World, Joe and renderer must remain frozen throughout the story');
    assert.equal(new Set(requests).size,5);
    // Actual mobile and ordinary desktop layouts keep controls and captions in view.
    for(const [width,height]of [[1280,720],[844,390],[390,844]]){
      await page.setViewportSize({width,height});await sleep(120);
      const layout=await page.evaluate(()=>{
        const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
        return {image:rect(document.querySelector('.opening-image')),caption:rect(document.querySelector('.opening-caption')),buttons:[...document.querySelectorAll('[data-opening]')].map(rect),scroll:document.querySelector('#opening-story').scrollHeight,client:document.querySelector('#opening-story').clientHeight};
      });
      assert(layout.image.height>=100);assert(layout.image.bottom<=layout.caption.y+1,'Art must not underlap captions');
      for(const r of layout.buttons){assert(r.x>=0&&r.y>=0&&r.right<=width+1&&r.bottom<=height+1,'Controls must fit screen');}
      results.layouts.push({width,height,...layout});await page.screenshot({path:`${out}/${software?'software-':''}slide-5-${width}.png`});
    }
    await page.setViewportSize({width:1280,height:720});await page.locator('#opening-story').focus();await page.keyboard.press('Enter');
    await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode==='first_hole',null,{timeout:90000});
    await page.waitForFunction(()=>!RCScene3D.isPreparing()&&document.querySelector('#night-order [data-brief-start]:not(:disabled)'),null,{timeout:120000});
    assert.equal(await page.evaluate(()=>__openingTest.state.hole.tutorialVisible),true,'Finishing story must not dismiss guide');
    await page.screenshot({path:`${out}/${software?'software-':''}guide.png`});
    await page.locator('[data-brief-start]').click();await page.keyboard.down('KeyW');await sleep(700);await page.keyboard.up('KeyW');
    assert.equal(await page.evaluate(()=>__openingTest.state.hole.tutorialVisible),false);
    assert(await page.evaluate(()=>__openingTest.state.hole.elapsed)>0);
    await page.screenshot({path:`${out}/${software?'software-':''}gameplay.png`});
    // Menu replay ignores saved skip; skip returns to guide with no held key.
    await page.evaluate(()=>{__openingTest.enterMenu();__openingTest.render();});
    for(let i=0;i<3;i++)await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await waitSlide(1);
    await page.locator('.opening-preference input').check();await page.keyboard.press('Escape');
    await page.waitForFunction(()=>__openingTest.state.mode==='first_hole'&&__openingTest.state.hole.tutorialVisible);
    assert.equal(await page.evaluate(()=>__openingTest.state.keys.size),0);
    // Start honours skip preference, replay always works. Force menu index only
    // to select the first item after replay retained the previous selection.
    await page.evaluate(()=>{__openingTest.enterMenu();__openingTest.state.menuIndex=0;__openingTest.render();});
    await page.keyboard.press('Enter');await page.waitForFunction(()=>__openingTest.state.mode==='first_hole');
    assert.equal(await page.locator('#opening-story').evaluate(e=>e.open),false);
    await page.evaluate(()=>{__openingTest.enterMenu();__openingTest.state.menuIndex=3;__openingTest.state.reducedMotion=true;__openingTest.render();});
    await page.keyboard.press('Enter');await waitSlide(1);
    const reduced=await page.evaluate(()=>({state:JSON.parse(render_game_to_text()).openingStory,animation:getComputedStyle(document.querySelector('.opening-image img')).animationName}));
    assert(reduced.state.reducedMotion);assert.equal(reduced.animation,'none');results.reduced=reduced;
    await page.screenshot({path:`${out}/${software?'software-':''}reduced.png`});
    await page.locator('[data-opening="skip"]').click();
    assert.equal(await page.evaluate(()=>__openingTest.state.hole.tutorialVisible),true);
    results.noWorldWorkDuringStory=true;results.completedToGuide=true;results.skipAndReplay=true;results.requests=requests;results.errors=errors;
    assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/verification${software?'-software':''}.json`,JSON.stringify(results,null,2));console.log('PASS: five slides, sound cutoff, frozen world, responsive layouts, guide handoff, skip/replay, reduced motion');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
