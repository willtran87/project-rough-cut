import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createCameraClearanceAudit,inspectGeometrySpheres} from '../web/geometry-clearance-audit.js';

const camera=new THREE.PerspectiveCamera(85,844/390,.06,85);
const material=new THREE.MeshBasicMaterial();
function triangle(points,name){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
 const mesh=new THREE.Mesh(geometry,material);mesh.name=name;return mesh;
}
const crossing=triangle([[-1,-1,-.03],[1,-1,-.03],[0,1,-.03]],'crossing');
assert.equal(createCameraClearanceAudit([crossing])(camera)[0].mesh,'crossing','A triangle whose vertices are outside can still cut through the camera volume');
const corner=triangle([[.1,-.002,-.055],[.105,-.002,-.055],[.1,.002,-.055]],'corner');
assert.equal(createCameraClearanceAudit([corner])(camera).length,1,'Wide-FOV edge intersection');
camera.fov=45;camera.updateProjectionMatrix();
assert.equal(createCameraClearanceAudit([corner])(camera).length,0,'Outside narrower camera');
camera.fov=85;camera.updateProjectionMatrix();
for(const z of [.03,-.07]){
 const mesh=triangle([[-1,-1,z],[1,-1,z],[0,1,z]],'excluded');
 assert.equal(createCameraClearanceAudit([mesh])(camera).length,0,'Behind eye or beyond near plane');
}
const parent=new THREE.Group();parent.add(crossing);parent.visible=false;
assert.equal(createCameraClearanceAudit([crossing])(camera).length,0,'Hidden ancestors excluded');
parent.visible=true;parent.position.set(4,2,3);parent.rotation.y=Math.PI/2;
camera.position.copy(parent.position);camera.rotation.copy(parent.rotation);
assert.equal(createCameraClearanceAudit([crossing])(camera).length,1,'World transforms match moved and rotated camera');
const rig=new THREE.Group();rig.position.copy(camera.position);rig.rotation.copy(camera.rotation);camera.position.set(0,0,0);camera.rotation.set(0,0,0);rig.add(camera);rig.updateMatrixWorld(true);
assert.equal(createCameraClearanceAudit([crossing])(camera).length,1,'Parented camera uses world pose');
const wall=triangle([[-1,-1,0],[1,-1,0],[0,1,0]],'wall');
assert.equal(inspectGeometrySpheres([wall],[{x:0,y:.01,height:0,radius:.025}]).length,1);
assert.equal(inspectGeometrySpheres([wall],[{x:0,y:.03,height:0,radius:.025}]).length,0);
wall.position.set(5,1,2);wall.rotation.y=Math.PI/2;
assert.equal(inspectGeometrySpheres([wall],[{x:5.01,y:-2,height:1,radius:.025}]).length,1);
console.log(JSON.stringify({passed:true,checks:11}));
