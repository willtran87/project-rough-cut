import assert from 'node:assert/strict';
import {freshCourseNightfall,recordNightfallCheck,courseNightfall} from '../web/course-nightfall.js';
for(const hz of [30,60,144]){
 const state=freshCourseNightfall();
 recordNightfallCheck(state,'unknown',0);assert.equal(state.checks.length,0);
 for(const [i,id]of ['audit-bell','field-log','release-review'].entries()){
  const start=20*i;recordNightfallCheck(state,id,start);recordNightfallCheck(state,id,start+2);
  assert.equal(state.checks.length,i+1);let previous=courseNightfall(state,start).progress;
  for(let frame=0;frame<=14*hz;frame++){
   const sample=courseNightfall(state,start+frame/hz);assert(sample.progress>=previous);assert(sample.progress<=1);
   assert(sample.moonScale>=.92);assert(sample.skyScale>=.78);previous=sample.progress;
  }
  assert.equal(courseNightfall(state,start+14).progress,(i+1)/3);
 }
 const frozen=JSON.stringify(state);for(let i=0;i<100;i++)courseNightfall(state,47);assert.equal(JSON.stringify(state),frozen);
 assert.equal(courseNightfall(state,1000).progress,1);assert.equal(courseNightfall(freshCourseNightfall(),1000).progress,0);
}
console.log('PASS: three-rate continuous weather, actual check IDs, duplicate protection, bounded readability, pure sampling and fresh-run reset');

const saved=[{id:'audit-bell',time:10}];
const restored=freshCourseNightfall(['audit-bell','audit-bell','unknown'],17,saved);
assert.equal(courseNightfall(restored,17).progress,1/6);saved[0].time=0;assert.equal(restored.checks[0].time,10);
assert.equal(courseNightfall(freshCourseNightfall(['audit-bell','field-log'],100),100).progress,2/3);
console.log('PASS: checkpoint snapshot continuity, no aliasing and legacy completed-check restoration');
