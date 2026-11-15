const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2]||'output/back-nine-visual-upgrade/shrubs/browser',software=process.argv.includes('--software');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));await p.goto('http://127.0.0.1:4187/back-nine.html?test');
 await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const shot=async name=>{await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});await p.screenshot({path:`${out}/${name}.png`});samples.push({name,state:await read()});};
 const stage=async(x,y,yaw)=>p.evaluate(async({x,y,yaw})=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:-80,speed:0});r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(0);},{x,y,yaw});
 const features=await p.evaluate(()=>__backNine.COURSE.features.filter(f=>f.kind==='fallen-tree'&&f.id!=='clubhouse-fall'));
 for(const f of (software?[features[0],features.at(-1)]:features)){
  await stage(f.x-2,f.y-8,.2);await shot(f.id+'-whole');
  const broken=await p.evaluate(async f=>{const {constrainFeatureMotion}=await import('./vehicle-contact.js');const r=__backNine.run,from={x:f.x,y:f.y-f.ry-4,yaw:0},to={x:f.x,y:f.y,yaw:0,speed:18};constrainFeatureMotion(to,from,'mower',r);await advanceTime(250);return r.destruction.features[f.id].brokenAt!==null;},f);
  assert(broken,f.id);assert.equal((await read()).graphics.destructibleFeatures.broken,1);await shot(f.id+'-falling');
  await p.evaluate(()=>advanceTime(650));await shot(f.id+'-settled');
 }
 for(const [name,x,y,yaw] of [['border',36,61,.85],['nursery-hedge',-7,124,-.65],['range-hedge',-14,420,-.65],['clubhouse-hedge',5,665,-.65]]){await stage(x,y,yaw);await shot(name+'-2560');}
 await p.keyboard.press('Escape');const paused=await read();await p.evaluate(()=>advanceTime(500));assert.equal((await read()).graphics.courseDetail.windTime,paused.graphics.courseDetail.windTime);await p.locator('#primary').click();
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('hedge-'+width);}
 await p.keyboard.press('Escape');await p.locator('#restart').click();await p.evaluate(()=>advanceTime(0));const reset=await read();assert.equal(reset.graphics.destructibleFeatures.broken,0);assert.equal(reset.graphics.destructibleFeatures.foliageClumps,90);assert.equal(reset.graphics.courseDetail.shrubPlants,924);assert.equal(reset.graphics.textures,46);assert.equal(reset.graphics.software,software);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,samples,reset,errors},null,2));console.log(JSON.stringify({passed:true,software,views:samples.length,foliage:reset.graphics.courseDetail,features:reset.graphics.destructibleFeatures,programs:reset.graphics.programs,textures:reset.graphics.textures,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
