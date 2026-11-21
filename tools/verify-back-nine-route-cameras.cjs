const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__routeWorld={scene,camera,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const result=await p.evaluate(async()=>{
  const {COURSE,blocked}=await import('./back-nine-course.js'),{createRun}=await import('./back-nine-sim.js'),{terrainHeight}=await import('./course-terrain.js'),{cameraObstacleHeight}=await import('./runner-camera.js'),{isDestructibleFeature}=await import('./course-destruction-state.js');
  const obstacles=[...COURSE.obstacles,...COURSE.features.filter(isDestructibleFeature).map(f=>({...f,box:true}))],results=[],violations=[];const w=__routeWorld;
  for(const foot of [false,true])for(const [routeIndex,path]of (foot?[...COURSE.paths,...COURSE.footPaths]:COURSE.paths).entries()){
   const r=createRun();r.mode='driving';r.time=20;r.departure.phase='finished';r.cart.x=35;r.cart.y=10;r.joe.x=35;r.joe.y=10;if(foot)r.foot={x:0,y:20,yaw:0,viewYaw:0,speed:0,onFoot:true};const actor=foot?r.foot:r.cart;w.resetCamera();let samples=0;
   for(let part=1;part<path.length;part++){
    const a=path[part-1],b=path[part],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),n=Math.ceil(length/3);
    for(let i=0;i<=n;i++){
     const x=a[0]+dx*i/n,y=a[1]+dy*i/n;if(y<15||blocked({x,y},foot?.5:1))continue;
     Object.assign(actor,{x,y,yaw:Math.atan2(dx,dy),viewYaw:Math.atan2(dx,dy)});r.time+=.05;w.update(r,{reducedMotion:false});samples++;
     const eye=w.camera.position,base=terrainHeight(x,y)+(foot?1.2:2.45);
     if(eye.y<terrainHeight(eye.x,-eye.z)+.44)violations.push({foot,routeIndex,x,y,kind:'terrain'});
     // Independent point samples through the actual presented eye segment.
     for(let t=.1;t<=1.001;t+=.05){const px=x+(eye.x-x)*t,py=y+(-eye.z-y)*t,h=base+(eye.y-base)*t;
      const hit=obstacles.find(o=>h>terrainHeight(o.x,o.y)+.02&&h<terrainHeight(o.x,o.y)+cameraObstacleHeight(o)-.02&&(o.box?Math.abs(px-o.x)<o.rx-.02&&Math.abs(py-o.y)<o.ry-.02:Math.hypot(px-o.x,py-o.y)<o.r-.02));
      if(hit){violations.push({foot,routeIndex,x,y,kind:hit.id||hit.kind});break;}
     }
    }
   }results.push({foot,routeIndex,samples});
  }return {results,violations};
 });fs.writeFileSync(out+'/report.json',JSON.stringify({passed:result.violations.length===0,...result,errors},null,2));assert.deepEqual(result.violations,[]);assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,samples:result.results.reduce((n,r)=>n+r.samples,0),cartRoutes:result.results.filter(r=>!r.foot).length,footRoutes:result.results.filter(r=>r.foot).length,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
