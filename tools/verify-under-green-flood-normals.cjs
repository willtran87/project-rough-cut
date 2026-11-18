const fs=require('node:fs'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade-local/pass45-flood-normals/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[],errors=[];try{
 for(const before of [true,false]){
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const name of ['under-green-flood-scene','under-green-scene'])await p.route('**/'+name+'.js',r=>{
   let s=fs.readFileSync(before&&name!=='under-green-scene'?`output/under-green/visual-upgrade-local/pass45-source/${name}-before.js`:`web/${name}.js`,'utf8');
   if(name==='under-green-flood-scene')s=s.replace(' // A single batched',' window.__normalFlood=floodParts.root;\n // A single batched');
   if(name==='under-green-scene')s=s.replace(' return {draw,inspectCastShadow:',' window.__normalRenderer=renderer; return {draw,inspectCastShadow:');
   return r.fulfill({contentType:'application/javascript',body:s});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));
  const samples=await p.evaluate(async({before})=>{
   const T=await import('./vendor/three/three.module.js'),renderer=__normalRenderer,oldTarget=renderer.getRenderTarget(),oldAuto=renderer.autoClear,target=new T.WebGLRenderTarget(65,65,{type:T.UnsignedByteType,colorSpace:T.NoColorSpace,depthBuffer:true}),rows=[];
   const defs=[{name:'flood',material:__normalFlood.children[0].material,yaw:0}];
   try{renderer.autoClear=true;
    for(const def of defs){
     const puddle=def.name==='puddle',mat=def.material.clone(),compile=def.material.onBeforeCompile,key=def.material.customProgramCacheKey(),clock={value:0};mat.transparent=false;mat.opacity=1;mat.fog=false;mat.toneMapped=false;mat.depthWrite=true;
     mat.onBeforeCompile=function(shader,r){compile.call(this,shader,r);shader.uniforms.floodTime=clock;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=inverseTransformDirection(normal,viewMatrix)*.5+.5;\n#include <opaque_fragment>');};
     mat.customProgramCacheKey=()=>key+'-world-normal-diagnostic-'+def.name;
     const geometry=new T.PlaneGeometry(4,4);geometry.rotateX(-Math.PI/2);const mesh=new T.Mesh(geometry,mat);mesh.rotation.y=def.yaw;mesh.scale.set(1.3,1,.7);mesh.updateMatrixWorld();const scene=new T.Scene();scene.add(mesh,new T.PointLight(0xffffff,0));
     const point=new T.Vector3(.17,0,-.23),worldPoint=point.clone().applyMatrix4(mesh.matrixWorld),worldNormalMatrix=new T.Matrix3().getNormalMatrix(mesh.matrixWorld),camera=new T.PerspectiveCamera(55,1,.05,20),pixel=new Uint8Array(4);
     for(const time of [41,49,60]){
      clock.value=time;
      const h=(x,z)=>.006*Math.sin(x*3.1+z*1.2-time*.42)+.004*Math.sin(z*2.7-x*.9-time*.36),e=.00001;
      const nx=before?0:-(h(point.x+e,point.z)-h(point.x-e,point.z))/(2*e),nz=before?0:-(h(point.x,point.z+e)-h(point.x,point.z-e))/(2*e);
      for(let pose=0;pose<6;pose++){
       const yaw=pose*Math.PI/2+.23,height=pose>=6?-1.5:pose>=4?2.8:1.5;
       camera.position.copy(worldPoint).add(new T.Vector3(Math.sin(yaw)*2,height,Math.cos(yaw)*2));camera.lookAt(worldPoint);camera.rotateZ(pose%2?.19:0);camera.updateMatrixWorld();
       renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,32,32,1,1,pixel);
       const expected=new T.Vector3(nx,1,nz).applyMatrix3(worldNormalMatrix).normalize().multiplyScalar(height<0?-1:1),actual=new T.Vector3(...Array.from(pixel.slice(0,3),v=>v/255*2-1));
       rows.push({kind:def.name,time,pose,pixel:Array.from(pixel),expected:expected.toArray(),actual:actual.toArray(),error:actual.distanceTo(expected)});
      }
     }
     mat.dispose();geometry.dispose();
    }
   }finally{renderer.setRenderTarget(oldTarget);renderer.autoClear=oldAuto;target.dispose();}
   return rows;
  },{before});
  fs.writeFileSync(out+'/errors.json',JSON.stringify(errors,null,2));assert.deepEqual(errors,[],'Diagnostic shaders must compile');assert(samples.every(s=>s.pixel.slice(0,3).some(v=>v>0)),'Normal diagnostic rendered an empty target');const maxError=Math.max(...samples.map(s=>s.error));fs.writeFileSync(out+'/'+(before?'before':'after')+'-samples.json',JSON.stringify(samples,null,2));if(!before&&maxError>=.009){console.log(JSON.stringify(errors));}if(!before&&maxError>=.009)console.log(JSON.stringify([...samples].sort((a,b)=>b.error-a.error).slice(0,5)));assert(maxError<.009,'GPU normals disagree with physical surface');results.push({before,maxError,samples});await p.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,results,errors},null,2));console.log(JSON.stringify({passed:true,software,results:results.map(r=>({before:r.before,samples:r.samples.length,maxError:r.maxError}))}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
