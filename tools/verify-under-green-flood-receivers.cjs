const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade-local/pass46-receivers/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/under-green-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-scene.js','utf8').replace(' return {draw,inspectCastShadow:',' window.__wetProbe={scene,renderer,flood,wetGround}; return {draw,inspectCastShadow:')}));
 await page.goto('http://127.0.0.1:4187/under-green.html?test');await page.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await page.evaluate(()=>advanceTime(0));
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three/three.module.js'),{createRun}=await import('./under-green-sim.js'),{scene,renderer,flood}=__wetProbe;
  const bound=flood.inspectReceivers(),receivers=bound.map(v=>scene.getObjectByProperty('uuid',v.uuid)),names=[...new Set(bound.map(v=>v.name))];
  const sources=['root','machineIron','keeperStone'].map(name=>{const mesh=receivers.find(m=>m.name===name);if(!mesh)throw Error('Missing real receiver '+name+' among '+names);return {name,mesh};});
  const exclusions=[];scene.traverse(o=>{if(o.isMesh&&o.material?.customProgramCacheKey?.().includes('flood-receiver')&&(o.material.transparent||o.isSkinnedMesh||o.isInstancedMesh||o.material.userData.drainColorRole==='water'))exclusions.push(o.name);});
  const oldTarget=renderer.getRenderTarget(),oldAuto=renderer.autoClear,target=new T.WebGLRenderTarget(33,33,{colorSpace:T.NoColorSpace}),pixel=new Uint8Array(4),samples=[];renderer.autoClear=true;
  try{for(const source of sources){
   const original=source.mesh.material,mat=original.clone(),compile=original.onBeforeCompile,key=original.customProgramCacheKey();mat.fog=false;mat.toneMapped=false;
   mat.onBeforeCompile=function(s,r){compile.call(this,s,r);s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=vec3(receiverWet,.5,receiverContact);\n#include <opaque_fragment>');};mat.customProgramCacheKey=()=>key+'-wet-mask-diagnostic';
   const g=new T.PlaneGeometry(2,2),m=new T.Mesh(g,mat);m.position.set(2.1,.3,-11);m.rotation.y=.37;m.scale.set(1.2,1.1,.9);m.updateMatrixWorld();const diagnostic=new T.Scene();diagnostic.add(m,new T.PointLight(0xffffff,0));const camera=new T.PerspectiveCamera(45,1,.01,10);
   for(const elapsed of [0,42,49,60,70,90,99,0]){
    const run=createRun();run.elapsed=elapsed;flood.update(run,false);const state=flood.stats();
    const checks=[.05,.12,.30,.45,.65].map(height=>({height,kind:'body'}));if(state.depth>.006)checks.push({height:state.depth,kind:'line'},{height:state.depth+.03,kind:'above'});
    for(const {height,kind} of checks){
     const point=new T.Vector3(.13,(height-.3)/1.1,0).applyMatrix4(m.matrixWorld);camera.position.copy(point).add(new T.Vector3(Math.sin(.37)*2,0,Math.cos(.37)*2));camera.lookAt(point);camera.updateMatrixWorld();
     renderer.setRenderTarget(target);renderer.render(diagnostic,camera);renderer.readRenderTargetPixels(target,16,16,1,1,pixel);
     // Sample well away from the irregular 18mm edge; these points must be
     // fully wet up to the real peak, dry above it, then fade after recession.
     const expected=height<state.wallFilm.dampHeight-.025?state.wallFilm.fade:0;
     samples.push({source:source.name,elapsed,height,kind,expected,pixel:Array.from(pixel),waterline:state.depth,dampTop:state.wallFilm.dampHeight});
    }
   }
   mat.dispose();g.dispose();
  }}finally{renderer.setRenderTarget(oldTarget);renderer.autoClear=oldAuto;target.dispose();}
  const {WATERS,waterState,floorLayout,onFloor}=await import('./under-green-course.js'),{SHALLOW_WATER_HEIGHT}=await import('./under-green-wet-ground.js');
  const root=scene.getObjectByName('Drain flood'),leaves=scene.getObjectByName('Drainage leaf clumps'),layout=floorLayout(),matrix=new T.Matrix4(),point=new T.Vector3();let leafSamples=0,maxDepth=0;
  const cycle=[];
  for(let elapsed=0;elapsed<=100;elapsed+=.5){
   const run=createRun();run.elapsed=elapsed;run.time=elapsed;const states=WATERS.map(w=>waterState(w,elapsed,false,-99));flood.update(run,false);__wetProbe.wetGround.update(run,states,false);scene.updateMatrixWorld(true);const f=flood.stats(),wet=__wetProbe.wetGround.stats();maxDepth=Math.max(maxDepth,f.depth);
   if(Math.abs(root.position.y-f.depth)>1e-9)throw Error('Rendered flood height differs from depth');
   let index=0;for(const clump of wet.positions){const bed=clump.channel<0?SHALLOW_WATER_HEIGHT:.025+states[clump.channel].level*.08,expected=Math.max(bed,f.depth)+.003;for(let k=0;k<(clump.channel<0?4:5);k++){leaves.getMatrixAt(index++,matrix);point.setFromMatrixPosition(matrix);if(Math.abs(point.y-expected)>1e-6)throw Error('Debris detached from physical water');leafSamples++;}}
   if(index!==leaves.count)throw Error('Unverified debris instances');cycle.push({elapsed,depth:f.depth,dampHeight:f.wallFilm.dampHeight,fade:f.wallFilm.fade});
  }
  const run=createRun();run.elapsed=49;flood.update(run,false);scene.updateMatrixWorld(true);
  let area=0,triangles=0;for(const mesh of root.children){const p=mesh.geometry.attributes.position,ix=mesh.geometry.index.array;for(let i=0;i<ix.length;i+=3){const a=new T.Vector3().fromBufferAttribute(p,ix[i]).applyMatrix4(mesh.matrixWorld),b=new T.Vector3().fromBufferAttribute(p,ix[i+1]).applyMatrix4(mesh.matrixWorld),c=new T.Vector3().fromBufferAttribute(p,ix[i+2]).applyMatrix4(mesh.matrixWorld);if([a,b,c].some(v=>Math.abs(v.y-.38)>1e-6))throw Error('Flood surface not level');const centroid=a.clone().add(b).add(c).multiplyScalar(1/3);if(!onFloor(centroid.x,-centroid.z))throw Error('Water outside floor union');area+=b.clone().sub(a).cross(c.clone().sub(a)).length()*.5;triangles++;}}
  const expectedArea=layout.tiles.reduce((s,t)=>s+t.w*t.d,0);if(Math.abs(area-expectedArea)>.001)throw Error('Flood footprint changed');
  const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0);for(const tile of layout.tiles){ray.set(new T.Vector3(tile.x,1,-tile.y),down);const hits=ray.intersectObject(root,true);if(!hits.length||Math.abs(hits[0].point.y-.38)>1e-6)throw Error('Missing flood tile');}
  const protectedNames=['keeperPaper','keeperLog','keeperPlan','keeperRack','keeperBook'],protectedObjects=[],opaqueWalls=[];
  scene.traverse(m=>{if(!m.isMesh)return;if(protectedNames.includes(m.name)){m.geometry.computeBoundingBox();const box=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);if(box.min.y<=maxDepth)throw Error('Protected records submerged');protectedObjects.push({name:m.name,minHeight:box.min.y});}if(/^(stone|rootStone|keeperStone|bunkerStone|pumpStone|rangeStone)$/.test(m.name)){if(m.material.transparent||m.material.opacity!==1||!m.material.depthWrite||!m.material.depthTest)throw Error('Wall no longer opaque');opaqueWalls.push(m.name);}});
  if(!protectedNames.every(name=>protectedObjects.some(o=>o.name===name)))throw Error('Missing protected-object evidence');
  return {bound,names,exclusions,samples,cycle,physical:{leafSamples,leafCount:leaves.count,maxDepth,area,expectedArea,tiles:layout.tiles.length,triangles,protectedObjects,opaqueWalls:opaqueWalls.length}};
 });
 fs.writeFileSync(out+'/samples.json',JSON.stringify(result,null,2));fs.writeFileSync(out+'/errors.json',JSON.stringify(errors,null,2));assert.deepEqual(errors,[]);assert.deepEqual(result.exclusions,[]);
 for(const s of result.samples){assert(Math.abs(s.pixel[1]-128)<=1,'Diagnostic did not render');if(s.kind==='line'){assert(s.pixel[0]>20&&s.pixel[2]/255>.65,'Missing physical contact '+JSON.stringify(s));}else{assert(Math.abs(s.pixel[0]/255-s.expected)<.009,JSON.stringify(s));assert(s.pixel[2]<2,'Contact escaped waterline '+JSON.stringify(s));}}
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,...result,errors},null,2));console.log(JSON.stringify({passed:true,software,receivers:result.bound.length,samples:result.samples.length,physical:result.physical}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
