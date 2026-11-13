import assert from 'node:assert/strict';
import {freshFirstImpression,advanceFirstImpression,teeAnomalyPose} from '../web/course-first-impression.js';
import {ghostSchedulingPolicy} from '../web/ghost-scheduling.js';
const base={active:true,clear:true,calm:true,time:4,playerY:80,joeVisible:true,joeDistance:100,apparitions:true,accentFree:true,anomalyVisible:false};
let s=freshFirstImpression();
advanceFirstImpression(s,1,{...base,active:false});assert.equal(s.workRemaining,0);
advanceFirstImpression(s,.3,base);assert.equal(s.workRemaining,0);
assert(advanceFirstImpression(s,.06,base).includes('joe_first_sighting'));assert.equal(s.workRemaining,2.6);
advanceFirstImpression(s,1,{...base,active:false});assert.equal(s.workRemaining,2.6);
advanceFirstImpression(s,.01,{...base,calm:false});assert.equal(s.workRemaining,0);assert.equal(s.workOutcome,'interrupted_by_evidence');
assert(!advanceFirstImpression(s,10,base).includes('joe_first_sighting'));
for(const changed of [{clear:false},{calm:false},{time:2},{joeVisible:false},{joeDistance:40},{joeDistance:150}]){
 s=freshFirstImpression();advanceFirstImpression(s,1,{...base,...changed});assert.equal(s.joeSeen,false);
}
const omen={...base,time:10,joeVisible:false,anomalyVisible:true};s=freshFirstImpression();
advanceFirstImpression(s,.5,{...omen,accentFree:false});assert.equal(s.anomaly,'waiting');
assert(advanceFirstImpression(s,.5,omen).includes('tee_anomaly'));
assert.equal(teeAnomalyPose(s).height,.105);
advanceFirstImpression(s,2.7,omen);assert.equal(teeAnomalyPose(s).height,.645);
const still=teeAnomalyPose(s,true);advanceFirstImpression(s,.4,omen);assert.equal(teeAnomalyPose(s,true).height,still.height);
advanceFirstImpression(s,.1,{...omen,clear:false});assert.equal(s.anomaly,'spent');assert.equal(teeAnomalyPose(s).visible,false);
advanceFirstImpression(s,1,omen);assert.equal(s.anomaly,'spent');
for(const changed of [{apparitions:false},{skip:true},{time:96},{playerY:150}]){
 s=freshFirstImpression();advanceFirstImpression(s,1,{...omen,...changed});assert.equal(s.anomaly,'skipped');
}
const hole={elapsed:20,joe:{x:0,y:200,mode:'patrol'},detection:0,tensionDirector:{},engagement:{experience:{firstImpression:{workRemaining:1,anomaly:'waiting'}}}};
assert.equal(ghostSchedulingPolicy(hole,{x:0,y:0},false).reason,'first_impression');
hole.engagement.experience.firstImpression={workRemaining:0,anomaly:'rising'};
assert(ghostSchedulingPolicy(hole,{x:0,y:0},false).blocked);
hole.engagement.experience.firstImpression.anomaly='spent';assert.equal(ghostSchedulingPolicy(hole,{x:0,y:0},false).blocked,false);
console.log('First impression: observation, one-shot work, immediate evidence priority, pause, optional apparition and comfort checks pass.');
