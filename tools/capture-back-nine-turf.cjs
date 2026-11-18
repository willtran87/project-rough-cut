const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2]||'output/back-nine-visual-upgrade/turf/current';
// Fixed playable viewpoints allow honest before/after comparisons; simulation
// is frozen only after entering through the real menu and presentation fence.
const before=process.argv.includes('--before'),software=process.argv.includes('--software');
const views=[['fairway',20,65,.12,true],['green',25,134,.12,true],['bunker',14,225,.3,true],['maintenance',-10,220,0,false],['beacon',20,65,.1,true,{x:20,y:72,yaw:Math.PI}],['rough',-32,410,.12,true],['flood',-12,220,.1,true]];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync((before?'output/back-nine-visual-upgrade/turf/baseline-source/':'web/')+'back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__turfWorld={scene,camera,renderer,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
 await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 for(const [name,x,y,yaw,foot,joe]of views){
  await p.evaluate(async({x,y,yaw,foot,joe})=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x,y,yaw,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0,...joe});if(foot){r.cart.health=0;r.cart.failedAt=0;r.cart.x=35;r.cart.y=10;r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};}__backNine.run=r;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();},{x,y,yaw,foot,joe});
  if(name==='flood'){await p.evaluate(async()=>{__backNine.run.tactics.floodUntil[0]=100;__backNine.render();await __backNine.whenPresented();});}
  await p.screenshot({path:path.join(out,name+'-2560.jpg'),type:'jpeg',quality:95});samples.push({name,state:await p.evaluate(()=>JSON.parse(render_game_to_text()))});console.log('captured',name);
 }
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});await p.screenshot({path:path.join(out,`flood-${width}.jpg`),type:'jpeg',quality:95});}
 const texture=await p.evaluate(async()=>{const Art=await import('./pixel-art.js');return Art.stats();});assert.deepEqual(texture.errors,[]);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({before,software,texture,errors,samples},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
