const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/scythes';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});const errors=[],views=[];try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});assert.equal(await p.locator('#camera-bob').inputValue(),'0.25');await p.click('#primary');await p.keyboard.press('Escape'); // Skip the chapter intro before gameplay input checks.
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 async function place(ghost=false,phase='walk'){
  await p.evaluate(async({ghost,phase})=>{const {createRun}=await import('./under-green-sim.js');const {settleWeapon}=await import('./under-green-clearance.js');const r=createRun();r.mode='playing';r.elapsed=ghost?10:20;r.messageTime=0;Object.assign(r.player,ghost?{x:0,y:19,yaw:0}:{x:-1.4,y:49,yaw:Math.atan2(1.4,5)});if(!ghost){Object.assign(r.joe,{x:0,y:54,yaw:Math.PI,phase,age:phase==='windup'?.5:0,speed:0,walk:0});settleWeapon(r,1/60);}__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},{ghost,phase});
 }
 async function capture(name){await p.evaluate(()=>__underGreen.whenPresented());const s=await read();await p.screenshot({path:`${out}/${name}.png`});views.push({name,actor:s.graphics.actor,ghost:s.graphics.ghost,camera:s.graphics.camera});return s;}
 for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){
  await p.setViewportSize({width,height});await place();const s=await capture('joe-'+width);assert.equal(s.graphics.actor.weapon,'grass-scythe');assert(s.graphics.actor.handError<.015);
  const geometry=await p.evaluate(()=>__underGreen.inspectJoeGeometry());assert.deepEqual(geometry.hits,[]);
  await place(true);await p.evaluate(()=>advanceTime(1800));const g=await capture('shadow-'+width);assert(g.graphics.ghost.visible);assert.equal(g.graphics.ghost.weapon,'grass-scythe');assert.equal(g.graphics.ghost.style,'dark-shadow');assert.equal(g.graphics.ghost.drawCalls,1);
  assert.equal(await p.locator('#vignette').evaluate(e=>getComputedStyle(e).pointerEvents),'none');assert.match(await p.locator('#vignette').evaluate(e=>getComputedStyle(e).backgroundImage),/radial-gradient/);assert.equal(await p.locator('#caption').textContent(),'');
 }
 await p.setViewportSize({width:1280,height:720});await place(false,'windup');await p.evaluate(()=>advanceTime(17));const attack=await capture('scythe-windup');assert.equal(attack.audio.targets.weapon,'grass-scythe');assert(attack.audio.targets.bladeSwish>0);assert.equal(attack.audio.counts.starter,0);assert.equal(attack.audio.voices,16);
 await place(true);await p.keyboard.down('w');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('w');const defaultMotion=await read();fs.writeFileSync(out+'/motion-diagnostic.json',JSON.stringify(defaultMotion,null,2));assert(Math.abs(defaultMotion.graphics.camera.roll)>.0001,'chapter default adds motion: '+JSON.stringify({player:defaultMotion.player,camera:defaultMotion.graphics.camera,mode:defaultMotion.mode}));
 await p.keyboard.press('Escape');await p.locator('#comfort summary').click();await p.locator('#camera-bob').fill('0.6');await p.locator('#camera-bob').dispatchEvent('input');await p.click('#primary');
 await place(true);await p.keyboard.down('w');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('w');const moving=await read();assert(Math.abs(moving.graphics.camera.roll)>.0001);assert(Math.abs(moving.graphics.camera.height-moving.player.eyeHeight)<=.04);
 await p.keyboard.press('Escape');const frozen=(await read()).graphics.camera;await p.evaluate(()=>advanceTime(1000));assert.deepEqual((await read()).graphics.camera,frozen);
 await p.locator('#reduced').check();await p.click('#primary');await p.keyboard.down('w');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('w');const reduced=await read();assert.equal(reduced.graphics.camera.roll,0);assert.equal(reduced.graphics.camera.pitch,reduced.player.pitch);assert.equal(reduced.graphics.camera.height,reduced.player.eyeHeight);
 await p.keyboard.press('Escape');await p.locator('#camera-bob').fill('0');await p.locator('#camera-bob').dispatchEvent('input');await p.locator('#reduced').uncheck();
 assert.equal(await p.evaluate(()=>localStorage.getItem('rough-cut.feel.v1')),null,'chapter bob leaves global comfort untouched');
 await p.reload();await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});assert.equal(await p.locator('#camera-bob').inputValue(),'0');await p.click('#primary');await p.keyboard.down('w');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('w');assert.equal((await read()).graphics.camera.roll,0,'zero persists and disables motion');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,moving:moving.graphics.camera,reduced:reduced.graphics.camera,errors},null,2));console.log(JSON.stringify({passed:true,views:views.length,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
