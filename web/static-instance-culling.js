import * as THREE from './vendor/three/three.module.js';

// Static scenery only. Keep original instance order and transforms; submit only
// boxes that can touch the camera frustum. No distance/detail/density cutoff.
export function createStaticInstanceCulling(){
 const entries=[],frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),prior=new THREE.Matrix4();
 let valid=false,total=0,visible=0,uploaded=0,updates=0;
 function register(mesh,padding=.002){
  mesh.updateWorldMatrix(true,false);mesh.geometry.computeBoundingBox();
  const count=mesh.count,source=mesh.instanceMatrix.array.slice(0,count*16),colors=mesh.instanceColor?.array.slice(0,count*3),bounds=[];
  const transform=new THREE.Matrix4();
  for(let i=0;i<count;i++){
   transform.fromArray(source,i*16).premultiply(mesh.matrixWorld);
   bounds.push(mesh.geometry.boundingBox.clone().applyMatrix4(transform).expandByScalar(padding));
  }
  const packed=Int32Array.from({length:count},(_,i)=>i);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.instanceColor?.setUsage(THREE.DynamicDrawUsage);
  entries.push({mesh,count,source,colors,bounds,packed});total+=count;visible+=count;valid=false;
 }
 function compact(entry,all){
  const {mesh,count,source,colors,bounds,packed}=entry;let n=0,first=Infinity,last=-1;
  for(let i=0;i<count;i++)if(all||frustum.intersectsBox(bounds[i])){
   if(packed[n]!==i){
    mesh.instanceMatrix.array.set(source.subarray(i*16,i*16+16),n*16);
    if(colors)mesh.instanceColor.array.set(colors.subarray(i*3,i*3+3),n*3);
    packed[n]=i;first=Math.min(first,n);last=n;
   }
   n++;
  }
  mesh.count=n;visible+=n;
  if(last>=0){
   // Retain pending ranges if another camera update precedes GPU submission.
   mesh.instanceMatrix.addUpdateRange(first*16,(last-first+1)*16);mesh.instanceMatrix.needsUpdate=true;
   if(colors){mesh.instanceColor.addUpdateRange(first*3,(last-first+1)*3);mesh.instanceColor.needsUpdate=true;}
   uploaded+=(last-first+1)*16;
  }
 }
 function update(camera){
  uploaded=0;camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  if(valid&&projection.equals(prior))return;
  valid=true;prior.copy(projection);frustum.setFromProjectionMatrix(projection);visible=0;updates++;
  for(const entry of entries)compact(entry,false);
 }
 function restore(){visible=uploaded=0;for(const entry of entries)compact(entry,true);valid=false;}
 return {register,update,restore,stats:()=>({batches:entries.length,total,visible,matrixValuesUploaded:uploaded,updates})};
}
