import {SCYTHE_BLADE_HEIGHT,SCYTHE_CONTACT} from './under-green-scythe.js';
// Legacy API name retained; these are the scythe's shared rendering/hit dimensions.
export const TRIMMER=Object.freeze({pivotForward:.09,pivotHeight:1.07,bladeNear:SCYTHE_CONTACT.near[1],bladeFar:SCYTHE_CONTACT.far[1],bladeHeight:SCYTHE_BLADE_HEIGHT,bladeRadius:SCYTHE_CONTACT.radius,sweepSeconds:.22,recoverSeconds:1.3,arc:1.1});
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function authoredTrimmerPose(joe){
 let raised=0,angle=0;
 if(joe.phase==='windup'){raised=ease(joe.age/.6);angle=-TRIMMER.arc*raised;}
 else if(joe.phase==='sweep'){raised=1;angle=-TRIMMER.arc+ease(joe.age/TRIMMER.sweepSeconds)*2*TRIMMER.arc;}
 else if(joe.phase==='recover'){
  // Hold the follow-through before returning the blade to its low carry.
  const t=ease((joe.age-.16)/(TRIMMER.recoverSeconds-.16));raised=1-t;angle=TRIMMER.arc*raised;
  if(joe.recoveryPath?.length>1){
   // Reverse the actual clear preparation/cut path after scenery contact.
   // Returning directly to angle zero could push the blade into the same wall.
   const path=joe.recoveryPath,lengths=path.slice(1).map((p,i)=>Math.max(.000001,Math.hypot(p.angle-path[i].angle,p.pitch-path[i].pitch,p.height-path[i].height)));
   let remaining=t*lengths.reduce((a,b)=>a+b,0);
   for(let i=0;i<lengths.length;i++){
    if(remaining<=lengths[i]||i===lengths.length-1){const f=clamp(remaining/lengths[i]);return {...Object.fromEntries(['angle','pitch','height','raised'].map(k=>[k,path[i][k]+(path[i+1][k]-path[i][k])*f])),active:false};}
    remaining-=lengths[i];
   }
  }
  if(joe.recoveryFrom){const from=joe.recoveryFrom;return {angle:from.angle*(1-t),pitch:from.pitch+(-.25-from.pitch)*t,height:from.height+(TRIMMER.pivotHeight-from.height)*t,raised:from.raised*(1-t),active:false};}
 }
 return {angle,pitch:-.25*(1-raised),height:TRIMMER.pivotHeight+.1*raised,raised,active:joe.phase==='sweep'&&joe.age<=TRIMMER.sweepSeconds};
}
export function trimmerPose(joe){const authored=authoredTrimmerPose(joe);return joe.weaponPose?{...authored,...joe.weaponPose,active:authored.active&&!joe.weaponBlocked}:authored;}
export function trimmerPoint(joe,lateral,height,forward,pose=trimmerPose(joe)){
  const heading=joe.yaw+pose.angle,length=forward-TRIMMER.pivotForward,vertical=height-TRIMMER.pivotHeight;
  const reach=length*Math.cos(pose.pitch)-vertical*Math.sin(pose.pitch);
  return {x:joe.x+Math.sin(joe.yaw)*TRIMMER.pivotForward+Math.sin(heading)*reach+Math.cos(heading)*lateral,y:joe.y+Math.cos(joe.yaw)*TRIMMER.pivotForward+Math.cos(heading)*reach-Math.sin(heading)*lateral,height:pose.height+vertical*Math.cos(pose.pitch)+length*Math.sin(pose.pitch)};
}
export function trimmerSegment(joe,pose=trimmerPose(joe)){
 return {near:trimmerPoint(joe,SCYTHE_CONTACT.near[0],TRIMMER.bladeHeight,TRIMMER.bladeNear,pose),far:trimmerPoint(joe,SCYTHE_CONTACT.far[0],TRIMMER.bladeHeight,TRIMMER.bladeFar,pose),radius:TRIMMER.bladeRadius,...pose};
}
export function trimmerContact(joe,player,radius=.3){
 const blade=trimmerSegment(joe);if(!blade.active)return false;
 const dx=blade.far.x-blade.near.x,dy=blade.far.y-blade.near.y;
 const t=clamp(((player.x-blade.near.x)*dx+(player.y-blade.near.y)*dy)/Math.max(.0001,dx*dx+dy*dy));
 const height=blade.near.height+(blade.far.height-blade.near.height)*t;
 return height>=0&&height<=(player.crouched?1.25:1.8)&&Math.hypot(player.x-blade.near.x-dx*t,player.y-blade.near.y-dy*t)<radius+blade.radius;
}
