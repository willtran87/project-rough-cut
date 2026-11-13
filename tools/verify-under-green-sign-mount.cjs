const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/pass14-sign/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[];
 try{
  for(const before of [true,false]){
   const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.route('**/under-green-scene.js',r=>{let s=fs.readFileSync(before?'output/under-green/visual-upgrade/pass14-source/under-green-scene-before.js':'web/under-green-scene.js','utf8');const marker=' return {draw,drainJoeFootsteps:';assert(s.includes(marker));s=s.replace(marker,' window.__mount={scene,renderer,camera,batchCulling};'+marker);return r.fulfill({contentType:'application/javascript',body:s});});
   await page.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__mount&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await page.click('#primary');await page.keyboard.press('Escape');
   const audit=await page.evaluate(async before=>{
    const THREE=await import('./vendor/three/three.module.js');__mount.batchCulling?.restore();__mount.scene.updateMatrixWorld(true);
    const meshes=[];__mount.scene.traverseVisible(o=>{if(o.isMesh&&o.material&&!Array.isArray(o.material)&&!o.material.transparent&&o.material.opacity===1){if(o.material.name.startsWith('drain-sign:')&&/[\r\n]/.test(o.material.name))throw Error('Multiline shader label');meshes.push(o);}});
    const ray=new THREE.Raycaster(),misses=[];let samples=0;
    // The central paint/text region excludes the perimeter bolts and seats.
    // First-hit queries use the actual merged scene triangles, from both faces.
    for(const side of [-1,1])for(let i=0;i<=120;i++)for(let j=0;j<=12;j++){
     const x=before?-1.20+i*.02:-.84+i*.014,y=before?2.79+j*.026:2.78+j*.028;ray.set(new THREE.Vector3(x,y,-20+side*.6),new THREE.Vector3(0,0,-side));ray.far=1.2;
     const hit=ray.intersectObjects(meshes,false)[0];samples++;if(!hit?.object.material.name.includes('drain-sign:LOW FLOW'))misses.push({side,x,y,name:hit?.object.material.name||'',distance:hit?.distance});
    }
    return {samples,misses};
   },before);
   if(before)assert(audit.misses.length>0,'Reference did not reproduce obscured instruction');else assert.deepEqual(audit.misses,[],'Support obstructs text region');
   for(const [name,x,y,yaw,pitch]of [['approach',0,16,0,.12],['rear',0,25.5,Math.PI,.15],['oblique',1.1,17,0,.15]]){
    await page.evaluate(async({x,y,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=24;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{x,y,yaw,pitch});
    await page.screenshot({path:`${out}/${before?'before':'after'}-${name}.png`});
   }
   const framing=[];
   if(!before){
    for(const [width,height]of [[1280,720],[390,844],[844,390]]){await page.setViewportSize({width,height});const bounds=await page.evaluate(async()=>{Object.assign(__underGreen.run.player,{x:0,y:16,yaw:0,pitch:.12});advanceTime(0);await __underGreen.whenPresented();const THREE=await import('./vendor/three/three.module.js'),points=[];for(const x of [-.96,.96])for(const y of [2.71,3.19])points.push(new THREE.Vector3(x,y,-19.988).project(__mount.camera));return points.map(p=>({x:p.x,y:p.y,z:p.z}));});assert(bounds.every(p=>Math.abs(p.x)<1&&Math.abs(p.y)<1),'Instruction plate clips at '+width);framing.push({width,height,bounds});await page.screenshot({path:`${out}/after-${width}.png`});}
    const clearance=await page.evaluate(()=>__underGreen.inspectCameraClearance(Array.from({length:41},(_,i)=>({x:-2.4+(i%7)*.8,y:16+Math.floor(i/7)*1.5,height:1.65,yaw:0,pitch:.4,fov:90,aspect:2560/1600}))));assert(clearance.every(r=>!r.hits.length),'Mount infringes camera clearance');
   }
   rows.push({before,samples:audit.samples,blocked:audit.misses.length,example:audit.misses.slice(0,3),framing,graphics:await page.evaluate(()=>JSON.parse(render_game_to_text()).graphics)});console.log(JSON.stringify({before,samples:audit.samples,blocked:audit.misses.length}));await page.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,rows,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
