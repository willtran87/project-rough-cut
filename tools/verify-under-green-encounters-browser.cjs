const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),out='output/under-green/encounters',errors=[],checks=[];fs.mkdirSync(out,{recursive:true});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test&telemetry');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));await tick(0);await p.click('#primary');
 async function place(v){await p.evaluate(async v=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(v.cp||0);r.mode='playing';Object.assign(r,v.run);Object.assign(r.player,{yaw:0},v.player);Object.assign(r.joe,v.joe);__underGreen.run=r;__underGreen.enableTelemetry();__underGreen.clearInput();advanceTime(0);},v);}
 await place({player:{x:0,y:27.5}});await p.keyboard.down('w');await tick(600);await p.keyboard.up('w');assert.equal((await read()).joe.phase,'enter');await tick(400);
 await p.screenshot({path:out+'/arrival-forward-2560.png'});assert((await read()).player.y<(await read()).joe.y);await tick(2400);await p.screenshot({path:out+'/arrival-landed-2560.png'});
 checks.push('Real forward input triggers the door ahead; Joe walks out at floor height');
 await place({player:{x:0,y:64,waterEntry:{spillway:-1}},run:{time:2},joe:{phase:'enter',age:-100}});
 const samples=[];for(let i=0;i<5;i++){await tick(100);samples.push((await read()).player.y);await p.screenshot({path:`${out}/recovery-${i}-2560.png`});}
 assert(samples.every((y,i)=>!i||samples[i-1]-y<=.81));assert(samples[0]>62);await tick(500);assert((await read()).player.y<60);assert.equal((await read()).waterHits,1);
 await p.keyboard.press('Escape');const paused=(await read()).seconds;await tick(1000);assert.equal((await read()).seconds,paused);await p.click('#primary');
 checks.push('Visible recovery spans several frames and pause freezes the simulation');
 await place({cp:1,player:{x:0,y:53},run:{time:9},joe:{x:0,y:43,phase:'walk',last:{x:0,y:53}}});await p.keyboard.down('w');await tick(6000);await p.keyboard.up('w');
 const state=await read();assert(state.telemetry.events.some(e=>e.type==='crossing-enter'));assert(state.telemetry.events.some(e=>e.type==='crossing-exit'));assert(state.telemetry.metrics.minimumGap>0);await p.screenshot({path:out+'/crossing-earned-2560.png'});
 await p.setViewportSize({width:390,height:844});await place({player:{x:0,y:29,yaw:-.3},joe:{phase:'enter',age:.8}});await tick(17);await p.screenshot({path:out+'/arrival-390.png'});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks.push('Telemetry records actual movement across the encounter; portrait UI remains within viewport');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,recoverySamples:samples,telemetry:state.telemetry,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
