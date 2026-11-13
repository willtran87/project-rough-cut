const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const {step}=await import('../web/under-green-sim.js'),{SLUICE,distance}=await import('../web/under-green-course.js');
 const tapes=[-1,1].map(side=>({name:'occupied-'+side,...JSON.parse(fs.readFileSync(`output/under-green/keeper-counterplay/attempt-${side}.json`))}));
 const failed=JSON.parse(fs.readFileSync('output/under-green/reactive-routes/full-observed-tapes.json')).find(t=>t.failed);assert(failed);tapes.push(failed);
 const runs=tapes.map(t=>{
  const r=structuredClone(t.initial),frames=[];let lastPhase='';
  for(let i=0;i<t.inputs.length;i++){
   const input=t.inputs[i];r.player.yaw=input.yaw;step(r,input.input);
   if(i%3===0&&distance(r.joe,SLUICE)<6){const inspect=i%18===0||lastPhase!==r.joe.phase;frames.push({inspect,run:structuredClone(r)});lastPhase=r.joe.phase;}
  }
  assert.equal(r.mode,t.final.mode);assert(frames.length);return {name:t.name,frames};
 });
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[],errors=[];
 try{
  const p=await browser.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  for(const run of runs){
   const samples=[];for(let i=0;i<run.frames.length;i+=60){samples.push(...await p.evaluate(frames=>{
    const rows=[];for(const frame of frames){__underGreen.run=frame.run;advanceTime(0);if(frame.inspect)rows.push({time:frame.run.time,phase:frame.run.joe.phase,gate:frame.run.gate,geometry:__underGreen.inspectJoeGeometry()});}return rows;
   },run.frames.slice(i,i+60)));}
   results.push({name:run.name,frames:run.frames.length,samples});console.log(JSON.stringify({name:run.name,frames:run.frames.length,samples:samples.length,hits:samples.reduce((n,s)=>n+s.geometry.hits.length,0)}));
  }
  fs.writeFileSync('output/under-green/release/actor-clearance.json',JSON.stringify({results,errors},null,2));
  assert.deepEqual(errors,[]);for(const r of results)for(const s of r.samples)assert.deepEqual(s.geometry.hits,[],`${r.name} at ${s.time}`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
