const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const baseline=process.argv.includes('--baseline'),out='output/under-green/gate-housing';
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[],closure=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 const roof=await p.evaluate(async()=>{
  const {GATE,floorLayout}=await import('./under-green-course.js'),{roofPanels}=await import('./under-green-overhead.js');
  const panels=roofPanels(floorLayout().tiles),contacts=[];
  // Exact axis-aligned raised bars and crossbars from the existing gate mesh.
  // Test their occupied slab against roof panels, not just eye-height samples.
  for(let i=0;i<=40;i++){
   const fraction=i/40,lift=3.3*(1-fraction),parts=[];
   for(let x=-4.8;x<5;x+=.35)parts.push({x:GATE.x+x,y:GATE.y,w:.1,d:.12,low:lift,high:lift+3});
   for(const height of [.2,1.5,2.8])parts.push({x:GATE.x,y:GATE.y,w:10,d:.14,low:lift+height-.05,high:lift+height+.05});
   for(const part of parts)if(part.high>4.15&&part.low<4.35&&panels.some(t=>Math.abs(t.x-part.x)<(t.w+part.w)/2&&Math.abs(t.y-part.y)<(t.d+part.d)/2))contacts.push({fraction,part});
  }
  return {contacts,panels:panels.length};
 });
 for(const [width,height]of baseline?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]]){
  await p.setViewportSize({width,height});
  for(const [side,fraction]of [[-1,0],[-1,.5],[-1,1],[1,0],[1,.5]]){
   await p.evaluate(async({side,fraction})=>{const {createRun}=await import('./under-green-sim.js'),{GATE}=await import('./under-green-course.js');const r=createRun(3);r.mode='playing';r.messageTime=0;r.gate=fraction;r.joe.phase='absent';Object.assign(r.player,{x:12,y:GATE.y+side*2,yaw:side===-1?0:Math.PI,pitch:.45});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{side,fraction});
   const file=`${out}/${baseline?'before':'after'}-${side}-${fraction}-${width}.png`;await p.screenshot({path:file});views.push({width,height,side,fraction,file});
  }
 }
 let travel=[];
 if(!baseline){
  for(let i=0;i<=20;i++){
   const result=await p.evaluate(fraction=>{__underGreen.run.gate=fraction;advanceTime(0);return __underGreen.inspectGateTravel();},i/20);travel.push({fraction:i/20,...result});
  }
  fs.writeFileSync(out+'/travel.json',JSON.stringify(travel,null,2));
  for(const result of travel){
   assert.deepEqual(result.boxHits,[]);
   assert.equal(result.panelDraws,2);
   assert(Math.abs(result.lift-3.3*(1-result.fraction))<1e-8);
   for(const cable of result.cables){assert(Math.abs(cable.top-6.42)<1e-8);assert(Math.abs(cable.bottom-result.lift-2.8)<1e-8);}
  }
  await p.setViewportSize({width:2560,height:1600});
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),{GATE}=await import('./under-green-course.js');const r=createRun(3);r.mode='playing';r.joe.phase='absent';Object.assign(r.player,{x:12,y:GATE.y+6,yaw:Math.PI,pitch:.15});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();});
  await p.screenshot({path:out+'/approach-2560.png'});
  // Ordinary Use drives actual closure; rear glance is voluntary throughout.
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),{SLUICE}=await import('./under-green-course.js');const r=createRun(3);r.mode='playing';Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI,pitch:0});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
  assert(await p.locator('#use').isVisible());await p.keyboard.press('e');await p.keyboard.down('r');
  const read=()=>p.evaluate(()=>({mode:__underGreen.run.mode,gate:__underGreen.run.gate,closing:__underGreen.run.closing,finished:__underGreen.run.finished,time:__underGreen.run.time,player:{...__underGreen.run.player},geometry:__underGreen.inspectGateTravel()}));
  for(let i=0;i<4;i++){
   await p.evaluate(()=>advanceTime(350));const state=await read();closure.push(state);assert.deepEqual(state.geometry.hits,[]);assert.deepEqual(state.geometry.boxHits,[]);assert(Math.abs(state.geometry.lift-3.3*(1-state.gate))<1e-8);
   await p.screenshot({path:`${out}/closing-${i}-2560.png`});
   if(i===1){
    await p.keyboard.up('r');await p.keyboard.press('Escape');const before=await read();assert.equal(before.mode,'paused');
    await p.evaluate(()=>advanceTime(1200));assert.deepEqual(await read(),before);
    await p.click('#primary');await p.keyboard.down('r');
   }
  }
  await p.evaluate(()=>advanceTime(34));assert.equal((await read()).mode,'aftermath');assert((await read()).finished);
  await p.keyboard.up('r');const prior=(await read()).player;await p.keyboard.down('a');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('a');assert(Math.hypot((await read()).player.x-prior.x,(await read()).player.y-prior.y)>.1);
  await p.evaluate(()=>advanceTime(5000));assert.equal((await read()).mode,'complete');
  await p.reload();await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});assert.equal((await read()).mode,'complete');
  // Prove the volume audit catches a thin conduit ending in the travel slot,
  // even though the regular panel point samples miss its lateral position.
  const source=fs.readFileSync('web/under-green-gate-scene.js','utf8'),marker='const conduitEnd=GATE.y-GATE_ROOF_SLOT.d/2+.02;';assert(source.includes(marker));
  await p.route('**/under-green-gate-scene.js',route=>route.fulfill({contentType:'application/javascript',body:source.replace(marker,'const conduitEnd=GATE.y;')}));
  await p.reload();await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const negative=await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun(3);r.mode='playing';r.gate=(3.3+2.8-3.81)/3.3;r.joe.phase='absent';__underGreen.run=r;advanceTime(0);return __underGreen.inspectGateTravel();});
  fs.writeFileSync(out+'/conduit-negative-control.json',JSON.stringify(negative,null,2));assert(negative.boxHits.some(h=>h.part==='crossbar-2.8'));
  await p.unroute('**/under-green-gate-scene.js');
 }
 if(baseline)assert(roof.contacts.length>0);else{assert.deepEqual(roof.contacts,[]);assert.deepEqual(travel.filter(r=>r.hits.length),[]);}
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${baseline?'baseline':'verified'}.json`,JSON.stringify({passed:true,baseline,roof,views,travel,closure,errors},null,2));console.log(JSON.stringify({passed:true,baseline,roofContacts:roof.contacts.length,views:views.length,travelSamples:travel.reduce((n,r)=>n+r.samples,0),closure:closure.length,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
