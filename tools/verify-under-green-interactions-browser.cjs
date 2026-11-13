const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/interactions';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],views=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:{interact:'KeyT'},keyboardBindingsVersion:2})));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));await tick(0);await p.click('#primary');
  async function place(name,range=1.7){await p.evaluate(async({name,range})=>{
   const {createRun}=await import('./under-green-sim.js'),{LEVER,NOTE,SLUICE}=await import('./under-green-course.js');
   const target={pump:LEVER,record:NOTE,gate:SLUICE}[name],r=createRun(name==='gate'?3:1);r.mode='playing';r.messageTime=0;r.elapsed=20;
   Object.assign(r.player,{x:target.x-range,y:target.y,yaw:range<0?-Math.PI/2:Math.PI/2});Object.assign(r.joe,{phase:'search',x:0,y:5,last:{x:0,y:5}});
   __underGreen.run=r;__underGreen.clearInput();advanceTime(0);
  },{name,range});}
  await place('pump',2.1);assert(await p.locator('#use').isHidden());await p.keyboard.press('e');await tick(17);assert(!/closer/.test(await p.locator('#caption').innerText()));
  await p.keyboard.press('t');await tick(17);assert.match(await p.locator('#caption').innerText(),/closer to the pump lever/);assert(!(await read()).bypass);
  await p.keyboard.down('w');await tick(200);await p.keyboard.up('w');assert.match(await p.locator('#use').innerText(),/^T ·/);assert.match(await p.locator('#caption').innerText(),/Drain the onward channel/);
  await p.keyboard.press('t');await tick(17);assert((await read()).bypass);assert.match(await p.locator('#caption').innerText(),/Bypass open/);
  await p.evaluate(()=>{__underGreen.run.messageTime=0;advanceTime(0);});await p.keyboard.press('t');await tick(17);assert.match(await p.locator('#caption').innerText(),/already open/);
  checks.push('Remapped Use produces feedback only on request, ordinary approach replaces it, and pump activation/repeated Use remain truthful');
  await place('pump');await p.evaluate(()=>{__underGreen.run.player.yaw=-Math.PI/2;advanceTime(0);});await p.keyboard.press('t');await tick(17);assert.match(await p.locator('#caption').innerText(),/Face a control/);assert(!(await read()).bypass);
  await p.keyboard.press('Escape');assert.equal((await read()).interactionFeedback,null);await p.click('#primary');await tick(2200);assert.equal((await read()).interactionFeedback,null);
  checks.push('A control behind the camera cannot activate or reveal its identity; requested feedback clears in pause and expires on simulation time');
  const cdp=await p.context().newCDPSession(p);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const name of ['pump','record','gate']){
    await place(name,name==='record'?-1:1.7);
    if(width<900){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:width*.6,y:height*.4}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tick(0);assert(await p.locator('#touch').isVisible());}
    const expected={pump:/Drain the onward channel/,record:/safely in Pause/,gate:/Stay inside/};assert.match(await p.locator('#caption').innerText(),expected[name]);
    const boxes=await p.evaluate(()=>Object.fromEntries(['caption','use'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [id,{x:r.x,y:r.y,w:r.width,h:r.height}];})));
    assert(Object.values(boxes).every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=width&&r.y+r.h<=height));
    assert(boxes.caption.y+boxes.caption.h<=boxes.use.y);
    await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/${name}-${width}.png`});views.push({width,height,name,boxes});
   }
  }
  await place('gate');await p.keyboard.press('t');await tick(300);assert((await read()).closing);assert.match(await p.locator('#caption').innerText(),/closing\. Stay inside/);
  await place('pump');await p.evaluate(()=>{const r=__underGreen.run;Object.assign(r.joe,{phase:'windup',x:r.player.x,y:r.player.y-1.5,yaw:0,attackYaw:0,age:.1});advanceTime(0);});assert.equal(await p.locator('#caption').getAttribute('data-kind'),'danger');assert.match(await p.locator('#caption').innerText(),/Move sideways/);
  checks.push('Pump/record/gate details and action buttons fit four viewports; closure repeats its commitment; imminent trimmer danger overrides interaction coaching');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,views,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
