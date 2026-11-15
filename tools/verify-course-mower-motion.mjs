import assert from 'node:assert/strict';
import {courseMowerStep,mowerAngleDelta,COURSE_MOWER_MOTION as limits} from '../web/course-mower-motion.js';
const samples=[];
for(const hz of [30,60,144]){
  let s={speed:0,heading:0},distance=0;
  for(let i=0;i<hz;i++){const n=courseMowerStep(s,32,0,1000,1/hz);assert(n.speed>=s.speed);assert(n.speed-s.speed<=limits.acceleration/hz+1e-9);distance+=n.travel;s=n;}
  assert(Math.abs(distance-24)<1e-8);assert.equal(s.speed,32);
  let stoppedDistance=0;
  for(let i=0;i<hz;i++){const n=courseMowerStep(s,0,0,1000,1/hz);assert(n.speed<=s.speed);stoppedDistance+=n.travel;s=n;}
  assert.equal(s.speed,0);assert(Math.abs(stoppedDistance-32*32/(2*limits.braking))<1e-8);
  s={speed:32,heading:0};let lowest=32,x=0,y=0,maxTurn=0;
  for(let i=0;i<hz*4;i++){
    const n=courseMowerStep(s,32,Math.PI,1000,1/hz);
    maxTurn=Math.max(maxTurn,Math.abs(mowerAngleDelta(n.heading,s.heading)));lowest=Math.min(lowest,n.speed);
    assert(maxTurn<=limits.pivotRate/hz+1e-9);x+=Math.cos(n.heading)*n.travel;y+=Math.sin(n.heading)*n.travel;s=n;
  }
  assert(lowest<1);assert(x< -40);assert(Math.abs(mowerAngleDelta(Math.PI,s.heading))<1e-8);
  samples.push({hz,distance,stoppedDistance,reverse:{x,y,lowest,maxTurn}});
}
const frozen=courseMowerStep({speed:20,heading:.2},40,2,100,0);assert.equal(frozen.speed,20);assert.equal(frozen.heading,.2);assert.equal(frozen.travel,0);
console.log(JSON.stringify({passed:true,checks:['Exact straight acceleration and braking distance at three frame rates','Reversal sheds speed before bounded turning and opposite travel','Zero time preserves motion'],samples}));
