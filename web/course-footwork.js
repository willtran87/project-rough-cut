import * as THREE from './vendor/three/three.module.js';
import {solveTwoBoneGrip} from './two-bone-ik.js';

const STRIDE=.46/.62,STANCE=.62;
const smooth=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

// Keep a supporting foot in world space while the actor steers. Turning on
// the spot advances the existing gait; wheel rotation still uses real travel.
// This only changes the leg pose, never navigation, speed, collision or grips.
export function createCourseFootwork(root,bones){
 const legs=['L','R'].map((side,i)=>({side:i,upper:bones.get('Thigh'+side),lower:bones.get('Shin'+side),foot:bones.get('Foot'+side),anchor:null,rotation:null,support:false,phase:0}));
 const available=legs.every(l=>l.upper&&l.lower&&l.foot);
 const changed=available?legs.flatMap(l=>[l.upper,l.lower,l.foot]):[],original=changed.map(b=>b.quaternion.clone());
 let applied=false,last=null,gaitMeters=0,motion={phase:0,turning:false,turnBlend:0,turnArc:0},state={available,feet:[]};
 function restore(){if(applied){changed.forEach((b,i)=>b.quaternion.copy(original[i]));applied=false;}}
 function reset(meters){gaitMeters=meters;motion.turnBlend=motion.turnArc=0;for(const l of legs){l.anchor=l.rotation=null;l.support=false;l.startSwing=false;l.releaseWithSwing=false;l.initialPlant=false;l.lastPosition=null;}}
 function start(){
  if(!available||legs.some(l=>!l.lastPosition))return;
  // Begin with a short rear-foot swing and an already planted front foot. Starting
  // the looping clip at its normal zero phase would drag both idle feet.
  root.updateMatrixWorld(true);
  const local=legs.map(l=>root.worldToLocal(l.lastPosition.clone()));
  let first=local[1].z>local[0].z+.02?1:0;
  if(motion.turnBlend>.5){
   // During a pivot, free the foot that would reach its limit first as the
   // hips turn. Forward/back ordering alone can choose the trapped foot.
   const reach=legs.map((leg,i)=>{
    const hip=root.worldToLocal(leg.upper.getWorldPosition(new THREE.Vector3()));
    hip.applyAxisAngle(new THREE.Vector3(0,1,0),motion.turnArc);
    return Math.hypot(local[i].x-hip.x,local[i].z-hip.z);
   });first=reach[1]>reach[0]?1:0;
  }
  const phase=first===0?.75:.25;
  gaitMeters=(Math.floor(gaitMeters/STRIDE)+phase)*STRIDE;motion.phase=phase;
  for(const leg of legs){
   leg.anchor=leg.lastPosition.clone();leg.rotation=leg.lastRotation.clone();
   leg.startPosition=leg.lastPosition.clone();leg.startSwing=leg.side===first;leg.swingStart=.75;leg.releaseWithSwing=leg.side!==first;
   leg.initialPlant=true;leg.support=leg.side!==first;leg.phase=(phase+leg.side*.5)%1;
  }
 }
 function advance(frame,meters,elapsed){
  const heading=frame.joe.effectHeading||0,p=root.position;
  const delta=last?Math.atan2(Math.sin(heading-last.heading),Math.cos(heading-last.heading)):0;
  const rewind=last&&(frame.time<last.time||meters<last.meters);
  const jump=last&&(p.distanceTo(last.position)>2||Math.abs(delta)>Math.PI/2);
  if(!last||rewind||jump)reset(meters);
  let turning=false,turnBlend=motion.turnBlend,turnArc=motion.turnArc;
  if(last&&!rewind&&!jump&&!frame.paused&&frame.time>last.time){
   const travel=Math.max(0,meters-last.meters),turnTravel=Math.abs(delta)*.8,step=Math.max(travel,turnTravel);
   turning=elapsed>0&&Math.abs(delta)/elapsed>.15;
   gaitMeters+=step;
   if(step>1e-7){turnBlend=1-travel/step;turnArc=delta*STRIDE/step*STANCE/2;}
  }else if(last&&frame.time===last.time)turning=motion.turning;
  if(!frame.paused)last={time:frame.time,meters,heading,position:p.clone()};
  motion={phase:((gaitMeters/STRIDE)%1+1)%1,turning,turnBlend,turnArc};
  return motion;
 }
 function update(frame,phase,moving,elapsed,walkWeight){
  if(!available)return;
  root.updateMatrixWorld(true);changed.forEach((b,i)=>original[i].copy(b.quaternion));applied=true;
  const rotation=root.getWorldQuaternion(new THREE.Quaternion()),ground=root.position.y+.12;
  state={available,phase,turning:motion.turning,feet:[]};
  for(const leg of legs){
   const cycle=(phase+leg.side*.5)%1;let support=!moving||cycle<STANCE;
   const position=leg.foot.getWorldPosition(new THREE.Vector3()),animatedPosition=position.clone(),orientation=leg.foot.getWorldQuaternion(new THREE.Quaternion());
   const pole=new THREE.Vector3(leg.side?.08:-.08,0,-1).applyQuaternion(rotation);
   // A stationary pivot uses a short arc around the mower, rather than the
   // forward/backward sweep of the authored walking clip.
   if(motion.turnBlend>0){
    const arc=cycle<STANCE?1-2*cycle/STANCE:-1+2*smooth(STANCE,1,cycle);
    const pivot=new THREE.Vector3(leg.side?.11:-.11,position.y-root.position.y,.38)
     .applyAxisAngle(new THREE.Vector3(0,1,0),arc*motion.turnArc);
    root.localToWorld(pivot);position.lerp(pivot,motion.turnBlend*walkWeight);
   }
   let firstSwing=false;
   if(leg.releaseWithSwing&&moving&&cycle>=.52){
    leg.releaseWithSwing=false;leg.startSwing=true;leg.swingStart=.52;
    leg.startPosition=leg.lastPosition.clone();
   }
   if(leg.startSwing){
    if(!moving){position.copy(leg.lastPosition);orientation.copy(leg.lastRotation);leg.startSwing=false;}
    else if(cycle<leg.swingStart){leg.startSwing=false;position.copy(leg.lastPosition);leg.initialPlant=true;}
    else{
     firstSwing=true;support=false;const q=(cycle-leg.swingStart)/(1-leg.swingStart);
     const landing=new THREE.Vector3(leg.side?.11:-.11,.12,.15);
     const pivot=new THREE.Vector3(leg.side?.11:-.11,.12,.38).applyAxisAngle(new THREE.Vector3(0,1,0),motion.turnArc);
     landing.lerp(pivot,motion.turnBlend);root.localToWorld(landing);
     position.copy(leg.startPosition).lerp(landing,smooth(0,1,q));position.y=ground+.065*Math.sin(Math.PI*q);
    }
   }
   if(!moving&&!leg.support&&leg.lastPosition){position.copy(leg.lastPosition);orientation.copy(leg.lastRotation);}
   if(support&&(!leg.support||!leg.anchor||(moving&&cycle<leg.phase))){leg.anchor=position.clone();leg.rotation=orientation.clone();}
   leg.support=support;leg.phase=cycle;
   if(moving&&cycle>=.52&&!leg.startSwing&&!leg.releaseWithSwing)leg.initialPlant=false;
   let weight=support?(moving?(leg.releaseWithSwing?1:(leg.initialPlant?1:smooth(0,.08,cycle))*(1-smooth(.52,STANCE,cycle))):1):0,error=0,released=false;
   if(weight&&leg.anchor){
    if(!frame.paused)leg.anchor.y=Math.max(ground,leg.anchor.y-elapsed*.7);
    const hip=leg.upper.getWorldPosition(new THREE.Vector3()),knee=leg.lower.getWorldPosition(new THREE.Vector3());
    const reach=hip.distanceTo(knee)+knee.distanceTo(animatedPosition)-.002;
    // Project an overextended plant back into reach continuously. Resetting it
    // to the animated foot would produce a visible pop during a sharp turn.
    if(hip.distanceTo(leg.anchor)>reach){
     const height=hip.y-leg.anchor.y,horizontal=Math.sqrt(Math.max(0,reach*reach-height*height));
     const offset=leg.anchor.clone().sub(hip);offset.y=0;offset.clampLength(0,horizontal);
     leg.anchor.x=hip.x+offset.x;leg.anchor.z=hip.z+offset.z;released=true;
    }
    const target=position.clone().lerp(leg.anchor,weight),targetRotation=orientation.clone().slerp(leg.rotation,weight);
    error=solveTwoBoneGrip(leg.upper,leg.lower,leg.foot,target,pole,targetRotation);
   }else if(motion.turnBlend>0||firstSwing){
    error=solveTwoBoneGrip(leg.upper,leg.lower,leg.foot,position,pole,orientation);
   }
   leg.lastPosition=leg.foot.getWorldPosition(new THREE.Vector3());leg.lastRotation=leg.foot.getWorldQuaternion(new THREE.Quaternion());
   state.feet.push({support,weight,phase:cycle,anchor:leg.anchor?.toArray(),position:leg.foot.getWorldPosition(new THREE.Vector3()).toArray(),error,released});
  }
 }
 return {advance,start,restore,update,stats:()=>({...state,feet:state.feet.map(f=>({...f,anchor:f.anchor?.slice(),position:f.position.slice()}))})};
}
