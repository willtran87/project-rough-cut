const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const baseline=process.argv.includes('--baseline'),software=process.argv.includes('--software');
 const out='output/under-green/visual-upgrade/ground'+(baseline?'-baseline':'')+(software?'-software':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
  const positions=[['entrance',0,8,0,-.5],['wall-base',3.8,10,1,-.55],['crossing',0,18.5,0,-.45],['gallery',0,28,0,-.55],['bunker',-30,65,Math.PI,-.48],['pump',-23.5,42,-1,-.6],['range',21,30,Math.PI,-.5],['keeper',12,14.5,Math.PI,-.65]];
  async function fixture(pos,elapsed=0){await p.evaluate(async({pos,elapsed})=>{const [,x,y,yaw,pitch]=pos,{createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=0;r.elapsed=elapsed;r.joe.phase='absent';r.bypass=true;r.bypassAt=-20;Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{pos,elapsed});}
  async function shot(pos,width,height,elapsed=0){await fixture(pos,elapsed);const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));if(!baseline){assert.equal(state.graphics.districtDetails.groundFinish.drainAprons,16);assert.equal(state.graphics.districtDetails.groundFinish.addedGeometry,0);}views.push({name:pos[0],width,height,state});await p.screenshot({path:`${out}/${pos[0]}-${width}.png`});}
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const pos of width===2560?positions:positions.filter(p=>['entrance','crossing','bunker'].includes(p[0])))await shot(pos,width,height);}
  await p.setViewportSize({width:1280,height:720});await fixture(positions[0]);
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(500));await p.keyboard.up('w');assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).player.y>9);
  await p.keyboard.down('c');await p.evaluate(()=>advanceTime(250));assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).player.eyeHeight<1.3);await p.screenshot({path:out+'/crouch-1280.png'});await p.keyboard.up('c');
  await p.keyboard.down('q');await p.evaluate(()=>advanceTime(250));assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).player.rearAmount>.8);await p.screenshot({path:out+'/rear-1280.png'});await p.keyboard.up('q');
  const {floodState}=await import('../web/under-green-flood.js');
  let flooded=0;for(let t=0;t<180;t+=.5)if(floodState(t).depth>.2){flooded=t;break;}assert(flooded>0);await shot(['flood',0,8,0,-.55],1280,720,flooded);assert(views.at(-1).state.graphics.flood.visible);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,baseline,software,views,errors},null,2));console.log(JSON.stringify({passed:true,views:views.length,resolution:views[0].state.graphics.resolution,counters:views.slice(0,8).map(v=>[v.name,v.state.graphics.draws,v.state.graphics.triangles,v.state.graphics.textures]),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
