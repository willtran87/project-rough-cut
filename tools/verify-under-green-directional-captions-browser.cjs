const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/directional-captions';
 const cases=JSON.parse(fs.readFileSync('output/under-green/range-captures/diagnostic.json')).reports.map(({name})=>JSON.parse(fs.readFileSync(`output/under-green/range-captures/${name}.json`)));
 const {step}=await import('../web/under-green-sim.js');
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],results=[],errors=[];
 try{
  for(const [width,height,device]of [[2560,1600,'keyboard'],[1280,720,'gamepad'],[844,390,'touch'],[390,844,'touch']]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:device==='touch',isMobile:width<500}),p=await context.newPage();
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   if(device==='gamepad')await p.addInitScript(()=>{window.directionPad={id:'Directional captions',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[directionPad];});
   const cdp=device==='touch'?await context.newCDPSession(p):null;
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
   await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');await p.locator('#comfort summary').click();
   await p.locator('[data-campaign=muted]').check();await p.locator('[data-campaign=subtitles]').uncheck();await p.locator('[data-campaign=threatCaptions]').uncheck();await p.locator('[data-campaign=soundCaptions]').check();
   await p.locator('[data-campaign=subtitleSize]').focus();await p.keyboard.press('End');assert.equal(await p.locator('[data-campaign=subtitleSize]').inputValue(),'1.4');
   await p.click('#primary');await p.evaluate(()=>advanceTime(0));
   async function install(run){
    if(device==='gamepad')await p.evaluate(()=>{directionPad.axes[0]=directionPad.axes[1]=0;advanceTime(1000/60);});
    await p.evaluate(r=>{__underGreen.run=structuredClone(r);__underGreen.clearInput();advanceTime(0);},run);
    if(device==='touch')await p.touchscreen.tap(width/2,height/2);
    // A real update synchronizes the mix with the injected physical state;
    // advanceTime(0) redraws only and leaves the previous fixture's audio target.
    await p.evaluate(()=>advanceTime(1000/60-1e-6));
   }
   async function capture(name){
    await p.evaluate(()=>__underGreen.whenPresented());
    const view=await p.evaluate(async()=>{
     const r=__underGreen.run,s=JSON.parse(render_game_to_text()),{observeJoe}=await import('./under-green-senses.js'),c=document.getElementById('game'),caption=document.getElementById('caption'),box=caption.getBoundingClientRect();
     const overlaps=[...document.querySelectorAll('#touch button')].filter(b=>!document.getElementById('touch').hidden).filter(b=>{const a=b.getBoundingClientRect();return a.left<box.right&&a.right>box.left&&a.top<box.bottom&&a.bottom>box.top;}).length;
     return {caption:caption.textContent,kind:caption.dataset.kind,box:{x:box.x,y:box.y,width:box.width,height:box.height},overlaps,observed:observeJoe(r,{fov:s.comfort.fov,aspect:c.clientWidth/c.clientHeight}),audio:s.audio,campaign:s.campaign,touch:!document.getElementById('touch').hidden,mode:r.mode,hits:r.waterHits,elapsed:r.elapsed,player:r.player,joe:r.joe};
    });
    assert(view.box.x>=0&&view.box.y>=0&&view.box.x+view.box.width<=width+.1&&view.box.y+view.box.height<=height+.1);assert.equal(view.overlaps,0);
    if(device==='touch')assert(view.touch);
    const file=`${out}/${name}-${width}.png`;await p.screenshot({path:file});views.push({name,width,height,device,file,...view});
    fs.writeFileSync(out+'/browser-partial.json',JSON.stringify({views,results,errors},null,2));return view;
   }
   for(const item of cases){
    await install(item.windup);const cue=await capture(item.name+'-cue');
    assert(!cue.observed.visible&&cue.observed.imminent);assert(cue.caption.includes(cue.observed.pan<0?'to your left':'to your right'));assert.equal(cue.kind,'danger');assert(cue.campaign.muted&&!cue.campaign.threatCaptions&&!cue.campaign.subtitles);assert.equal(cue.campaign.subtitleSize,1.4);
    assert(Math.abs(cue.audio.targets.joePan-cue.observed.pan)<1e-7);
    const expected=structuredClone(item.windup);step(expected,{});for(let frame=0;frame<90;frame++)step(expected,frame<15?{}:{strafe:1});
    await p.evaluate(()=>advanceTime(250-1e-6));
    if(device==='keyboard')await p.keyboard.down('d');
    else if(device==='gamepad')await p.evaluate(()=>directionPad.axes[0]=1);
    else{const b=await p.locator('[data-key="right"]').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}]});}
    await p.evaluate(()=>advanceTime(1250-1e-6));
    if(device==='keyboard')await p.keyboard.up('d');
    else if(device==='gamepad')await p.evaluate(()=>directionPad.axes[0]=0);
    else await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    const escaped=await capture(item.name+'-evade');assert.equal(escaped.mode,'playing');assert.equal(escaped.hits,0);
    assert(Math.hypot(escaped.player.x-expected.player.x,escaped.player.y-expected.player.y)<1e-7);assert(Math.abs(escaped.elapsed-expected.elapsed)<1e-7);
    results.push({name:item.name,width,device,gap:Math.hypot(escaped.player.x-escaped.joe.x,escaped.player.y-escaped.joe.y),mode:escaped.mode,hits:escaped.hits});
   }
   // Actual held rear view reverses the same audio pan and caption side.
   const fixture=await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(1);r.mode='playing';r.time=0;r.elapsed=20;r.messageTime=0;Object.assign(r.player,{x:0,y:54,yaw:0,pitch:0});Object.assign(r.joe,{x:2,y:54,yaw:-Math.PI/2,phase:'windup',age:.1});return r;});
   await install(fixture);const front=await capture('lateral-right');assert.match(front.caption,/to your right/);
   await p.keyboard.down('r');await p.evaluate(()=>advanceTime(350));await p.keyboard.up('r');
   if(device==='touch'){await p.touchscreen.tap(width/2,height/2);await p.evaluate(()=>advanceTime(0));}
   const rear=await capture('rear-left');assert.match(rear.caption,/to your left/);assert(rear.audio.targets.joePan<-.9);
   await install({...fixture,joe:{...fixture.joe,phase:'search'}});
   const heard=await capture('sound-only');assert.match(heard.caption,/motor rattles nearby to your right/);assert(!/search/i.test(heard.caption));
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,results,errors,limits:['Maximum caption size with muted audio and optional pursuit/dialogue captions disabled; source direction matches the actual mixer target.','Actual keyboard, emulated controller and browser touch inputs perform a short evasion from preserved windup states. No claim of a full escape or unfamiliar-player comprehension.']},null,2));
  console.log(JSON.stringify({passed:true,views:views.length,replays:results.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
