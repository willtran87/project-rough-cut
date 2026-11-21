const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.argv[2]||'output/back-nine-visual-upgrade/planting/browser';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const render=()=>p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});
 const shot=async name=>{await render();await p.screenshot({path:`${out}/${name}.png`});samples.push({name,state:await read()});};
 const views=process.argv.includes('--beds')?[['nursery',30,60,.6],['wetland',-27,175,-.65],['range',30,402,.55],['clubhouse',21,756,.6]]:[['nursery',6,44,.2],['wetland',-23,239,.2],['range',21,355,.3],['clubhouse',13,754,.3]];
 for(const [name,x,y,yaw]of views){
  await p.evaluate(async({x,y,yaw})=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;},{x,y,yaw});await shot(name+'-2560');
 }
 const before=(await read()).graphics.courseDetail;await p.evaluate(()=>advanceTime(500));assert((await read()).graphics.courseDetail.windTime>before.windTime);await shot('wind-2560');
 await p.keyboard.press('Escape');const paused=(await read()).graphics.courseDetail;await p.evaluate(()=>advanceTime(1000));assert.deepEqual((await read()).graphics.courseDetail,paused);await p.locator('#primary').click();
 await p.evaluate(()=>{const c=document.getElementById('chase-reduced');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));});await render();assert.equal((await read()).graphics.courseDetail.wind,1,'Wind keeps blowing under Reduced motion (f9d86e3)');await shot('reduced-2560');
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('clubhouse-'+width);}
 const s=await read();assert.equal(s.graphics.textures,63);assert.equal(s.graphics.programs,49);assert.equal(s.graphics.courseDetail.pockets,27);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,samples,errors},null,2));console.log(JSON.stringify({passed:true,plants:s.graphics.courseDetail,programs:s.graphics.programs,textures:s.graphics.textures,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
