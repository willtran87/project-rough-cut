import * as THREE from './vendor/three/three.module.js';
import {compactVisibleIndices} from './visible-indices.js';

// Keep one draw and the original triangle order. Each shadow camera owns its
// own visibility query; the main view must never discard off-screen casters.
export function createReedCulling(mesh,sections,plants){
 const geometry=mesh.geometry,source=geometry.index.array.slice(),point=new THREE.Vector3();
 const byKey=new Map(),groups=[...sections.entries()].map(([key,indices])=>{
  const bounds=new THREE.Box3();let height=0;
  for(const i of indices){point.fromBufferAttribute(geometry.attributes.position,i);bounds.expandByPoint(point);height=Math.max(height,geometry.attributes.plantHeight.getX(i));}
  // Maximum simultaneous shader displacement: .065+1.02+2 horizontally,
  // .55+2 in depth, .12*height downwards. Include a numerical margin.
  bounds.expandByVector(new THREE.Vector3(3.1,height*.12+.01,2.56));
  const group={bounds,indices,visible:true};byKey.set(key,group);return group;
 });
 geometry.boundingBox=new THREE.Box3();for(const group of groups)geometry.boundingBox.union(group.bounds);
 geometry.boundingSphere=geometry.boundingBox.getBoundingSphere(new THREE.Sphere());
 const parts=plants.map(p=>({offset:p.indexStart,count:p.indexCount,drawOffset:p.indexStart,visible:true,group:byKey.get(p.sectionKey)}));
 const projection=new THREE.Matrix4(),frustum=new THREE.Frustum();let visible=groups.length,updates=0,uploaded=0;
 geometry.index.setUsage(THREE.DynamicDrawUsage);
 function select(camera){
  projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(mesh.matrixWorld);frustum.setFromProjectionMatrix(projection);visible=0;
  for(const group of groups){group.visible=!mesh.frustumCulled||frustum.intersectsBox(group.bounds);if(group.visible)visible++;}
  for(const part of parts)part.visible=part.group.visible;
  uploaded=compactVisibleIndices(geometry,parts,source);updates++;
 }
 mesh.onBeforeRender=(_renderer,_scene,camera)=>select(camera);
 mesh.onBeforeShadow=(_renderer,_object,_camera,shadowCamera)=>select(shadowCamera);
 return {groups,source,parts,stats:()=>({sections:groups.length,visibleSections:visible,updates,indexValuesUploaded:uploaded,singleDrawPerView:true})};
}
