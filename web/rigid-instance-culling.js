import * as THREE from './vendor/three/three.module.js';

// Opt-in only: source vertices are immutable, instance transforms are rigid/TRS,
// and the vertex shader does not displace them. Keep every simulated instance;
// compact only the main-camera draw stream, in original order. Shadow passes
// retain the complete source stream, including offscreen casters.
export function createRigidInstanceCulling(scene){
 const entries=[],frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),matrix=new THREE.Matrix4(),sphere=new THREE.Sphere();
 let enabled=true,submitted=0,active=0,uploaded=0;
 scene.traverse(mesh=>{
  const source=mesh.geometry;
  if(!mesh.userData.rigidInstanceBounds||!mesh.isInstancedMesh||!source||source.attributes.position.count>100||Array.isArray(mesh.material)||!(mesh.material.isMeshBasicMaterial||mesh.material.isMeshLambertMaterial)||Object.values(source.attributes).some(a=>a.isInterleavedBufferAttribute||a.isInstancedBufferAttribute))return;
  source.computeBoundingSphere();const geometry=source.clone(),packed=new THREE.InstancedBufferAttribute(new Float32Array(mesh.instanceMatrix.array.length),16).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('instanceMatrix',packed);mesh.geometry=geometry;
  const e={mesh,source,geometry,packed,color:null,visible:0,count:0,before:mesh.onBeforeRender,after:mesh.onAfterRender,beforeShadow:mesh.onBeforeShadow,afterShadow:mesh.onAfterShadow};
  mesh.onBeforeRender=function(...args){e.before.apply(this,args);e.count=this.count;this.count=enabled?e.visible:e.count;};
  mesh.onAfterRender=function(...args){this.count=e.count;e.after.apply(this,args);};
  // Offscreen instances may still cast visible shadows. The source matrices
  // remain uploaded by Three's normal InstancedMesh update; use them intact.
  mesh.onBeforeShadow=function(...args){geometry.setAttribute('instanceMatrix',this.instanceMatrix);if(this.instanceColor)geometry.setAttribute('instanceColor',this.instanceColor);e.beforeShadow.apply(this,args);};
  mesh.onAfterShadow=function(...args){geometry.setAttribute('instanceMatrix',packed);if(e.color)geometry.setAttribute('instanceColor',e.color);e.afterShadow.apply(this,args);};
  entries.push(e);
 });
 function update(camera){
  camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);
  submitted=active=uploaded=0;
  if(!enabled)return;
  for(const e of entries){
   const {mesh,source,packed}=e;mesh.updateWorldMatrix(true,false);active+=mesh.count;let count=0,first=Infinity,last=0,colorFirst=Infinity,colorLast=0;
   if(mesh.instanceColor&&!e.color){e.color=new THREE.InstancedBufferAttribute(new Float32Array(mesh.instanceColor.array.length),3).setUsage(THREE.DynamicDrawUsage);e.geometry.setAttribute('instanceColor',e.color);}
   for(let id=0;id<mesh.count;id++){
    // Leave a centimetre beyond the exact source bound for GPU float rounding.
    matrix.fromArray(mesh.instanceMatrix.array,id*16);sphere.copy(source.boundingSphere).applyMatrix4(matrix).applyMatrix4(mesh.matrixWorld);sphere.radius+=.01;
    if(enabled&&!frustum.intersectsSphere(sphere))continue;
    for(let k=0;k<16;k++){const i=count*16+k,value=mesh.instanceMatrix.array[id*16+k];if(packed.array[i]!==value){packed.array[i]=value;first=Math.min(first,i);last=i+1;}}
    if(e.color)for(let k=0;k<3;k++){const i=count*3+k,value=mesh.instanceColor.array[id*3+k];if(e.color.array[i]!==value){e.color.array[i]=value;colorFirst=Math.min(colorFirst,i);colorLast=i+1;}}
    count++;
   }
   if(last>first){packed.addUpdateRange(first,last-first);packed.needsUpdate=true;uploaded+=(last-first)*4;}
   if(colorLast>colorFirst){e.color.addUpdateRange(colorFirst,colorLast-colorFirst);e.color.needsUpdate=true;uploaded+=(colorLast-colorFirst)*4;}
   e.visible=count;submitted+=count;
  }
 }
 return{update,setEnabled(value){enabled=!!value;for(const e of entries)e.mesh.geometry=enabled?e.geometry:e.source;},stats:()=>({batches:entries.length,active,submitted,uploadedBytes:uploaded}),dispose(){for(const e of entries){Object.assign(e.mesh,{geometry:e.source,onBeforeRender:e.before,onAfterRender:e.after,onBeforeShadow:e.beforeShadow,onAfterShadow:e.afterShadow});e.geometry.dispose();}entries.length=0;}};
}
