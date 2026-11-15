import * as THREE from './vendor/three/three.module.js';
import {STAFF_CART_BODY,STAFF_SEAT_OFFSET} from './staff-cart-layout.js';

// The apparition is a fixed seated pose. A triangle whose every vertex lies
// strictly inside the same opaque convex body cannot contribute from any
// exterior camera. Keep entire intersecting parts, including boundary pixels.
// Do not apply this to the animated Joe or the breakable player's cart.
export function hideStaffCartInterior(figure){
 figure.updateMatrixWorld(true);
 const b=STAFF_CART_BODY,inset=.002,box=new THREE.Box3(new THREE.Vector3(b.x-b.width/2+inset,b.y-b.height/2+inset,b.z-b.depth/2+inset),new THREE.Vector3(b.x+b.width/2-inset,b.y+b.height/2-inset,b.z+b.depth/2-inset));
 const point=new THREE.Vector3(),offset=new THREE.Vector3(...STAFF_SEAT_OFFSET),inverse=figure.matrixWorld.clone().invert(),transform=new THREE.Matrix4(),skeletons=new Set(),parts=[];
 // The root is deliberately invisible during preparation. Its surviving
 // child meshes still need auditing before the first displayed frame.
 figure.traverse(mesh=>{
  if(!mesh.isSkinnedMesh||!mesh.visible)return;
  if(!skeletons.has(mesh.skeleton)){mesh.skeleton.update();skeletons.add(mesh.skeleton);}
  transform.multiplyMatrices(inverse,mesh.matrixWorld);
  const count=mesh.geometry.attributes.position.count;
  for(let i=0;i<count;i++)if(!box.containsPoint(mesh.getVertexPosition(i,point).applyMatrix4(transform).add(offset)))return;
  mesh.visible=false;mesh.userData.staffCartInterior=true;
  parts.push({name:mesh.name,vertices:count,triangles:mesh.geometry.index.count/3});
 });
 return parts;
}
