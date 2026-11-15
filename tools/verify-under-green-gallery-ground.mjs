import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {GALLERY_ROOT_GROUND,galleryRootSoilGeometry,buildGalleryRootGround,paintGalleryRootGround} from '../web/under-green-gallery-ground.js';
const meshes=[];
const stats=buildGalleryRootGround({put(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const mesh=new THREE.Mesh(g.clone());mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,ry,rz);mesh.updateMatrixWorld();mesh.geometry.applyMatrix4(mesh.matrixWorld);meshes.push({g:mesh.geometry,type,x,y:-z});}});
let vertices=0,triangles=0;
for(const site of GALLERY_ROOT_GROUND){
 const g=galleryRootSoilGeometry(site),p=g.attributes.position,ix=g.index.array,edges=new Map();let volume=0;
 for(let i=0;i<p.count;i++){assert(Math.abs(g.attributes.uv.getX(i)-(site.x+p.getX(i))/4)<.000001);assert(Math.abs(g.attributes.uv.getY(i)-(site.y-p.getZ(i))/4)<.000001,'Soil UVs must join the floor in course coordinates');}
 for(let i=0;i<ix.length;i+=3){const [a,b,c]=ix.slice(i,i+3);for(const [u,v]of [[a,b],[b,c],[c,a]]){const key=[Math.min(u,v),Math.max(u,v)].join(':');edges.set(key,(edges.get(key)||0)+1);}const A=new THREE.Vector3().fromBufferAttribute(p,a),B=new THREE.Vector3().fromBufferAttribute(p,b),C=new THREE.Vector3().fromBufferAttribute(p,c);volume+=A.dot(B.cross(C))/6;}
 assert([...edges.values()].every(n=>n===2),'Soil mound must be closed');assert(volume>0,'Soil winding must face outward');g.dispose();
}
for(const {g,type,x,y}of meshes){
 const site=GALLERY_ROOT_GROUND.reduce((best,s)=>Math.hypot(s.x-x,s.y-y)<Math.hypot(best.x-x,best.y-y)?s:best),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const X=p.getX(i),Y=-p.getZ(i),h=p.getY(i);assert([X,Y,h].every(Number.isFinite));assert(h>=-.025&&h<.3);
  if(site.id==='pillar')assert(Math.abs(X+1.8)<=.50001&&Math.abs(Y-15)<=.50001,'Pillar debris leaves its existing collider');
  else{const boundary=site.id==='entrance'?5:-3;assert(Math.abs(X-boundary)<=.20001,'Wall debris enters player clearance');assert(Math.abs(Y-site.y)<=1.01);}
 }
 vertices+=p.count;triangles+=(g.index?.count||p.count)/3;g.dispose();
}
const patches=[];const paint=paintGalleryRootGround((channel,points,strength)=>{assert([0,2].includes(channel));assert(strength<=255&&strength>0);assert(points.every(p=>p.every(Number.isFinite)));patches.push({channel,points,strength});});
assert.equal(stats.soilMounds,3);assert.equal(stats.fragments,11);assert.equal(triangles,stats.triangles);assert.equal(patches.length,25);
const out='output/under-green/visual-pass65';fs.mkdirSync(out,{recursive:true});const report={passed:true,stats,vertices,triangles,paint};fs.writeFileSync(out+'/geometry.json',JSON.stringify(report,null,2));console.log(report);
