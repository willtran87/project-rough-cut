const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const out='output/under-green/camera',errors=[],poses=[];fs.mkdirSync(out,{recursive:true});
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),{ARRIVAL}=await import('./under-green-encounters.js');const r=createRun();r.mode='playing';r.player.y=ARRIVAL.triggerY+.1;__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
  for(let i=0;i<32;i++){
   const sample=await p.evaluate(()=>{advanceTime(100);const s=JSON.parse(render_game_to_text());return {seconds:s.seconds,joe:s.joe,geometry:s.joe.phase!=='absent'&&(s.joe.phase!=='enter'||s.joe.age>.25)?__underGreen.inspectJoeGeometry():null};});poses.push(sample);
   if([5,15,29].includes(i))await p.screenshot({path:`${out}/arrival-${i}-2560.png`});
  }
  fs.writeFileSync(out+'/arrival.json',JSON.stringify({poses,errors},null,2));
  for(const pose of poses)if(pose.geometry)assert.deepEqual(pose.geometry.hits,[],`Arrival at ${pose.seconds}`);
  assert.equal(poses.at(-1).joe.phase,'walk');assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,samples:poses.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
