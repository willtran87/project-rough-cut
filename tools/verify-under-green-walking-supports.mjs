import assert from 'node:assert/strict';
import {Vector3,Quaternion} from '../web/vendor/three/three.module.js';
import {createWalkingSupports} from '../web/under-green-footwork.js';

const foot=(x,z,height=.12)=>({position:new Vector3(x,height,z),rotation:new Quaternion()});
const tracker=createWalkingSupports();
const sample=(time,raw,heights=[.002,.04],moving=true,rootPosition=new Vector3())=>
 tracker.update({time,moving,rootPosition,raw,heights});
let pose=sample(0,[foot(-.11,.3),foot(.11,.2,.16)]);
const anchor=pose[0].position.clone();
// Reproduce the 3 cm loop seam while the shoe remains on the ground.
pose=sample(1/60,[foot(-.11,.33),foot(.11,.15,.17)]);
assert(pose[0].position.distanceTo(anchor)<1e-9);
pose=sample(2/60,[foot(-.11,.3),foot(.11,.1,.18)]);
assert(pose[0].position.distanceTo(anchor)<1e-9);
const duplicate=sample(2/60,[foot(-.11,.3),foot(.11,.1,.18)]);
assert.deepEqual(duplicate,pose);
// Airborne legs follow the new stop pose instead of retaining a long stride.
const stopped=sample(3/60,[foot(-.11,.28),foot(.11,.26,.14)],[.002,.02],false);
assert(stopped[0].position.distanceTo(anchor)<1e-9);
assert.equal(stopped[1].position.z,.26);

tracker.reset();let largestTrailingOffset=0,correctiveLift=false;
// A deliberately stuck-low source shoe must not anchor indefinitely as the
// body advances: that was the route restart failure missed by turn fixtures.
for(let i=0;i<120;i++){
 const root=new Vector3(0,0,-i*2.1/60),raw=[foot(-.11,root.z+.3),foot(.11,root.z+.15,.18)];
 pose=sample(i/60,raw,[.002,.04],true,root);
 largestTrailingOffset=Math.max(largestTrailingOffset,Math.abs(pose[0].position.z-raw[0].position.z));
 correctiveLift ||= pose[0].position.y>.13;
}
assert(correctiveLift,'Release an overextended support with a visible step');
assert(largestTrailingOffset<.1,'Do not hold a support beyond a recoverable offset');
const resetPose=sample(.1,[foot(-.11,8),foot(.11,8,.18)],[.002,.04],true,new Vector3(0,0,8));
assert.equal(resetPose[0].position.z,8,'Time/position discontinuity must discard the old support');
console.log(JSON.stringify({passed:true,checks:['grounded loop seam','duplicate update','stop preserves only grounded supports','restart releases overextended support','discontinuity resets contact'],largestTrailingOffset}));
