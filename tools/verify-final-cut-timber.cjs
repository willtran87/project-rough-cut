const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/final-cut/visual-timber/${software?'software':'accepted'}`;
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],shots=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:39,y:50,phase:'disabled'});__finalCut.run=r;await advanceTime(0);});
 for(const [name,x,y,tx,ty,pitch]of [
  ['bunker-eave',-4.6,9.3,-5.18,10.575,-.52],
  ['bunker-joint',-6.4,12.3,-5.68,11.18,-.57],
  ['bunker-roof',-4,3,-10,15,.05],
  ['pump-joint',13.3,35.5,14.32,34.18,-.5],
  ['pump-gutter',15.5,32.6,14.93,34.3,-.62],
  ['pavilion-gable',-13,78,-16,81.5,-.45],
  ['pavilion-joint',-12.5,82.8,-11.18,81.68,-.48]
 ]){
  await p.evaluate(async({x,y,tx,ty,pitch})=>{Object.assign(__finalCut.run.player,{x,y,yaw:Math.atan2(tx-x,ty-y),pitch});await advanceTime(0);},{x,y,tx,ty,pitch});
  await p.screenshot({path:`${out}/${name}.png`});shots.push({name,state:await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return {player:s.player,graphics:s.graphics};})});
 }
 // Real input moves past the joint rather than substituting another fixture.
 const before=await p.evaluate(()=>JSON.parse(render_game_to_text()).player);
 await p.keyboard.down('a');await p.evaluate(()=>advanceTime(250));await p.keyboard.up('a');
 const after=await p.evaluate(()=>JSON.parse(render_game_to_text()).player);assert(Math.hypot(after.x-before.x,after.y-before.y)>.2);
 await p.screenshot({path:`${out}/joint-strafe.png`});
 const viewports=[];for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(()=>advanceTime(0));viewports.push(await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return {viewport:[innerWidth,innerHeight],render:[s.graphics.width,s.graphics.height],overflow:document.documentElement.scrollWidth>innerWidth};}));if(width===390)await p.screenshot({path:`${out}/portrait.png`});}
 assert.deepEqual(errors,[]);assert(viewports.every(v=>!v.overflow));
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,errors,shots,viewports,movement:{before,after}},null,2));console.log(JSON.stringify({passed:true,software,errors,views:shots.length,viewports}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
