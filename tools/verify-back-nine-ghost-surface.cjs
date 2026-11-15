const fs=require('node:fs'),assert=require('node:assert/strict');
const{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const before=process.argv.includes('--before'),software=process.argv.includes('--software');
const out='output/back-nine-visual-upgrade/ghosts/'+(before?'before-':'after-')+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__ghostWorld={scene,camera,renderer,ghosts,update,draw()')}));
 if(before)await p.route('**/chase-ghosts.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/back-nine-visual-upgrade/ghosts/baseline-source/chase-ghosts.js','utf8')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const seed=async(site=0,gap=10)=>p.evaluate(async({site,gap})=>{
  const{createRun}=await import('./back-nine-sim.js'),{ghostRoutePose}=await import('./chase-ghost-routes.js');
  const r=createRun(0,0,0);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;
  const pose=ghostRoutePose(site,r.time);Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});
  r.foot={x:pose.x,y:pose.y-gap,yaw:0,viewYaw:0,viewPitch:.07,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;__backNine.render();await __backNine.whenPresented();
 },{site,gap});
 const shot=async name=>{await p.evaluate(async name=>{__backNine.render();await __backNine.whenPresented();if(name.startsWith('reduced-')){__ghostWorld.update(__backNine.run,{reducedMotion:true});__ghostWorld.draw();}},name);await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:95});const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));samples.push({name,state});fs.writeFileSync(out+'/'+name+'.json',JSON.stringify(state));console.log(name);};
 for(let i=0;i<6;i++){await seed(i);await shot('site-'+i+'-2560');const g=samples.at(-1).state.graphics.ghosts;assert(g.visible.some(v=>v.site===i),'site visible');if(!before)assert(g.models.filter(m=>m.visible).every(m=>m.softFade));}
 await seed(0,10);const initial=await p.evaluate(()=>__ghostWorld.ghosts.stats());
 await p.evaluate(async()=>{for(let i=0;i<60;i++){__backNine.run.time+=1/60;__ghostWorld.update(__backNine.run,{});}__backNine.render();await __backNine.whenPresented();});await shot('walking-2560');
 const walked=await p.evaluate(()=>__ghostWorld.ghosts.stats());assert(Math.hypot(walked.visible[0].x-initial.visible[0].x,walked.visible[0].y-initial.visible[0].y)>.8);
 const pause=await p.evaluate(()=>{const w=__ghostWorld,r=__backNine.run;r.mode='paused';w.update(r,{});const a=w.ghosts.stats();w.update(r,{});return[a,w.ghosts.stats()];});assert.deepEqual(pause[0],pause[1]);
 await seed(2,10);const lifecycle=await p.evaluate(()=>{const w=__ghostWorld,r=__backNine.run,rows=[];for(let i=0;i<300;i++){r.time+=1/60;w.ghosts.update(r,r.foot);rows.push(w.ghosts.stats().visible.find(v=>v.site===2)||null);}return rows;});
 assert(lifecycle.some(g=>g?.phase==='watching'));assert(lifecycle.some(g=>g?.phase==='vanishing'&&g.alpha>0&&g.alpha<.5));assert.equal(lifecycle.at(-1),null);
 fs.writeFileSync(out+'/lifecycle.json',JSON.stringify(lifecycle));
 await seed(0,5);await shot('near-dissolve-2560');await seed(0,60);await shot('far-dissolve-2560');
 await seed(0,10);const reduced=await p.evaluate(()=>{const w=__ghostWorld,r=__backNine.run;w.update(r,{reducedMotion:true});const a=w.ghosts.stats();r.time+=1;w.update(r,{reducedMotion:true});return[a,w.ghosts.stats()];});
 assert.deepEqual(reduced[0].visible,reduced[1].visible);if(!before)assert(reduced[1].models.filter(m=>m.visible).every(m=>m.walkWeight===0));await shot('reduced-2560');
 const materials=await p.evaluate(()=>{const a=[];__ghostWorld.scene.traverse(o=>{if(o.name==='GhostJoe'&&o.parent===__ghostWorld.scene)o.traverse(m=>{if(m.isMesh)a.push({transparent:m.material.transparent,depthWrite:m.material.depthWrite,depthTest:m.material.depthTest,passes:m.material.forceSinglePass});});});return a;});
 assert.equal(materials.length,2);if(!before)assert(materials.every(m=>m.transparent&&!m.depthWrite&&m.depthTest&&m.passes));
 for(const[width,height]of[[1280,720],[390,844]]){await p.setViewportSize({width,height});await seed(0,10);await shot('site-0-'+width);}
 await p.click('#pause');await p.click('#restart');await p.evaluate(()=>advanceTime(17));await p.click('#primary');await p.evaluate(()=>advanceTime(17));assert(!(await p.evaluate(()=>__ghostWorld.ghosts.stats().visible)).some(v=>v.site===2));
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,materials,initial,walked,samples,errors},null,2));console.log('PASS');
 }finally{await browser.close();}})().catch(e=>{fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack}));console.error(e);process.exitCode=1;});
