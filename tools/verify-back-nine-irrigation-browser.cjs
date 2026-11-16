const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2]||'output/back-nine-visual-upgrade/irrigation/browser';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[],checks=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const prepared=(await read()).graphics;
 const present=()=>p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});
 const shot=async name=>{await present();await p.screenshot({path:`${out}/${name}.png`});samples.push({name,state:await read()});};
 async function stage(zone,active,close=false,boosted=false){await p.evaluate(async({zone,active,close,boosted})=>{
  const {createRun}=await import('./back-nine-sim.js'),{irrigationPhase}=await import('./chase-irrigation.js');const r=createRun(0,0,713),w=__backNine.COURSE.wet[zone];r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;
  while(irrigationPhase(r,zone).active!==active)r.time+=.1;
  if(boosted)r.tactics.floodUntil[zone]=r.time+14;
  Object.assign(r.cart,{x:w.x,y:w.y-(close?3:18),yaw:0,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0});
  if(close){r.cart.health=0;r.cart.failedAt=0;r.cart.x=35;r.cart.y=10;r.foot={x:w.x+2,y:w.y-4,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};}
  __backNine.run=r;
 },{zone,active,close,boosted});await present();}
 for(let i=0;i<3;i++){
  await stage(i,false);await shot(`zone-${i}-dry`);assert(!samples.at(-1).state.graphics.irrigationArt.waterVisible[i]);
  await stage(i,true);await shot(`zone-${i}-wet`);assert(samples.at(-1).state.graphics.irrigationArt.waterVisible[i]);
 }
 await stage(0,true,true);await shot('head-normal');const normal=await read();await p.evaluate(()=>advanceTime(500));await shot('head-rotated');assert.notEqual((await read()).graphics.irrigationArt.heads[0].yaw,normal.graphics.irrigationArt.heads[0].yaw);
 await stage(0,true,true,true);await shot('head-boosted');assert.equal((await read()).graphics.irrigationArt.drops,32);checks.push('Three natural wet/dry cycles, normal head rotation and increased pressure presentation');
 await p.keyboard.press('Escape');const paused=await read();await p.evaluate(()=>advanceTime(1000));assert.deepEqual((await read()).graphics.irrigationArt,paused.graphics.irrigationArt);await p.locator('#primary').click();
 await p.evaluate(()=>{const c=document.getElementById('chase-reduced');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));});await present();let s=await read();assert(s.graphics.irrigationArt.drops>0);assert(s.graphics.irrigationArt.ripples>0);assert(s.graphics.irrigationArt.waterVisible[0]);await shot('reduced-motion');checks.push('Actual pause freezes irrigation art; reduced motion keeps the sprinklers running');
 await p.evaluate(()=>{const c=document.getElementById('chase-reduced');c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}));});
 await p.setViewportSize({width:1280,height:720});await shot('head-1280');await p.setViewportSize({width:390,height:844});await shot('head-390');
 s=await read();assert.equal(s.graphics.programs,prepared.programs);assert.equal(s.graphics.textures,prepared.textures);assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,samples,errors},null,2));console.log(JSON.stringify({passed:true,checks,programs:s.graphics.programs,textures:s.graphics.textures,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
