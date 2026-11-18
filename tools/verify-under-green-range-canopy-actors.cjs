const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 const rows=await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js');const rows=[];
  for(const [x,y]of [[10.7,28.575],[12,29.4],[9.6,27.5],[11.6,27.7]])for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const [phase,age]of [['walk',.3],['windup',.59],['sweep',.055],['sweep',.13],['recover',.3]]){
   const r=createRun();r.mode='playing';r.time=26.3;Object.assign(r.joe,{x,y,yaw,phase,age,speed:0,walk:.2});Object.assign(r.player,{x:x+Math.sin(yaw)*2.8,y:y+Math.cos(yaw)*2.8,yaw:yaw+Math.PI,grace:100});settleWeapon(r,1/60);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);rows.push({x,y,yaw,phase,geometry:__underGreen.inspectJoeGeometry()});
  }return rows;
 });fs.writeFileSync('output/under-green/visual-pass97/actor-clearance.json',JSON.stringify({rows,errors},null,2));for(const r of rows)assert.deepEqual(r.geometry.hits,[],JSON.stringify({x:r.x,y:r.y,yaw:r.yaw,phase:r.phase}));assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,poses:rows.length}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
