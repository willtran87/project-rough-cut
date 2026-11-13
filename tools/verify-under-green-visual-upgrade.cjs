const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const software=process.argv.includes('--software'),out='output/under-green/visual-upgrade/'+(software?'software':'hardware'),errors=[],views=[];fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   const positions=width===2560?[['roots',0,14,0,.08],['root-close',1.7,25,1.2,.1],['bunker',-20,70,Math.PI,.08],['pump',-19,38,-1,.05],['range',12,33,Math.PI,.08],['keeper',12,4,Math.PI,.08]]:[['roots',0,14,0,.08],['keeper',12,4,Math.PI,.08]];
   for(const [name,x,y,yaw,pitch]of positions){
    const state=await p.evaluate(async({name,x,y,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js'),{rangeY}=await import('./under-green-layout.js');const r=createRun();r.mode='playing';r.time=90;r.joe.phase='absent';r.gate=name==='keeper'?1:0;Object.assign(r.player,{x,y:x>6?rangeY(y):y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();await advanceTime(0);return JSON.parse(render_game_to_text());},{name,x,y,yaw,pitch});
    assert.equal(state.graphics.craftedSurfaces.materials.length,8);assert.equal(state.graphics.backdrop.outdoorTrees,false);assert(state.graphics.districtDetails.vaults.spans.length===3);assert(state.graphics.districtDetails.lampFinish.finishedLamps>0);
    views.push({name,width,height,graphics:state.graphics});await p.screenshot({path:`${out}/${name}-${width}.png`});
   }
  }
  await p.setViewportSize({width:1280,height:720});
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');__underGreen.run=createRun();__underGreen.run.mode='playing';advanceTime(0);});
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(700));await p.keyboard.up('w');const moved=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(moved.player.y>7);
  await p.keyboard.down('q');await p.evaluate(()=>advanceTime(250));const rear=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(rear.player.rearAmount>.8);await p.screenshot({path:out+'/rear-1280.png'});await p.keyboard.up('q');
  await p.keyboard.press('Escape');const paused=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(paused.mode,'under_green_paused');await p.evaluate(()=>advanceTime(1000));assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).elapsed,paused.elapsed);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,views,errors},null,2));console.log(JSON.stringify({passed:true,views:views.length,renderer:views[0].graphics.gpu,resolution:views[0].graphics.resolution,draws:views.slice(0,6).map(v=>[v.name,v.graphics.draws]),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
