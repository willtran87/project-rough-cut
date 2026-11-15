import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {sceneryContactPatch,createSceneryContacts} from '../web/back-nine-scenery-contact.js';
import {terrainHeight} from '../web/course-terrain.js';
import {COURSE} from '../web/back-nine-course.js';
import {DETAIL_PLANTS} from '../web/back-nine-planting.js';
import {createRun} from '../web/back-nine-sim.js';
let checked=0;
for(const [x,y,rx,ry]of [[21,65,.6,.3],[-8,242,.7,3],[12,500,8,.25]])for(const yaw of [0,.3,1.8]){
 const g=sceneryContactPatch({x,y,rx,ry,yaw}),p=g.attributes.position,n=g.attributes.normal;
 for(let i=0;i<g.index.count;i+=3){
  const ids=[0,1,2].map(j=>g.index.getX(i+j)),xx=ids.reduce((s,j)=>s+p.getX(j),0)/3,yy=ids.reduce((s,j)=>s+p.getY(j),0)/3,zz=ids.reduce((s,j)=>s+p.getZ(j),0)/3;
  assert(Math.abs(yy-terrainHeight(xx,-zz)-.061)<.0001,'Triangle interior follows terrain');assert(ids.every(j=>n.getY(j)>0));checked++;
 }g.dispose();
}
const scene=new THREE.Scene(),art=createSceneryContacts(scene,COURSE,DETAIL_PLANTS),r=createRun(0,0,713);art.update(r);const uploads=art.stats().updates;art.update(r);assert.equal(art.stats().updates,uploads);
const first=scene.children.map(m=>m.geometry.attributes.color.array.slice());r.destruction.props[0].brokenAt=1;art.update(r);assert(art.stats().updates>uploads);assert(scene.children.some((m,i)=>m.geometry.attributes.color.array.some((v,j)=>v!==first[i][j])));
r.destruction.features['range-abandoned-cart'].y=461;art.update(r);assert.equal(art.stats().updates,uploads+2);
art.update(createRun(0,0,713));assert(scene.children.every((m,i)=>m.geometry.attributes.color.array.every((v,j)=>v===first[i][j])));
const stats=art.stats();art.dispose();assert.equal(scene.children.length,0);console.log(JSON.stringify({passed:true,checkedTriangles:checked,...stats}));
