import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {mergeIndexedGeometries} from '../web/indexed-geometry.js';
const source=[new T.BoxGeometry(1,2,3),new T.SphereGeometry(2,12,8),new T.IcosahedronGeometry(1,1)];
source.forEach((g,i)=>g.translate(i*7,0,i));
const originals=source.map(g=>g.index?g.toNonIndexed():g.clone()),merged=mergeIndexedGeometries(source),expanded=merged.toNonIndexed();
for(const name of ['position','normal','uv']){
 const expected=originals.flatMap(g=>Array.from(new Uint32Array(g.attributes[name].array.buffer))),actual=Array.from(new Uint32Array(expanded.attributes[name].array.buffer));assert.deepEqual(actual,expected,`${name}: expanded triangle stream must be bit-identical`);
}
assert(merged.attributes.position.count<expanded.attributes.position.count);
for(const count of [65535,65536]){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3));const merged=mergeIndexedGeometries([g]);assert.equal(merged.index.array.at(-1),count-1);if(count===65536)assert(merged.index.array instanceof Uint32Array);}
console.log('PASS: exact triangle/normal/UV streams, mixed indexed inputs, and primitive-restart-safe 16/32-bit boundary.');
