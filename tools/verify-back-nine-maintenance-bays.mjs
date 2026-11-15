import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE,blocked,navigationStats} from '../web/back-nine-course.js';
import {buildMaintenanceBay,MAINTENANCE_BAYS} from '../web/back-nine-maintenance-bays.js';
const initial=JSON.stringify(COURSE),nav=navigationStats(),results=[];
const features=COURSE.features.filter(f=>f.kind==='trailer'&&f.id!=='reservoir-trailer');
assert.deepEqual(features.map(f=>f.id).sort(),Object.keys(MAINTENANCE_BAYS).sort());
for(const f of features){
 const scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),unit=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,12);let triangles=0;
 const put=(g,type,x,y,z,sx=1,sy=1,sz=1,ry=0)=>{const copy=g.clone(),m=new THREE.Mesh(copy,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.y=ry;m.userData.type=type;scene.add(m);triangles+=(copy.index?.count||copy.attributes.position.count)/3;};
 const box=(type,x,y,z,w,h,d,ry=0)=>put(unit,type,x,y,z,w,h,d,ry);
 const stats=buildMaintenanceBay({THREE,f,box,put,cylinder});assert(stats&&stats.theme);scene.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(scene);
 assert(bounds.min.x>=f.x-f.rx-.001&&bounds.max.x<=f.x+f.rx+.001,'new equipment stays within the solid store footprint');
 assert(bounds.min.z>=-f.y-f.ry-.001&&bounds.max.z<=-f.y+f.ry+.001,'no contents obstruct the route');
 assert(bounds.min.y>=.49&&bounds.max.y<=2.74,'walls seat into the existing foundation and remain below the roof');
 for(const m of scene.children){for(const v of m.geometry.attributes.position.array)assert(Number.isFinite(v));}
 const ray=new THREE.Raycaster(new THREE.Vector3(f.x,1.95,-f.y+3.3),new THREE.Vector3(0,0,-1),0,.60);
 assert.equal(ray.intersectObjects(scene.children).length,0,'service opening is genuinely recessed rather than a flat painted panel');
 ray.ray.origin.y=1.02;assert(ray.intersectObjects(scene.children).length>0,'solid counter visibly explains blocked entry');
 ray.ray.origin.y=2.5;assert(ray.intersectObjects(scene.children).length>0,'raised shutter remains visible');
 assert(blocked({x:f.x,y:f.y-f.ry+.05},.1),'existing footprint still blocks entry');
 results.push({id:f.id,theme:stats.theme,pieces:stats.pieces,triangles,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}});
 for(const m of scene.children)m.geometry.dispose();material.dispose();unit.dispose();cylinder.dispose();
}
assert.equal(JSON.stringify(COURSE),initial);assert.deepEqual(navigationStats(),nav);
console.log(JSON.stringify({passed:true,checks:['five distinct workspaces','finite geometry','all contents inside existing footprint','open recess and solid counter','unchanged course/navigation'],results},null,2));
