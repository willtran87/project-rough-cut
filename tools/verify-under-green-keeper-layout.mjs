import assert from 'node:assert/strict';
import {floorLayout,solid} from '../web/under-green-course.js';
import {KEEPER_NICHES,keeperWallPieces,nichePoint} from '../web/under-green-keeper-layout.js';
let removed=0,fragments=0;
for(const w of floorLayout().walls){
 const h=w.covered?4.2:1.8,parts=keeperWallPieces(w,h),axis=w.w===.22?'x':'y',length=axis==='x'?w.d:w.w;
 const area=parts.reduce((n,p)=>n+(axis==='x'?p.d:p.w)*p.height,0);removed+=length*h-area;fragments+=parts.length;
 for(const p of parts){assert(p.w>0&&p.d>0&&p.height>0);assert(p.base>=0&&p.base+p.height<=h+1e-8);}
}
const expected=KEEPER_NICHES.reduce((n,b)=>n+b.width*(b.top-b.bottom),0);assert(Math.abs(removed-expected)<1e-7,`Wrong opening area: ${removed} vs ${expected}`);
let samples=0;
for(const n of KEEPER_NICHES)for(let u=-n.width/2+.15;u<n.width/2-.1;u+=.1){
 const wall=nichePoint(n,u,1.65,-.05),inside=nichePoint(n,u,1.65,.32);
 assert(solid(wall,.01),'Furniture recess cannot become a new traversable route');assert(!solid(inside,.3),'Existing approach must remain navigable');samples++;
 assert(n.bottom>.38,'Open recess should remain above maximum flood height');
}
console.log(JSON.stringify({passed:true,removedArea:removed,expectedArea:expected,fragments,samples}));
