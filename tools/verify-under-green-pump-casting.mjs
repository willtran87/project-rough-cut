import * as THREE from '../web/vendor/three/three.module.js';
import {buildDrainPump} from '../web/under-green-machinery-detail.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Inspect the actual constructed machine, including its four cast saddles.
// Low parts must stay in the existing collision footprint, and a continuous
// load path must connect the floor to both the motor and volute housing.
const meshes=[],material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
function put(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
 const mesh=new THREE.Mesh(g.clone(),material);mesh.name=type;
 mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,ry,rz);
 mesh.updateMatrixWorld(true);meshes.push(mesh);return mesh;
}
const box=(type,x,y,z,w,h,d)=>{const g=new THREE.BoxGeometry(w,h,d);put(g,type,x,y,z);g.dispose();};
const machine=buildDrainPump({box,put}),f=machine.footprint;
let lowVertices=0,triangles=0;
for(const mesh of meshes){
 const p=mesh.geometry.attributes.position;triangles+=(mesh.geometry.index?.count??p.count)/3;
 for(let i=0;i<p.count;i++){
  const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
  assert(v.toArray().every(Number.isFinite));
  if(v.y>2.2)continue;
  lowVertices++;
  assert(v.y>=-.00001,'Part below floor');
  assert(Math.abs(v.x-f.x)<=f.w/2+.00001&&Math.abs(-v.z-f.y)<=f.d/2+.00001,'Part outside collision footprint');
 }
}
const ray=new THREE.Raycaster(),direction=new THREE.Vector3(.372,.817,.441).normalize();
function inside(point){
 ray.set(point,direction);
 return meshes.some(mesh=>{
  const hits=ray.intersectObject(mesh,false).map(h=>h.distance).filter(d=>d>1e-7);
  const unique=hits.filter((d,i)=>!i||Math.abs(d-hits[i-1])>1e-5);
  return unique.length%2===1;
 });
}
let loadSamples=0;
for(const side of [-1,1])for(const dz of [-.91,.76]){
 // Travel across the skid/rust pad, up the foot, then inward through the
 // new saddle until the path is seated inside the curved housing.
 for(let i=0;i<=100;i++){
  const h=.02+i*.0094;
  const offset=h<.19?.71:h<.26?.64:h<.44?.55:.55-.16*Math.min(1,(h-.44)/.38);
  assert(inside(new THREE.Vector3(f.x+side*offset,h,-f.y+dz)),`Unseated mount: side${side}, dz${dz}, height${h}`);
  loadSamples++;
 }
}
const out='output/under-green/visual-pass79/geometry.json';
fs.writeFileSync(out,JSON.stringify({passed:true,lowVertices,triangles,loadSamples,footprint:f},null,2));
console.log(fs.readFileSync(out,'utf8'));
meshes.forEach(m=>m.geometry.dispose());material.dispose();
