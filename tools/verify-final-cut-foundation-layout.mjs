import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FOUNDATION_BEDS,foundationPlantLayout,foundationBedWeight} from '../web/final-cut-foundation-layout.js';
import {REFUGES,WALLS,SECTORS,inside,solid,move} from '../web/final-cut-course.js';
import {GROUND_SLABS,actorGroundHeight} from '../web/final-cut-ground-layout.js';
const plants=foundationPlantLayout();assert(plants.length>150);assert.equal(FOUNDATION_BEDS.length,18);
assert.deepEqual(plants,foundationPlantLayout(),'Fixed roots cannot shift on restart');
for(const p of plants){
 assert(Object.values(p).filter(v=>typeof v==='number').every(Number.isFinite));
 assert(!WALLS.some(w=>inside(p,w,.055)),'Root must be visibly outside masonry');
 assert(!SECTORS.some(s=>inside(p,s,.3)),'New growth cannot change a cut strip');
 assert(Math.abs(p.base-actorGroundHeight(p.x,p.y)-.002)<1e-10,'Roots follow the real surface');
 assert(p.h>=.15&&p.h<=.66,'Foundation growth remains below crouching eye height');
 assert(foundationBedWeight(p.x,p.y)>.5,'Every crown grows from its visible litter bed');
 // A conservative circular crown envelope stays off each navigable slab.
 for(const s of GROUND_SLABS.filter(s=>['path','gravel'].includes(s.material))){
  const c=Math.cos(s.yaw||0),sn=Math.sin(s.yaw||0),dx=p.x-s.x,dy=p.y-s.y,a=Math.abs(dx*c-dy*sn)-s.w/2,b=Math.abs(dx*sn+dy*c)-s.d/2;
  const d=Math.hypot(Math.max(0,a),Math.max(0,b))+Math.min(Math.max(a,b),0);
  assert(d>=p.h*.48+.039999,'Plant crown must clear navigation slab '+s.id);
 }
}
for(const s of REFUGES){
 const p={x:s.x+s.w/2+.55,y:s.y};assert(!solid(p));assert.equal(foundationBedWeight(p.x,p.y),0);move(p,-1.8,0);assert(p.x<s.x+s.w/2-.6,'Door throat stays open');
}
for(const s of GROUND_SLABS.filter(s=>['path','gravel'].includes(s.material)))for(const t of [-.45,0,.45]){
 const a=t*s.w,b=t*s.d,c=Math.cos(s.yaw||0),sn=Math.sin(s.yaw||0);assert.equal(foundationBedWeight(s.x+a*c+b*sn,s.y-a*sn+b*c),0,'Beds must not paint litter onto service/route slabs');
}
const report={passed:true,beds:FOUNDATION_BEDS.length,plants:plants.length,refuges:Object.fromEntries(REFUGES.map(s=>[s.id,plants.filter(p=>p.refuge===s.id).length])),maxHeight:Math.max(...plants.map(p=>p.h)),minimumBedWeight:Math.min(...plants.map(p=>foundationBedWeight(p.x,p.y)))};
fs.mkdirSync('output/final-cut/foundation-beds',{recursive:true});fs.writeFileSync('output/final-cut/foundation-beds/layout.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
