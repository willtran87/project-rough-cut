const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const before=false,software=process.argv.includes('--software'),budget=process.argv.includes('--budget');
 const out='output/level-one-workshop-windows/'+(before?'before':'after')+(software?'-software':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__workshop={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('const softwareBudget=createSoftwareFrameBudget()',budget&&software?'const softwareBudget=createSoftwareFrameBudget({scales:[.75]})':'const softwareBudget=createSoftwareFrameBudget()')+'\nwindow.__workshopScene=()=>({world,renderer,camera,pixelWorld});'}));
 const draw=()=>page.evaluate(async()=>{__workshop.render();await RCScene3D.whenPresented();});
 const read=()=>page.evaluate(()=>{const s=__workshopScene(),rooms=[],lights=[];s.world.traverse(o=>{if(o.name==='ServiceWindowRoom'||o.name==='ClubhouseEmptyRooms')rooms.push({name:o.name,kind:o.userData.roomKind,vertices:o.geometry.attributes.position.count,positions:Array.from(o.geometry.attributes.position.array),matrix:o.matrixWorld.toArray(),depth:o.geometry.attributes.roomSize.getZ(0)});if(o.isLight)lights.push([o.name,o.type,o.intensity]);});return {rooms,lights,memory:s.renderer.info.memory,programs:s.renderer.info.programs.length,stats:RCScene3D.stats()};});
 const place=async(kind,distance=2.4,offset=0)=>{await page.evaluate(({kind,distance,offset})=>{const o=RCScene3D.stats().pixelWorld.objects.find(o=>o.kind===kind),w=kind==='service-building'?6.5:8.23,x=o.position[0]+w/2+.075,z=o.position[2]-.12,px=x+distance,pz=z+offset;Object.assign(__workshop.state.player,{x:px/.1152,y:-pz/.16,yaw:Math.atan2(x-px,pz-z),pitch:0});},{kind,distance,offset});await draw();};
 const shot=async name=>{await page.screenshot({path:out+'/'+name+'.png'});views.push({name,...await read()});};
 try{
  await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__workshop);await page.locator('#game').click();
  await page.evaluate(()=>{const t=__workshop,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol',patrolPause:9999});RCSpatialControls.set('resolution',1);});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
  if(budget){
   const fixtures=[];
   for(const distance of [1.8,5]){
    await place('service-building',distance,0);const times=[];
    for(let i=0;i<34;i++){
     const ms=await page.evaluate(async()=>{__workshop.state.player.yaw+=.0001;const t=performance.now();__workshop.render();await RCScene3D.whenPresented();const gl=__workshopScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;while((status=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-t;});if(i>=10)times.push(ms);
    }
    times.sort((a,b)=>a-b);fixtures.push({distance,median:times[12],p95:times[22],samples:24,resolution:(await read()).stats.resolution});
   }
   assert.deepEqual(errors,[]);const report={passed:true,before,software,method:'CPU submit through GPU fence completion,2ms polling; software fixed .75 in test route; two controlled views,not whole-level FPS',fixtures,errors};fs.writeFileSync(out+'/budget.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));return;
  }
  for(const kind of ['service-building','maintenance-shed'])for(const [angle,distance,offset]of [['front',1.8,0],['left',2.4,-1.8],['right',2.4,1.8],['approach',5,2]]){await place(kind,distance,offset);await shot(kind+'-'+angle+'-2560');}
  const current=await read(),workshops=current.rooms.filter(r=>r.name==='ServiceWindowRoom');assert.equal(workshops.length,2);assert.equal(current.rooms.find(r=>r.name==='ClubhouseEmptyRooms').vertices,204);for(const r of workshops){assert.equal(r.vertices,4);assert(Math.abs(r.depth-.95)<.00001);}
  assert.equal(current.stats.pathLanterns.pairs.length*2,28);assert.equal(current.lights.find(l=>l[1]==='AmbientLight')[2],.28);
  for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await place('service-building',2.4,0);await shot('service-'+width);}
  await page.setViewportSize({width:1280,height:720});await place('service-building',3,0);const start=await page.evaluate(()=>({x:__workshop.state.player.x,y:__workshop.state.player.y}));await page.keyboard.down('d');await page.evaluate(()=>advanceTime(500));await page.keyboard.up('d');const walked=await page.evaluate(()=>({x:__workshop.state.player.x,y:__workshop.state.player.y}));assert(Math.hypot(walked.x-start.x,walked.y-start.y)>1);await shot('keyboard-pass');
  const pose=(await read()).rooms;await page.keyboard.press('Escape');await page.evaluate(()=>advanceTime(300));assert.equal(await page.evaluate(()=>__workshop.state.mode),'paused');assert.deepEqual((await read()).rooms,pose);await page.keyboard.press('Escape');await page.evaluate(()=>__workshop.state.reducedMotion=true);await draw();assert.deepEqual((await read()).rooms,pose);
  const warm=await read();for(let i=0;i<20;i++){await page.evaluate(()=>__workshop.state.player.yaw+=.012);await draw();}const stable=await read();assert.deepEqual(stable.memory,warm.memory);assert.equal(stable.programs,warm.programs);
  let rebuilt=null;
  if(!before){
   await page.evaluate(()=>{window.__oldWindowRooms=[];__workshopScene().world.traverse(o=>{if(o.name==='ServiceWindowRoom'||o.name==='ClubhouseEmptyRooms'){const e={object:o,geometry:0,material:0};o.geometry.addEventListener('dispose',()=>e.geometry++);o.material.addEventListener('dispose',()=>e.material++);__oldWindowRooms.push(e);}});RCScene3D.reset();});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});await draw();
   rebuilt=await page.evaluate(()=>__oldWindowRooms.map(e=>({name:e.object.name,detached:!e.object.parent,geometry:e.geometry,material:e.material})));assert.equal(rebuilt.length,3);for(const r of rebuilt)assert.deepEqual({...r,name:undefined},{name:undefined,detached:true,geometry:1,material:1});assert.equal((await read()).rooms.length,3);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,views,start,walked,warm:{memory:warm.memory,programs:warm.programs},stable:{memory:stable.memory,programs:stable.programs},rebuilt,errors},null,2));console.log(JSON.stringify({passed:true,before,software,workshops:workshops.length,resources:stable.memory,programs:stable.programs,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
