import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {partitionDrainSurfaces} from '../web/under-green-light-partitions.js';
import {createDrainFlood} from '../web/under-green-flood-scene.js';
import {floorLayout} from '../web/under-green-course.js';

const scene=new THREE.Scene(),material=new THREE.MeshPhongMaterial(),parts=[];
for(const x of [-28,-12,-1,0,12,29])for(const z of [-70,-11,0,28]){
 const g=new THREE.PlaneGeometry(3.7,6.3,2,3);g.rotateX(-Math.PI/2);g.translate(x,.012,z);parts.push(g);
}
function triangles(geometries){return geometries.flatMap(g=>{
 const result=[],p=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal;
 for(let i=0;i<g.index.count;i+=3){const triangle=[];for(let j=0;j<3;j++){const k=g.index.getX(i+j);triangle.push([p.getX(k),p.getY(k),p.getZ(k),uv.getX(k),uv.getY(k),n.getX(k),n.getY(k),n.getZ(k)]);}result.push(JSON.stringify(triangle));}return result;
}).sort();}
const original=triangles(parts),effect=partitionDrainSurfaces(scene,parts,material,'Geometry preservation',.4);
assert.deepEqual(triangles(effect.root.children.map(m=>m.geometry)),original);
effect.setRenderOrder(-1);assert(effect.root.children.every(m=>m.renderOrder===-1&&m.userData.drainStaticLight));
const groups=effect.root.children.length;effect.dispose();assert.equal(scene.children.length,0);material.dispose();

const flood=createDrainFlood(scene,floorLayout());scene.updateMatrixWorld(true);
const envelopes=new Map();scene.traverse(m=>{if(m.isMesh){m.geometry.computeBoundingBox();envelopes.set(m,m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld).expandByScalar((m.userData.drainLightPadding??0)+1e-7));}});
let samples=0,vertices=0;const v=new THREE.Vector3();
for(let elapsed=0;elapsed<=150;elapsed+=.125){
 flood.update({elapsed},false);scene.updateMatrixWorld(true);const state=flood.stats();assert(state.depth<=.38&&state.depth>=0);
 for(const [mesh,bounds]of envelopes){
  const p=mesh.geometry.attributes.position;
  // Every floor and wall-film vertex stays in the immutable light envelope
  // throughout two complete rise/hold/recession cycles.
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);assert(bounds.containsPoint(v));vertices++;}
 }
 samples++;
}
flood.dispose();assert.equal(scene.children.length,0);
console.log(JSON.stringify({passed:true,triangles:original.length,groups,cycleSamples:samples,vertices,remainingObjects:scene.children.length}));
