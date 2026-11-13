const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/visual-upgrade/pass18-hud';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],checks=[],errors=[];
 try{
  for(const before of [true,false]){
   const p=await browser.newPage({viewport:{width:2560,height:1600},hasTouch:true});
   p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.addInitScript(()=>{window.hudPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[hudPad];});
   if(before)for(const file of ['under-green.html','under-green.js'])await p.route('**/'+file+'*',r=>r.fulfill({contentType:file.endsWith('html')?'text/html':'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade/pass18-source/'+file,'utf8')}));
   await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});
   await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
   await p.evaluate(()=>advanceTime(0));
   await p.click('#primary');await p.keyboard.press('Escape');
   const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
   async function fixture(name){
    await p.evaluate(async name=>{
     const {createRun}=await import('./under-green-sim.js'),{LEVER,SLUICE}=await import('./under-green-course.js');
     const r=createRun();Object.assign(r,{mode:'playing',time:4,elapsed:30});r.joe.phase='absent';Object.assign(r.player,{x:0,y:5,yaw:0,pitch:0});
     if(name.startsWith('water')){Object.assign(r.player,{x:0,y:20.5,yaw:0});r.time=name==='water-surge'?11:name==='water-receding'?14.5:name==='water-warning'?9.3:name==='water-walk'?7.3:4.5;}
     if(name==='water-walk')Object.assign(r.player,{focus:true,crouched:true,crossingSpeed:1.44});
     if(name==='pump'){Object.assign(r.player,{x:LEVER.x-1.7,y:LEVER.y,yaw:Math.PI/2});Object.assign(r.joe,{phase:'search',x:LEVER.x+3,y:LEVER.y,last:{x:LEVER.x+3,y:LEVER.y}});}
     if(name==='release'){r.bypass=true;Object.assign(r.player,{x:SLUICE.x-1.4,y:SLUICE.y,yaw:Math.PI/2});}
     if(name==='record'){r.bypass=true;r.evidence=true;Object.assign(r.player,{x:12,y:19,yaw:Math.PI});}
     __underGreen.clearInput();__underGreen.run=r;advanceTime(0);await __underGreen.whenPresented();
    },name);
   }
   async function device(kind){
    if(kind==='touch'){await p.touchscreen.tap((await p.viewportSize()).width*.58,(await p.viewportSize()).height*.45);await tick(0);}
    else if(kind==='gamepad'){await p.evaluate(()=>{hudPad.buttons[11].pressed=true;advanceTime(17);hudPad.buttons[11].pressed=false;advanceTime(500);});}
    else {await p.keyboard.press('Alt');await tick(0);}
   }
   async function capture(name,{allowCenter=false}={}){
    await p.evaluate(()=>__underGreen.whenPresented());
    const row=await p.evaluate(()=>{
     const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
     const selectors=['#objective-card','#objective','#district','#focus-state','#record-status','.hud-tools','#water-read','#water-phase','#water-advice','#caption','#use','#hint','#touch .pad','#touch .touch-actions'];
     const boxes=selectors.map(id=>{const e=document.querySelector(id),r=e.getBoundingClientRect(),s=getComputedStyle(e);return {id,text:e.textContent,visible:visible(e),x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontFamily,size:s.fontSize,color:s.color,scroll:e.scrollWidth>e.clientWidth+1};});
     return {viewport:[innerWidth,innerHeight],boxes,state:JSON.parse(render_game_to_text()),caption:document.querySelector('#caption').textContent};
    });
    const [width,height]=row.viewport,vis=row.boxes.filter(b=>b.visible&&b.w>0&&b.h>0);
    const filename=`${before?'before':'after'}-${name}-${width}.png`;await p.screenshot({path:out+'/'+filename});views.push({before,name,filename,...row});
    if(!before){
     for(const b of vis)assert(b.x>=-.1&&b.y>=-.1&&b.x+b.w<=width+.5&&b.y+b.h<=height+.5&&!b.scroll,JSON.stringify({name,box:b}));
     const panels=vis.filter(b=>['#objective-card','.hud-tools','#water-read','#caption','#use','#hint','#touch .pad','#touch .touch-actions'].includes(b.id));
     for(let i=0;i<panels.length;i++)for(let j=i+1;j<panels.length;j++){
      const a=panels[i],b=panels[j],area=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
      assert(area<1,JSON.stringify({name,viewport:row.viewport,overlap:[a.id,b.id],area}));
     }
     assert.match(row.boxes.find(b=>b.id==='#objective').font,/Courier New/);
     if(!allowCenter)for(const b of panels)assert(!(b.x<width*.55&&b.x+b.w>width*.45&&b.y<height*.55&&b.y+b.h>height*.45),name+' covers aiming centre');
    }
    return row;
   }
   for(const [width,height]of before?[[2560,1600],[390,844]]:[[2560,1600],[1280,720],[390,844],[844,390]]){
    await p.setViewportSize({width,height});await device(width<900?'touch':width===1280?'gamepad':'keyboard');
    for(const name of before?['gallery','pump']:['gallery','water-low','water-walk','water-warning','water-surge','water-receding','pump','release','record']){
     await fixture(name);const v=await capture(name);
     if(!before&&name==='water-walk'){assert.match(v.boxes.find(b=>b.id==='#water-phase').text,/WALK/);assert.equal(await p.locator('#water-read').getAttribute('data-walk-option'),'true');}
    }
   }
   if(!before){
    // Actual keyboard E and Q, with no action/noise narration by default.
    await p.setViewportSize({width:2560,height:1600});await device('keyboard');await fixture('pump');
    assert.match(await p.locator('#use').innerText(),/^E ·/);assert.equal(await p.locator('#caption').innerText(),'');
    await p.keyboard.press('Enter');await tick(17);assert.equal(await p.evaluate(()=>__underGreen.run.bypass),false);
    await p.keyboard.press('e');await tick(17);assert.equal(await p.evaluate(()=>__underGreen.run.bypass),true);assert.equal(await p.locator('#caption').innerText(),'');
    assert.equal(await p.locator('#objective').innerText(),'Reach the keeper’s sluice');
    await p.keyboard.down('q');await tick(400);assert(Math.abs(await p.evaluate(()=>__underGreen.run.player.rearAngle))>3);await p.keyboard.up('q');await tick(400);assert(Math.abs(await p.evaluate(()=>__underGreen.run.player.rearAngle))<.01);
    checks.push('E operates the lever; Enter does not. Q glances and returns. No default action or sound banner.');
    await p.keyboard.press('Escape');const time=await p.evaluate(()=>__underGreen.run.time);await tick(700);assert.equal(await p.evaluate(()=>__underGreen.run.time),time);
    assert.match(await p.locator('#paused-objective').innerText(),/ahead of Joe/);
    await p.locator('#comfort summary').click();await p.locator('[data-campaign=soundCaptions]').check();await p.locator('[data-campaign=muted]').check();await p.locator('[data-campaign=subtitleSize]').focus();await p.keyboard.press('End');
    await p.click('#primary');await fixture('pump');assert.match(await p.locator('#caption').innerText(),/Heavy breathing/);
    for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await device(width<900?'touch':'keyboard');await fixture('pump');await capture('maximum-sound-caption');}
    checks.push('Pause freezes time and retains full route guidance; optional sound descriptions wrap at 140% beside the use prompt at all four sizes.');
    // Actual remapping: the long labels and both slow stances must remain clear.
    await p.setViewportSize({width:390,height:844});await device('keyboard');await fixture('gallery');await p.keyboard.press('Escape');
    await p.locator('[data-binding=crouch]').selectOption('NumpadSubtract');await p.locator('[data-binding=focus]').selectOption('NumpadMultiply');await p.click('#primary');
    await fixture('water-walk');await capture('long-binding-walk');
    await p.keyboard.down('NumpadSubtract');await p.keyboard.down('NumpadMultiply');await tick(17);assert(await p.evaluate(()=>__underGreen.run.player.focus&&__underGreen.run.player.crouched));
    await p.keyboard.up('NumpadSubtract');await p.keyboard.up('NumpadMultiply');await tick(17);assert(await p.evaluate(()=>!__underGreen.run.player.focus&&!__underGreen.run.player.crouched));
    checks.push('Remapped long stance labels remain bounded; actual key holds and releases control both stances.');
    // Controller and touch use run the same real interaction path.
    await fixture('pump');await device('gamepad');assert.match(await p.locator('#use').innerText(),/^A ·/);
    await p.evaluate(()=>{hudPad.buttons[0].pressed=true;advanceTime(17);hudPad.buttons[0].pressed=false;advanceTime(17);});assert(await p.evaluate(()=>__underGreen.run.bypass));
    await fixture('pump');await device('touch');await p.locator('[data-key=use]').tap();await tick(17);assert(await p.evaluate(()=>__underGreen.run.bypass));
    await fixture('release');await device('keyboard');await p.keyboard.press('e');await tick(17);assert(await p.evaluate(()=>__underGreen.run.closing));
    for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await tick(0);assert(await p.locator('#objective').isVisible());await capture('closing');}
    assert.equal(await p.locator('#objective').textContent(),'Stay inside until the barrier seals');
    await p.keyboard.down('q');await tick(400);assert(await p.locator('#objective').isVisible());await capture('closing-rear');await p.keyboard.up('q');
    await tick(6000);assert(await p.evaluate(()=>__underGreen.run.finished));await capture('secured');
    checks.push('Controller A and touch Use operate the pump. E starts sluice closure; the stay-inside commitment remains visible at four sizes and during Q, through secured aftermath.');
   }
   console.log(JSON.stringify({before,views:views.filter(v=>v.before===before).length}));await p.close();
  }
  for(const old of views.filter(v=>v.before)){const current=views.find(v=>!v.before&&v.name===old.name&&v.viewport[0]===old.viewport[0]);for(const key of ['resolution','draws','triangles','textures'])assert.deepEqual(current.state.graphics[key],old.state.graphics[key]);}
  checks.push('Four paired views retain identical scene resolution, draws, triangles and texture counts.');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,views,errors,limits:['Controlled placement, not a full escape route.','Gamepad and touch emulated; native D3D11 rendering.','No world geometry/material/lighting changes; no frame-time claim.']},null,2));console.log(JSON.stringify({passed:true,views:views.length,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
