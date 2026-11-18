const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const before=process.argv.includes('--before'),software=process.argv.includes('--software'),budget=process.argv.includes('--budget'),out='output/level-one-floodlight-craft/'+(before?'before':'after')+(software?'-software':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__craft={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('updateFloodlight(l,frame.lightPower(l.o))','updateFloodlight(l,window.__craftPower??frame.lightPower(l.o))').replace('const softwareBudget=createSoftwareFrameBudget()',budget&&software?'const softwareBudget=createSoftwareFrameBudget({scales:[.75]})':'const softwareBudget=createSoftwareFrameBudget()')+'\nwindow.__craftScene=()=>({world,renderer,camera,lights});'}));
 if(before)for(const name of ['pixel-world-props.js','pixel-effects.js'])await page.route('**/'+name+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-floodlight-craft/baseline-source/'+name,'utf8')}));
 const draw=()=>page.evaluate(async()=>{__craft.render();await RCScene3D.whenPresented();});
 const read=()=>page.evaluate(()=>{const {world,renderer,lights}=__craftScene(),s=RCScene3D.stats();return {resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles,memory:renderer.info.memory,programs:renderer.info.programs.length,lanterns:s.pathLanterns.pairs.length*2,lamps:lights.map(l=>({material:l.fixture.material.uuid,position:l.fixture.matrixWorld.toArray(),power:l.power,intensity:l.source?.intensity,emission:l.fixture.material.emissiveIntensity,source:l.source?.position.toArray()})),ambient:world.children.filter(o=>o.type==='AmbientLight').map(o=>o.intensity)};});
 const place=async(x,z,pitch)=>{await page.evaluate(({x,z,pitch})=>{const l=__craftScene().lights[0];Object.assign(__craft.state.player,{x:l.o.x+x/.1152,y:l.o.y-z/.16,yaw:Math.atan2(-x,z),pitch});},{x,z,pitch});await draw();};
 const shot=async name=>{await page.screenshot({path:out+'/'+name+'.png'});views.push({name,...await read()});};
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__craft);await page.locator('#game').click();
  await page.evaluate(()=>{const t=__craft,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol',patrolPause:9999});RCSpatialControls.set('resolution',1);});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
  if(budget){
   const fixtures=[];
   for(const distance of [2.8,8]){
    await place(0,distance,.12);const times=[];
    for(let i=0;i<34;i++){
     const ms=await page.evaluate(async()=>{__craft.state.player.yaw+=.0001;const t=performance.now();__craft.render();await RCScene3D.whenPresented();const gl=__craftScene().renderer.getContext(),f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();let status;while((status=gl.clientWaitSync(f,0,0))===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);if(status===gl.WAIT_FAILED)throw Error('GPU fence failed');return performance.now()-t;});if(i>=10)times.push(ms);
    }
    times.sort((a,b)=>a-b);fixtures.push({distance,median:times[12],p95:times[22],samples:24,resolution:(await read()).resolution});
   }
   assert.deepEqual(errors,[]);const report={passed:true,before,software,method:'CPU submit through GPU fence completion,2ms polling; software fixed .75 in test route; controlled views,not whole-level FPS',fixtures,errors};fs.writeFileSync(out+'/budget.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));return;
  }
  for(const [name,x,z,pitch]of [['approach',0,4,.12],['head-inspection',0,2.2,.53],['side',2.8,1,.40],['rear',0,-2.8,.40],['base',.5,1.8,-.44]]){await place(x,z,pitch);await shot(name+'-2560');}
  const normal=await read();assert.equal(normal.lanterns,28);assert.deepEqual(normal.ambient,[.005]);assert.equal(new Set(normal.lamps.map(l=>l.material)).size,4);
  await place(0,4,.12);for(const [name,power]of [['dim',.12],['off',0],['restored',1]]){await page.evaluate(p=>window.__craftPower=p,power);await draw();const s=await read();for(const l of s.lamps){assert.equal(l.emission,power*1.6);assert.equal(l.intensity,power*18);}await shot(name+'-2560');}
  for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await place(0,4,.12);await shot('approach-'+width);}
  await page.setViewportSize({width:1280,height:720});await place(0,4,.12);const pose=(await read()).lamps.map(l=>l.position),warm=await read();for(let i=0;i<20;i++){await page.evaluate(()=>__craft.state.player.yaw+=.01);await draw();}const stable=await read();assert.deepEqual(stable.memory,warm.memory);assert.equal(stable.programs,warm.programs);assert.deepEqual(stable.lamps.map(l=>l.position),pose);
  const start=await page.evaluate(()=>({x:__craft.state.player.x,y:__craft.state.player.y}));await page.keyboard.down('d');await page.evaluate(()=>advanceTime(400));await page.keyboard.up('d');const walked=await page.evaluate(()=>({x:__craft.state.player.x,y:__craft.state.player.y}));assert(Math.hypot(walked.x-start.x,walked.y-start.y)>1,'Real keyboard input must move the player');await page.keyboard.press('Escape');await draw();assert.equal(await page.evaluate(()=>__craft.state.mode),'paused');assert.deepEqual((await read()).lamps.map(l=>l.position),pose);await page.keyboard.press('Escape');await page.evaluate(()=>__craft.state.reducedMotion=true);await draw();assert.deepEqual((await read()).lamps.map(l=>l.position),pose);
  const haze=[];let rebuilt=null;
  if(!before){
   for(const distance of [.6,1,4,9,10.5,11.8,12.1]){
    await place(0,distance,.12);const row=await page.evaluate(async distance=>{const {world,lights}=__craftScene(),m=world.getObjectByName('PixelEffect-shafts'),l=lights[0],a=m.instanceMatrix.array;let fade=null;for(let i=0;i<m.count;i++)if(Math.abs(a[i*16+12]-l.source.position.x)<.001&&Math.abs(a[i*16+14]-l.source.position.z)<.001)fade=m.geometry.attributes.shaftFade.getX(i);const {lightHazeFade}=await import('./course-light-haze.js');return {distance,fade,expected:lightHazeFade(distance,1),opacity:m.material.opacity,mask:[m.material.map.image.width,m.material.map.image.height]};},distance);if(row.fade!==null)assert(Math.abs(row.fade-row.expected)<.00001);else assert(row.expected===0);assert.deepEqual(row.mask,[128,128]);assert.equal(row.opacity,.075);haze.push(row);if([4,10.5,11.8].includes(distance))await shot('haze-'+distance);
   }
   await page.evaluate(()=>{window.__oldLenses=__craftScene().lights.map(l=>{const e={geometry:0,material:0};l.fixture.geometry.addEventListener('dispose',()=>e.geometry++);l.fixture.material.addEventListener('dispose',()=>e.material++);return e;});RCScene3D.reset();});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});await draw();rebuilt=await page.evaluate(()=>__oldLenses);assert.equal(rebuilt.length,4);for(const r of rebuilt)assert.deepEqual(r,{geometry:1,material:1});
  }
  const geometry=await page.evaluate(async()=>{
   const THREE=await import('./vendor/three/three.module.js'),{buildCourseFloodlight}=await import('./course-floodlight-craft.js'),root=new THREE.Group(),mat=new THREE.MeshBasicMaterial();
   const mesh=(parent,g,type,color,x=0,y=0,z=0)=>{const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);parent.add(m);return m;};const box=(p,t,x,y,z,w,h,d,c)=>mesh(p,new THREE.BoxGeometry(w,h,d),t,c,x,y,z);
   const lens=buildCourseFloodlight(root,{mesh,box});root.updateMatrixWorld(true);const v=new THREE.Vector3();let belowClearance=0,triangles=0,meshes=0;
   root.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;triangles+=(o.geometry.index?.count||p.count)/3;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.y<2.4&&(Math.abs(v.x)>.24001||Math.abs(v.z)>.24001))belowClearance++;}});
   const result={meshes,triangles,belowClearance,lensNormal:new THREE.Vector3(0,0,1).transformDirection(lens.matrixWorld).toArray(),headCount:root.children.filter(o=>o.name==='CourseFloodlightHead').length};root.traverse(o=>o.geometry?.dispose());mat.dispose();return result;
  });assert.equal(geometry.belowClearance,0);assert.equal(geometry.headCount,1);assert(geometry.lensNormal[1]<0,'Head must tilt toward the ground');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,views,warm,stable,geometry,start,walked,haze,rebuilt,errors},null,2));console.log(JSON.stringify({passed:true,before,software,geometry,resources:stable.memory,programs:stable.programs,haze,rebuilt,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
