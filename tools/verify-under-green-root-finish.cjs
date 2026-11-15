const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/pass15-roots/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],rows=[];
 try{
  for(const before of [true,false]){
   const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error(m.text());}});
   if(before){
    for(const file of ['under-green-atmosphere','under-green-root-compositions','under-green-contact-shade'])await page.route(`**/${file}.js`,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`output/under-green/visual-upgrade/pass15-source/${file}-before.js`,'utf8')}));
    await page.route('**/under-green-district-enclosure.js',r=>{let s=fs.readFileSync('web/under-green-district-enclosure.js','utf8');const added="g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));";assert(s.includes(added));s=s.replace(added,'');return r.fulfill({contentType:'application/javascript',body:s});});
   }
   await page.route('**/under-green-scene.js',r=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');s=s.replace(' return {draw,drainJoeFootsteps:',' window.__roots={scene,renderer,structureMeshes}; return {draw,drainJoeFootsteps:');return r.fulfill({contentType:'application/javascript',body:s});});
   await page.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__roots&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await page.click('#primary');await page.keyboard.press('Escape');
   const fixtures=[['entrance',3.4,10.6,Math.PI/2,.25],['crossing',-1.2,27.2,-Math.PI/2,.25],['pillar',-.2,14.3,-1.2,.1],['bunker',-30,63.2,-Math.PI/2,.35],['pump',-25,34.8,-Math.PI/2,.25],['keeper',9.3,13.4,Math.PI,.25]];
   for(const [name,x,y,yaw,pitch]of fixtures){
    await page.evaluate(async({x,y,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=90;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{x,y,yaw,pitch});
    await page.screenshot({path:`${out}/${before?'before':'after'}-${name}.png`});const g=await page.evaluate(()=>JSON.parse(render_game_to_text()).graphics);rows.push({before,name,resolution:g.resolution,draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,authoredRoots:g.atmosphere.authoredRoots});
   }
   const geometry=await page.evaluate(()=>{__underGreen.inspectCameraClearance([]);const roots=__roots.structureMeshes.filter(m=>m.name==='root'),vertices=roots.reduce((s,m)=>s+m.geometry.attributes.position.count,0),indices=roots.reduce((s,m)=>s+m.geometry.index.count,0),colors=roots.every(m=>!!m.geometry.attributes.color);return {batches:roots.length,vertices,indices,colors};});
   if(!before)assert(geometry.colors,'Scenery roots lack bark shading');rows.push({before,geometry});console.log(JSON.stringify({before,geometry}));await page.close();
  }
  const old=rows.find(r=>r.before&&r.geometry).geometry,current=rows.find(r=>!r.before&&r.geometry).geometry;assert.equal(current.batches,old.batches);assert.equal(current.vertices,old.vertices);assert.equal(current.indices,old.indices);
  for(const row of rows.filter(r=>!r.before&&r.name)){assert.equal(row.authoredRoots.soilPockets,18);assert.equal(row.textures,rows.find(r=>r.before&&r.name===row.name).textures);}
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,rows,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.filter(r=>r.name).length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
