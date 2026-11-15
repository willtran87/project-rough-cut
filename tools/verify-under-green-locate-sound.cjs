const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/bunker-staging/locate-sound';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[],errors=[];
 try{
  for(const [width,height,device]of [[2560,1600,'mouse'],[1280,720,'controller'],[844,390,'touch'],[390,844,'touch']]){
   const p=await browser.newPage({viewport:{width,height},hasTouch:device==='touch',isMobile:device==='touch'});
   p.on('pageerror',e=>errors.push(e.message));
   if(device==='controller')await p.addInitScript(()=>{window.locatePad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[locatePad];});
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
   await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   // Verify the longer useful cue at maximum caption size and with audio muted.
   await p.keyboard.press('Escape');await p.locator('#comfort summary').click();await p.locator('[data-campaign=muted]').check();await p.locator('[data-campaign=threatCaptions]').check();await p.locator('[data-campaign=subtitleSize]').focus();await p.keyboard.press('End');await p.click('#primary');
   const cdp=device==='touch'?await p.context().newCDPSession(p):null;
   for(const side of [-1,1]){
    await p.evaluate(async side=>{
     const {createRun}=await import('./under-green-sim.js');const r=createRun(1);r.mode='playing';r.time=0;r.elapsed=30;r.messageTime=0;
     Object.assign(r.player,{x:-20,y:38,yaw:0,pitch:0});Object.assign(r.joe,{x:-20+side*4,y:38,yaw:0,phase:'search',age:0,last:{x:-20+side*4,y:38},search:0});
     __underGreen.run=r;__underGreen.clearInput();advanceTime(0);
    },side);
    if(device==='controller')await p.evaluate(()=>{locatePad.axes[2]=0;advanceTime(20);});
    if(device==='touch'){await p.touchscreen.tap(width/2,height*.45);await p.evaluate(()=>advanceTime(0));}
    const before=await p.locator('#caption').innerText();assert.match(before,/LOOK TOWARD THE SOUND/);assert(before.includes(side<0?'TO YOUR LEFT':'TO YOUR RIGHT'));assert(!before.includes('GLANCE BACK'));
    const metrics=await p.evaluate(()=>{const box=document.querySelector('#caption').getBoundingClientRect();return {x:box.x,y:box.y,right:box.right,bottom:box.bottom,overlaps:[...document.querySelectorAll('#touch button')].filter(b=>!document.querySelector('#touch').hidden).some(b=>{const a=b.getBoundingClientRect();return a.left<box.right&&a.right>box.left&&a.top<box.bottom&&a.bottom>box.top;})};});
    assert(metrics.x>=0&&metrics.y>=0&&metrics.right<=width+.1&&metrics.bottom<=height+.1&&!metrics.overlaps);
    await p.screenshot({path:`${out}/cue-${width}-${side}.png`});
    if(device==='controller'){
     await p.evaluate(side=>{locatePad.axes[2]=side;advanceTime(700);locatePad.axes[2]=0;},side);
    }else if(device==='touch'){
     const start={x:width/2,y:height*.45,id:1},end={...start,x:start.x+side*(Math.PI/2)/(.004*1280/width)};
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[end]});await p.evaluate(()=>advanceTime(20));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }else{
     const x=side<0?width*.7:width*.3,y=height*.45;await p.mouse.move(x,y);await p.mouse.down();
     // Continuous small real pointer moves respect the shared mouse-rate cap.
     for(let i=1;i<=22;i++){await p.mouse.move(x+side*i*30,y);await p.evaluate(()=>advanceTime(50));}
     await p.mouse.up();
    }
    await p.evaluate(()=>advanceTime(0));
    const after=await p.evaluate(async()=>{const {observeJoe}=await import('./under-green-senses.js'),s=JSON.parse(render_game_to_text());return {caption:document.querySelector('#caption').textContent,observed:observeJoe(__underGreen.run,{fov:s.comfort.fov,aspect:innerWidth/innerHeight}),player:s.player,mode:s.mode,input:s.inputMethod};});
    assert(after.observed.visible,JSON.stringify(after));assert.equal(after.player.x,-20);assert.equal(after.player.y,38);assert.equal(after.mode,'under_green_playing');assert(!after.caption.includes('LOOK TOWARD THE SOUND'));
    await p.screenshot({path:`${out}/located-${width}-${side}.png`});results.push({width,height,device,side,before,metrics,after});
   }
   await p.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:true,results,errors,limits:['Controlled clear-room encounter tests actual look input and cue legibility, not natural-route comprehension or fear.','Gamepad API and touch are emulated; physical-device validation remains open.']},null,2));console.log(JSON.stringify({passed:true,cases:results.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
