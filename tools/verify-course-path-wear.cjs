const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const before=process.argv.includes('--before'),software=process.argv.includes('--software'),fallback=process.argv.includes('--fallback'),variant=process.argv.find(a=>a.startsWith('--variant='))?.split('=')[1]||'standard_review';
 const out='output/level-one-path-wear/'+(before?'before':'after')+(software?'-software':'')+(fallback?'-fallback':'')+'-'+variant;fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__terrain={state,resetFirstHole,render,variants:RUN_VARIANTS};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync((before?'output/level-one-path-wear/baseline-source':'web')+'/scene-3d.js','utf8')+'\nwindow.__terrainScene=()=>({world,renderer,camera,currentData,lights});'}));
 if(before)for(const file of ['terrain-finish.js','baked-terrain.js'])await page.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-path-wear/baseline-source/'+file,'utf8')}));
 if(fallback)await page.route('**/assets/baked/terrain.json',r=>r.fulfill({contentType:'application/json',body:'{}'}));
 const draw=()=>page.evaluate(async()=>{__terrain.render();await RCScene3D.whenPresented();});
 const info=()=>page.evaluate(()=>{const s=RCScene3D.stats(),r=__terrainScene().renderer;return {baked:s.terrainBaked,resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles,memory:r.info.memory,programs:r.info.programs.length,lanterns:s.pathLanterns.pairs.length*2};});
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__terrain);await page.locator('#game').click();
  await page.evaluate(id=>{const t=__terrain,s=t.state;t.resetFirstHole(t.variants.find(v=>v.id===id));Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol',patrolPause:9999});RCSpatialControls.set('resolution',1);},variant);await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
  const positions=await page.evaluate(()=>{
   const {currentData:d,lights}=__terrainScene(),result=[];
   for(const l of lights.slice(0,2)){
    let best=null;
    for(const path of d.paths)for(let i=1;i<path.length;i++)for(let j=1;j<=9;j++){
     const a=path[i-1],b=path[i],x=a.x+(b.x-a.x)*j/10,y=a.y+(b.y-a.y)*j/10,dx=(b.x-a.x)*.1152,dz=-(b.y-a.y)*.16,len=Math.hypot(dx,dz);if(!len)continue;
     const distance=Math.hypot((x-l.o.x)*.1152,(y-l.o.y)*.16);if(!best||distance<best.distance)best={x:x-dx/len*2/.1152,y:y+dz/len*2/.16,yaw:Math.atan2(dx,-dz),pitch:-.55,distance};
    }result.push(best);
   }return result;
  });
  const fixtures=[['first-lit-path',positions[0]],['second-lit-path',positions[1]],['crossing',{x:0,y:200,yaw:0,pitch:-.5}],['opening',{x:0,y:1,yaw:0,pitch:-.24}]];
  for(const [name,pose]of fixtures){await page.evaluate(p=>Object.assign(__terrain.state.player,p),pose);await draw();await page.screenshot({path:out+'/'+name+'-2560.png'});views.push({name,...await info()});}
  const atlas=await page.evaluate(async()=>{
   const {world,currentData}=__terrainScene();let image;world.traverse(o=>{if(o.geometry?.parameters?.width===48&&o.geometry?.parameters?.height===130)image=o.material.map.image;});
   const c=document.createElement('canvas');c.width=1536;c.height=4096;const g=c.getContext('2d',{willReadFrequently:true});if(image instanceof ImageBitmap){g.translate(0,4096);g.scale(1,-1);}g.drawImage(image,0,0);
   const bytes=g.getImageData(0,0,1536,4096).data,hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
   const {pathWearPatches}=await import('./course-path-wear.js');const marks=[...pathWearPatches(currentData,.1152,.16)],counts={};for(const m of marks)counts[m.kind]=(counts[m.kind]||0)+1;
   // Save a fixed middle-course top-down inspection crop.
   const out=document.createElement('canvas');out.width=out.height=512;const p=__terrain.state.player,ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(c,520,2650,512,512,0,0,512,512);
   return {hash,width:c.width,height:c.height,marks:marks.length,counts,crop:out.toDataURL('image/png')};
  });fs.writeFileSync(out+'/atlas-detail.png',Buffer.from(atlas.crop.split(',')[1],'base64'));delete atlas.crop;
  for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await page.evaluate(p=>Object.assign(__terrain.state.player,p),positions[0]);await draw();await page.screenshot({path:out+'/path-'+width+'.png'});}
  await page.setViewportSize({width:1280,height:720});await page.evaluate(p=>Object.assign(__terrain.state.player,p),positions[0]);await draw();const warm=await info();for(let i=0;i<20;i++){await page.evaluate(()=>__terrain.state.player.yaw+=.01);await draw();}const stable=await info();assert.deepEqual(stable.memory,warm.memory);assert.equal(stable.programs,warm.programs);
  const position=()=>page.evaluate(()=>({x:__terrain.state.player.x,y:__terrain.state.player.y,mode:__terrain.state.mode}));const start=await position();await page.keyboard.down('ArrowUp');await page.evaluate(()=>advanceTime(400));await page.keyboard.up('ArrowUp');const walked=await position();assert(Math.hypot(walked.x-start.x,walked.y-start.y)>1);await page.keyboard.press('Escape');await draw();assert.equal((await position()).mode,'paused');await page.keyboard.press('Escape');await draw();assert.equal((await position()).mode,'first_hole');await page.screenshot({path:out+'/keyboard-path.png'});
  assert.equal(views[0].lanterns,28);if(!before)assert.equal(views[0].baked,!fallback);assert.deepEqual(errors,[]);
  const report={passed:true,before,software,fallback,variant,positions,views,atlas,start,walked,warm,stable,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,before,software,fallback,variant,atlas,baked:views[0].baked,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
