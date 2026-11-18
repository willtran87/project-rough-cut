const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const software=process.argv.includes('--software'),out='output/level-one-packed-lanterns/integrated-'+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__packedGame={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__packedScene=()=>({world,renderer,practicalLighting,glowAnchors});'}));
 const draw=()=>p.evaluate(async()=>{__packedGame.render();await RCScene3D.whenPresented();});
 const ready=()=>p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});
 const read=()=>p.evaluate(()=>{const r=__packedScene(),s=RCScene3D.stats(),lights=[];r.world.traverse(o=>{if(o.isLight)lights.push({type:o.type,power:o.intensity});});return {practicals:s.practicals,resolution:s.resolution,quality:s.quality,lanterns:s.pathLanterns,lights,memory:{...r.renderer.info.memory},programs:r.renderer.info.programs.length,versions:r.practicalLighting.textures.map(t=>t.version)};});
 const shot=async(name,x,y,yaw,pitch)=>{await p.evaluate(v=>Object.assign(__packedGame.state.player,v),{x,y,yaw,pitch});await draw();await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:93});views.push({name,...await read()});};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__packedGame);await p.locator('#game').click();
  await p.evaluate(()=>{const s=__packedGame.state;__packedGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,clearNavigation:false,guidedHints:false,apparitions:false,reducedMotion:true,effectsDensity:0});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});
  await draw();await ready();await draw();const start=await read();
  assert.equal(start.practicals.mode,software?'packed-world-field':'fixed-world-field');assert.equal(start.practicals.count,40);assert.equal(start.lanterns.pairs.length*2,28);assert.equal(start.lights.find(l=>l.type==='AmbientLight').power,.005);
  for(const v of [['opening',0,40,0,0],['audit',70,148,1.57,.25],['woodland',95,120,1.57,.2],['pond',-63,187,0,-.1],['service',-80,210,-1.3,0],['green',0,463,0,0],['range',0,550,0,0],['exit',-18,680,0,.1]])await shot(...v);
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('opening-'+width,0,40,0,0);}
  await p.setViewportSize({width:2560,height:1600});await shot('opening-return',0,40,0,0);
  // Source flicker changes the packed payload, while repeated renders of a
  // frozen frame leave both the texture version and warm resources stable.
  const warm=await read();for(let i=0;i<8;i++)await draw();const stable=await read();assert.deepEqual(stable.versions,warm.versions);assert.deepEqual(stable.memory,warm.memory);assert.equal(stable.programs,warm.programs);
  await p.evaluate(()=>__packedGame.state.reducedMotion=false);await p.evaluate(()=>advanceTime(250));await draw();const moving=await read();assert.notDeepEqual(moving.practicals.sources.map(s=>s.power),stable.practicals.sources.map(s=>s.power));if(software)assert(moving.versions[0]>stable.versions[0]);
  await p.keyboard.press('Escape');await draw();const paused=await read();const elapsed=await p.evaluate(()=>__packedGame.state.hole.elapsed);await p.evaluate(()=>advanceTime(1000));await draw();assert.equal(await p.evaluate(()=>__packedGame.state.hole.elapsed),elapsed);assert.deepEqual((await read()).versions,paused.versions);await p.keyboard.press('Escape');await draw();
  await p.evaluate(()=>{const f=__packedScene().practicalLighting;window.__oldPackedField=f;window.__packedDisposed=0;f.textures.forEach(t=>t.addEventListener('dispose',()=>__packedDisposed++));RCScene3D.reset();});await draw();await ready();await draw();assert.equal(await p.evaluate(()=>__packedDisposed),1);assert(await p.evaluate(()=>__packedScene().practicalLighting!==__oldPackedField));assert.equal((await read()).practicals.mode,start.practicals.mode);
  assert.deepEqual((await read()).lanterns,start.lanterns);assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,start,views,stable,moving,end:await read(),checks:['Production renderer selects correct field','40 source anchors and 28 path lanterns','Dark ambient retained','Frozen frame skips uploads','Flicker updates payload','Pause freezes simulation and upload','Warm texture/program counts stable','Scene rebuild disposes texture exactly once'],errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,field:start.practicals.mode,bytes:start.practicals.bytes,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
