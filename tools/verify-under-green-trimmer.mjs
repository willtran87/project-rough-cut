import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TRIMMER,trimmerPose,trimmerSegment,trimmerContact} from '../web/under-green-trimmer.js';
import {SCYTHE_CONTACT} from '../web/under-green-scythe.js';
import {createRun,step} from '../web/under-green-sim.js';
const checks=[];
for(const yaw of [0,.7,Math.PI/2,Math.PI])for(let frame=0;frame<=27;frame++){
 const j={x:2,y:56,yaw,phase:'sweep',age:frame/27*TRIMMER.sweepSeconds},blade=trimmerSegment(j),dx=blade.far.x-blade.near.x,dy=blade.far.y-blade.near.y,length=Math.hypot(dx,dy),mid={x:(blade.near.x+blade.far.x)/2,y:(blade.near.y+blade.far.y)/2};
 assert(Math.abs(length-Math.hypot(SCYTHE_CONTACT.far[0]-SCYTHE_CONTACT.near[0],TRIMMER.bladeFar-TRIMMER.bladeNear))<1e-10);
 for(const crouched of [false,true])assert(trimmerContact(j,{...mid,crouched}));
 assert(!trimmerContact(j,{x:mid.x+dy/length*.55,y:mid.y-dx/length*.55}));
 assert(!trimmerContact({...j,phase:'windup'},mid));assert(!trimmerContact({...j,phase:'recover'},mid));
}
checks.push('Visible blade capsule contacts the player body throughout the committed arc; outside clearance and inactive phases are safe');
const before=trimmerPose({phase:'windup',age:.95}),start=trimmerPose({phase:'sweep',age:0}),end=trimmerPose({phase:'sweep',age:.45}),recovery=trimmerPose({phase:'recover',age:0});
for(const key of ['angle','height','pitch']){assert.equal(before[key],start[key]);assert.equal(end[key],recovery[key]);}
checks.push('Wind-up, committed sweep and recovery meet at identical poses without a transition jump');
let r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:55,grace:0});Object.assign(r.joe,{x:0,y:53.6,yaw:0,phase:'windup',age:0});for(let i=0;i<70;i++)step(r,{strafe:1});assert.equal(r.mode,'playing');assert.equal(r.joe.yaw,0);
r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:55,grace:0});Object.assign(r.joe,{x:0,y:53.6,yaw:0,phase:'windup',age:0});for(let i=0;i<120&&r.mode==='playing';i++)step(r,{});assert.equal(r.mode,'caught');
checks.push('An ordinary strafe dodges the committed direction; remaining inside the visible sweep causes defeat');
fs.mkdirSync('output/under-green/trimmer',{recursive:true});fs.writeFileSync('output/under-green/trimmer/rules.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
