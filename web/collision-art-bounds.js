import * as THREE from './vendor/three/three.module.js';
// Measure the currently owned render vertices, including transforms. This is
// an ownership/footprint audit, not a claim that a prop blocks the camera ray.
export function collisionArtBounds(id,owner,parts){
 const bounds=new THREE.Box3(),point=new THREE.Vector3();let visible=parts.length>0;
 for(const {mesh,start=0,count=mesh.geometry.attributes.position.count} of parts){
  mesh.updateWorldMatrix(true,false);
  let attached=false,inOwner=false;
  for(let p=mesh;p;p=p.parent){visible=visible&&p.visible;attached=attached||p.isScene;inOwner=inOwner||p===owner;}
  const g=mesh.geometry,materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  visible=visible&&attached&&inOwner&&materials.every(m=>m.visible)&&g.drawRange.start===0&&g.drawRange.count>=(g.index?.count||g.attributes.position.count);
  for(let i=start;i<start+count;i++){mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);bounds.expandByPoint(point);}
 }
 return {id,owner:owner.name,visible:!!visible,min:bounds.min.toArray(),max:bounds.max.toArray()};
}
