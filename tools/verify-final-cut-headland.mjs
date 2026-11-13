import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planHeadland,advanceHeadland} from '../web/final-cut-headland.js';
import {rigWheelAngle,RIG_WHEELS,rigWallHit} from '../web/final-cut-rig.js';
import {WALLS} from '../web/final-cut-course.js';
const runs=[],wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
let maxSlip=0,maxAcceleration=0,maxStep=0,maxSteering=0;
for(const hz of [30,60,120])for(const side of [-1,1])for(const start of [26,50,66,74])for(const target of [26,50,66,74])for(const targetSide of [side,-side]){
 const j={x:side*30,y:start,yaw:side*Math.PI/2,steering:0,distance:0,speed:0,phase:'turn',deployment:0};j.turnPlan=planHeadland(j,targetSide,target);
 let done=false,reverse=0,frames=0,stops=0;
 for(;frames<hz*180&&!done;frames++){
  const before={...j},oldSegment=j.turnPlan.index;
  const result=advanceHeadland(j,1/hz,p=>!rigWallHit(p,WALLS));assert.notEqual(result,'blocked');done=result===true;
  const step=Math.hypot(j.x-before.x,j.y-before.y),angle=wrap(j.yaw-before.yaw);maxStep=Math.max(maxStep,step);maxSteering=Math.max(maxSteering,Math.abs(j.steering));
  assert(step<=4.6/hz+1e-5);assert(!angle||step>1e-8,'Rig pivots without rolling');assert.equal(rigWallHit(j,WALLS),null);
  if(j.reverse)reverse++;if(!step)stops++;
  // Wheel centres must move along their wheel planes, including reverse.
  if(step>1e-5&&oldSegment===j.turnPlan.index)for(const w of RIG_WHEELS){
   const centre=p=>({x:p.x+Math.cos(p.yaw)*w.side+Math.sin(p.yaw)*w.forward,y:p.y-Math.sin(p.yaw)*w.side+Math.cos(p.yaw)*w.forward});
   const a=centre(before),b=centre(j),heading=before.yaw+angle/2+(rigWheelAngle(before,w)+rigWheelAngle(j,w))/2,slip=Math.abs((b.x-a.x)*Math.cos(heading)-(b.y-a.y)*Math.sin(heading))/Math.hypot(b.x-a.x,b.y-a.y);
   maxSlip=Math.max(maxSlip,slip);assert(slip<.002,'Wheel scrubs sideways: '+slip);
  }
  maxAcceleration=Math.max(maxAcceleration,Math.abs(j.speed-before.speed)*hz);
 }
 assert(done,'Headland maneuver stalled');assert(Math.abs(j.x-targetSide*30)<1e-8);assert(Math.abs(j.y-target)<1e-8);assert(Math.abs(wrap(j.yaw+targetSide*Math.PI/2))<1e-8);
 if(side===targetSide&&Math.abs(start-target)<23){assert(reverse>0);assert(stops>=Math.floor(.8*hz));}
 runs.push({hz,side,start,targetSide,target,seconds:frames/hz,reverseFrames:reverse});
}
assert(maxAcceleration<=2.4+1e-8,'Acceleration/braking exceeds the configured limit');
// A rejected candidate must not move any wheel or consume path distance.
const blocked={x:30,y:26,yaw:Math.PI/2,steering:0,distance:0,speed:0};blocked.turnPlan=planHeadland(blocked,1,50);const original=structuredClone(blocked);assert.equal(advanceHeadland(blocked,1/60,()=>false),'blocked');assert.deepEqual(blocked,original);
fs.mkdirSync('output/final-cut/headland',{recursive:true});
const report={passed:true,runs:runs.length,maxSlip,maxAcceleration,maxStep,maxSteering,details:runs};fs.writeFileSync('output/final-cut/headland/rules.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,details:undefined}));
