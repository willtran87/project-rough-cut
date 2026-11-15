const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),quick=process.argv.includes('--quick'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass80/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
const fixtures=[['gallery',0,8,0,.1],['crossing',0,19,0,-.05],['pump',-25.7,40,Math.PI/2,-.27],['range',12,35,Math.PI,.05],['keeper',12,13.5,-2.4,.05],['release',14.65,15.9,Math.PI,-.48],['bunker',-29.5,65,Math.PI,.15]];
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),pages=[],errors=[],rows=[];try{
 for(const before of [true,false]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});pages.push(p);p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const name of ['under-green-scene','under-green-practical-lighting'])await p.route('**/'+name+'.js',route=>{
   let s=fs.readFileSync(before?`output/under-green/visual-pass80/source/${name}-before.js`:`web/${name}.js`,'utf8');
   if(name==='under-green-scene'){
    s=s.replace(' return {draw,inspectCastShadow:',' window.__pieceProbe={renderer,scene,camera,practicalLighting}; return {draw,inspectCastShadow:');
    s=s.replace(' const practicalLighting=createDrainPracticalLighting',`window.__pieceGeometry={triangles:0,sum:0,xor:0};
     for(const mesh of staticLightMeshes){const g=mesh.geometry,attrs=Object.entries(g.attributes).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,a])=>({name,a,bits:new Uint32Array(a.array.buffer,a.array.byteOffset,a.array.length)}));
      for(let i=0;i<(g.index?.count||g.attributes.position.count);i+=3){let h=2166136261;
       for(let j=0;j<3;j++){const k=g.index?g.index.getX(i+j):i+j;
        for(const {a,bits}of attrs)for(let n=0;n<a.itemSize;n++)h=Math.imul(h^bits[k*a.itemSize+n],16777619)>>>0;}
       __pieceGeometry.triangles++;__pieceGeometry.sum=(__pieceGeometry.sum+h)>>>0;__pieceGeometry.xor=(__pieceGeometry.xor^h)>>>0;
      }
     } const practicalLighting=createDrainPracticalLighting`);

    if(!before){
     s=s.replace('return g.boundingBox.clone();','const b=g.boundingBox.clone();b.vertexCount=g.attributes.position.count;return b;');
     s=s.replace(' staticLightBounds.clear();',`window.__pieceBoundsProof={parts:0,vertices:0,batches:staticLightBounds.size};
      for(const [mesh,parts]of staticLightBounds){let offset=0;const p=mesh.geometry.attributes.position;
       for(const b of parts){__pieceBoundsProof.parts++;for(let i=offset;i<offset+b.vertexCount;i++){
        if(p.getX(i)<b.min.x-.000001||p.getX(i)>b.max.x+.000001||p.getY(i)<b.min.y-.000001||p.getY(i)>b.max.y+.000001||p.getZ(i)<b.min.z-.000001||p.getZ(i)>b.max.z+.000001)throw Error('Original part bound does not contain merged vertices');
        __pieceBoundsProof.vertices++;}offset+=b.vertexCount;}if(offset!==p.count)throw Error('Part count mismatch');
      }staticLightBounds.clear();`);
    }
   }else{
    s=s.replace('bindings.push({mesh,original,indices,bounds});','bindings.push({mesh,original,indices,bounds'+(before?'':',parts')+'});');
    s=s.replace(' renderer.setOpaqueSort(stableLightMaterialSort);',' window.__pieceBindings={bindings,sources,owned}; renderer.setOpaqueSort(stableLightMaterialSort);');
   }
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__pieceProbe&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 }
 async function place(p,f,time=26.3,elapsed=0){await p.evaluate(async({f,time,elapsed})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=time;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,time,elapsed});}
 async function inspect(p){return p.evaluate(async()=>{
  const a=__pieceProbe,T=await import('./vendor/three/three.module.js');advanceTime(0);const gl=a.renderer.getContext(),pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  const sha=async data=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).map(x=>x.toString(16).padStart(2,'0')).join('');let rgbSum=0;for(let i=0;i<pixels.length;i+=4)rgbSum+=pixels[i]+pixels[i+1]+pixels[i+2];
  const s=JSON.parse(render_game_to_text()),g=s.graphics,bindings=[];
  for(const b of __pieceBindings.bindings){
   const actual=b.mesh.geometry.boundingBox.clone().applyMatrix4(b.mesh.matrixWorld);if(!b.bounds.clone().expandByScalar(.000001).containsBox(actual))throw Error('Static fixture moved outside light bound');
   const omissions=__pieceBindings.sources.filter(v=>!b.indices.includes(v.index)).map(v=>({index:v.index,distance:b.parts?Math.min(...b.parts.map(p=>p.distanceToPoint(v.world))):b.bounds.distanceToPoint(v.world),reach:v.uniform.distance}));if(omissions.some(v=>v.distance<=v.reach+.01))throw Error('Contributing lamp omitted');
   bindings.push({name:b.mesh.name,indices:b.indices,omissions,key:b.mesh.material.customProgramCacheKey(),bounds:[b.bounds.min.toArray(),b.bounds.max.toArray()]});
  }
  return {geometry:window.__pieceGeometry,proof:window.__pieceBoundsProof,pixels:await sha(pixels),rgbSum,bindings,player:s.player,pump:g.pump,release:g.release,graphics:{draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,resolution:g.resolution,lights:g.lights,practicals:g.practicalLighting}};
 });}
 async function compare(name,save=true){const pair=[];for(const p of pages)pair.push(await inspect(p));const row={name,pair,equal:pair[0].pixels===pair[1].pixels};rows.push(row);if(save)for(let i=0;i<pages.length;i++)await pages[i].screenshot({path:`${out}/${i?'after':'before'}-${name}.jpg`,quality:91});assert(pair.every(p=>p.rgbSum>100000),'Empty framebuffer');if(!row.equal){
 for(let i=0;i<pages.length;i++){const png=await pages[i].evaluate(()=>__pieceProbe.renderer.domElement.toDataURL('image/png').split(',')[1]);fs.writeFileSync(`${out}/${i?'after':'before'}-${name}.png`,Buffer.from(png,'base64'));}
 row.difference=JSON.parse(execFileSync('python',['-c',`from PIL import Image,ImageChops
import json,sys
a=Image.open(sys.argv[1]).convert('RGB');b=Image.open(sys.argv[2]).convert('RGB');d=ImageChops.difference(a,b);h=d.histogram();print(json.dumps({'bounds':d.getbbox(),'max':max(v[1] for v in d.getextrema()),'changedChannels':sum(h[i] for i in range(len(h)) if i%256)}))`,`${out}/before-${name}.png`,`${out}/after-${name}.png`],{encoding:'utf8'}));
 assert(row.difference.max<=16,name+' exceeds boundary pixel tolerance');
 assert(row.difference.changedChannels<=Math.max(12,pair[0].graphics.resolution[0]*pair[0].graphics.resolution[1]*.0003),name+' exceeds 0.01 percent boundary-pixel budget');
 }for(const key of ['textures','resolution','lights'])assert.deepEqual(pair[1].graphics[key],pair[0].graphics[key],name+' '+key);assert.deepEqual(pair[1].player,pair[0].player);assert.deepEqual(pair[1].geometry,pair[0].geometry,'Original static triangle attributes changed');assert(pair[1].bindings.length>100);assert(pair[1].proof.vertices>100000);assert(pair[1].proof.parts>1000);fs.writeFileSync(out+'/partial.json',JSON.stringify({rows,errors},null,2));}
 for(const f of quick?fixtures.slice(0,3):fixtures){for(const p of pages)await place(p,f);await compare(f[0]);}
 if(!quick){
  for(const time of [1,7.2,16.4,41,64,96]){for(const p of pages)await place(p,fixtures[1],time);await compare('pressure-'+time);}
  for(const elapsed of [42,49,60]){for(const p of pages)await place(p,fixtures[1],26.3,elapsed);await compare('flood-'+elapsed);}
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){for(const p of pages){await p.setViewportSize({width,height});await place(p,fixtures[2]);}await compare('pump-'+width);}
  for(const p of pages){await p.setViewportSize({width:2560,height:1600});await place(p,fixtures[2]);await p.keyboard.down('e');}
  for(const ms of [80,150,250,700,2000]){for(const p of pages)await p.evaluate(async ms=>{advanceTime(ms);await __underGreen.whenPresented();},ms);await compare('pump-motion-'+ms);}
  for(const p of pages){await p.keyboard.up('e');assert(await p.evaluate(()=>__underGreen.run.bypass),'E failed to open bypass');}
  for(const p of pages){await place(p,fixtures[5]);await p.evaluate(()=>{__underGreen.run.bypass=true;__underGreen.run.bypassAt=20;__underGreen.run.lessonCrossed=true;advanceTime(0)});await p.keyboard.press('e');}
  for(const ms of [80,250,500,800]){for(const p of pages)await p.evaluate(async ms=>{advanceTime(ms);await __underGreen.whenPresented();},ms);await compare('release-motion-'+ms);}
  for(const key of ['q','c']){for(const p of pages){await place(p,fixtures[2]);await p.keyboard.down(key);await p.evaluate(async()=>{advanceTime(250);await __underGreen.whenPresented()})}await compare('input-'+key);for(const p of pages)await p.keyboard.up(key);}
  for(const p of pages){await place(p,fixtures[1]);await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(p,fixtures[1]);}await compare('reduced');
 }
 const lifecycle=await pages[1].evaluate(()=>{const {bindings,owned}=__pieceBindings,pairs=bindings.map(b=>[b.mesh,b.original]);let disposed=0;const expected=owned.length;for(const m of owned)m.addEventListener('dispose',()=>disposed++);__pieceProbe.practicalLighting.dispose();return {expected,disposed,restored:pairs.every(([mesh,original])=>mesh.material===original),bindings:bindings.length};});assert.equal(lifecycle.disposed,lifecycle.expected);assert(lifecycle.restored&&lifecycle.bindings===0);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,quick,rows,lifecycle,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,bindings:rows[0].pair[1].bindings.length,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
