import assert from 'node:assert/strict';
import {freshDeadGreen,advanceDeadGreen,oldFinishPose} from '../web/dead-green.js';
const f={active:true,y:447,distance:31,visible:true,calm:true,clear:true,accentFree:true};
for(const change of [{visible:false},{calm:false},{clear:false},{accentFree:false},{active:false},{y:400}]){
 const s=freshDeadGreen();advanceDeadGreen(s,1,{...f,...change});assert.equal(s.phase,'waiting');
}
const s=freshDeadGreen();assert.deepEqual(advanceDeadGreen(s,.5,f),['old_finish_seen']);
advanceDeadGreen(s,10,{...f,active:false});assert.equal(s.age,0);
advanceDeadGreen(s,1.9,{...f,distance:20});assert.equal(s.phase,'respite');
assert(advanceDeadGreen(s,.2,{...f,distance:20}).includes('old_finish_revealed'));
assert.equal(oldFinishPose(s).open,0);assert.equal(oldFinishPose(s,true).open,1);
assert(advanceDeadGreen(s,.8,f).includes('old_finish_notice'));assert.equal(oldFinishPose(s).open,1);
assert.deepEqual(advanceDeadGreen(s,1,f),[]);
const danger=freshDeadGreen();advanceDeadGreen(danger,.5,f);advanceDeadGreen(danger,.1,{...f,calm:false});assert.equal(danger.phase,'revealed');assert.equal(danger.announced,false);
assert.deepEqual(advanceDeadGreen(danger,1,{...f,calm:false}),[]);
for(const change of [{skip:true},{y:550}]){const s=freshDeadGreen();advanceDeadGreen(s,1,{...f,...change});assert.equal(s.phase,'revealed');assert(s.announced);}
console.log('Observed finish, protected respite, near reveal, danger yield, pause, repeat and reduced motion pass');
