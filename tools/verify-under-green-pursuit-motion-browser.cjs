const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/pursuit-motion/browser';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],poses=[],responses=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  const reports=JSON.parse(fs.readFileSync('output/under-green/pursuit-motion/after/report.json')).results;
  for(const row of reports){
   // Render continuous simulation samples, not invented actor poses.
   for(let i=0;i<row.frames.length;i+=8){
    const result=await p.evaluate(state=>{__underGreen.run=state;__underGreen.clearInput();advanceTime(0);return {geometry:__underGreen.inspectJoeGeometry(),footing:__underGreen.inspectJoeFooting()};},row.frames[i]);
    poses.push({name:row.name,index:i,...result});assert.deepEqual(result.geometry.hits,[],`${row.name} frame ${i}`);assert.equal(result.footing.belowFloor,0);
   }
  }
  const corner=reports.find(r=>r.name==='pump-corner');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   const state=structuredClone(corner.frames.find(r=>r.elapsed>=3));state.player.yaw=Math.atan2(state.joe.x-state.player.x,state.joe.y-state.player.y);state.player.pitch=-.05;
   await p.evaluate(state=>{__underGreen.run=state;__underGreen.clearInput();advanceTime(0);},state);
   await p.screenshot({path:`${out}/pump-approach-${width}.png`});
  }
  await p.setViewportSize({width:2560,height:1600});
  for(const evade of [false,true]){
   await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=10;Object.assign(r.player,{x:3,y:13,yaw:-3*Math.PI/4,grace:0});Object.assign(r.joe,{x:-3,y:7,yaw:Math.PI/4,phase:'walk',last:{x:3,y:13}});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
   await p.evaluate(()=>advanceTime(3350));
   let state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(state.joe.phase,'windup');
   await p.screenshot({path:`${out}/${evade?'evade':'ignore'}-windup.png`});
   await p.evaluate(()=>advanceTime(350));
   if(evade)await p.keyboard.down('d');await p.evaluate(()=>advanceTime(1000));if(evade)await p.keyboard.up('d');await p.evaluate(()=>advanceTime(17));
   state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(state.mode,evade?'under_green_playing':'under_green_caught');if(evade)assert.equal(state.player.speed,0);
   responses.push({evade,state});await p.screenshot({path:`${out}/${evade?'evaded':'caught'}.png`});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,poses,responses,errors},null,2));console.log(JSON.stringify({passed:true,poses:poses.length,responses:responses.map(r=>({evade:r.evade,mode:r.state.mode})),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
