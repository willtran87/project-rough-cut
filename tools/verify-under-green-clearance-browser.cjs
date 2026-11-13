const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],out='output/under-green/clearance';fs.mkdirSync(out,{recursive:true});p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
 const results=[],lever=await p.evaluate(async()=>{const {LEVER}=await import('./under-green-course.js');return LEVER;});
 for(const [name,x,y,yaw,phase,age,gate=0]of [['console-west',lever.x-1.3,lever.y,Math.PI/2,'walk',0],['console-east',lever.x+1.3,lever.y,-Math.PI/2,'walk',0],['console-north',lever.x,lever.y+1.2,Math.PI,'walk',0],['wall-carry',2,50,Math.PI/2,'walk',0],['wall-preparation',2,50,Math.PI/2,'windup',.5],['corner',9,71,Math.PI/2,'search',1],['bunker-bank',-29,62,Math.PI,'walk',.3],['pump',-18,45,Math.PI/2,'walk',.3],['gate',12,7.1,Math.PI,'walk',.2],['gate-half',12,7.1,Math.PI,'walk',.2,.5],['gate-low',12,7.1,Math.PI,'walk',.2,.8],['gate-closed',12,7.1,Math.PI,'walk',.2,1]]){
  const result=await p.evaluate(async({name,x,y,yaw,phase,age,gate})=>{const {createRun,step}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js');const {rangeY}=await import('./under-green-layout.js');if(x>6&&y<41)y=rangeY(y);const r=createRun(2);r.mode='playing';r.gate=gate;Object.assign(r.joe,{x,y,yaw,phase,age,walk:.2,speed:0});const eye=name.startsWith('console')?{x:-21,y:37}:{x:x-2,y:y+2};Object.assign(r.player,{...eye,yaw:Math.atan2(x-eye.x,y-eye.y)});settleWeapon(r,1/60);if(phase==='windup')for(let i=0;i<40;i++)step(r);__underGreen.run=r;__underGreen.clearInput();await advanceTime(0);const state=JSON.parse(render_game_to_text());return {geometry:__underGreen.inspectJoeGeometry(),actor:state.graphics.actor,joe:state.joe};},{name,x,y,yaw,phase,age,gate});
  results.push({name,...result});await p.screenshot({path:`${out}/${name}-2560.png`});
 }
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>advanceTime(0));await p.screenshot({path:out+'/gate-390.png'});
 fs.writeFileSync(out+'/rendered-geometry.json',JSON.stringify({results,errors},null,2));
 for(const result of results){assert.deepEqual(result.geometry.hits,[],result.name);assert(result.actor.handError<.015);}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,poses:results.map(r=>({name:r.name,vertices:r.geometry.points,handError:r.actor.handError})),errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
