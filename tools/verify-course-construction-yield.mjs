import assert from 'node:assert/strict';
import {createCourseConstructionYield} from '../web/course-render-preparation.js';

const original={performance:Object.getOwnPropertyDescriptor(globalThis,'performance'),scheduler:Object.getOwnPropertyDescriptor(globalThis,'scheduler'),timeout:globalThis.setTimeout};
let now=0,ordinary=0,scheduled=0;
try{
 Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
 Object.defineProperty(globalThis,'scheduler',{configurable:true,value:{yield:async()=>{scheduled++;}}});
 globalThis.setTimeout=callback=>{ordinary++;callback();};
 const first=createCourseConstructionYield();
 assert.equal(await first(),true);assert.equal(ordinary,1);
 for(now=1;now<32;now++)await first();
 assert.equal(scheduled,31);assert.equal(ordinary,1);
 await first();assert.equal(ordinary,2,'Ordinary work must get a turn at the deadline');
 const second=createCourseConstructionYield();await second();assert.equal(ordinary,3,'Independent builds must not share a deadline');
 const before=[ordinary,scheduled];assert.equal(await first(()=>true),false);assert.deepEqual([ordinary,scheduled],before,'Cancelled work must not queue another continuation');
 let cancelled=false;globalThis.scheduler.yield=async()=>{cancelled=true;};assert.equal(await first(()=>cancelled),false);
 delete globalThis.scheduler;await first();assert.equal(ordinary,4,'No scheduler falls back to a real task');
}finally{
 Object.defineProperty(globalThis,'performance',original.performance);
 if(original.scheduler)Object.defineProperty(globalThis,'scheduler',original.scheduler);else delete globalThis.scheduler;
 globalThis.setTimeout=original.timeout;
}
globalThis.document={hidden:true};
try{
 let finished=false,cancelled=false;const job=createCourseConstructionYield()(()=>cancelled).then(v=>{finished=true;return v;});
 await new Promise(r=>setTimeout(r,12));assert.equal(finished,false,'Hidden preparation stays paused');cancelled=true;assert.equal(await job,false,'Cancellation releases a hidden build');
 const resumed=createCourseConstructionYield()();setTimeout(()=>{document.hidden=false;},5);assert.equal(await resumed,true);
}finally{delete globalThis.document;}
console.log('PASS: regular ordinary-task turns, independent scene deadlines, scheduler fallback, cancellation, hidden pause and resume');
