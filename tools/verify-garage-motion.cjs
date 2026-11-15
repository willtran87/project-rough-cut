const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2],software=process.argv.includes('--software');if(!out)throw Error('Output directory required');
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const tick=async ms=>{for(let t=0;t<ms;t+=100)await p.evaluate(ms=>advanceTime(ms),Math.min(100,ms-t));};
 const capture=async name=>{await p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});const state=await read();samples.push({name,state});await p.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:93});console.log('captured',name);return state;};
 const stage=async(foot=false)=>p.evaluate(async foot=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.checkpoint=2;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x:-23,y:795.5,yaw:0,health:100});Object.assign(r.joe,{x:35,y:600,speed:0});if(foot){r.cart.x=35;r.cart.y=10;r.cart.health=0;r.cart.failedAt=0;r.foot={x:-23,y:795.5,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};}__backNine.run=r;await advanceTime(0);},foot);
 for(const foot of [false,true]){
  const tag=foot?'foot':'cart';await stage(foot);await capture(tag+'-closed');
  await p.keyboard.down('e');await tick(1600);await p.keyboard.up('e');let s=await capture(tag+'-lifting');assert(s.graphics.garageMotion.open>0&&s.graphics.garageMotion.open<1);assert(s.graphics.garageMotion.dust>0);
  await p.keyboard.press('Escape');const frozen=JSON.stringify((await read()).graphics.garageMotion);await tick(500);assert.equal(JSON.stringify((await read()).graphics.garageMotion),frozen);await p.click('#primary');
  await tick(1000);s=await capture(tag+'-open');assert.equal(s.graphics.garageMotion.open,1);
  await p.keyboard.down('w');await tick(foot?1550:1500);await p.keyboard.up('w');await p.keyboard.down('e');await tick(1800);await p.keyboard.up('e');s=await capture(tag+'-sealing');assert.equal(s.mode,'back_nine_sealing');assert(s.graphics.garageMotion.open<1&&s.graphics.garageMotion.open>0);await p.keyboard.press('Escape');const held=JSON.stringify((await read()).graphics.garageMotion);await tick(300);assert.equal(JSON.stringify((await read()).graphics.garageMotion),held);await p.click('#primary');
  await tick(5300);s=await capture(tag+'-complete');assert.equal(s.mode,'back_nine_complete');assert.equal(s.graphics.garageMotion.open,0);assert(s.audio.latchPlays>=1);
  await p.click('#primary');await p.click('#primary');await tick(17);assert.equal((await read()).checkpoint,0);assert.equal((await read()).graphics.garageMotion.dust,0);
 }
 for(const[width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await stage(true);await p.keyboard.down('e');await tick(1700);await p.keyboard.up('e');await capture('lifting-'+width);}
 await p.locator('#chase-reduced').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));});await stage(true);await p.keyboard.down('e');await tick(1700);await p.keyboard.up('e');const reduced=await capture('reduced');assert(reduced.graphics.garageMotion.open>0);assert.equal(reduced.graphics.garageMotion.dust,0);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,software,samples,errors},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

