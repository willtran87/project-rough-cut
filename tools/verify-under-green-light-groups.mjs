import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {groupDrainSurfaceLights} from '../web/under-green-light-groups.js';

const box=(x,y,z,w=.1)=>{const g=new T.BoxGeometry(w,w,w);g.translate(x,y,z);return g;};
const near=box(0,2,0),nearOtherCell=box(.5,2,0),far=box(9,2,0),grazing=box(2.059,2,0),outside=box(2.061,2,0);
const root={type:'root',parts:[box(0,2,1)]},metal={type:'iron',parts:[box(0,2,1)]};
const batches=[{type:'floor',parts:[near,far]},{type:'floor',parts:[nearOtherCell,grazing,outside]},root,metal,{type:'rootStone',parts:[box(0,2,0)]}];
const original=batches.flatMap(b=>b.parts),snapshots=original.map(g=>g.attributes.position.array.slice());
const result=groupDrainSurfaceLights(batches.values(),[{x:0,y:0,height:2,reach:2}]);
assert(result.includes(root)&&result.includes(metal),'Fine geometry must keep original batching');
assert.equal(result.filter(b=>b.type==='floor').length,2,'Compatible surfaces should merge across cells');
const lit=result.find(b=>b.parts.includes(near));
assert(lit.parts.includes(nearOtherCell)&&lit.parts.includes(grazing));
assert(!lit.parts.includes(outside)&&!lit.parts.includes(far),'Grazing cutoff must retain the conservative margin');
assert(!lit.parts.includes(batches[4].parts[0]),'Different materials must not merge');
const after=result.flatMap(b=>b.parts);assert.equal(after.length,original.length);assert.equal(new Set(after).size,original.length);
for(let i=0;i<original.length;i++){assert(after.includes(original[i]));assert.deepEqual(original[i].attributes.position.array,snapshots[i]);}
assert.deepEqual(batches[0].parts,[near,far],'Input partitions must not mutate');
assert.equal(groupDrainSurfaceLights([{type:'floor',parts:[near,far]}],[]).length,1,'No-light geometry remains drawable');
for(const g of original)g.dispose();
console.log(JSON.stringify({passed:true,cases:8,originalParts:original.length,groups:result.length}));
