const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
(async()=>{
 const before=process.argv.includes('--before'),software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||`output/level-one-audit-bell/${before?'before':'after'}-${software?'software':'native'}`;fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__bellGame={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__bellScene=()=>({world,renderer,camera,stations,practicalLighting,groundLighting,glowAnchors});'}));
 if(before)await p.route('**/pixel-world-props.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/level-one-audit-bell/baseline-source/pixel-world-props.js','utf8')}));
 const draw=()=>p.evaluate(async()=>{__bellGame.render();await RCScene3D.whenPresented();});
 const ready=()=>p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});
 const read=()=>p.evaluate(()=>{const r=__bellScene(),e=r.stations.get('audit-bell'),s=RCScene3D.stats();return {position:e.root.position.toArray(),yaw:e.root.rotation.y,rotation:e.moving.rotation.z,pivot:e.moving.position.toArray(),scale:e.moving.scale.toArray(),memory:{...r.renderer.info.memory},programs:r.renderer.info.programs.length,draws:s.drawCalls,triangles:s.triangles,resolution:s.resolution,lamps:s.pathLanterns,source:s.practicals.sources};});
 const pose=async(x,y,pitch=0)=>{await p.evaluate(v=>Object.assign(__bellGame.state.player,v),{x,y,yaw:Math.atan2((86-x)*.72,148-y),pitch});await draw();};
 const shot=async name=>{await p.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:94});views.push({name,...await read()});};
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__bellGame);await p.locator('#game').click();await p.evaluate(()=>{const s=__bellGame.state;__bellGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,clearNavigation:false,guidedHints:false,apparitions:false,reducedMotion:true});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});await draw();await ready();await draw();
  for(const [name,x,y,pitch]of [['approach',45,120,.08],['front',80,125,.14],['side',70,148,.25],['near',77,148,.25],['rear',100,170,.12]]){await pose(x,y,pitch);await shot(name);}
  for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await pose(70,148,.25);await shot('side-'+width);}
  await p.setViewportSize({width:2560,height:1600});await pose(77,148,.25);
  let surface=null;
  if(!before){surface=await p.evaluate(()=>{const o=__bellScene().world.getObjectByName('AuditBellBody');return {size:[o.material.map.image.width,o.material.map.image.height],emissive:o.material.emissive.getHex(),keepDynamic:o.userData.keepDynamic,texture:o.material.map.image.toDataURL()};});fs.writeFileSync(out+'/bronze-atlas.png',Buffer.from(surface.texture.split(',')[1],'base64'));delete surface.texture;assert.equal(surface.emissive,0);assert.equal(surface.keepDynamic,true);}
  // Real Use drives the existing response and completion chain.
  await p.evaluate(()=>{__bellGame.state.reducedMotion=false;});await p.evaluate(()=>advanceTime(17));await p.keyboard.press('e');await draw();assert(await p.evaluate(()=>__bellGame.state.hole.nightOrderActionsCompleted.includes('audit-bell')));
  const poses=[];for(let i=0;i<24;i++){await p.evaluate(()=>advanceTime(1000/60));await draw();poses.push((await read()).rotation);if(i===4)await shot('ringing');}assert(poses.some(x=>Math.abs(x)>.05),'Actual Use must animate bell');
  await p.keyboard.press('Escape');await draw();const paused=await read();await p.evaluate(()=>advanceTime(400));await draw();assert.equal((await read()).rotation,paused.rotation);await p.keyboard.press('Escape');await draw();
  await p.evaluate(()=>__bellGame.state.reducedMotion=true);await draw();assert.equal((await read()).rotation,0);await shot('reduced');
  const warm=await read();for(let i=0;i<8;i++)await draw();const end=await read();assert.deepEqual(end.memory,warm.memory);assert.equal(end.programs,warm.programs);
  let disposal=null;if(!before){await p.evaluate(()=>{const o=__bellScene().world.getObjectByName('AuditBellBody');window.__bellDisposed={geometry:0,material:0,map:0};for(const [key,item]of [['geometry',o.geometry],['material',o.material],['map',o.material.map]])item.addEventListener('dispose',()=>__bellDisposed[key]++);RCScene3D.reset();});await draw();await ready();await draw();disposal=await p.evaluate(()=>__bellDisposed);assert.deepEqual(disposal,{geometry:1,material:1,map:1});}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,surface,views,poses,end,disposal,errors},null,2));console.log(JSON.stringify({passed:true,before,software,views:views.length,disposal,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
