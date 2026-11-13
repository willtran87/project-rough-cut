import * as THREE from './vendor/three/three.module.js';
import {TEE_ANOMALY,teeAnomalyPose} from './course-first-impression.js';
// One tiny impossible ball. It is intentionally absent from all pickup, lure,
// collision and navigation collections; the optional apparition setting owns it.
export function createTeeAnomaly(parent,{scale,xScale}){
 const root=new THREE.Group();root.name='tee-anomaly';root.position.set(TEE_ANOMALY.x*xScale,0,-TEE_ANOMALY.y*scale);parent.add(root);
 const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.065,2),new THREE.MeshStandardMaterial({color:0xd3dfcc,roughness:.84,emissive:0x344b3b,emissiveIntensity:.34,transparent:true}));root.add(ball);
 // A planted shadow remains on the turf as the ball rises against gravity.
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.09,16),new THREE.MeshBasicMaterial({color:0x030b08,transparent:true,opacity:.65,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;root.add(shadow);root.visible=false;
 return {update(frame){
   const pose=teeAnomalyPose(frame.fx?.firstImpression,frame.reducedMotion);
   root.visible=!!frame.fx?.apparitions&&pose.visible;
   ball.position.y=pose.height;ball.scale.setScalar(pose.scale);ball.material.opacity=pose.opacity;
   shadow.material.opacity=.65*pose.opacity;
  },stats:()=>({visible:root.visible,position:ball.getWorldPosition(new THREE.Vector3()).toArray(),draws:root.visible?2:0})};
}
