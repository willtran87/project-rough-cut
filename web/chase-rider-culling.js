import * as THREE from './vendor/three/three.module.js';

// The seated rig's actual weighted vertices stay within .895m of this
// center across the current chest/head animation envelope. Retain >.25m
// padding for interpolation and edge pixels. Bind-pose bounds on individual
// skinned meshes are not valid after the legs are seated.
export const CHASE_RIDER_CENTER=Object.freeze([0,1.3,0]);
export const CHASE_RIDER_RADIUS=1.15;
export function createChaseRiderCulling(rider){
 const local=new THREE.Sphere(new THREE.Vector3(...CHASE_RIDER_CENTER),CHASE_RIDER_RADIUS),world=local.clone(),meshes=[];let tests=0,rejected=0;
 rider.traverseVisible(o=>{if(o.isSkinnedMesh){meshes.push(o);o.frustumCulled=true;o.intersectsFrustum=frustum=>{tests++;const visible=frustum.intersectsSphere(world);if(!visible)rejected++;return visible;};}});
 return {update(){rider.updateWorldMatrix(true,false);world.copy(local).applyMatrix4(rider.matrixWorld);tests=rejected=0;},stats:()=>({meshes:meshes.length,tests,rejected,radius:world.radius,center:world.center.toArray()})};
}
