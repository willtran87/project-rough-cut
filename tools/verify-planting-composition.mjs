import fs from 'node:fs';
import assert from 'node:assert/strict';
import {DETAIL_PLANTS,PLANTING_SWEEPS,PLANTING_POCKETS} from '../web/back-nine-planting.js';
import {COURSE,pathDistance,runnerSurfaceAt,blocked} from '../web/back-nine-course.js';
import {COURSE_GREENS,routeDistanceXY} from '../web/back-nine-landscape.js';
import {createFoliageMowingMemory} from '../web/back-nine-foliage-mowing.js';
import {createRun} from '../web/back-nine-sim.js';
const root=process.argv[2]||'output/back-nine-visual-upgrade/planting-composition';fs.mkdirSync(root,{recursive:true});
const counts={},groups={};let samples=0;
for(const p of DETAIL_PLANTS){
 assert(Object.values(p).filter(v=>typeof v==='number').every(Number.isFinite));
 assert(pathDistance(p)>3.4+p.h*.4);assert(routeDistanceXY(p.x,p.y,COURSE.footPaths)>.8+p.h*.4);
 for(let n=0;n<16;n++){
  const a=n*Math.PI/8,q={x:p.x+Math.sin(a)*p.h*.42,y:p.y+Math.cos(a)*p.h*.42};
  assert(!blocked(q,.1),`solid ${JSON.stringify(p)}`);assert.notEqual(runnerSurfaceAt(q),'path',`path ${JSON.stringify(p)}`);
  assert(!COURSE.sand.some(s=>((q.x-s.x)/s.rx)**2+((q.y-s.y)/s.ry)**2<1),'sand');samples++;
 }
 assert(!COURSE_GREENS.some(g=>((p.x-g.x)/(g.rx+1+p.h*.4))**2+((p.y-g.y)/(g.ry+1+p.h*.4))**2<1));
 assert(p.type!==1||p.habitat==='wetland');groups[p.group]=(groups[p.group]||0)+1;
 if(p.group==='sweep')counts[p.cluster]=(counts[p.cluster]||0)+1;
}
for(const s of PLANTING_SWEEPS)assert(counts[s.id]>=30,s.id+' survives clearance');
assert.equal(new Set(DETAIL_PLANTS.filter(p=>p.group==='pocket').map(p=>p.cluster)).size,PLANTING_POCKETS.length);
assert(DETAIL_PLANTS.length<6000,'bounded plant budget');
const memory=createFoliageMowingMemory();DETAIL_PLANTS.forEach(p=>memory.register(p));
const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;Object.assign(r.joe,{speed:10,mode:'pursuing',yaw:0});
for(const p of DETAIL_PLANTS){r.joe.x=p.x;r.joe.y=p.y-1.45;for(let i=0;i<2;i++){r.time+=.05;memory.update(r,true);}}
assert.equal(memory.stats().settled,DETAIL_PLANTS.length);assert.equal(memory.stats().bytes,32768);
const result={passed:true,plants:DETAIL_PLANTS.length,groups,sweeps:counts,footprintSamples:samples,mowing:memory.stats()};
fs.writeFileSync(root+'/layout.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));memory.dispose();
