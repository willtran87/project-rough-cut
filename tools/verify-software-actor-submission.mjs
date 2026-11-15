import assert from 'node:assert/strict';
import {separateSoftwareActorDraws} from '../web/software-actor-submission.js';

const live=new Set(),events=[];let serial=0;
const gl={SYNC_GPU_COMMANDS_COMPLETE:123,
 fenceSync(condition,flags){assert.equal(condition,123);assert.equal(flags,0);const sync=++serial;live.add(sync);events.push('fence');return sync;},
 flush(){events.push('flush');},deleteSync(sync){assert(live.delete(sync));events.push('delete');}};
const args=['renderer','scene','camera','geometry','material'];
const mesh={isMesh:true,onBeforeRender(...a){assert.equal(this,mesh);assert.deepEqual(a,args);events.push('before');},onAfterRender(...a){assert.equal(this,mesh);assert.deepEqual(a,args);events.push('after');}};
const before=mesh.onBeforeRender,after=mesh.onAfterRender;
const group={isMesh:false};
const submission=separateSoftwareActorDraws({getContext:()=>gl},{traverse(fn){fn(group);fn(mesh);}});
for(let i=0;i<1000;i++){mesh.onBeforeRender(...args);mesh.onAfterRender(...args);assert.equal(live.size,0);}
assert.deepEqual(events.slice(0,8),['fence','flush','delete','before','after','fence','flush','delete']);
assert.equal(serial,2000);assert.equal(group.onBeforeRender,undefined);
submission.dispose();submission.dispose();assert.equal(mesh.onBeforeRender,before);assert.equal(mesh.onAfterRender,after);
console.log('PASS: hooks preserve receiver/arguments, 2000 fences released, disposal restores callbacks.');
