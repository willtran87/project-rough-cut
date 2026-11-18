const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const before=process.argv.includes('--before'),software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||`output/level-one-paper-shadows/${before?'before':'after'}-route-${software?'software':'native'}`;fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[],motion=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__shadowGame={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(before?'output/level-one-paper-shadows/baseline-source/scene-3d.js':'web/scene-3d.js','utf8')+'\nwindow.__shadowScene=()=>({world,renderer,camera,moonShadow,sceneTarget});'}));
 const draw=()=>p.evaluate(async()=>{__shadowGame.render();await RCScene3D.whenPresented();});
 const signature=()=>p.evaluate(async()=>{const {renderer,sceneTarget:t}=__shadowScene(),pixels=new Uint8Array(t.width*t.height*4);renderer.readRenderTargetPixels(t,0,0,t.width,t.height,pixels);return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))).map(v=>v.toString(16).padStart(2,'0')).join('');});
 const shot=async name=>{await draw();await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:94});views.push(await p.evaluate(name=>{const r=__shadowScene(),s=RCScene3D.stats(),light=[];r.world.traverse(o=>{if(o.isLight)light.push({type:o.type,name:o.name,intensity:o.intensity,shadow:o.castShadow});});return {name,resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles,lanterns:s.pathLanterns,light,quality:s.quality,shadow:{type:r.renderer.shadowMap.type,size:r.moonShadow.shadow.mapSize.toArray(),bias:r.moonShadow.shadow.bias,normalBias:r.moonShadow.shadow.normalBias},memory:{...r.renderer.info.memory},programs:r.renderer.info.programs.length};},name));};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__shadowGame);
  await p.evaluate(()=>{const t=__shadowGame,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,controlHintTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:100,y:30,patrolPause:9999});Object.assign(s.player,{x:0,y:20,yaw:0,pitch:0});advanceTime(17);});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  const timing=[];
  for(const [name,x,y,yaw,pitch]of [['opening',0,20,0,0],['service',-20,52,-.12,0],['woodland',-45,320,.7,0],['field-log',-98,411,0,-.15],['release',97,615,0,-.15],['release-oblique',100,615,-.24,-.15]]){await p.evaluate(v=>Object.assign(__shadowGame.state.player,v),{x,y,yaw,pitch});await shot(name);
   if(process.argv.includes('--timing')&&['opening','woodland','release'].includes(name)){const samples=await p.evaluate(async()=>{const r=__shadowScene(),gl=r.renderer.getContext(),samples=[];for(let i=0;i<48;i++){gl.finish();const start=performance.now();__shadowGame.render();gl.finish();const elapsed=performance.now()-start;await RCScene3D.whenPresented();if(i>=8)samples.push(elapsed);}return samples;});const sorted=samples.slice().sort((a,b)=>a-b);timing.push({name,median:sorted[Math.floor(sorted.length/2)],p95:sorted[Math.floor(sorted.length*.95)],samples});}
  }
  await p.evaluate(()=>{const s=__shadowGame.state;Object.assign(s.player,{x:0,y:34,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:0,y:42});});await shot('joe-contact');
  // Compare cached presentation with a forced fresh shadow render at real
  // simulation poses, and verify the shadow attachment survives lateral moves.
  for(let i=0;i<5;i++){await p.evaluate(i=>{const s=__shadowGame.state;Object.assign(s.player,{x:-2+i,y:34,yaw:0});s.hole.elapsed+=.05;},i);await draw();const cached=await signature();await p.evaluate(()=>{const r=__shadowScene();r.renderer.shadowMap.needsUpdate=true;r.world.traverse(o=>{if(o.isLight&&o.shadow)o.shadow.needsUpdate=true;});});await draw();const fresh=await signature();assert.equal(cached,fresh,'Cached and forced shadows differ at pose '+i);motion.push({pose:i,hash:fresh});}
  assert(new Set(motion.map(m=>m.hash)).size===5);await shot('joe-contact-side');
  await p.setViewportSize({width:1280,height:720});await shot('joe-1280');await p.setViewportSize({width:390,height:844});await shot('joe-390');
  // Bounded repeated draws with a frozen scene must not allocate new resources.
  const resources=await p.evaluate(async()=>{const r=__shadowScene(),read=()=>({geometries:r.renderer.info.memory.geometries,textures:r.renderer.info.memory.textures,programs:r.renderer.info.programs.length}),start=read();for(let i=0;i<20;i++){__shadowGame.render();await RCScene3D.whenPresented();}return {start,end:read()};});assert.deepEqual(resources.start,resources.end);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,views,motion,resources,timing,errors},null,2));console.log(JSON.stringify({passed:true,before,software,views:views.length,motion:motion.length,resources,timing:timing.map(({samples,...t})=>t),errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
