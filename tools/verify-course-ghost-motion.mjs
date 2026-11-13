import assert from 'node:assert/strict';
import {createCourseGhostMotion,createGhostDissolve} from '../web/course-ghost-motion.js';
const anchor={x:0,y:0,z:-20,yaw:0};
const blockers=[{x:1.1,z:-22,rx:.45,rz:.6}],ponds=[{x:-2,z:-23,rx:.5,rz:1}];
const motion=createCourseGhostMotion({blockers,ponds,height:(x,z)=>z*.01});
const rows=[];
for(let i=0;i<=840;i++){
  const time=i/60,p=motion.sample('sighting:1',anchor,time);assert(p);rows.push(p);
  assert.equal(p.y,p.z*.01);
  for(const o of [...blockers,...ponds])for(const ahead of [0,.8]){
    const x=p.x-Math.sin(p.yaw)*ahead,z=p.z-Math.cos(p.yaw)*ahead;
    assert(((x-o.x)/(o.rx+.65))**2+((z-o.z)/(o.rz+.65))**2>=1,'Body and mower stay clear');
  }
  if(i)assert(Math.hypot(p.x-rows[i-1].x,p.z-rows[i-1].z)<.02,'No frame teleport');
  assert.deepEqual(motion.sample('sighting:1',{...anchor,x:10},time),p,'Camera changes and duplicate times cannot move the lane');
}
for(let i=0;i<rows.length-120;i+=60){const points=rows.slice(i,i+120),travel=points.slice(1).reduce((n,p,j)=>n+Math.hypot(p.x-points[j].x,p.z-points[j].z),0);assert(travel>.03,'No two-second frozen pose');}
assert(rows.some(p=>p.movementSpeed<0));assert(rows.some(p=>p.walkWeight>.8));
const comfort=createCourseGhostMotion();assert.deepEqual(comfort.sample('r',anchor,0,{reduced:true}),comfort.sample('r',anchor,5,{reduced:true}));
assert.equal(motion.sample('sighting:1',anchor,15,{player:{x:rows.at(-1).x,z:rows.at(-1).z}}),null);
const fade=createGhostDissolve(),pose=rows[0],samples=[];
for(let i=0;i<=60;i++)samples.push(fade.sample('one',pose,.52,i/60));
assert.equal(samples[0].alpha,0);assert(samples.at(-1).alpha>.4);assert(samples.every((p,i)=>!i||p.alpha-samples[i-1].alpha<=.008));
const before=samples.at(-1),out=fade.sample(null,null,0,1.1);assert.equal(out.alpha,before.alpha);
const halfway=fade.sample('two',{...pose,x:10},.52,1.7);assert.equal(halfway.key,'one');assert(halfway.alpha<out.alpha);assert.equal(halfway.motion.x,pose.x);assert.notEqual(halfway.motion.sway,out.motion.sway);
assert.equal(fade.sample('two',{...pose,x:10},.52,2.4),null);
const next=fade.sample('two',{...pose,x:10},.52,2.5);assert.equal(next.key,'two');assert(next.alpha<.05);
assert.deepEqual(fade.sample('two',{...pose,x:10},.52,2.5),next,'Pause freezes opacity and motion');
assert.equal(fade.sample(null,null,0,2.6,{enabled:false}),null);
console.log('PASS: continuous curved travel, body/mower clearance, pause, fixed anchors, player approach, reduced motion, smooth entry/exit and no opaque site jumps');
