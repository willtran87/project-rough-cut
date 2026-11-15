const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=`output/under-green/visual-pass70/states-${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});const errors=[],rows=[];try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 async function place(elapsed,x=1.5,y=9.8,yaw=.65,pitch=-.6){await p.evaluate(async args=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=26.3;r.elapsed=args.elapsed;r.joe.phase='absent';Object.assign(r.player,{x:args.x,y:args.y,yaw:args.yaw,pitch:args.pitch,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{elapsed,x,y,yaw,pitch});}
 for(const [name,elapsed]of [['dry',0],['rising',42],['high',49],['falling',60],['receded',68]]){
  await place(elapsed);const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({name,resolution:s.graphics.resolution,flood:s.graphics.flood,player:s.player,decay:s.graphics.districtDetails.galleryDecay});
  assert.equal(rows.at(-1).decay.triangles,2005);await p.screenshot({path:`${out}/${name}.jpg`,quality:91});
 }
 await place(0,3.6,10.1,.25,1.05);
 const roof=await p.evaluate(()=>__underGreen.inspectView([{id:'roof-outside',x:3.6,y:11.1,height:5},{id:'east-outside',x:5.5,y:10.8,height:3.3}]));assert(roof.every(r=>!r.clear));
 await place(0,-25.7,40,Math.PI/2,-.27);assert.equal(await p.evaluate(()=>__underGreen.run.bypass),false);await p.keyboard.press('e');await p.evaluate(()=>advanceTime(400));assert.equal(await p.evaluate(()=>__underGreen.run.bypass),true);
 await p.evaluate(()=>__underGreen.whenPresented());await p.screenshot({path:`${out}/pump-operated.jpg`,quality:91});assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,roof,pumpOperated:true,errors},null,2));console.log(JSON.stringify({passed:true,software,views:6,pumpOperated:true,roofOpaque:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
