import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createIndexArray,compactVisibleIndices} from '../web/visible-indices.js';
import reference from './fixtures/full-index-reference.cjs';
const {restoreFullIndexReference}=reference;
let transitions=0;
for(const vertexCount of [65535,65536]){
 const source=createIndexArray(vertexCount,54);for(let i=0;i<source.length;i++)source[i]=vertexCount===65536?65535-i:i;
 const counts=[3,6,9,12,15,9],parts=counts.map((count,i)=>({count,offset:counts.slice(0,i).reduce((s,n)=>s+n,0),visible:true}));
 const g=new T.BufferGeometry();g.setIndex(new T.BufferAttribute(source.slice(),1));const mesh=new T.Mesh(g);mesh.userData={fullIndices:source,visibilityParts:parts,compacted:false};
 const gpu=source.slice(),expected=()=>parts.flatMap(p=>p.visible?Array.from(source.slice(p.offset,p.offset+p.count)):[]);
 const upload=()=>{for(const r of g.index.updateRanges)gpu.set(g.index.array.subarray(r.start,r.start+r.count),r.start);g.index.clearUpdateRanges();};
 const verify=()=>assert.deepEqual(Array.from(gpu.slice(0,g.drawRange.count)),expected());
 compactVisibleIndices(g,parts,source);upload();
 for(let mask=0;mask<64;mask++){
  const visible=parts.map((_,i)=>Boolean(mask&(1<<i)));parts.forEach((p,i)=>p.visible=visible[i]);compactVisibleIndices(g,parts,source);
  // Leave some compaction uploads pending when the oracle overwrites the CPU
  // array, including empty, prefix-only and widely separated visible parts.
  if(mask%2)upload();mesh.visible=mask!==0;
  if(mask===10){
   // Reproduce the previous oracle bug independently of partial uploads:
   // it replaced the packed data while retaining the old run-offset cache.
   upload();g.index.array.set(source);g.index.addUpdateRange(0,source.length);g.index.needsUpdate=true;
   compactVisibleIndices(g,parts,source);upload();
   assert.notDeepEqual(Array.from(gpu.slice(0,g.drawRange.count)),expected(),'Legacy overwrite must reproduce the corrupted restoration');
  }
  restoreFullIndexReference(mesh);assert(mesh.visible);assert(parts.every(p=>p.visible&&p.drawOffset===-1));assert.equal(mesh.userData.compacted,false);upload();verify();
  assert.deepEqual(Array.from(gpu),Array.from(source));
  // Restore exactly the same view. Old cached draw offsets used to skip these
  // copies, leaving packed offsets pointing into the full reference buffer.
  parts.forEach((p,i)=>p.visible=visible[i]);compactVisibleIndices(g,parts,source);upload();verify();transitions++;
 }
 g.dispose();mesh.material.dispose();
}
console.log(JSON.stringify({passed:true,transitions,checks:['16/32-bit buffers','Every visibility mask','Deferred partial uploads','Full reference material visibility','Same-camera compaction restoration']}));
