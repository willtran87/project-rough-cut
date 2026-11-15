import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {rangeLiningGeometry,rangeLiningAttachment,buildRangeLining,RANGE_LINING_REACH} from '../web/under-green-range-lining.js';

const source=fs.readFileSync('output/under-green/visual-pass97/source/under-green-range-lining-before.js','utf8').replaceAll("'./", "'"+new URL('../web/',import.meta.url).href);
const baseline=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const g=rangeLiningGeometry(),old=baseline.rangeLiningGeometry(),p=g.attributes.position,uv=g.attributes.uv;
assert.deepEqual(g.index.array,old.index.array);assert.equal(p.count,old.attributes.position.count);
for(let i=0;i<p.count;i++){
 assert(Math.abs(p.getX(i)-(7.1+(old.attributes.position.getX(i)-7.1)*RANGE_LINING_REACH))<.000002);
 assert.equal(p.getY(i),old.attributes.position.getY(i));assert.equal(p.getZ(i),old.attributes.position.getZ(i));
 assert(Math.abs(uv.getX(i)-p.getX(i)/2)<.000001);assert(Math.abs(uv.getY(i)+p.getZ(i)/2)<.000001);
}
const attachment=rangeLiningAttachment(g,10.7,28.575);assert(attachment.normal.y<-.8);
const parts=[];
function put(geometry,type,x,y,z){
 for(const a of Object.values(geometry.attributes))assert([...a.array].every(Number.isFinite));
 geometry.computeBoundingBox();const bounds=geometry.boundingBox.clone().translate(new T.Vector3(x,y,z));assert(bounds.min.y>3.5);
 const positions=geometry.attributes.position,worldPoints=[];
 for(let i=0;i<positions.count;i++)worldPoints.push(new T.Vector3().fromBufferAttribute(positions,i).add(new T.Vector3(x,y,z)));
 parts.push({type,min:bounds.min.toArray(),max:bounds.max.toArray(),worldPoints});
}
const result=buildRangeLining({put,box:(type,x,y,z,w,h,d)=>{const q=new T.BoxGeometry(w,h,d);put(q,type,x,y,z);q.dispose();}});
assert(result.bounds.max[0]>12);assert(result.solidRoofRetained);assert.equal(parts.length,22);
// Inspect the actual emitted plate, not a separately reconstructed transform.
// One face touches the real sheet plane; the complete thickness stays below it.
const plate=parts.at(-3);assert.equal(plate.type,'machineSteel');
const distances=plate.worldPoints.map(v=>v.clone().sub(attachment.point).dot(attachment.normal));
const min=Math.min(...distances),max=Math.max(...distances);
assert(min>=-1e-7&&max<=.0250001);assert(distances.filter(v=>Math.abs(v)<1e-7).length>=4);
const maxPlaneError=Math.max(Math.abs(min),Math.abs(max-.025));
const report={passed:true,parts:parts.length,minimumHeight:Math.min(...parts.map(v=>v.min[1])),reach:RANGE_LINING_REACH,platePlaneError:maxPlaneError,attachment:{point:attachment.point.toArray(),normal:attachment.normal.toArray()},sameTopology:true,physicalUVScale:true};
fs.writeFileSync('output/under-green/visual-pass97/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));g.dispose();old.dispose();
