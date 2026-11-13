import assert from 'node:assert/strict';
import {observeCoverMemory,knownCover} from '../web/course-cover-memory.js';
const obstacles=[{id:'wall',x:0,y:20,blocks:true,sight:true,coverRadius:20,landmark:'wall'}];
for(const kind of ['sight','sound','trail']){
 const m={},source={point:{x:0,y:10},time:10,kind};observeCoverMemory(m,source,obstacles,10);assert.equal(m.observedShelter.id,'cover:wall');assert.equal(m.observedShelter.visits,1);
 for(let i=0;i<100;i++)observeCoverMemory(m,source,obstacles,11);assert.equal(m.observedShelter.visits,1);
 observeCoverMemory(m,{...source,time:14},obstacles,14);assert.equal(m.observedShelter.visits,2);assert.equal(m.observedShelter.since,10);
 assert(knownCover(m,34));assert.equal(knownCover(m,34.01),null);
 observeCoverMemory(m,{...source,time:35},obstacles,35);assert.equal(m.observedShelter.since,35);assert.equal(m.observedShelter.visits,1);
 observeCoverMemory(m,{...source,time:36,point:{x:100,y:100}},obstacles,36);assert.equal(m.observedShelter,null);
}
for(const source of [null,{kind:'golf_ball',time:10,point:{x:0,y:10}},{kind:'sight',time:1,point:{x:0,y:10}},{kind:'sight',time:11,point:{x:0,y:10}}]){const m={};observeCoverMemory(m,source,obstacles,10);assert.equal(m.observedShelter,undefined);}
console.log('Cover memory: only confirmed player evidence, duplicate suppression, observed revisits, expiry and superseding observation pass');
