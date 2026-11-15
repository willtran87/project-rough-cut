const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/under-green/camera',errors=[];fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85})));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  const result=await p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js'),{WATERS,solid,waterPoint,LEVER,SLUICE,NOTE,BOUNDS,GATE,gateBlocks}=await import('./under-green-course.js');
   const {settleWeapon}=await import('./under-green-clearance.js');
   const {channelNozzles}=await import('./under-green-flow.js');
   // At the service door a normally moving player arrives after it has opened.
   // Keep the real open-door pose; test Joe separately at each attack stage.
   const r=createRun();r.mode='playing';Object.assign(r.joe,{phase:'walk',x:0,y:40});__underGreen.run=r;advanceTime(0);
   const points=[];
   for(const w of WATERS)for(const nozzle of channelNozzles(w))for(const offset of [0,-.15,.15]){
    const point=waterPoint(w,nozzle.side*(w.width/2-.301),nozzle.y+offset);
    if(!solid(point,.3))points.push({id:w.id,...point});
   }
   for(const [id,target]of [['pump',LEVER],['sluice',SLUICE]])for(let a=0;a<Math.PI*2;a+=Math.PI/8){const point={x:target.x+Math.sin(a)*.9,y:target.y+Math.cos(a)*.9};if(!solid(point,.3))points.push({id,...point});}
   for(let y=BOUNDS.minY+1;y<BOUNDS.maxY;y+=2)for(let x=BOUNDS.minX+.5;x<BOUNDS.maxX;x+=1)if(!solid({x,y},.3)&&Math.hypot(x-r.joe.x,y-r.joe.y)>.65)points.push({id:'floor-grid',x,y});
   for(const x of [NOTE.x-.7,NOTE.x-.5,NOTE.x,NOTE.x+.5,NOTE.x+.7])if(!solid({x,y:57.199},.3))points.push({id:'record-edge',x,y:57.199});
   const poses=[];for(const point of points)for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2])poses.push({...point,height,pitch,yaw,fov:85,aspect:844/390});
   const results=__underGreen.inspectCameraClearance(poses),dynamic=[];
   for(const gate of [0,.25,.5,.75,1]){
    r.gate=gate;advanceTime(0);const samples=[];
    for(const height of [1.12,1.65])for(const side of [-1,1])for(const x of [GATE.x-4,GATE.x,GATE.x+4])for(const pitch of [-.85,0,.85]){
     const point={x,y:GATE.y+side*.601};if(!solid(point,.3,gateBlocks(gate,height+.15)))samples.push({id:'gate-'+gate,...point,height,pitch,yaw:side<0?0:Math.PI,fov:85,aspect:844/390});
    }
    dynamic.push(...__underGreen.inspectCameraClearance(samples));
   }
   r.gate=0;
   for(const [phase,ages]of [['walk',[0]],['windup',[0,.3,.6]],['sweep',[0,.1125,.225,.3375,.45]],['recover',[0,.65,1.3]]])for(const age of ages){
    Object.assign(r.joe,{x:0,y:40,yaw:0,phase,age,speed:phase==='walk'?1.5:0,weaponPose:null});settleWeapon(r,1/60);advanceTime(0);
    const samples=[];for(let a=0;a<Math.PI*2;a+=Math.PI/4)for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])samples.push({id:phase+'-'+age,x:Math.sin(a)*1.9,y:40+Math.cos(a)*1.9,height,pitch,yaw:a+Math.PI,fov:85,aspect:844/390});
    dynamic.push(...__underGreen.inspectCameraClearance(samples));
   }
   return {poses:poses.length,dynamicPoses:dynamic.length,failures:[...results,...dynamic].filter(r=>r.hits.length)};
  });
  fs.writeFileSync(out+'/probe.json',JSON.stringify({...result,errors},null,2));
  for(const [i,failure]of result.failures.slice(0,4).entries()){
   await p.evaluate(pose=>{const r=__underGreen.run;Object.assign(r.player,{x:pose.x,y:pose.y,yaw:pose.yaw,pitch:pose.pitch,eyeHeight:pose.height,crouched:pose.height<1.5});advanceTime(0);},failure.pose);
   await p.screenshot({path:`${out}/failure-${i}.png`});
  }
  const views=[];
  if(!result.failures.length)for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const [name,x,y,yaw,pitch,eyeHeight]of [['nozzle-crouch',-2.699,23,0,0,1.12],['nozzle-look-down',2.699,23,Math.PI/2,-.85,1.12],['pump-close',-24.9,40,Math.PI/2,-.3,1.65],['record',-23.6,55.8,-.3,.1,1.65]]){
    const state=await p.evaluate(async({x,y,yaw,pitch,eyeHeight})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.messageTime=0;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch,eyeHeight,crouched:eyeHeight<1.5});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);return JSON.parse(render_game_to_text());},{x,y,yaw,pitch,eyeHeight});
    views.push({name,width,height,player:state.player,fov:state.comfort.fov});await p.screenshot({path:`${out}/${name}-${width}.png`});
   }
  }
  const movement=[];
  for(const [id,x,y,keys]of [['nozzle-bank',-2.5,23,['c','a']],['door-jamb',-4.4,43.2,['w']],['door-opening',-5.35,43.2,['w']]]){
   await p.evaluate(async({x,y})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.messageTime=0;Object.assign(r.player,{x,y,yaw:0});if(y===23){const {WATERS}=await import('./under-green-course.js');r.time=(.5-WATERS.find(w=>w.lesson).offset+12)%12;}if(y>30)Object.assign(r.joe,{phase:'walk',x:0,y:40});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);},{x,y});
   for(const key of keys)await p.keyboard.down(key);await p.evaluate(()=>advanceTime(500));for(const key of keys)await p.keyboard.up(key);
   const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));movement.push({id,player:state.player});
   if(id==='nozzle-bank')assert(state.player.x>=-2.7001&&state.player.x<-2.65);
   if(id==='door-jamb')assert(state.player.y<=43.451&&state.player.y>43.3);
   if(id==='door-opening')assert(state.player.y>45.05,'Door remains traversable at normal walking speed');
   const cameraHits=await p.evaluate(()=>{const s=JSON.parse(render_game_to_text()),v=s.player;return __underGreen.inspectCameraClearance([{x:v.x,y:v.y,height:v.eyeHeight,yaw:v.yaw,pitch:v.pitch}])[0].hits;});assert.deepEqual(cameraHits,[],id);
  }
  await p.setViewportSize({width:2560,height:1600});await p.evaluate(()=>advanceTime(0));await p.screenshot({path:out+'/door-movement-2560.png'});
  fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:!result.failures.length,...result,views,movement,errors},null,2));
  console.log(JSON.stringify({poses:result.poses,dynamicPoses:result.dynamicPoses,views:views.length,failures:result.failures.length,examples:result.failures.slice(0,5),errors}));
  assert.deepEqual(errors,[]);assert.equal(result.failures.length,0);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
