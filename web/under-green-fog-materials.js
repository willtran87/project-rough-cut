import * as THREE from './vendor/three/three.module.js';

// Once linear fog is fully opaque, lighting and texture detail cannot affect
// the image. Keep drawing the original solid geometry/depth, using a cheaper
// material. Removing these meshes would expose distant unfogged effects.
export function createDrainFogMaterials(scene,meshes){
 const entries=[],materials=new Map(),changed=[];
 let enabled=true,lastCount=0;
 scene.updateMatrixWorld(true);
 for(const mesh of meshes){
  const m=mesh.material;
  if(!m||Array.isArray(m)||!m.fog||m.transparent||m.opacity!==1||!m.depthWrite||!m.depthTest||m.blending!==THREE.NormalBlending||m.alphaTest||m.alphaHash||m.alphaMap||m.displacementMap||m.clippingPlanes?.length||mesh.isSkinnedMesh||mesh.isInstancedMesh||mesh.morphTargetInfluences||mesh.castShadow)continue;
  mesh.geometry.computeBoundingBox();
  entries.push({mesh,bounds:mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)});
 }
 function restore(){for(const [mesh,material]of changed)mesh.material=material;changed.length=0;}
 return {
  setEnabled(value){enabled=!!value;restore();},
  apply(camera){
   restore();lastCount=0;
   if(!enabled||!scene.fog?.isFog)return;
   camera.updateMatrixWorld();const e=camera.matrixWorldInverse.elements,far=scene.fog.far+.01;
   for(const {mesh,bounds:b}of entries){
    if(!mesh.visible)continue;
    // Minimum view depth over the complete AABB. Radial distance would
    // incorrectly replace peripheral surfaces before their fog is opaque.
    const depth=-(e[2]*(e[2]>0?b.max.x:b.min.x)+e[6]*(e[6]>0?b.max.y:b.min.y)+e[10]*(e[10]>0?b.max.z:b.min.z)+e[14]);
    if(depth<far)continue;
    const original=mesh.material,key=[original.side,original.polygonOffset,original.polygonOffsetFactor,original.polygonOffsetUnits,original.depthFunc,original.colorWrite].join(':');
    let material=materials.get(key);
    if(!material){material=new THREE.MeshBasicMaterial({color:scene.fog.color,side:original.side,fog:true,toneMapped:false,depthFunc:original.depthFunc,colorWrite:original.colorWrite,polygonOffset:original.polygonOffset,polygonOffsetFactor:original.polygonOffsetFactor,polygonOffsetUnits:original.polygonOffsetUnits});materials.set(key,material);}
    material.color.copy(scene.fog.color);changed.push([mesh,original]);mesh.material=material;lastCount++;
   }
  },
  restore,
  stats:()=>({eligible:entries.length,replaced:lastCount,materials:materials.size,enabled}),
  dispose(){restore();materials.forEach(m=>m.dispose());materials.clear();entries.length=0;},
 };
}
