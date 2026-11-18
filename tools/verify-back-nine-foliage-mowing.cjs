const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.argv[2],software=process.argv.includes('--software');if(!out)throw Error('Provide evidence directory');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('const courseDetail=await buildCourseDetail','const courseDetail=window.__courseDetail=await buildCourseDetail')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 const present=()=>p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const shot=async name=>{await present();await p.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:94});samples.push({name,state:await read()});console.log(name,JSON.stringify(samples.at(-1).state.graphics.courseDetail.mowing));};
 await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:9,y:100,yaw:0,speed:0,mode:'pursuing'});r.foot={x:9,y:43,yaw:0,viewYaw:0,viewPitch:.24,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;});
 await shot('before-2560');const resources=(await read()).graphics;assert.equal(resources.courseDetail.mowing.cut,0);
 // Replay a physical deck sweep through a planted pocket using production
 // memory updates; normal render then observes it from the player's camera.
 await p.evaluate(()=>{const r=__backNine.run,m=__courseDetail.mowing;r.joe.speed=10;for(let i=0;i<=48;i++){r.time+=.05;r.joe.y=40+i*.5;m.update(r);}r.joe.speed=0;for(let i=0;i<8;i++){r.time+=.05;m.update(r);}r.joe.y=100;});
 await shot('flattened-2560');const cut=(await read()).graphics.courseDetail.mowing;assert(cut.cut>15);assert.equal(cut.active,0);assert(cut.cut<cut.registered);
 await p.evaluate(()=>{const r=__backNine.run;r.time+=90;});await shot('retained-2560');assert.equal((await read()).graphics.courseDetail.mowing.cut,cut.cut);assert.equal((await read()).graphics.courseDetail.mowing.uploads,0);
 await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).graphics.courseDetail.mowing.cut,cut.cut);await p.locator('#primary').click();
 await p.evaluate(()=>{const c=document.getElementById('chase-reduced');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));});await present();assert.equal((await read()).graphics.courseDetail.mowing.cut,cut.cut);
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('flattened-'+width);}
 const end=(await read()).graphics;assert.equal(end.programs,resources.programs);assert.equal(end.textures,resources.textures);
 await p.keyboard.press('Escape');await p.locator('#restart').click();await p.evaluate(()=>advanceTime(17));assert.equal((await read()).graphics.courseDetail.mowing.cut,0);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,errors,samples},null,2));console.log('PASS');
 }finally{await browser.close();}})().catch(error=>{fs.writeFileSync(out+'/report.json',JSON.stringify({passed:false,error:error.stack},null,2));console.error(error);process.exitCode=1;});
