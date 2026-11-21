const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.argv[2],software=process.argv.includes('--software');assert(out);fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__contactsWorld={scene,camera,renderer,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const seed=async type=>{await p.evaluate(async type=>{
  const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;
  Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:-36.5,y:343,yaw:0,viewYaw:0,viewPitch:.4,speed:0,onFoot:true,invulnerable:0};
  if(type==='slope'||type==='running'||type==='beacon')Object.assign(r.foot,{x:20,y:65});
  if(type==='beacon')Object.assign(r.joe,{x:20,y:72,yaw:Math.PI,speed:0});
  if(type==='vehicles'){r.foot=null;Object.assign(r.cart,{x:20,y:65,yaw:0,health:100});Object.assign(r.joe,{x:20,y:76,yaw:Math.PI,speed:0});}
  if(type==='flood'){const z=__backNine.COURSE.wet[0];Object.assign(r.foot,{x:z.x,y:z.y});r.tactics.floodUntil[0]=100;}
  if(type==='ejection'){r.foot=null;Object.assign(r.cart,{x:20,y:65,yaw:0,speed:9});const{leaveBrokenCart}=await import('./chase-player.js');leaveBrokenCart(r);r.time+=.4;}
  if(type==='death'){const{beginRunover}=await import('./chase-runover.js');beginRunover(r);r.death.age=1.1;r.time+=1.1;}
  __backNine.run=r;__backNine.render();await __backNine.whenPresented();
 },type);if(type==='running'){await p.keyboard.down('w');await p.evaluate(async()=>{for(let i=0;i<24;i++)await advanceTime(1000/60);});await p.keyboard.up('w');}};
 const shot=async name=>{await p.evaluate(async()=>{await __backNine.whenPresented();__contactsWorld.draw();});await p.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:95});const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));samples.push({name,state});fs.writeFileSync(out+'/'+name+'.json',JSON.stringify(state));console.log(name);};
 for(const type of ['standing','slope','running','beacon','vehicles','ejection','death','flood']){await seed(type);await shot(type+'-2560');}
 {
  const contacts=await p.evaluate(()=>{const m=__contactsWorld.scene.getObjectByName('BackNineContactShadows');return{vertices:m.geometry.drawRange.count,capacity:m.geometry.attributes.position.count,order:m.renderOrder,map:!!m.material.map,stats:__contactsWorld.stats().contactShadows};});assert(contacts.vertices>0&&contacts.vertices<contacts.capacity);assert.equal(contacts.order,2);assert(!contacts.map);
  assert(samples.find(s=>s.name==='vehicles-2560').state.graphics.contactShadows.patches.some(p=>p.name==='mower-chassis'));
  assert(samples.find(s=>s.name==='standing-2560').state.graphics.contactShadows.patches.some(p=>p.name==='runner-boot-0'));
  const walking=samples.find(s=>s.name==='running-2560').state.graphics.contactShadows.patches.filter(p=>p.name.startsWith('runner-boot'));assert(walking.some(p=>p.lift>.03),'actual running lifts a boot');
  const paused=await p.evaluate(()=>{const w=__contactsWorld,r=__backNine.run;r.mode='paused';w.update(r,{});const a=w.stats().contactShadows;w.update(r,{});return[a,w.stats().contactShadows];});assert.deepEqual(paused[0],paused[1],'pause retains geometry');
  await p.evaluate(()=>{__backNine.run.mode='driving';__contactsWorld.update(__backNine.run,{reducedMotion:true});});await shot('reduced-2560');
 }
 if(process.argv.includes('--profile')){
  await seed('vehicles');const profile=await p.evaluate(async()=>{
   const w=__contactsWorld,m=w.scene.getObjectByName('BackNineContactShadows'),gl=w.renderer.getContext();w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();const on=[],off=[];
   for(let i=0;i<28;i++)for(const enabled of (i%2?[true,false]:[false,true])){
    m.visible=enabled;const start=performance.now();w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,1));gl.deleteSync(fence);if(i>=4)(enabled?on:off).push(performance.now()-start);
   }
   m.visible=true;const summary=a=>{a.sort((a,b)=>a-b);return{samples:a.length,median:a[Math.floor(a.length/2)],p95:a[Math.floor(a.length*.95)]};};return{resolution:[960,540],on:summary(on),off:summary(off),geometry:w.stats().contactShadows};
  });fs.writeFileSync(out+'/budget.json',JSON.stringify(profile,null,2));console.log(JSON.stringify(profile));
 }
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await seed('standing');await shot('standing-'+width);}
 await p.click('#pause');await p.click('#restart');await p.evaluate(()=>advanceTime(17));assert.equal(await p.evaluate(()=>__backNine.run.mode),'briefing');await p.click('#primary');await p.evaluate(()=>advanceTime(17));
 assert(!(await p.evaluate(()=>__contactsWorld.stats().contactShadows.patches)).some(p=>p.name.startsWith('runner')));
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,samples,errors},null,2));console.log('PASS');
 }finally{await browser.close();}})().catch(e=>{fs.writeFileSync(out+'/report.json',JSON.stringify({passed:false,error:e.stack},null,2));console.error(e);process.exitCode=1;});
