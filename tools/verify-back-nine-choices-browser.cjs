const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/back-nine-route-choices/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/back-nine-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()', 'return window.__choiceWorld={scene,camera,cart,update,draw()')}));
 await page.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true}));window.__buffers=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__buffers++;return f.apply(this,a);};});
 const start=Date.now();await page.goto('http://127.0.0.1:4187/back-nine.html?test');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});const readyMs=Date.now()-start;await page.locator('#primary').click();await page.evaluate(()=>advanceTime(0));
 const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text())),before=await read(),buffers=await page.evaluate(()=>__buffers);
 assert(await page.evaluate(()=>{let valid=true;__choiceWorld.cart.body.traverse(m=>{if(m.isMesh&&m.parent!==__choiceWorld.cart.driver)valid&&=!!m.geometry.boundingSphere&&m.geometry.boundingSphere.radius>0;});return valid;}),'Fresh cart body must have real culling bounds before its first hit');
 async function stage(name,x,y,yaw=0,foot=false){
  await page.evaluate(async({x,y,yaw,foot})=>{const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js');const r=createRun(y>580?2:y>300?1:0);r.mode='driving';r.time=20;r.grace=10;Object.assign(r.cart,{x,y,yaw,speed:0});Object.assign(r.joe,{x:8,y:y-24,yaw:0,speed:0});if(foot){r.cart.x=-24;r.cart.y=749;leaveBrokenCart(r);Object.assign(r.foot,{x,y,yaw,viewYaw:yaw});r.time+=2;}__backNine.run=r;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();},{x,y,yaw,foot});
  const s=await read();views.push({name,graphics:s.graphics,multiplier:s.ramDamageMultiplier});await page.screenshot({path:`${out}/${name}.png`});return s;
 }
 for(const a of [['yard-wide',4,192,-.2],['yard-gate',-10,202,0],['range-wide',-12,330,-.3],['range-gate',-25,342,0],['range-foot',-36.5,343,0,true],['garage-wide',-7,752,-.3],['garage-gate',-24,760,0],['garage-foot',-33.15,763,0,true]])await stage(...a);
 // Exercise a real final-district collision, then input during the ejection.
 await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(2);r.mode='driving';r.grace=0;r.cart.health=25;Object.assign(r.cart,{x:-24,y:749});Object.assign(r.joe,{x:-24,y:744,speed:20});r.joe.ram.armed=true;__backNine.run=r;await advanceTime(100);});
 let s=await read();assert.equal(s.travel,'on_foot');assert.equal(s.cart.health,0);assert.equal(s.graphics.cartDamage.stage,'wrecked');await page.screenshot({path:`${out}/late-impact-ejection.png`});
 const p={...s.player};await page.keyboard.down('w');await page.evaluate(()=>advanceTime(200));await page.keyboard.up('w');s=await read();assert(Math.hypot(s.player.x-p.x,s.player.y-p.y)>1);assert(s.player.invulnerable>4.6);await page.screenshot({path:`${out}/runner-control.png`});
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>advanceTime(17));s=await read();assert.equal(s.graphics.ejection.phase,'none');await page.screenshot({path:`${out}/reduced-motion.png`});
 for(const [width,height]of [[1280,720],[844,390]]){await page.setViewportSize({width,height});await stage('garage-'+width,-24,760,0);}
 const after=await read();assert.equal(after.graphics.programs,before.graphics.programs);assert.equal(after.graphics.textures,before.graphics.textures);assert.equal(await page.evaluate(()=>__buffers),buffers);assert.equal(after.audio.voices,9);assert.equal(after.navigation.edgeChecks,0);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,readyMs,before:before.graphics,after:after.graphics,views,buffers,errors},null,2));console.log(JSON.stringify({passed:true,software,readyMs,features:after.graphics.courseFeatures,programs:after.graphics.programs,textures:after.graphics.textures,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
