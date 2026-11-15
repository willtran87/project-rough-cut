const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/back-nine-experience/stick-controls',baseline=process.argv.includes('--baseline'),errors=[],rows=[];
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');
   if(!localStorage.getItem('stick-test-seeded')){localStorage.setItem('rough-cut.settings.v1',JSON.stringify({stickDeadzone:.3,volume:.37,extension:{keep:true}}));localStorage.setItem('stick-test-seeded','1');}
   window.testPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[testPad];
  });
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  async function visit(){await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await tick(0);await p.click('#primary');await tick(17);}
  async function stage(foot){await p.evaluate(async foot=>{
   const{createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js');
   const r=createRun();r.mode='driving';r.time=20;r.grace=100;Object.assign(r.cart,{x:0,y:foot?40:50,yaw:0,speed:0});Object.assign(r.joe,{x:0,y:0});r.departure.phase='finished';
   if(foot){leaveBrokenCart(r);r.time+=2;Object.assign(r.foot,{x:0,y:50,yaw:0,viewYaw:0,speed:0,invulnerable:10});}
   __backNine.run=r;testPad.axes.fill(0);for(const b of testPad.buttons){b.pressed=false;b.value=0;}await advanceTime(17);
  },foot);}
  async function drive(foot,x,y=0){await stage(foot);await p.evaluate(({x,y,foot})=>{testPad.axes[0]=x;testPad.axes[1]=y;if(!foot)testPad.buttons[7]={pressed:true,value:1};},{x,y,foot});await tick(500);const s=await read();const row={foot,x,y,yaw:s.player.yaw,position:[s.player.x,s.player.y],speed:s.player.speed};rows.push(row);return row;}
  await visit();const drift=await drive(false,.24);
  if(baseline)fs.writeFileSync(out+'/baseline.json',JSON.stringify({drift,errors},null,2));
  assert.equal(drift.yaw,0,'Saved 0.30 deadzone must reject 0.24 steering drift');
  if(baseline)return;
  for(const foot of [false,true])for(const x of [-.3,-.15,0,.15,.3])assert.equal((await drive(foot,x)).yaw,0);
  assert.equal((await drive(true,0,-.24)).position[1],50,'Foot throttle must also reject drift');
  const small=await drive(true,.301),medium=await drive(true,.65),full=await drive(true,1),left=await drive(true,-1);
  assert(small.yaw>0&&small.yaw<.01,'Crossing the deadzone must not jump to 30% steering');assert(medium.yaw>small.yaw&&full.yaw>medium.yaw);assert(Math.abs(full.yaw+left.yaw)<1e-9);
  assert((await drive(true,0,-1)).position[1]>51);assert((await drive(true,0,1)).position[1]<49);
  // Real settings UI updates the live chase and persists without clobbering unrelated fields.
  await stage(false);await p.keyboard.press('Escape');await p.locator('#chase-comfort > summary').click();
  const slider=p.locator('[data-campaign="stickDeadzone"]');assert.equal(await slider.inputValue(),'0.3');
  await slider.evaluate(e=>{e.value='.1';e.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal((await read()).campaign.stickDeadzone,.1);
  for(const[width,height]of [[2560,1600],[1280,720],[844,390]]){await p.setViewportSize({width,height});await slider.scrollIntoViewIfNeeded();const bounds=await slider.evaluate(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,bottom:e.getBoundingClientRect().bottom,footer:document.querySelector('#panel-footer').getBoundingClientRect().top}));assert(bounds.left>=0&&bounds.right<=width&&bounds.bottom<=bounds.footer+1,JSON.stringify(bounds));await p.screenshot({path:`${out}/settings-${width}.png`});}
  await p.keyboard.press('Escape');assert((await drive(true,.15)).yaw>0);assert.equal((await drive(true,.1)).yaw,0);
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')));assert.equal(saved.stickDeadzone,.1);assert.equal(saved.volume,.37);assert.deepEqual(saved.extension,{keep:true});
  await visit();assert.equal((await read()).campaign.stickDeadzone,.1);assert((await drive(true,.15)).yaw>0);
  await stage(true);await p.keyboard.down('KeyW');await tick(400);await p.keyboard.up('KeyW');const before=(await read()).player;await p.mouse.move(500,100);await p.mouse.move(800,350);await tick(100);assert.equal((await read()).player.yaw,before.yaw);
  await p.keyboard.down('KeyQ');await tick(350);await p.keyboard.up('KeyQ');assert((await read()).player.rearBlend>.99);
  await tick(500);assert((await read()).player.rearBlend<.01);await p.screenshot({path:out+'/foot-follow.png'});
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/results.json',JSON.stringify({passed:true,rows,saved,errors},null,2));console.log(JSON.stringify({passed:true,cases:rows.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
