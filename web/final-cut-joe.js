import * as THREE from './vendor/three/three.module.js';
import {solveTwoBoneGrip} from './two-bone-ik.js';
import {clamp} from './final-cut-course.js';
import {CAB,cabPerformance} from './final-cut-cab.js';
import {transferPose} from './final-cut-transfer.js';
import {EXIT_START,EXIT_DURATION,EXIT_END} from './final-cut-ending.js';

// Reparent the single shipped Joe actor; never leave a second person in the
// cab. The existing gait is sampled by applied distance, so pause is exact.
export function createFinalCutJoe(actor,clips,scene,body,steering,cutControl){
 const bones=new Map();actor.traverse(o=>{if(o.isBone)bones.set(o.name,o);});
 const base=[...bones.values()].map(b=>({b,p:b.position.clone(),q:b.quaternion.clone(),s:b.scale.clone()})),cabPose=base.map(v=>({...v,p:v.p.clone(),q:v.q.clone(),s:v.s.clone()}));
 const mixer=new THREE.AnimationMixer(actor),walkClip=clips.find(c=>c.name.includes('PushWalk')),idleClip=clips.find(c=>c.name.includes('PlantedIdle'));
 const walk=walkClip&&mixer.clipAction(walkClip),idle=idleClip&&mixer.clipAction(idleClip);walk?.play();idle?.play();
 let visiblePhase='cab',handError=0,footError=0,action='hold-course',targets={hands:[],feet:[]},transfer=null,performancePose=null;
 const arms=['L','R'].map((side,i)=>({side:i===0?-1:1,upper:bones.get('UpperArm'+side),lower:bones.get('Forearm'+side),hand:bones.get('Hand'+side)}));
 const legs=['L','R'].map((side,i)=>({side:i===0?-1:1,upper:bones.get('Thigh'+side),lower:bones.get('Shin'+side),hand:bones.get('Foot'+side),target:CAB.feet[i]}));
 walk?.setEffectiveWeight(0);idle?.setEffectiveWeight(1);if(idle)idle.time=0;mixer.update(0);actor.updateWorldMatrix(true,true);
 const standingPose=base.map(v=>({...v,p:v.b.position.clone(),q:v.b.quaternion.clone(),s:v.b.scale.clone()}));
 const inverseActor=actor.getWorldQuaternion(new THREE.Quaternion()).invert(),footRotations=legs.map(l=>inverseActor.clone().multiply(l.hand.getWorldQuaternion(new THREE.Quaternion())));
 function standOnGround(j){
  if(!j.feet)return;
  actor.position.y=Math.min(...j.feet.map(f=>{if(!f.step)return f.height-.12;const t=f.step.age/f.step.duration,k=t*t*(3-2*t);return f.step.from.height+(f.step.to.height-f.step.from.height)*k-.12;}));actor.updateWorldMatrix(true,true);
  const points=j.feet.map(f=>new THREE.Vector3(f.x,f.height,-f.y));let lower=0;
  for(let i=0;i<legs.length;i++){const l=legs[i],a=l.upper.getWorldPosition(new THREE.Vector3()),b=l.lower.getWorldPosition(new THREE.Vector3()),c=l.hand.getWorldPosition(new THREE.Vector3()),length=a.distanceTo(b)+b.distanceTo(c)-.012,dx=points[i].x-a.x,dz=points[i].z-a.z;lower=Math.min(lower,points[i].y+Math.sqrt(Math.max(.0001,length*length-dx*dx-dz*dz))-a.y);}
  actor.position.y+=lower;actor.updateWorldMatrix(true,true);
  const orientation=actor.getWorldQuaternion(new THREE.Quaternion()),forward=new THREE.Vector3(0,0,-1).applyQuaternion(orientation),up=new THREE.Vector3(0,1,0);
  for(let i=0;i<legs.length;i++){const l=legs[i],f=j.feet[i],axis=points[i].clone().sub(l.upper.getWorldPosition(new THREE.Vector3())),pole=forward.clone().multiplyScalar(-axis.dot(up)).addScaledVector(up,axis.dot(forward)).normalize(),rotation=new THREE.Quaternion().setFromAxisAngle(up,-f.yaw).multiply(footRotations[i]);
   footError=Math.max(footError,solveTwoBoneGrip(l.upper,l.lower,l.hand,points[i],pole,rotation));targets.feet.push({side:l.side,target:points[i].toArray(),actual:l.hand.getWorldPosition(new THREE.Vector3()).toArray(),planted:!f.step,surface:f.step?'swing':'ground'});
  }
 }
 function moveBetweenSupports(kind,t){
  transfer=transferPose(kind,t,body);action=kind;
  const {feet,orientation,seat}=transfer;
  for(let i=0;i<standingPose.length;i++){const b=standingPose[i],c=cabPose[i];b.b.position.copy(b.p).lerp(c.p,seat);b.b.quaternion.copy(b.q).slerp(c.q,seat);b.b.scale.copy(b.s).lerp(c.s,seat);}
  // Solve from a fixed local origin, never from the preceding rendered pose.
  // This also makes a paused re-render bit-stable instead of accumulating
  // inverse-transform roundoff through the previous root position.
  actor.position.set(0,0,0);actor.quaternion.copy(orientation);actor.updateWorldMatrix(true,true);
  const hips=bones.get('Hips'),hipLocal=actor.worldToLocal(hips.getWorldPosition(new THREE.Vector3())),hip=transfer.hip.clone(),up=new THREE.Vector3(0,1,0);
  // Solve support reach before posing the knees. A lifted shoe cannot drag
  // the planted shoe off its tread or stretch the trailing leg.
  let ceiling=Infinity;
  for(let i=0;i<legs.length;i++){const l=legs[i],a=l.upper.getWorldPosition(new THREE.Vector3()),b=l.lower.getWorldPosition(new THREE.Vector3()),c=l.hand.getWorldPosition(new THREE.Vector3()),offset=a.clone().sub(hips.getWorldPosition(new THREE.Vector3())),rel=feet[i].position.clone().sub(hip).sub(offset),length=a.distanceTo(b)+b.distanceTo(c)-.012,flat=rel.x*rel.x+rel.z*rel.z;ceiling=Math.min(ceiling,rel.y+Math.sqrt(Math.max(.0001,length*length-flat)));}
  if(ceiling<0)hip.y+=ceiling;
  actor.position.copy(hip).sub(hipLocal.multiply(actor.scale).applyQuaternion(orientation));actor.updateWorldMatrix(true,true);
  for(let i=0;i<legs.length;i++){
   const l=legs[i],f=feet[i],axis=f.position.clone().sub(l.upper.getWorldPosition(new THREE.Vector3())),forward=new THREE.Vector3(0,0,-1).applyQuaternion(orientation),up=new THREE.Vector3(0,1,0).applyQuaternion(orientation);
   // The knee pole follows the sagittal plane continuously; a fixed pole can
   // cross the lifted ankle axis and flip a knee halfway through a step.
   const pole=forward.clone().multiplyScalar(-axis.dot(up)).addScaledVector(up,axis.dot(forward)).normalize().lerp(new THREE.Vector3(l.side*.15,0,-1).applyQuaternion(orientation),seat),rotation=f.rotation.clone().multiply(footRotations[i]);
   footError=Math.max(footError,solveTwoBoneGrip(l.upper,l.lower,l.hand,f.position,pole,rotation));targets.feet.push({side:l.side,target:f.position.toArray(),actual:l.hand.getWorldPosition(new THREE.Vector3()).toArray(),planted:f.planted,surface:f.surface});
  }
  const smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);},tuck=smooth(t/.025)*(kind==='exit'?1-smooth((t-.94)/.06):1);
  for(const a of arms){
   const shoulder=a.upper.getWorldPosition(new THREE.Vector3()),elbow=a.lower.getWorldPosition(new THREE.Vector3()),wrist=a.hand.getWorldPosition(new THREE.Vector3()),reach=shoulder.distanceTo(elbow)+elbow.distanceTo(wrist),free=actor.localToWorld(new THREE.Vector3(a.side*(.28-.1*tuck),.87,.27));
   let target=free;
   if(a.side===(kind==='board'?-1:1)){const q=body.worldToLocal(shoulder.clone()),rail=body.localToWorld(new THREE.Vector3(kind==='board'?-1.48:1.48,clamp(q.y-.15,1.15,2.35),.2)),distance=shoulder.distanceTo(rail),weight=clamp((reach*.96-distance)/.12,0,1)*(1-seat);target=free.clone().lerp(rail,weight);}
   const grip=steering.localToWorld(new THREE.Vector3(a.side*CAB.wheel.radius*.94,0,0));target.lerp(grip,seat);
   const pole=new THREE.Vector3(a.side,-.7,.2).lerp(new THREE.Vector3(a.side*.2,-.7,-.3),tuck).lerp(new THREE.Vector3(a.side,-.4,.35),seat).applyQuaternion(orientation);
   handError=Math.max(handError,solveTwoBoneGrip(a.upper,a.lower,a.hand,target,pole,a.hand.getWorldQuaternion(new THREE.Quaternion())));targets.hands.push({side:a.side,target:target.toArray(),actual:a.hand.getWorldPosition(new THREE.Vector3()).toArray()});
  }
 }
 function sit(r,reduced,blend=1){
  const pose=cabPerformance(r,reduced);action=pose.action;performancePose=pose;
  // The control owns the palm's orientation. Turning the chest must not
  // rotate a planted hand around the rim with the shoulder.
  actor.updateWorldMatrix(true,true);
  const handFrames=arms.map(a=>a.hand?.getWorldQuaternion(new THREE.Quaternion()));
  const chest=bones.get('Chest'),head=bones.get('Head');chest?.rotateY(pose.chestYaw*blend);chest?.rotateX((pose.chestPitch+pose.strain)*blend);head?.rotateY(pose.headYaw*blend);head?.rotateX(pose.headPitch*blend);
  actor.updateWorldMatrix(true,true);steering.updateWorldMatrix(true,false);cutControl.updateWorldMatrix(true,false);
  for(const a of arms){
   if(!a.upper||!a.lower||!a.hand)continue;
   const grip=steering.localToWorld(new THREE.Vector3(a.side*CAB.wheel.radius*.94,0,0));
   if(a.side>0)grip.lerp(cutControl.localToWorld(new THREE.Vector3(0,CAB.lever.length,0)),pose.rightLever);
   grip.lerp(a.hand.getWorldPosition(new THREE.Vector3()),1-blend);
   const pole=new THREE.Vector3(a.side,-.4,.35).transformDirection(body.matrixWorld),rotation=handFrames[a.side<0?0:1].clone();
   const axis=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(1,0,0),CAB.wheel.tilt).transformDirection(body.matrixWorld);
   rotation.premultiply(new THREE.Quaternion().setFromAxisAngle(axis,pose.wheel*(a.side>0?1-pose.rightLever:1)*blend));
   handError=Math.max(handError,solveTwoBoneGrip(a.upper,a.lower,a.hand,grip,pole,rotation));targets.hands.push({side:a.side,target:grip.toArray(),actual:a.hand.getWorldPosition(new THREE.Vector3()).toArray()});
  }
  for(const leg of legs){
   if(!leg.upper||!leg.lower||!leg.hand)continue;
   const t=leg.target,foot=body.localToWorld(new THREE.Vector3(t.x,t.y,t.z)).lerp(leg.hand.getWorldPosition(new THREE.Vector3()),1-blend),pole=new THREE.Vector3(leg.side*.15,0,-1).transformDirection(body.matrixWorld);
   footError=Math.max(footError,solveTwoBoneGrip(leg.upper,leg.lower,leg.hand,foot,pole,leg.hand.getWorldQuaternion(new THREE.Quaternion())));targets.feet.push({side:leg.side,target:foot.toArray(),actual:leg.hand.getWorldPosition(new THREE.Vector3()).toArray()});
  }
 }
 return {update(r,reduced){
  const e=r.ending,arriving=!r.won&&r.arrival.joe.phase!=='cab',j=arriving?r.arrival.joe:e.joe,out=arriving||(r.won&&e.age>=EXIT_START);visiblePhase=out?(arriving?'arrival-':'')+j.phase:'cab';
  handError=footError=0;targets={hands:[],feet:[]};action='on-foot';transfer=null;performancePose=null;
  for(const b of out?base:cabPose){b.b.position.copy(b.p);b.b.quaternion.copy(b.q);b.b.scale.copy(b.s);}
  if(!out){if(actor.parent!==body)body.add(actor);actor.position.set(0,1.05,.05);actor.rotation.set(0,0,0);sit(r,reduced);return;}
  if(actor.parent!==scene)scene.add(actor);
  const dismount=clamp((e.age-EXIT_START)/EXIT_DURATION,0,1),walking=j.phase==='walk'&&j.speed>.01;
  if((arriving&&j.phase==='board'&&j.climb>0)||j.phase==='dismount'){moveBetweenSupports(arriving?'board':'exit',arriving?j.climb:dismount);return;}
  const settle=clamp(j.settle||0,0,1),gait=walking?(1-settle*settle*(3-2*settle))*Math.min(1,j.speed/(arriving?1.65:1.45)):0;
  walk?.setEffectiveWeight(walking?1:0);idle?.setEffectiveWeight(walking?0:1);
  if(walk)walk.time=(j.walk/(.46/.62)%1)*walkClip.duration;
  if(idle)idle.time=reduced||arriving?0:(Math.max(0,e.age-EXIT_END)*.2)%idleClip.duration;mixer.update(0);
  // Three skips property writes when a sampled clip value has not changed.
  // Retain that raw sample before IK, so duplicate renders do not expose the
  // cab rest pose and a fresh reload produces the same skeleton.
  for(const b of base){b.p.copy(b.b.position);b.q.copy(b.b.quaternion);b.s.copy(b.b.scale);}
  // Use the same immutable standing pose as the stair transfer. Mixer blend
  // caches must not leave a different idle hip/arm pose at the first tread.
  for(const b of standingPose){b.b.position.lerpVectors(b.p,b.b.position.clone(),gait);b.b.quaternion.copy(b.q.clone().slerp(b.b.quaternion,gait));b.b.scale.lerpVectors(b.s,b.b.scale.clone(),gait);}
  actor.position.set(j.x,0,-j.y);actor.rotation.set(0,-j.yaw,0);
  actor.updateMatrixWorld(true);
  standOnGround(j);
  targets.hands=[];action=j.phase;
  for(const a of arms){
   if(!a.upper||!a.lower||!a.hand)continue;const swing=Math.sin(j.walk*2*Math.PI/(.46/.62))*a.side*.12*gait;
   const hand=actor.localToWorld(new THREE.Vector3(a.side*.28,.87,.27+swing)),pole=new THREE.Vector3(a.side,-.7,.2).transformDirection(actor.matrixWorld);
   handError=Math.max(handError,solveTwoBoneGrip(a.upper,a.lower,a.hand,hand,pole,a.hand.getWorldQuaternion(new THREE.Quaternion())));
   targets.hands.push({side:a.side,target:hand.toArray(),actual:a.hand.getWorldPosition(new THREE.Vector3()).toArray()});
  }
  const head=bones.get('Head');if(head&&j.phase==='fence')head.rotateX(.07);
 },stats:()=>({phase:visiblePhase,action,performance:performancePose,actors:1,parent:actor.parent===body?'rig':'world',position:actor.getWorldPosition(new THREE.Vector3()).toArray(),head:bones.get('Head')?.getWorldPosition(new THREE.Vector3()).toArray(),handError,footError,targets,transfer:transfer?{kind:transfer.kind,progress:transfer.progress,seat:transfer.seat}:null}),dispose(){mixer.stopAllAction();}};
}
