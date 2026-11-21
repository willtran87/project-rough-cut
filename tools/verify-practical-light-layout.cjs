const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2],software=process.argv.includes('--software');
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],samples=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');
 await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:35,y:50,speed:0});r.foot={x:0,y:288,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(0);});
 for(const [width,height]of [[1280,720],[390,844]]){
  await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});
  const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(state.graphics.practicalLights.sources,91);/* +3 garage-interior lamps (back-nine-practical-lights.js) */assert.equal(state.graphics.practicalLights.strength,1);
  await p.screenshot({path:out+'/shelter-'+width+'.png'});samples.push({width,height,state});
 }
 // The legacy checkpoint field counts powered relays. It must not become a
 // respawn location after this traversal completes the first objective.
 await p.evaluate(async()=>{__backNine.run.foot.y=300;await advanceTime(17);});
 assert.equal(await p.evaluate(()=>__backNine.run.checkpoint),1);
 await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(0));
 const restart=await p.evaluate(()=>({checkpoint:__backNine.run.checkpoint,cart:{x:__backNine.run.cart.x,y:__backNine.run.cart.y},foot:!!__backNine.run.foot}));
 const spawn=await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const fresh=createRun(0);return {x:fresh.cart.x,y:fresh.cart.y};});
 assert.equal(restart.checkpoint,0);assert.deepEqual(restart.cart,spawn);assert.equal(restart.foot,false);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,samples,restart,errors},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
