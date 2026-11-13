const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/spray/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],results=[];
 try{
  for(const baseline of [true,false]){
   const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.route('**/under-green-water.js',route=>{
    let s=fs.readFileSync(`${baseline?'output/under-green/visual-upgrade/pass12-baseline':'web'}/under-green-water.js`,'utf8').replace(/\r\n/g,'\n');
    assert(s.includes(' return {\n  update(r,states,reduced,actor){'),'water instrumentation marker');
    s=s.replace(' return {\n  update(r,states,reduced,actor){',' window.__sprayMeshes={drops,rings,mist}; return {\n  update(r,states,reduced,actor){');
    return route.fulfill({contentType:'application/javascript',body:s});
   });
   if(baseline)await p.route('**/under-green-water-particles.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade/pass12-baseline/under-green-water-particles.js','utf8')}));
   await p.route('**/under-green-scene.js',route=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');s=s.replace(' return {draw,drainJoeFootsteps:',' window.__sprayScene={scene,renderer,camera}; return {draw,drainJoeFootsteps:');return route.fulfill({contentType:'application/javascript',body:s});});
   await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__sprayMeshes&&window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.keyboard.press('Escape');
   const fixtures=[{name:'cold-crossing',x:0,y:20,yaw:0,time:24,pitch:-.12},{name:'keeper',x:12,y:23,yaw:Math.PI,time:90,pitch:-.12},{name:'side',x:2.2,y:23,yaw:-Math.PI/2,time:24,pitch:-.15},{name:'rear',x:0,y:26,yaw:Math.PI,time:24,pitch:-.12},{name:'outflow',x:2.8,y:38,yaw:Math.PI/2,time:24,bypass:false,pitch:-.12},{name:'flood',x:0,y:20,yaw:0,time:24,elapsed:49,pitch:-.12}];
   async function place(f){await p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=f.time;r.elapsed=f.elapsed||0;r.bypass=f.bypass??true;r.bypassAt=0;r.joe.phase='absent';Object.assign(r.player,f);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
   async function effectPixels(){return p.evaluate(()=>{const a=__sprayScene,m=__sprayMeshes,gl=a.renderer.getContext();advanceTime(0);const enabled=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,enabled);const drops=m.drops.visible,mist=m.mist.visible;m.drops.visible=m.mist.visible=false;a.renderer.render(a.scene,a.camera);const disabled=new Uint8Array(enabled.length);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,disabled);m.drops.visible=drops;m.mist.visible=mist;advanceTime(0);let changed=0,cyan=0,total=0,max=0;for(let i=0;i<enabled.length;i+=4){const d=[0,1,2].map(j=>Math.max(0,enabled[i+j]-disabled[i+j]));if(d.some(v=>v>0))changed++;cyan+=Math.max(0,Math.min(d[1],d[2])-d[0]);total+=d[0]+d[1]+d[2];max=Math.max(max,...d);}return {changed,cyan,total,cyanFraction:cyan/Math.max(total,1),max,resolution:[gl.drawingBufferWidth,gl.drawingBufferHeight],water:JSON.parse(render_game_to_text()).graphics.water};});}
   const views=[];
   for(const f of fixtures){await place(f);const pixels=await effectPixels();assert(pixels.changed>100,f.name+' spray must remain visible');assert(pixels.water.activeSplashes>0);views.push({name:f.name,...pixels});await p.screenshot({path:`${out}/${baseline?'before':'after'}-${f.name}-2560.png`});console.log(JSON.stringify({baseline,name:f.name,changed:pixels.changed,cyanFraction:pixels.cyanFraction}));}
   if(!baseline){
    await place({x:0,y:12,yaw:Math.PI/2,time:24});assert.equal((await effectPixels()).changed,0,'Spray leaks through a wall');
    await place(fixtures[0]);
    const frame=()=>p.evaluate(()=>{const {drops,mist}=__sprayMeshes;return {drops:Array.from(drops.instanceMatrix.array.slice(0,drops.count*16)),mist:Array.from(mist.instanceMatrix.array.slice(0,mist.count*16)),alpha:Array.from(mist.geometry.getAttribute('waterAlpha').array.slice(0,mist.count))};});
    const start=await frame();await p.evaluate(()=>{__underGreen.run.player.rearAngle=Math.PI;advanceTime(0);__underGreen.run.player.rearAngle=0;advanceTime(0);});assert.deepEqual(await frame(),start,'Rear glance restarts plume');
    await p.evaluate(()=>{__underGreen.run.time+=.08;advanceTime(0);});assert.notDeepEqual(await frame(),start,'Spray does not travel');
    for(let i=0;i<6;i++){await p.evaluate(()=>{__underGreen.run.time+=.08;advanceTime(0);});await p.screenshot({path:`${out}/motion-${i}.png`});}
    await p.keyboard.press('Escape');const paused=await frame();await p.evaluate(()=>advanceTime(500));assert.deepEqual(await frame(),paused,'Pause moves spray');
    await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').setChecked(true);await p.click('#primary');await place(fixtures[0]);const steady=await frame();await p.evaluate(()=>{__underGreen.run.time+=.08;advanceTime(0);});assert.deepEqual(await frame(),steady,'Reduced Motion moves spray');
    for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await place(fixtures[0]);await p.screenshot({path:`${out}/crossing-${width}.png`});}
    await p.keyboard.press('Escape');await p.locator('#reduced').setChecked(false);await p.click('#primary');
   }
   await p.setViewportSize({width:960,height:600});await place(fixtures[0]);
   const timing=await p.evaluate(async()=>{const gl=__sprayScene.renderer.getContext(),samples=[];for(let i=0;i<30;i++){const start=performance.now();advanceTime(0);const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU timeout');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(fence);if(i>=6)samples.push(performance.now()-start);}const sorted=[...samples].sort((a,b)=>a-b);return {samples,median:sorted[12],p95:sorted[22],graphics:JSON.parse(render_game_to_text()).graphics};});
   results.push({baseline,views,timing});await p.close();
  }
  for(const name of ['cold-crossing','keeper']){const before=results[0].views.find(v=>v.name===name),after=results[1].views.find(v=>v.name===name);assert(after.cyanFraction<before.cyanFraction*.6,name+' cyan contribution not reduced');}
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,results,errors},null,2));console.log(JSON.stringify({passed:true,software,timing:results.map(v=>({baseline:v.baseline,median:v.timing.median,p95:v.timing.p95})),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
