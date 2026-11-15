import assert from 'node:assert/strict';
import {attackActing} from '../web/under-green-attack-acting.js';
import {trimmerPose,TRIMMER} from '../web/under-green-trimmer.js';
import {recoverStrike} from '../web/under-green-clearance.js';

const distance=(a,b)=>Math.max(...['yaw','pitch','roll'].map(k=>Math.abs(a[k]-b[k])));
let interruptions=0,maxJump=0;
for(const phase of ['windup','sweep'])for(let n=0;n<=120;n++){
 const j={phase,age:n/120*(phase==='windup'?.95:TRIMMER.sweepSeconds)};
 const before=attackActing(j,trimmerPose(j));recoverStrike(j,true);
 assert(distance(before,attackActing(j,trimmerPose(j)))<1e-12,'Interrupted body snaps');
 j.age=TRIMMER.recoverSeconds;
 assert(distance(attackActing(j,trimmerPose(j)),{yaw:0,pitch:0,roll:0})<1e-12);
 interruptions++;
}
for(const hz of [30,60,120]){
 let previous=null;
 for(const [phase,duration]of [['windup',.95],['sweep',.22],['recover',1.3]]){
  for(let i=0;i<=Math.ceil(duration*hz);i++){
   const j={phase,age:Math.min(duration,i/hz)},pose=trimmerPose(j),a=attackActing(j,pose);
   assert.deepEqual(attackActing(j,pose),a);assert(Object.values(a).every(Number.isFinite));
   if(previous)maxJump=Math.max(maxJump,distance(previous,a));previous=a;
  }
 }
}
assert(maxJump<.4,'Body snaps between neighboring attack frames');
// Stationary windup hold and cut endpoints must join with zero velocity.
for(const [phase,end]of [['sweep',0],['sweep',TRIMMER.sweepSeconds],['recover',.16],['recover',TRIMMER.recoverSeconds]]){
 const at=t=>{const j={phase,age:t};return attackActing(j,trimmerPose(j));};
 const delta=end===0?1e-6:-1e-6;
 assert(distance(at(end),at(end+delta))/Math.abs(delta)<.001,'Attack boundary has a velocity pop');
}
console.log(JSON.stringify({passed:true,interruptions,frameRates:[30,60,120],maxJump}));
