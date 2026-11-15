const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/visual-upgrade/environment'+(software?'-software':''),errors=[],views=[];fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>{errors.push(e.message);console.error(e.stack||e.message);});p.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error(m.text());}});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
  const positions=[['entrance',0,7,0,.1],['pillar',-.2,12.4,-.55,.25],['entrance-root',3,9,1,.18],['crossing-root',-1,26,-.8,.15],['junction-root',-7,34.3,-1.3,.2],['bunker-root',-30,62.5,-1.15,.35],['bunker',-20,70,Math.PI,.25],['bunker-well',-30,59,0,.8],['pump-root',-25,34,-1.15,.25],['keeper-root',9.5,13.5,3.4,.2],['range',12,33,Math.PI,.25],['range-well',21,25.8,Math.PI,.75],['vent',3.4,5.8,Math.PI/2,.3],['gallery-repair',-1.6,49.5,-Math.PI/2,0],['pump-repair',-25.5,46.15,-Math.PI/2,.15],['range-repair',21.5,24,Math.PI/2,.2],['keeper-repair',15.5,13.2,Math.PI,-.35]];
  async function fixture(pos){await p.evaluate(async([name,x,y,yaw,pitch])=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=90;r.joe.phase='absent';r.bypass=true;r.bypassAt=20;Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},pos);}
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  async function capture(name,width,height){const state=await read();assert.equal(state.graphics.atmosphere.authoredRoots.compositions.length,6);assert.equal(state.graphics.districtDetails.enclosure.wells.length,3);assert.equal(state.graphics.districtDetails.wallRepairs.count,5);views.push({name,width,height,state});await p.screenshot({path:`${out}/${name}-${width}.png`});}
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   for(const pos of width===2560?positions:positions.filter(p=>['entrance','bunker','range'].includes(p[0]))){await fixture(pos);await capture(pos[0],width,height);}
  }
  const overhead=await p.evaluate(async()=>{
   const {floorLayout}=await import('./under-green-course.js'),{GATE_ROOF_SLOT}=await import('./under-green-layout.js'),{DISTRICT_WELLS}=await import('./under-green-district-enclosure.js'),{roofPanels}=await import('./under-green-overhead.js');
   // Start above the older signal/pipe supports so this audit proves actual
   // enclosure coverage rather than accepting a pipe as the roof.
   const points=floorLayout().tiles.filter(t=>!t.covered&&!DISTRICT_WELLS.concat(GATE_ROOF_SLOT).some(s=>Math.abs(t.x-s.x)<s.w/2+.05&&Math.abs(t.y-s.y)<s.d/2+.05)).map(t=>({x:t.x,y:t.y,height:4.35}));
   const open=floorLayout().tiles.filter(t=>!t.covered),holes=[GATE_ROOF_SLOT,...DISTRICT_WELLS],panels=roofPanels(open.map(t=>({...t,covered:true})),holes);
   const originalArea=open.reduce((n,t)=>n+t.w*t.d,0),panelArea=panels.reduce((n,t)=>n+t.w*t.d,0);
   const cutArea=open.reduce((sum,t)=>sum+holes.reduce((n,s)=>n+Math.max(0,Math.min(t.x+t.w/2,s.x+s.w/2)-Math.max(t.x-t.w/2,s.x-s.w/2))*Math.max(0,Math.min(t.y+t.d/2,s.y+s.d/2)-Math.max(t.y-t.d/2,s.y-s.d/2)),0),0);
   return {coverage:{originalArea,panelArea,cutArea,error:Math.abs(originalArea-panelArea-cutArea)},roof:__underGreen.inspectOverhead(points),wells:__underGreen.inspectOverhead(DISTRICT_WELLS.map(s=>({id:s.id,x:s.x,y:s.y}))),gate:__underGreen.inspectOverhead([{...GATE_ROOF_SLOT,height:3.3}])};
  });
  fs.writeFileSync(out+'/overhead.json',JSON.stringify(overhead,null,2));
  assert(overhead.coverage.error<1e-7,'Roof panels must cover the exact floor union minus only the authored openings');
  assert(overhead.roof.length>100);for(const r of overhead.roof){assert(r.hit,JSON.stringify(r));assert(r.hit.opaque);assert(r.hit.height>=4.09,JSON.stringify(r));}
  for(const r of overhead.wells)assert.equal(r.hit,null,'A framed inspection well must have a real open center: '+JSON.stringify(r));
  assert(overhead.gate[0].hit.height>6,'Gate travel pocket must stay open below its cap');
  if(!software)for(let i=0;i<=20;i++){
   const gate=await p.evaluate(f=>{__underGreen.run.gate=f;advanceTime(0);return __underGreen.inspectGateTravel();},i/20);assert.deepEqual(gate.boxHits,[]);assert.deepEqual(gate.hits,[]);
  }
  if(!software){
   const cameras=await p.evaluate(async()=>{
    const {solid}=await import('./under-green-course.js'),{ROOT_COMPOSITIONS}=await import('./under-green-root-compositions.js');
    const repairs=JSON.parse(render_game_to_text()).graphics.districtDetails.wallRepairs.repairs,poses=[];
    for(const wall of [...ROOT_COMPOSITIONS,...repairs])for(const offset of [-.6,0,.6]){
     const x=wall.axis==='x'?wall.boundary+wall.side*.32:wall.along+offset,y=wall.axis==='x'?wall.along+offset:wall.boundary+wall.side*.32;
     if(solid({x,y},.3))continue;
     for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const fov of [45,85])for(const aspect of [390/844,844/390])for(let yaw=0;yaw<Math.PI*2;yaw+=Math.PI/2)poses.push({x,y,height,pitch,fov,aspect,yaw});
    }
    return {count:poses.length,hits:__underGreen.inspectCameraClearance(poses).filter(row=>row.hits.length)};
   });
   fs.writeFileSync(out+'/camera.json',JSON.stringify(cameras,null,2));assert.deepEqual(cameras.hits,[]);
  }
  await p.setViewportSize({width:1280,height:720});await fixture(positions[0]);
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(500));await p.keyboard.up('w');const moved=await read();assert(moved.player.y>8);
  await p.keyboard.down('c');await p.evaluate(()=>advanceTime(250));assert((await read()).player.eyeHeight<1.3);await capture('crouch',1280,720);await p.keyboard.up('c');
  await p.keyboard.down('q');await p.evaluate(()=>advanceTime(250));assert((await read()).player.rearAmount>.8);await capture('rear',1280,720);await p.keyboard.up('q');
  await p.keyboard.press('Escape');const before=await read();await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).elapsed,before.elapsed);assert.deepEqual((await read()).graphics.atmosphere.lightLevels,before.graphics.atmosphere.lightLevels);
  await p.locator('#comfort').evaluate(e=>{e.open=true;});
  for(const [key,fov]of [['Home',45],['End',85]]){
   await p.locator('#field-of-view').focus();await p.keyboard.press(key);await p.click('#primary');await fixture(positions[0]);
   assert.equal((await read()).graphics.camera.fov,fov);await capture('fov-'+fov,1280,720);await p.keyboard.press('Escape');
  }
  await p.locator('#reduced').setChecked(true);await p.click('#primary');await fixture(positions[0]);const steady=await read();await p.evaluate(()=>advanceTime(700));
  assert(steady.comfort.reduced);assert.deepEqual((await read()).graphics.atmosphere.lightLevels,steady.graphics.atmosphere.lightLevels);assert(steady.graphics.atmosphere.lightLevels.every(x=>x===.72));
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,views,overhead,errors},null,2));console.log(JSON.stringify({passed:true,views:views.length,roofSamples:overhead.roof.length,resolution:views[0].state.graphics.resolution,draws:views.slice(0,12).map(v=>[v.name,v.state.graphics.draws,v.state.graphics.triangles]),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
