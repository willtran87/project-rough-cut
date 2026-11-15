import * as THREE from './vendor/three/three.module.js';
import {drainRootGeometry} from './under-green-root-geometry.js';

// Carry the main root's bark, ridges and taper into short offshoots. The
// profile's maximum is 1.08, so this radius preserves the old radial envelope.
export function putSecondaryRoot(put,points,radius,position=[0,0,0]){
 const curve=new THREE.CatmullRomCurve3(points);
 const {geometry}=drainRootGeometry(curve,radius/1.08,null,{taper:.92,lowDetail:true});
 geometry.userData.preserveDrainUV=true;
 const anchor=points[0];geometry.translate(-anchor.x,-anchor.y,-anchor.z);
 put(geometry,'root',anchor.x+position[0],anchor.y+position[1],anchor.z+position[2]);
 geometry.dispose();
}

export function putCeilingOffshoot(put,x,z){
 // The same centre, rotation and endpoints as the former hanging cylinder.
 // Small lateral bends remain well above the camera and weapon envelope.
 const rotation=new THREE.Euler(.2,0,.3);
 const points=[[0,.35,0],[.008,.16,-.007],[-.01,-.08,.008],[0,-.35,0]].map(p=>new THREE.Vector3(...p).applyEuler(rotation));
 putSecondaryRoot(put,points,.045,[x,4.05,z]);
}
