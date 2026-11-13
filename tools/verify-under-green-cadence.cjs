const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const baseline=process.argv.includes('--baseline'),out='output/under-green/cadence';
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 fs.mkdirSync(out,{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Immediate pre-cadence snapshot, not the older pre-footwork reconstruction.
  if(baseline)for(const file of ['under-green-actor.js','under-green-footwork.js'])
   await page.route('**/'+file,route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(`${out}/before/${file}`,'utf8')}));
  await page.goto('http://127.0.0.1:4187/under-green.html?test');
  await page.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.click('#primary');
  const cases=await page.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js'),results=[];
   for(const fps of [60,30,15])for(const speed of [1.5,2.1,2.4]){
    const r=createRun();r.mode='playing';Object.assign(r.player,{x:2,y:56,yaw:Math.PI+.5,pitch:-.14});
    Object.assign(r.joe,{x:0,y:48,yaw:0,phase:'walk',speed,walk:0});__underGreen.run=r;__underGreen.clearInput();
    const frames=[];
    for(let frame=0;frame<=fps*3;frame++){
     r.time=frame/fps;r.joe.age=r.time;r.joe.y=48+r.time*speed;r.joe.walk=r.time*speed;advanceTime(0);
     const a=JSON.parse(render_game_to_text()).graphics.actor;
     frames.push({time:r.time,feet:a.footPositions.map(([x,h,z])=>({x,y:r.joe.y-z,height:h})),sole:a.soleHeights,serial:a.footsteps.serial,footError:a.footError,handError:a.handError});
    }
    results.push({fps,speed,frames});
   }
   return results;
  });
  const metrics=cases.map(c=>{
   const drift=[];for(let i=1;i<c.frames.length;i++)for(let foot=0;foot<2;foot++){
    const a=c.frames[i-1],b=c.frames[i];
    if(a.sole[foot]<=.008&&b.sole[foot]<=.008)drift.push(Math.hypot(b.feet[foot].x-a.feet[foot].x,b.feet[foot].y-a.feet[foot].y)/(b.time-a.time));
   }
   drift.sort((a,b)=>a-b);
   return {fps:c.fps,speed:c.speed,contacts:c.frames.at(-1).serial-c.frames[0].serial,stanceSamples:drift.length,stanceSpeedMax:Math.max(...drift),stanceSpeedMedian:drift[Math.floor(drift.length/2)],stanceSpeedP95:drift[Math.floor(drift.length*.95)],maxFootError:Math.max(...c.frames.map(f=>f.footError)),maxHandError:Math.max(...c.frames.map(f=>f.handError))};
  });
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await page.setViewportSize({width,height});
   for(const frame of [10,24]){
    await page.evaluate(async({frame,width})=>{
     const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';
     Object.assign(r.player,{x:1.8,y:width<600?59:55,yaw:Math.PI+.55,pitch:-.12});Object.assign(r.joe,{x:0,y:52,yaw:0,phase:'walk',speed:2.1,walk:0});__underGreen.run=r;
     if(width<600)r.player.yaw=Math.atan2(-r.player.x,52+frame/60*2.1+.35-r.player.y);
     for(let i=0;i<=frame;i++){r.time=i/60;r.joe.walk=r.time*2.1;r.joe.y=52+r.joe.walk;advanceTime(0);}
    },{frame,width});
    await page.screenshot({path:`${out}/${baseline?'before':'after'}-walk-${frame}-${width}.png`});
   }
  }
  const report={baseline,metrics,errors};fs.writeFileSync(`${out}/${baseline?'before':'after'}-walking.json`,JSON.stringify({report,cases},null,2));
  console.log(JSON.stringify(report));assert.deepEqual(errors,[]);
  if(!baseline)for(const m of metrics){
   assert(m.maxFootError<.015);assert(m.maxHandError<.015);assert(m.stanceSamples>20);
   // Includes the low toe-off frames before contact release, not just the
   // explicit planted flag. At 15 Hz this permits less than 6 mm per frame.
   assert(m.stanceSpeedMax<.08,`Grounded ankle slips at ${m.stanceSpeedMax} m/s`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
