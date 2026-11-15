import * as THREE from './vendor/three/three.module.js';
import {createRigidInstanceCulling} from './rigid-instance-culling.js';

// SwiftShader pays a separate scheduling cost for each small instance. Pack
// visible rigid effects into one indexed vertex stream per existing material.
// Preserve triangle order, UVs, colors, transforms and simulation ownership.
// The identity instance keeps the original material/shader and its live uniforms.
// Shadow casters retain the ordinary matrix culler and complete shadow stream.
// Only explicitly tagged, immutable, small rigid geometries are eligible.
export function createRigidVertexBatches(scene){
 const entries=[],frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),matrix=new THREE.Matrix4(),sphere=new THREE.Sphere();let enabled=true,visible=0,active=0,uploaded=0;
 scene.traverse(mesh=>{
  const source=mesh.geometry;
  if(!mesh.userData.rigidInstanceBounds||!mesh.isInstancedMesh||mesh.castShadow||!source||source.attributes.position.count>100||Array.isArray(mesh.material)||!(mesh.material.isMeshBasicMaterial||mesh.material.isMeshLambertMaterial)||Object.values(source.attributes).some(a=>a.isInterleavedBufferAttribute||a.isInstancedBufferAttribute))return;
  mesh.userData.rigidInstanceBounds=false;
  source.computeBoundingSphere();const geometry=new THREE.BufferGeometry(),n=source.attributes.position.count,capacity=mesh.instanceMatrix.count;
  for(const [name,a]of Object.entries(source.attributes)){
   const data=new a.array.constructor(a.array.length*capacity);for(let i=0;i<capacity;i++)data.set(a.array,i*a.array.length);
   const attr=new THREE.BufferAttribute(data,a.itemSize,a.normalized);if(name==='position'||name==='normal')attr.setUsage(THREE.DynamicDrawUsage);geometry.setAttribute(name,attr);
  }
  const original=source.index?.array||Uint32Array.from({length:n},(_,i)=>i),indices=new Uint32Array(original.length*capacity);
  for(let i=0;i<capacity;i++)for(let j=0;j<original.length;j++)indices[i*original.length+j]=original[j]+i*n;
  geometry.setIndex(new THREE.BufferAttribute(indices,1));geometry.boundingSphere=source.boundingSphere.clone();geometry.boundingBox=source.boundingBox?.clone()||null;geometry.setAttribute('instanceMatrix',new THREE.InstancedBufferAttribute(new Float32Array(new THREE.Matrix4().elements),16));
  const e={mesh,source,geometry,n,indexCount:original.length,visible:0,count:0,applied:true,before:mesh.onBeforeRender,after:mesh.onAfterRender,frustumCulled:mesh.frustumCulled};entries.push(e);
  mesh.geometry=geometry;mesh.frustumCulled=false;
  mesh.onBeforeRender=function(...args){e.before.apply(this,args);e.count=this.count;if(enabled&&e.applied){this.count=e.visible?1:0;geometry.setDrawRange(0,e.visible*e.indexCount);}};
  mesh.onAfterRender=function(...args){this.count=e.count;e.after.apply(this,args);};
 });
 const packed=createRigidInstanceCulling(scene);for(const e of entries)e.mesh.userData.rigidInstanceBounds=true;
 function update(camera){
  packed.update(camera);if(!enabled)return;camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);visible=active=uploaded=0;
  for(const e of entries){
   const {mesh,source,geometry,n}=e;mesh.updateWorldMatrix(true,false);active+=mesh.count;e.applied=!mesh.castShadow;mesh.geometry=e.applied?geometry:source;mesh.frustumCulled=e.applied?false:e.frustumCulled;if(!e.applied){e.visible=mesh.count;visible+=mesh.count;continue;}let count=0;
   if(mesh.instanceColor&&!geometry.attributes.instanceColor)geometry.setAttribute('instanceColor',new THREE.BufferAttribute(new Float32Array(n*mesh.instanceMatrix.count*3),3).setUsage(THREE.DynamicDrawUsage));
   const src=source.attributes.position.array,dst=geometry.attributes.position.array,sn=source.attributes.normal?.array,dn=geometry.attributes.normal?.array,colors=geometry.attributes.instanceColor?.array;
   for(let id=0;id<mesh.count;id++){
    matrix.fromArray(mesh.instanceMatrix.array,id*16);sphere.copy(source.boundingSphere).applyMatrix4(matrix).applyMatrix4(mesh.matrixWorld);sphere.radius+=.01;if(!frustum.intersectsSphere(sphere))continue;
    const m=matrix.elements,sx=m[0]*m[0]+m[1]*m[1]+m[2]*m[2]||1,sy=m[4]*m[4]+m[5]*m[5]+m[6]*m[6]||1,sz=m[8]*m[8]+m[9]*m[9]+m[10]*m[10]||1;
    for(let v=0;v<n;v++){
     const s=v*3,d=(count*n+v)*3,x=src[s],y=src[s+1],z=src[s+2];
     dst[d]=m[0]*x+m[4]*y+m[8]*z+m[12];dst[d+1]=m[1]*x+m[5]*y+m[9]*z+m[13];dst[d+2]=m[2]*x+m[6]*y+m[10]*z+m[14];
     if(dn){const nx=sn[s]/sx,ny=sn[s+1]/sy,nz=sn[s+2]/sz;dn[d]=m[0]*nx+m[4]*ny+m[8]*nz;dn[d+1]=m[1]*nx+m[5]*ny+m[9]*nz;dn[d+2]=m[2]*nx+m[6]*ny+m[10]*nz;}
     if(colors)for(let k=0;k<3;k++)colors[d+k]=mesh.instanceColor.array[id*3+k];
    }
    count++;
   }
   for(const name of ['position','normal','instanceColor']){const a=geometry.attributes[name];if(a&&count){a.addUpdateRange(0,count*n*3);a.needsUpdate=true;uploaded+=count*n*3*4;}}
   e.visible=count;visible+=count;
  }
 }
 return{update,setEnabled(value){enabled=!!value;packed.setEnabled(value);for(const e of entries){e.applied=!e.mesh.castShadow;e.mesh.geometry=enabled&&e.applied?e.geometry:e.source;e.mesh.frustumCulled=enabled&&e.applied?false:e.frustumCulled;}},stats:()=>{const s=packed.stats();return {...s,batches:s.batches+entries.length,active:s.active+active,submitted:s.submitted+visible,uploadedBytes:s.uploadedBytes+uploaded,bakedBatches:entries.length,bakedActive:active,bakedVisible:visible};},dispose(){packed.dispose();for(const e of entries){Object.assign(e.mesh,{geometry:e.source,frustumCulled:e.frustumCulled,onBeforeRender:e.before,onAfterRender:e.after});e.geometry.dispose();}}};
}
