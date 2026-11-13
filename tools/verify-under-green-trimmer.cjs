const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],out='output/under-green/trimmer';fs.mkdirSync(out,{recursive:true});p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
 const samples=await p.evaluate(async()=>{
  const {createRun}=await import('./under-green-sim.js');const results=[];
  for(const yaw of [0,.7,Math.PI/2,Math.PI])for(const [phase,ages]of [['walk',[0,.2,.4]],['search',[0,.5]],['windup',[0,.2,.6,.94]],['sweep',[0,.055,.11,.165,.22]],['recover',[0,.4,.8,1.3]]])for(const age of ages){
   const r=createRun();r.mode='playing';r.time=30+age;Object.assign(r.player,{x:0,y:56,yaw:Math.PI});Object.assign(r.joe,{x:0,y:52.7,yaw,attackYaw:yaw,phase,age,walk:age*2.1,speed:phase==='walk'?2.1:0});__underGreen.run=r;await advanceTime(0);const state=JSON.parse(render_game_to_text());results.push({yaw,phase,age,actual:state.graphics.actor,expected:state.joe.blade});
  }return results;
 });
 let maximumGrip=0,maximumBlade=0;
 for(const s of samples){maximumGrip=Math.max(maximumGrip,s.actual.handError);for(const end of ['near','far']){const a=s.actual.blade[end],e=s.expected[end];maximumBlade=Math.max(maximumBlade,Math.hypot(a.x-e.x,a.y-e.y,a.height-e.height));}}
 fs.writeFileSync(out+'/pose-samples.json',JSON.stringify({maximumGrip,maximumBlade,samples},null,2));
 const duplicate=await p.evaluate(async()=>{const before=JSON.parse(render_game_to_text()).graphics.actor;for(let i=0;i<90;i++)await advanceTime(0);return {before,after:JSON.parse(render_game_to_text()).graphics.actor};});
 assert.deepEqual(duplicate.after,duplicate.before,'Repeated renders must not accumulate procedural bone rotations');
 for(const [phase,age]of [['walk',.2],['windup',.6],['sweep',.11],['sweep',.22],['recover',.7]]){
  await p.evaluate(async({phase,age})=>{const r=__underGreen.run;r.time=50+age;Object.assign(r.joe,{x:0,y:52.7,yaw:0,phase,age,walk:.3,speed:phase==='walk'?2.1:0});Object.assign(r.player,{x:0,y:56,yaw:Math.PI});await advanceTime(0);},{phase,age});await p.screenshot({path:`${out}/${phase}-${age}-2560.png`});
 }
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>advanceTime(0));await p.screenshot({path:out+'/recovery-390.png'});
 assert(maximumGrip<.015,`Grip error ${maximumGrip}m`);assert(maximumBlade<.00001,`Visible blade differs from authoritative segment by ${maximumBlade}m`);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,poses:samples.length,maximumGrip,maximumBlade,duplicateRenders:90,errors},null,2));console.log(JSON.stringify({passed:true,poses:samples.length,maximumGrip,maximumBlade,duplicateRenders:90,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
