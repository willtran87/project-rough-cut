import assert from 'node:assert/strict';
import {createGhostGaze,createGhostBehavior,createGhostFeedback} from '../web/ghost-motion.js';
const source={x:0,z:0},player={x:0,z:-10,yaw:Math.PI};
function sequence(hz=100,visible=()=>true){
 const g=createGhostGaze(visible),f=createGhostFeedback(),events=[],pulses=[];let last=null,lastPulse=null;
 for(let i=0;i<=6*hz;i++){
  const t=i/hz,p={...player,yaw:t>=2&&t<3.6?0:Math.PI},r=g.sample('one',t,source,p);
  assert.deepEqual(g.sample('one',t,source,p),r,'Duplicate samples are stable');
  if(r.gesture&&r.gesture!==last)events.push({kind:r.gesture,time:t});last=r.gesture;
  const pulse=f.sample(t,{key:'one',seen:true,phase:'watching',gazeGesture:r.gesture});
  if(pulse?.kind&&pulse.kind!==lastPulse)pulses.push(pulse.kind);lastPulse=pulse?.kind;
  assert([r.fixation,r.abandonment,r.recoil].every(v=>v>=0&&v<=1));
 }
 return {events,pulses};
}
const high=sequence(),low=sequence(20);
assert.deepEqual(high.events,low.events);
assert.deepEqual(high.events.map(e=>e.kind),['stare','lookaway','lookback']);
for(const k of ['stare','lookaway','lookback'])assert.equal(high.pulses.filter(p=>p===k).length,1);
assert.deepEqual(sequence(100,()=>false).events,[],'Cover cannot trigger gaze cues');
const quick=createGhostGaze();let quickAway=false;
for(let i=0;i<400;i++){const t=i/100,r=quick.sample('quick',t,source,{...player,yaw:t>=2&&t<2.2?0:Math.PI});quickAway ||= r.gesture==='lookaway';}
assert(!quickAway,'A brief camera flick must not trigger an abandonment cue');
const gradual=createGhostGaze();let turnedAway=false;
for(let i=0;i<600;i++){const t=i/100,r=gradual.sample('turn',t,source,{...player,yaw:Math.PI-Math.max(0,Math.min(Math.PI,(t-2)*1.5))});turnedAway ||= r.gesture==='lookaway';}
assert(turnedAway,'A smooth turn through peripheral vision must still count as looking away');
const sky=createGhostGaze();for(let i=0;i<40;i++)assert.equal(sky.sample('sky',i/10,source,{...player,pitch:1.1}).gesture,null);
const unseen=createGhostGaze();for(let i=0;i<40;i++)assert.equal(unseen.sample('unseen',i/10,source,{...player,yaw:0}).gesture,null);
const distant=createGhostGaze();for(let i=0;i<40;i++)assert.equal(distant.sample('far',i/10,source,{...player,z:-25}).gesture,null);
const reset=createGhostGaze();reset.sample('one',0,source,player);reset.sample('one',2,source,player);reset.sample(null);assert.equal(reset.sample('one',3,source,player).gesture,null);
// Gaze poses preserve committed travel; the watcher now creeps only while unseen.
for(const profile of ['watcher','stalker','rusher']){
 const a=createGhostBehavior(),b=createGhostBehavior(),anchor={...source,y:0,yaw:0};let sawAway=false,sawReturn=false;
 for(let i=0;i<=1000;i++){
  const t=i/100,p={...player,yaw:t>=4&&t<5.2?0:Math.PI},r=a.sample('ambient:gaze:2',anchor,t,p,profile),control=b.sample('ambient:gaze:2',anchor,t,player,profile);
  if(profile!=='watcher'){assert.equal(r.distance,control.distance);assert.equal(r.movementSpeed,control.movementSpeed);}else {assert(r.distance>=control.distance);assert(r.distance<=1.6);}
  assert(Math.abs(r.headTilt)<=.22&&Math.abs(r.headNod)<=.07&&r.bodyLean<=.12);
  sawAway ||= r.gazeGesture==='lookaway';sawReturn ||= r.gazeGesture==='lookback';
 }
 assert(sawAway&&sawReturn);
}
console.log(JSON.stringify({passed:true,...high,checks:['Dwell and angular hysteresis; no flick/occlusion/distance triggers','Once per sighting, duplicate samples and 20/100Hz timing','Bounded pose reactions preserve all three profiles and committed travel']},null,2));
