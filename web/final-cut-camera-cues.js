import * as THREE from './vendor/three/three.module.js';
import {groundHeight} from './final-cut-arrival-layout.js';

// Short staged camera moves for the round start, a capture and the escape.
// They only repose the render camera after the normal view is computed: the
// simulation, saves, timers and panel text never see them. Wall-clock timed,
// so they are skipped under reduced motion and the deterministic test clock.
export const CUE_MS=Object.freeze({start:1400,caught:850,complete:6400});
const clamp01=v=>Math.max(0,Math.min(1,v)),outCubic=t=>1-(1-t)**3,smoother=t=>t*t*t*(t*(t*6-15)+10);
export function createFinalCutCameraCues(now=()=>performance.now()){
 const from=new THREE.Quaternion(),to=new THREE.Quaternion(),eye=new THREE.Vector3(),goal=new THREE.Vector3(),target=new THREE.Vector3(),look=new THREE.Matrix4(),euler=new THREE.Euler(0,0,0,'YXZ'),roll=new THREE.Quaternion(),forward=new THREE.Vector3(0,0,-1),up=new THREE.Vector3(0,1,0);
 let kind=null,began=0,applied=0;
 const progress=()=>kind?clamp01((now()-began)/CUE_MS[kind]):1;
 function playerView(r){const p=r.player;eye.set(p.x,groundHeight(p)+(p.crouch?1.12:1.65),-p.y);euler.set(-p.pitch,-p.yaw-(p.rearAngle||0),0,'YXZ');from.setFromEuler(euler);}
 return {
  start(next){kind=Object.hasOwn(CUE_MS,next)?next:null;began=now();},
  active:()=>!!kind&&progress()<1,
  seconds:()=>kind?(now()-began)/1000:0,
  apply(camera,r,prefs){
   if(!kind)return false;
   const t=progress(),mode=kind==='start'?'playing':kind;
   if(t>=1||prefs.reduced||prefs.manual||r.mode!==mode){kind=null;return false;}
   applied++;
   if(kind==='start'){
    // Straighten up from a braced stoop; look and movement stay live.
    const rest=1-outCubic(t);camera.position.y-=.5*rest;camera.rotation.x-=.36*rest;camera.fov*=1-.1*rest;return true;
   }
   playerView(r);const base=prefs.fov||58;camera.clearViewOffset();
   if(kind==='caught'){
    // The view is wrenched up onto Joe while the body is thrown clear and the
    // legs go: the lens lurches at the machine as the camera leaves it, so the
    // rig looms without the camera ever entering its bodywork.
    const j=r.failure?.rig||r.rig,side=r.failure?.side||1,snap=outCubic(clamp01(t/.28)),lunge=outCubic(clamp01(t/.6)),fall=clamp01((t-.25)/.75)**2,shake=(1-t)*Math.sin(t*46);
    target.set(j.x,2.7,-j.y);goal.copy(eye).sub(target).setY(0);if(goal.lengthSq()<.04)goal.set(Math.cos(j.yaw)*side,0,Math.sin(j.yaw)*side);goal.normalize();
    camera.position.copy(eye).addScaledVector(goal,1.7*lunge);camera.position.y=Math.max(groundHeight(r.player)+.7,camera.position.y-.7*fall);
    look.lookAt(camera.position,target,up);to.setFromRotationMatrix(look);roll.setFromAxisAngle(forward,side*(.16*lunge+.1*fall)+shake*.03);to.multiply(roll);
    camera.quaternion.copy(from).slerp(to,snap);camera.fov=base*(1-.24*lunge)+shake*1.2;return true;
   }
   // Victory: turn back to the course, then rise and pull away over the 18th.
   const move=smoother(clamp01(t/.86)),turn=smoother(clamp01(t/.42)),p=r.player;
   goal.set(p.x*.35-1.5,groundHeight(p)+17,-p.y-12);target.set(3,0,-(p.y-40));
   camera.position.lerpVectors(eye,goal,move);camera.position.x+=Math.sin(move*Math.PI)*3.2;
   look.lookAt(camera.position,target,up);to.setFromRotationMatrix(look);camera.quaternion.copy(from).slerp(to,turn);camera.fov=base-7*move;return true;
  },
  stats:()=>({kind,progress:progress(),applied}),
 };
}
