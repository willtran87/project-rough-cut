const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out='output/dead-green-refuge'+(software?'/software':'');fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],results=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__refuge={state,resetFirstHole,render,DEAD_GREEN_BENCHES,COURSE_OBSTACLES,stageEnvironmentalOmen};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__refugeScene=()=>({world});window.__refugeGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries});'}));
 const render=async()=>{await p.evaluate(()=>__refuge.render());await p.evaluate(async()=>RCScene3D.whenPresented());};
 const shot=async name=>{await render();await p.screenshot({path:out+'/'+name+'.png'});};
 const pose=async(x,y,yaw=0,pitch=-.16)=>{await p.evaluate(({x,y,yaw,pitch})=>Object.assign(__refuge.state.player,{x,y,yaw,pitch}),{x,y,yaw,pitch});await render();};
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__refuge);await p.evaluate(()=>{const t=__refuge,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,apparitions:false,guidedHints:false});s.keys.clear();const h=s.hole;Object.assign(h,{tutorialVisible:false,elapsed:100,messageTimer:0,zoneBannerTimer:0,hasLineOfSight:false,detection:0});h.practiceDrill.active=false;h.statusRequest.issued=true;h.statusRequest.resolved=true;Object.assign(h.joe,{x:100,y:30,mode:'patrol',patrolPause:9999});Object.assign(s.player,{x:0,y:486,yaw:0,pitch:-.16});});await render();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
  await render();const gpu=await p.evaluate(()=>__refugeGpu()),refuge=await p.evaluate(()=>RCScene3D.stats().deadGreenRefuge);assert.equal(refuge.meshes,3);assert.equal(refuge.benches.length,2);assert(await p.evaluate(()=>RCScene3D.stats().terrainBaked));
  const audit=()=>p.evaluate(()=>JSON.parse(audit_rough_cut_readiness()).checks.find(c=>c.id==='hidden_collision_owned_by_parent_art'));
  const initialAudit=await audit();assert(initialAudit.passed,JSON.stringify(initialAudit));
  assert(initialAudit.evidence.benchArt.every(a=>a.passed&&a.maxError<.035));
  const mutations=[];
  for(const kind of ['shifted','scaled','hidden','parent-hidden','detached','mesh-detached','material-hidden','empty-draw']){
   await p.evaluate(kind=>{const m=__refugeScene().world.getObjectByName('DeadGreenWaitingBenches');window.__benchProbe={m,root:m.parent,parent:m.parent.parent};if(kind==='shifted')m.position.x=1;if(kind==='scaled')m.scale.x=.8;if(kind==='hidden')m.visible=false;if(kind==='parent-hidden')m.parent.visible=false;if(kind==='detached')m.parent.removeFromParent();if(kind==='mesh-detached')m.removeFromParent();if(kind==='material-hidden')m.material.visible=false;if(kind==='empty-draw')m.geometry.setDrawRange(0,0);},kind);
   await render();const bad=await audit();assert(!bad.passed,kind+' art must fail ownership');assert(bad.evidence.benchArt.every(a=>!a.passed),kind+' must reject both benches');mutations.push({kind,benchArt:bad.evidence.benchArt});
   await p.evaluate(()=>{const {m,root,parent}=__benchProbe;m.position.x=0;m.scale.x=1;m.visible=root.visible=m.material.visible=true;m.geometry.setDrawRange(0,Infinity);if(!m.parent)root.add(m);if(!root.parent)parent.add(root);});await render();assert((await audit()).passed,'restored '+kind);
  }
  fs.writeFileSync(out+'/collision-art.json',JSON.stringify({initialAudit,mutations},null,2));
  await shot('clearing-2560');
  await pose(0,485,-.55,-.12);await shot('west-bench');
  await pose(17,493,.38,-.62);await shot('cup');
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await pose(0,486,0,-.16);await shot('clearing-'+width);}
  await p.setViewportSize({width:2560,height:1600});
  for(const index of [0,1]){
   const b=await p.evaluate(i=>__refuge.DEAD_GREEN_BENCHES[i],index);await pose(b.x,b.y-14,0,-.15);await p.keyboard.down('w');await tick(1300);await p.keyboard.up('w');const stopped=await p.evaluate(()=>({...__refuge.state.player}));assert(stopped.y<b.y-b.radiusY);assert(stopped.y>b.y-10);
   await p.keyboard.down(index?'a':'d');await tick(700);await p.keyboard.up(index?'a':'d');await p.keyboard.down('w');await tick(1500);await p.keyboard.up('w');const passed=await p.evaluate(()=>({...__refuge.state.player}));assert(passed.y>b.y+6);results.push({id:b.id,stopped,passed});
  }
  await pose(0,486);await p.keyboard.down('w');await tick(3000);await p.keyboard.up('w');assert(await p.evaluate(()=>__refuge.state.player.y>535));
  await pose(0,486);const before=await p.evaluate(()=>__refugeGpu());
  const paused=await p.evaluate(()=>({player:{...__refuge.state.player},time:__refuge.state.hole.elapsed}));
  await p.keyboard.press('Escape');await tick(1500);assert.deepEqual(await p.evaluate(()=>({player:{...__refuge.state.player},time:__refuge.state.hole.elapsed})),paused);await p.keyboard.press('Escape');
  await p.evaluate(()=>{__refuge.state.reducedMotion=true;__refuge.state.effectsDensity=0;});await shot('reduced');
  assert.equal(before.programs,gpu.programs);assert.equal(before.textures,gpu.textures);
  assert.deepEqual(await p.evaluate(()=>RCScene3D.stats().deadGreenRefuge.resources),refuge.resources);
  for(const [y,expected] of [[510,'fog_wake'],[420,'birds_scatter']]){
   const result=await p.evaluate(({y})=>{const t=__refuge,s=t.state;s.player.y=y;const before=JSON.stringify(s.hole.joe);t.stageEnvironmentalOmen('birds_scatter',3);return {type:s.hole.tensionDirector.omen.type,duration:s.hole.tensionDirector.omen.duration,unchanged:before===JSON.stringify(s.hole.joe)};},{y});assert.equal(result.type,expected);assert.equal(result.duration,3);assert(result.unchanged);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,gpu,warmedGpu:before,refuge,results,errors},null,2));console.log(JSON.stringify({passed:true,gpu,warmedGpu:before,results,errors}));
 }catch(e){await shot('failure');fs.writeFileSync(out+'/failure.json',JSON.stringify({error:e.stack,player:await p.evaluate(()=>__refuge.state.player)},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
