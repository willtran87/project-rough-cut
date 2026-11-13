import {RIG_WHEELS,rigWheelAngle} from './final-cut-rig.js';
import {GROUND_SLABS} from './final-cut-ground-layout.js';
import {SWALE} from './final-cut-course.js';

const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const slabs=GROUND_SLABS.map(s=>({...s,c:Math.cos(s.yaw||0),sn:Math.sin(s.yaw||0)}));
export function wheelCenter(j,w){const s=Math.sin(j.yaw),c=Math.cos(j.yaw);return {x:j.x+c*w.side+s*w.forward,y:j.y-s*w.side+c*w.forward};}
export function wheelSurface(p,water=0){
 let top=0,material='grass';
 for(const slab of GROUND_SLABS){const x=p.x-slab.x,y=p.y-slab.y,c=Math.cos(slab.yaw||0),s=Math.sin(slab.yaw||0);if(slab.top>=top&&Math.abs(x*c-y*s)<=slab.w/2&&Math.abs(x*s+y*c)<=slab.d/2){top=slab.top;material=slab.material;}}
 const wet=water>0&&Math.abs(p.x-SWALE.x)<SWALE.w/2&&Math.abs(p.y-SWALE.y)<SWALE.d/2&&!['path','road'].includes(material)?clamp(water):0;
 return {height:top,material:wet?'mud':material,wet};
}
export function wheelSupport(j,w){
 const center=wheelCenter(j,w),heading=j.yaw+rigWheelAngle(j,w),c=Math.cos(heading),s=Math.sin(heading);
 let height=0;
 // Contact follows the circular tread onto a curb before the axle crosses
 // its edge. Eight lateral tread bands retain the rounded shoulder profile.
 for(const slab of slabs){
  if(slab.top<=height||Math.abs(center.x-slab.x)>slab.w/2+slab.d/2+w.radius||Math.abs(center.y-slab.y)>slab.w/2+slab.d/2+w.radius)continue;
  for(const side of [-.309,-.23,-.12,-.018,.018,.12,.23,.309]){
   const dx=center.x+c*side-slab.x,dy=center.y-s*side-slab.y;
   const origin=[dx*slab.c-dy*slab.sn,dx*slab.sn+dy*slab.c],direction=[s*slab.c-c*slab.sn,s*slab.sn+c*slab.c],half=[slab.w/2,slab.d/2];let lo=-w.radius,hi=w.radius;
   for(let axis=0;axis<2;axis++){const q=direction[axis];if(Math.abs(q)<1e-10){if(Math.abs(origin[axis])>half[axis]){hi=-Infinity;break;}}else{const a=(-half[axis]-origin[axis])/q,b=(half[axis]-origin[axis])/q;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}}
   if(lo>hi)continue;const forward=lo>0?lo:hi<0?hi:0,radial=w.radius-(Math.abs(side)-.018)/(w.width/2)*.018;
   if(Math.abs(forward)<radial)height=Math.max(height,slab.top+Math.sqrt(radial*radial-forward*forward)-w.radius);
  }
 }return height;
}
export function cleanWheelFilm(saved){return RIG_WHEELS.map((_,k)=>{const s=saved?.[k];return {mud:clamp(s?.mud),dust:clamp(s?.dust),grass:clamp(s?.grass),wet:clamp(s?.wet)};});}
export function advanceWheelFilm(r,strides,dt){
 const owner=r.won?r.ending:r.rig,film=owner.wheelFilm||cleanWheelFilm();
 RIG_WHEELS.forEach((w,k)=>{
  const surface=wheelSurface(wheelCenter(r.rig,w),r.water),distance=Math.abs(strides[k]),f=film[k];
  const collect=1-Math.exp(-distance*.14),shed=Math.exp(-distance*.012);
  for(const key of ['mud','dust','grass']){const target=key==='mud'?(surface.material==='mud'?1:0):key==='dust'?(surface.material==='gravel'?.7:0):(['grass','stripe','rough'].includes(surface.material)?.5:0);f[key]=clamp(f[key]*shed+(target-f[key])*collect);}
  f.wet=clamp(surface.wet?f.wet+(surface.wet-f.wet)*(1-Math.exp(-dt*3)):f.wet*Math.exp(-dt*.045));
 });owner.wheelFilm=film;
}
export function advanceWheelTravel(r,before,dt){
 const j=r.rig,travel=j.wheelTravel||RIG_WHEELS.map(()=>Number(before.distance)||0),strides=[];
 const yaw=wrap(j.yaw-before.yaw),arc=Math.abs(yaw)>1e-6?Math.abs(yaw/(2*Math.sin(yaw/2))):1;
 j.wheelTravel=RIG_WHEELS.map((w,k)=>{
  const a=wheelCenter(before,w),b=wheelCenter(j,w),dx=b.x-a.x,dy=b.y-a.y;
  const oldHeading=before.yaw+rigWheelAngle(before,w),heading=oldHeading+wrap(j.yaw+rigWheelAngle(j,w)-oldHeading)/2;
  const along=dx*Math.sin(heading)+dy*Math.cos(heading),stride=Math.hypot(dx,dy)*arc*Math.sign(along);
  // Contact travel accumulates deposits; standing still never manufactures
  // dirt. Water can wet a stopped tire, and recession dries it gradually.
  strides.push(stride);
  return travel[k]+stride;
 });advanceWheelFilm({...r,won:false},strides,dt);
}
