import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createRigidVertexBatches as createRigidInstanceCulling} from '../web/rigid-vertex-batches.js';
const scene=new THREE.Scene(),g=new THREE.BoxGeometry(),material=new THREE.MeshLambertMaterial();
const mesh=new THREE.InstancedMesh(g,material,3),caster=new THREE.InstancedMesh(g,material,1),untagged=new THREE.InstancedMesh(g,material,1);
mesh.userData.rigidInstanceBounds=caster.userData.rigidInstanceBounds=true;caster.castShadow=true;scene.add(mesh,caster,untagged);
const transforms=[new THREE.Matrix4().compose(new THREE.Vector3(0,0,0),new THREE.Quaternion().setFromEuler(new THREE.Euler(.2,.4,.1)),new THREE.Vector3(1,2,.5)),new THREE.Matrix4().makeTranslation(100,0,0),new THREE.Matrix4().makeTranslation(1,0,0)];
transforms.forEach((m,i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,new THREE.Color([0xff0000,0x00ff00,0x0000ff][i]));});
const originalMatrices=mesh.instanceMatrix.array.slice(),originalColors=mesh.instanceColor.array.slice(),camera=new THREE.PerspectiveCamera(60,1,.1,20);camera.position.z=10;camera.lookAt(0,0,0);
const c=createRigidInstanceCulling(scene);c.update(camera);assert.equal(c.stats().bakedBatches,1);assert.equal(c.stats().bakedVisible,2);assert.equal(untagged.geometry,g);assert.equal(mesh.count,3);
const vertex=new THREE.Vector3();for(const [packed,id]of [0,2].entries())for(let i=0;i<g.attributes.position.count;i++){vertex.fromBufferAttribute(g.attributes.position,i).applyMatrix4(new THREE.Matrix4().fromArray(originalMatrices,id*16));assert.deepEqual(Array.from(mesh.geometry.attributes.position.array.slice((packed*g.attributes.position.count+i)*3,(packed*g.attributes.position.count+i+1)*3)),vertex.toArray().map(Math.fround));}
for(const [packed,id]of [0,2].entries())for(let i=0;i<g.attributes.normal.count;i++){
 const transform=new THREE.Matrix4().fromArray(originalMatrices,id*16),normal=new THREE.Vector3().fromBufferAttribute(g.attributes.normal,i).applyMatrix3(new THREE.Matrix3().getNormalMatrix(transform));
 const actual=new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.normal,packed*g.attributes.normal.count+i);
 assert(actual.distanceTo(normal)<1e-6,'Nonuniform scale must retain the original normal transform');
}
mesh.onBeforeRender();assert.equal(mesh.count,1);assert.equal(mesh.geometry.drawRange.count,g.index.count*2);mesh.onAfterRender();assert.equal(mesh.count,3);
assert.deepEqual(Array.from(mesh.geometry.attributes.instanceColor.array.slice(0,3)),[1,0,0]);assert.deepEqual(Array.from(mesh.geometry.attributes.instanceColor.array.slice(g.attributes.position.count*3,g.attributes.position.count*3+3)),[0,0,1]);
caster.onBeforeShadow();assert.equal(caster.geometry.attributes.instanceMatrix,caster.instanceMatrix);caster.onAfterShadow();
assert.deepEqual(mesh.instanceMatrix.array,originalMatrices);assert.deepEqual(mesh.instanceColor.array,originalColors);
camera.position.x=200;camera.lookAt(200,0,0);c.update(camera);mesh.onBeforeRender();assert.equal(mesh.count,0);assert.equal(mesh.geometry.drawRange.count,0);mesh.onAfterRender();assert.equal(mesh.count,3);
c.setEnabled(false);assert.equal(mesh.geometry,g);mesh.onBeforeRender();assert.equal(mesh.count,3);mesh.onAfterRender();c.setEnabled(true);camera.position.x=0;camera.lookAt(0,0,0);c.update(camera);assert.equal(c.stats().bakedVisible,2);
mesh.castShadow=true;c.update(camera);assert.equal(mesh.geometry,g,'A newly enabled shadow caster must restore complete source geometry');mesh.onBeforeRender();assert.equal(mesh.count,3);mesh.onAfterRender();mesh.castShadow=false;c.update(camera);assert.notEqual(mesh.geometry,g);
c.dispose();assert.equal(mesh.geometry,g);assert.equal(mesh.count,3);assert.equal(mesh.userData.rigidInstanceBounds,true);
console.log('PASS: transformed vertices, colors, stable ordering, full shadow fallback, zero-visible batches, original simulation matrices/counts, toggling and disposal.');
