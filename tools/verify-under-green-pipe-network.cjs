const fs=require('node:fs'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const software=process.argv.includes('--software'),controlsOnly=process.argv.includes('--controls-only'),out=`output/under-green/visual-upgrade-local/${controlsOnly?'pass42-controls':'pass42-pipes'}/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[];try{
{const before=false;
 const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 async function place(name,time=26.3){await p.evaluate(async({name,time})=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js');const f={repair:[-1.6,21.6,-.644,.74],wrap:[-1.6,29.2,-.505,.635],return:[-18,47.5,-.927,.675],elbow:[4.3,38.1,.73,.66],header:[-8,37,0,.58],gallery:[0,18,0,.2],pump:[-22.6,40,-Math.PI/2,-.15]}[name];if(solid({x:f[0],y:f[1]},.3))throw Error('Invalid camera '+name);const r=createRun();r.mode='playing';r.time=time;r.joe.phase='absent';Object.assign(r.player,{x:f[0],y:f[1],yaw:f[2],pitch:f[3],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{name,time});}
 async function shot(name){const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),state:s});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:92});}
 for(const name of (controlsOnly?[]:['repair','wrap','return','elbow','header','gallery','pump'])){await place(name);await shot(name);}
 if(!before){
  let s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(s.graphics.pipeNetwork.repairs.length,3);assert.equal(s.graphics.pipeNetwork.insulation.length,3);
  await place('pump');await p.keyboard.press('e');await p.evaluate(()=>advanceTime(300));s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(s.bypass,'E failed to divert pump');assert(s.graphics.pump.handle<0&&s.graphics.pump.handle>-1,'Pump not in transit');assert(Number.isFinite(s.seconds));
  await p.keyboard.press('Escape');const frozen={time:s.seconds,handle:s.graphics.pump.handle,valves:s.graphics.pump.valves,water:s.graphics.water.animationTime};await p.evaluate(()=>advanceTime(600));s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.deepEqual({time:s.seconds,handle:s.graphics.pump.handle,valves:s.graphics.pump.valves,water:s.graphics.water.animationTime},frozen);await p.click('#primary');await p.evaluate(()=>advanceTime(2300));await shot('pump-active');s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(s.seconds>frozen.time);for(const v of s.graphics.pump.valves)assert(Math.abs(v.angle-Math.PI/2)<1e-7);
  if(!controlsOnly){
  await place('repair');await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');
  for(const [w,h]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width:w,height:h});for(const name of ['repair','elbow']){await place(name);await shot(name);}}
  await p.setViewportSize({width:2560,height:1600});await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#comfort .rc-settings-tabs button',{hasText:'Camera'}).click();await p.locator('#reduced').check();await p.click('#primary');await place('wrap');await shot('reduced');
  }
 }
 await p.close();}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
