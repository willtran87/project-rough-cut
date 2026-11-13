const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/clubhouse-windows/current';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__club={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__clubScene=()=>({world,renderer,camera,pixelWorld});'}));
 const draw=()=>p.evaluate(async()=>{__club.render();await RCScene3D.whenPresented();});
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
 const read=()=>p.evaluate(()=>({windows:RCScene3D.stats().pixelWorld?.clubhouseWindows,memory:{...__clubScene().renderer.info.memory},programs:__clubScene().renderer.info.programs.length}));
 const shot=async name=>{await draw();await p.screenshot({path:out+'/'+name+'.png'});};
 const place=()=>p.evaluate(()=>Object.assign(__club.state.player,{x:70,y:325,yaw:Math.PI/2,pitch:.15}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__club);await p.locator('#game').click();
  await p.evaluate(()=>{const t=__club,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,apparitions:false,guidedHints:false});s.keys.clear();Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0,controlHintTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:-100,y:700,mode:'patrol',patrolPause:9999});});
  await tick(17);await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});
  for(const [name,x,y,yaw,pitch] of [['approach',40,280,1.133,.10],['crossing',70,325,Math.PI/2,.15],['depart',50,360,1.99,.08]]){
   await p.evaluate(({x,y,yaw,pitch})=>Object.assign(__club.state.player,{x,y,yaw,pitch}),{x,y,yaw,pitch});await shot(name+'-2560');samples.push({name,stats:await read()});
  }
  assert(samples.every(s=>s.stats.windows.windows===51&&s.stats.windows.draws===1&&s.stats.windows.triangles===102));
  await place();await shot('rooms-on');await p.evaluate(()=>__clubScene().world.getObjectByName('ClubhouseEmptyRooms').material.uniforms.roomEnabled.value=0);await shot('rooms-off');await p.evaluate(()=>__clubScene().world.getObjectByName('ClubhouseEmptyRooms').material.uniforms.roomEnabled.value=1);
  checks.push('Three route viewpoints and same-camera room/flat-pane comparison; 51 apertures in one batch');
  const before=await p.evaluate(()=>({x:__club.state.player.x,y:__club.state.player.y}));await p.keyboard.down('d');await tick(700);await p.keyboard.up('d');await shot('walked-crossing');const after=await p.evaluate(()=>({x:__club.state.player.x,y:__club.state.player.y}));assert(Math.hypot(after.x-before.x,after.y-before.y)>1,'Actual movement must traverse the crossing');
  const roomPose=()=>p.evaluate(()=>{const m=__clubScene().world.getObjectByName('ClubhouseEmptyRooms');return {matrix:m.matrixWorld.toArray(),positions:Array.from(m.geometry.attributes.position.array),uniform:m.material.uniforms.roomEnabled.value};});
  const pose=await roomPose();await p.keyboard.press('Escape');await tick(1000);await draw();assert.equal(await p.evaluate(()=>__club.state.mode),'paused');assert.deepEqual(await roomPose(),pose);await p.keyboard.press('Escape');
  await p.evaluate(()=>{__club.state.reducedMotion=true;});await tick(17);await draw();assert.deepEqual(await roomPose(),pose);checks.push('Actual keyboard traversal; aperture anchors remain fixed across pause and reduced motion');
  for(const [width,height] of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await place();await shot('crossing-'+width);assert.equal((await read()).windows.windows,51);}
  checks.push('Crossing rendered at 2560x1600, 1280x720, 844x390 and 390x844');
  const warm=await read();for(let i=0;i<20;i++){await tick(17);await draw();}const stable=await read();assert.deepEqual(stable.memory,warm.memory);assert.equal(stable.programs,warm.programs);
  await p.evaluate(()=>{window.__oldRooms=__clubScene().world.getObjectByName('ClubhouseEmptyRooms');window.__roomDisposal={geometry:0,material:0};__oldRooms.geometry.addEventListener('dispose',()=>__roomDisposal.geometry++);__oldRooms.material.addEventListener('dispose',()=>__roomDisposal.material++);RCScene3D.reset();});
  await draw();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});await draw();
  const rebuilt=await p.evaluate(()=>{let count=0;__clubScene().world.traverse(o=>{if(o.name==='ClubhouseEmptyRooms')count++;});return {count,oldDetached:!__oldRooms.parent,disposal:__roomDisposal};});assert.deepEqual(rebuilt,{count:1,oldDetached:true,disposal:{geometry:1,material:1}});assert.equal((await read()).windows.windows,51);checks.push('Stable warmed resources; actual scene rebuild disposes old room geometry/material exactly once and retains one replacement batch');
  const lifecycle=await p.evaluate(async()=>{const THREE=await import('./vendor/three/three.module.js'),{createClubhouseWindows}=await import('./clubhouse-windows.js');const root=new THREE.Group(),frame=new THREE.Group();root.add(frame);const a=createClubhouseWindows(root);a.add(frame,1,1);a.finish();a.finish();const count=root.children.filter(o=>o.name==='ClubhouseEmptyRooms').length;a.dispose();a.dispose();a.finish();a.add(frame,1,1);return {count,stats:a.stats(),remaining:root.children.filter(o=>o.name==='ClubhouseEmptyRooms').length};});assert.equal(lifecycle.count,1);assert.equal(lifecycle.remaining,0);assert(lifecycle.stats.disposed&&lifecycle.stats.windows===0);checks.push('Repeated finish/dispose and late callbacks do not recreate disposed resources');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,samples,before,after,warm,stable,rebuilt,lifecycle,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
