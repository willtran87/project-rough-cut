import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createStaticInstanceCulling} from '../web/static-instance-culling.js';

const geometry=new THREE.PlaneGeometry(2,2),material=new THREE.MeshBasicMaterial();
const mesh=new THREE.InstancedMesh(geometry,material,4),matrix=new THREE.Matrix4();
for(const [i,[x,z]] of [[0,-5],[100,-5],[0,5],[3,-5]].entries()){
 mesh.setMatrixAt(i,matrix.makeTranslation(x,0,z));mesh.setColorAt(i,new THREE.Color(i/4,.5,1));
}
const matrices=mesh.instanceMatrix.array.slice(),colors=mesh.instanceColor.array.slice();
const culling=createStaticInstanceCulling();culling.register(mesh);
const camera=new THREE.PerspectiveCamera(60,1,.1,20);
culling.update(camera);
assert.equal(mesh.count,2,'Keep the plant whose center is outside but whose edge is visible');
assert.equal(mesh.instanceMatrix.array[16+12],3);
assert.equal(mesh.instanceColor.array[3],.75,'Colors follow the same stable order');
const version=mesh.instanceMatrix.version;culling.update(camera);
assert.equal(mesh.instanceMatrix.version,version,'Unchanged camera must not re-upload');
camera.position.x=100;culling.update(camera);
assert.equal(mesh.count,1);assert.equal(mesh.instanceMatrix.array[12],100);
assert(mesh.instanceMatrix.updateRanges.length>=2,'Camera changes retain pending upload ranges');
culling.restore();assert.equal(mesh.count,4);
assert.deepEqual(mesh.instanceMatrix.array,matrices);assert.deepEqual(mesh.instanceColor.array,colors);
camera.position.x=0;camera.lookAt(0,0,5);culling.update(camera);
assert.equal(mesh.count,1);assert.equal(mesh.instanceMatrix.array[14],5);
camera.position.y=100;culling.update(camera);assert.equal(mesh.count,0);
culling.restore();assert.deepEqual(mesh.instanceMatrix.array,matrices);
geometry.dispose();material.dispose();mesh.dispose();
// A plant's undeformed edge can be outside the view while its bent tip enters.
const bending=new THREE.InstancedMesh(new THREE.PlaneGeometry(.1,.5),new THREE.MeshBasicMaterial(),1);
bending.setMatrixAt(0,new THREE.Matrix4().makeTranslation(3.3,0,-5));
const contactCulling=createStaticInstanceCulling();contactCulling.register(bending,.65);
contactCulling.update(new THREE.PerspectiveCamera(60,1,.1,20));
assert.equal(bending.count,1,'Contact padding retains a possible bent tip at the frustum edge');
bending.geometry.dispose();bending.material.dispose();bending.dispose();
console.log('Static instance culling: edge retention, stable transforms/colors, pending uploads, turn/re-entry and exact restore pass');
