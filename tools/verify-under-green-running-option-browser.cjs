const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/running-option';fs.mkdirSync(out,{recursive:true});const results=[],errors=[];
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  for(const [width,height,device]of [[2560,1600,'keyboard'],[1280,720,'gamepad'],[844,390,'touch'],[390,844,'touch']]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:device==='touch',isMobile:width<500}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
   await p.addInitScript(()=>{localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:{sprint:'KeyT'},keyboardBindingsVersion:2}));});
   if(device==='gamepad')await p.addInitScript(()=>{window.runPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[runPad];});
   const tick=frames=>p.evaluate(n=>advanceTime(n*(1000/60)-1e-6),frames),cdp=device==='touch'?await context.newCDPSession(p):null;
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.locator('#primary').click();await tick(1);
   async function seed(){
    return p.evaluate(async()=>{
     const {createRun,MOVEMENT}=await import('./under-green-sim.js'),{WATERS,waterState,waterPoint}=await import('./under-green-course.js'),{crossingAdvice}=await import('./under-green-guidance.js');
     const w=WATERS.find(w=>w.id==='range-b'),start=waterPoint(w,0,w.depth/2+.65),target=waterPoint(w,0,-w.depth/2-.4),state=waterState(w,24-w.offset,true);
     const seconds=(crossingAdvice(start,w,state,MOVEMENT.walk).seconds+crossingAdvice(start,w,state,MOVEMENT.sprint).seconds)/2;
     const r=createRun(3);r.mode='playing';r.messageTime=0;r.time=24+(w.lowSeconds??3)+1.5-seconds-w.offset;Object.assign(r.player,start,{yaw:Math.PI,crossingSpeed:MOVEMENT.walk});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);return {target,initial:structuredClone(r)};
    });
   }
   for(const toggle of [false,true]){
    await p.keyboard.press('Escape');await p.locator('#comfort summary').evaluate(e=>{e.parentElement.open=true;});await p.locator(device==='touch'?'#touch-run-toggle':'#sprint-toggle').setChecked(toggle);await p.locator('#movement-ramp').setChecked(toggle);await p.locator('#primary').click();await tick(1);
    // The UI follows the last device actually used. Establish that device with
    // a real input after the keyboard-operated settings boundary, then seed.
    if(device==='gamepad'){await p.evaluate(()=>runPad.axes[0]=.5);await tick(1);await p.evaluate(()=>runPad.axes[0]=0);await tick(1);}
    if(device==='touch'){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:width/2,y:height/2}]});await tick(1);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
    const fixture=await seed();const expected=`${toggle?'Tap':'Hold'} ${device==='keyboard'?'T':device==='gamepad'?'RT':'Run'}`;
    assert.equal(await p.locator('#water-read').getAttribute('data-action'),'wait');assert.equal(await p.locator('#water-read').getAttribute('data-run-option'),'true');assert((await p.locator('#water-phase').innerText()).includes(expected),JSON.stringify({device,toggle,expected,title:await p.locator('#water-phase').innerText()}));assert.match(await p.locator('#water-advice').innerText(),/Walking will not clear/);
    const row=await p.locator('#water-read').boundingBox();assert(row.x>=0&&row.y>=0&&row.x+row.width<=width&&row.y+row.height<=height);
    await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/option-${device}-${width}-${toggle?'toggle':'hold'}.png`});
    if(device==='keyboard'&&!toggle){
     await p.keyboard.press('Escape');const before=await p.evaluate(()=>JSON.stringify(__underGreen.run));await tick(60);assert.equal(await p.evaluate(()=>JSON.stringify(__underGreen.run)),before);await p.locator('#primary').click();
     for(const key of ['c','q']){await seed();await p.keyboard.down(key);await tick(1);assert.equal(await p.locator('#water-read').getAttribute('data-run-option'),'false');await p.keyboard.up(key);}
     await seed();await tick(90);assert.equal(await p.locator('#water-read').getAttribute('data-run-option'),'false');await seed();
    }
    await tick(15); // Use the same reaction delay as the simulation proof.
    const contacts=[];
    if(device==='keyboard'){await p.keyboard.down('t');if(toggle)await p.keyboard.up('t');}
    else if(device==='gamepad'){await p.evaluate(()=>{runPad.buttons[7]={pressed:true,value:1};});}
    else{
     const b=await p.locator('[data-key=sprint]').boundingBox();contacts.push({id:2,x:b.x+b.width/2,y:b.y+b.height/2});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:contacts});
    }
    await tick(1);assert.equal(await p.locator('#water-read').getAttribute('data-run-option'),'false','An active Run toggle must not be offered again while standing or easing into motion');
    if(device==='keyboard')await p.keyboard.down('w');
    else if(device==='gamepad')await p.evaluate(toggle=>{if(toggle)runPad.buttons[7]={pressed:false,value:0};runPad.axes[1]=-1;},toggle);
    else{const b=await p.locator('[data-key=forward]').boundingBox();contacts.push({id:1,x:b.x+b.width/2,y:b.y+b.height/2});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:contacts});}
    let frames=1,state;
    do{await tick(1);frames++;state=await p.evaluate(()=>JSON.parse(render_game_to_text()));}while(state.player.y>fixture.target.y&&state.waterHits===0&&frames<180);
    if(device==='keyboard'){await p.keyboard.up('w');await p.keyboard.up('t');}
    else if(device==='gamepad')await p.evaluate(()=>{runPad.axes[1]=0;runPad.buttons[7]={pressed:false,value:0};});
    else await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
    assert.equal(state.waterHits,0);assert(state.player.y<=fixture.target.y);assert.equal(state.mode,'under_green_playing');assert.equal(state.inputMethod,device);
    await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/cleared-${device}-${width}-${toggle?'toggle':'hold'}.png`});
    results.push({width,height,device,toggle,frames,seconds:state.elapsed,hits:state.waterHits,player:state.player,joe:state.joe});
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,results,errors,limits:['Actual keyboard/browser-touch input, emulated gamepad polling; seeded live-Joe range bank, not full-route playthrough.','Eight hold/toggle crossings with 250ms reaction delay; not physical-device or human-reading validation.']},null,2));console.log(JSON.stringify({passed:true,cases:results.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
