import assert from 'node:assert/strict';
import {freshCloseEscape,advanceCloseEscape,closePushMotor,recoverClosePush} from '../web/course-close-escape.js';
for(const hz of [30,60,144]){
 const s=freshCloseEscape(),input={start:true,safe:false,target:{x:5,y:20},heading:1};
 assert.deepEqual(advanceCloseEscape(s,0,input),['close_escape_warning']);input.target.x=99;
 const events=[];
 for(let i=1;i<=hz*3;i++)for(const event of advanceCloseEscape(s,1/hz,{...input,start:false}))events.push({event,time:i/hz});
 assert.deepEqual(events.map(e=>e.event),['close_push','close_push_recovery','close_push_finished']);
 for(const [i,t] of [.65,1.13,1.98].entries())assert(Math.abs(events[i].time-t)<=1/hz+1e-8);
 assert.equal(s.armed,false);assert.equal(s.activations,1);
 advanceCloseEscape(s,7.99,{safe:true,start:false});assert.equal(s.armed,false);
 advanceCloseEscape(s,.02,{safe:true,start:false});assert.equal(s.armed,true);
}
const s=freshCloseEscape(),target={x:7,y:20};advanceCloseEscape(s,0,{start:true,target,heading:.2});target.x=90;
assert.deepEqual(s.target,{x:7,y:20});advanceCloseEscape(s,.4,{start:false});assert(closePushMotor(s).pitch>8);
advanceCloseEscape(s,.26,{start:false});assert.equal(s.phase,'push');assert.equal(closePushMotor(s).pitch,24);
recoverClosePush(s);assert.equal(s.phase,'recovery');assert(closePushMotor(s).gain<1);
advanceCloseEscape(s,.2,{interrupt:true,safe:false});assert.equal(s.phase,'none');assert.equal(s.target,null);assert.equal(s.armed,false);
assert.deepEqual(closePushMotor(s),{gain:1,pitch:0});
console.log('Close push timing at 30/60/144Hz, evidence snapshot, recovery, interruption and bounded motor cues pass');
