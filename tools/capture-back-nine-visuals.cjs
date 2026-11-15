const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2]||'output/back-nine-visual-upgrade/current';
// Fixed playable viewpoints allow honest before/after comparisons; simulation
// is frozen only after entering through the real menu and presentation fence.
const views=[
 ['fairway',20,65,.12,true],['green',25,134,.12,true],
 ['bunker',14,225,.3,true],['maintenance',-10,220,0,false],
 ['beacon',0,65,.1,true,{x:8,y:78,yaw:-.5}],
 ['range',24,449,0,false],['relay-detail',-2,290,0,true],
 ['clubhouse-facade',4,754,0,true],['clubhouse-door',4,772,0,true],
 ['garage-interior',-23,804,0,true],['clubhouse',-23,781,0,false]
];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
 await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 for(const [name,x,y,yaw,foot,joe]of views){
  await p.evaluate(async({x,y,yaw,foot,joe})=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x,y,yaw,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0,...joe});if(foot){r.cart.health=0;r.cart.failedAt=0;r.cart.x=35;r.cart.y=10;r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};}__backNine.run=r;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();},{x,y,yaw,foot,joe});
  if(name==='garage-interior'){await p.evaluate(async()=>{__backNine.run.checkpoint=2;Object.assign(__backNine.run.exitRelease,{released:true,open:1});__backNine.render();await __backNine.whenPresented();});}
  await p.screenshot({path:path.join(out,name+'-2560.png')});samples.push({name,state:await p.evaluate(()=>JSON.parse(render_game_to_text()))});console.log('captured',name);
 }
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});await p.screenshot({path:path.join(out,`clubhouse-${width}.png`)});}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({errors,samples},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
