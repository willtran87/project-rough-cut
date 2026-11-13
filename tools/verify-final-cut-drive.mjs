import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot} from '../web/final-cut-sim.js';
import {RIG} from '../web/final-cut-course.js';
import {cuttingMotion,cuttingTime,CUT_ACCELERATION,CUT_DURATION} from '../web/final-cut-drive.js';
const near=(a,b,tolerance=1e-7)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`),runs=[];
// Independently calculated physical landmarks, not a replay of the integrator.
for(const direction of [-1,1]){
 const start=-direction*30;
 for(const [seconds,travel,speed]of [[0,0,0],[1,1.2,2.4],[2,4.8,4.8],[3,10.8,7.2],[5,25.2,7.2],[CUT_DURATION-2,55.2,4.8],[CUT_DURATION-1,58.8,2.4],[CUT_DURATION,60,0]]){
  const p=cuttingMotion(start,direction,seconds);near(p.x,start+direction*travel);near(p.speed,speed);near(cuttingTime(p.x,direction),seconds);
 }
 for(const hz of [30,60,120,144]){
  const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:-10,y:15});Object.assign(r.rig,{x:start,y:26,yaw:direction*Math.PI/2,direction,phase:'announce',age:0,lane:0,deployment:0});
  let wait=0;while(r.rig.phase!=='pass'&&wait++<hz*5)step(r,{},1/hz);assert.equal(r.rig.phase,'pass');
  const began=r.time;let lastSpeed=r.rig.speed,lastX=r.rig.x,maximumAcceleration=0,peak=0,frames=0;
  while(r.rig.phase==='pass'&&frames++<hz*20){
   const before=structuredClone(r);step(r,{},1/hz);
   if(frames===hz*2){r.mode='paused';const paused=structuredClone(r);step(r,{},.2);assert.deepEqual(r,paused);r.mode='playing';}
   const acceleration=Math.abs(r.rig.speed-lastSpeed)*hz;maximumAcceleration=Math.max(maximumAcceleration,acceleration);peak=Math.max(peak,r.rig.speed);
   assert((r.rig.x-lastX)*direction>=-1e-10);assert(Math.abs(r.rig.x-lastX)<=RIG.speed/hz+1e-8);assert(Math.abs(r.rig.x)<=30);
   // Predictive crossing copies must preserve the exact motion, with no
   // renderer-side velocity or unsaved private integration state.
   if(frames%hz===0){step(before,{},1/hz);near(before.rig.x,r.rig.x);near(before.rig.speed,r.rig.speed);}
   lastSpeed=r.rig.speed;lastX=r.rig.x;
  }
  assert.equal(r.rig.phase,'disengage');near(r.rig.x,direction*30);near(r.rig.speed,0);near(peak,7.2);assert(maximumAcceleration<=CUT_ACCELERATION+1e-6);
  assert(Math.abs(r.time-began-CUT_DURATION)<1/hz+.01);near(r.rig.distance,60);assert.equal(r.cut.length,3);
  const retry=createRun(snapshot(r));assert.equal(retry.rig.phase,'announce');assert.equal(retry.rig.speed,0);
  runs.push({hz,direction,seconds:r.time-began,maximumAcceleration,peak,distance:r.rig.distance});
 }
}
// The visible opening starts inside the old headland, but still accelerates
// from rest and cuts the whole first strip before braking at the far end.
for(const hz of [30,60,120,144]){
 const r=createRun();r.mode='playing';Object.assign(r.arrival,{ready:true,requested:true});r.arrival.age=100;Object.assign(r.rig,{phase:'announce',age:0,deployment:1});
 while(r.rig.phase!=='pass')step(r,{},1/hz);
 const start=r.rig.cutStartX,began=r.time-r.rig.age;near(start,24.6);near(r.rig.speed,2.4*r.rig.age);near(start-r.rig.x,.5*2.4*r.rig.age*r.rig.age);assert(r.rig.age<=1/hz);let prior=r.rig.speed,maximumAcceleration=0;
 while(r.rig.phase==='pass'){step(r,{},1/hz);maximumAcceleration=Math.max(maximumAcceleration,Math.abs(r.rig.speed-prior)*hz);prior=r.rig.speed;assert(r.time-began<12);}
 assert(maximumAcceleration<=2.4+1e-6);near(r.rig.x,-30);near(r.rig.distance,54.6);assert.equal(r.cut.length,3);assert(Math.abs(r.time-began-(54.6/7.2+3))<1/hz+.01);runs.push({opening:true,hz,distance:r.rig.distance,maximumAcceleration,seconds:r.time-began});
}
// Real trap approaches at all three rates reach the saturated swale at full cutting speed;
// braking at the far service road cannot prematurely stop the earned finale.
for(const hz of [30,60,120]){const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:-16,y:86});Object.assign(r.rig,{x:30,y:74,yaw:-Math.PI/2,direction:-1,phase:'announce',age:0,lane:2,deployment:0});let frames=0,approachSpeed=0;while(!r.won&&frames++<hz*20){if(r.rig.phase==='pass')approachSpeed=r.rig.speed;step(r,{},1/hz);}assert(r.won);near(approachSpeed,7.2);assert.equal(r.checkpoint,2);assert(r.rig.x>11&&r.rig.x<13);}
fs.mkdirSync('output/final-cut/cutting-drive',{recursive:true});const report={passed:true,duration:CUT_DURATION,runs};fs.writeFileSync('output/final-cut/cutting-drive/rules.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
