const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const baseline=process.argv.includes('--baseline'),out='output/under-green/bunker-bank/'+(baseline?'before':'after');
if(baseline&&fs.existsSync(out+'/browser.json'))throw Error('Preserve the existing baseline');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  await p.addStyleTag({content:'#hud,#water-read,#guide,#caption,#hint{visibility:hidden}'});
  const poses=[['cutaway',-30.2,62,-Math.PI/2,.28],['approach',-29.5,69.5,-2.7,.12],['return',-30,55,-.5,.15],...baseline?[]:[['rake',-29.5,60,-1.14,.55]]];
  for(const [width,height]of baseline?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const [name,x,y,yaw,pitch]of poses){
    const result=await p.evaluate(async pose=>{
     const {createRun}=await import('./under-green-sim.js');const r=createRun(1);r.mode='playing';r.time=30;r.messageTime=0;r.joe.phase='absent';Object.assign(r.player,pose);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);
     return {state:JSON.parse(render_game_to_text()),sight:__underGreen.inspectView([{id:'sand-strata',x:-32.01,y:62,height:2.48},{id:'soil-strata',x:-32.01,y:62,height:2.92},{id:'turf',x:-32.01,y:62,height:3.15}])};
    },{x,y,yaw,pitch});
    views.push({name,width,height,...result});await p.screenshot({path:`${out}/${name}-${width}.png`});
    if(!baseline&&name==='cutaway')assert(result.sight.every(s=>s.clear&&s.inView),'The actual bank layers must be visible');
   }
  }
  let clearance=null;
  if(!baseline){
   clearance=await p.evaluate(async()=>{
    const {createRun}=await import('./under-green-sim.js'),{floorLayout,solid}=await import('./under-green-course.js');
    const {structureEdges}=await import('./under-green-structure.js'),{isExposedBunkerEdge}=await import('./under-green-bunker-layout.js');
    const {settleWeapon,weaponClear}=await import('./under-green-clearance.js');
    const edges=structureEdges(floorLayout().tiles).filter(isExposedBunkerEdge),r=createRun(1);r.mode='playing';r.joe.phase='absent';__underGreen.run=r;advanceTime(0);
    const poses=[];
    for(let y=53;y<=71;y++)for(const x of [-31.65,-30,-28.35])for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const yaw of [0,Math.PI,-Math.PI/2])for(const fov of [45,85])for(const aspect of [1.6,390/844])if(!solid({x,y},.3))poses.push({x,y,height,pitch,yaw,fov,aspect});
    const cameras=__underGreen.inspectCameraClearance(poses),actors=[];
    for(const y of [55.2,61.2,68.3])for(const x of [-31,-30])for(const [phase,age,yaw]of [['walk',.3,Math.PI],['windup',.55,Math.PI/2],['sweep',.2,Math.PI/2],['recover',.4,Math.PI/2]]){
     const run=createRun(1);run.mode='playing';run.time=30;Object.assign(run.joe,{x,y,yaw,phase,age,walk:.4,speed:0});Object.assign(run.player,{x:-29,y:62});settleWeapon(run,1/60);__underGreen.run=run;advanceTime(0);
     actors.push({x,y,requestedPhase:phase,phase:run.joe.phase,physicalClear:weaponClear(run.joe),geometry:__underGreen.inspectJoeGeometry(),footing:__underGreen.inspectJoeFooting()});
    }
    return {edges,cameras,actors};
   });
   fs.writeFileSync(out+'/clearance.json',JSON.stringify(clearance));
   assert.equal(clearance.edges.length,1);assert(clearance.cameras.every(c=>!c.hits.length));
   for(const actor of clearance.actors){assert(actor.physicalClear);assert.deepEqual(actor.geometry.hits,[]);assert.equal(actor.footing.belowFloor,0);}
   await p.setViewportSize({width:2560,height:1600});
   await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(1);r.mode='playing';r.joe.phase='absent';Object.assign(r.player,{x:-30,y:70,yaw:Math.PI,pitch:.12});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
   await p.keyboard.down('w');await p.evaluate(()=>advanceTime(4000));await p.keyboard.up('w');await p.evaluate(()=>advanceTime(17));
   const walked=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(Math.abs(walked.player.y-54.64)<.01);assert.equal(walked.player.speed,0);assert.equal(walked.waterHits,0);
   await p.screenshot({path:out+'/walked-2560.png'});clearance.walked={x:walked.player.x,y:walked.player.y,speed:walked.player.speed,waterHits:walked.waterHits};
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,baseline,views,clearance:clearance&&{edges:clearance.edges,cameras:clearance.cameras.length,actors:clearance.actors.length,walked:clearance.walked},errors},null,2));console.log(JSON.stringify({passed:true,baseline,views:views.length,cameras:clearance?.cameras.length,actors:clearance?.actors.length,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
