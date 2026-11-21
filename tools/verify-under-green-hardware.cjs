const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade-local/pass52-hardware/${software?'software':'hardware'}`;
const fixtures=[['gallery',0,8,0,.1],['crossing',0,19,0,-.05],['bunker',-29.5,65,Math.PI,.15],['pump',-23.4,42,-1,.05],['pump-return',-15,46,Math.PI/2,.05],['range',12,35,Math.PI,.05],['keeper',12,13.5,-2.4,.05],['door',0,44,Math.PI,0]];
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],audits=[],errors=[];try{
 {const before=false;
  const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await require('./lib/legacy-under-green-probe.cjs').exposeScene(p,'__hardware','scene,renderer,camera,materials,machinerySurfaces');
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  async function place(f,elapsed=0){await p.evaluate(async({f,elapsed})=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js');const r=createRun();if(solid({x:f[1],y:f[2]},.3))throw Error('Solid fixture '+f[0]);r.mode='playing';r.time=26.3;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,elapsed});}
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:s.graphics});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
  for(const f of fixtures){await place(f);await shot(f[0]);}
  const audit=await p.evaluate(()=>{
   const names=['iron','steel','brass','rust','red'],{scene,materials,machinerySurfaces}=__hardware;
   const hash=a=>{let h=2166136261;const b=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(const v of b)h=Math.imul(h^v,16777619);return h>>>0;};
   const meshes=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&names.includes(o.name)){meshes.push({name:o.name,position:hash(o.geometry.attributes.position.array),index:o.geometry.index?hash(o.geometry.index.array):null,matrix:o.matrixWorld.elements});}});
   return {meshes,materials:names.map(name=>{const m=materials[name],source=m.userData.drainHardwareSource;return {name,type:m.type,size:[m.map.image.width,m.map.image.height],span:m.userData.drainUVMetres||2,source,shared:source?m.map===machinerySurfaces.sets[source].map:false,bump:!!m.bumpMap,transparent:m.transparent};})};
  });audits.push(audit);assert(audit.meshes.length>10);
  if(!before){for(const m of audit.materials){assert.equal(m.type,'MeshLambertMaterial');assert.equal(m.shared,true);assert.deepEqual(m.size,[627,627]);assert.equal(m.span,2);assert.equal(m.bump,false);assert.equal(m.transparent,false);}
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const f of [fixtures[1],fixtures[3],fixtures[6]]){await place(f);await shot('responsive-'+f[0]);}}
   await p.setViewportSize({width:2560,height:1600});await place(fixtures[1],49);await shot('flood');
   await place(fixtures[0]);const initial=await p.screenshot({type:'png'});for(let i=0;i<8;i++)await p.evaluate(async()=>{__underGreen.run.player.yaw+=.2;advanceTime(0);await __underGreen.whenPresented();});await place(fixtures[0]);assert(initial.equals(await p.screenshot({type:'png'})),'Material moves with camera');
   await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');await p.evaluate(()=>advanceTime(300));
   await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#comfort .rc-settings-tabs button',{hasText:'Camera'}).click();await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[3]);await shot('reduced');
  }
  await p.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,audits,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,hardwareMeshes:audits[0].meshes.length,resources:rows.filter(r=>r.name==='pump').map(r=>({before:r.before,textures:r.graphics.textures,draws:r.graphics.draws,programs:r.graphics.programs}))}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
