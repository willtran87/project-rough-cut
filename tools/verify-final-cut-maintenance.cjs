const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out='output/final-cut/maintenance/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],shots=[],checks=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),shot=async name=>{await tick(0);await p.screenshot({path:out+'/'+name+'.png'});shots.push(name)};
 const ready=async()=>{await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0)};
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await ready();await p.click('#primary');
 // Isolate the actual shelter/record/Use chain; this is not a full route.
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({openingSeen:true});r.mode='playing';r.rig.phase='waiting';Object.assign(r.player,{x:8.5,y:38,yaw:Math.atan2(-.5,1),pitch:0});__finalCut.run=r;});
 await shot('pump-view');assert.equal((await read()).action.id,'pump');await p.keyboard.press('e');await tick(17);assert((await read()).pump);await shot('pump-open');
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({openingSeen:true});r.mode='playing';r.rig.phase='waiting';Object.assign(r.player,{x:6.9,y:38.2,yaw:0,pitch:.04});__finalCut.run=r;});
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('wall-'+width);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.setViewportSize({width:2560,height:1600});await p.evaluate(()=>Object.assign(__finalCut.run.player,{x:11.5,y:38.2,yaw:Math.PI,pitch:.08}));await tick(0);assert.equal((await read()).action.id,'record');await p.keyboard.press('e');await tick(17);let s=await read();assert(s.loadLimit);assert(!s.pump);await shot('record-taken');
 await p.evaluate(()=>Object.assign(__finalCut.run.player,{x:6.9,y:38.2,yaw:0,pitch:.04}));await shot('wall-after-record');checks.push('Actual pump Use works beside the wall diagram; separate record Use secures evidence without preparing or winning, and the permanent diagram remains afterward');
 await p.keyboard.press('Escape');await p.locator('#journal summary').click();await p.locator('#journal').scrollIntoViewIfNeeded();
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
  await p.setViewportSize({width,height});await p.locator('#journal').scrollIntoViewIfNeeded();await shot('journal-'+width);
  const image=await p.locator('#journal img').evaluate(el=>({loaded:el.complete&&el.naturalWidth===1000,rect:el.getBoundingClientRect().toJSON(),alt:el.alt}));assert(image.loaded);assert(image.rect.left>=0&&image.rect.right<=width);assert(image.alt.includes('Heavy machinery sinks'));
 }
 const frozen=(await read()).seconds;await tick(2000);assert.equal((await read()).seconds,frozen);checks.push('The same diagram is available in the paused journal, with readable text/alt equivalents and no horizontal overflow at four sizes');
 await p.reload();await ready();await p.click('#primary');await tick(0);s=await read();assert(s.loadLimit);await p.keyboard.press('Escape');assert(await p.locator('#journal').isVisible());await p.locator('#journal summary').click();await p.locator('#journal').scrollIntoViewIfNeeded();await shot('journal-restored');checks.push('Actual saved record reload retains the diagram and its journal access');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,shots,errors},null,2));console.log(JSON.stringify({passed:true,checks,shots:shots.length,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
