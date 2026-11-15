const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='output/final-cut';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4187/final-cut.html?test');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>page.evaluate(ms=>advanceTime(ms),ms);
  async function shot(name){await tick(0);await page.screenshot({path:`${out}/${name}.png`,fullPage:true});}
  await shot('briefing-2560');await page.click('#primary');await shot('arrival-2560');
  const arrival=(await read()).player;await page.keyboard.down('w');await tick(1600);await page.keyboard.up('w');const moved=(await read()).player;assert(Math.hypot(moved.x-arrival.x,moved.y-arrival.y)>6);checks.push('Actual keyboard movement in the authored arrival heading');
  await page.keyboard.press('Escape');const time=(await read()).seconds;await tick(1000);assert.equal((await read()).seconds,time);await shot('pause-2560');await page.click('#primary');checks.push('Pause freezes the encounter');
  await page.evaluate(()=>Object.assign(__finalCut.run.player,{x:-2,y:17.3,yaw:-Math.PI/2}));await tick(12000);await page.keyboard.press('e');await tick(17);assert((await read()).arrival.requested);await tick(14000);await shot('opening-pass-2560');
  await page.evaluate(()=>{const r=__finalCut.run;r.player.x=15.8;r.player.y=38;r.player.yaw=-Math.PI/2;});await tick(0);await shot('pump-entry-2560');
  await page.keyboard.down('w');await tick(1500);await page.keyboard.up('w');await tick(0);
  assert.equal((await read()).action?.id,'pump');await page.keyboard.press('e');await tick(17);assert((await read()).pump);assert.equal((await read()).checkpoint,1);await shot('pump-2560');checks.push('Physical pump approach and actual interaction');
  await page.reload();await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});assert((await read()).pump);assert.equal((await read()).checkpoint,1);checks.push('Pump preparation survives reload');
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await shot(`briefing-${width}`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await page.setViewportSize({width:2560,height:1600});await page.click('#primary');
  await page.evaluate(()=>{const r=__finalCut.run;Object.assign(r.player,{x:-10,y:85,yaw:-Math.PI/2});});await tick(0);await shot('pavilion-2560');
  await page.evaluate(()=>{const r=__finalCut.run;Object.assign(r.player,{x:-9.5,y:83.3,yaw:0});});await tick(0);assert.equal((await read()).action?.id,'bell');await page.keyboard.press('e');await tick(17);assert((await read()).rig);checks.push('Bell action reachable from pavilion approach');
  await page.evaluate(()=>{const r=__finalCut.run;Object.assign(r.player,{x:-16,y:86,yaw:Math.PI/2});});
  for(let i=0;i<30&&!(await read()).won;i++)await tick(5000);
  assert((await read()).won);assert.equal((await read()).mode,'final_cut_aftermath');await shot('trap-2560');checks.push('Actual rig traversal reaches the prepared swale after bell');
  await page.keyboard.down('w');await tick(4167);await page.keyboard.up('w');await page.keyboard.down('a');await tick(5200);await page.keyboard.up('a');assert.equal((await read()).action?.id,'road');await page.keyboard.press('e');await tick(17);assert.equal((await read()).mode,'final_cut_complete');
  await page.locator('#ending-image').evaluate(img=>img.decode());await shot('ending-2560');
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await shot(`ending-${width}`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await page.reload();await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});assert.equal((await read()).mode,'final_cut_complete');checks.push('Actual keyboard road escape, ending art and persistent completion');
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:true,checks,errors,state:await read()},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
