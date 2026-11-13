const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/scythe-walking-shadows';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],frames=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');
 await p.evaluate(async()=>{const{createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.elapsed=10;r.time=10;Object.assign(r.player,{x:0,y:24,yaw:0});__underGreen.run=r;advanceTime(0);});
 for(const age of [0,.3,1.1,2.5,3.05,6.5,8.5]){
  await p.evaluate(age=>{__underGreen.run.elapsed=10+age;__underGreen.run.time=10+age;advanceTime(0);},age);await p.evaluate(()=>__underGreen.whenPresented());
  const state=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ghost);frames.push({age,...state});await p.screenshot({path:out+'/ghost-'+age+'.png'});
 }
 assert.equal(frames[0].alpha,0);assert(frames[1].alpha<.03);assert(frames[3].alpha>.4);assert(frames.at(-1).alpha<.04);assert(frames[3].animated);assert.notEqual(frames[3].gait,frames[4].gait);assert(Math.hypot(frames.at(-1).site.x-frames[0].site.x,frames.at(-1).site.y-frames[0].site.y)>2.1);
 await p.evaluate(()=>{__underGreen.run.mode='paused';advanceTime(0);});const paused=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ghost);await p.evaluate(()=>advanceTime(1000));assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ghost),paused);
 const pursuit=await p.evaluate(async()=>{const{createRun}=await import('./under-green-sim.js');const{joeCouldBeSeen}=await import('./under-green-unseen.js');const r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:57,yaw:0,grace:100});Object.assign(r.joe,{x:0,y:43,yaw:0,phase:'walk',last:{x:0,y:57}});__underGreen.run=r;const samples=[];for(let n=0;n<120;n++){advanceTime(17);samples.push({speed:r.joe.speed,visible:joeCouldBeSeen(r)});}return samples;});
 assert(pursuit.some(s=>s.speed>3.5));await p.keyboard.down('q');const rear=await p.evaluate(async()=>{const{joeCouldBeSeen}=await import('./under-green-unseen.js');const rows=[];for(let n=0;n<30;n++){advanceTime(17);rows.push({speed:__underGreen.run.joe.speed,visible:joeCouldBeSeen(__underGreen.run)});}return rows;});await p.keyboard.up('q');assert(rear.some(s=>s.visible));assert(rear.filter(s=>s.visible).every(s=>s.speed<=2.10001));
 await p.screenshot({path:out+'/rear-glance.png'});
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{const{createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.elapsed=10;r.time=10;Object.assign(r.player,{x:0,y:24,yaw:0});__underGreen.run=r;advanceTime(0);r.elapsed=13;r.time=13;advanceTime(0);});await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:out+'/ghost-'+width+'.png'});}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,frames,fastest:Math.max(...pursuit.map(s=>s.speed)),rear,errors},null,2));console.log(JSON.stringify({passed:true,frames:frames.length,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
