const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const out='output/campaign-settings',base='http://127.0.0.1:4187';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 fs.mkdirSync(out,{recursive:true});const checks=[],errors=[],measurements=[];
 try{
  const context=await browser.newContext({viewport:{width:2560,height:1600}}),p=await context.newPage();
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({seen:true,skip:true})));
  // Expose read-only diagnostics and a settings-screen fixture, not alternate preference setters.
  await p.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__campaignTest={state,render,SETTINGS_ROWS,settingsRowGeometry,master:()=>masterGain?.gain.value};\n  window.advanceTime = (milliseconds) => {')}));
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  const visit=async chapter=>{await p.goto(`${base}/${chapter}.html?test`);await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);};
  const setting=key=>p.locator(`[data-campaign="${key}"]`);
  const slider=async(key,value)=>{await setting(key).fill(String(value));await tick(0);};
  const comfort=async chapter=>{await p.locator(`#${chapter==='under-green'?'comfort':'chase-comfort'} summary`).click();};
  await visit('under-green');await comfort('under-green');
  await slider('volume',.25);await setting('muted').check();await setting('reducedMotion').check();await setting('subtitles').uncheck();await setting('soundCaptions').check();await setting('threatCaptions').uncheck();await slider('subtitleSize',1.4);await slider('captionBackground',.9);
  const expected={volume:.25,muted:true,reducedMotion:true,subtitles:false,soundCaptions:true,threatCaptions:false,subtitleSize:1.4,captionBackground:.9};
  for(const [key,value]of Object.entries(expected))assert.equal((await read()).campaign[key],value,key);
  for(const chapter of ['under-green','back-nine']){
   if(chapter==='back-nine'){await visit(chapter);await comfort(chapter);}
   for(const [key,value]of Object.entries(expected))assert.equal((await read()).campaign[key],value,chapter+' '+key);
   for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
    await p.setViewportSize({width,height});await tick(0);await setting('muted').scrollIntoViewIfNeeded();
    const bounds=await p.locator('.campaign-settings').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth,overflow:el.scrollWidth>el.clientWidth+2};});
    assert(bounds.left>=0&&bounds.right<=width&&!bounds.overflow,JSON.stringify({chapter,width,bounds}));
    await p.screenshot({path:`${out}/${chapter}-settings-${width}.png`});
    await setting('captionBackground').scrollIntoViewIfNeeded();assert(await setting('captionBackground').isVisible());
   }
  }
  checks.push('Actual chapter controls persist campaign values UG → Back Nine; settings readable and reachable at four viewports');
  await p.setViewportSize({width:1280,height:720});await p.locator('#primary').click();await tick(17);await p.waitForTimeout(700);
  assert((await read()).audio.active);assert((await read()).audio.master<.001);
  // Maximum local flash cannot override the campaign reduced-motion preference.
  await p.evaluate(()=>{__backNine.run.impact={age:.1,strength:1,side:1};});await tick(0);
  assert.equal(await p.locator('#impact-edge').evaluate(e=>Number(e.style.opacity)),0);
  await p.locator('#pause').click();await p.locator('#chase-flash').fill('1');await p.locator('#primary').click();await tick(0);
  await p.evaluate(()=>{__backNine.run.impact={age:.1,strength:1,side:1};});await tick(0);
  assert.equal(await p.locator('#impact-edge').evaluate(e=>Number(e.style.opacity)),0);
  await p.locator('#pause').click();await setting('muted').uncheck();await slider('volume',.2);await p.locator('#primary').click();await tick(17);await p.waitForTimeout(800);
  let audio=(await read()).audio;assert(Math.abs(audio.master-.048)<.002,JSON.stringify(audio));measurements.push({chapter:'back-nine',volume:.2,master:audio.master});
  await p.locator('#pause').click();await slider('volume',.8);await p.locator('#primary').click();await tick(17);await p.waitForTimeout(800);
  audio=(await read()).audio;assert(Math.abs(audio.master-.192)<.002);measurements.push({chapter:'back-nine',volume:.8,master:audio.master});
  await p.locator('#sound').click();await tick(17);await p.waitForTimeout(700);assert((await read()).audio.master<.001);
  checks.push('Back Nine live mixer responds to master changes after AudioContext creation; shared Sound button mutes active voices');
  await p.evaluate(()=>{const r=__backNine.run;r.message='Both relays online · checkpoint saved.';r.messageTime=5;r.impact.age=99;r.joe.ram.phase='lineup';r.joe.ram.age=.8;__backNine.render();});
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(()=>__backNine.render());await p.evaluate(()=>__backNine.whenPresented());
   assert.match(await p.locator('#caption').innerText(),/checkpoint saved/);assert.match(await p.locator('#sound-caption').innerText(),/engine rises/);
   const boxes=await p.evaluate(()=>{const b=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};return {caption:b('#caption'),sound:b('#sound-caption'),dashboard:b('.dashboard'),objective:b('.objective')};});
   assert(boxes.caption.bottom<=boxes.sound.top&&boxes.sound.bottom<=boxes.dashboard.top,JSON.stringify({width,boxes}));
   assert(boxes.objective.bottom<=boxes.caption.top,'Large captions clear the objective marker');
   assert(boxes.caption.left>=0&&boxes.caption.right<=width);await p.screenshot({path:`${out}/back-nine-captions-${width}.png`});
  }
  checks.push('Back Nine maximum-size instruction and sound captions remain separate and clear the dashboard at four sizes');
  await visit('under-green');await comfort('under-green');assert((await read()).campaign.muted);
  await p.locator('#primary').click();await tick(0);
  // Controlled encounter fixtures isolate optional caption policy and essential danger.
  await p.evaluate(()=>{const r=__underGreen.run;r.messageTime=0;r.waterLock=1.6;r.joe.phase='walk';r.joe.x=r.player.x;r.joe.y=r.player.y+8;});await tick(0);
  assert.match(await p.locator('#caption').innerText(),/Hedge-trimmer/);assert(!(await p.locator('body').evaluate(e=>e.classList.contains('water-hit'))));
  await p.locator('#pause').click();await setting('soundCaptions').uncheck();await setting('reducedMotion').uncheck();await p.locator('#primary').click();await tick(0);
  await p.evaluate(()=>{const r=__underGreen.run;r.messageTime=0;r.waterLock=1.6;});await tick(0);
  assert.equal(await p.locator('#caption').innerText(),'');assert(await p.locator('body').evaluate(e=>e.classList.contains('water-hit')));
  await p.evaluate(()=>{const r=__underGreen.run;r.joe.phase='windup';r.joe.x=r.player.x;r.joe.y=r.player.y+1.4;r.joe.yaw=Math.PI;});await tick(0);
  assert.match(await p.locator('#caption').innerText(),/Move sideways/);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await tick(0);
   const bounds=await p.locator('#caption').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,size:parseFloat(getComputedStyle(e).fontSize)};});
   assert(bounds.left>=0&&bounds.right<=width&&bounds.top>=0&&bounds.bottom<=height&&bounds.size>=18,JSON.stringify({width,bounds}));
   await p.screenshot({path:`${out}/essential-danger-${width}.png`});
  }
  await p.setViewportSize({width:1280,height:720});
  checks.push('UG optional sound/pursuit captions switch off independently; imminent strike instruction remains; reduced motion suppresses water flash');
  await p.goto(base+'/index.html');await p.waitForFunction(()=>window.__campaignTest&&window.roughCutRebuild,null,{timeout:90000});
  const level=await p.evaluate(()=>{const s=__campaignTest.state;return Object.fromEntries(['muted','volume','reducedMotion','subtitles','soundCaptions','threatCaptions','subtitleSize','captionBackground'].map(k=>[k,s[k]]));});
  assert.deepEqual(level,{...expected,volume:.8,reducedMotion:false,soundCaptions:false});
  await p.keyboard.press('Enter');await p.keyboard.press('Space');
  await p.evaluate(()=>{const t=__campaignTest;t.state.manualTime=true;t.state.mode='settings';t.state.settingsPage='mix';t.state.settingsIndex=t.SETTINGS_ROWS.findIndex(r=>r.key==='muted');t.state.transitionAlpha=0;t.render();});
  const click=await p.evaluate(()=>{const t=__campaignTest,r=t.settingsRowGeometry(t.state.settingsIndex),c=document.getElementById('game').getBoundingClientRect();return {x:c.x+(r.x+r.width/2)*c.width/1280,y:c.y+(r.y+r.height/2)*c.height/720};});
  await p.mouse.click(click.x,click.y);await tick(0);await p.waitForTimeout(300);
  assert.equal(await p.evaluate(()=>__campaignTest.state.muted),false);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')).muted),false);
  let master=await p.evaluate(()=>__campaignTest.master());assert(Math.abs(master-.44)<.002,`Level 1 unmute master: ${master}`);measurements.push({chapter:'level-one',volume:.8,master});
  await p.mouse.click(click.x,click.y);await tick(0);await p.waitForTimeout(300);assert((await p.evaluate(()=>__campaignTest.master()))<.001);
  await p.mouse.click(click.x,click.y);await tick(0);
  await p.setViewportSize({width:2560,height:1600});await tick(0);await p.screenshot({path:out+'/level-one-settings-2560.png'});
  checks.push('Level 1 consumes shared preferences; real canvas mute toggle persists an unmute for other chapters (screen initialized by fixture)');
  // Explicit global unmute must supersede a legacy local mute left by an older build.
  await p.evaluate(()=>localStorage.setItem('rough-cut.under-green-comfort.v1',JSON.stringify({muted:true})));
  await visit('under-green');assert.equal((await read()).comfort.muted,false);await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);assert.equal((await read()).campaign.muted,false);
  checks.push('Explicit campaign unmute overrides legacy local mute and survives reload');
  await p.evaluate(()=>{localStorage.removeItem('rough-cut.settings.v1');localStorage.setItem('rough-cut.under-green-comfort.v1',JSON.stringify({muted:true,reduced:true}));});
  await visit('under-green');await comfort('under-green');let local=(await read()).comfort;assert(local.muted&&local.reduced);assert(await p.locator('#legacy-comfort').isVisible());
  assert.equal(await p.evaluate(()=>localStorage.getItem('rough-cut.settings.v1')),null,'Legacy local preferences must not become campaign choices');
  await p.locator('#use-campaign-settings').click();await tick(0);local=(await read()).comfort;assert(!local.muted&&!local.reduced);assert(await p.locator('#legacy-comfort').isHidden());
  checks.push('Legacy local sound/motion overrides remain local, are explained, and can be explicitly cleared');
  // Storage exceptions do not prevent interactive settings or local-session play.
  await p.addInitScript(()=>{Storage.prototype.setItem=function(){throw Error('Storage unavailable');};});
  await visit('under-green');await comfort('under-green');await setting('muted').check();await tick(0);assert((await read()).comfort.muted);assert.match(await p.locator('[data-settings-status]').innerText(),/session/);await p.locator('#primary').click();await tick(17);assert.equal((await read()).mode,'under_green_playing');
  checks.push('Unavailable storage retains settings in-session and allows play with a truthful persistence notice');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,measurements,errors},null,2));console.log(JSON.stringify({passed:true,checks,measurements,errors}));
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
