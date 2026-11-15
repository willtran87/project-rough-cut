import assert from 'node:assert/strict';
import {freshCoverRest,advanceCoverRest,coverRestMix} from '../web/course-cover-rest.js';
for(const fps of [30,60,144]){
 const s=freshCoverRest(),f={coverId:'cover:a',eligible:true};
 for(let i=0;i<fps*1.5;i++)advanceCoverRest(s,1/fps,f);assert(!s.active);
 const saved=structuredClone(s);advanceCoverRest(s,100,{...f,paused:true});assert.deepEqual(s,saved);
 for(let i=0;i<fps*8;i++)advanceCoverRest(s,1/fps,f);assert(s.active&&s.amount>.999&&s.entries===1);
 assert.equal(coverRestMix(s,false).amount,0);
 advanceCoverRest(s,1/fps,{...f,coverId:'cover:b'});assert(!s.active);assert(s.settle<.1);
 for(let i=0;i<fps*3;i++)advanceCoverRest(s,1/fps,{...f,coverId:'cover:b'});assert(s.active&&s.entries===2);
 advanceCoverRest(s,.1,{eligible:false});assert(!s.active);for(let i=0;i<fps*3;i++)advanceCoverRest(s,1/fps,{eligible:false});assert(s.amount<.0001);
 const quiet=freshCoverRest();advanceCoverRest(quiet,5,{...f,clear:false});assert(!quiet.active&&quiet.settle===0);
}
console.log('Cover relief: actual eligibility, dwell, repeat entry, pause and 30/60/144Hz release pass');
