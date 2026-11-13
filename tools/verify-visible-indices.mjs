import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createIndexArray,compactVisibleIndices} from '../web/visible-indices.js';

assert(createIndexArray(65535,3) instanceof Uint16Array);
assert(createIndexArray(65536,3) instanceof Uint32Array);
const wide=createIndexArray(65536,1);wide[0]=65535;assert.equal(wide[0],65535);
for(const vertices of [65535,65536]){
  const source=createIndexArray(vertices,54);
  for(let i=0;i<source.length;i++)source[i]=vertices===65536?65535-i:i;
  const parts=[3,6,9,12,15,9].map((count,i,counts)=>({offset:counts.slice(0,i).reduce((a,b)=>a+b,0),count,visible:true}));
  const g=new THREE.BufferGeometry();g.setIndex(new THREE.BufferAttribute(source.slice(),1));
  const gpu=createIndexArray(vertices,source.length);
  const expected=()=>parts.flatMap(p=>p.visible?Array.from(source.slice(p.offset,p.offset+p.count)):[]);
  function flush(){for(const r of g.index.updateRanges)gpu.set(g.index.array.subarray(r.start,r.start+r.count),r.start);g.index.clearUpdateRanges();assert.deepEqual(Array.from(gpu.slice(0,g.drawRange.count)),expected());}
  assert.equal(compactVisibleIndices(g,parts,source),source.length);flush();
  const version=g.index.version;assert.equal(compactVisibleIndices(g,parts,source),0);assert.equal(g.index.version,version);
  parts.at(-1).visible=false;assert.equal(compactVisibleIndices(g,parts,source),0);assert.equal(g.index.version,version);flush();
  // Exercise disappear/reappear, shifted runs, empty batches and delayed GPU
  // uploads. The GPU prefix must match a fresh full compaction after each flush.
  for(let frame=0;frame<256;frame++){
    for(let i=0;i<parts.length;i++)parts[i].visible=Boolean((frame^(frame>>2))&(1<<i));
    compactVisibleIndices(g,parts,source);
    assert.deepEqual(Array.from(g.index.array.slice(0,g.drawRange.count)),expected());
    if(frame%7===0)flush();
  }
  flush();g.dispose();
}
console.log('PASS: lossless 16/32-bit limits, unchanged/tail-only views, 512 visibility transitions and deferred GPU uploads');
