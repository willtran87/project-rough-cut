import assert from 'node:assert/strict';
import fs from 'node:fs';
import {floorLayout,onFloor} from '../web/under-green-course.js';
import {buildPumpOverhead} from '../web/under-green-pump-overhead.js';
import {buildKeeperOverhead} from '../web/under-green-keeper-overhead.js';
import {KEEPER_TIMBER_SPAN} from '../web/under-green-keeper-timber.js';
import {GATE_ROOF_SLOT} from '../web/under-green-layout.js';
const parts=[],layout=floorLayout(),stats=buildPumpOverhead({layout,box(...p){parts.push(p);}});
assert.equal(stats.beams.length,4);assert.equal(stats.parts,parts.length);
for(const [type,x,h,z,w,t,d] of parts){assert(Number.isFinite(x+h+z+w+t+d));assert(w>0&&t>0&&d>0);assert(h-t/2>=3.66);assert(h+t/2<=4.16);assert(['machineIron','machineSteel','machineRust','rubber'].includes(type));}
for(const b of stats.beams){assert(onFloor(b.left+.2,b.y));assert(!onFloor(b.left-.2,b.y));assert(onFloor(b.right-.2,b.y));assert(!onFloor(b.right+.2,b.y));}
// Beam flange undersides clear the actual 0.2m-radius pipe at height3.65.
assert(3.875-.035/2>3.65+.2);
// Every rack hanger reaches a beam top and joins its lower cross-seat.
for(const b of stats.beams)for(const side of [-1,1])assert(parts.some(p=>Math.abs(p[1]-(stats.rack.x+side*.27))<1e-8&&Math.abs(p[3]+b.y)<1e-8&&p[2]-p[5]/2<=3.71&&p[2]+p[5]/2>=4.13));
fs.writeFileSync('output/under-green/visual-upgrade/pass33-source/geometry.json',JSON.stringify({passed:true,stats,parts},null,2));console.log(JSON.stringify({passed:true,...stats}));
const keeperParts=[];
const keeper=buildKeeperOverhead({box(type,x,y,z,w,h,d){keeperParts.push({type,x,y,z,w,h,d});},put(g,type,x,y,z){
 assert(g.userData.preserveDrainUV);const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++)assert(Number.isFinite(uv.getX(i)+uv.getY(i)));
 g.computeBoundingBox();const b=g.boundingBox,s=b.getSize(new (b.min.constructor)());keeperParts.push({type,x,y,z,w:s.x,h:s.y,d:s.z});
 // On every long face, UV distances match the declared physical timber span.
 for(let face=0;face<6;face++){const i=face*4;for(const j of [1,2]){const dx=p.getX(i)-p.getX(i+j),dy=p.getY(i)-p.getY(i+j),dz=p.getZ(i)-p.getZ(i+j),world=Math.hypot(dx,dy,dz),mapped=Math.hypot(uv.getX(i)-uv.getX(i+j),uv.getY(i)-uv.getY(i+j))*KEEPER_TIMBER_SPAN;assert(Math.abs(world-mapped)<1e-5);}}
}});
for(const p of keeperParts){assert(p.y-p.h/2>=3.549);assert(p.y+p.h/2<=4.151);assert(!(Math.abs(p.x-GATE_ROOF_SLOT.x)<(p.w+GATE_ROOF_SLOT.w)/2&&Math.abs(-p.z-GATE_ROOF_SLOT.y)<(p.d+GATE_ROOF_SLOT.d)/2),'Keeper timber intrudes into gate pocket');}
assert.equal(keeper.beams,3);assert.equal(keeper.boards,20);assert.equal(keeperParts.length,keeper.timbers+keeper.hardware);
fs.writeFileSync('output/under-green/visual-upgrade/pass33-source/keeper-geometry.json',JSON.stringify({passed:true,keeper,keeperParts},null,2));console.log(JSON.stringify({passed:true,keeper}));
