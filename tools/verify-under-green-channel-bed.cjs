// Exercise the production water shader: refracted floor position, attenuation,
// and opaque depth ordering against a transparent actor-like surface.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass64/bed-${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[];try{
 const p=await b.newPage();p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/under-green-water.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-water.js','utf8').replace(/ return \{\r?\n  update\(r/,' window.__bedSurfaces=surfaces; return {\n  update(r')}));
 await p.route('**/under-green-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-scene.js','utf8').replace(' return {draw,inspectCastShadow:',' window.__bedRenderer=renderer; return {draw,inspectCastShadow:')}));
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));
 const report=await p.evaluate(async()=>{
  const T=await import('./vendor/three/three.module.js'),renderer=__bedRenderer,old=renderer.getRenderTarget(),auto=renderer.autoClear;
  const target=new T.WebGLRenderTarget(65,65,{colorSpace:T.NoColorSpace,depthBuffer:true}),samples=[];
  const source=__bedSurfaces[0].material,compile=source.onBeforeCompile,key=source.customProgramCacheKey();
  const material=source.clone();material.fog=false;material.toneMapped=false;
  material.onBeforeCompile=function(shader,r){compile.call(this,shader,r);shader.vertexShader=shader.vertexShader.replace('transformed.y+=','transformed.y+=0.*');shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=vec3(fract(bedHit.x*.1),fract(-bedHit.z*.1),bedVisibility);\n#include <opaque_fragment>');};
  material.customProgramCacheKey=()=>key+'-bed-diagnostic';
  const geometry=new T.PlaneGeometry(4,4);geometry.rotateX(-Math.PI/2);
  const mesh=new T.Mesh(geometry,material),scene=new T.Scene(),camera=new T.PerspectiveCamera(55,1,.01,30),pixel=new Uint8Array(4);scene.add(mesh);
  try{renderer.autoClear=true;
   for(const yaw of [0,-Math.PI/2])for(const height of [.025,.105])for(const [run,rise]of [[.5,1.5],[2,1.5],[8,1.5],[2,3]])for(const side of [-1,1]){
    mesh.position.set(2,height,-3);mesh.rotation.y=yaw;mesh.updateMatrixWorld();
    const point=new T.Vector3(.17,0,-.23).applyMatrix4(mesh.matrixWorld);camera.position.copy(point).add(new T.Vector3(run*side,rise,run*.31));camera.lookAt(point);camera.rotateZ(side*.19);camera.updateMatrixWorld();
    renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,32,32,1,1,pixel);
    const view=camera.position.clone().sub(point).normalize(),eta=.7502,ray=new T.Vector3(-eta*view.x,-Math.sqrt(1-eta*eta*(1-view.y*view.y)),-eta*view.z),path=height/-ray.y,hit=point.clone().addScaledVector(ray,path);
    const visibility=Math.exp(-path*14)*(1-Math.pow(1-view.y,5)),expected=[hit.x*.1,-hit.z*.1,visibility],actual=Array.from(pixel.slice(0,3),v=>v/255);
    samples.push({yaw,height,run,rise,side,expected,actual,error:Math.max(...actual.map((v,i)=>Math.abs(v-expected[i])))});
   }
   const water=source.clone();water.onBeforeCompile=compile;water.customProgramCacheKey=()=>key;water.fog=false;water.toneMapped=false;mesh.material=water;mesh.position.set(0,.105,0);mesh.rotation.y=0;
   camera.position.set(0,3,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);camera.updateMatrixWorld();
   const actorMat=new T.MeshBasicMaterial({color:0xff00ff,transparent:true,opacity:.6,depthWrite:false,side:T.DoubleSide,toneMapped:false}),actorGeometry=new T.PlaneGeometry(1,1);actorGeometry.rotateX(-Math.PI/2);const actor=new T.Mesh(actorGeometry,actorMat);scene.add(actor);
   const read=()=>{renderer.setRenderTarget(target);renderer.render(scene,camera);const a=new Uint8Array(65*65*4);renderer.readRenderTargetPixels(target,0,0,65,65,a);return a;};
   actor.visible=false;const empty=read();actor.visible=true;actor.position.y=.02;const below=read();actor.position.y=.20;const above=read();
   const occlusion={opaque:!source.transparent,depthWrite:source.depthWrite,belowExact:empty.every((v,i)=>v===below[i]),aboveChanges:empty.some((v,i)=>v!==above[i])};
   water.dispose();actorMat.dispose();actorGeometry.dispose();
   return {samples,occlusion};
  }finally{renderer.setRenderTarget(old);renderer.autoClear=auto;target.dispose();geometry.dispose();material.dispose();}
 });
 fs.writeFileSync(out+'/report.json',JSON.stringify({software,...report,errors},null,2));assert.deepEqual(errors,[]);assert(report.samples.every(s=>s.error<.008),'Refracted bed GPU result differs from ray/floor oracle');assert.deepEqual(report.occlusion,{opaque:true,depthWrite:true,belowExact:true,aboveChanges:true});
 console.log(JSON.stringify({passed:true,software,samples:report.samples.length,maxError:Math.max(...report.samples.map(s=>s.error)),occlusion:report.occlusion}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
