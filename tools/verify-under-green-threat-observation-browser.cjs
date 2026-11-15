const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/threat-observation',b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],views=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);await tick(0);await p.click('#primary');
  async function place(phase='search',close=false){await p.evaluate(async({phase,close})=>{
   const {createRun}=await import('./under-green-sim.js');const r=createRun(1);r.mode='playing';r.messageTime=0;r.elapsed=20;
   Object.assign(r.player,{x:0,y:54,yaw:Math.PI,pitch:0,eyeHeight:1.65});Object.assign(r.joe,{x:0,y:close?56:59,yaw:0,phase,age:.1,last:{x:0,y:59},speed:0,closingRate:0,seen:false});
   __underGreen.run=r;__underGreen.clearInput();advanceTime(0);
  },{phase,close});}
  await place();assert.match(await p.locator('#caption').innerText(),/TRIMMER IS AUDIBLE/);assert(!/SEARCHING/.test(await p.locator('#caption').innerText()));
  await p.keyboard.down('r');await tick(350);assert(!/TRIMMER IS AUDIBLE/.test(await p.locator('#caption').innerText()));await p.keyboard.up('r');await tick(600);assert.match(await p.locator('#caption').innerText(),/TRIMMER IS AUDIBLE/);
  checks.push('Actual rear glance changes heard-only guidance into visible-state guidance, then returns to heard-only after release');
  for(const phase of ['water-wait','recover']){await place(phase);assert.match(await p.locator('#caption').innerText(),/TRIMMER IS AUDIBLE/);}
  await place('windup',true);await p.evaluate(()=>{__underGreen.run.message='Checkpoint saved';__underGreen.run.messageTime=3;advanceTime(0);});assert.match(await p.locator('#caption').innerText(),/revs close by/);assert.equal(await p.locator('#caption').getAttribute('data-kind'),'danger');
  await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);
  await p.locator('[data-campaign=threatCaptions]').uncheck();await p.locator('[data-campaign=subtitles]').uncheck();await p.locator('[data-campaign=soundCaptions]').check();await p.locator('[data-campaign=muted]').check();await p.click('#primary');await tick(0);
  assert.match(await p.locator('#caption').innerText(),/revs close by/);
  await place();assert.match(await p.locator('#caption').innerText(),/motor rattles/);assert(!/SEARCHING/.test(await p.locator('#caption').innerText()));
  await p.keyboard.press('Escape');await p.locator('[data-campaign=threatCaptions]').check();await p.click('#primary');await tick(0);
  checks.push('Close unseen attack warning wins over checkpoint coaching and remains available with dialogue/threat captions disabled and sound muted');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await place();await p.evaluate(()=>{
    const r=__underGreen.run;Object.assign(r.player,{x:-20,y:38,yaw:0,pitch:0});Object.assign(r.joe,{x:-17.5,y:42.5,phase:'search'});advanceTime(0);
   });
   if(width<900){await p.locator('#game').dispatchEvent('pointerdown',{pointerType:'touch',pointerId:5,clientX:width*.6,clientY:height*.4});await p.locator('#game').dispatchEvent('pointerup',{pointerType:'touch',pointerId:5});await tick(0);assert(await p.locator('#touch').isVisible());}
   const observed=await p.evaluate(async()=>{const {observeJoe}=await import('./under-green-senses.js'),c=document.getElementById('game'),s=JSON.parse(render_game_to_text());return observeJoe(__underGreen.run,{fov:s.comfort.fov,aspect:c.clientWidth/c.clientHeight});});
   const text=await p.locator('#caption').innerText();assert.equal(observed.visible,width!==390);assert.match(text,width===390?/TRIMMER IS AUDIBLE/:/SEARCHING/);
   const box=await p.locator('#caption').boundingBox();assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height);
   await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/view-${width}.png`});views.push({width,height,observed,text,box});
  }
  await place('search');await p.evaluate(()=>{const r=__underGreen.run;Object.assign(r.player,{x:0,y:43,yaw:-Math.PI/2});Object.assign(r.joe,{x:-5.35,y:45.1});advanceTime(0);});assert.match(await p.locator('#caption').innerText(),/TRIMMER IS AUDIBLE/);
  checks.push('Actual viewport aspect and opaque service wall constrain state captions; four-size HUD screenshots remain readable');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
