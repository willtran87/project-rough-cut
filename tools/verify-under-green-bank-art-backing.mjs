import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {floorLayout} from '../web/under-green-course.js';
import {structureEdges} from '../web/under-green-structure.js';
import {bunkerBankFaceGeometry} from '../web/under-green-bunker-bank-face.js';
import {trimCoveredBankBacking} from '../web/under-green-bank-backing.js';
const edges=structureEdges(floorLayout().tiles).filter(e=>e.kind==='retaining'&&(e.axis==='x'?e.line:(e.start+e.end)/2)<-12);
const material=new T.MeshBasicMaterial({side:T.DoubleSide}),ray=new T.Raycaster(),rows=[];let rays=0;
for(const edge of edges){
 const inward=-edge.side,west=edge.axis==='x'&&edge.line===-32,length=edge.end-edge.start,mid=(edge.start+edge.end)/2;
 const banks=[0,1,2].map(layer=>{const m=new T.Mesh(bunkerBankFaceGeometry(edge,layer),material);m.updateMatrixWorld();return m;});
 for(const frontDepth of [west?-.03:.07,west?.02:.14]){
  const center=edge.line+inward*(frontDepth-.01),g=new T.BoxGeometry(edge.axis==='x'?.02:length,1,edge.axis==='x'?length:.02);
  g.translate(edge.axis==='x'?center:mid,3,-(edge.axis==='x'?mid:center));const before=g.index.array.slice();
  assert.equal(trimCoveredBankBacking(g,[edge]).removed,0,'Trimmed a face outside the closed bank volume');assert.deepEqual(g.index.array,before);g.dispose();
 }
 for(const [height,tall]of [[1.05,2.1],[2.48,.76],[3.92,2.12]]){
  const depth=west?6:.22,center=edge.line-(west?inward*3:0);
  const g=new T.BoxGeometry(edge.axis==='x'?depth:length,tall,edge.axis==='x'?length:depth);
  g.translate(edge.axis==='x'?center:mid,height,-(edge.axis==='x'?mid:center));g.computeBoundingBox();
  const prior=g.clone(),originalBounds=g.boundingBox.clone(),result=trimCoveredBankBacking(g,[edge]);g.computeBoundingBox();
  assert(g.boundingBox.equals(originalBounds),'Changed conservative bound');
  for(const a of Object.values(g.attributes))assert(Array.from(a.array).every(Number.isFinite));
  // Original vertices and their attributes stay byte-identical; clipping only
  // appends interpolated vertices on the original planar box face.
  for(const name of Object.keys(prior.attributes))assert.deepEqual(g.attributes[name].array.slice(0,prior.attributes[name].array.length),prior.attributes[name].array);
  const before=new T.Mesh(prior,material),after=new T.Mesh(g,material);before.updateMatrixWorld();after.updateMatrixWorld();
  for(const fraction of [.0001,.1,.25,.5,.75,.9,.9999])for(const h of [1.6,1.88,1.882,2.1,2.4,2.86,3.3,4.02,4.898,4.9,4.93,5.1]){
   const u=edge.start+length*fraction;
   const origin=new T.Vector3(edge.axis==='x'?edge.line+inward*1.3:u,h,-(edge.axis==='x'?u:edge.line+inward*1.3));
   const direction=new T.Vector3(edge.axis==='x'?-inward:0,0,edge.axis==='x'?0:inward);
   ray.set(origin,direction);ray.far=8;
   const a=ray.intersectObjects([before,...banks],false)[0],b=ray.intersectObjects([after,...banks],false)[0];
   assert.equal(!!a,!!b,'Opened bank enclosure');if(a)assert(Math.abs(a.distance-b.distance)<.00001,'Changed nearest visible surface');rays++;
  }
  for(const fraction of [.0001,.5,.9999])for(const h of [1.88,1.9,2.1,2.86,4.1,4.88,4.9,4.98])for(const distance of [.32,1.3,4])for(const eye of [1.12,1.65])for(const alongOffset of [-1,0,1]){
   const u=edge.start+length*fraction,target=new T.Vector3(edge.axis==='x'?edge.line:u,h,-(edge.axis==='x'?u:edge.line));
   const origin=new T.Vector3(edge.axis==='x'?edge.line+inward*distance:u+alongOffset,eye,-(edge.axis==='x'?u+alongOffset:edge.line+inward*distance));
   ray.set(origin,target.clone().sub(origin).normalize());ray.far=10;
   const a=ray.intersectObjects([before,...banks],false)[0],b=ray.intersectObjects([after,...banks],false)[0];
   assert.equal(!!a,!!b,'Opened bank at oblique angle');if(a)assert(Math.abs(a.distance-b.distance)<.00001,'Changed oblique surface');rays++;
  }
  rows.push({edge,height,...result});g.dispose();prior.dispose();
 }
 for(const m of banks)m.geometry.dispose();
}
material.dispose();
const report={passed:true,edges:edges.length,cases:rows.length,rays,rows};fs.writeFileSync('output/under-green/visual-pass104/backing-unit.json',JSON.stringify(report,null,2));console.log({passed:true,edges:edges.length,cases:rows.length,rays});
