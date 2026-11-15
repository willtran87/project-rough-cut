import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/under-green-sim.js';
import {clearDryPursuitLine,visibleApproachTarget,smoothJoeRoute,planJoeRoute,localSearchTarget} from '../web/under-green-navigation.js';
import {WATERS,GATE,waterPoint,distance,solid,lineClear} from '../web/under-green-course.js';
import {weaponClear} from '../web/under-green-clearance.js';
const out='output/under-green/pursuit-motion';fs.mkdirSync(out,{recursive:true});const checks=[];
for(const time of [NaN,Infinity,-Infinity])assert.throws(()=>planJoeRoute({x:0,y:40},{x:0,y:45},time),RangeError);
for(const speed of [0,-1,NaN,Infinity])assert.throws(()=>planJoeRoute({x:0,y:40},{x:0,y:45},10,{speed}),RangeError);
assert.throws(()=>planJoeRoute({x:NaN,y:40},{x:0,y:45},10),RangeError);
assert.throws(()=>planJoeRoute({x:0,y:40},{x:0,y:Infinity},10),RangeError);
assert.throws(()=>planJoeRoute({x:0,y:40},{x:0,y:45},10,{bypassAt:NaN}),RangeError);
checks.push('Invalid planner coordinates/clocks/speeds reject immediately instead of cycling the search queue');
const route=planJoeRoute({x:-3,y:7},{x:3,y:13},10);
assert(route.length<=2);assert(clearDryPursuitLine({x:-3,y:7},{x:3,y:13}));
const corner=planJoeRoute({x:-17,y:37},{x:-24,y:46},10);
let previous={x:-17,y:37};for(const point of corner){assert(lineClear(previous,point,.72));previous=point;}
assert(corner.length>1);checks.push('Dry routes remove grid staircases while routing around the pump buttress');
for(const w of WATERS){
 const a=waterPoint(w,0,-w.depth/2-1),b=waterPoint(w,0,w.depth/2+1);
 assert(!clearDryPursuitLine(a,b));assert.equal(visibleApproachTarget(a,b),null);
 const input=[a,{...b,crossing:w.id},waterPoint(w,0,w.depth/2+2)];
 const result=smoothJoeRoute(a,input);assert.equal(result.filter(p=>p.crossing===w.id).length,1);
}
assert(!clearDryPursuitLine({x:GATE.x,y:GATE.y-2},{x:GATE.x,y:GATE.y+2},true));
checks.push('Both water orientations retain timed crossing endpoints; shut gate blocks direct steering');
assert.deepEqual(localSearchTarget({x:0,y:40},0,0),{x:0,y:45});
function searchRun(px,py){
 const r=createRun();r.mode='playing';r.time=10;Object.assign(r.player,{x:px,y:py,grace:0});
 Object.assign(r.joe,{x:0,y:40,yaw:0,phase:'walk',last:{x:0,y:41},trailHeading:0,trailAt:10,evidence:'last-known',evidenceAt:10});return r;
}
const a=searchRun(-30,60),b=searchRun(-30,66),searchFrames=[];let continuedAt=null;
for(let i=0;i<240;i++){
 step(a);step(b);assert(!a.joe.seen&&!b.joe.seen);
 const behavior=({previousGap,closingRate,...joe})=>joe;
 assert.deepEqual(behavior(a.joe),behavior(b.joe),'Unseen stationary positions cannot change Joe’s search');
 if(a.joe.last.y===46&&continuedAt===null)continuedAt=a.elapsed;
 if(i%15===0)searchFrames.push(structuredClone(a));
}
assert(continuedAt<.8);assert(a.joe.y>44);checks.push('Joe continues the remembered heading within 0.8s; two hidden player locations produce identical pursuit');
const stale=searchRun(-30,60);stale.joe.trailAt=0;for(let i=0;i<40;i++)step(stale);assert.equal(stale.joe.evidence,'inspection');
checks.push('Old movement evidence expires instead of predicting an unseen player indefinitely');
const lost=createRun();lost.mode='playing';lost.time=10;Object.assign(lost.player,{x:-22,y:39,yaw:0,grace:0});Object.assign(lost.joe,{x:-24,y:35,yaw:0,phase:'walk',last:{x:-22,y:39}});
let seen=0,hidden=0;
for(let i=0;i<240;i++){const prev={...lost.joe};step(lost,{forward:1,sprint:true});if(lost.joe.seen)seen++;else if(seen)hidden++;assert(!solid(lost.joe,.72));assert(weaponClear(lost.joe));assert(distance(prev,lost.joe)<=2.1/60+1e-6);}
assert(seen>60&&hidden>30);assert.equal(lost.joe.trailHeading,0);assert.equal(lost.mode,'playing');
checks.push('Continuous ordinary movement loses sight around the pump while preserving only the witnessed direction');
const outcomes=[];
for(const evade of [false,true]){
 const r=createRun();r.mode='playing';r.time=10;Object.assign(r.player,{x:3,y:13,yaw:-3*Math.PI/4,grace:0});Object.assign(r.joe,{x:-3,y:7,yaw:Math.PI/4,phase:'walk',last:{x:3,y:13}});
 let attackTime=null,attackPose=null;
 for(let i=0;i<600&&r.mode==='playing';i++){
  const t=attackTime===null?0:r.elapsed-attackTime;step(r,evade&&attackTime!==null&&t>.35?{strafe:1}:{});
  if(r.joe.phase==='windup'&&attackTime===null){attackTime=r.elapsed;attackPose={x:r.joe.x,y:r.joe.y,yaw:r.joe.yaw};}
  if(attackPose&&['windup','sweep'].includes(r.joe.phase)&&r.elapsed-attackTime<1.4){for(const key of ['x','y','yaw'])assert.equal(r.joe[key],attackPose[key]);}
 }
 assert(attackTime<3.5);assert.equal(r.mode,evade?'playing':'caught');outcomes.push({evade,mode:r.mode,attackTime,gap:distance(r.player,r.joe)});
}
checks.push('Decisive diagonal approach reaches attack sooner; stationary player is caught and delayed ordinary sidestep escapes the committed blade');
fs.writeFileSync(out+'/search-frames.json',JSON.stringify(searchFrames));
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,checks,continuedAt,lostSight:{seen,hidden},outcomes},null,2));
console.log(JSON.stringify({passed:true,checks,continuedAt,outcomes},null,2));
