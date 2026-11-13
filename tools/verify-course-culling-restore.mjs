import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createCourseBatchCulling} from '../web/course-batch-culling.js';
import {mergeIndexedGeometries} from '../web/indexed-geometry.js';

const parts=[[-8,0,-8],[0,0,-8],[8,0,-8],[0,0,8]].map(([x,y,z])=>new THREE.BoxGeometry(1,1,1).translate(x,y,z));
const geometry=mergeIndexedGeometries(parts);geometry.computeBoundingBox();
const original=Array.from(geometry.index.array),mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());
const culling=createCourseBatchCulling(),pieces=culling.register(mesh,parts);
const camera=new THREE.PerspectiveCamera(45,1,.1,30),gpu=geometry.index.array.slice();
function flush(){for(const range of geometry.index.updateRanges)gpu.set(geometry.index.array.subarray(range.start,range.start+range.count),range.start);geometry.index.clearUpdateRanges();}
for(let i=0;i<48;i++){
 camera.rotation.y=i*Math.PI/8;camera.position.set(Math.sin(i*.4)*3,0,Math.cos(i*.4)*3);
 culling.update(camera);flush();
 const indices=Array.from(geometry.index.array.slice(0,geometry.drawRange.count)),visible=mesh.visible;
 culling.restore();flush();
 assert(mesh.visible);assert.equal(geometry.drawRange.count,original.length);
 assert.deepEqual(Array.from(gpu),original);assert(pieces.every(p=>p.visible&&p.drawOffset===p.offset));
 const version=geometry.index.version;culling.restore();assert.equal(geometry.index.version,version,'Already-restored geometry must not upload again');
 culling.update(camera);flush();
 assert.equal(mesh.visible,visible);
 // A wholly hidden batch may retain either packed or full indices; only its
 // next visible draw must match. Hidden geometry is never submitted.
 if(visible)assert.deepEqual(Array.from(gpu.slice(0,geometry.drawRange.count)),indices);
}
geometry.dispose();mesh.material.dispose();parts.forEach(p=>p.dispose());
// Optional chapter-supplied opaque cover must participate in camera-cache
// invalidation while QA restoration still recovers every original triangle.
const testPart=new THREE.BoxGeometry(1,1,1).translate(0,0,-8),testGeometry=mergeIndexedGeometries([testPart]);testGeometry.computeBoundingBox();
const testMesh=new THREE.Mesh(testGeometry,new THREE.MeshBasicMaterial());let calls=0,hide=true;
const coverCulling=createCourseBatchCulling({occlusion:{update:()=>calls++,hidden:()=>hide}});
coverCulling.register(testMesh,[testPart]);camera.position.set(0,0,0);camera.rotation.set(0,0,0);
coverCulling.update(camera);assert.equal(testGeometry.drawRange.count,0);assert.equal(calls,1);
coverCulling.update(camera);assert.equal(calls,1,'Stationary view does not rebuild opaque cover');
coverCulling.restore();assert.equal(testGeometry.drawRange.count,testGeometry.index.count);
coverCulling.update(camera);assert.equal(testGeometry.drawRange.count,0);assert.equal(calls,2);
hide=false;camera.rotation.y=.01;coverCulling.update(camera);assert.equal(testGeometry.drawRange.count,testGeometry.index.count);assert.equal(calls,3);
testPart.dispose();testGeometry.dispose();testMesh.material.dispose();
console.log('PASS: 48 cull/restore/same-camera recull cycles preserve full QA geometry, packed offsets and GPU index contents');
