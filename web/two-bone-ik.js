import * as THREE from './vendor/three/three.module.js';
// Rotate a two-link skeletal chain toward a grip, preserving its bone lengths.
// The pole is an authored world-space bend direction, not a player target.
export function solveTwoBoneGrip(upper,lower,hand,target,pole,handWorldRotation){
 upper.updateWorldMatrix(true,true);
 const a=upper.getWorldPosition(new THREE.Vector3()),b=lower.getWorldPosition(new THREE.Vector3()),c=hand.getWorldPosition(new THREE.Vector3());
 const first=a.distanceTo(b),second=b.distanceTo(c),axis=target.clone().sub(a),requested=axis.length();
 const reach=Math.max(Math.abs(first-second)+.0001,Math.min(first+second-.0001,requested));axis.normalize();
 const bend=pole.clone().addScaledVector(axis,-pole.dot(axis)).normalize();
 const along=(first*first+reach*reach-second*second)/(2*reach),side=Math.sqrt(Math.max(0,first*first-along*along));
 const elbow=a.clone().addScaledVector(axis,along).addScaledVector(bend,side),grip=a.clone().addScaledVector(axis,reach);
 function pointBone(bone,child,destination){
  const origin=bone.getWorldPosition(new THREE.Vector3()),current=child.getWorldPosition(new THREE.Vector3()).sub(origin).normalize(),desired=destination.clone().sub(origin).normalize();
  const rotation=new THREE.Quaternion().setFromUnitVectors(current,desired).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation));bone.updateWorldMatrix(false,true);
 }
 pointBone(upper,lower,elbow);pointBone(lower,hand,grip);
 hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(handWorldRotation));hand.updateWorldMatrix(false,true);
 return hand.getWorldPosition(new THREE.Vector3()).distanceTo(target);
}
