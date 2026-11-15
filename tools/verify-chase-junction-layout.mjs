import fs from 'node:fs';
import assert from 'node:assert/strict';
import {COURSE,blocked,pathDistance,navigationStats} from '../web/back-nine-course.js';
import {createJunctionEdges} from '../web/chase-junction-layout.js';
import {routeDistanceXY} from '../web/back-nine-landscape.js';
const before=JSON.stringify(COURSE),edges=createJunctionEdges(COURSE),counts={};
assert.equal(JSON.stringify(COURSE),before,'Presentation layout must not mutate routes, collisions or footing');
assert.deepEqual(createJunctionEdges(COURSE),edges,'Stable scenery across retries');
let tested=0,minOther=Infinity,maxPath=0;
for(const e of edges){
 counts[e.route]=(counts[e.route]||0)+1;
 const others=COURSE.paths.filter((_,i)=>i!==e.route),dx=-Math.sin(e.yaw),dy=Math.cos(e.yaw);
 for(let i=0;i<=20;i++){
  const p={x:e.x+dx*e.length*(i/20-.5),y:e.y+dy*e.length*(i/20-.5)};
  assert(!blocked(p,.1),'No stone edge inside a physical obstruction');
  assert(pathDistance(p)<2.3,'A marker must follow a genuinely driveable route');
  const other=routeDistanceXY(p.x,p.y,others);assert(other>=2.19,'No transverse curb across a joining lane');
  assert(!COURSE.wet.some(w=>Math.hypot(p.x-w.x,p.y-w.y)<w.r),'No bright dry edging in standing water');
  minOther=Math.min(minOther,other);maxPath=Math.max(maxPath,pathDistance(p));tested++;
 }
}
assert.equal(Object.keys(counts).length,COURSE.paths.length-1);
assert(edges.length<500,'Bounded static geometry');
assert.equal(navigationStats().signature,2693326411);
const report={passed:true,edges:edges.length,triangles:edges.length*2,tested,counts,minOther,maxPath,navigation:navigationStats()};
fs.mkdirSync('output/back-nine-experience/junction-readability',{recursive:true});fs.writeFileSync('output/back-nine-experience/junction-readability/layout.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
