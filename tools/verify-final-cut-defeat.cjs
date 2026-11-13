const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/defeat';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600},hasTouch:true}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4187/final-cut.html?test');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
 const tick=ms=>page.evaluate(ms=>advanceTime(ms),ms),read=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
 await tick(0);await page.click('#primary');if(await page.locator('#final-cut-story').evaluate(d=>d.open))await page.locator('[data-story=skip]').click();
 for(const kind of ['cutting-bank','chassis','wheel'])for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
  await page.setViewportSize({width,height});
  await page.evaluate(async({kind,width})=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:1,pump:true});r.mode='playing';Object.assign(r.player,{x:kind==='wheel'?-.55:0,y:kind==='cutting-bank'?54:kind==='wheel'?52:50,yaw:Math.PI,pitch:.5});Object.assign(r.rig,{x:kind==='cutting-bank'?3:1,y:50,yaw:-Math.PI/2,direction:-1,phase:kind==='cutting-bank'?'pass':'turn',deployment:kind==='cutting-bank'?1:0,path:[{x:-5,y:50}]});__finalCut.run=r;__finalCut.preferences.reducedMotion=width===390;__finalCut.preferences.subtitleSize=1.4;document.documentElement.style.setProperty('--caption-scale','1.4');}, {kind,width});
  const crouch=(await read()).bindings.crouch;
  if(kind==='cutting-bank')await page.keyboard.down(crouch);await tick(200);await page.keyboard.up(crouch);
  const state=await read();assert.equal(state.mode,'final_cut_caught');assert.equal(state.failure.kind,kind);assert.equal(state.checkpoint,1);
  if(kind==='cutting-bank'){assert(state.failure.player.crouch);assert.match(state.failure.advice,/Crouching/);}
  assert(await page.locator('#primary').isEnabled());assert.equal(await page.evaluate(()=>document.activeElement.id),'primary');
  const bounds=await page.locator('#primary').boundingBox();assert(bounds.y>=0&&bounds.y+bounds.height<=height,`Retry below fold at ${width}x${height}`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const frozen=JSON.stringify([state.rig,state.player,state.seconds]),impacts=state.audio.captureImpacts;
  await tick(2000);const after=await read();assert.equal(JSON.stringify([after.rig,after.player,after.seconds]),frozen);assert.equal(after.audio.captureImpacts,impacts);assert.equal(after.audio.sources,state.audio.sources);assert(state.audio.sources>0);
  await page.screenshot({path:`${out}/${kind}-${width}.png`});
  await page.keyboard.press('Enter');assert.equal((await read()).mode,'final_cut_playing');assert((await read()).pump);assert.equal((await read()).failure,null);
  await tick(0);assert(!(await page.locator('#panel').isVisible()));
  checks.push({kind,width,height,retryVisible:true,frozen:true,oneImpact:true});
 }
 // A fresh contact can be retried in the same presentation frame.
 const contact=()=>page.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:1,pump:true});r.mode='playing';Object.assign(r.player,{x:0,y:50});Object.assign(r.rig,{x:1,y:50,phase:'pass',deployment:1,yaw:-Math.PI/2,direction:-1});__finalCut.run=r;await advanceTime(17);});
 await contact();assert.equal((await read()).mode,'final_cut_caught');await page.click('#primary');assert.equal((await read()).mode,'final_cut_playing');
 await contact();await page.tap('#primary');assert.equal((await read()).mode,'final_cut_playing');
 await contact();await page.evaluate(()=>{window.defeatPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[defeatPad];});await tick(17);await page.evaluate(()=>{defeatPad.buttons[0]={pressed:true,value:1};});await tick(17);assert.equal((await read()).mode,'final_cut_playing');await page.evaluate(()=>navigator.getGamepads=()=>[]);await tick(17);
 checks.push({immediateClickRetry:true,touchTapRetry:true,gamepadARetry:true});
 await contact();await page.locator('#comfort summary').click();await page.locator('[data-campaign=reducedMotion]').scrollIntoViewIfNeeded();assert(await page.locator('[data-campaign=reducedMotion]').isVisible());await page.locator('#comfort summary').click();
 // Reload directly from a defeat restores preparation, never the cutaway.
 await page.reload();await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready);await tick(0);assert.equal((await read()).checkpoint,1);assert.equal((await read()).failure,null);
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
