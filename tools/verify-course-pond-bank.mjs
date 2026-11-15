import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createPondBankGeometry,pondBankSeed,pondEdge} from '../web/course-pond-bank.js';

let rays=0,minEdge=1,maxEdge=0;
for(const [x,z,rx,rz] of [[-7.2576,-34.4,4,1.76],[8.064,-41.6,4,1.76],[-7.7184,-72.16,3.2,1.76]]){
  const seed=pondBankSeed(x,z),geometry=createPondBankGeometry(rx,rz,seed);
  const material=new THREE.MeshBasicMaterial(),mesh=new THREE.Mesh(geometry,material);
  mesh.updateMatrixWorld();
  const p=geometry.attributes.position,n=geometry.attributes.normal;
  for(let i=0;i<p.count;i++){
    assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)));
    assert(Math.hypot(p.getX(i)/rx,p.getZ(i)/rz)<=1.015001,'Bank stays within previous shore footprint');
    assert(n.getY(i)>0,'No inverted bank faces');
  }
  const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0));
  for(let i=0;i<1024;i++){
    const a=(i+.37)/1024*Math.PI*2,edge=pondEdge(a,seed);
    minEdge=Math.min(minEdge,edge);maxEdge=Math.max(maxEdge,edge);
    ray.ray.origin.set(Math.cos(a)*rx*edge,1,-Math.sin(a)*rz*edge);
    const hit=ray.intersectObject(mesh)[0];assert(hit&&hit.point.y>.083,'Bank covers water cut edge without cracks');rays++;
  }
  assert(Math.abs(pondEdge(-Math.PI,seed)-pondEdge(Math.PI,seed))<1e-12);
  geometry.dispose();material.dispose();
}
assert(maxEdge<1&&minEdge>.75);console.log(JSON.stringify({passed:true,rays,minEdge,maxEdge}));
