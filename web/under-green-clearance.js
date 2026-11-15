import {solid,gateBlocks,GATE,clamp,wrap} from './under-green-course.js';
import {TRIMMER,authoredTrimmerPose,trimmerPose,trimmerPoint,trimmerSegment,trimmerContact} from './under-green-trimmer.js';
import {SCYTHE_SHAFT,SCYTHE_GRIPS} from './under-green-scythe.js';
import {attackActing} from './under-green-attack-acting.js';
import {strikeQuery} from './under-green-strike-surfaces.js';

export const JOE_RADIUS=.72;
export function weaponSamples(joe,pose=trimmerPose(joe)){
 const blade=trimmerSegment(joe,pose),samples=[];
 for(let i=0;i<=12;i++){const t=i/12;samples.push({x:blade.near.x+(blade.far.x-blade.near.x)*t,y:blade.near.y+(blade.far.y-blade.near.y)*t,height:blade.near.height+(blade.far.height-blade.near.height)*t,radius:blade.radius+.02});}
 // Wooden shaft and two grips must clear the same scenery as the blade.
 for(const chain of [SCYTHE_SHAFT,...SCYTHE_GRIPS])for(let n=1;n<chain.length;n++){
  const a=chain[n-1],b=chain[n],steps=Math.ceil(Math.hypot(...b.map((v,i)=>v-a[i]))/.055);
  for(let i=0;i<=steps;i++){const t=i/steps,p=a.map((v,k)=>v+(b[k]-v)*t);samples.push({...trimmerPoint(joe,...p,pose),radius:.045});}
 }
 return samples;
}
export function weaponClear(joe,gate=0,pose=trimmerPose(joe)){
 return weaponSamples(joe,pose).every(p=>p.height-p.radius>.015&&p.height+p.radius<2.85&&!solid(p,p.radius+.11,gateBlocks(gate,p.height+p.radius)));
}
export function weaponAtGate(joe){return joe.phase!=='absent'&&weaponSamples(joe).some(p=>Math.abs(p.y-GATE.y)<.3+p.radius&&Math.abs(p.x-GATE.x)<GATE.width/2+p.radius);}
export function turnJoe(joe,heading,dt,gate=0,rate=2.4){
 const change=clamp(wrap(heading-joe.yaw),-rate*dt,rate*dt),candidate={...joe,yaw:joe.yaw+change};
 if(!weaponClear(candidate,gate)){joe.tightTurn=true;joe.turnRate=0;return false;}
 joe.yaw=wrap(candidate.yaw);joe.turnRate=change/dt;joe.turnDistance=(joe.turnDistance||0)+Math.abs(change)*.2;return true;
}
export function recoverStrike(joe,blocked=false){const pose=trimmerPose(joe);joe.recoveryBlocked=blocked;joe.recoveryFrom={...pose,acting:attackActing(joe,pose)};joe.recoveryPath=blocked&&joe.strikePath?.length?[pose,...joe.strikePath.slice().reverse()]:null;joe.phase='recover';joe.age=0;joe.weaponBlocked=true;}
export function settleWeapon(run,dt){
 const j=run.joe;j.sweepContact=false;if(j.phase==='absent')return;
 let desired=authoredTrimmerPose(j),current=j.weaponPose||desired;
 const attacking=['windup','sweep','recover'].includes(j.phase);
 if(j.phase==='windup'&&!['windup','sweep'].includes(j.lastWeaponPhase))j.strikePath=[{...current}];
 j.lastWeaponPhase=j.phase;
 if(!attacking){
  const ahead={...j,x:j.x+Math.sin(j.yaw)*.65,y:j.y+Math.cos(j.yaw)*.65};
  if(j.tightTurn||Math.abs(j.turnRate||0)>.3||!weaponClear(ahead,run.gate,desired)){
   desired={...desired,pitch:1.25};
   // A transverse scythe also needs to turn edge-on beside a close wall.
   if(!weaponClear(j,run.gate,desired)||!weaponClear(ahead,run.gate,desired)){
    outer:for(const pitch of [1.25,.9,.6,.3,0,-.25])for(const angle of [current.angle,0,.4,-.4,.8,-.8,1.2,-1.2,1.6,-1.6]){
     const pose={...desired,pitch,angle};if(weaponClear(j,run.gate,pose)&&weaponClear(ahead,run.gate,pose)){desired=pose;break outer;}
    }
   }
  }
 }
 const approach=(from,to,rate)=>from+clamp(to-from,-rate*dt,rate*dt);
 const candidate={angle:approach(current.angle,desired.angle,j.phase==='sweep'?24:5),pitch:approach(current.pitch,desired.pitch,3.2),height:approach(current.height,desired.height,.5),raised:desired.raised};
 const delta=Math.max(Math.abs(candidate.angle-current.angle),Math.abs(candidate.pitch-current.pitch));
 // Navigation keeps its broad capsule. A planted strike uses the visible
 // forged perimeter, allowing steel to reach masonry before it recoils.
 const physical=attacking||j.strikeRetraction,query=physical?strikeQuery(j,run.gate):pose=>weaponClear(j,run.gate,pose)?null:{blocked:true};
 let safe=current,blocked=false,contact=null;
 for(let i=1,n=Math.max(1,Math.ceil(delta/(physical?.012:.025)));i<=n;i++){
  const t=i/n,pose={angle:current.angle+(candidate.angle-current.angle)*t,pitch:current.pitch+(candidate.pitch-current.pitch)*t,height:current.height+(candidate.height-current.height)*t,raised:desired.raised};
  const hit=query(pose);
  if(hit){
   blocked=true;contact=hit;
   if(physical&&!query(safe)){
    // Resolve the last safe fraction, rather than leaving a frame-rate-sized
    // gap between the edge and the wall. Player contact samples this too.
    let lo=safe,hi=pose;
    for(let k=0;k<9;k++){
     const mid=Object.fromEntries(['angle','pitch','height','raised'].map(key=>[key,(lo[key]+hi[key])*.5])),h=query(mid);
     if(h){hi=mid;contact=h;}else lo=mid;
    }
    safe=lo;
    if(j.phase==='sweep'&&run.player&&trimmerContact({...j,weaponPose:safe,weaponBlocked:false},run.player))j.sweepContact=true;
   }
   break;
  }safe=pose;
  // Fast cuts sample the same continuous arc for scenery and player contact.
  if(j.phase==='sweep'&&run.player&&trimmerContact({...j,weaponPose:pose,weaponBlocked:false},run.player))j.sweepContact=true;
 }
 // A fresh authored spawn may face a wall; choose a clear upright carry before
 // it becomes visible. During play the movement/turn sweep preserves clearance.
 if(!j.weaponPose&&!weaponClear(j,run.gate,safe)){
  outer:for(const pitch of [-.25,0,.3,.6,.9,1.25,1.5])for(const angle of [0,.4,-.4,.8,-.8,1.2,-1.2,1.6,-1.6]){const pose={...desired,pitch,angle};if(weaponClear(j,run.gate,pose)){safe=pose;break outer;}}
 }
 j.weaponPose=safe;j.weaponBlocked=blocked;j.tightTurn=false;
 if(['windup','sweep'].includes(j.phase)){
  j.strikePath??=[{...current}];const last=j.strikePath.at(-1);
  if(Math.max(...['angle','pitch','height'].map(k=>Math.abs(safe[k]-last[k])))>.018)j.strikePath.push({...safe});
 }
 j.strikeRetraction=physical&&!weaponClear(j,run.gate,safe);
 if(blocked&&['windup','sweep'].includes(j.phase)){
  if(contact?.point&&contact.material&&contact.part==='blade'){
   run.sceneryContacts??=[];run.sceneryContactSerial=(run.sceneryContactSerial||0)+1;
   run.sceneryContacts.push({...contact,time:run.time,serial:run.sceneryContactSerial});
   if(run.sceneryContacts.length>8)run.sceneryContacts.shift();
  }
  recoverStrike(j,true);run.events.push({type:'blade-blocked',time:run.time});
 }
}
