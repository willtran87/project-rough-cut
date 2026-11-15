import assert from 'node:assert/strict';
import {shelterCameraCeiling} from '../web/chase-camera.js';
import {COURSE} from '../web/back-nine-course.js';
for(const p of COURSE.checkpoints){
 for(const yaw of [0,.4,1.57,Math.PI,4.7])for(const d of [0,4,8,12,14]){
  const c={x:p.x+Math.sin(yaw)*d,y:p.y+Math.cos(yaw)*d};assert(shelterCameraCeiling(c)<3,'All approach directions clear the 3.45 m eaves');
 }
 // Test actual constrained heights, rather than the unbounded outside limit.
 for(const eye of [3.3,4.2,4.8,6]){let last=Math.min(eye,shelterCameraCeiling({x:p.x,y:p.y-25}));for(let d=24.9;d>=0;d-=.1){const next=Math.min(eye,shelterCameraCeiling({x:p.x,y:p.y-d}));assert(Math.abs(last-next)<.08,'No abrupt height step entering the shelter');last=next;}}
}
assert.equal(shelterCameraCeiling({x:0,y:100}),Infinity);
console.log('PASS: both shelters, front/rear/side approaches, ejection heights, smooth entry and untouched open-course camera');

for(const eye of [3.3,4.2,4.8,6]){let last=Math.min(eye,shelterCameraCeiling({x:-23,y:787}));for(let y=787.1;y<=817;y+=.1){const next=Math.min(eye,shelterCameraCeiling({x:-23,y}));assert(Math.abs(last-next)<.08,'Garage eye descends continuously');if(y>=797)assert(next<=3.151,'Eye stays below entrance lamp and roof');last=next;}}
console.log('PASS: garage front/rear/ejection eye heights and continuous approach');
