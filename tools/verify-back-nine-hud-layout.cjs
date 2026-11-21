const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.argv[2],before=process.argv.includes('--before'),software=process.argv.includes('--software');
assert(out,'Provide output directory');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});const samples=[],errors=[];
 try{
  for(const touch of [false,true]){
   const p=await browser.newPage({viewport:{width:2560,height:1600},hasTouch:touch});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   if(before)await p.route('**/back-nine-hud-layout.css*',r=>r.fulfill({contentType:'text/css',body:''}));
   await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
   await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
   await p.click('#primary');await p.evaluate(()=>advanceTime(0));
   await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:-36.5,y:343,yaw:0,viewYaw:0,viewPitch:.32,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;});
   const shot=async(name,stress=false)=>{
    await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});
    if(stress)await p.evaluate(()=>{const s=document.getElementById('game-shell');s.dataset.message='true';s.style.setProperty('--caption-scale','1.5');document.getElementById('caption').textContent='JOE IS LINING UP A RAM. Move sideways, then take the narrow footpath.';document.getElementById('sound-caption').textContent='Mower accelerating behind you. Metal strikes the fence to your left.';});
    const layout=await p.evaluate(()=>{
     const rect=selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right,display:getComputedStyle(e).display,text:e.textContent,scroll:e.scrollWidth,client:e.clientWidth};};
     const boxes=Object.fromEntries(['#game','#game-shell','#dread','#impact-edge','.objective','.tools','.dashboard','#message-rails','#touch','#hint','#caption','#sound-caption','#objective','#distance'].map(s=>[s,rect(s)]));
     return{boxes,buttons:[...document.querySelectorAll('.tools button,#touch button')].filter(e=>e.getClientRects().length).map(e=>({label:e.textContent,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})),state:JSON.parse(render_game_to_text()),viewport:[innerWidth,innerHeight],documentWidth:document.documentElement.scrollWidth};
    });
    fs.writeFileSync(out+'/latest-layout.json',JSON.stringify(layout,null,2));
    await p.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:93,fullPage:true});
    const b=layout.boxes,portrait=layout.viewport[0]<=620&&layout.viewport[0]<layout.viewport[1];
    if(!before&&portrait){
     assert(Math.abs(b['#game'].w/b['#game'].h-16/9)<.01,'preserve camera aspect');
     assert(b['.objective'].bottom<=b['#game'].y+.5&&b['.tools'].bottom<=b['#game'].y+.5,'header outside playfield');
     assert(b['.dashboard'].y>=b['#game'].bottom-.5&&b['#message-rails'].y>=b['.dashboard'].bottom-.5,'status/captions outside playfield');
     if(touch)assert(b['#touch'].y>=b['#message-rails'].bottom-.5,'touch controls below captions');
     assert(b['#objective'].display!=='none'&&b['#distance'].display!=='none','goal remains available during messages');
     assert(layout.documentWidth<=layout.viewport[0],'no horizontal overflow');
     assert(b['#game-shell'].h<=layout.viewport[1]+1,'all live controls fit viewport height');
     for(const effect of ['#dread','#impact-edge'])for(const axis of ['x','y','w','h'])assert(Math.abs(b[effect][axis]-b['#game'][axis])<1,'effects remain anchored to canvas');
     for(const button of layout.buttons)assert(button.w>=44&&button.h>=44,'44px touch targets');
     for(const key of ['#objective','#distance','#caption','#sound-caption'])assert(b[key].scroll<=b[key].client+1,'no text clipping: '+key);
    }
    samples.push({name,stress,layout});console.log(name);
    if(stress)await p.evaluate(()=>document.getElementById('game-shell').style.removeProperty('--caption-scale'));
   };
   for(const [width,height]of (touch?[[844,390],[390,844],[320,568]]:[[2560,1600],[1280,720],[390,844]])){
    await p.setViewportSize({width,height});await shot(`${touch?'touch':'keyboard'}-${width}`);
   }
   if(touch){
    await shot('touch-320-captions',true);
    await p.setViewportSize({width:390,height:844});const y=await p.evaluate(()=>__backNine.run.foot.y);
    const gas=await p.locator('[data-drive="gas"]').boundingBox(),cdp=await p.context().newCDPSession(p);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:gas.x+gas.width/2,y:gas.y+gas.height/2}]});await p.evaluate(()=>advanceTime(500));
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();assert(await p.evaluate(()=>__backNine.run.foot.y)>y+2,'touch Run moves player');await shot('touch-run');
    await p.evaluate(()=>{__backNine.run.foot=null;Object.assign(__backNine.run.cart,{x:0,y:74,speed:0,health:23});});await shot('touch-damaged-cart');
    if(!before){await p.keyboard.press('f');await p.waitForFunction(()=>document.fullscreenElement);await shot('touch-fullscreen');await p.keyboard.press('f');await p.waitForFunction(()=>!document.fullscreenElement);}
   }
   await p.click('#pause');await p.evaluate(()=>advanceTime(100));assert.equal(await p.evaluate(()=>__backNine.run.mode),'paused');
   await p.screenshot({path:`${out}/${touch?'touch':'keyboard'}-paused.jpg`,type:'jpeg',quality:90});await p.click('#primary');assert.equal(await p.evaluate(()=>__backNine.run.mode),'driving');
   await p.click('#pause');await p.click('#restart');await p.evaluate(()=>advanceTime(17));assert.equal(await p.evaluate(()=>__backNine.run.mode),'briefing');await p.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,samples,errors},null,2));console.log('PASS');
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(out+'/report.json',JSON.stringify({passed:false,error:e.stack},null,2));console.error(e);process.exitCode=1;});
