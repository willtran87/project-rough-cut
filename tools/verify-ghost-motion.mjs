import assert from 'node:assert/strict';
import {createGhostMotion} from '../web/ghost-motion.js';
const anchor={x:0,y:0,z:0,yaw:0};
const motion=createGhostMotion({height:(x,z)=>z*.05});
const start=motion.sample('one',anchor,0),middle=motion.sample('one',anchor,1.42),end=motion.sample('one',anchor,3);
assert.equal(start.distance,0);assert(middle.distance>.3&&middle.distance<.45);assert.equal(middle.y,middle.z*.05);assert(middle.walkWeight>.9);
assert(end.distance>.7&&end.distance<=.751);assert.equal(end.walkWeight,0);
assert.deepEqual(motion.sample('one',{x:50,y:50,z:50,yaw:1},3),end,'Viewer changes cannot retarget an existing sighting');
assert.deepEqual(motion.sample('one',anchor,3),end,'Duplicate and paused timestamps must not move');
motion.sample(null,null,3);assert.equal(motion.sample('two',anchor,4).distance,0);
for(const kind of ['blockers','ponds']){
 const blocked=createGhostMotion({[kind]:[{x:0,z:-1,rx:.2,rz:.2}]});blocked.sample('blocked',anchor,0);const pose=blocked.sample('blocked',anchor,2);assert.equal(pose.distance,0);assert.equal(pose.walkWeight,0);
 const limited=createGhostMotion({[kind]:[{x:0,z:-1.9,rx:.2,rz:.2}]});limited.sample('limited',anchor,0);const stop=limited.sample('limited',anchor,4);assert(stop.distance>0&&stop.distance<.4,'Swept mower stops short of cover/water');
}
const border=createGhostMotion();border.sample('edge',{x:12.9,y:0,z:0,yaw:-Math.PI/2},0);assert.equal(border.sample('edge',anchor,3).distance,0);
console.log('PASS: eased grounded movement, distance-driven gait, stable anchors, pause, reset, mower clearance, pond and border limits');
