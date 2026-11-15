const fs=require('node:fs'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/course-understory-culling';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__cost={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('understoryCulling?.update(camera);','if(window.__fullUnderstory)understoryCulling?.restore();else understoryCulling?.update(camera);').replace('softwareBudget.scale():1','1:1')+'\nwindow.__costScene=()=>({THREE,renderer,world,camera,parallax,sceneTarget,courseMowerBeacon,understoryCulling});'}));
try{await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__cost);await p.locator('#game').click();await p.evaluate(()=>{const t=__cost,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.player,{x:0,y:65,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:690,patrolPause:9999});t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});await p.evaluate(async()=>{__cost.render();await RCScene3D.whenPresented();});

const assert=require('node:assert/strict'),rows=[],checks=[];
const draw=()=>p.evaluate(async()=>{__cost.render();await RCScene3D.whenPresented();});
const pixels=full=>p.evaluate(full=>{const {renderer,sceneTarget}=__costScene(),a=new Uint8Array(sceneTarget.width*sceneTarget.height*4);renderer.readRenderTargetPixels(sceneTarget,0,0,sceneTarget.width,sceneTarget.height,a);if(full){window.__referencePixels=a;return null;}const b=__referencePixels;let changed=0,maxDelta=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)changed++;maxDelta=Math.max(maxDelta,d);}return {changed,maxDelta};},full);
await p.evaluate(()=>RCSpatialControls.set('resolution',.75));
for(const [name,x,y,yaw,pitch] of [['opening',0,65,0,0],['near-verge',12,26,-1,-.3],['pond',-63,187,0,-.33],['border',100,340,1.57,0],['refuge',0,486,0,-.16]]){
 await p.evaluate(v=>Object.assign(__cost.state.player,v),{x,y,yaw,pitch});
 let comparison;
 for(const full of [true,false]){await p.evaluate(full=>window.__fullUnderstory=full,full);await draw();comparison=await pixels(full);await p.screenshot({path:out+'/'+name+(full?'-full':'-culled')+'.png'});}
 const {changed,maxDelta}=comparison;assert.equal(changed,0,name+' output differs');
 rows.push({name,changed,maxDelta,stats:await p.evaluate(()=>RCScene3D.stats().understory)});
}
checks.push('Exact scene-target pixel equality across five views, including nearby vegetation and water');
const timings=[];
for(const moving of [false,true])for(const resolution of [.75,.5]){
 await p.evaluate(resolution=>{RCSpatialControls.set('resolution',resolution);Object.assign(__cost.state.player,{x:0,y:65,yaw:0,pitch:0});},resolution);
 for(const full of [true,false,false,true]){
  await p.evaluate(full=>window.__fullUnderstory=full,full);
  const block=await p.evaluate(async moving=>{const ms=[];for(let i=0;i<24;i++){if(moving){Object.assign(__cost.state.player,{x:0,y:65+i*.06,yaw:Math.sin(i*.03)*.14});__cost.state.hole.elapsed=100+i/60;}const t=performance.now();__cost.render();await RCScene3D.whenPresented();if(i>=4)ms.push(performance.now()-t);}ms.sort((a,b)=>a-b);return {median:ms[10],p95:ms[18],resolution:RCScene3D.stats().resolution,understory:RCScene3D.stats().understory,programs:__costScene().renderer.info.programs.length,memory:{...__costScene().renderer.info.memory}};},moving);timings.push({moving,full,...block});console.log(JSON.stringify({moving,full,...block}));
 }
}
await p.evaluate(()=>window.__fullUnderstory=false);
for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await draw();await p.screenshot({path:out+'/opening-'+width+'.png'});}
await p.keyboard.press('Escape');await draw();const paused=await p.evaluate(()=>({pose:__cost.state.player,understory:RCScene3D.stats().understory}));await p.evaluate(()=>advanceTime(1000));await draw();assert.deepEqual(await p.evaluate(()=>({pose:__cost.state.player,understory:RCScene3D.stats().understory})),paused);await p.keyboard.press('Escape');
const before=await p.evaluate(()=>__cost.state.player.y);await p.keyboard.down('w');await p.evaluate(()=>advanceTime(500));await p.keyboard.up('w');await draw();assert(await p.evaluate(y=>__cost.state.player.y>y,before));
checks.push('Actual W input advances through the opening; pause preserves pose and culling state; four viewport sizes');
const identities=()=>p.evaluate(()=>{const ids=[];__costScene().world.traverse(o=>{if(o.geometry)ids.push(o.geometry.uuid);});return ids.sort();});
const originalGeometry=await identities(),cold=await p.evaluate(()=>({...__costScene().renderer.info.memory}));
const rotate=async()=>{for(let i=0;i<20;i++){await p.evaluate(i=>__cost.state.player.yaw=i*.3,i);await draw();}};
await rotate();assert.deepEqual(await identities(),originalGeometry,'Turning must not create new scene geometry');
const warm=await p.evaluate(()=>({...__costScene().renderer.info.memory}));await rotate();assert.deepEqual(await p.evaluate(()=>({...__costScene().renderer.info.memory})),warm);
await p.evaluate(()=>{window.__oldUnderstory=__costScene().world.getObjectByName('CourseUnderstory-0');RCScene3D.reset();});await draw();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:180000});await draw();assert(await p.evaluate(()=>{let n=0;__costScene().world.traverse(o=>{if(o.name.startsWith('CourseUnderstory-'))n++;});return n===6&&__costScene().world.getObjectByName('CourseUnderstory-0')!==__oldUnderstory&&RCScene3D.stats().understory.total===1610;}));
checks.push('Camera turns retain GPU resource counts; actual scene rebuild restores six unique batches');
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,rows,timings,cold,warm,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
