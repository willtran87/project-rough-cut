import assert from 'node:assert/strict';
import {COURSE_CIRCUITS,circuitPower,advanceCircuits,traceUnseenSeconds} from '../web/course-circuits.js';
for(const hz of [20,60,144]){
 const s={used:['pond-circuit'],active:[{id:'pond-circuit',remaining:16}]};let warnings=0,last=.06;
 assert.equal(circuitPower(s,'range-light-east'),1);
 for(let i=0;i<16*hz+1;i++){
  warnings+=advanceCircuits(s,1/hz).length;const power=circuitPower(s,'floodlight');assert(power>=last-1e-9&&power<=1);assert(power-last<.04);last=power;
 }
 assert.equal(s.active.length,0);assert.equal(warnings,1);assert.equal(last,1);assert.equal(s.used.length,1);
}
const pause={active:[{id:'range-circuit',remaining:10}]};advanceCircuits(pause,0);assert.equal(pause.active[0].remaining,10);advanceCircuits(pause,50);assert.equal(pause.active.length,0);
const trace={x:0,y:0},p={x:0,y:50};assert.equal(traceUnseenSeconds(trace,p,Math.PI,2),0,'Watching the old station defers changes');assert.equal(traceUnseenSeconds(trace,p,0,.7),.7);assert.equal(traceUnseenSeconds({...trace,unseenSeconds:.5},p,Math.PI,.1),0);assert.equal(traceUnseenSeconds(trace,{x:0,y:10},0,3),0);
assert.equal(new Set(COURSE_CIRCUITS.flatMap(c=>c.lights)).size,4);
console.log('PASS: independent circuits, three-rate expiry, one warning, smooth restoration, pause and observed/unobserved trace gating');
