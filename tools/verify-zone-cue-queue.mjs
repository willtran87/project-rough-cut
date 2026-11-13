import assert from 'node:assert/strict';
import {freshZoneCueQueue,requestZoneCue,advanceZoneCue,zoneCuePriority} from '../web/zone-cue-queue.js';
import {ghostSchedulingPolicy} from '../web/ghost-scheduling.js';
const f={active:true,zone:2,time:10,allowed:true};
let q=freshZoneCueQueue(8);assert(requestZoneCue(q,2,10));assert(!requestZoneCue(q,2,11));
advanceZoneCue(q,1,{...f,active:false});assert.equal(q.pending.clearSeconds,0);
advanceZoneCue(q,1,f);advanceZoneCue(q,1,{...f,allowed:false});assert.equal(q.pending.clearSeconds,0);
assert.equal(advanceZoneCue(q,1.3,f),2);assert.equal(q.played,1);assert.equal(q.pending,null);
assert.equal(advanceZoneCue(q,10,f),null);assert(!requestZoneCue(q,2,12));
q=freshZoneCueQueue(8);requestZoneCue(q,2,10);advanceZoneCue(q,1,{...f,time:35});assert.equal(q.lastDrop,'expired');
q=freshZoneCueQueue(8);requestZoneCue(q,2,10);advanceZoneCue(q,1,{...f,zone:3});assert.equal(q.lastDrop,'left_area');
q=freshZoneCueQueue(8);requestZoneCue(q,2,10);requestZoneCue(q,3,11);assert.equal(q.dropped,1);assert.equal(q.pending.index,3);
for(const key of ['opening','danger','interaction','message','observedScene','ghost','recovery','accent'])assert(zoneCuePriority({[key]:true}));
assert.equal(zoneCuePriority({}),null);assert.equal(zoneCuePriority({danger:true,message:true}),'danger');
const h={elapsed:100,joe:{x:0,y:300,mode:'patrol'},detection:0,hasLineOfSight:false,tensionDirector:{reliefSeconds:0},zoneSetPiece:{active:'door_cycle'}};
assert.equal(ghostSchedulingPolicy(h,{x:0,y:0},false).reason,'zone_event');assert(ghostSchedulingPolicy(h,{x:0,y:0},false).blocked);
console.log('Bounded zone queue, stable clear interval, expiry/leave/deduplication and ghost priority pass');

const {zoneCueAnchor,zoneCueSound}=await import('../web/zone-cue-scene.js');
const ponds=[{x:-7,z:-34,rx:4},{x:8,z:-42,rx:4}];
assert.deepEqual(zoneCueAnchor('submerged_lights',2,{x:0,z:-35},[],ponds),ponds[0]);
assert.deepEqual(zoneCueAnchor('door_cycle',2,{x:0,z:-35},[],ponds),{x:20,z:-49.61});
for(const id of ['boundary_knock','hedge_breath','submerged_lights','door_cycle','hedge_breach','range_volley','release_sweep']){
 const cues=zoneCueSound(id);assert(cues.length>0&&cues.length<=3);
 for(const c of cues){assert(c.duration+c.delay<=.6);assert(c.level>0&&c.level<.03);assert(c.from>0||c.band>0);}
}
assert.deepEqual(zoneCueSound('old_finish'),[]);
console.log('Shared scene/sound sources and seven short environmental motifs pass');
