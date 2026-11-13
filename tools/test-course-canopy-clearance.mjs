import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {raiseCourseCanopy} from '../web/course-canopy-clearance.js';
const root=new THREE.Group();root.position.set(-8,.018,-10);
const leaf=new THREE.MeshBasicMaterial();leaf.userData.needleIndex=0;
const card=(x,y,z,material=leaf)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.6,1,2,2),material);m.position.set(x,y,z);m.rotation.set(.2,.7,.3);root.add(m);return m;};
const low=card(1.2,1.3,.3),inside=card(0,1.2,0),upper=card(1.3,4,.2),wood=card(1.4,1,.2,new THREE.MeshBasicMaterial());
const original=[low,inside,upper,wood].map(m=>({position:m.position.clone(),vertices:Array.from(m.geometry.attributes.position.array)}));
const report=raiseCourseCanopy(root,{rx:1,rz:1,height:2.4});assert.equal(report.raised,1);assert.equal(report.total,3);
const v=new THREE.Vector3();let min=Infinity;for(let i=0;i<low.geometry.attributes.position.count;i++){v.fromBufferAttribute(low.geometry.attributes.position,i).applyMatrix4(low.matrix);min=Math.min(min,v.y);}assert(Math.abs(min-2.4)<1e-8);
for(let i=0;i<4;i++){const m=[low,inside,upper,wood][i];assert.deepEqual(Array.from(m.geometry.attributes.position.array),original[i].vertices);if(i)assert.deepEqual(m.position,original[i].position);}
assert.equal(raiseCourseCanopy(root,{rx:1,rz:1,height:2.4}).raised,0);
console.log(JSON.stringify({passed:true,report,checks:'Rotated hanging card clears eye level; interior foliage, upper crown, wood, vertex detail and repeated preparation stay unchanged'}));
