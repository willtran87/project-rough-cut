const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],out='output/under-green/navigation';fs.mkdirSync(out,{recursive:true});
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
 await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const {LEVER}=await import('./under-green-course.js');const r=createRun(1);r.mode='playing';Object.assign(r.player,{x:LEVER.x-1.4,y:LEVER.y,yaw:Math.PI/2});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 assert.equal((await read()).action?.id,'bypass');await p.keyboard.press('e');await p.evaluate(()=>advanceTime(200));
 const middle=await read();assert(middle.graphics.pump.handle<0&&middle.graphics.pump.handle>-.5);
 await p.screenshot({path:out+'/pump-turning-2560.png'});
 await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(1500));assert.equal((await read()).graphics.pump.handle,middle.graphics.pump.handle);
 await p.click('#primary');await p.evaluate(()=>advanceTime(2200));const settled=await read();
 assert.equal(settled.graphics.pump.handle,-1);assert.equal(settled.audio.counts.pipeKnocks,3);assert(settled.graphics.pump.valves.every(v=>Math.abs(v.angle-Math.PI/2)<1e-7));
 await p.evaluate(()=>{Object.assign(__underGreen.run.player,{x:-8,y:40,yaw:Math.PI/2,pitch:.16});advanceTime(0);});await p.screenshot({path:out+'/junction-valves-2560.png'});
 const lighting=await p.evaluate(()=>{const states=[];for(let y=15;y<=35;y+=.1){Object.assign(__underGreen.run.player,{x:0,y,yaw:0,pitch:0});advanceTime(0);states.push({y,lights:JSON.parse(render_game_to_text()).graphics.lights});}return states;});
 let maximumWeightStep=0;for(let i=1;i<lighting.length;i++){const a=new Map(lighting[i-1].lights.map(v=>[v.index,v.weight])),b=new Map(lighting[i].lights.map(v=>[v.index,v.weight]));for(const key of new Set([...a.keys(),...b.keys()]))maximumWeightStep=Math.max(maximumWeightStep,Math.abs((a.get(key)||0)-(b.get(key)||0)));}
 assert(maximumWeightStep<.068);
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(()=>{Object.assign(__underGreen.run.player,{x:0,y:31.5,yaw:0,pitch:0});advanceTime(0);});await p.screenshot({path:`${out}/lamps-${width}.png`});}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/pump-lighting.json',JSON.stringify({passed:true,middle,settled,maximumWeightStep,lighting,errors},null,2));console.log(JSON.stringify({passed:true,pipeKnocks:settled.audio.counts.pipeKnocks,maximumWeightStep,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
