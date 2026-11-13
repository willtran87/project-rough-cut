import assert from 'node:assert/strict';
import {createFootContactEvents} from '../web/foot-contact-events.js';
const tracker=createFootContactEvents(),owner={};let time=0;
function pose(heights,options={}){
 tracker.update({owner,time,body:{x:0,y:0},feet:heights.map((height,i)=>({height,x:i*.2,y:0})),enabled:true,phase:'walk',...options});
}
pose([.002,.002]);assert.deepEqual(tracker.drain(),[]);
time+=.016;pose([.05,.002]);time+=.016;pose([.002,.002]);
let events=tracker.drain();assert.equal(events.length,1);assert.equal(events[0].foot,0);assert.equal(events[0].owner,owner);
pose([.002,.002]);assert.deepEqual(tracker.drain(),[]);
for(let i=0;i<10;i++){time+=.016;pose([.009,.002]);time+=.016;pose([.007,.002]);}assert.deepEqual(tracker.drain(),[],'Floor jitter does not rearm');
time+=.016;pose([.002,.06],{phase:'turn'});time+=.016;pose([.002,.002],{phase:'turn'});
events=tracker.drain();assert.equal(events.length,1);assert.equal(events[0].foot,1);assert.equal(events[0].phase,'turn');
time+=.016;pose([.06,.002]);time+=.016;pose([.002,.002]);pose([.002,.002],{enabled:false});assert.deepEqual(tracker.drain(),[],'Pause discards queued contact at same time');
time+=.016;pose([.002,.002]);assert.deepEqual(tracker.drain(),[]);
for(const options of [{owner:{}},{body:{x:10,y:10}},{time:0},{time:time+2}]){
 time+=.016;pose([.06,.002]);pose([.002,.002],options);assert.deepEqual(tracker.drain(),[],'Discontinuity cannot manufacture a landing');
}
console.log(JSON.stringify({passed:true,checks:['one cue per airborne-to-ground contact; both feet and turn contacts','duplicate drains/renders and floor jitter do not repeat cues','pause, new run, teleport, rewind and long gaps discard stale contacts']}));
