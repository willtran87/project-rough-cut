const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],out='output/under-green/encounters';fs.mkdirSync(out,{recursive:true});p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));await tick(0);await p.click('#primary');
 async function place(v){await p.evaluate(async v=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(v.cp??1);r.mode='playing';Object.assign(r,v.run);Object.assign(r.player,{yaw:0},v.player);Object.assign(r.joe,v.joe);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},v);await tick(17);}
 await place({player:{x:0,y:57},joe:{x:0,y:47,phase:'walk',last:{x:0,y:57}},run:{time:2}});for(let i=0;i<30;i++)await tick(32);
 let s=await read();assert(s.audio.started);assert(s.audio.counts.joeSteps>0);const unfocused=s.audio.targets;
 await p.keyboard.down('q');await tick(17);s=await read();assert(s.audio.targets.focus);assert(s.audio.targets.water<unfocused.water*.4);assert(s.audio.targets.engine>=unfocused.engine);await p.keyboard.up('q');
 checks.push('Live Joe steps are audible sources; Listening Focus ducks water and emphasizes Joe');
 await place({player:{x:0,y:64},joe:{phase:'absent'},run:{time:2}});const center=(await read()).audio.targets;
 await place({player:{x:10,y:64},joe:{phase:'absent'},run:{time:2}});const lateral=(await read()).audio.targets;
 assert(lateral.water<center.water*.65);assert(lateral.waterPan<-.8);checks.push('Water uses lateral distance, source height and stereo bearing');
 await place({cp:0,player:{y:28.6}});await tick(1600);s=await read();assert.equal(s.audio.counts.door,1);assert.equal(s.audio.counts.starter,1);
 await p.keyboard.press('Escape');await p.waitForTimeout(220);const beforePause=(await read()).seconds;await tick(1000);s=await read();assert.equal(s.seconds,beforePause);assert(!s.audio.targets.live);assert(s.audio.master<.01);await p.click('#primary');
 checks.push('Door and starter fire once; pausing cancels audio and freezes the scene');
 // Follow authored gate/console positions when the range is compacted; this
 // fixture tests the real Use/closure/aftermath chain, not historical coordinates.
 const ending=await p.evaluate(async()=>{const {SLUICE,GATE}=await import('./under-green-course.js');const player={x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI};return {cp:3,player,joe:{x:GATE.x,y:GATE.y+6,phase:'walk',last:{x:player.x,y:player.y}}};});
 await place(ending);await p.keyboard.press('e');await tick(1500);s=await read();assert.equal(s.mode,'under_green_aftermath');assert.equal(s.gate,1);assert(await p.locator('#panel').isHidden());
 const x=s.player.x;await p.keyboard.down('a');await tick(250);await p.keyboard.up('a');assert(Math.abs((await read()).player.x-x)>.5);
 await p.keyboard.down('r');await tick(350);await p.keyboard.up('r');assert(Math.abs((await read()).player.rearAngle)>2.9);await p.screenshot({path:out+'/aftermath-look-back-2560.png'});
 await p.keyboard.press('Escape');const age=(await read()).aftermathAge;await tick(1000);assert.equal((await read()).aftermathAge,age);await p.click('#primary');assert.equal((await read()).mode,'under_green_aftermath');
 await tick(1100);s=await read();assert.equal(s.audio.counts.applause,1);assert(s.audio.targets.applause>0);await p.screenshot({path:out+'/aftermath-applause-2560.png'});
 await tick(4000);assert.equal((await read()).mode,'under_green_complete');assert(await p.locator('#panel').isVisible());
 await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});assert.equal((await read()).mode,'under_green_complete');
 checks.push('Secured gate allows movement/rear glance and pause; applause precedes result panel; completion persists');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/audio-aftermath.json',JSON.stringify({passed:true,checks,waterComparison:{center,lateral},errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});

