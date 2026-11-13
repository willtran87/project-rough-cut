const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/chapter-gamepad-menus',checks=[],errors=[];fs.mkdirSync(out,{recursive:true});
 try{
  for(const chapter of ['under-green','back-nine']){
   const context=await browser.newContext({viewport:{width:2560,height:1600}}),p=await context.newPage();
   p.on('pageerror',e=>errors.push(`${chapter}: ${e.message}`));
   await p.addInitScript(()=>{
    localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({seen:true,skip:true}));
    window.mockPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
    navigator.getGamepads=()=>mockPad.connected?[mockPad]:[];
   });
   await p.goto(`http://127.0.0.1:4187/${chapter}.html?test`);
   await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
   const buttons=async values=>{await p.evaluate(values=>mockPad.buttons.forEach((b,i)=>{b.pressed=values.includes(i);b.value=b.pressed?1:0;}),values);await tick(17);};
   const tap=async i=>{await buttons([i]);await buttons([]);};
   const go=async selector=>{for(let i=0;i<45;i++){if(await p.evaluate(selector=>document.activeElement?.matches(selector),selector))return;await tap(13);}throw Error(`Cannot focus ${chapter} ${selector}`);};
   const prefix=chapter.replaceAll('-','_'),comfort=chapter==='under-green'?'comfort':'chase-comfort';
   await tick(17);assert.equal((await read()).mode,prefix+'_briefing');
   await go(`#${comfort} summary`);await tap(0);assert(await p.locator(`#${comfort}`).evaluate(e=>e.open));
   const slider=chapter==='under-green'?'master-volume':'chase-music';
   await go('#'+slider);const before=Number(await p.locator('#'+slider).inputValue());await tap(14);assert(Number(await p.locator('#'+slider).inputValue())<before);
   const checkbox=chapter==='under-green'?'reduced':'chase-reduced';
   await go('#'+checkbox);await tap(0);assert(await p.locator('#'+checkbox).isChecked());assert.equal((await read()).mode,prefix+'_briefing');
   if(chapter==='under-green'){
    await go('#scene-resolution');await tap(14);assert.equal((await read()).comfort.resolution,.95);
    assert.equal(await p.locator('#scene-resolution-value').innerText(),'95%');await tap(15);assert.equal((await read()).comfort.resolution,1);
    for(const [id,key,value]of [['field-of-view','fov',57],['sensitivity','mouse',.95],['controller-sensitivity','controller',.95],['touch-sensitivity','touch',.95]]){
     await go('#'+id);await tap(14);assert.equal((await read()).spatial[key],value);await tap(15);
    }
    await go('#camera-bob');await tap(15);assert.equal((await read()).comfort.cameraBob,.05);await tap(14);
    for(const id of ['crouch-toggle','sprint-toggle','movement-ramp']){await go('#'+id);await tap(0);assert(await p.locator('#'+id).isChecked());await tap(0);}
    await go('#pressure');await tap(15);assert.equal(await p.locator('#pressure').inputValue(),'relentless');await tap(14);
   }
   for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
    await p.setViewportSize({width,height});await tick(17);await go('#'+checkbox);
    assert.equal(await p.locator('#'+checkbox).evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
    await p.screenshot({path:`${out}/${chapter}-${width}.png`});
    const rect=await p.locator('#'+checkbox).evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:innerHeight};});assert(rect.top>=0&&rect.bottom<=rect.height,JSON.stringify({chapter,width,rect}));
    await p.screenshot({path:`${out}/${chapter}-${width}.png`});
   }
   await tap(1);assert.equal(await p.locator(`#${comfort}`).evaluate(e=>e.open),false);
   await go('#primary');await buttons([0]);await tick(200);assert.equal((await read()).mode,prefix+(chapter==='under-green'?'_playing':'_driving'));await buttons([]);
   await tap(9);assert.equal((await read()).mode,prefix+'_paused');
   // A held confirmation cannot confirm again when the device reconnects.
   await p.evaluate(()=>mockPad.connected=false);await tick(17);
   await p.evaluate(()=>{mockPad.connected=true;mockPad.buttons[0]={pressed:true,value:1};});await tick(200);
   assert.equal((await read()).mode,prefix+'_paused');await buttons([]);await go('#primary');await tap(0);
   await p.evaluate(()=>mockPad.connected=false);await tick(17);assert.equal((await read()).mode,prefix+'_paused');
   await p.evaluate(()=>{mockPad.connected=true;mockPad.buttons[9]={pressed:true,value:1};});await tick(200);assert.equal((await read()).mode,prefix+'_paused');
   await buttons([]);await tap(9);assert.equal((await read()).mode,prefix+(chapter==='under-green'?'_playing':'_driving'));
   if(chapter==='under-green'){
    await p.evaluate(()=>{__underGreen.run.evidence=true;});await tap(9);await go('#journal summary');await tap(0);assert(await p.locator('#journal').evaluate(e=>e.open));await tap(1);await tap(1);
   }
   // Retry and chapter exit use ordinary focused actions, with no mouse.
   await p.evaluate(chapter=>{const r=chapter==='under-green'?__underGreen.run:__backNine.run;r.mode='caught';},chapter);await tick(17);
   await go('#primary');await tap(0);assert.equal((await read()).mode,prefix+(chapter==='under-green'?'_playing':'_driving'));
   await tap(9);await go('#panel a[href="./index.html"]');
   await p.route('**/index.html',route=>route.fulfill({contentType:'text/html',body:'<title>Main menu handoff</title>'}));
   await p.evaluate(()=>{mockPad.buttons[0]={pressed:true,value:1};void advanceTime(17);});
   await p.waitForURL('**/index.html');
   checks.push(`${chapter}: settings, slider/select/checkbox, visible focus at four sizes, start/pause/resume/retry/exit, held-input and disconnect recovery${chapter==='under-green'?', journal':''}`);
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
