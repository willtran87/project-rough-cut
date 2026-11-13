const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/under-green/structure',errors=[],views=[];fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  const audit=await p.evaluate(async()=>{
   const {floorLayout,solid,onFloor,BOUNDS}=await import('./under-green-course.js');
   const {structureEdges}=await import('./under-green-structure.js');const edges=structureEdges(floorLayout().tiles),points=[];
   // Upper retaining pieces must remain over the real outer collision boundary.
   const unsupported=edges.filter(e=>e.kind==='retaining').filter(e=>{
    const mid=(e.start+e.end)/2,x=e.axis==='x'?e.line:mid,y=e.axis==='y'?e.line:mid;
    const dx=e.axis==='x'?e.side*.15:0,dy=e.axis==='y'?e.side*.15:0;
    return !onFloor(x-dx,y-dy)||onFloor(x+dx,y+dy);
   });
   for(let y=BOUNDS.minY+1;y<BOUNDS.maxY;y+=2)for(let x=BOUNDS.minX+.5;x<BOUNDS.maxX;x+=1)if(!solid({x,y},.3))points.push({x,y});
   return {unsupported,edges,points:points.length,hits:__underGreen.inspectClearance(points)};
  });
  assert.deepEqual(audit.unsupported,[]);assert.deepEqual(audit.hits,[]);
  const poses=[['roots-up',0,12,0,.65],['bunker-forward',-20,70,Math.PI,0],['bunker-up',-20,70,Math.PI,.85],['bunker-back',-20,54,0,.3],['bunker-dry',-30,62,Math.PI,.25],['range-forward',12,36,Math.PI,0],['range-up',12,23.5,0,.85],['range-dry',21,23.5,Math.PI,.3],['range-net',21,23.5,Math.PI/2,.6],['keeper-back',12,2,0,.4]];
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const [name,x,y,yaw,pitch]of width===2560?poses:poses.filter(v=>['bunker-forward','bunker-up','range-forward','range-up'].includes(v[0]))){
    const state=await p.evaluate(async({x,y,yaw,pitch})=>{
     const {createRun}=await import('./under-green-sim.js'),{rangeY}=await import('./under-green-layout.js');
     const r=createRun(2);r.mode='playing';r.time=90;r.messageTime=0;
     Object.assign(r.player,{x,y:x>6?rangeY(y):y,yaw,pitch});r.joe.phase='absent';
     __underGreen.run=r;__underGreen.clearInput();advanceTime(0);return JSON.parse(render_game_to_text());
    },{x,y,yaw,pitch});
    assert(state.graphics.structureDetails.retainingEdges>0&&state.graphics.structureDetails.roofEdges>0);
    if(name==='range-net'){
     const target=await p.evaluate(async()=>{const {rangeY}=await import('./under-green-layout.js');return __underGreen.inspectView([{id:'net',x:23.12,y:rangeY(23.5),height:5.6}])[0];});
     assert(target.clear&&target.inView,'The raised range net must remain visible above its retaining wall');
    }
    views.push({name,width,height,graphics:state.graphics,player:state.player});await p.screenshot({path:`${out}/${name}-${width}.png`});
   }
  }
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  await p.keyboard.press('Escape');const paused=(await read()).graphics.backdrop.motionTime;
  await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).graphics.backdrop.motionTime,paused);
  await p.locator('#comfort summary').click();await p.locator('#reduced').check();await p.click('#primary');
  const reduced=(await read()).graphics.backdrop.motionTime;await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).graphics.backdrop.motionTime,reduced);
  const resources=await p.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/night-sky|moon-v1|cloud-atlas|far-ridge|distant-treeline/.test(r.name)).map(r=>({url:r.name,bytes:r.encodedBodySize,duration:r.duration})));
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,audit,views,skyPauseAndReducedMotion:true,resources,errors},null,2));
  console.log(JSON.stringify({passed:true,samples:audit.points,views:views.length,structure:views[0].graphics.structureDetails,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
