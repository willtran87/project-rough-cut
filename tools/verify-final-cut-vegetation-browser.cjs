const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/visual-reeds/motion';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],shots=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 async function capture(name){await p.screenshot({path:`${out}/${name}.png`});shots.push({name,state:await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return {player:s.player,rig:{phase:s.rig.phase,x:s.rig.x,y:s.rig.y},reeds:s.graphics.ambushReeds,verges:s.graphics.verges,graphics:{width:s.graphics.width,height:s.graphics.height,draws:s.graphics.draws}};})});}
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.player,{x:23.2,y:60,yaw:Math.PI/2,pitch:.15});Object.assign(r.rig,{x:39,y:50,phase:'disabled'});__finalCut.run=r;await advanceTime(0);});
 await capture('close-east');await p.keyboard.down('a');await p.evaluate(()=>advanceTime(1800));await p.keyboard.up('a');await capture('walk-along-east');
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.player,{x:-23,y:42,yaw:Math.atan2(-4,8),pitch:0});Object.assign(r.rig,{x:-30,y:50,yaw:Math.PI/2,phase:'pass',age:0,deployment:1,speed:0,direction:1,attack:{entry:'west',from:{x:-30,y:50},to:{x:30,y:50},axis:'x',yaw:Math.PI/2}});__finalCut.run=r;await advanceTime(0);});
 await capture('contact-start');
 for(const [name,ms]of [['contact-bend',1200],['contact-wake',1600]]){await p.evaluate(ms=>advanceTime(ms),ms);await capture(name);}
 const touched=shots.at(-1).state;assert(touched.reeds.contact.contacts>0);assert(touched.verges.contact.contacts>0);assert(touched.reeds.contact.active>0);assert.equal(touched.rig.phase,'pass');
 await p.evaluate(async()=>{__finalCut.run.rig.phase='disabled';await advanceTime(1000);});await capture('settling');
 await p.evaluate(()=>advanceTime(3000));await capture('settled');assert.equal(shots.at(-1).state.reeds.contact.active,0);assert.equal(shots.at(-1).state.verges.contact.active,0);
 const before=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ambushReeds.contact);await p.evaluate(()=>{for(let i=0;i<10;i++)__finalCut.draw();});assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.ambushReeds.contact),before);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,errors,shots,method:'Close-view fixture plus real keyboard strafe; actual simulation drives the pass and contact. The post-pass fixture disables further attacks to isolate recovery.'},null,2));console.log(JSON.stringify({passed:true,errors,shots:shots.map(s=>s.name)}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
