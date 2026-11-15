import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TURF_RANGE,TURF_CONDITION_PATCHES,turfConditionAt} from '../web/final-cut-turf-layout.js';
import {solid} from '../web/final-cut-course.js';

const affected=[0,0,0],max=[0,0,0];let samples=0;
for(let y=4;y<=100;y+=.25)for(let x=-24;x<=24;x+=.25){
 const v=turfConditionAt(x,y);assert(v.every(n=>Number.isFinite(n)&&n>=0&&n<=1));samples++;
 for(let i=0;i<3;i++){max[i]=Math.max(max[i],v[i]);if(v[i]>.05)affected[i]++;}
 if(v[2]>.1)assert(!solid({x,y},0),'Worn entrance ground must not imply a route through solid cover');
}
for(const p of [[-25,40],[25,40],[0,3],[0,101]])assert.deepEqual(turfConditionAt(...p),[0,0,0],'Material treatment ends at the authored course extent');
assert(turfConditionAt(-16.5,40)[0]>.5,'West maintenance crown remains readable');
assert(turfConditionAt(19,61)[0]<.1,'Maintained fairway retains much lighter stress variation');
assert(turfConditionAt(14.8,74)[1]>.5,'Poorly drained nursery margin is damp');
assert(turfConditionAt(16.2,39.1)[2]>.5,'Actual foot traffic can wear maintained turf at the pump entrance');
assert.deepEqual(turfConditionAt(0,88),[0,0,0],'Central putting surface stays intact');
assert(affected[0]>5000&&affected[0]<samples*.25);assert(affected[1]>1000&&affected[1]<samples*.1);assert(affected[2]>50&&affected[2]<samples*.01);
const report={passed:true,patches:TURF_CONDITION_PATCHES.length,range:TURF_RANGE,samples,affected,max};
fs.mkdirSync('output/final-cut/turf-condition',{recursive:true});fs.writeFileSync('output/final-cut/turf-condition/layout.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
