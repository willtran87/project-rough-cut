import assert from 'node:assert/strict';
import {createGhostSightings} from '../web/ghost-motion.js';
import {ghostSchedulingPolicy} from '../web/ghost-scheduling.js';
const sites=[{x:0,y:10}],eligible=()=>true;
for(const hz of [12,24,60]){
 const q=createGhostSightings();let first=null,visible=null;
 for(let i=0;i<=hz*12;i++){
  const s=q.sample(i/hz,true,sites,eligible,null,{deferred:true});
  if(s&&!first)first=i/hz;if(s?.alpha>.45&&!visible)visible=i/hz;
 }
 assert(first>=8&&first<=8+1/hz+.001);assert(visible<10.2);
 assert.equal(q.stats().preemptions,1);assert.equal(q.stats().serial,1);
 // A soft event during the sighting cannot replace its identity.
 const a=q.sample(12.1,true,sites,eligible,null,{deferred:true});
 assert(a);assert.equal(q.sample(12.2,true,sites,eligible).key,a.key);
 const snap=q.stats();q.sample(12.2,true,sites,eligible,null,{deferred:true});assert.deepEqual(q.stats(),snap);
}
const sustained=createGhostSightings(),keys=new Set();
for(let i=0;i<1000;i++){const sighting=sustained.sample(i/10,true,sites,eligible,null,{deferred:true});if(sighting?.alpha>.45)keys.add(sighting.key);}
assert(keys.size>=3&&keys.size<=4,'Persistent background activity must allow spaced recurring sightings');

const q=createGhostSightings();
for(let t=0;t<6;t+=.1)q.sample(t,true,sites,eligible,null,{deferred:true});
const earned=q.stats().deferredSeconds;assert(earned>5.8);
for(let t=6;t<25;t+=.1){assert.equal(q.sample(t,false,sites,eligible),null);assert.equal(q.stats().deferredSeconds,earned);}
assert.equal(q.sample(25,true,sites,eligible,null,{deferred:true}),null);
let resumed;for(let t=25.1;t<30;t+=.1){const s=q.sample(t,true,sites,eligible,null,{deferred:true});if(s?.alpha>.45){resumed=t;break;}}
assert(resumed<30,'Preserved queue credit must survive a long hard interruption');
q.sample(30,false,sites,eligible);assert.equal(q.stats().interruptions,1);
q.sample(30.1,true,sites,eligible);assert.equal(q.stats().phase,'quiet');
assert(q.sample(31,true,sites,eligible));
q.sample(32,false,sites,eligible,null,{enabled:false});assert.equal(q.stats().phase,'disabled');assert.equal(q.stats().reserved,false);
q.sample(33,true,sites,eligible,null,{deferred:true});assert.equal(q.stats().deferredSeconds,0);
const reset=q.sample(0,true,sites,eligible);assert(reset);assert.equal(q.stats().serial,1);
const noSpace=createGhostSightings();let probes=0;
for(let i=0;i<240;i++)noSpace.sample(i/24,true,sites,()=>{probes++;return false;});
assert(probes<=20);assert(!noSpace.stats().reserved);
const h={elapsed:30,joe:{x:200,y:300,mode:'search'},detection:0,hasLineOfSight:false,tensionDirector:{encounterActive:true,accentCooldown:20,reliefSeconds:0},distraction:null},player={x:0,y:50};
const before=JSON.stringify(h);assert.deepEqual(ghostSchedulingPolicy(h,player,false),{blocked:false,reason:null,deferred:true});
for(const mode of ['chase','search','investigate']){const near={...h,joe:{x:0,y:60,mode}};assert(ghostSchedulingPolicy(near,player,false).blocked);}
assert(ghostSchedulingPolicy(h,player,true).blocked);
assert(ghostSchedulingPolicy({...h,elapsed:2},player,false).blocked);
assert(ghostSchedulingPolicy({...h,tensionDirector:{...h.tensionDirector,reliefSeconds:8}},player,false).blocked);
assert.equal(JSON.stringify(h),before);
console.log('PASS: bounded background deferral at 12/24/60 Hz, preserved queue credit, hard priority, pause/reset/disable, bounded site probes, read-only policy');
