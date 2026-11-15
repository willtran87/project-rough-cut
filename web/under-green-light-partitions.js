import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';

// Preserve every authored vertex/UV while keeping far-apart wet surfaces out
// of a single lighting bound. Padding encloses the full physical flood travel.
export function partitionDrainSurfaces(scene,parts,material,name,padding=0){
 const cells=new Map(),center=new THREE.Vector3(),root=new THREE.Group();root.name=name;
 for(const part of parts){
  part.computeBoundingBox();part.boundingBox.getCenter(center);
  const key=Math.floor(center.x/12)+':'+Math.floor(center.z/12);
  if(!cells.has(key))cells.set(key,[]);cells.get(key).push(part);
 }
 for(const [key,pieces]of cells){
  const geometry=mergeIndexedGeometries(pieces),mesh=new THREE.Mesh(geometry,material);
  mesh.name=name+' '+key;mesh.userData.drainStaticLight=true;mesh.userData.drainLightPadding=padding;root.add(mesh);
 }
 parts.forEach(g=>g.dispose());scene.add(root);
 return {root,setRenderOrder(order){root.traverse(o=>o.renderOrder=order);},dispose(){root.traverse(o=>o.geometry?.dispose());root.removeFromParent();}};
}
