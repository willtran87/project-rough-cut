const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/rig-contact';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],poses=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 for(const phase of ['pass','turn'])for(const distance of [0,.17,.61,1.4]){
  const data=await p.evaluate(async({phase,distance})=>{const {createRun}=await import('./final-cut-sim.js'),{rigParts,worldPart}=await import('./final-cut-rig.js');const r=createRun({checkpoint:1,cut:['rough-1-0','rough-1-1','rough-1-2']});r.mode='playing';Object.assign(r.rig,{x:0,y:50,yaw:.73,phase,deployment:phase==='pass'?1:0,steering:phase==='turn'?.6:0,distance,reelAngle:-distance*3});Object.assign(r.player,{x:7,y:56,yaw:Math.atan2(-7,-6),pitch:.1});__finalCut.run=r;__finalCut.draw();const geometry=__finalCut.rigGeometry(),parts=rigParts(r.rig);let excess=0;const extents=[];
   for(const g of geometry){const part=parts.find(s=>s.id===g.id);if(!part)continue;const b=worldPart(r.rig,part),s=Math.sin(b.yaw),c=Math.cos(b.yaw);let min=Infinity,max=-Infinity;
    for(const [x,h,y]of g.points){const dx=x-b.x,dy=y-b.y,side=dx*c-dy*s,forward=dx*s+dy*c;excess=Math.max(excess,Math.abs(side)-part.w/2,Math.abs(forward)-part.d/2);min=Math.min(min,side);max=Math.max(max,side);}
    if(g.id.startsWith('reel'))extents.push({id:g.id,width:max-min,expected:part.w});
   }return {phase,distance,excess,extents,meshCount:geometry.length};}, {phase,distance});
  assert(data.excess<1e-5,JSON.stringify(data));for(const reel of data.extents)assert(Math.abs(reel.width-reel.expected)<1e-5,'Spinning reel axis changed its reach');poses.push(data);
 }
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>{__finalCut.run.rig.phase='pass';__finalCut.run.rig.deployment=1;__finalCut.run.rig.steering=0;return advanceTime(0);});await p.screenshot({path:`${out}/rig-${width}.png`});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:true,poses,errors},null,2));console.log(JSON.stringify({passed:true,poses,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
