import assert from 'node:assert/strict';
import {createRun,step} from '../web/under-green-sim.js';
import {TRIMMER,authoredTrimmerPose,trimmerPose} from '../web/under-green-trimmer.js';
import {settleWeapon,weaponClear} from '../web/under-green-clearance.js';
assert(TRIMMER.arc*2>2.1);assert(TRIMMER.sweepSeconds<=.22);
const results=[];
for(const hz of [30,60,120]){
 const r=createRun();r.mode='playing';Object.assign(r.player,{x:2,y:55,grace:99});Object.assign(r.joe,{x:0,y:53.6,yaw:0,phase:'windup',age:0});
 for(let n=0;n<Math.ceil(.95*hz);n++){r.joe.age=n/hz;settleWeapon(r,1/hz);}
 const values=[];r.joe.phase='sweep';
 for(let n=0;n<=Math.ceil(TRIMMER.sweepSeconds*hz);n++){r.joe.age=Math.min(TRIMMER.sweepSeconds,n/hz);settleWeapon(r,1/hz);values.push(trimmerPose(r.joe).angle);assert(weaponClear(r.joe));assert(Math.abs(trimmerPose(r.joe).angle-authoredTrimmerPose(r.joe).angle)<.001);}
 assert(Math.abs(values.at(-1)-TRIMMER.arc)<.001);results.push({hz,start:values[0],end:values.at(-1),samples:values.length});
 const caught=createRun();caught.mode='playing';Object.assign(caught.player,{x:0,y:55,grace:0});Object.assign(caught.joe,{x:0,y:53.6,yaw:0,phase:'windup',age:0});for(let n=0;n<hz*2&&caught.mode==='playing';n++)step(caught,{},1/hz);assert.equal(caught.mode,'caught');assert(caught.time>.9,'Windup remains readable');
 const dodge=createRun();dodge.mode='playing';Object.assign(dodge.player,{x:0,y:55,grace:0});Object.assign(dodge.joe,{x:0,y:53.6,yaw:0,phase:'windup',age:0});for(let n=0;n<hz*1.3;n++)step(dodge,{strafe:1},1/hz);assert.equal(dodge.mode,'playing');
}
const end=authoredTrimmerPose({phase:'sweep',age:TRIMMER.sweepSeconds}),hold=authoredTrimmerPose({phase:'recover',age:.12});assert.equal(end.angle,hold.angle);assert.equal(end.height,hold.height);
console.log(JSON.stringify({passed:true,degrees:TRIMMER.arc*360/Math.PI,seconds:TRIMMER.sweepSeconds,results}));
