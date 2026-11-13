import * as THREE from './vendor/three/three.module.js';

// Keep a walking support in world space until the baked shoe actually lifts.
// The source clip has a small discontinuity at its loop boundary; preserving
// contact also prevents that discontinuity from becoming a visible foot snap.
export function createWalkingSupports(){
 let supports=[null,null],releases=[null,null],previous=null;
 let lastTime=null,lastRoot=null,wasMoving=false;
 function reset(){
  supports=[null,null];releases=[null,null];previous=null;
  lastTime=null;lastRoot=null;wasMoving=false;
 }
 function update({time,moving,rootPosition,raw,heights}){
  if(lastTime!==null&&(time<lastTime||time-lastTime>.25||rootPosition.distanceTo(lastRoot)>.75))reset();
  const dt=lastTime===null?0:Math.max(0,Math.min(.1,time-lastTime));lastTime=time;lastRoot=rootPosition.clone();
  if(!moving){
   // Preserve grounded supports; airborne legs follow the current idle blend
   // so a rising hip cannot leave a long forward step beyond the leg's reach.
   const result=wasMoving?raw.map((foot,i)=>previous?.[i].planted?previous[i]:foot):raw;
   wasMoving=false;supports=[null,null];releases=[null,null];return result;
  }
  wasMoving=true;
  const result=raw.map((foot,i)=>{
   const position=foot.position.clone();
   // On a restart, the blended source clip can leave a shoe low for longer
   // than a full-speed stride would. Step before that support trails too far.
   const extended=supports[i]&&Math.hypot(supports[i].x-position.x,supports[i].z-position.z)>.06;
   if(supports[i]&&(heights[i]>.008||extended)){
    releases[i]={offset:supports[i].clone().sub(position),age:0,corrective:!!extended};supports[i]=null;
   }
   if(!supports[i]&&!releases[i]&&heights[i]<=.004)supports[i]=position.clone();
   if(supports[i]){position.x=supports[i].x;position.z=supports[i].z;}
   else if(releases[i]){
    const release=releases[i];release.age+=dt;
    const duration=release.corrective ? .07 : .1;
    const t=Math.min(1,release.age/duration),weight=1-t*t*(3-2*t);
    position.x+=release.offset.x*weight;position.z+=release.offset.z*weight;
    if(release.corrective)position.y+=Math.sin(Math.PI*t)*.035;
    if(t===1)releases[i]=null;
   }
   return {...foot,position,planted:!!supports[i],corrected:true};
  });
  previous=result;return result;
 }
 return {update,reset};
}

// Local presentation only: planted feet and short repositioning steps while
// Joe turns or stops. The simulation still owns his body heading and travel.
export function createPlantedFootwork(){
 let feet=null,lastTime=null,lastPosition=null,walkTransition=null;
 const position=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 function reset(){feet=null;lastTime=null;lastPosition=null;walkTransition=null;}
 function update({time,moving,turnRate=0,rootPosition,raw,rawRotations,homes,rotations}){
  const discontinuity=lastTime!==null&&(time<lastTime||time-lastTime>.25||position.copy(rootPosition).distanceTo(lastPosition)>.75);
  if(discontinuity)reset();
  // Re-rendering the same state cannot advance an unfinished footstep.
  const dt=lastTime===null?0:Math.max(0,Math.min(.1,time-lastTime));
  lastTime=time;lastPosition=rootPosition.clone();
  if(moving){
   if(feet){walkTransition={from:feet.map(f=>({position:f.position.clone(),rotation:f.rotation.clone()})),age:0};feet=null;}
   if(!walkTransition)return null;
   walkTransition.age+=dt;const t=Math.min(1,walkTransition.age/.12),ease=t*t*(3-2*t);
   const result=raw.map((p,i)=>({position:walkTransition.from[i].position.clone().lerp(p,ease),rotation:walkTransition.from[i].rotation.clone().slerp(rawRotations[i],ease),planted:false,settling:false}));
   if(t===1){walkTransition=null;return null;}
   return result;
  }
  if(!feet){
   feet=raw.map((p,i)=>({position:p.clone(),rotation:rawRotations[i].clone(),step:null}));
   // Preserve the final walking pose, then lower any airborne foot visibly.
   for(let i=0;i<feet.length;i++)if(feet[i].position.y>homes[i].y+.008){
    const target=feet[i].position.clone();target.y=homes[i].y;
    feet[i].step={from:feet[i].position.clone(),to:target,fromRotation:feet[i].rotation.clone(),toRotation:rotations[i].clone(),age:0,duration:.16,settling:true};
   }
   walkTransition=null;
  }
  for(const foot of feet){
   const step=foot.step;if(!step)continue;
   step.age+=dt;const t=Math.min(1,step.age/step.duration),ease=t*t*(3-2*t);
   foot.position.lerpVectors(step.from,step.to,ease);
   if(!step.settling)foot.position.y+=Math.sin(Math.PI*t)*.075;
   foot.rotation.slerpQuaternions(step.fromRotation,step.toRotation,ease);
   if(t===1)foot.step=null;
  }
  if(dt>0&&!feet.some(f=>f.step)){
   const errors=feet.map((f,i)=>Math.hypot(f.position.x-homes[i].x,f.position.z-homes[i].z));
   const index=errors[1]>errors[0]?1:0;
   const foot=feet[index],angle=foot.rotation.angleTo(rotations[index]);
   // Slow inspection turns use fewer, longer steps. At the simulation's
   // fastest turn rate retain short supports so the hip cannot outrun a leg.
   const fast=Math.max(0,Math.min(1,(Math.abs(turnRate)-1.2)/1.2));
   if(errors[index]>.145-.04*fast||angle>.25-.13*fast){
    // Aim slightly into the body's observed turn so low frame rates do not
    // leave the next support foot behind the moving hip. No player prediction.
    const lead=-Math.max(-2.4,Math.min(2.4,turnRate))*(.14-.04*fast);
    const rotation=new THREE.Quaternion().setFromAxisAngle(up,lead);
    const target=homes[index].clone().sub(rootPosition).applyQuaternion(rotation).add(rootPosition);
    foot.step={from:foot.position.clone(),to:target,fromRotation:foot.rotation.clone(),toRotation:rotation.multiply(rotations[index]),age:0,duration:.22-.06*fast,settling:false};
   }
  }
  return feet.map(f=>({position:f.position.clone(),rotation:f.rotation.clone(),planted:!f.step,settling:!!f.step?.settling}));
 }
 return {update,reset};
}
