import assert from 'node:assert/strict';
import {stationMechanismPose as pose} from '../web/station-feedback.js';
const frame=(id,age,extra={})=>({completed:[id],activation:{id,duration:1.45,timer:1.45-age},...extra});
assert.equal(pose({completed:[],quietProgress:.5},'field-log','log').stamp,.5);
assert.equal(pose({completed:[]},'field-log','log').stamp,0);
assert.equal(pose(frame('field-log',0),'field-log','log').stamp,1);
assert.equal(pose(frame('field-log',.48),'field-log','log').stamp,0);
assert(pose(frame('field-log',.48,{stationChoice:{id:'field-log',signalSeconds:0}}),'field-log','log').stamp>0);
assert.equal(pose(frame('release-review',0),'release-review','release').release,0);
assert.equal(pose(frame('release-review',.64),'release-review','release').receipt,1);
for(const kind of ['log','release'])for(const age of [0,.1,.5,1.45]){
 const id=kind==='log'?'field-log':'release-review',f=frame(id,age);
 const before=JSON.stringify(f),a=pose(f,id,kind);
 assert.deepEqual(pose(f,id,kind),a);assert.equal(JSON.stringify(f),before);
 for(const x of [a.stamp,a.release,a.receipt])assert(x>=0&&x<=1);
 const reduced=pose({...f,reducedMotion:true},id,kind);assert.equal(reduced.stamp,0);assert.equal(reduced.release,1);assert.equal(reduced.receipt,1);assert(reduced.ink);
}
assert.equal(pose({completed:['release-review']},'release-review','release').phase,'filed');
assert.equal(pose({completed:[]},'release-review','release').receipt,0);
console.log('Station mechanism clocks, quiet/loud contact, durable completion, cancellation and comfort pass');

for(const [id,kind,quiet]of [['field-log','log',true],['field-log','log',false],['release-review','release',false]]){
 const f={completed:[id],stationResponses:[{id,quiet,startedAt:20}],time:20};
 assert.equal(pose(f,id,kind).phase,'answering');
 const half=pose({...f,time:20.4},id,kind),settled=pose({...f,time:22},id,kind);
 if(kind==='log'&&!quiet){assert(Math.abs(half.stamp-1)<1e-12);assert.equal(settled.stamp,0);assert.equal(settled.pageTurn,0);}
 if(kind==='log'&&quiet){assert(half.pageTurn>0&&half.pageTurn<1);assert.equal(settled.pageTurn,1);assert.equal(half.stamp,0);}
 if(kind==='release'){assert(half.hoodClose>0&&half.hoodClose<1);assert.equal(settled.hoodClose,1);assert.equal(settled.receipt,1);}
 const before=structuredClone(f);assert.deepEqual(pose(f,id,kind),pose(f,id,kind));assert.deepEqual(f,before);
 const reduced=pose({...f,reducedMotion:true},id,kind);assert.equal(reduced.stamp,0);assert.equal(reduced.pageTurn,kind==='log'&&quiet?1:0);assert.equal(reduced.hoodClose,kind==='release'?1:0);
 assert.equal(pose({...f,completed:[]},id,kind).phase,'ready');
 assert.equal(settled.phase,'filed');
}
console.log('One-shot station reply poses, persistent results and reduced motion pass');
