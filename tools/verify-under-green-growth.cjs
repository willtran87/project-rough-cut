const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/pass16-growth/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],rows=[];
 try{
  for(const before of [true,false]){
   const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});p.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error(m.text());}});
   if(before)for(const file of ['under-green-atmosphere','under-green-root-compositions'])await p.route(`**/${file}.js`,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`output/under-green/visual-upgrade/pass16-source/${file}.js`,'utf8')}));
   await p.route('**/under-green-scene.js',r=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');s=s.replace(' return {draw,drainJoeFootsteps:',' window.__growthAudit={scene,renderer,structureMeshes}; return {draw,drainJoeFootsteps:');return r.fulfill({contentType:'application/javascript',body:s});});
   await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__growthAudit&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.keyboard.press('Escape');
   const fixtures=[['entrance',3.4,10.6,Math.PI/2,.65],['crossing',-1.2,27.2,-Math.PI/2,.65],['junction',-7.3,34.7,-Math.PI/2,.6],['bunker',-30,63.2,-Math.PI/2,.72],['pump',-25,34.8,-Math.PI/2,.6],['keeper',8.9,13.4,Math.PI,.6],['low-waterline',-25,34.8,-Math.PI/2,-.4],['ceiling',.6,17.4,0,.9]];
   for(const [name,x,y,yaw,pitch]of fixtures){
    await p.evaluate(async({x,y,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=90;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{x,y,yaw,pitch});
    await p.screenshot({path:`${out}/${before?'before':'after'}-${name}.png`});const g=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);rows.push({before,name,resolution:g.resolution,draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,atmosphere:g.atmosphere});
   }
   if(!before){
    const audit=await p.evaluate(async()=>{
     const T=await import('./vendor/three/three.module.js'),a=__growthAudit;__underGreen.inspectCameraClearance([]);a.scene.updateMatrixWorld(true);
     const meshes=a.structureMeshes.filter(m=>m.name==='rootMoss'),receivers=a.structureMeshes.filter(m=>['stone','rootStone','bunkerStone','pumpStone','rangeStone','keeperStone','sand','bankEarth'].includes(m.name)),ray=new T.Raycaster(),misses=[],normals=[],point=new T.Vector3();let vertices=0,triangles=0;
     for(const mesh of meshes){const g=mesh.geometry;triangles+=g.index.count/3;
      for(let i=0;i<g.attributes.position.count;i++){
       point.fromBufferAttribute(g.attributes.position,i).applyMatrix4(mesh.matrixWorld);
       const normal=new T.Vector3().fromBufferAttribute(g.attributes.normal,i).transformDirection(mesh.matrixWorld),direction=Math.abs(normal.x)>Math.abs(normal.z)?new T.Vector3(-Math.sign(normal.x),0,0):new T.Vector3(0,0,-Math.sign(normal.z));
       ray.set(point.clone().addScaledVector(direction,-.025),direction);ray.near=0;ray.far=.08;const hits=ray.intersectObjects(receivers,false);if(!hits.length)misses.push({point:point.toArray(),normal:normal.toArray()});vertices++;
       if(!Number.isFinite(normal.length())||normal.length()<.99)normals.push(i);
      }
     }
     const materials=[...new Set(meshes.map(m=>m.material))],atlas=materials.find(m=>m.map)?.map.image;
     return {vertices,triangles,batches:meshes.length,materials:materials.map(m=>({transparent:m.transparent,depthWrite:m.depthWrite,opacity:m.opacity})),misses,normals,atlas:atlas?[atlas.width,atlas.height]:null,stats:JSON.parse(render_game_to_text()).graphics.atmosphere};
    });
    fs.writeFileSync(`${out}/geometry.json`,JSON.stringify(audit,null,2));assert.deepEqual(audit.misses,[],'Growth must touch real masonry/earth');assert.deepEqual(audit.normals,[]);assert.equal(audit.stats.growth.patches.length,28);assert.deepEqual(audit.atlas,[1024,256]);assert.equal(audit.vertices,28*49);assert.equal(audit.triangles,28*72);assert(audit.stats.ceilingHairs>0);assert(audit.materials.every(m=>!m.transparent&&m.depthWrite&&m.opacity===1));
    // Save the source atlas for direct pixel-cluster inspection as well as the
    // lit gameplay views. This does not replace gameplay acceptance.
    const atlas=await p.evaluate(()=>__growthAudit.structureMeshes.find(m=>m.name==='rootMoss'&&m.material.map).material.map.image.toDataURL());fs.writeFileSync(`${out}/atlas.png`,Buffer.from(atlas.split(',')[1],'base64'));
   }
   await p.close();console.log(JSON.stringify({before,software,views:fixtures.length}));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,rows,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
