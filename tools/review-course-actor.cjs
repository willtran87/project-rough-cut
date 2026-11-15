const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/level-one-mower-finish/review',software=process.argv.includes('--software'),before=process.argv.includes('--before'),budget=process.argv.includes('--budget');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__actorReview={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('const softwareBudget=createSoftwareFrameBudget()',budget&&software?'const softwareBudget=createSoftwareFrameBudget({scales:[.75]})':'const softwareBudget=createSoftwareFrameBudget()')+'\nwindow.__actorScene=()=>({joeModel,renderer,world,camera});'}));
 if(before)await p.route('**/joe-model.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-mower-finish/baseline-source/joe-model.js','utf8')}));
 const draw=()=>p.evaluate(async()=>{__actorReview.render();await RCScene3D.whenPresented();});
 const shot=async name=>{await draw();await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:93});};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__actorReview);await p.locator('#game').click();await p.evaluate(()=>{const s=__actorReview.state;__actorReview.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:false});s.keys.clear();Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:30,y:252,effectLastX:30,effectLastY:252,effectHeading:-Math.PI/2,effectSpeed:0,walkMeters:0,patrolPause:9999,mode:'patrol'});Object.assign(s.player,{x:30,y:230,yaw:0,pitch:-.20});RCSpatialControls.set('resolution',1);});await draw();await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
  if(budget){
   const fixtures=[];
   for(const [name,y]of [['encounter',230],['distant',146]]){
    await p.evaluate(y=>Object.assign(__actorReview.state.player,{x:30,y,yaw:0,pitch:0}),y);await draw();const times=[];
    for(let i=0;i<34;i++){const ms=await p.evaluate(async()=>{__actorReview.state.player.yaw+=.0001;const start=performance.now();__actorReview.render();await RCScene3D.whenPresented();const gl=__actorScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;while((status=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-start;});if(i>=10)times.push(ms);}
    times.sort((a,b)=>a-b);fixtures.push({name,median:times[12],p95:times[22],...await p.evaluate(()=>({resolution:RCScene3D.stats().resolution,draws:RCScene3D.stats().drawCalls,triangles:RCScene3D.stats().triangles,memory:__actorScene().renderer.info.memory,programs:__actorScene().renderer.info.programs.length,lod:RCScene3D.stats().joeModel.lod}))});
   }
   assert.deepEqual(errors,[]);const report={passed:true,before,software,fixtures,errors,method:'24 warmed submit-through-GPU-fence samples, 2ms polling; fixed960x540 software; bounded fixtures only'};fs.writeFileSync(out+'/budget.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));return;
  }
  const inventory=await p.evaluate(()=>{const a=[];__actorScene().joeModel.root.traverse(o=>{if(o.isMesh)a.push({name:o.name,parent:o.parent?.name,geometry:o.geometry.type,triangles:(o.geometry.index?.count||o.geometry.attributes.position.count)/3,materials:(Array.isArray(o.material)?o.material:[o.material]).map(m=>({name:m.name,type:m.type,color:m.color?.getHexString(),map:m.map?[m.map.image.width,m.map.image.height]:null,shininess:m.shininess}))});});return a;});
  for(const [name,x,y,yaw,pitch]of [['front',30,230,0,-.2],['quarter',48,240,-.82,-.25],['side',4,252,Math.PI/2,-.2],['rear',30,274,Math.PI,-.2],['near',30,239,0,-.2],['far',30,146,0,0]]){
   const legal=await p.evaluate(v=>{Object.assign(__actorReview.state.player,v);return !__actorReview.obstacleAtPosition(v.x,v.y,2.4);},{x,y,yaw,pitch});assert(legal,name+' camera');await shot(name);views.push({name,...await p.evaluate(()=>({resolution:RCScene3D.stats().resolution,model:RCScene3D.stats().joeModel,memory:__actorScene().renderer.info.memory,programs:__actorScene().renderer.info.programs.length}))});
  }
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(()=>Object.assign(__actorReview.state.player,{x:30,y:230,yaw:0,pitch:-.2}));await shot('front-'+width);}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,inventory,views,errors},null,2));console.log(JSON.stringify({passed:true,views:views.map(v=>({name:v.name,resolution:v.resolution,lod:v.model.lod,grip:v.model.handError})),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
