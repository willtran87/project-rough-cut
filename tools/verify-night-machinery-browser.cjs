const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const out='output/night-machinery';fs.mkdirSync(out,{recursive:true});const software=process.argv.includes('--software'),label=software?'software':'hardware';
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()', 'window.__nightArt={alarmBells,alarmLamps};return {scene,camera,update,draw()')}));
 const start=Date.now();await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});const readyMs=Date.now()-start;await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const initial=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);
 async function stage(cart,joe){await p.evaluate(async({cart,joe})=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(cart.y>580?2:cart.y>300?1:0);r.mode='driving';r.grace=0;r.tension.phase='stalk';Object.assign(r.cart,cart);Object.assign(r.joe,joe);__backNine.run=r;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();},{cart,joe});}
 async function shot(name){await p.screenshot({path:`${out}/${label}-${name}.png`});}
 await stage({x:0,y:40},{x:0,y:31,yaw:0,speed:8});await p.evaluate(async()=>{__backNine.run.lookBack=true;__backNine.render();await __backNine.whenPresented();});await shot('mower-2560');
 await stage({x:28,y:180,yaw:.5},{x:14,y:155});await shot('pump-2560');
 await stage({x:-25.2,y:139,yaw:0},{x:5,y:144});await shot('alarm-approach-2560');assert.match(await p.locator('#caption').innerText(),/alarm ahead/);
 await stage({x:-25.2,y:150},{x:5,y:144});await p.keyboard.down('Space');await p.evaluate(()=>advanceTime(1000));await p.keyboard.up('Space');let state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(state.decoys.active,0);assert.equal(state.joe.mode,'investigate_alarm');await shot('alarm-active-2560');
 const angle=await p.evaluate(()=>__nightArt.alarmBells[0].rotation.z);assert(Math.abs(angle)>.01);
 await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.stringify(__backNine.run));await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),frozen);await p.keyboard.press('Escape');
 await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>advanceTime(17));assert.equal(await p.evaluate(()=>__nightArt.alarmBells[0].rotation.z),0);assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).decoys.active,0);await p.emulateMedia({reducedMotion:'no-preference'});
 for(const[width,height]of [[1280,720],[844,390]]){await p.setViewportSize({width,height});await p.evaluate(()=>advanceTime(17));await shot('alarm-active-'+width);}
 await p.keyboard.down('ArrowUp');await p.evaluate(()=>advanceTime(1200));await p.keyboard.up('ArrowUp');state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(state.decoys.active,-1);assert.equal(state.decoys.result,'heard');
 await stage({x:0,y:40},{x:0,y:31,speed:8});await p.evaluate(async()=>{__backNine.run.lookBack=true;__backNine.render();await __backNine.whenPresented();});await shot('mower-844');
 const after=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(after.graphics.programs,initial.programs);assert.equal(after.graphics.textures,initial.textures);assert.equal(after.audio.voices,9);assert.deepEqual(errors,[]);
 const report={passed:true,readyMs,graphics:after.graphics,audio:after.audio,errors};fs.writeFileSync(`${out}/${label}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
