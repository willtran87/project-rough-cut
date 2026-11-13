import {floorLayout,FLOORS,OBSTACLES,onFloor,gateBlocks,GATE,clamp} from './under-green-course.js';
import {keeperWallPieces} from './under-green-keeper-layout.js';
import {SCYTHE_SHAFT,SCYTHE_GRIPS,SCYTHE_BLADE_HEIGHT,scytheOutline} from './under-green-scythe.js';
import {TRIMMER,trimmerPoint,trimmerPose} from './under-green-trimmer.js';
import {organicContact,organicBoundsOverlap} from './under-green-organic-contact.js';

const walls=floorLayout().walls.flatMap(w=>keeperWallPieces(w,w.covered?4.2:1.8)).map(w=>({...w,id:'wall',material:'masonry'}));
const boxObstacles=new Set(['service-door-jamb','service-door-right-jamb','bunker-buttress','pump-buttress','range-island']);
const local=[];
function chain(points,radius,kind){
 for(let n=1;n<points.length;n++){
  const a=points[n-1],b=points[n],steps=Math.max(1,Math.ceil(Math.hypot(...b.map((v,i)=>v-a[i]))/.025));
  for(let i=0;i<=steps;i++)local.push({point:a.map((v,k)=>v+(b[k]-v)*i/steps),radius,kind});
 }
}
const outline=scytheOutline().outline.map(([x,f])=>[x,SCYTHE_BLADE_HEIGHT,f]);
// The 18mm spine plus 4mm allowance also covers its pitched thickness.
chain([...outline,outline[0]],.013,'blade');
chain(SCYTHE_SHAFT,.03,'shaft');
for(const grip of SCYTHE_GRIPS){chain(grip,.035,'grip');const a=grip[0];chain([[a[0]-.045,a[1],a[2]],[a[0]+.045,a[1],a[2]]],.035,'grip');}
chain([[.43,.73,.53],[.50,.67,.56]],.05,'socket');
const low=[0,1,2].map(k=>Math.min(...local.map(p=>p.point[k]-p.radius))),high=[0,1,2].map(k=>Math.max(...local.map(p=>p.point[k]+p.radius)));
const corners=[];for(const x of [low[0],high[0]])for(const h of [low[1],high[1]])for(const f of [low[2],high[2]])corners.push([x,h,f]);

export function strikeSamples(joe,pose=trimmerPose(joe)){return local.map(p=>({...trimmerPoint(joe,...p.point,pose),radius:p.radius,kind:p.kind}));}

// Closest point on an actual rendered masonry box, in simulation axes.
export function sphereBoxContact(p,b){
 if(Math.abs(p.x-b.x)>b.w/2+p.radius+.002||Math.abs(p.y-b.y)>b.d/2+p.radius+.002||p.height+p.radius+.002<b.base||p.height-p.radius-.002>b.base+b.height)return null;
 const q={x:clamp(p.x,b.x-b.w/2,b.x+b.w/2),y:clamp(p.y,b.y-b.d/2,b.y+b.d/2),height:clamp(p.height,b.base,b.base+b.height)};
 const dx=p.x-q.x,dy=p.y-q.y,dh=p.height-q.height,d=Math.hypot(dx,dy,dh);
 if(d>p.radius+.002)return null;
 if(d<1e-8)return {blocked:true};
 return {blocked:true,point:q,normal:{x:dx/d,y:dy/d,height:dh/d},material:b.material,surface:b.id,part:p.kind,gap:d-p.radius};
}

export function strikeQuery(joe,gate=0){
 const near=b=>Math.abs(b.x-joe.x)<b.w/2+2.15&&Math.abs(b.y-joe.y)<b.d/2+2.15;
 const nearbyWalls=walls.filter(near),obstacles=OBSTACLES.filter(near);
 return pose=>{
  const sh=Math.sin(joe.yaw+pose.angle),ch=Math.cos(joe.yaw+pose.angle),sp=Math.sin(pose.pitch),cp=Math.cos(pose.pitch),ox=joe.x+Math.sin(joe.yaw)*TRIMMER.pivotForward,oy=joe.y+Math.cos(joe.yaw)*TRIMMER.pivotForward;
  const transform=point=>{const [x,h,f]=point,v=h-TRIMMER.pivotHeight,l=f-TRIMMER.pivotForward,reach=l*cp-v*sp;return {x:ox+sh*reach+ch*x,y:oy+ch*reach-sh*x,height:pose.height+v*cp+l*sp};};
  const b={minX:Infinity,minY:Infinity,minH:Infinity,maxX:-Infinity,maxY:-Infinity,maxH:-Infinity};
  for(const point of corners){const p=transform(point);b.minX=Math.min(b.minX,p.x);b.maxX=Math.max(b.maxX,p.x);b.minY=Math.min(b.minY,p.y);b.maxY=Math.max(b.maxY,p.y);b.minH=Math.min(b.minH,p.height);b.maxH=Math.max(b.maxH,p.height);}
  const overlaps=(o,pad=0)=>b.maxX>=o.x-o.w/2-pad&&b.minX<=o.x+o.w/2+pad&&b.maxY>=o.y-o.d/2-pad&&b.minY<=o.y+o.d/2+pad;
  const touchingWalls=nearbyWalls.filter(w=>overlaps(w,.002)&&b.maxH>=w.base-.002&&b.minH<=w.base+w.height+.002),touchingObstacles=obstacles.filter(o=>overlaps(o,boxObstacles.has(o.id)?.002:.11));
  const touchingGate=gateBlocks(gate,b.maxH)&&overlaps({x:GATE.x,y:GATE.y,w:GATE.width+.42,d:.82});
  const inside=FLOORS.some(f=>b.minX>=f.x-f.w/2&&b.maxX<=f.x+f.w/2&&b.minY>=f.y-f.d/2&&b.maxY<=f.y+f.d/2);
  const touchingOrganic=organicBoundsOverlap(b);
  if(inside&&b.minH>.015&&b.maxH<2.85&&!touchingWalls.length&&!touchingObstacles.length&&!touchingGate&&!touchingOrganic)return null;
  for(const sample of local){
   const p=transform(sample.point);p.radius=sample.radius;p.kind=sample.kind;
   if(p.height-p.radius<.015||p.height+p.radius>2.85)return {blocked:true};
   if(touchingOrganic){const hit=organicContact(p);if(hit)return hit;}
   for(const w of touchingWalls){const hit=sphereBoxContact(p,w);if(hit)return hit;}
   // Furnished recesses are not new attack/navigation space. Non-box props
   // retain conservative clearance until their physical surfaces are shared.
   if(!inside&&!onFloor(p.x,p.y))return {blocked:true};
   for(const o of touchingObstacles){
    if(boxObstacles.has(o.id)){const hit=sphereBoxContact(p,{...o,base:0,height:2.5,material:'masonry'});if(hit)return hit;}
    else if(o.id!=='root-pillar'&&Math.abs(p.x-o.x)<o.w/2+p.radius+.11&&Math.abs(p.y-o.y)<o.d/2+p.radius+.11)return {blocked:true};
   }
   if(touchingGate&&gateBlocks(gate,p.height+p.radius)&&Math.abs(p.y-GATE.y)<.3+p.radius+.11&&Math.abs(p.x-GATE.x)<GATE.width/2+p.radius+.21)return {blocked:true};
  }
  return null;
 };
}
export function strikeClear(joe,gate=0,pose=trimmerPose(joe)){return !strikeQuery(joe,gate)(pose);}
