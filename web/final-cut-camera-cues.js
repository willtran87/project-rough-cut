import * as THREE from './vendor/three/three.module.js';
import {groundHeight} from './final-cut-arrival-layout.js';
import {BOUNDS,lineClear} from './final-cut-course.js';
import {rigHit} from './final-cut-rig.js';

// Staged camera moves for the round start, a capture and the escape. They
// only repose the render camera after the normal view is computed: the
// simulation, saves, timers and panel text never see them. Wall-clock timed,
// so they are skipped under reduced motion and the deterministic test clock.
export const CUE_MS=Object.freeze({start:1400,caught:1500,complete:17500});
// The escape closes the whole game: crane over the 18th, settle on the public
// road, then the floodlight banks go down in this order as first light comes.
export const FINALE=Object.freeze({crane:5.5,settle:[6.2,11.2],banksOff:[8.6,9.9,11.2,12.5],bankFade:.55,dawn:[11.4,17]});
const clamp01=v=>Math.max(0,Math.min(1,v)),outCubic=t=>1-(1-t)**3,smoother=t=>t*t*t*(t*(t*6-15)+10);
export function createFinalCutCameraCues(now=()=>performance.now()){
 const from=new THREE.Quaternion(),to=new THREE.Quaternion(),eye=new THREE.Vector3(),goal=new THREE.Vector3(),target=new THREE.Vector3(),rest=new THREE.Vector3(),look=new THREE.Matrix4(),euler=new THREE.Euler(0,0,0,'YXZ'),roll=new THREE.Quaternion(),forward=new THREE.Vector3(0,0,-1),up=new THREE.Vector3(0,1,0);
 const finale={banks:[1,1,1,1],dim:1,dawn:0},probe={x:0,y:0},thrown={for:-1,x:0,z:0,reach:0};
 let kind=null,began=0,applied=0;
 const progress=()=>kind?clamp01((now()-began)/CUE_MS[kind]):1;
 const settleFinale=()=>{finale.banks.fill(1);finale.dim=1;finale.dawn=0;};
 function playerView(r){const p=r.player;eye.set(p.x,groundHeight(p)+(p.crouch?1.12:1.65),-p.y);euler.set(-p.pitch,-p.yaw-(p.rearAngle||0),0,'YXZ');from.setFromEuler(euler);}
 // Where the knocked-down view can travel: the direction nearest "straight
 // away from the cab" that stays clear of walls, timber, furniture, the rig's
 // own footprint, level changes and the course boundary. Solved once per cue.
 function solveThrow(r){
  const p=r.player,j=r.rig,side=r.failure?.side||1,level=groundHeight(p);let dx=p.x-j.x,dy=p.y-j.y,best=-9;
  if(dx*dx+dy*dy<.04){dx=Math.cos(j.yaw)*side;dy=-Math.sin(j.yaw)*side;}
  const ideal=Math.atan2(dx,dy);thrown.for=began;thrown.reach=0;
  for(let k=0;k<16;k++){
   const turn=(k+1>>1)*(k%2?1:-1)*Math.PI/8,a=ideal+turn,sx=Math.sin(a),sy=Math.cos(a);let reach=0;
   // Longest clear throw first. The start may touch the rig (that is the
   // capture), so only the resting point has to be clear of its footprint.
   for(let d=1.7;d>.25&&!reach;d-=.28){
    probe.x=p.x+sx*(d+.4);probe.y=p.y+sy*(d+.4);
    if(!lineClear(p,probe,.9)||!lineClear(p,probe,1.7)||Math.abs(groundHeight(probe)-level)>.2||Math.abs(probe.x)>BOUNDS.right-.3||probe.y<BOUNDS.start+.3||probe.y>BOUNDS.end-.3)continue;
    probe.x=p.x+sx*d;probe.y=p.y+sy*d;if(!rigHit(probe,j,.5))reach=d;
   }
   const score=reach-Math.abs(turn)*.32;if(score>best){best=score;thrown.x=sx;thrown.z=-sy;thrown.reach=reach;}
  }
 }
 return {
  start(next){kind=Object.hasOwn(CUE_MS,next)?next:null;began=now();},
  active:()=>!!kind&&progress()<1,
  // Ambience clock for the frozen world behind a shot. A capture runs it at a
  // fifth speed after the first tenth of a second: cuttings and smoke hang.
  seconds(){if(!kind)return 0;const s=(now()-began)/1000;return kind==='caught'?Math.min(s,.1)+Math.max(0,s-.1)*.2:s;},
  finale:()=>finale,
  apply(camera,r,prefs){
   if(!kind){settleFinale();return false;}
   const t=progress(),mode=kind==='start'?'playing':kind;
   if(t>=1||prefs.reduced||prefs.manual||r.mode!==mode){kind=null;settleFinale();return false;}
   applied++;
   if(kind==='start'){
    // Straighten up from a braced stoop; look and movement stay live.
    const stoop=1-outCubic(t);camera.position.y-=.5*stoop;camera.rotation.x-=.36*stoop;camera.fov*=1-.1*stoop;return true;
   }
   playerView(r);const base=prefs.fov||58,s=t*CUE_MS[kind]/1000;camera.clearViewOffset();
   if(kind==='caught'){
    // Impact, then a slow hang: the view is wrenched up onto Joe while the
    // body is thrown clear and the legs go. The lens lurches at the machine as
    // the camera leaves it, so the rig looms without the camera entering it.
    if(thrown.for!==began)solveThrow(r);
    const j=r.failure?.rig||r.rig,side=r.failure?.side||1,jolt=Math.exp(-s*9)*Math.sin(s*58),snap=outCubic(clamp01(s/.24)),lunge=outCubic(clamp01(s/1.15)),fall=clamp01((s-.3)/1.2)**2;
    target.set(j.x,2.7,-j.y);camera.position.copy(eye);camera.position.x+=thrown.x*thrown.reach*lunge;camera.position.z+=thrown.z*thrown.reach*lunge;
    probe.x=camera.position.x;probe.y=-camera.position.z;camera.position.y=Math.max(groundHeight(probe)+.7,eye.y-.7*fall)+jolt*.05;
    look.lookAt(camera.position,target,up);to.setFromRotationMatrix(look);roll.setFromAxisAngle(forward,side*(.16*lunge+.1*fall)+jolt*.06);to.multiply(roll);
    camera.quaternion.copy(from).slerp(to,snap);camera.fov=base*(1-.24*lunge)-jolt*2.2;return true;
   }
   // Victory: turn back to the course, rise and pull away over the 18th, then
   // come down to stand on the public road while the grounds go dark.
   const move=smoother(clamp01(s/FINALE.crane)),turn=smoother(clamp01(s/2.7)),settle=smoother(clamp01((s-FINALE.settle[0])/(FINALE.settle[1]-FINALE.settle[0]))),p=r.player,road=Math.max(p.y,104)+6.5;
   goal.set(p.x*.35-1.5,groundHeight(p)+17,-p.y-12);target.set(3,0,-(p.y-40));
   camera.position.lerpVectors(eye,goal,move);camera.position.x+=Math.sin(move*Math.PI)*3.2;
   rest.set(-7+Math.max(0,s-FINALE.settle[1])*.09,4.9,-road);camera.position.lerp(rest,settle);rest.set(5,5.6,-48);target.lerp(rest,settle);
   look.lookAt(camera.position,target,up);to.setFromRotationMatrix(look);camera.quaternion.copy(from).slerp(to,turn);camera.fov=base-7*move+4*settle;
   finale.dim=0;FINALE.banksOff.forEach((at,i)=>{finale.banks[i]=1-smoother(clamp01((s-at)/FINALE.bankFade));finale.dim+=finale.banks[i]/4;});
   finale.dawn=smoother(clamp01((s-FINALE.dawn[0])/(FINALE.dawn[1]-FINALE.dawn[0])));return true;
  },
  stats:()=>({kind,progress:progress(),applied,finale:{banks:[...finale.banks],dim:finale.dim,dawn:finale.dawn},thrown:{x:thrown.x,z:thrown.z,reach:thrown.reach}}),
 };
}
