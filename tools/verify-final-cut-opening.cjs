const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='output/final-cut/opening';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],states=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>page.evaluate(ms=>advanceTime(ms),ms),shot=async name=>{await tick(0);await page.screenshot({path:`${out}/${name}.png`});const state=await read();states.push({name,state});fs.writeFileSync(`${out}/${name}.json`,JSON.stringify(state,null,2));};
  await page.goto('http://127.0.0.1:4187/final-cut.html?test');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.click('#primary');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await shot(`arrival-${width}`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await page.setViewportSize({width:2560,height:1600});await page.evaluate(()=>Object.assign(__finalCut.run.player,{x:-2,y:17.3,yaw:-Math.PI/2}));await tick(await page.evaluate(async()=>(await import('./final-cut-arrival.js')).BOARD_READY*1000));await page.keyboard.press('e');await tick(17);assert.equal((await read()).rig.phase,'reveal');await tick(4200);await shot('deploying-2560');
  // Test fixture for observing the protected pass; simulation and rendered
  // outcomes below are real. This is not a human route-comprehension test.
  await page.evaluate(()=>{Object.assign(__finalCut.run.player,{x:-10,y:18.3,yaw:Math.atan2(30,7.7),pitch:0});});await tick(9200);await shot('partial-cut-2560');let state=await read();assert(state.graphics.mownTufts>0&&state.graphics.mownTufts<648);assert(!state.audio.ceremonyStopped);assert.equal(state.graphics.brokenProps,0);
  await tick(1800);await shot('table-crushed-2560');assert((await read()).broken.includes('hospitality-table'));assert((await read()).audio.ceremonyStopped);assert.equal((await read()).graphics.brokenProps,1);
  await page.evaluate(()=>{const r=__finalCut.run;Object.assign(r.player,{yaw:Math.atan2(r.rig.x-r.player.x,r.rig.y-r.player.y)});});await tick(1700);await shot('protected-pass-2560');state=await read();assert(state.opening.closePass);assert.equal(state.mode,'final_cut_playing');assert.equal(state.audio.sources,14);
  await tick(4000);await page.evaluate(()=>{Object.assign(__finalCut.run.player,{x:-4,y:20,yaw:Math.PI/2,pitch:.2});});await shot('cleared-strip-2560');state=await read();assert.equal(state.graphics.brokenProps,2);assert(state.graphics.mownTufts>=648);
  await page.keyboard.press('Escape');const time=state.seconds;await tick(500);assert.equal((await read()).seconds,time);await page.click('#primary');
  // Normal pass completion/pause persist the changed terrain; retry gives a
  // fresh announcement without replaying the watched reveal or PA ceremony.
  await page.reload();await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.click('#primary');assert.equal((await read()).rig.phase,'announce');assert.equal((await read()).audio.ceremony,false);assert.deepEqual((await read()).broken,state.broken);assert.deepEqual((await read()).cutAreas,state.cutAreas);await shot('retry-2560');
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,errors,states},null,2));console.log(JSON.stringify({passed:true,errors,shots:states.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
