const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/chase-audio-mix';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],geometry=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__mixTest={state,render,SETTINGS_ROWS,settingsRowGeometry};\n  window.advanceTime = (milliseconds) => {')}));
  const values={ambienceVolume:.2,mowerVolume:.35,effectsVolume:.5,dangerVolume:.65};
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=()=>p.evaluate(()=>advanceTime(0));
  const control=key=>p.locator(`[data-campaign="${key}"]`);
  const visit=async name=>{await p.goto(`http://127.0.0.1:4187/${name}.html?test`);await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick();};
  for(const name of ['under-green','back-nine']){
   await visit(name);await p.locator(`#${name==='under-green'?'comfort':'chase-comfort'} summary`).click();
   for(const [key,value]of Object.entries(values)){
    if(name==='under-green')await control(key).fill(String(value));
    assert.equal(Number(await control(key).inputValue()),value);assert.equal((await read()).campaign[key],value);
   }
   for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
    await p.setViewportSize({width,height});await control('dangerVolume').scrollIntoViewIfNeeded();
    const boxes=await p.locator('.campaign-settings').evaluate(e=>[...e.querySelectorAll('label')].slice(0,4).map(label=>{const a=label.getBoundingClientRect(),b=label.querySelector('input').getBoundingClientRect();return {label:label.textContent.trim(),left:a.left,right:a.right,top:a.top,bottom:a.bottom,inputLeft:b.left,inputRight:b.right,width:innerWidth};}));
    for(const b of boxes){assert(b.left>=0&&b.right<=width);assert(b.inputLeft>=b.left&&b.inputRight<=b.right);}
    geometry.push({name,width,height,boxes});await p.screenshot({path:`${out}/${name}-mix-${width}.png`});
   }
   await p.setViewportSize({width:1280,height:720});
   await p.locator('#primary').click();await tick();await p.waitForTimeout(300);
   if(name==='back-nine'){
    const mix=(await read()).audio.mix;
    for(const [channel,key]of Object.entries({ambience:'ambienceVolume',mower:'mowerVolume',effects:'effectsVolume',danger:'dangerVolume'}))assert(Math.abs(mix[channel]-values[key])<.002,JSON.stringify(mix));
    await p.locator('#pause').click();await control('mowerVolume').fill('0');await p.locator('#primary').click();await tick();await p.waitForTimeout(300);assert((await read()).audio.mix.mower<.002);
    await p.locator('#pause').click();await control('mowerVolume').fill(String(values.mowerVolume));
   }
   await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   for(const [key,value]of Object.entries(values))assert.equal((await read()).campaign[key],value);
  }
  checks.push('Four category sliders edit in Under the Green, inherit in Back Nine, persist after reload and reach the live chase buses','Both chapter menus keep sliders inside their labels at four viewports');
  await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__mixTest&&window.roughCutRebuild,null,{timeout:90000});
  assert.deepEqual(await p.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,__mixTest.state[k]])),Object.keys(values)),values);
  // Use the real Level 1 canvas control; fixture only opens its settings page.
  await p.keyboard.press('Enter');await p.keyboard.press('Space');
  await p.evaluate(()=>{const t=__mixTest;t.state.manualTime=true;t.state.mode='settings';t.state.settingsPage='mix';t.state.settingsIndex=t.SETTINGS_ROWS.findIndex(r=>r.key==='mowerVolume');t.state.transitionAlpha=0;t.render();});
  await p.keyboard.press('ArrowRight');await tick();
  const changed=await p.evaluate(()=>__mixTest.state.mowerVolume);assert(changed>values.mowerVolume);
  await visit('under-green');assert.equal((await read()).campaign.mowerVolume,changed);
  checks.push('Level 1 receives all category preferences; its real keyboard slider edit carries back into Under the Green');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/ui.json',JSON.stringify({passed:true,checks,geometry,errors},null,2));console.log(JSON.stringify({passed:true,checks}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
