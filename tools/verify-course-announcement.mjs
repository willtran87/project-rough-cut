import assert from 'node:assert/strict';
import {createCourseAnnouncement} from '../web/course-announcement.js';
function mock(){
 const sources=[];const param=()=>({value:0,setTargetAtTime(value){this.value=value;}});
 const context={currentTime:0,createGain:()=>({gain:param(),connect(){},disconnect(){}}),createStereoPanner:()=>({pan:param(),connect(){},disconnect(){}}),createBufferSource(){const node={connect(){},disconnect(){},start(_,offset){this.offset=offset;this.started=true;},stop(){this.stopped=true;}};sources.push(node);return node;}};
 return {context,sources};
}
const {context,sources}=mock(),pa=createCourseAnnouncement(context,{}, {load:async()=>({duration:2.52})});await pa.ready;
let arrival={lockAt:.55,age:.55,phase:'latched'},frame={arrival,active:true,clear:true,pan:.4,level:.7};
pa.update(frame);assert.equal(sources.length,0);arrival.age=.73;pa.update(frame);assert.equal(sources.length,1);
pa.update(frame);assert.equal(sources.length,1);assert.equal(pa.stats().starts,1);
pa.update({...frame,active:false});assert(sources[0].stopped);context.currentTime=10;pa.update(frame);assert.equal(sources.length,2);assert.equal(sources[1].offset,0);assert.equal(pa.stats().resumes,1);
arrival.age+=.4;context.currentTime+=.4;pa.update(frame);assert.equal(sources.length,2);
pa.update({...frame,clear:false});assert(sources[1].stopped);pa.update(frame);assert.equal(sources.length,2);
arrival={...arrival,age:.73};frame={...frame,arrival};pa.update(frame);assert.equal(sources.length,3);
arrival.age=5;pa.update(frame);assert(sources[2].stopped);assert.equal(pa.stats().playing,false);
pa.dispose();pa.update({...frame,arrival:{...arrival,age:.73}});assert.equal(sources.length,3);
let resolve;const slow=mock(),late=createCourseAnnouncement(slow.context,{}, {load:()=>new Promise(r=>resolve=r)});await Promise.resolve();
const lateFrame={...frame,arrival:{age:1.4,lockAt:.55,phase:'latched'}};late.update(lateFrame);resolve({duration:2.52});await late.ready;late.update(lateFrame);assert.equal(slow.sources.length,0);
const failed=createCourseAnnouncement(mock().context,{}, {load:async()=>{throw Error('offline');}});await failed.ready;assert.equal(failed.stats().error,'offline');failed.update(lateFrame);
console.log('PA lifecycle: one voice, offset resume, threat cancel, retry, completion, dispose, late/failed load pass.');
