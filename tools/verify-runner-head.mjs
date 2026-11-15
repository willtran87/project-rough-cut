import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createRunnerHead,createRunnerHair} from '../web/runner-head-craft.js';
const result=[];
for(const [name,create]of [['head',createRunnerHead],['hair',createRunnerHair]]){
 const g=create(THREE),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 for(const attribute of [p,n,uv])for(const value of attribute.array)assert(Number.isFinite(value),`${name}: finite geometry`);
 const ray=new THREE.Raycaster(new THREE.Vector3(0,name==='head'?-.05:.13,-1),new THREE.Vector3(0,0,1));
 const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();
 const hits=ray.intersectObject(mesh);assert(hits.length,`${name}: outward facing front surface`);assert(hits[0].face.normal.z<0,`${name}: front normal`);
 if(name==='head'){
  assert(hits[0].point.z<-.13,'Nose has actual profile depth');
  assert(Math.abs(hits[0].uv.x-.5)<.001,'Nose stays centered in portrait');
  assert(hits[0].uv.y>.41&&hits[0].uv.y<.46,'Nose registers with portrait art');
 }
 g.computeBoundingBox();result.push({name,triangles:g.index.count/3,frontDepth:hits[0].point.z,bounds:g.boundingBox});g.dispose();mesh.material.dispose();
}
console.log(JSON.stringify({passed:true,result}));
