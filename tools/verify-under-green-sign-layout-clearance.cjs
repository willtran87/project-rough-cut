const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/visual-upgrade-local/pass48-layout-clearance';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];try{
 const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 const geometry=await p.evaluate(async()=>{
  const {createRun}=await import('./under-green-sim.js'),{SLUICE,solid}=await import('./under-green-course.js'),r=createRun();r.mode='playing';r.joe.phase='absent';r.bypass=true;r.bypassAt=20;r.time=26.3;r.lessonCrossed=true;__underGreen.run=r;__underGreen.clearInput();
  const travel=[];for(let i=0;i<=100;i++){r.gate=i/100;advanceTime(0);travel.push(__underGreen.inspectGateTravel());}
  const poses=[];for(const center of [{x:0,y:20},SLUICE])for(const dx of [-.8,0,.8])for(const dy of [-2,-1,1,2,4]){
   const x=center.x+dx,y=center.y+dy;if(solid({x,y},.3))continue;
   for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const fov of [45,85])for(const aspect of [390/844,844/390])for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5])poses.push({x,y,height,pitch,fov,aspect,yaw});
  }
  return {travel,poses:poses.length,cameraHits:__underGreen.inspectCameraClearance(poses).filter(r=>r.hits.length)};
 });
 const failures=geometry.travel.filter(a=>a.hits.length||a.boxHits.length);fs.writeFileSync(out+'/geometry.json',JSON.stringify(geometry,null,2));assert.deepEqual(failures,[]);assert.deepEqual(geometry.cameraHits,[]);
 await p.evaluate(async()=>{const {SLUICE}=await import('./under-green-course.js');const r=__underGreen.run;r.gate=0;Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1.3,yaw:Math.PI,pitch:-.48});advanceTime(0);});
 assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).action.id,'gate');await p.keyboard.press('e');await p.evaluate(()=>advanceTime(350));const moving=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(moving.gate>0&&moving.gate<1);
 await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(500));assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).gate,moving.gate);await p.click('#primary');await p.evaluate(()=>advanceTime(1500));const released=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(released.graphics.release.secured);
 await p.screenshot({path:out+'/released-2560.jpg',quality:91});assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,poses:geometry.poses,travel:geometry.travel.length,moving,released,errors},null,2));console.log(JSON.stringify({passed:true,poses:geometry.poses,travel:geometry.travel.length}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
