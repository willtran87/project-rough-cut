import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {buildDistantEstateGeometry,DISTANT_ESTATE_SITES} from '../web/back-nine-estate-distance.js';
import {COURSE,navigationSnapshot} from '../web/back-nine-course.js';

const before=JSON.stringify({COURSE,nav:navigationSnapshot()}),built=buildDistantEstateGeometry(),meshes=[];
let vertices=0,triangles=0,minRadius=Infinity;
for(const[kind,g]of Object.entries(built.geometry)){
 const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,c=g.attributes.color;
 for(let i=0;i<p.count;i++){
  assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)+uv.getX(i)+uv.getY(i)+c.getX(i)+c.getY(i)+c.getZ(i)));
  assert(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);
  assert(c.getX(i)>=0&&c.getX(i)<=1&&c.getY(i)>=0&&c.getY(i)<=1&&c.getZ(i)>=0&&c.getZ(i)<=1);
  minRadius=Math.min(minRadius,Math.hypot(p.getX(i),p.getZ(i)));
 }
 vertices+=p.count;triangles+=g.index.count/3;
 const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.name=kind;mesh.updateMatrixWorld();meshes.push(mesh);
}
assert(minRadius>200,'all estate geometry remains behind the 175m boundary woodland');
const roofHits=[],lampHits=[];
for(const site of DISTANT_ESTATE_SITES){
 const ray=new THREE.Raycaster(new THREE.Vector3(site.x,site.y+60,site.z),new THREE.Vector3(0,-1,0)),hit=ray.intersectObjects(meshes)[0];
 assert.equal(hit?.object.name,'roof',site.id+' has a closed roof over its centre');roofHits.push({site:site.id,height:hit.point.y});
 const front=new THREE.Vector3(-Math.sin(site.yaw),0,-Math.cos(site.yaw)),towardCourse=new THREE.Vector3(-site.x,0,-25-site.z).normalize();assert(front.dot(towardCourse)>.8,'lit facade faces the course');
}
for(const lamp of built.lamps){
 const site=DISTANT_ESTATE_SITES.find(s=>s.id===lamp.site),center=new THREE.Vector3().fromArray(lamp.position),right=new THREE.Vector3(Math.cos(site.yaw),0,-Math.sin(site.yaw));let visible=0;
 for(const side of [-1,1])for(const up of [-1,1]){
  const target=center.clone().addScaledVector(right,side*lamp.width*.3);target.y+=up*lamp.height*.3;
  const origin=new THREE.Vector3(0,4,-25),ray=new THREE.Raycaster(origin,target.clone().sub(origin).normalize());if(ray.intersectObjects(meshes)[0]?.object.name==='lamp')visible++;
 }
 assert(visible>0,lamp.site+' lamp must not be buried behind its frame or wall');lampHits.push({site:lamp.site,visibleSamples:visible});
}
assert.equal(JSON.stringify({COURSE,nav:navigationSnapshot()}),before);
for(const m of meshes){m.geometry.dispose();m.material.dispose();}
const report={passed:true,sites:built.sites,pieces:built.pieces,vertices,triangles,minRadius,roofHits,lampHits,gameplayUnchanged:true};if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2));console.log(JSON.stringify(report));
