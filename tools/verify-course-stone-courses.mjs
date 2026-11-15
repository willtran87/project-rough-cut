import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createStoneCourses} from '../web/course-stone-courses.js';
import {STONE_PROFILE,coverRadiusAtHeight} from '../web/course-cover-profile.js';
const sizes=[[1.6,.96],[3.52,1.12],[1.6,.8],[4,1.28],[3.04,1.28]],material=new T.MeshBasicMaterial(),ray=new T.Raycaster(),reports=[];
for(const [rx,rz]of sizes){
 const result=createStoneCourses(rx,rz,274),repeat=createStoneCourses(rx,rz,274),root=new T.Group();
 for(let i=0;i<result.parts.length;i++){
  const g=result.parts[i].geometry;assert.deepEqual(g.attributes.position.array,repeat.parts[i].geometry.attributes.position.array,'Deterministic courses');
  for(const name of ['position','normal','uv'])for(const value of g.attributes[name].array)assert(Number.isFinite(value));
  const p=g.attributes.position;for(let j=0;j<p.count;j++){assert(p.getY(j)>=.034&&p.getY(j)<=1.949);const r=coverRadiusAtHeight(STONE_PROFILE,Math.min(1.94,p.getY(j)));assert((p.getX(j)/(rx*r+.034))**2+(p.getZ(j)/(rz*r+.034))**2<=1.00001,'Thin skin stays within 34 mm of the old profile');}
  root.add(new T.Mesh(g,material));repeat.parts[i].geometry.dispose();
 }
 const coreGeometry=new T.LatheGeometry(STONE_PROFILE.map(([r,y])=>new T.Vector2(r,y)),32);coreGeometry.scale(rx,1,rz);const core=new T.Mesh(coreGeometry,material);root.add(core);root.updateMatrixWorld(true);let hits=0,skinHits=0;
 for(const y of [.22,.59,.98,1.36,1.76])for(let i=0;i<64;i++){
  const a=(i+.237)/64*Math.PI*2,origin=new T.Vector3(Math.cos(a)*(rx+1),y,Math.sin(a)*(rz+1)),target=new T.Vector3(0,y,0);ray.set(origin,target.sub(origin).normalize());const h=ray.intersectObject(root,true)[0];
  assert(h,'Original solid closes every mortar joint');if(h){hits++;if(h.object!==core)skinHits++;const old=ray.intersectObject(core)[0];assert(h.face.normal.dot(ray.ray.direction)<0,'Outside ray sees outward front');assert(h.distance<=old.distance+1e-6&&h.distance>=old.distance-.08,'Visible stone remains a thin skin over the authoritative volume');}
 }
 assert.equal(hits,320,'Original solid and coursed skin completely occlude the interior');
 assert(skinHits>=280,'Stone faces, not the backing body, cover the wall');
 reports.push({rx,rz,stones:result.stones,triangles:result.parts.reduce((n,p)=>n+p.geometry.index.count/3,0),exteriorHits:hits,skinHits});root.traverse(o=>o.geometry?.dispose());
}
material.dispose();console.log(JSON.stringify({passed:true,reports}));
