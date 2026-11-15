const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const software=process.argv.includes('--software'),out='output/under-green/visual-upgrade/keeper'+(software?'-software':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
  const fixtures=[
   {name:'desk-approach',x:11.65,y:15.8,yaw:Math.PI,pitch:0},
   {name:'desk-close',x:11.55,y:12.35,yaw:Math.PI,pitch:-.3},
   {name:'desk-oblique',x:14.15,y:13,yaw:4.2,pitch:-.1},
   {name:'boot-rack',x:8.8,y:14.1,yaw:-Math.PI/2,pitch:-.42},
   {name:'tool-rack',x:13.8,y:14.1,yaw:Math.PI/2,pitch:0},
   {name:'desk-flood',x:11.65,y:14.3,yaw:Math.PI,pitch:-.25,elapsed:49},
   {name:'release-route',x:14.65,y:15.9,yaw:Math.PI,pitch:-.48},
   {name:'keeper-distant',x:12,y:23,yaw:Math.PI,pitch:0},
  ];
  async function fixture(f){await p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js'),r=createRun();if(solid(f,.3))throw Error('Invalid camera fixture: '+f.name);r.mode='playing';r.time=90;r.elapsed=f.elapsed||0;r.bypass=true;r.bypassAt=20;r.lessonCrossed=true;r.joe.phase='absent';Object.assign(r.player,{x:f.x,y:f.y,yaw:f.yaw,pitch:f.pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   for(const f of width===2560?fixtures:fixtures.filter(f=>f.name==='desk-approach')){
    await fixture(f);const state=await read(),k=state.graphics.districtDetails.keeperWorkspace;assert.equal(k.addedColliders,0);assert.equal(k.bootRack.emptySlots,6);assert.equal(k.toolRack.missing,'grass-scythe');
    if(f.name==='release-route')assert.equal(state.action.id,'gate');
    views.push({name:f.name,width,height,resolution:state.graphics.resolution,draws:state.graphics.draws,triangles:state.graphics.triangles,workspace:k,lights:state.graphics.lights});await p.screenshot({path:`${out}/${f.name}-${width}.png`});
   }
  }
  await fixture(fixtures[1]);const sight=await p.evaluate(()=>{const k=JSON.parse(render_game_to_text()).graphics.districtDetails.keeperWorkspace;return __underGreen.inspectView([{id:'plan',...k.plan},{id:'behind-desk',x:11.57,y:9,height:2.14}]);});assert(sight[0].clear,'Recessed plan must not be hidden by the old wall');assert(!sight[1].clear,'Recess must remain backed by solid opaque geometry');
  let cameras=null,gate=null;
  if(!software){
   cameras=await p.evaluate(async()=>{const {KEEPER_NICHES,nichePoint}=await import('./under-green-keeper-layout.js'),{solid}=await import('./under-green-course.js'),poses=[];
    const walls=[...KEEPER_NICHES,{axis:'x',boundary:17,side:-1,along:13.8,width:4.0}];
    for(const n of walls)for(let u=-n.width/2;u<=n.width/2;u+=.35){
     const point=nichePoint(n,u,0,.32);if(solid(point,.3))continue;
     for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const fov of [45,85])for(const aspect of [390/844,844/390])for(let yaw=0;yaw<Math.PI*2;yaw+=Math.PI/2)poses.push({...point,height,pitch,fov,aspect,yaw});
    }
    return {count:poses.length,hits:__underGreen.inspectCameraClearance(poses).filter(v=>v.hits.length)};
   });fs.writeFileSync(out+'/camera.json',JSON.stringify(cameras,null,2));assert.deepEqual(cameras.hits,[]);
   gate=await p.evaluate(()=>{const rows=[];for(let i=0;i<=20;i++){__underGreen.run.gate=i/20;advanceTime(0);rows.push(__underGreen.inspectGateTravel());}return {samples:rows.length,hits:rows.filter(r=>r.hits.length||r.boxHits.length)};});assert.deepEqual(gate.hits,[]);
  }
  await fixture(fixtures[6]);await p.keyboard.press('e');await p.evaluate(async()=>{advanceTime(350);await __underGreen.whenPresented();});const closing=await read();assert(closing.gate>0&&closing.gate<1);
  await p.evaluate(async()=>{advanceTime(1100);await __underGreen.whenPresented();});assert((await read()).graphics.release.secured);
  await fixture(fixtures[0]);await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').setChecked(true);await p.click('#primary');await fixture(fixtures[0]);const reduced=(await read()).graphics.atmosphere.lightLevels;await p.evaluate(()=>advanceTime(100));assert.deepEqual((await read()).graphics.atmosphere.lightLevels,reduced);assert(reduced.every(v=>v===.72));
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,views,sight,cameras,gate,release:true,reduced:true,errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,resolution:views[0].resolution,cameraSamples:cameras?.count,gateSamples:gate?.samples,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
