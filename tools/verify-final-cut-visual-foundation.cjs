const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/final-cut/visual-foundation';
const software=process.argv.includes('--software');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],states=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4187/final-cut.html?test');
  await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  for(const [name,x,y,tx,ty,pitch]of [['overlook',-2,0,0,60,.06],['bunker',-1,6,-10,15,-.12],['pump',16.4,38,10,38,-.12],['pavilion',-5,77,-16,86,-.12],['ground',2,23,2,31,.72],['mower',18,57,15,50,-.12],['sky',-2,0,-20,70,-.4]]){
   await p.evaluate(async({name,x,y,tx,ty,pitch})=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.player,{x,y,yaw:Math.atan2(tx-x,ty-y),pitch});Object.assign(r.rig,{x:name==='mower'?15:39,y:50,yaw:0,phase:'pass',age:3,deployment:1,speed:8,reelAngle:1.2});__finalCut.run=r;await advanceTime(0);},{name,x,y,tx,ty,pitch});
   await p.screenshot({path:out+'/'+name+'.png'});
   states.push({name,graphics:await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics)});
  }
  await p.evaluate(async()=>{Object.assign(__finalCut.run.player,{x:-2,y:0,yaw:0,pitch:.08});await advanceTime(0);});
  const viewports=[];
  for(const [width,height]of [[2560,1600],[1920,1080],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(()=>advanceTime(0));
   await p.screenshot({path:`${out}/viewport-${width}x${height}.png`});
   viewports.push({width,height,graphics:await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics),overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  }
  const tiers=[];
  if(await p.locator('#visual-tier').count()){
   await p.setViewportSize({width:2560,height:1600});
   for(const tier of ['balanced','high','ultra','auto']){await p.selectOption('#visual-tier',tier,{force:true});await p.evaluate(()=>advanceTime(0));tiers.push({tier,graphics:await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics)});}
   for(const t of tiers)assert.equal(t.graphics.width,software?960:{balanced:1600,high:1920,ultra:2560,auto:2560}[t.tier]);
  }
  const timings=[];
  if(process.argv.includes('--profile'))for(const tier of ['balanced','high','ultra']){
   await p.selectOption('#visual-tier',tier,{force:true});await p.evaluate(()=>advanceTime(0));
   const sample=await p.evaluate(async()=>{const gl=document.querySelector('#game').getContext('webgl2'),values=[],yaw=__finalCut.run.player.yaw;for(let i=0;i<24;i++){__finalCut.run.player.yaw=yaw+i*Math.PI/12;__finalCut.draw();}gl.finish();__finalCut.run.player.yaw=yaw;let first,last;for(let i=0;i<25;i++){__finalCut.run.player.yaw+=.009;__finalCut.run.time+=1/60;const t=performance.now();__finalCut.draw();gl.finish();const ms=performance.now()-t;if(i>=5)values.push(ms);await new Promise(requestAnimationFrame);last=JSON.parse(render_game_to_text()).graphics;if(i===4)first=last;}values.sort((a,b)=>a-b);return {median:values[10],p95:values[18],samples:values,first,last};});
   assert.equal(sample.first.geometries,sample.last.geometries);assert.equal(sample.first.textures,sample.last.textures);timings.push({tier,...sample});
  }
  if(tiers.length){await p.selectOption('#visual-tier','high',{force:true});await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});assert.equal(await p.locator('#visual-tier').inputValue(),'high');}
  fs.writeFileSync(out+'/report.json',JSON.stringify({software,errors,states,viewports,tiers,timings,method:'Optional timings include draw submission and gl.finish, excluding RAF wait; 20 moving-camera samples after five warmup draws, not sustained-gameplay FPS.'},null,2));
  console.log(JSON.stringify({out,errors,views:states.map(s=>[s.name,s.graphics.width,s.graphics.height,s.graphics.draws]),tiers:tiers.map(s=>[s.tier,s.graphics.width])}));
  if(errors.length||viewports.some(v=>v.overflow))process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
