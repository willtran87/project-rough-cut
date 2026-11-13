import {BAY} from './final-cut-arrival-layout.js';
import {REFUGES,SWALE} from './final-cut-course.js';
import {FORK,FINAL_ROUTES} from './final-cut-route-layout.js';
import {SOLE_PROFILE} from './final-cut-sole-profile.js';

// Ground-level slabs crossed by the actor. The raised overlook/ramps retain
// their separate player surface contract; Joe never walks on those structures.
export const GROUND_SLABS=[
 ...Array.from({length:12},(_,i)=>({id:'stripe-'+i,material:i%2?'grass':'stripe',x:0,y:8+i*8,w:48,d:8,top:.006,h:.006})),
 ...[-23,23].map(x=>({id:'service-'+x,material:'gravel',x,y:49,w:2.4,d:94,top:.03,h:.03})),
 ...REFUGES.map(r=>({id:r.id+'-floor',material:'path',x:r.x,y:r.y,w:r.w,d:r.d,top:.07,h:.07})),
 {id:'bay-floor',material:'path',x:BAY.x,y:21,w:7,d:14,top:.04,h:.04},
 ...[-1,1].map(side=>({id:'rig-apron-'+side,material:'gravel',x:side*35,y:53.5,w:20,d:91,top:.012,h:.012})),
 {id:'rig-back-road',material:'gravel',x:0,y:99,w:90,d:8,top:.012,h:.012},
 ...[-7,7].map(offset=>({id:'swale-skirt-'+offset,material:'path',x:SWALE.x,y:SWALE.y+offset,w:15,d:1.5,top:.12,h:.12})),
 {id:'public-road',material:'road',x:0,y:107,w:80,d:7,top:.03,h:.03},
];
for(const [name,points]of Object.entries(FINAL_ROUTES)){let a=FORK;for(const [index,b]of points.entries()){if(Math.min(a.y,b.y)>=55.7&&Math.max(a.y,b.y)<=60.3||Math.min(a.y,b.y)>=71.7){GROUND_SLABS.push({id:`route-${name}-${index}`,material:'path',x:(a.x+b.x)/2,y:(a.y+b.y)/2,w:1.1,d:Math.hypot(b.x-a.x,b.y-a.y),yaw:Math.atan2(b.x-a.x,b.y-a.y),top:.042,h:.04});}a=b;}}
export function actorGroundHeight(x,y){let top=0;for(const s of GROUND_SLABS){const dx=x-s.x,dy=y-s.y,c=Math.cos(s.yaw||0),sn=Math.sin(s.yaw||0);if(Math.abs(dx*c-dy*sn)<=s.w/2&&Math.abs(dx*sn+dy*c)<=s.d/2)top=Math.max(top,s.top);}return top;}
export function shoeGroundHeight(x,y,yaw){
 const c=Math.cos(yaw),s=Math.sin(yaw);let top=0;
 for(const slab of GROUND_SLABS){
  if(slab.top<=top)continue;
  const sc=Math.cos(slab.yaw||0),ss=Math.sin(slab.yaw||0),dx=x-slab.x,dy=y-slab.y,lx=dx*sc-dy*ss,ly=dx*ss+dy*sc;
  if(Math.abs(lx)>slab.w/2+.23||Math.abs(ly)>slab.d/2+.23)continue;
  if(Math.abs(lx)<slab.w/2-.23&&Math.abs(ly)<slab.d/2-.23){top=slab.top;continue;}
  // At a raised edge the curved toe can touch before the lowest sole point.
  // A rectangular footprint incorrectly lifts the whole boot above the edge.
  for(const [side,forward,height]of SOLE_PROFILE){const px=c*side+s*forward,py=-s*side+c*forward;if(Math.abs(lx+px*sc-py*ss)<=slab.w/2&&Math.abs(ly+px*ss+py*sc)<=slab.d/2)top=Math.max(top,slab.top-height-.11423);}
 }
 return top;
}
