const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/visual-upgrade/machinery'+(software?'-software':''),errors=[],views=[],travel=[];
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const tick=ms=>p.evaluate(async ms=>{advanceTime(ms);await __underGreen.whenPresented();},ms);
  async function seed(kind){
   await p.evaluate(async kind=>{
    const {createRun}=await import('./under-green-sim.js'),{SLUICE,GATE}=await import('./under-green-course.js');
    const r=createRun();r.mode='playing';r.time=30;r.messageTime=0;r.joe.phase='absent';
    if(kind==='release'||kind.startsWith('gate')){r.bypass=true;r.bypassAt=20;r.lessonCrossed=true;}
    const positions={operator:[-25.7,40,Math.PI/2,-.20],front:[-24,40.9,-.77,-.17],rear:[-24,45,-2.35,-.15],overview:[-19,38,-1,.05],release:[SLUICE.x,SLUICE.y+1.3,Math.PI,-.48],gate:[12,GATE.y-2,0,.38],'gate-guide':[8.8,GATE.y-1.7,-.8,.24],'gate-approach':[12,GATE.y+5,Math.PI,.2]};
    const [x,y,yaw,pitch]=positions[kind];Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();
   },kind);
  }
  async function capture(name,width,height){const state=await read();await p.screenshot({path:`${out}/${name}-${width}.png`});views.push({name,width,height,state});return state;}
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   if(width===2560)for(const kind of ['overview','front','rear','gate-guide','gate-approach']){await seed(kind);await capture(kind,width,height);}
   await seed('operator');const before=await capture('pump-before',width,height);
   assert.equal(before.action.id,'bypass');assert.equal(before.graphics.pump.detail.dialPixels,512);
   assert.equal(before.graphics.districtDetails.pumpHousing.kind,'centrifugal-volute');
   await p.keyboard.press('e');await tick(200);const during=await capture('pump-moving',width,height);
   assert(during.bypass);assert(during.graphics.pump.handle<0&&during.graphics.pump.handle>-1);
   for(const gauge of during.graphics.pump.gauges)assert.equal(gauge.level,during.waters.find(w=>w.id===gauge.id).level);
   await p.keyboard.press('Escape');const paused=await read();await tick(500);assert.deepEqual((await read()).graphics.pump,paused.graphics.pump);await p.click('#primary');
   await tick(2000);const after=await capture('pump-after',width,height);assert(after.graphics.pump.latched);
   await seed('release');const release=await capture('release-open',width,height);assert.equal(release.action.id,'gate');
   await p.keyboard.press('e');await tick(350);const moving=await capture('release-moving',width,height);assert(moving.gate>0&&moving.gate<1);
   assert(moving.graphics.release.witnessHeight<release.graphics.release.witnessHeight);
   await tick(1100);const closed=await capture('release-secured',width,height);assert(closed.graphics.release.secured);assert.equal(closed.graphics.release.latchAngle,0);
   await seed('gate');
   for(const fraction of [0,.5,1]){await p.evaluate(f=>{__underGreen.run.gate=f;advanceTime(0);},fraction);await p.evaluate(()=>__underGreen.whenPresented());await capture('gate-'+fraction,width,height);}
  }
  if(!software){
   await seed('gate');
   for(let i=0;i<=40;i++){
    const state=await p.evaluate(f=>{__underGreen.run.gate=f;advanceTime(0);return __underGreen.inspectGateTravel();},i/40);travel.push(state);
    assert.deepEqual(state.hits,[],`gate points ${i}`);assert.deepEqual(state.boxHits,[],`gate boxes ${i}`);assert.equal(state.panelDraws,2);assert.equal(state.detail.guideRollerHousings,16);
    for(const cable of state.cables){assert(Math.abs(cable.top-6.42)<1e-8);assert(Math.abs(cable.bottom-state.lift-2.8)<1e-8);}
   }
   const camera=await p.evaluate(async()=>{
    const {solid,LEVER,SLUICE,GATE}=await import('./under-green-course.js'),poses=[];
    for(const point of [LEVER,SLUICE])for(let a=0;a<Math.PI*2;a+=Math.PI/6)for(const radius of [.7,1,1.5]){
     const x=point.x+Math.sin(a)*radius,y=point.y+Math.cos(a)*radius;if(solid({x,y},.3))continue;
     for(const height of [1.12,1.65])for(const pitch of [-.8,0,.8])for(const rear of [0,Math.PI])poses.push({x,y,height,pitch,yaw:a+rear,fov:85,aspect:844/390});
    }
    for(const x of [GATE.x-4.7,GATE.x+4.7])for(const offset of [-1,-.6,.6,1]){
     const y=GATE.y+offset;if(solid({x,y},.3,true))continue;
     for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(let yaw=0;yaw<Math.PI*2;yaw+=Math.PI/4)poses.push({x,y,height,pitch,yaw,fov:85,aspect:844/390});
    }
    return {count:poses.length,hits:__underGreen.inspectCameraClearance(poses).filter(p=>p.hits.length)};
   });
   fs.writeFileSync(out+'/camera.json',JSON.stringify(camera,null,2));assert.deepEqual(camera.hits,[]);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,views,travel,errors},null,2));
  console.log(JSON.stringify({passed:true,views:views.length,travel:travel.length,resolution:views[0].state.graphics.resolution,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
