import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE} from '../web/back-nine-course.js';
import {buildBackNineArchitecture} from '../web/back-nine-architecture.js';
import {terrainHeight} from '../web/course-terrain.js';
const root=new THREE.Group(),materials=new Map(),unit=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,12);
const put=(g,type,x,y,z,sx=1,sy=1,sz=1,ry=0)=>{if(!materials.has(type))materials.set(type,new THREE.MeshBasicMaterial());const m=new THREE.Mesh(g.clone(),materials.get(type));m.userData.type=type;m.position.set(x,y+terrainHeight(x,-z),z);m.scale.set(sx,sy,sz);m.rotation.y=ry;root.add(m);};
const box=(type,x,y,z,w,h,d,ry=0)=>put(unit,type,x,y,z,w,h,d,ry);
const stats=buildBackNineArchitecture({THREE,box,put,cylinder,COURSE});root.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let roofChecks=0,boardHits=0,clearanceChecks=0;
for(const c of COURSE.checkpoints){
 for(let x=-3.2;x<=3.2;x+=.4)for(let dz=-4.65;dz<=4.65;dz+=.19){
  ray.set(new THREE.Vector3(c.x+x,2.95,-c.y+dz),new THREE.Vector3(0,1,0));const hits=ray.intersectObjects(root.children,false);
  if(hits.some(h=>h.object.userData.type==='wood'))boardHits++;roofChecks++;
 }
 // Camera eye and player's passage must remain unobstructed beneath all work.
 for(let x=-2.5;x<=2.5;x+=.25)for(const h of [.5,1.7,2.85]){
  ray.set(new THREE.Vector3(c.x+x,h,-c.y+7),new THREE.Vector3(0,0,-1));ray.far=14;
  const hits=ray.intersectObjects(root.children,false);assert.equal(hits.length,0,'Central passage cannot acquire geometry');clearanceChecks++;ray.far=Infinity;
 }
}
assert(boardHits/roofChecks>.95,'Boarding must cover roof except narrow construction joints');assert.equal(stats.shelterBoards,56);assert.equal(stats.shelterRafters,24);
const report={passed:true,roofChecks,boardHits,clearanceChecks,stats};fs.writeFileSync('output/back-nine-visual-upgrade/shelter-craft/geometry.json',JSON.stringify(report,null,2));console.log(report);
