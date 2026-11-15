import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {floorLayout} from '../web/under-green-course.js';
import {isGalleryRepairWall,galleryRepairBacking} from '../web/under-green-gallery-backing.js';
import {GALLERY_RENDER_PATCHES,galleryRenderGeometry} from '../web/under-green-gallery-render.js';

const material=new T.MeshBasicMaterial({side:T.FrontSide}),before=[],after=[],parts=[];
for(const w of floorLayout().walls){
 const p={...w,base:0,height:w.covered?4.2:1.8};if(!isGalleryRepairWall(p))continue;
 const matrix=new T.Matrix4().compose(new T.Vector3(p.x,p.height/2,-p.y),new T.Quaternion(),new T.Vector3(p.w,p.height,p.d));
 const original=new T.BoxGeometry(1,1,1).applyMatrix4(matrix),clipped=galleryRepairBacking(original);assert(clipped);
 before.push(new T.Mesh(original,material));after.push(new T.Mesh(clipped,material));
 for(const a of Object.values(clipped.attributes))assert([...a.array].every(Number.isFinite));
 assert.deepEqual(clipped.boundingBox.min.toArray(),original.boundingBox.min.toArray());assert.deepEqual(clipped.boundingBox.max.toArray(),original.boundingBox.max.toArray());
 parts.push({y:p.y,depth:p.d,oldTriangles:original.index.count/3,newTriangles:clipped.attributes.position.count/3});
}
assert.equal(parts.length,4);
const distant=new T.BoxGeometry(1,1,1).applyMatrix4(new T.Matrix4().compose(new T.Vector3(3,2.1,-24),new T.Quaternion(),new T.Vector3(.22,4.2,3)));
assert.equal(galleryRepairBacking(distant),null,'Unrelated wall may not lose its inner face');distant.dispose();
const plaster=new T.Mesh(galleryRenderGeometry(GALLERY_RENDER_PATCHES.find(p=>p.id==='east-drain-repair')),material);
before.push(plaster);after.push(plaster);before.forEach(m=>m.updateMatrixWorld());after.forEach(m=>m.updateMatrixWorld());
const ray=new T.Raycaster();let samples=0,maxDifference=0;
function compare(origin,target){
 ray.set(origin,new T.Vector3().subVectors(target,origin).normalize());const a=ray.intersectObjects(before)[0],b=ray.intersectObjects(after)[0];
 assert(a&&b,'Wall coverage lost');const difference=Math.abs(a.distance-b.distance);maxDifference=Math.max(maxDifference,difference);
 assert(difference<1e-5,`Visible surface changed by ${difference} at ${target.toArray()}`);samples++;
}
for(let u=16.05;u<20.10;u+=.09)for(let h=.07;h<4.16;h+=.09){
 const target=new T.Vector3(2.89,h,-u);
 compare(new T.Vector3(1.2,h,-u),target);
 for(const offset of [-1.4,1.4])compare(new T.Vector3(2.3,h+.12,-u+offset),target);
 compare(new T.Vector3(3.8,h,-u),new T.Vector3(3.11,h,-u));
}
// Fine samples across the chipped outer edge and both brick windows exercise
// overlaps that a regular grid can miss, including nearly grazing sightlines.
const p=plaster.geometry.attributes.position;
for(let i=0;i<p.count;i+=3)for(const offset of [-.02,0,.02]){
 const u=-p.getZ(i),h=p.getY(i)+offset;if(u<16.02||u>20.10||h<.03||h>4.17)continue;
 for(const shift of [-1.8,0,1.8])compare(new T.Vector3(2.7,h,-u+shift),new T.Vector3(2.89,h,-u));
}
const result={passed:true,parts,samples,maxDifference};fs.mkdirSync('output/under-green/visual-pass101/geometry',{recursive:true});fs.writeFileSync('output/under-green/visual-pass101/geometry/report.json',JSON.stringify(result,null,2));console.log(result);
