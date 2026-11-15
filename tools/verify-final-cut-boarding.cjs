const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));
 const samples=[];for(const [name,offset]of [['board-before-seat',-.001],['board-seated',.001]]){
  const state=await p.evaluate(async offset=>{const {createRun}=await import('./final-cut-sim.js'),{BOARD_WALK,BOARD_TURN,BOARD_CLIMB}=await import('./final-cut-arrival.js');const r=createRun({arrival:{age:BOARD_WALK+BOARD_TURN+BOARD_CLIMB+offset,reached:true}});r.mode='playing';Object.assign(r.player,{x:24,y:26,yaw:Math.PI/2,pitch:-.07});__finalCut.run=r;await advanceTime(0);return JSON.parse(render_game_to_text());},offset);assert.equal(state.graphics.joe.actors,1);assert(state.graphics.joe.head[1]>2&&state.graphics.joe.head[1]<3.65);samples.push(state.graphics.joe);await p.screenshot({path:`output/final-cut/arrival/${name}.png`});
 }
 assert.equal(samples[0].parent,'world');assert.equal(samples[1].parent,'rig');const jump=Math.hypot(...samples[0].head.map((v,i)=>v-samples[1].head[i]));assert(jump<.02,`Head jumps ${jump}m at seating`);assert.deepEqual(errors,[]);
 fs.writeFileSync('output/final-cut/arrival/boarding.json',JSON.stringify({passed:true,samples,headJumpMetres:jump,errors},null,2));console.log(JSON.stringify({passed:true,samples,headJumpMetres:jump,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
