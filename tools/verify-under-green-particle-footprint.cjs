const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/particle-footprint/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
async function waitForRenderQuiet(){
 const {execFileSync}=require('node:child_process'),start=Date.now();let announced=false;
 while(true){
  const command=`@(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object { $_.ProcessId -ne ${process.pid} -and $_.CommandLine -match 'verify-|profile-|web_game_playwright' } | Select-Object -ExpandProperty ProcessId) | ConvertTo-Json -Compress`;
  const raw=execFileSync('powershell.exe',['-NoProfile','-Command',command],{encoding:'utf8',windowsHide:true}).trim(),ids=raw?JSON.parse(raw):[];
  if(!ids?.length&&typeof ids!=='number')return;
  if(!announced){console.log(JSON.stringify({waitingForRenderJobs:ids}));announced=true;}
  if(Date.now()-start>180000)throw Error('Other live render jobs prevented an isolated timing sample');
  await new Promise(r=>setTimeout(r,2000));
 }
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],results=[],profiles=[];
 try{
  for(const baseline of [true,false]){
   const p=await browser.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.route('**/under-green-water.js',route=>{let s=fs.readFileSync(`${baseline?'output/under-green/visual-upgrade/pass12-source':'web'}/under-green-water.js`,'utf8').replace(/\r\n/g,'\n');assert(s.includes(' return {\n  update('));s=s.replace(' return {\n  update(',' window.__drops=drops; return {\n  update(');return route.fulfill({contentType:'application/javascript',body:s});});
   await p.route('**/under-green-scene.js',route=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');s=s.replace(' return {draw,drainJoeFootsteps:',' window.__footprintScene={scene,renderer,camera,practicalLighting}; return {draw,drainJoeFootsteps:');return route.fulfill({contentType:'application/javascript',body:s});});
   await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>window.__drops&&window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.keyboard.press('Escape');
   for(const [width,height]of [[844,390],[390,844],[1280,720],[2560,1600]]){
    await p.setViewportSize({width,height});
    const result=await p.evaluate(async()=>{
     const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=24;r.joe.phase='absent';Object.assign(r.player,{x:0,y:20,yaw:0,pitch:-.12});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();
     const {scene,renderer,camera}=__footprintScene,gl=renderer.getContext(),read=()=>{const b=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,b);return b;},withDrops=read();__drops.visible=false;renderer.render(scene,camera);const withoutDrops=read();advanceTime(0);
     let changed=0,readable=0,light=0,max=0;for(let i=0;i<withDrops.length;i+=4){const d=Math.max(...[0,1,2].map(j=>withDrops[i+j]-withoutDrops[i+j]));if(d>0)changed++;if(d>=3)readable++;light+=Math.max(0,d);max=Math.max(max,d);}
     const positions=[];let maxWidth=0,maxLength=0;for(let i=0;i<__drops.count;i++){const a=__drops.instanceMatrix.array,o=i*16;positions.push(...a.slice(o+12,o+15));maxWidth=Math.max(maxWidth,Math.hypot(...a.slice(o,o+3)));maxLength=Math.max(maxLength,Math.hypot(...a.slice(o+4,o+7)));}
     return {changed,readable,light,max,positions,maxWidth,maxLength,water:JSON.parse(render_game_to_text()).graphics.water,resolution:[gl.drawingBufferWidth,gl.drawingBufferHeight]};
    });
    assert(result.maxWidth<=.065001);assert(result.maxLength<=.100001);assert(result.readable>0);
    results.push({baseline,width,height,...result});await p.screenshot({path:`${out}/${baseline?'before':'after'}-${width}.png`});console.log(JSON.stringify({baseline,width,readable:result.readable,light:result.light,boost:result.water.maxFootprintScale}));
   }
   if(!baseline){
    const pose=()=>p.evaluate(()=>Array.from(__drops.instanceMatrix.array.slice(0,__drops.count*16)));
    const original=await pose();await p.evaluate(()=>{__underGreen.run.player.rearAngle=Math.PI;advanceTime(0);__underGreen.run.player.rearAngle=0;advanceTime(0);});assert.deepEqual(await pose(),original,'Rear glance restarts footprint samples');
    await p.keyboard.press('Escape');const frozen=await pose();await p.evaluate(()=>advanceTime(500));assert.deepEqual(await pose(),frozen,'Pause moves spray');
    await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').setChecked(true);await p.click('#primary');await p.evaluate(()=>advanceTime(0));const steady=await pose();await p.evaluate(()=>{__underGreen.run.time+=.08;advanceTime(0);});assert.deepEqual(await pose(),steady,'Reduced Motion moves spray');
    await p.keyboard.press('Escape');await p.locator('#reduced').setChecked(false);await p.click('#primary');await p.evaluate(()=>{__underGreen.run.time=24;advanceTime(0);});
   }
   await p.setViewportSize({width:960,height:600});
   await waitForRenderQuiet();
   const profile=await p.evaluate(async()=>{
    const a=__footprintScene,gl=a.renderer.getContext();advanceTime(0);
    // Fixed-background particle-only probe: composited contrast against a lit
    // wall is not particle brightness (darkening the wall can increase it).
    const effect=enabled=>{a.practicalLighting.setEnabled(enabled);advanceTime(0);const changed=[],background=a.scene.background;a.scene.background=background.clone().multiplyScalar(0);a.scene.traverse(o=>{if(o.isMesh||o.isSprite){changed.push([o,o.visible]);o.visible=o===__drops;}});a.renderer.render(a.scene,a.camera);const pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let energy=0;for(let i=0;i<pixels.length;i+=4)energy+=pixels[i]+pixels[i+1]+pixels[i+2];for(const [o,visible]of changed)o.visible=visible;a.scene.background=background;advanceTime(0);return energy;};
    const lightOn=effect(true),lightOff=effect(false);a.practicalLighting.setEnabled(true);advanceTime(0);
    const samples=[];for(let i=0;i<30;i++){const start=performance.now();advanceTime(0);const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU timeout');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(fence);if(i>=6)samples.push(performance.now()-start);}
    const sorted=[...samples].sort((a,b)=>a-b);return {lightOn,lightOff,emissive:__drops.material.emissive.getHex(),median:sorted[12],p95:sorted[22],samples,graphics:JSON.parse(render_game_to_text()).graphics};
   });
   console.log(JSON.stringify({baseline,lightOn:profile.lightOn,lightOff:profile.lightOff,median:profile.median,p95:profile.p95}));assert.equal(profile.emissive,0);if(!baseline)assert(profile.lightOn>profile.lightOff*1.05,'Spray ignores practical lamps');profiles.push({baseline,...profile});
   await p.close();
  }
  for(const width of [844,390,1280,2560]){const before=results.find(v=>v.baseline&&v.width===width),after=results.find(v=>!v.baseline&&v.width===width);assert.deepEqual(after.positions,before.positions,'Footprint changes world travel');if(width===844)assert(after.readable>before.readable*1.5,'Small target droplet readability not improved');assert(after.readable>=before.readable);}
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,results,profiles,errors},null,2));console.log(JSON.stringify({passed:true,software,views:results.length,timing:profiles.map(p=>({baseline:p.baseline,median:p.median,p95:p.p95,lightRatio:p.lightOn/Math.max(1,p.lightOff)})),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
