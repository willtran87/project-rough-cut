import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {buildKeeperCabinet} from '../web/under-green-keeper-cabinet.js';
import {KEEPER_NICHES,keeperWallPieces} from '../web/under-green-keeper-layout.js';
import {floorLayout} from '../web/under-green-course.js';

const materials={keeperWood:new T.MeshPhongMaterial()},meshes=[];
function put(g,type,x,y,z){
 const material=materials[type]||new T.MeshPhongMaterial(),mesh=new T.Mesh(g.clone(),material);
 mesh.position.set(x,y,z);mesh.updateMatrixWorld();meshes.push(mesh);
 for(const a of Object.values(g.attributes))assert([...a.array].every(Number.isFinite));
}
const cabinet=buildKeeperCabinet({materials,put,desk:KEEPER_NICHES[0],box:(type,x,y,z,w,h,d)=>{const g=new T.BoxGeometry(w,h,d);put(g,type,x,y,z);g.dispose();}});
const ray=new T.Raycaster(),bounds=new T.Box3(),origin=new T.Vector3(),target=new T.Vector3();
for(const m of meshes)bounds.expandByObject(m);
assert(bounds.min.x>=9.48&&bounds.max.x<=13.82&&bounds.min.y>=-.001&&bounds.max.y<=1.001);
assert(bounds.min.z>=-11.501&&bounds.max.z<=-10.60);
// Ray-test the actual opaque geometry independently of the simulation's solid
// wall. Sample every lower aperture, from frontal and oblique eye positions.
let rays=0;
for(const eye of [[9.7,1.12,12.05],[11.65,1.65,13.1],[13.6,1.12,12.05]]){
 origin.set(eye[0],eye[1],-eye[2]);
 for(let x=9.505;x<13.8;x+=.075)for(let h=.081;h<.98;h+=.09){
  // Aim at the former wall face; extend the ray through the cabinet volume.
  target.set(x,h,-11.35);ray.set(origin,target.sub(origin).normalize());ray.far=6;
  assert(ray.intersectObjects(meshes,false).length,`Open cabinet at ${x},${h} from ${eye}`);rays++;
 }
}
// The absent drawer must have real depth. A ray through its centre reaches
// its recessed back, not a flat facade or an infinite void.
ray.set(new T.Vector3(11.495,.31,-12),new T.Vector3(0,0,1));ray.far=2;
const hit=ray.intersectObjects(meshes,false)[0];assert(hit);assert(hit.point.z> -11.1&&hit.point.z< -10.9);
// Behind the cabinet the niche wall keeps only a low .08 m sill.
let wallPiecesChanged=0;
for(const wall of floorLayout().walls){
 const height=wall.covered?4.2:1.8;
 for(const p of keeperWallPieces(wall,height))if(Math.abs(p.y-KEEPER_NICHES[0].boundary)<.001&&p.x-p.w/2>=9.499&&p.x+p.w/2<=13.801){assert.notEqual(p.height,1,'Former solid lower wall behind the cabinet');if(p.height===.08)wallPiecesChanged++;}
}
assert(wallPiecesChanged>0);
const report={passed:true,parts:meshes.length,rays,wallPiecesChanged,drawerBack:hit.point.toArray(),bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}};
fs.mkdirSync('output/under-green/visual-pass96',{recursive:true});fs.writeFileSync('output/under-green/visual-pass96/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
cabinet.dispose();for(const m of meshes)m.geometry.dispose();
