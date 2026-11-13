const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/final-cut/visual-ground/accepted',software=process.argv.includes('--software');
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],shots=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:39,y:50,phase:'disabled'});__finalCut.run=r;await advanceTime(0);});
 for(const [name,x,y,tx,ty,pitch]of [['service-edge',-20.5,35,-23,37,.55],['pump-apron',16.3,38,13.7,38,.7],['pump-bed',5,32.5,7,34,.6],['boundary-bed',24,60,25.3,62,.65],['fairway',-2,0,4,60,.16],['path-junction',-7,76,-9,78,.65],['bunker-ceiling',-8,15,-12,15,-.4],['pump-ceiling',12,38,7,38,-.4],['pavilion-ceiling',-14,86,-18,86,-.4]]){
  await p.evaluate(async({x,y,tx,ty,pitch})=>{Object.assign(__finalCut.run.player,{x,y,yaw:Math.atan2(tx-x,ty-y),pitch});await advanceTime(0);},{x,y,tx,ty,pitch});
  await p.screenshot({path:`${out}/${name}.png`});shots.push({name,state:await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return {player:s.player,graphics:s.graphics};})});
 }
 // Real movement checks the material's world anchoring and prompt continuity.
 await p.keyboard.down('d');await p.evaluate(()=>advanceTime(500));await p.keyboard.up('d');await p.screenshot({path:`${out}/strafe.png`});
 const viewports=[];for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(()=>advanceTime(0));viewports.push(await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return {viewport:[innerWidth,innerHeight],render:[s.graphics.width,s.graphics.height],overflow:document.documentElement.scrollWidth>innerWidth};}));if(width===390)await p.screenshot({path:`${out}/portrait.png`});}
 assert.deepEqual(errors,[]);assert(viewports.every(v=>!v.overflow));assert.equal(shots[0].state.graphics.groundFinish.physicalHeightChange,0);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,errors,shots,viewports},null,2));console.log(JSON.stringify({passed:true,software,errors,views:shots.length,viewports}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
