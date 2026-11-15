import * as THREE from './vendor/three/three.module.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),angle=v=>Math.atan2(Math.sin(v),Math.cos(v));
export function createRiderMotionState(){return {run:null,time:0,yaw:0,speed:0,steer:0,acceleration:0,headYaw:0,breath:0,brace:0,pitch:0,roll:0,wheel:0};}

// Visual response only: steering follows actual heading change, including
// reversals. Simulation state, pursuit decisions and movement are never edited.
export function stepRiderMotion(s,run,{ram={},commit={},surge=0,rev=0,reducedMotion=false}={}){
 const j=run.joe,c=run.foot||run.cart,changed=s.run!==run||run.time<s.time,elapsed=changed?0:run.time-s.time,dt=Math.min(.1,Math.max(0,elapsed));
 if(changed){s.run=run;s.steer=s.acceleration=s.headYaw=0;}
 if(dt>0){
  const steer=clamp(angle(j.yaw-s.yaw)/elapsed/1.5,-1,1)*(j.speed<-.1?-1:1),acceleration=clamp((j.speed-s.speed)/elapsed,-12,12);
  s.steer+=(steer-s.steer)*(1-Math.exp(-dt*9));s.acceleration+=(acceleration-s.acceleration)*(1-Math.exp(-dt*7));
 }
 const desired=-clamp(angle(Math.atan2(c.x-j.x,c.y-j.y)-j.yaw),-.52,.52);
 s.headYaw=changed||reducedMotion?desired:s.headYaw+(desired-s.headYaw)*(1-Math.exp(-dt*7));
 s.time=run.time;s.yaw=j.yaw;s.speed=j.speed;
 const brace=clamp((ram.load||0)+(commit.load||0)*.65+surge*.35,0,1);
 s.brace=changed?brace:s.brace+(brace-s.brace)*(1-Math.exp(-dt*10));
 s.breath=reducedMotion?0:Math.sin(run.time*1.45)*(1-s.brace*.7);
 s.pitch=reducedMotion?0:clamp(s.acceleration*.0045-s.brace*.12+s.breath*.009,-.19,.065);
 s.roll=reducedMotion?0:-s.steer*clamp(Math.abs(j.speed)/10,0,1)*.055;
 s.wheel=-s.steer*.5;s.rev=rev;s.reducedMotion=reducedMotion;return s;
}

