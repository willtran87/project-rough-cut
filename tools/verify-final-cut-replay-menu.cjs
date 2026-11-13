const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/final-cut/replays';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600},hasTouch:true}),errors=[],checks=[];p.on('pageerror',e=>errors.push(e.message));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);
 assert.equal(await p.locator('#replay-options').isVisible(),false);assert.equal((await read()).cutPlan.seed,0);
 await p.click('#primary');await tick(17);assert.equal((await read()).cutPlan.seed,0);await p.keyboard.press('Escape');assert.equal(await p.locator('#replay-options').isVisible(),false);checks.push('Fresh entry uses Original round and does not expose replay choices during briefing or play');
 const completed=()=>p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');__finalCut.run=createRun({checkpoint:2,completed:true,won:true});await advanceTime(0);});
 await completed();await p.locator('#replay-options summary').click();assert.equal(await p.locator('#replay-plan').inputValue(),'1');await p.locator('#replay-plan').focus();await p.keyboard.press('ArrowDown');assert.equal(await p.locator('#replay-plan').inputValue(),'2');assert.match(await p.locator('#replay-description').innerText(),/returns along the near strip/);
 await p.locator('#show-credits').click();await p.locator('#credits-back').click();assert.equal(await p.locator('#replay-plan').inputValue(),'2');checks.push('Keyboard selects Return pass; its description is truthful and survives a visit to credits');
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await p.locator('#replay-plan').scrollIntoViewIfNeeded();await tick(0);const rect=await p.locator('#replay-plan').boundingBox();assert(rect.width<=width);assert(rect.height>=44);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`${out}/menu-${width}.png`});}
 await p.locator('#primary').tap();let state=await read();assert.equal(state.cutPlan.seed,2);assert.equal(state.cutPlan.openingRemaining,3);assert.equal(state.mode,'final_cut_playing');assert(!state.won);checks.push('Four responsive layouts and actual touch Replay start the selected fresh encounter');
 await p.keyboard.press('Escape');assert.match(await p.locator('#round-plan').innerText(),/Return pass/);await p.locator('#restart').click();assert.equal((await read()).cutPlan.seed,2);assert.equal((await read()).cutPlan.openingRemaining,3);
 await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);assert.equal((await read()).cutPlan.seed,2);assert.equal((await read()).cutPlan.openingRemaining,3);checks.push('Pause explains the active plan; Restart and actual reload retain it');
 await completed();await p.evaluate(()=>{window.replayPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[replayPad];});await tick(50);
 const press=async index=>{await p.evaluate(index=>replayPad.buttons[index].pressed=true,index);await tick(17);await p.evaluate(index=>replayPad.buttons[index].pressed=false,index);await tick(17);};
 // Navigate from the initially focused Replay button using only the D-pad.
 for(let i=0;i<40&&await p.evaluate(()=>document.activeElement.id!=='replay-plan');i++)await press(12);
 if(await p.evaluate(()=>document.activeElement.id!=='replay-plan')){
  for(let i=0;i<40&&await p.evaluate(()=>document.activeElement!==document.querySelector('#replay-options summary'));i++)await press(12);
  assert(await p.evaluate(()=>document.activeElement===document.querySelector('#replay-options summary')));await press(0);await press(13);
 }
 assert.equal(await p.evaluate(()=>document.activeElement.id),'replay-plan');await press(14);assert.equal(await p.locator('#replay-plan').inputValue(),'0');
 for(let i=0;i<40&&await p.evaluate(()=>document.activeElement.id!=='primary');i++)await press(13);assert.equal(await p.evaluate(()=>document.activeElement.id),'primary');await press(0);state=await read();assert.equal(state.cutPlan.seed,0);assert.equal(state.mode,'final_cut_playing');checks.push('D-pad navigation and left/right select adjustment choose Original round; controller A starts it');
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/menu.json`,JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
