import assert from 'node:assert/strict';
import { freshCourseArrival, advanceCourseArrival, arrivalGatePose, arrivalPhoneVisible } from '../web/course-arrival.js';
const a=freshCourseArrival();
assert.equal(advanceCourseArrival(a,10,{active:false}),false);
assert.equal(a.age,0);
assert.equal(advanceCourseArrival(a,.54),false);
assert.equal(advanceCourseArrival(a,.02),true);
assert.equal(advanceCourseArrival(a,.2),false);
assert(arrivalPhoneVisible(a));assert.equal(arrivalPhoneVisible(a,false),false);
assert.notEqual(arrivalGatePose(a).recoil,0);
assert.equal(arrivalGatePose(a,0,true,true).recoil,0);
assert.equal(arrivalGatePose(a,0,true,true).lamp,.65);
assert.equal(arrivalGatePose(a,0,false,false).lamp,.65);
assert.equal(advanceCourseArrival(a,3),false);
assert.equal(a.phase,'complete');
assert.equal(Math.abs(arrivalGatePose(a).recoil),0);
advanceCourseArrival(a,5);assert.equal(arrivalPhoneVisible(a),false);
const b=freshCourseArrival();advanceCourseArrival(b,5,{skip:true});
assert.equal(b.phase,'skipped');assert.equal(advanceCourseArrival(b,5),false);
for(const state of [null,freshCourseArrival(),a,b])for(const reduced of [false,true]){
  const pose=arrivalGatePose(state,.3,reduced,true);
  assert(Number.isFinite(pose.recoil));assert(Math.abs(pose.recoil)<=.016);assert(pose.locked);
}
console.log('Course arrival: latch once, inactive clock, skip, finite recoil and comfort pass.');
