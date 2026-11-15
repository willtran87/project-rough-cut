import assert from 'node:assert/strict';
import {createMouseLook} from '../web/mouse-look.js';
import {createGhostFeedback} from '../web/ghost-motion.js';
const checks=[];
for(const hz of [20,30,60,144]){
 const m=createMouseLook();let total=0;
 for(let i=0;i<hz;i++){for(let n=0;n<20;n++)m.push(100,-100);const v=m.sample(1/hz);assert(Math.abs(v.x)<=Math.min(2.1/hz,.055)+1e-9);assert(Math.abs(v.y)<=Math.min(1.4/hz,.035)+1e-9);total+=v.x;}
 assert(total<=2.1+1e-9);for(let i=0;i<hz;i++)m.sample(1/hz);assert.deepEqual(m.sample(1/hz),{x:0,y:0});
}
checks.push('Mouse bursts and event floods obey post-sensitivity angular limits at 20/30/60/144Hz; no prolonged backlog');
const m=createMouseLook();m.push(.02,.01);let x=0,y=0;for(let i=0;i<6;i++){const v=m.sample(1/60);x+=v.x;y+=v.y;}assert(x>.019&&x<=.02);assert(y>.0095&&y<=.01);
m.push(10,10);m.push(-.02,-.01);assert(m.sample(1/60).x<0);m.reset();assert.deepEqual(m.sample(1/60),{x:0,y:0});m.push(NaN,Infinity);assert.deepEqual(m.sample(1/60),{x:0,y:0});
checks.push('Fine aiming stays responsive, reversal clears old direction, and reset/nonfinite input cannot move the camera');
const f=createGhostFeedback(),g={key:'one',phase:'waiting',seen:false,side:-1};assert.equal(f.sample(0,g),null);assert.equal(f.sample(1,g),null);
f.sample(2,{...g,seen:true});const pulse=f.sample(2.2,{...g,seen:true});assert(pulse.strength>0&&pulse.side===-1);assert.deepEqual(f.sample(2.2,{...g,seen:true}),pulse);assert.equal(f.sample(2.9,{...g,seen:true}),null);
f.sample(3.2,{...g,phase:'rush',seen:true});assert(f.sample(3.4,{...g,phase:'rush',seen:true}).strength>.2);assert.equal(f.sample(4.5,{...g,phase:'rush',seen:true}),null);assert.equal(f.sample(5,{...g,phase:'rush',seen:true}),null);
const stronger=createGhostFeedback();stronger.sample(0,{...g,seen:true});assert(stronger.sample(.4,{...g,seen:true}).strength>.43);
stronger.sample(.6,{...g,seen:true,phase:'rush'});assert(stronger.sample(1.175,{...g,seen:true,phase:'rush'}).strength>.61);assert(stronger.sample(1.5,{...g,seen:true,phase:'rush'}));assert.equal(stronger.sample(1.8,{...g,seen:true,phase:'rush'}),null);
assert.equal(f.sample(6,{...g,key:'two',seen:true},false),null);
checks.push('Ghost tears require noticing, have bounded envelopes, do not repeat on duplicate frames or a sustained rush, and obey suppression');
console.log(JSON.stringify({passed:true,checks},null,2));
