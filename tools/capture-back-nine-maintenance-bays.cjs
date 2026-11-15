const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2]||'output/back-nine-visual-upgrade/maintenance-bays/current',before=process.argv.includes('--before'),software=process.argv.includes('--software');
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(before?'output/back-nine-visual-upgrade/maintenance-bays/baseline-source/back-nine-scene.js':'web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__bayWorld={scene,camera,renderer,update,draw()')}));
 if(before)await page.route('**/course-features.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/back-nine-visual-upgrade/maintenance-bays/baseline-source/course-features.js','utf8')}));
 await page.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
 await page.goto('http://127.0.0.1:4187/back-nine.html?test');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await page.locator('#primary').click();await page.evaluate(()=>advanceTime(0));
 let ids=await page.evaluate(()=>__backNine.COURSE.features.filter(f=>f.kind==='trailer'&&f.id!=='reservoir-trailer').map(f=>f.id));
 const selected=process.argv.find(a=>a.startsWith('--site='))?.slice(7);if(selected){assert(ids.includes(selected));ids=[selected];}
 async function stage(id,inspection=false){await page.evaluate(async({id,inspection})=>{
  const {createRun}=await import('./back-nine-sim.js'),f=__backNine.COURSE.features.find(f=>f.id===id),r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;
  Object.assign(r.cart,{x:f.x-1.1,y:f.y-9,yaw:.06,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0});__backNine.run=r;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();
  if(inspection){const w=__bayWorld;w.camera.position.set(f.x+.65,2.15,-f.y+7);w.camera.lookAt(f.x,1.7,-f.y+1.9);w.camera.updateMatrixWorld();w.draw();const gl=w.renderer.getContext(),sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(sync,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,1));gl.deleteSync(sync);}
 },{id,inspection});}
 async function shot(name){await page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:95});samples.push({name,state:await page.evaluate(()=>JSON.parse(render_game_to_text()))});}
 for(const id of ids){await stage(id);await shot(id+'-approach');await stage(id,true);await shot(id+'-detail');}
 for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await stage(selected||'abandoned-repair');await shot((selected||'repair')+'-'+width);}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({before,software,errors,samples},null,2));console.log(JSON.stringify({passed:true,views:samples.length,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
