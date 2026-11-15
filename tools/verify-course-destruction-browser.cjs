const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/back-nine-destruction-expanded/browser';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],results=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 const render=()=>p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});
 const read=()=>p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return {features:s.graphics.destructibleFeatures,programs:s.graphics.programs,textures:s.graphics.textures,state:s.destruction.features,seconds:s.seconds};});
 for(const id of ['pump-yard-cart','reservoir-trailer','clubhouse-fall','nursery-fall']){
  await p.evaluate(async id=>{const {createRun}=await import('./back-nine-sim.js'),{COURSE}=await import('./back-nine-course.js');const f=COURSE.features.find(f=>f.id===id),r=createRun();r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.cart.health=0;Object.assign(r.cart,{x:35,y:20});r.foot={x:f.x+3,y:f.y-f.ry-5,yaw:-.3,viewYaw:-.3,speed:0,onFoot:true,invulnerable:0};Object.assign(r.joe,{x:f.x+4,y:f.y-f.ry-9,yaw:-.3,speed:0,mode:'pursuit'});__backNine.run=r;},id);await render();await p.screenshot({path:out+'/'+id+'-intact.png'});const before=await read();assert.equal(before.features.total,23);assert.equal(before.features.broken,0);
  await p.evaluate(async id=>{const {COURSE}=await import('./back-nine-course.js'),{constrainFeatureMotion}=await import('./vehicle-contact.js');const f=COURSE.features.find(f=>f.id===id),r=__backNine.run,from={x:f.x,y:f.y-f.ry-4,yaw:0};constrainFeatureMotion({...from,y:f.y,speed:18},from,'mower',r);},id);
  for(let i=0;i<18;i++){await p.evaluate(()=>{__backNine.run.time+=.05;});await render();}await p.screenshot({path:out+'/'+id+'-crushed.png'});const after=await read();assert.equal(after.features.broken,1);assert.equal(after.programs,before.programs);assert.equal(after.textures,before.textures);results.push({id,before:before.features,after:after.features});
 }
 await p.keyboard.press('Escape');const paused=await read();await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).seconds,paused.seconds);await p.locator('#primary').click();
 await p.setViewportSize({width:1280,height:720});await render();await p.screenshot({path:out+'/crushed-1280.png'});
 await p.setViewportSize({width:390,height:844});await render();await p.screenshot({path:out+'/crushed-390.png'});
 await p.evaluate(()=>{const r=__backNine.run;r.mode='caught';__backNine.run=r;});await render();await p.keyboard.press('r');await render();assert.equal((await read()).features.broken,0);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,results,errors},null,2));console.log(JSON.stringify({passed:true,results,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
