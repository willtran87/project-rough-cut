const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const baseline=process.argv.includes('--baseline');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/under-green/district-art/'+(baseline?'before':'after'),views=[],errors=[];fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  // Suppress only the district name in these QA captures: scenery should carry identity.
  await p.addStyleTag({content:'#district {visibility:hidden}'});
  for(const [width,height]of baseline?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const [name,x,y,yaw,pitch]of [['roots',0,14,0,.08],['bunker',-20,70,Math.PI,.08],['pump',-19,38,-1,.05],['range',12,33,Math.PI,.08],['keeper',12,4,Math.PI,.08]]){
    const state=await p.evaluate(async({name,x,y,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js'),{rangeY}=await import('./under-green-layout.js');const r=createRun(2);r.mode='playing';r.time=90;r.messageTime=0;r.joe.phase='absent';r.gate=name==='keeper'?1:0;Object.assign(r.player,{x,y:x>6?rangeY(y):y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);return JSON.parse(render_game_to_text());},{name,x,y,yaw,pitch});
    views.push({name,width,height,graphics:state.graphics,player:state.player});await p.screenshot({path:`${out}/${name}-${width}.png`});
    if(!baseline&&width===2560){
     await p.keyboard.down('d');await p.evaluate(()=>advanceTime(250));await p.keyboard.up('d');
     await p.keyboard.down('r');await p.evaluate(()=>advanceTime(300));await p.screenshot({path:`${out}/${name}-rear-2560.png`});await p.keyboard.up('r');await p.evaluate(()=>advanceTime(300));
     const moved=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(moved.mode,'under_green_playing');
     assert(Math.hypot(moved.player.x-state.player.x,moved.player.y-state.player.y)>.2,'Strafing remains available');
    }
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,errors},null,2));console.log(JSON.stringify({passed:true,views:views.length,draws:views.map(v=>[v.name,v.width,v.graphics.draws]),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
