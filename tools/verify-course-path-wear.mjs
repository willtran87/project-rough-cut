import assert from 'node:assert/strict';
import {pathWearPatches,PATH_WEAR_COLORS} from '../web/course-path-wear.js';
const data={paths:[[{x:0,y:0},{x:0,y:60},{x:30,y:90},{x:30,y:90},{x:30,y:140}]],sand:[{x:0,y:30,radiusX:8,radiusY:8}],footing:[{x:30,y:110,radiusX:8,radiusY:6}]};
const original=JSON.stringify(data),marks=[...pathWearPatches(data,.1152,.16)];
assert(marks.length>200);assert.deepEqual(marks,[...pathWearPatches(data,.1152,.16)]);assert.equal(JSON.stringify(data),original);
const counts={};
for(const m of marks){
 assert(PATH_WEAR_COLORS[m.kind]);counts[m.kind]=(counts[m.kind]||0)+1;
 assert.equal(m.points.length,m.kind==='grass'?12:8);assert(m.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)));
 for(const h of [...data.sand,...data.footing])for(let i=0;i<m.points.length;i++)for(let j=0;j<=8;j++){
  const a=m.points[i],b=m.points[(i+1)%m.points.length],x=a.x+(b.x-a.x)*j/8,z=a.z+(b.z-a.z)*j/8;
  assert(Math.hypot((x-h.x*.1152)/(h.radiusX*.1152),(z+h.y*.16)/(h.radiusY*.16))>1,'Whole mark must clear protected footing');
 }
}
assert.equal(Object.keys(counts).length,6);assert.deepEqual([...pathWearPatches({paths:[[],[{x:0,y:0},{x:0,y:0}]]},1,1)],[]);
console.log(JSON.stringify({passed:true,marks:marks.length,counts,deterministic:true,protectedFooting:true,unchangedRoutes:true}));
