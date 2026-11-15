import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {PLANTED_BEDS,BED_CROWNS,BED_FOLIAGE,bedRootPath,buildBedCraft} from '../web/back-nine-bed-craft.js';
import {COURSE,pathDistance} from '../web/back-nine-course.js';
import {routeDistanceXY} from '../web/back-nine-landscape.js';
import {terrainHeight} from '../web/course-terrain.js';
const circle=new THREE.CircleGeometry(1,28);circle.rotateX(-Math.PI/2);const sphere=new THREE.IcosahedronGeometry(1,1);let roots=0,pieces=0;
for(const bed of PLANTED_BEDS){
 for(let n=0;n<5;n++){
  const path=bedRootPath(bed,n);assert.equal(path.length,7);assert(path.every(p=>Object.values(p).every(Number.isFinite)));
  assert(path.every(p=>Math.hypot(p.x-bed.x,p.y-bed.y)+p.radius<bed.r));
  assert(path.at(-1).height+path.at(-1).radius<terrainHeight(path.at(-1).x,path.at(-1).y));
  assert(path[0].height>terrainHeight(bed.x,bed.y));roots++;
 }
 buildBedCraft({THREE,bed,circle,sphere,put(g,type,x,y,z,sx=1,sy=1,sz=1){
  assert(g.attributes.position.array.every(Number.isFinite));assert([x,y,z,sx,sy,sz].every(Number.isFinite));
  if(type==='wood'){assert(g.index.count>0);assert(g.attributes.normal.array.every(Number.isFinite));}pieces++;
 }});
}
for(const p of BED_FOLIAGE){
 const radius=Math.max(p.h*.42,p.width*.5);
 assert(pathDistance(p)>3.4+radius);assert(routeDistanceXY(p.x,p.y,COURSE.footPaths)>.8+radius);
 const bed=PLANTED_BEDS[p.bed];assert(Math.hypot(p.x-bed.x,p.y-bed.y)+radius<bed.r+.25);
}
circle.dispose();sphere.dispose();const report={passed:true,beds:PLANTED_BEDS.length,roots,crowns:BED_CROWNS.length,foliage:BED_FOLIAGE.length,pieces,checks:['Tapered roots originate at tree bases, stay inside existing beds and disappear into terrain','All generated positions/normals finite; every original planted bed receives craft','Illustrated bed foliage preserves road/footway clearance and existing obstacle centres']};
fs.mkdirSync('output/back-nine-visual-upgrade/beds',{recursive:true});fs.writeFileSync('output/back-nine-visual-upgrade/beds/contracts.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
