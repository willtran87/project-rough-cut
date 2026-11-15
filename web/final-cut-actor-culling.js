import * as THREE from './vendor/three/three.module.js';

// A conservative bound around Joe's animated root, verified against the actual
// weighted skin through ground movement, cab acting and both transfers.
// Individual bind-pose mesh bounds are unsafe once his limbs are posed by IK.
export const JOE_CULL_RADIUS=2.5;
export function createFinalCutActorCulling(actor){
 const sphere=new THREE.Sphere(new THREE.Vector3(),JOE_CULL_RADIUS),scale=new THREE.Vector3(),meshes=[];
 actor.traverse(o=>{if(o.isMesh){meshes.push(o);o.frustumCulled=true;o.intersectsFrustum=frustum=>frustum.intersectsSphere(sphere);}});
 return {update(){actor.getWorldPosition(sphere.center);actor.getWorldScale(scale);sphere.radius=JOE_CULL_RADIUS*Math.max(Math.abs(scale.x),Math.abs(scale.y),Math.abs(scale.z));},stats:()=>({center:sphere.center.toArray(),radius:sphere.radius,meshes:meshes.length})};
}
