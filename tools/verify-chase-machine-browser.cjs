const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const software=process.argv.includes('--software'),label=software?'software':'hardware',out='output/back-nine-experience/survival-audio';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[],layouts=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__buffers++;return f.apply(this,a);};});
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),before=await read(),buffers=await p.evaluate(()=>__buffers);
 async function scene(foot,warning=false){await p.evaluate(async({foot,warning})=>{
  const {createRun}=await import('./back-nine-sim.js');const r=createRun(1);r.mode='driving';r.time=20;r.grace=0;r.tension.phase='stalk';r.tension.cooldown=99;r.tension.zoneMask=7;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=65535;
  Object.assign(r.cart,{x:-25,y:440,yaw:0,speed:0});Object.assign(r.joe,{x:-5,y:425,speed:3,yaw:-Math.PI/2});if(foot){r.foot={...r.cart,onFoot:true,viewYaw:0,rearBlend:0};Object.assign(r.cart,{x:0,y:10,health:0});}
  if(warning){r.joe.ram.phase='lineup';r.joe.ram.age=.8;}
  __backNine.run=r;await advanceTime(17);
 },{foot,warning});}
 await scene(false);assert.equal((await read()).messages.sound,'');
 await p.keyboard.press('Escape');await p.locator('#chase-sound-captions').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change'));});await p.locator('#chase-subtitles').evaluate(e=>{e.checked=false;e.dispatchEvent(new Event('change'));});await p.keyboard.press('Escape');
 for(const foot of [false,true]){
  await scene(foot);let s=await read();assert(s.audio.spatial.pan>.4);assert.match(s.messages.sound,/to your right.*cover/);assert(!/search|sweep|interception/.test(s.messages.sound));samples.push(s);
  await p.keyboard.down('q');await tick(300);s=await read();assert(s.audio.spatial.pan<-.4);assert.match(s.messages.sound,/to your left.*cover/);assert.equal(s.player.yaw,0);samples.push(s);await p.screenshot({path:`${out}/${label}-${foot?'foot':'cart'}-rear-2560.png`});
  await p.keyboard.up('q');await tick(300);s=await read();assert(s.audio.spatial.pan>.4);assert.match(s.messages.sound,/to your right/);
 }
 await scene(true,true);assert.match((await read()).messages.sound,/engine rises/);
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
  await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});
  const layout=await p.evaluate(()=>{const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};return {sound:rect('sound-caption'),caption:rect('caption'),dashboard:document.querySelector('.dashboard').getBoundingClientRect().top,text:document.getElementById('sound-caption').textContent};});
  assert(layout.sound.left>=0&&layout.sound.right<=width);assert(layout.sound.bottom<=layout.dashboard);assert(layout.caption.bottom<=layout.sound.top);assert(layout.sound.top>=0);layouts.push({width,height,...layout});await p.screenshot({path:`${out}/${label}-warning-${width}.png`});
 }
 await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.stringify(__backNine.run));await tick(1000);assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),frozen);assert.equal((await read()).messages.sound,'');
 await p.locator('#chase-reduced').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change'));});await p.keyboard.press('Escape');await tick(17);assert((await read()).campaign.reducedMotion);assert.match((await read()).messages.sound,/engine rises/);
 // Muting does not remove accessibility equivalents; disabling captions does.
 await p.locator('#chase-muted').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change'));});assert((await read()).audio.muted);assert.match((await read()).messages.sound,/Mower/);
 await p.locator('#chase-sound-captions').evaluate(e=>{e.checked=false;e.dispatchEvent(new Event('change'));});assert.equal((await read()).messages.sound,'');
 const after=await read();assert.equal(after.graphics.programs,before.graphics.programs);assert.equal(after.graphics.textures,before.graphics.textures);assert.equal(after.audio.voices,12);assert.equal(await p.evaluate(()=>__buffers),buffers);assert.deepEqual(errors,[]);
 fs.writeFileSync(`${out}/${label}-browser.json`,JSON.stringify({passed:true,samples,layouts,before:before.graphics,after:after.graphics,buffers,errors},null,2));console.log(JSON.stringify({passed:true,label,directions:samples.length,viewports:layouts.length,programs:after.graphics.programs,textures:after.graphics.textures,buffers,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
