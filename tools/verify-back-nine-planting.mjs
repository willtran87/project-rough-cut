import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DETAIL_PLANTS,PLANTING_COUNTS,PLANTING_POCKETS} from '../web/back-nine-planting.js';
import {COURSE,pathDistance,runnerSurfaceAt,blocked} from '../web/back-nine-course.js';
import {routeDistanceXY,COURSE_GREENS} from '../web/back-nine-landscape.js';
const counts={},types={};
for(const p of DETAIL_PLANTS){
 assert(Object.values(p).filter(v=>typeof v==='number').every(Number.isFinite));
 assert(pathDistance(p)>3.4+p.h*.4);assert(routeDistanceXY(p.x,p.y,COURSE.footPaths)>.8+p.h*.4);
 for(let a=0;a<Math.PI*2;a+=Math.PI/4){const q={x:p.x+Math.sin(a)*p.h*.42,y:p.y+Math.cos(a)*p.h*.42};assert(!blocked(q,.1));assert.notEqual(runnerSurfaceAt(q),'path');}
 assert(!COURSE_GREENS.some(g=>((p.x-g.x)/(g.rx+1+p.h*.4))**2+((p.y-g.y)/(g.ry+1+p.h*.4))**2<1));
 for(let a=0;a<Math.PI*2;a+=Math.PI/8){const x=p.x+Math.cos(a)*p.h*.4,y=p.y+Math.sin(a)*p.h*.4;assert(!COURSE.sand.some(s=>((x-s.x)/s.rx)**2+((y-s.y)/s.ry)**2<1),'plant silhouette intrudes into maintained sand');}
 assert(p.type!==1||p.habitat==='wetland');counts[p.group]=(counts[p.group]||0)+1;
 types[p.habitat]??=Array(6).fill(0);types[p.habitat][p.type]++;
}
assert.equal(new Set(DETAIL_PLANTS.filter(p=>p.group==='pocket').map(p=>p.cluster)).size,PLANTING_POCKETS.length);
assert(types.nursery[2]+types.nursery[4]>PLANTING_COUNTS.nursery*.55);
assert(types.wetland[1]>PLANTING_COUNTS.wetland*.4);assert(types.range[5]>PLANTING_COUNTS.range*.4);
assert(DETAIL_PLANTS.length<6000);assert(counts.pocket>900);
const report={passed:true,plants:DETAIL_PLANTS.length,counts,habitats:PLANTING_COUNTS,types,pockets:PLANTING_POCKETS.length,checks:['Every full plant footprint clears playable paths and solids','Greens and fixture approaches retain clearance','All authored pockets populated; reeds confined to wetland, district mixes differ','Existing atlas reused with fewer than 6000 plants']};
fs.mkdirSync('output/back-nine-visual-upgrade/planting',{recursive:true});fs.writeFileSync('output/back-nine-visual-upgrade/planting/layout.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
