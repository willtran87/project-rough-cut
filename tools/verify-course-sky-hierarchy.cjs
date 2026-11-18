const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const before=process.argv.includes('--before'),software=process.argv.includes('--software');
 const out=`output/level-one-sky-hierarchy/${before?'before':'after'}-${software?'software':'native'}`;
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=file=>fs.readFileSync((before?'output/level-one-sky-hierarchy/baseline-source/':'web/')+file,'utf8');
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__skyGame={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:source('scene-3d.js').replace('softwareBudget=createSoftwareFrameBudget()','softwareBudget=createSoftwareFrameBudget({scales:[.625]})')+'\nwindow.__skyScene=()=>({world,renderer,camera,parallax,sceneTarget,currentData});'}));
 if(before)await page.route('**/parallax-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:source('parallax-scene.js')}));
 await page.route('**/__sky-baseline.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-sky-hierarchy/baseline-source/parallax-scene.js','utf8')}));
 await page.route('**/__sky-current.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/parallax-scene.js','utf8')}));
 const draw=()=>page.evaluate(async()=>{__skyGame.render();await RCScene3D.whenPresented();});
 const place=async(x,y,yaw=0,pitch=-.1)=>{await page.evaluate(v=>{assertLegal:if(__skyGame.obstacleAtPosition(v.x,v.y,2.4)){for(let r=1;r<7;r++)for(let i=0;i<12;i++){const x=v.x+Math.cos(i*Math.PI/6)*r*6,y=v.y+Math.sin(i*Math.PI/6)*r*6;if(Math.abs(x)<108&&!__skyGame.obstacleAtPosition(x,y,2.4)){v.x=x;v.y=y;break assertLegal;}}throw Error('No legal pose');}Object.assign(__skyGame.state.player,v);},{x,y,yaw,pitch});await draw();};
 const shot=async name=>{
  await draw();await page.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:94});
  const view=await page.evaluate(async name=>{
   const {world,renderer,camera,parallax,sceneTarget:t}=__skyScene(),stats=RCScene3D.stats();
   const before={name,pose:{...__skyGame.state.player},resolution:stats.resolution,draws:stats.drawCalls,triangles:stats.triangles,parallax:stats.parallax};
   // Render only the physical world onto black. Every resulting pixel must be
   // identical before/after: decorative sky changes cannot alter illumination.
   renderer.setRenderTarget(t);renderer.autoClear=true;renderer.clear();renderer.render(world,camera);
   const bytes=new Uint8Array(t.width*t.height*4);renderer.readRenderTargetPixels(t,0,0,t.width,t.height,bytes);
   before.worldHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
   __skyGame.render();await RCScene3D.whenPresented();return before;
  },name);views.push(view);
 };
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__skyGame);
  await page.evaluate(()=>{const t=__skyGame,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true,effectsDensity:0});Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});advanceTime(17);});
  await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await draw();
  const inventory=await page.evaluate(()=>{const s=RCScene3D.stats(),lights=[];__skyScene().world.traverse(o=>{if(o.isLight)lights.push({type:o.type,intensity:o.intensity,position:o.position.toArray()});});return {lanterns:s.pathLanterns,lights,objects:s.pixelWorld.objects,obstacles:__skyScene().currentData.obstacles};});
  assert.equal(inventory.lanterns.pairs.length*2,28);
  if(process.argv.includes('--timing')){
   const timings=[];
   for(const [name,x,y,yaw,pitch]of [['opening',0,10,0,-.1],['service',0,379,0,-.1],['sky',0,10,-.2,.25]]){
    await place(x,y,yaw,pitch);
    timings.push({name,...await page.evaluate(async()=>{
     const r=__skyScene(),pixel=new Uint8Array(4),frame=async()=>{const t=performance.now();__skyGame.render();await RCScene3D.whenPresented();r.renderer.readRenderTargetPixels(r.sceneTarget,0,0,1,1,pixel);return performance.now()-t;};
     for(let i=0;i<12;i++)await frame();const groups=[];
     for(let i=0;i<3;i++){const samples=[];for(let j=0;j<12;j++)samples.push(await frame());samples.sort((a,b)=>a-b);groups.push({median:samples[6],p95:samples[11]});}
     return {groups,resolution:RCScene3D.stats().resolution};
    })});
   }
   assert.deepEqual(errors,[]);fs.writeFileSync(out+'/timing.json',JSON.stringify({before,software,timings,errors},null,2));console.log(JSON.stringify({before,software,timings}));return;
  }
  for(const v of [['opening',0,10,0,-.1],['audit',0,100,0,-.1],['water',0,240,0,-.1],['clubhouse',80,312,-1,-.05],['service',0,379,0,-.1],['dead-green',14,483,-.12,-.4],['range',-55,590,-.9,-.1],['release',0,650,0,-.1],['sky',0,10,-.2,.25]]){await place(...v.slice(1));await shot(v[0]);}
  for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await place(0,10);await shot('opening-'+width);}
  // Compare both modules with the feature disabled, and verify that the opt-in
  // changes only sky colour through ordinary motion/nightfall/reduced states.
  const behavior=await page.evaluate(async()=>{
   const current=await import('./__sky-current.js'),old=await import('./__sky-baseline.js'),THREE=await import('./vendor/three/three.module.js');
   const a=old.createParallax(),b=current.createParallax(),c=current.createParallax({courseSky:true}),r=__skyScene().renderer,target=new THREE.WebGLRenderTarget(320,180),view=__skyScene().camera.clone();
   view.aspect=16/9;view.updateProjectionMatrix();
   const image=p=>{r.setRenderTarget(target);r.autoClear=true;r.clear();r.render(p.scene,p.camera);const out=new Uint8Array(320*180*4);r.readRenderTargetPixels(target,0,0,320,180,out);return out;};
   let frames=0,changed=0,oldSum=0,newSum=0;const near=(a,b)=>{if(Math.abs(a-b)>1e-12)throw Error('Coverage changed');};
   for(let i=0;i<50;i++){
    const reduced=i>=35,paused=i>=25&&i<35,nightfall=i>=40?{progress:.7,skyScale:.58,moonScale:.6,cloudWidth:1.2,cloudHeight:1.1,cloudOpacity:.6}:null;
    view.rotation.y=i*.07;for(const p of [a,b,c])p.update(view,i*.1,reduced,paused,nightfall);
    const original=image(a),unchanged=image(b),styled=image(c);for(let j=0;j<original.length;j++){if(original[j]!==unchanged[j])throw Error('Default chapter sky changed');if(j%4!==3){oldSum+=original[j];newSum+=styled[j];if(original[j]!==styled[j])changed++;}}
    near(a.moonCoverage(),c.moonCoverage());near(a.stats().motionTime,c.stats().motionTime);frames++;
   }
   for(const p of [a,b,c])p.dispose();target.dispose();return {frames,changed,oldSum,newSum,defaultExact:true,coverageExact:true};
  });assert(behavior.changed>0&&behavior.newSum<behavior.oldSum);await draw();
  await page.setViewportSize({width:1280,height:720});await place(0,230);const start=await page.evaluate(()=>({...__skyGame.state.player}));
  await page.keyboard.down('w');await page.evaluate(()=>advanceTime(400));await page.keyboard.up('w');await page.keyboard.down('d');await page.evaluate(()=>advanceTime(250));await page.keyboard.up('d');await draw();
  const end=await page.evaluate(()=>({...__skyGame.state.player,legal:!__skyGame.obstacleAtPosition(__skyGame.state.player.x,__skyGame.state.player.y,2.4)}));assert(end.legal&&Math.hypot(end.x-start.x,end.y-start.y)>1);await shot('walked');
  await page.keyboard.press('Escape');await page.evaluate(()=>advanceTime(500));assert.equal(await page.evaluate(()=>__skyGame.state.mode),'paused');await page.keyboard.press('Escape');await draw();
  const memory=()=>page.evaluate(()=>({memory:{...__skyScene().renderer.info.memory},programs:__skyScene().renderer.info.programs.length}));const warm=await memory();
  for(let i=0;i<12;i++){await page.evaluate(()=>__skyGame.state.player.yaw+=.015);await draw();}assert.deepEqual(await memory(),warm);
  await page.evaluate(()=>RCScene3D.reset());await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await draw();assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,inventory,views,behavior,start,end,warm,errors},null,2));console.log(JSON.stringify({passed:true,before,software,views:views.length,behavior,warm,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
