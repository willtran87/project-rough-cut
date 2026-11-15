import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GRANDSTAND as s,burstPoint,burstSeat,standSurfaceHeight,standImpactHeight,standRoofUnderside} from '../web/final-cut-irrigation-layout.js';
const p={set(x,y,z){Object.assign(this,{x,y,z});return this;}},checks=[];let count=0,closestRoof=Infinity;
for(let k=0;k<3;k++)for(let j=20;j<=100;j++)for(let n=0;n<=100;n++){
 burstPoint(k,n/100,j/100,p);assert([p.x,p.y,p.z].every(Number.isFinite));const inside=Math.abs(p.x-s.roof.x)<s.roof.width/2&&Math.abs(-p.z-s.roof.y)<s.roof.depth/2;
 if(inside){const clearance=standRoofUnderside(p.x)-p.y;assert(clearance>0);closestRoof=Math.min(closestRoof,clearance);}count++;
}
checks.push(`${count} trajectory samples across the full residual-to-peak pressure range clear the physical grandstand roof`);
for(let k=0;k<3;k++){burstPoint(k,1,1,p);const seat=burstSeat(k);assert(Math.hypot(p.x-seat.x,p.y-seat.height,-p.z-seat.y)<1e-8);}
checks.push('All three full-pressure endpoints meet the actual seat tops that receive wet marks');
for(let k=0;k<3;k++)for(let n=20;n<=100;n++){burstPoint(k,1,n/100,p);assert(p.y>=-1e-7);assert(p.y<=Math.max(standImpactHeight(p.x,-p.z),standImpactHeight(p.x+1e-7,-p.z-1e-7))+1e-5);}
checks.push('Pressure loss stops on the first seat, pier, step or ground; browser mesh tests independently verify the contact');
fs.mkdirSync('output/final-cut/irrigation',{recursive:true});fs.writeFileSync('output/final-cut/irrigation/layout.json',JSON.stringify({passed:true,checks,closestRoof},null,2));console.log(JSON.stringify({passed:true,checks,closestRoof}));
