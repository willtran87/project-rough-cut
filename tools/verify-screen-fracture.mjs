import assert from 'node:assert/strict';
import {fractureSample} from '../web/screen-fracture.js';
const frame={fx:{screen:true,enabled:true,ghostInterference:true},joe:{mode:'patrol'}};
const cue={kind:'rush',progress:.5,strength:.62,side:-1};
for(const overrides of [{reducedMotion:true},{fx:{...frame.fx,screen:false}},{fx:{...frame.fx,enabled:false}},{fx:{...frame.fx,suppressScares:true}},{fx:{...frame.fx,ghostInterference:false}},{joe:{mode:'chase'}}])assert.equal(fractureSample({...frame,...overrides},cue),null);
for(const kind of ['notice','rush','feint','stare','lookaway','lookback','hesitate']){
 let last=0;
 for(let i=0;i<=120;i++){
  const progress=i/120,s=fractureSample(frame,{...cue,kind,progress,strength:Math.sin(progress*Math.PI)*.62})||{shiftPixels:0,shift:0};
  assert(s.shiftPixels<=6.5);assert(Math.abs(s.shift-last)<.3,'Smooth bounded recoil');last=s.shift;
 }
 assert(Math.abs(last)<1e-8);
}
for(let focusY=0;focusY<=1;focusY+=.01){const s=fractureSample(frame,{...cue,focusY});assert(s.center<=.4||s.center>=.6,'Keep primary tear clear of aiming lane');assert(s.center>=.23&&s.center<=.77);}
assert.equal(fractureSample(frame,null),null);
const course={...frame,fx:{...frame.fx,flashes:true,horror:{visualFlash:{type:'course_tear',seconds:.3,duration:.6,side:1}}}};
assert.equal(fractureSample(course,null).kind,'course');assert.equal(fractureSample(course,cue).kind,'rush','Do not stack effects');
console.log('PASS: comfort gates, continuous pulse/recoil, bounded displacement, ghost anchoring and non-stacking course events');
