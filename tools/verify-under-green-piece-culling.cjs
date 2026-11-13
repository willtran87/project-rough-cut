const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const half=process.argv.includes('--half'),out='output/under-green/piece-culling'+(half?'/half':'');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage(),errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(resolution=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({resolution})),half?.5:1);
  p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/under-green.js',route=>{
   const source=fs.readFileSync('web/under-green.js','utf8'),marker='if(test)window.__underGreen={';assert(source.includes(marker));
   return route.fulfill({contentType:'application/javascript',body:source.replace(marker,'window.__cullPrefs=prefs;'+marker)});
  });
  await p.route('**/under-green-scene.js',route=>{
   let source=fs.readFileSync('web/under-green-scene.js','utf8');
   const marker=' return {draw,drainJoeFootsteps:',update='batchCulling?.update(camera);';assert(source.includes(marker)&&source.includes(update));
   source=source.replace(marker,' window.__cullAudit={renderer,batchCulling};'+marker)
    .replace(update,'if(window.__fullGeometry)batchCulling?.restore();else '+update);
   return route.fulfill({contentType:'application/javascript',body:source});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__cullAudit&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
  await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const fov of [45,58,85]) for(const [name,x,y,yaw]of [
    ['roots',0,12,0],['junction',0,38,Math.PI/2],['bunker',-20,70,Math.PI],
    ['pump',-20,40,-Math.PI/2],['range',12,36,Math.PI],['keeper',12,13,Math.PI],
   ]){
    const result=await p.evaluate(async({name,x,y,yaw,fov})=>{
     const {createRun}=await import('./under-green-sim.js'),{rangeY}=await import('./under-green-layout.js');
     const r=createRun(2);r.mode='playing';r.time=90;r.messageTime=0;Object.assign(r.player,{x,y:x>6?rangeY(y):y,yaw});__underGreen.run=r;__cullPrefs.fov=fov;
     const {renderer,batchCulling}=__cullAudit,gl=renderer.getContext();
     function pixels(){advanceTime(0);const data=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;}
     window.__fullGeometry=true;for(let i=0;i<4;i++)advanceTime(0);const before=pixels(),fullTriangles=JSON.parse(render_game_to_text()).graphics.triangles;
     window.__fullGeometry=false;const after=pixels(),culledTriangles=JSON.parse(render_game_to_text()).graphics.triangles;
     let changed=0,max=0;for(let i=0;i<before.length;i++){const d=Math.abs(before[i]-after[i]);if(d)changed++;max=Math.max(max,d);}
     advanceTime(0);const stableUploads=batchCulling.stats().indexValuesUploaded;
     // Invoke the real QA path, then verify its full mesh restoration and
     // the next normal render at the identical camera pose.
     __underGreen.inspectCameraClearance([]);const restored=batchCulling.stats();const resumed=pixels();let resumedChanges=0;
     for(let i=0;i<after.length;i++)if(after[i]!==resumed[i])resumedChanges++;
     return {name,fov,changed,max,resumedChanges,stableUploads,restored:restored.visible===restored.parts,fullTriangles,culledTriangles,culling:batchCulling.stats(),resolution:[gl.drawingBufferWidth,gl.drawingBufferHeight]};
    },{name,x,y,yaw,fov});
    views.push({width,height,...result});
    fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:false,views,errors},null,2));
    assert.equal(result.changed,0,JSON.stringify(views.at(-1)));assert.equal(result.resumedChanges,0,JSON.stringify(views.at(-1)));
    assert(result.restored);assert.equal(result.stableUploads,0);assert(result.culledTriangles<=result.fullTriangles);
    if(fov===85&&['junction','keeper'].includes(name))await p.screenshot({path:`${out}/${name}-${width}.png`});
   }
   console.log(JSON.stringify({width,height,views:views.length,changed:views.reduce((n,v)=>n+v.changed,0)}));
  }
  const hiddenGeometry=await p.evaluate(()=>{const hits=__underGreen.inspectClearance([{x:-1.35,y:15}]);return {hits:hits.length,stats:__cullAudit.batchCulling.stats()};});
  assert(hiddenGeometry.hits>0,'QA must still find the root-pillar face behind the current view');
  assert.equal(hiddenGeometry.stats.visible,hiddenGeometry.stats.parts);assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:true,views,hiddenGeometry,errors},null,2));
  console.log(JSON.stringify({passed:true,cases:views.length,hiddenGeometry,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
