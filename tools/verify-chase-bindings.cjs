const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const out='output/chase-bindings',errors=[],checks=[];fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');
   if(!localStorage.getItem('binding-test-seeded')){
    localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:{interact:'KeyT'},keyboardBindingsVersion:2,volume:.37,extension:{keep:true}}));
    localStorage.setItem('binding-test-seeded','1');
   }
   navigator.getGamepads=()=>window.testPad?[testPad]:[];
  });
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  async function visit(){await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.__backNine&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);}
  await visit();await p.locator('#chase-comfort summary').click();
  assert.equal((await read()).bindings.look_back,'KeyQ');
  const remap={move_up:'KeyI',move_down:'KeyK',move_left:'KeyJ',move_right:'KeyL',brake:'KeyB',interact:'KeyO',look_back:'KeyU'};
  for(const [action,key]of Object.entries(remap))await p.locator(`[data-binding="${action}"]`).selectOption(key);
  await p.evaluate(()=>{const key='rough-cut.settings.v1',s=JSON.parse(localStorage.getItem(key));s.chaseKeyboardBindings.move_down='KeyN';localStorage.setItem(key,JSON.stringify(s));});
  await p.locator('[data-binding="move_up"]').selectOption('KeyM');assert.equal((await read()).bindings.move_down,'KeyN');
  await p.locator('[data-binding="move_down"]').selectOption('KeyK');await p.locator('[data-binding="move_up"]').selectOption('KeyI');
  await p.evaluate(()=>{const key='rough-cut.settings.v1',s=JSON.parse(localStorage.getItem(key));s.chaseKeyboardBindings.brake='KeyP';localStorage.setItem(key,JSON.stringify(s));});
  await p.locator('[data-binding="interact"]').selectOption('KeyP');assert.equal((await read()).bindings.interact,'KeyO');assert.match(await p.locator('[data-keyboard-status]').innerText(),/assigned elsewhere/);
  await p.locator('[data-binding="interact"]').selectOption('KeyX');assert.equal((await read()).bindings.brake,'KeyP');
  await p.locator('[data-binding="brake"]').selectOption('KeyB');await p.locator('[data-binding="interact"]').selectOption('KeyO');
  assert.deepEqual((await read()).bindings,remap);
  assert.match(await p.locator('#guide-controls').innerText(),/I.*J L.*K.*B \/ O.*U/);
  assert.match(await p.locator('#comfort-controls').innerText(),/O \/ B brake.*U glance/);
  assert.equal(await p.locator('[data-binding="interact"] option[value="KeyI"]').evaluate(e=>e.disabled),true);
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')));
  assert.deepEqual(saved.keyboardBindings,{interact:'KeyT'});assert.equal(saved.volume,.37);assert.deepEqual(saved.extension,{keep:true});
  checks.push('Actual UI remaps the chase profile; labels agree; duplicate keys disabled; on-foot bindings and unrelated preferences preserved');
  checks.push('Interleaved action edits merge; conflicts with newer stored bindings are rejected without overwriting that profile');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.locator('[data-binding="move_up"]').scrollIntoViewIfNeeded();
   const box=await p.locator('#chase-keyboard').evaluate(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,overflow:e.scrollWidth>e.clientWidth+1}));
   assert(box.left>=0&&box.right<=width&&!box.overflow,JSON.stringify(box));
   await p.screenshot({path:`${out}/settings-${width}.png`});
   await p.locator('[data-keyboard-reset]').scrollIntoViewIfNeeded();assert(await p.locator('[data-keyboard-reset]').isVisible());
   const last=await p.locator('[data-keyboard-reset]').evaluate(e=>({bottom:e.getBoundingClientRect().bottom,footer:document.getElementById('panel-footer').getBoundingClientRect().top}));
   assert(last.bottom<=last.footer+1,'The footer must not cover the final keyboard control');
   await p.screenshot({path:`${out}/settings-bottom-${width}.png`});
  }
  await p.setViewportSize({width:1280,height:720});await visit();assert.deepEqual((await read()).bindings,remap);await p.locator('#primary').click();
  async function stage(foot=false,finish=false){
   await p.evaluate(async({foot,finish})=>{
    const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js');
    const r=createRun(finish?2:0);r.mode='driving';r.time=8;r.grace=100;r.messageTime=0;
    Object.assign(r.cart,{x:0,y:foot?40:50,yaw:0,speed:0});Object.assign(r.joe,{x:0,y:0});
    if(foot){leaveBrokenCart(r);r.time+=2;Object.assign(r.foot,{x:finish?-23:0,y:finish?807:50,yaw:0,viewYaw:0,invulnerable:0});}
    __backNine.run=r;advanceTime(0);
   },{foot,finish});
  }
  const hold=async(key,ms)=>{await p.keyboard.down(key);await tick(ms);await p.keyboard.up(key);};
  await stage();await hold('w',300);assert.equal((await read()).cart.speed,0);await hold('i',500);assert((await read()).cart.speed>1);
  await hold('l',300);assert((await read()).cart.yaw>0);await hold('u',300);assert((await read()).player&&await p.evaluate(()=>__backNine.run.lookBack));
  await tick(17);await hold('q',300);assert.equal(await p.evaluate(()=>__backNine.run.lookBack),false);
  await stage();await hold('ArrowUp',300);assert((await read()).cart.speed>1);
  checks.push('Remapped acceleration/steering/rear view work; replaced W/Q no longer act; arrow-key aliases remain');
  await stage(true);await hold('l',500);assert((await read()).player.yaw>1.2);const turned=(await read()).player;
  await hold('i',400);assert((await read()).player.x>turned.x+1);const heading=(await read()).player.yaw;
  await p.mouse.move(500,200);await p.mouse.move(1000,500);await tick(100);assert.equal((await read()).player.viewYaw,heading);
  await hold('u',350);assert((await read()).player.rearBlend>.99);assert.equal((await read()).player.viewYaw,heading);
  await stage(true,true);assert.match((await read()).objective,/hold O \/ B/i);assert.match((await read()).messages.banner,/hold O \/ B/i);
  await hold('e',400);assert.equal((await read()).finishHold,0);await hold('o',1400);assert.equal((await read()).mode,'back_nine_sealing');await tick(5000);assert.equal((await read()).mode,'back_nine_complete');
  checks.push('Runner retains steering/following camera; remapped Use seals the garage; E no longer activates it');
  // Gamepad captions must name the gamepad even with custom keyboard keys.
  await stage(true,true);await p.evaluate(()=>{window.testPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};});await tick(17);
  await p.evaluate(()=>testPad.buttons[11]={pressed:true,value:1});await tick(100);
  assert.match((await read()).objective,/hold B/);assert.doesNotMatch((await read()).messages.banner,/O \/ B|E \/ Space/);
  await p.evaluate(()=>{testPad.buttons[11]={pressed:false,value:0};});await tick(17);
  await p.keyboard.press('Escape');await p.locator('#chase-comfort summary').click();await tick(17);
  await p.locator('[data-binding="move_up"]').focus();await p.evaluate(()=>testPad.buttons[15]={pressed:true,value:1});await tick(17);
  await p.evaluate(()=>testPad.buttons[15]={pressed:false,value:0});await tick(17);assert.notEqual((await read()).bindings.move_up,'KeyI');
  await p.locator('[data-keyboard-reset]').click();assert.equal((await read()).bindings.move_up,'KeyW');assert.equal((await read()).bindings.look_back,'KeyQ');
  checks.push('Gamepad selects keyboard options without starting gameplay; gamepad hazard instructions use B; profile reset restores only chase defaults');
  // Storage failure retains the changed controls in the current session.
  await p.evaluate(()=>{window.originalStorageWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Denied','SecurityError');};});
  await p.locator('[data-binding="interact"]').selectOption('KeyO');assert.equal((await read()).bindings.interact,'KeyO');assert.match(await p.locator('[data-keyboard-status]').innerText(),/session/);
  await p.evaluate(()=>{const key='rough-cut.settings.v1',s=JSON.parse(localStorage.getItem(key));s.volume=.19;originalStorageWrite.call(localStorage,key,JSON.stringify(s));Storage.prototype.setItem=originalStorageWrite;});
  await p.locator('[data-binding="move_up"]').selectOption('KeyI');
  const recovered=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')));
  assert.equal(recovered.chaseKeyboardBindings.interact,'KeyO');assert.equal(recovered.chaseKeyboardBindings.move_up,'KeyI');assert.equal(recovered.volume,.19);
  await p.locator('#primary').click();await stage(true,true);await hold('o',1400);assert.equal((await read()).mode,'back_nine_sealing');
  checks.push('Denied storage retains session remaps; later recovery persists pending actions while preserving other settings');
  await visit();await p.evaluate(()=>{const key='rough-cut.settings.v1',s=JSON.parse(localStorage.getItem(key));s.chaseKeyboardBindings={move_up:'KeyQ',look_back:'KeyQ'};localStorage.setItem(key,JSON.stringify(s));});
  await visit();assert.equal((await read()).bindings.move_up,'KeyW');assert.equal((await read()).bindings.look_back,'KeyQ');
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  await p.locator('#primary').click();await tick(0);assert.match(await p.locator('#hint').innerText(),/T use/);
  assert.equal((await read()).campaign.keyboardBindings.interact,'KeyT');
  checks.push('Conflicting saved chase keys fall back safely; visiting Under the Green still uses the independent T binding');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,checks,viewports:4,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
