const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade-local/pass55-damp/${software?'software':'hardware'}`;
const files=JSON.parse(fs.readFileSync('output/under-green/visual-upgrade-local/pass55-source/files.json'));
const fixtures=[['gallery',0,8,0,.1],['crossing',0,19,0,-.05],['bark',0,13.5,-.875,.2],['bunker',-29.5,65,Math.PI,.15],['pump',-23.4,42,-1,.05],['pump-front',-25.1,40.8,-.45,-.12],['pump-return',-23.6,44,-2.2,-.12],['range',12,35,Math.PI,.05],['keeper',12,13.5,-2.4,.05]];
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],audits=[],errors=[],dark=[];try{
 for(const before of [true,false]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const name of files)await p.route('**/'+name+'.js',route=>{let s=fs.readFileSync(before?'output/under-green/visual-upgrade-local/pass55-source/'+name+'-before.js':'web/'+name+'.js','utf8');if(name==='under-green-scene'){const marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));s=s.replace(marker,' window.__finish={scene,renderer,materials,camera,practicalLighting,crafted};'+marker);}return route.fulfill({contentType:'application/javascript',body:s});});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  async function place(f,elapsed=0){await p.evaluate(async({f,elapsed})=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js');if(solid({x:f[1],y:f[2]},.3))throw Error('Solid fixture '+f[0]);const r=createRun();r.mode='playing';r.time=26.3;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,elapsed});}
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:s.graphics});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
  for(const f of fixtures){await place(f);await shot(f[0]);}
  await place(fixtures[4],49);await shot('flood-pump');
  const audit=await p.evaluate(()=>{
   const {scene,materials}=__finish,hash=a=>{let h=2166136261;const b=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(const v of b)h=Math.imul(h^v,16777619);return h>>>0;};
   const meshes=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&o.name)meshes.push({name:o.name,position:hash(o.geometry.attributes.position.array),index:o.geometry.index?hash(o.geometry.index.array):null,matrix:o.matrixWorld.elements});});
   const materialsInfo={};for(const [name,m]of Object.entries(materials))if(m.isMeshPhongMaterial)materialsInfo[name]={map:m.map?.image?[m.map.image.width,m.map.image.height]:null,specularMap:m.specularMap?.image?[m.specularMap.image.width,m.specularMap.image.height]:null,emissive:m.emissive.getHex()};const sourceHashes=Object.fromEntries(Object.entries(__finish.crafted.sets).map(([name,set])=>[name,{map:hash(set.map.image.getContext("2d").getImageData(0,0,set.map.image.width,set.map.image.height).data),wet:hash(set.wet.image.getContext("2d").getImageData(0,0,256,256).data)}]));return {meshes,materialsInfo,sourceHashes};
  });audits.push(audit);
  await place(fixtures[4]);await p.evaluate(async()=>{__finish.practicalLighting.setEnabled(false);__finish.scene.traverse(o=>{if(o.isLight){o.userData.savedIntensity=o.intensity;o.intensity=0;}});advanceTime(0);await __underGreen.whenPresented();});await shot('lights-out');dark.push(await p.screenshot({type:'png'}));
  await p.evaluate(()=>{__finish.practicalLighting.setEnabled(true);__finish.scene.traverse(o=>{if(o.isLight)o.intensity=o.userData.savedIntensity;});});
  if(!before){assert.equal(rows.at(-1).graphics.dampFinish.materials.length,15);assert(Object.values(audit.materialsInfo).every(m=>m.emissive===0));
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const f of [fixtures[4],fixtures[8]]){await place(f);await shot('responsive-'+f[0]);}}
   await p.setViewportSize({width:2560,height:1600});await place(fixtures[0]);await p.keyboard.down('c');await p.evaluate(()=>advanceTime(250));assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).player.eyeHeight<1.3);await shot('crouch');await p.keyboard.up('c');await p.evaluate(()=>advanceTime(300));await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');
   await place(fixtures[4]);const settled=await p.screenshot({type:'png'});
   for(const offset of [-.12,-.06,.06,.12]){await p.evaluate(async offset=>{__underGreen.run.player.yaw=-1+offset;advanceTime(0);await __underGreen.whenPresented();},offset);await shot('glint-turn-'+offset);}
   await place(fixtures[4]);assert(settled.equals(await p.screenshot({type:'png'})),'Material does not return with camera');
   for(const time of [6.1,8.2]){await p.evaluate(async time=>{__underGreen.run.time=time;advanceTime(0);await __underGreen.whenPresented();},time);await shot('lamp-dip-'+time);}
   await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[4]);await shot('reduced-motion');
  }
  await p.close();
 }
 assert.deepEqual(audits[0].meshes,audits[1].meshes,'Geometry changed');assert.deepEqual(audits[0].materialsInfo,audits[1].materialsInfo,'Material sources changed');for(const [name,v]of Object.entries(audits[0].sourceHashes)){assert.equal(v.map,audits[1].sourceHashes[name].map,'Pigment changed');if(['floor','mud'].includes(name))assert.equal(v.wet,audits[1].sourceHashes[name].wet,'Horizontal wetness changed');}assert(dark[0].equals(dark[1]),'Damp surfaces emit light without physical sources');assert.deepEqual(errors,[]);
 for(const a of rows.filter(r=>r.before)){const z=rows.find(r=>!r.before&&r.name===a.name);assert.deepEqual(a.player,z.player);for(const k of ['draws','triangles','textures'])assert.equal(a.graphics[k],z.graphics[k],k+' changed');assert.deepEqual(a.graphics.resolution,z.graphics.resolution);}
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,audits,lightsOutExact:true,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,meshes:audits[1].meshes.length,lightsOutExact:true}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
