import * as THREE from './vendor/three/three.module.js';

// Authored course pines stand on solid cover. Keep hanging needle cards that
// extend beyond that cover above the walking camera; off-course trees retain
// their original form. Run after worker/baked geometry is ready, before batching.
export function raiseCourseCanopy(root, {rx,rz,height=2.4}) {
  root.updateMatrixWorld(true);
  const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert();
  const transform=new THREE.Matrix4(),point=new THREE.Vector3();
  let raised=0,minRaised=Infinity,total=0;
  for(const mesh of root.children){
    if(!mesh.isMesh||mesh.material.userData.needleIndex===undefined)continue;
    total++;transform.multiplyMatrices(inverse,mesh.matrixWorld);
    const positions=mesh.geometry.attributes.position;let minY=Infinity,outside=false;
    for(let i=0;i<positions.count;i++){
      point.fromBufferAttribute(positions,i).applyMatrix4(transform);minY=Math.min(minY,point.y);
      if((point.x/rx)**2+(point.z/rz)**2>1)outside=true;
    }
    if(outside&&minY<height){mesh.position.y+=height-minY;raised++;minRaised=Math.min(minRaised,height);}
  }
  root.updateMatrixWorld(true);
  return {raised,total,clearance:height,minRaised:Number.isFinite(minRaised)?minRaised:null};
}
