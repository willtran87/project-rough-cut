const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const software=process.argv.includes('--software'),out='output/under-green/visual-upgrade/wet-ground'+(software?'-software':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
  const fixtures=[
   {name:'gallery-pool',x:-2.3,y:10.1},{name:'crossing-pool',x:1.55,y:18.3},{name:'bunker-seep',x:-30.95,y:58.9},
   {name:'pump-runoff',x:-24.3,y:43.1},{name:'range-seep',x:21.9,y:28.1},{name:'keeper-seep',x:8.25,y:14.2,yaw:Math.PI},
   {name:'service-traces',x:-5.2,y:40.7,pitch:-.49},{name:'outlet-silt',x:0,y:20,pitch:-.33,time:24},
   {name:'flood-lift',x:-2.3,y:10.1,elapsed:49},
  ];
  async function fixture(f){await p.evaluate(async f=>{
   const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.joe.phase='absent';r.time=f.time??10;r.elapsed=f.elapsed||0;Object.assign(r.player,{x:f.x,y:f.y,yaw:f.yaw||0,pitch:f.pitch??-.67});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();
  },f);}
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   for(const f of width===2560?(software?fixtures.filter(f=>['gallery-pool','outlet-silt','flood-lift'].includes(f.name)):fixtures):fixtures.filter(f=>f.name==='gallery-pool')){
    await fixture(f);const state=await read(),wet=state.graphics.wetGround;assert.equal(wet.puddles,6);assert.equal(wet.addedColliders,0);assert(wet.leaves<=wet.capacity.leaves);assert.equal(wet.siltPlumes,16);
    const placement=await p.evaluate(async()=>{const {onFloor,solid}=await import('./under-green-course.js');return JSON.parse(render_game_to_text()).graphics.wetGround.positions.filter(v=>!onFloor(v.x,v.y)||solid(v,.16));});assert.deepEqual(placement,[],'Debris cannot enter walls or solids');
    if(f.elapsed)assert(wet.positions.every(v=>v.height>state.flood.depth&&v.height<state.flood.depth+.01));
    views.push({name:f.name,width,height,resolution:state.graphics.resolution,draws:state.graphics.draws,triangles:state.graphics.triangles,wet});await p.screenshot({path:`${out}/${f.name}-${width}.png`});
   }
  }
  await p.setViewportSize({width:1280,height:720});await fixture({x:-2.3,y:10.5,pitch:-.85});
  const contact=await p.evaluate(async()=>{__underGreen.setInput(['KeyW']);for(let i=0;i<45;i++){advanceTime(1000/60);await __underGreen.whenPresented();}__underGreen.clearInput();__underGreen.run.player.yaw=Math.PI;advanceTime(0);await __underGreen.whenPresented();return JSON.parse(render_game_to_text()).graphics.water.contacts;});
  assert(contact.totals.player>0,'Walking through the shallow pool produces real contact ripples');await p.screenshot({path:out+'/shallow-footsteps-1280.png'});
  await fixture(fixtures[0]);const first=(await read()).graphics.wetGround;await p.evaluate(async()=>{advanceTime(100);await __underGreen.whenPresented();});const moving=(await read()).graphics.wetGround;assert.notDeepEqual(moving.positions,first.positions);
  await p.keyboard.press('Escape');const paused=(await read()).graphics.wetGround;await p.evaluate(()=>advanceTime(500));assert.deepEqual((await read()).graphics.wetGround,paused);
  await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').setChecked(true);await p.click('#primary');await fixture(fixtures[0]);const reduced=(await read()).graphics.wetGround;await p.evaluate(async()=>{advanceTime(100);await __underGreen.whenPresented();});assert.equal((await read()).graphics.wetGround.animationTime,0);const pose=v=>v.map(({x,y,phase})=>({x,y,phase}));assert.deepEqual(pose((await read()).graphics.wetGround.positions),pose(reduced.positions),'Reduced Motion freezes decorative drift while physical water height stays live');
  await fixture(fixtures[0]);assert.deepEqual((await read()).graphics.wetGround.positions,first.positions,'Retry resets debris arrangement');
  const lifecycle=await p.evaluate(async()=>{
   const THREE=await import('./vendor/three/three.module.js'),{createDrainWetGround}=await import('./under-green-wet-ground-scene.js'),{createRun}=await import('./under-green-sim.js'),{WATERS,waterState,waterLocal,onFloor,solid}=await import('./under-green-course.js'),{floodState}=await import('./under-green-flood.js');
   const scene=new THREE.Scene(),effect=createDrainWetGround(scene,WATERS),r=createRun(),failures=[],matrix=new THREE.Matrix4(),point=new THREE.Vector3();r.mode='playing';let samples=0,vertices=0,previous=null;
   for(let i=0;i<=528;i++){
    r.time=r.elapsed=i*.25;const states=WATERS.map(w=>waterState(w,r.time,r.bypass,r.bypassAt));effect.update(r,states,false);const s=effect.stats(),depth=floodState(r.elapsed).depth;
    for(const c of s.positions){
     const expected=c.channel<0?Math.max(.012,depth):Math.max(.025+states[c.channel].level*.08,depth);
     if(Math.abs(c.height-expected-.003)>1e-8)failures.push('Wrong debris elevation');
     if(previous&&Math.hypot(c.x-previous[c.id].x,c.y-previous[c.id].y)>.04)failures.push('Discontinuous drift');
     if(c.channel>=0){const local=waterLocal(c,WATERS[c.channel]);if(Math.abs(local.x)+.16>WATERS[c.channel].width/2-.08||Math.abs(local.y)+.16>WATERS[c.channel].depth/2-.2)failures.push('Debris extends beyond water bed');}
     samples++;
    }
    if(i%44===0){const leaves=scene.getObjectByName('Drainage leaf clumps'),position=leaves.geometry.attributes.position;
     for(let j=0;j<leaves.count;j++){leaves.getMatrixAt(j,matrix);for(let k=0;k<position.count;k++){
      point.fromBufferAttribute(position,k).applyMatrix4(matrix);if(!onFloor(point.x,-point.z)||solid({x:point.x,y:-point.z},.001))failures.push('Leaf geometry outside navigable floor');vertices++;
     }}
    }
    previous=s.positions;
   }
   effect.dispose();return {samples,vertices,failures:[...new Set(failures)],remainingObjects:scene.children.length};
  });assert.deepEqual(lifecycle.failures,[]);assert.equal(lifecycle.remainingObjects,0);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,views,lifecycle,contact,behavior:{motion:true,pause:true,reduced:true,retry:true},errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,resolution:views[0].resolution,lifecycle,playerContacts:contact.totals.player,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
