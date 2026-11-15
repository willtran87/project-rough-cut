const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/on-foot-prompt-preferences',baseline=process.argv.includes('--baseline');fs.mkdirSync(out,{recursive:true});
if(baseline)assert(!fs.existsSync(out+'/baseline.json'),'Preserve the original baseline');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],results=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   if(localStorage.getItem('prompt-audit-seeded'))return;
   localStorage.setItem('prompt-audit-seeded','yes');
   localStorage.setItem('rough-cut.level-one-opening.v1','{"skip":true}');
   localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindingsVersion:2,keyboardBindings:{move_up:'KeyI',move_left:'KeyJ',move_down:'KeyK',move_right:'KeyL',sprint:'KeyZ',crouch:'KeyV',focus:'KeyN',look_back:'KeyB',interact:'KeyT'}}));
   localStorage.setItem('rough-cut.feel.v1',JSON.stringify({crouchToggle:true,sprintToggle:true,touchSprintToggle:true}));
  });
  await p.route('**/game.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__promptAudit={state,resetFirstHole,rebindKeyboardAction,resetKeyboardBindings,coverShredEscapeActionCopy,render};\n  window.advanceTime = (milliseconds) => {')}));
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  const crouched=()=>p.evaluate(()=>{const p=JSON.parse(render_game_to_text()).player;return p.crouched??p.crouch;});
  async function visit(chapter){
   await p.goto(`http://127.0.0.1:4187/${chapter}.html?test`);
   await p.waitForFunction(chapter=>chapter==='index'?window.__promptAudit:window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,chapter,{timeout:90000});await tick(0);
  }
  await visit('index');
  const initial=await p.evaluate(()=>{const a=__promptAudit;return {instructions:document.getElementById('game-instructions').textContent,cover:a.coverShredEscapeActionCopy(),toggle:a.state.crouchToggle};});results.push({chapter:'index',...initial});
  if(!baseline){assert.match(initial.instructions,/I\/J\/K\/L/);assert(!initial.instructions.includes('WASD'));assert.match(initial.cover,/TAP V/);}
  for(const chapter of ['under-green','final-cut']){
   await visit(chapter);const guide=await p.locator('#control-guide').textContent();results.push({chapter,guide});
   if(!baseline){
    assert.match(guide,/Tap Z/);assert.match(guide,/Tap V/);assert.match(guide,/Tap RT/);assert.match(guide,/Tap LB/);assert.match(guide,/Tap Run/);
    await p.click('#primary');await p.keyboard.press('c');await tick(17);assert(!(await crouched()));
    await p.keyboard.press('v');await tick(17);assert((await crouched()));
    await p.keyboard.press('v');await tick(17);assert(!(await crouched()));
    const cdp=await p.context().newCDPSession(p);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:1200,y:700}]});await tick(17);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tick(17);
    assert.match(await p.locator('#hint').textContent(),/Pad move/);
    const box=await p.locator('[data-key=crouch]').boundingBox();assert(box);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,x:box.x+box.width/2,y:box.y+box.height/2}]});await tick(17);assert((await crouched()));
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tick(17);assert(!(await crouched()));
    results.push({chapter,actualRemappedToggle:true,touchRemainsHold:true,touchHint:true});await cdp.detach();
   }
  }
  if(baseline){fs.writeFileSync(out+'/baseline.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({baseline:true,results,errors}));return;}

  await visit('under-green');await p.locator('#comfort summary').click();
  await p.locator('[data-binding=crouch]').selectOption('KeyX');await tick(0);assert.match(await p.locator('#control-guide').textContent(),/Tap X/);
  await p.locator('#primary').click();await p.keyboard.press('x');await tick(17);
  let state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(state.player.crouched);
  await p.keyboard.press('x');await tick(17);state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(!state.player.crouched);
  await p.keyboard.press('Escape');await p.locator('#crouch-toggle').uncheck();await p.locator('#sprint-toggle').uncheck();await p.locator('#touch-run-toggle').uncheck();await tick(0);
  let guide=await p.locator('#control-guide').textContent();assert.match(guide,/Hold X/);assert.match(guide,/Hold Z/);assert.match(guide,/Hold Run/);
  await p.locator('#primary').click();await p.keyboard.down('x');await tick(17);assert((await crouched()));await p.keyboard.up('x');await tick(17);assert(!(await crouched()));
  results.push({chapter:'under-green',actualRemappedToggleAndHold:true});

  for(const chapter of ['index','final-cut']){
   await visit(chapter);
   if(chapter==='index'){
    const state=await p.evaluate(()=>{__promptAudit.state.hole.crouched=false;return {instructions:document.getElementById('game-instructions').textContent,cover:__promptAudit.coverShredEscapeActionCopy()};});
    assert.match(state.instructions,/Hold X/);assert.match(state.cover,/HOLD X/);
    const staying=await p.evaluate(()=>{__promptAudit.state.hole.crouched=true;return __promptAudit.coverShredEscapeActionCopy();});assert.match(staying,/STAY CROUCHED/);assert(!staying.includes('TAP'));
    await p.evaluate(()=>{__promptAudit.resetKeyboardBindings();__promptAudit.render();});assert.match(await p.locator('#game-instructions').textContent(),/WASD/);
    results.push({chapter,inheritance:true,staying,resetDescription:true});
   }else{
    const guide=await p.locator('#control-guide').textContent();assert.match(guide,/Hold Shift/);assert.match(guide,/Hold C/);assert.match(guide,/Hold Run/);results.push({chapter,resetAndHoldInherited:true});
   }
  }
  // Capture the actual settings guides at high resolution and compact sizes.
  for(const chapter of ['under-green','final-cut']){
   await visit(chapter);const detail=p.locator('#control-guide').locator('..');
   if(await detail.evaluate(el=>el.tagName==='DETAILS'&&!el.open))await detail.locator('summary').click();
   for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
    await p.setViewportSize({width,height});await tick(0);await p.locator('#control-guide').scrollIntoViewIfNeeded();
    const bounds=await p.locator('#control-guide').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));assert(bounds.scroll<=bounds.client+1);
    const file=`${out}/${chapter}-guide-${width}.png`;await p.screenshot({path:file});views.push({chapter,width,height,file});
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,results,views,errors},null,2));console.log(JSON.stringify({passed:true,results,views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
