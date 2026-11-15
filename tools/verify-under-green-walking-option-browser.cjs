const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/walking-option';fs.mkdirSync(out,{recursive:true});const rows=[],errors=[];
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  for(const [width,height,device]of [[2560,1600,'keyboard'],[1280,720,'gamepad'],[844,390,'touch'],[390,844,'touch']]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:device==='touch',isMobile:width<500}),p=await context.newPage();
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.addInitScript(()=>localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:{crouch:'KeyT',focus:'KeyY'},keyboardBindingsVersion:2})));
   if(device==='gamepad')await p.addInitScript(()=>{window.walkPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[walkPad];});
   const tick=n=>p.evaluate(n=>advanceTime(n*(1000/60)-1e-6),n),cdp=device==='touch'?await context.newCDPSession(p):null;
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   const contact=async(action,id)=>{const b=await p.locator(`[data-key=${action}]`).boundingBox();assert(b);return {id,x:b.x+b.width/2,y:b.y+b.height/2};};
   async function seed(){return p.evaluate(async()=>{
    const {createRun,MOVEMENT}=await import('./under-green-sim.js'),{WATERS,waterPoint,waterState}=await import('./under-green-course.js'),{crossingAdvice}=await import('./under-green-guidance.js');
    const w=WATERS.find(w=>w.id==='range-b'),start=waterPoint(w,0,w.depth/2+.65),target=waterPoint(w,0,-w.depth/2-.4),state=waterState(w,24-w.offset,true);
    const remaining=(crossingAdvice(start,w,state,MOVEMENT.crouch).seconds+crossingAdvice(start,w,state,MOVEMENT.walk).seconds)/2;
    const r=createRun(3);r.mode='playing';r.messageTime=0;r.time=24+(w.lowSeconds??3)+1.5-remaining-w.offset;Object.assign(r.player,start,{yaw:Math.PI});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);return target;
   });}
   for(const toggle of device==='touch'?[false]:[false,true]){
    await p.keyboard.press('Escape');await p.locator('#comfort summary').evaluate(e=>e.parentElement.open=true);await p.locator('#crouch-toggle').setChecked(toggle);await p.locator('#movement-ramp').setChecked(toggle);await p.click('#primary');await tick(1);
    if(device==='touch')await p.touchscreen.tap(width/2,height/2);
    if(device==='gamepad'){await p.evaluate(()=>walkPad.axes[0]=.5);await tick(1);await p.evaluate(()=>walkPad.axes[0]=0);await tick(1);}
    for(const stance of ['crouch','focus','both']){
     const crouch=stance!=='focus',focus=stance!=='crouch',target=await seed();
     async function engage(){
      if(device==='keyboard'){if(crouch){await p.keyboard.down('t');if(toggle)await p.keyboard.up('t');}if(focus)await p.keyboard.down('y');}
      else if(device==='gamepad')await p.evaluate(({crouch,focus})=>{walkPad.buttons[4]={pressed:crouch,value:+crouch};walkPad.buttons[6]={pressed:focus,value:+focus};},{crouch,focus});
      else{const points=[];if(crouch)points.push(await contact('crouch',1));if(focus)points.push(await contact('focus',2));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});}
      await tick(1);
      if(device==='gamepad'&&toggle&&crouch){await p.evaluate(()=>walkPad.buttons[4]={pressed:false,value:0});await tick(1);}
     }
     await engage();
     const phase=await p.locator('#water-phase').innerText(),walkKey=device==='keyboard'?'T':device==='gamepad'?'LB':'Crouch',focusKey=device==='keyboard'?'Y':device==='gamepad'?'LT':'Listen';
     if(!phase.startsWith('WALK (')){const debug=await p.evaluate(()=>({state:JSON.parse(render_game_to_text()),guide:document.getElementById('control-guide').textContent,stored:localStorage.getItem('rough-cut.settings.v1')}));fs.writeFileSync(out+'/browser-failure.json',JSON.stringify({width,device,stance,toggle,phase,debug},null,2));}
     assert.match(phase,/^WALK \(/,JSON.stringify({width,device,stance,toggle}));if(crouch)assert(phase.includes(`${toggle?'Tap':'Release'} ${walkKey}`));if(focus)assert(phase.includes(focusKey));
     assert.equal(await p.locator('#water-read').getAttribute('data-action'),'wait');assert.equal(await p.locator('#water-read').getAttribute('data-walk-option'),'true');assert.equal(await p.locator('#water-read').getAttribute('data-run-option'),'false');
     const rect=await p.locator('#water-read').boundingBox();assert(rect.x>=0&&rect.x+rect.width<=width&&rect.y+rect.height<height/2);
     await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/offer-${width}-${stance}-${toggle}.png`});
     if(device==='keyboard'&&!toggle&&stance==='crouch'){
      await p.keyboard.press('Escape');const before=await p.evaluate(()=>JSON.stringify(__underGreen.run));await tick(60);assert.equal(await p.evaluate(()=>JSON.stringify(__underGreen.run)),before);await p.click('#primary');await seed();await engage();
     }
     await tick(15);
     if(device==='keyboard'){if(crouch){if(toggle)await p.keyboard.press('t');else await p.keyboard.up('t');}if(focus)await p.keyboard.up('y');await p.keyboard.down('w');}
     else if(device==='gamepad'){
      if(toggle&&crouch){await p.evaluate(()=>walkPad.buttons[4]={pressed:true,value:1});await tick(1);}
      await p.evaluate(()=>{walkPad.buttons[4]={pressed:false,value:0};walkPad.buttons[6]={pressed:false,value:0};walkPad.axes[1]=-1;});
     }else{await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await contact('forward',3)]});}
     let frames=0,state;do{await tick(1);frames++;state=await p.evaluate(()=>JSON.parse(render_game_to_text()));}while(state.player.y>target.y&&state.waterHits===0&&frames<180);
     if(device==='keyboard')await p.keyboard.up('w');else if(device==='gamepad')await p.evaluate(()=>walkPad.axes[1]=0);else await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     assert.equal(state.waterHits,0);assert(state.player.y<=target.y);assert.equal(state.mode,'under_green_playing');assert.equal(state.inputMethod,device);assert.equal(await p.locator('#water-read').getAttribute('data-walk-option'),'false');
     await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/clear-${width}-${stance}-${toggle}.png`});
     rows.push({width,height,device,stance,toggle,phase,rect,frames,player:state.player,joe:state.joe,hits:state.waterHits});
    }
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,rows,errors,limits:['Actual remapped keyboard and browser-touch controls; emulated gamepad polling. Live checkpoint Joe, seeded range bank.','18 crossings, current-pace warning retained until controls change; no physical-device or human comprehension claim.']},null,2));console.log(JSON.stringify({passed:true,cases:rows.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
