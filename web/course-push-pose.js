import * as THREE from './vendor/three/three.module.js';
import {solveTwoBoneGrip} from './two-bone-ik.js';

// Layer the close push over the traveled-distance gait. The mower grip stays
// fixed, and neither the hips nor legs are moved by the torso anticipation.
export function createCoursePushPose(root,bones){
  const spine=bones.get('Spine');
  const arms=['L','R'].map(side=>({upper:bones.get('UpperArm'+side),lower:bones.get('Forearm'+side),hand:bones.get('Hand'+side)}));
  const available=!!spine&&arms.every(a=>a.upper&&a.lower&&a.hand);
  const changed=available?[spine,...arms.flatMap(a=>[a.upper,a.lower,a.hand])]:[];
  const original=changed.map(b=>b.quaternion.clone());
  let applied=false,lean=0,lastTime=null;
  const state={available,lean:0,gripError:0};
  function restore(){
    if(!applied)return;
    changed.forEach((b,i)=>b.quaternion.copy(original[i]));applied=false;
  }
  function update(frame,elapsed){
    if(!available)return;
    if(lastTime!==null&&frame.time<lastTime)lean=0;
    lastTime=frame.time;
    const phase=frame.closeEscape?.phase;
    const target=phase==='warning'?.12:phase==='push'?.23:phase==='recovery'?-.025:0;
    lean=THREE.MathUtils.lerp(lean,target,1-Math.exp(-elapsed*12));
    if(Math.abs(lean)<1e-5&&target===0)lean=0;
    state.lean=lean;state.gripError=0;
    if(!lean)return;
    changed.forEach((b,i)=>original[i].copy(b.quaternion));applied=true;
    root.updateMatrixWorld(true);
    const rotation=root.getWorldQuaternion(new THREE.Quaternion());
    const grips=arms.map(a=>({position:a.hand.getWorldPosition(new THREE.Vector3()),rotation:a.hand.getWorldQuaternion(new THREE.Quaternion())}));
    const axis=new THREE.Vector3(1,0,0).applyQuaternion(rotation);
    const bent=new THREE.Quaternion().setFromAxisAngle(axis,-lean).multiply(spine.getWorldQuaternion(new THREE.Quaternion()));
    spine.quaternion.copy(spine.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(bent));
    spine.updateWorldMatrix(false,true);
    arms.forEach((arm,i)=>{
      const side=Math.sign(root.worldToLocal(grips[i].position.clone()).x);
      const pole=new THREE.Vector3(side*.8,-.4,.6).applyQuaternion(rotation);
      state.gripError=Math.max(state.gripError,solveTwoBoneGrip(arm.upper,arm.lower,arm.hand,grips[i].position,pole,grips[i].rotation));
    });
  }
  return {restore,update,stats:()=>({...state})};
}
