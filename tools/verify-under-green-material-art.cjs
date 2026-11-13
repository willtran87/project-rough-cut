const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass17-materials/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],rows=[],audits=[];
 try{
  for(const before of [true,false]){
   const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error(m.text());}});
   if(before)await page.route('**/under-green-crafted-surfaces.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade/pass17-source/under-green-crafted-surfaces.js','utf8')}));
   await page.route('**/under-green-scene.js',r=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');assert(s.includes(' return {draw,drainJoeFootsteps:'));s=s.replace(' return {draw,drainJoeFootsteps:',' window.__materialArt={scene,renderer,crafted,materials,structureMeshes}; return {draw,drainJoeFootsteps:');return r.fulfill({contentType:'application/javascript',body:s});});
   await page.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__materialArt&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await page.click('#primary');await page.keyboard.press('Escape');
   const fixtures=[['gallery',0,12,0,.05],['brick-close',3.5,11.7,Math.PI/2,.1],['brick-oblique',3.6,9,.7,.15],['brick-rear',3,14,2.2,.1],['gallery-floor',0,12,0,-.6],['pump',-23.4,42,-1,.05],['concrete-close',-25.5,37,-Math.PI/2,.15],['keeper',12,19,Math.PI,.1],['tile-close',15.5,13,Math.PI,.1],['bunker',-29.5,65,Math.PI,.15]];
   async function place(f){await page.evaluate(async([,x,y,yaw,pitch])=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=90;r.joe.phase='absent';r.bypass=true;r.bypassAt=20;Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
   async function capture(f,width,height){await place(f);const g=await page.evaluate(()=>JSON.parse(render_game_to_text()).graphics);rows.push({before,name:f[0],viewport:[width,height],resolution:g.resolution,draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,crafted:g.craftedSurfaces});await page.screenshot({path:`${out}/${before?'before':'after'}-${f[0]}-${width}.png`});}
   for(const f of fixtures)await capture(f,2560,1600);
   const audit=await page.evaluate(()=>{
    const a=__materialArt,result={sets:{},sourceBytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/under-green/')).map(r=>({name:r.name.split('/').pop(),bytes:r.encodedBodySize,duration:r.duration}))};
    for(const [name,s]of Object.entries(a.crafted.sets)){
     const c=s.map.image,rgba=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let total=0,edges=0,hard=0;const luminance=i=>.2126*rgba[i]+.7152*rgba[i+1]+.0722*rgba[i+2];
     for(let y=0;y<c.height-1;y++)for(let x=0;x<c.width-1;x++){const i=(y*c.width+x)*4,l=luminance(i);for(const j of [i+4,i+c.width*4]){const d=Math.abs(l-luminance(j));total+=d;edges++;if(d>20)hard++;}}
     result.sets[name]={size:[c.width,c.height],repeat:s.map.repeat.toArray(),mag:s.map.magFilter,min:s.map.minFilter,bump:s.bump,independentWet:s.wet!==s.map,wetColorSpace:s.wet.colorSpace,meanAdjacentContrast:total/edges,highContrastEdgeFraction:hard/edges,rgba8MipEstimate:Math.round(c.width*c.height*4*4/3)};
    }
    const textures=new Set(),materials=new Set();a.scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});result.textureObjects=textures.size;result.materialObjects=materials.size;return result;
   });audits.push({before,...audit});
   if(!before){assert.deepEqual(audit.sets.masonry.size,[1254,627]);assert.deepEqual(audit.sets.masonry.repeat,[.5,1]);for(const s of Object.values(audit.sets)){assert(s.independentWet);assert.equal(s.bump,null);}assert.equal(audit.sets.masonry.mag,1003);
    // Pixel coordinates and texture transforms must remain stable when the
    // camera moves. Return to an identical pose/time and compare exact pixels.
    const fingerprint=()=>page.evaluate(()=>{const a=__materialArt,gl=a.renderer.getContext(),b=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,b);let h=2166136261,min=255,max=0;for(let i=0;i<b.length;i++){const v=b[i];h=Math.imul(h^v,16777619);if(i%4!==3){min=Math.min(min,v);max=Math.max(max,v);}}return {hash:h>>>0,min,max};});
    await place(fixtures[1]);const start=await fingerprint();assert(start.max-start.min>15,'Readback must contain actual lit scenery');
    await place(fixtures[3]);await place(fixtures[1]);const end=await fingerprint();assert.deepEqual(end,start,'Materials or scenery changed after camera round trip');audit.cameraRoundTrip={start,end};
    if(!software)for(const [width,height]of [[1280,720],[390,844],[844,390]]){await page.setViewportSize({width,height});for(const f of fixtures.filter(v=>['gallery','keeper'].includes(v[0])))await capture(f,width,height);}
   }
   await page.close();console.log(JSON.stringify({before,software,views:rows.filter(r=>r.before===before).length}));
  }
  assert.deepEqual(errors,[]);const old=audits[0].sets,current=audits[1].sets;
  for(const name of ['masonry','concrete','tile'])assert(current[name].meanAdjacentContrast<old[name].meanAdjacentContrast,name+' should reduce indiscriminate fine contrast');
  for(const r of rows.filter(r=>!r.before&&r.viewport[0]===2560)){const b=rows.find(b=>b.before&&b.name===r.name);assert.equal(r.draws,b.draws);assert.equal(r.triangles,b.triangles);assert.equal(r.textures,b.textures);}
  fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,rows,audits,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,contrast:['masonry','concrete','tile'].map(n=>[n,old[n].meanAdjacentContrast,current[n].meanAdjacentContrast]),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