export function createBackNineRiderMotion(rider,steering){
 const state=createRiderMotionState(),bones={},rest=new Map();
 rider.traverse(o=>{if(o.isBone){bones[o.name]=o;rest.set(o,{q:o.quaternion.clone(),scale:o.scale.clone()});}});
 for(const name of ['Spine','Chest','Head','UpperArmL','ForearmL','HandL','UpperArmR','ForearmR','HandR'])if(!bones[name])throw Error('Missing Joe rider bone: '+name);
 rider.updateWorldMatrix(true,true);steering.updateWorldMatrix(true,true);
 const arms=['L','R'].map((side,i)=>{
  const upper=bones['UpperArm'+side],lower=bones['Forearm'+side],hand=bones['Hand'+side],worldHand=hand.getWorldQuaternion(new THREE.Quaternion()),bodyQ=rider.parent.getWorldQuaternion(new THREE.Quaternion());
  return {upper,lower,hand,sign:i?1:-1,l1:lower.position.length(),l2:hand.position.length(),restHand:bodyQ.invert().multiply(worldHand),grip:new THREE.Vector3((i?1:-1)*.25,Math.sqrt(.29*.29-.25*.25),0),target:new THREE.Vector3(),error:0};
 });
 const shoulder=new THREE.Vector3(),wrist=new THREE.Vector3(),elbow=new THREE.Vector3(),axis=new THREE.Vector3(),pole=new THREE.Vector3(),offset=new THREE.Vector3(),from=new THREE.Vector3(),to=new THREE.Vector3(),origin=new THREE.Vector3(),palm=new THREE.Vector3();
 const q=new THREE.Quaternion(),parentQ=new THREE.Quaternion(),worldQ=new THREE.Quaternion(),handQ=new THREE.Quaternion(),wheelQ=new THREE.Quaternion(),bodyQ=new THREE.Quaternion(),gripOffset=new THREE.Vector3(0,.063,-.014);
 const wheelRest=steering.quaternion.clone(),wheelAxis=new THREE.Vector3(0,0,1).applyQuaternion(wheelRest);
 function aim(bone,child,target){
  bone.getWorldPosition(origin);child.getWorldPosition(from).sub(origin).normalize();to.copy(target).sub(origin).normalize();
  q.setFromUnitVectors(from,to);bone.getWorldQuaternion(worldQ).normalize();worldQ.premultiply(q);bone.parent.getWorldQuaternion(parentQ).normalize().invert();bone.quaternion.copy(parentQ.multiply(worldQ)).normalize();bone.updateWorldMatrix(false,true);
 }
 function poseArm(a){
  steering.localToWorld(a.target.copy(a.grip));
  // The authored curled fingers wrap a horizontal grip. Rotate that hand
  // frame with the wheel, then solve the wrist instead of stretching sleeves.
  rider.parent.getWorldQuaternion(bodyQ).normalize();wheelQ.setFromAxisAngle(wheelAxis,state.wheel);handQ.copy(bodyQ).multiply(wheelQ).multiply(a.restHand);
  offset.copy(gripOffset).applyQuaternion(handQ);wrist.copy(a.target).sub(offset);a.upper.getWorldPosition(shoulder);
  axis.copy(wrist).sub(shoulder);const length=axis.length(),d=clamp(length,Math.abs(a.l1-a.l2)+.002,a.l1+a.l2-.002);axis.normalize();
  // Elbows remain below and slightly outside the shoulder, with a stable
  // bend plane through straight driving, turning, bracing and slopes.
  pole.set(a.sign*.45,-1,.18).applyQuaternion(bodyQ);pole.addScaledVector(axis,-pole.dot(axis)).normalize();
  const along=(a.l1*a.l1-a.l2*a.l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,a.l1*a.l1-along*along));
  elbow.copy(shoulder).addScaledVector(axis,along).addScaledVector(pole,height);wrist.copy(shoulder).addScaledVector(axis,d);
  aim(a.upper,a.lower,elbow);aim(a.lower,a.hand,wrist);
  a.hand.parent.getWorldQuaternion(parentQ).normalize().invert();a.hand.quaternion.copy(parentQ.multiply(handQ)).normalize();a.hand.updateWorldMatrix(false,true);
  a.hand.localToWorld(palm.copy(gripOffset));a.error=palm.distanceTo(a.target);
 }
 return {update(run,options){
  stepRiderMotion(state,run,options);
  for(const[bone,r]of rest){bone.quaternion.copy(r.q);bone.scale.copy(r.scale);}
  bones.Spine.rotateX(state.pitch*.45);bones.Spine.rotateZ(state.roll);
  bones.Chest.rotateX(state.pitch*.55);bones.Chest.rotateY(state.headYaw*.12);bones.Chest.scale.z*=1+state.breath*.008;
  bones.Head.rotateY(state.headYaw);bones.Head.rotateX(state.reducedMotion?0:-state.brace*.07-state.rev*.06-state.pitch*.25);bones.Head.rotateZ(-state.roll*.35);
  steering.quaternion.copy(wheelRest);steering.rotateZ(state.wheel);rider.updateWorldMatrix(true,true);steering.updateWorldMatrix(true,true);
  for(const arm of arms)poseArm(arm);
 },stats:()=>({steer:state.steer,wheel:state.wheel,acceleration:state.acceleration,brace:state.brace,pitch:state.pitch,roll:state.roll,headYaw:state.headYaw,breath:state.breath,gripError:arms.map(a=>a.error),seated:true})};
}
