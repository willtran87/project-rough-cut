import assert from 'node:assert/strict';
import {prepareCourseTextures} from '../web/course-render-preparation.js';
const size=m=>Math.ceil(m.image.width*m.image.height*4*(m.generateMipmaps?4/3:1));
function fixture(){const batches=[],uploaded=[];let pending=[],deleted=0,fail=false;
 const gl={SYNC_GPU_COMMANDS_COMPLETE:1,ALREADY_SIGNALED:2,CONDITION_SATISFIED:3,WAIT_FAILED:4,fenceSync(){return{};},flush(){batches.push(pending);pending=[];},clientWaitSync(){return fail?4:2;},deleteSync(){deleted++;}};
 return {batches,uploaded,renderer:{getContext:()=>gl,initTexture(m){pending.push(m);uploaded.push(m);}},get deleted(){return deleted},set fail(v){fail=v}};
}
const maps=Array.from({length:13},(_,id)=>({id,image:{width:id===6?1672:128,height:id===6?941:128},generateMipmaps:true}));
const f=fixture(),report=await prepareCourseTextures(f.renderer,maps);
assert.deepEqual(f.uploaded,maps,'every original texture is uploaded exactly once in order');
assert(f.batches.length<maps.length,'small maps share submission waits');
for(const batch of f.batches){assert(batch.length<=4);if(batch.length>1)assert(batch.reduce((n,m)=>n+size(m),0)<=2*1024*1024,'multi-map batch stays within 2 MiB including mips');}
assert(f.batches.some(b=>b.length===1&&b[0]===maps[6]),'existing large atlas is isolated');assert.equal(f.deleted,report.batches);
const stopped=fixture();assert((await prepareCourseTextures(stopped.renderer,maps,()=>true)).cancelled);assert.equal(stopped.uploaded.length,0);
const failed=fixture();failed.fail=true;await assert.rejects(prepareCourseTextures(failed.renderer,maps),/fence failed/);assert.equal(failed.deleted,1,'failed fences are released');
// Hidden tabs submit nothing, yet cancellation can release the waiting task.
globalThis.document={hidden:true};let cancel=false;const hidden=fixture(),waiting=prepareCourseTextures(hidden.renderer,maps,()=>cancel);setTimeout(()=>{cancel=true;},5);assert((await waiting).cancelled);assert.equal(hidden.uploaded.length,0);delete globalThis.document;
console.log('PASS: bounded upload queue, complete art, isolated large atlases, cancellation, hidden tabs and GPU-fence failure cleanup');
