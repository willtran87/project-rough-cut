import {hydraulicLayout,hydraulicPartId} from './final-cut-hydraulic-layout.js';
// Shared physical dimensions, in rig-local metres: side +right, forward +nose.
// Renderer uses x=side, z=-forward. Raised reels are not a cutting hazard.
export const RIG_HEADLAMPS=[-1,1].map(sign=>({id:`headlamp-${sign}`,material:'dark',side:sign*1.05,height:1.72,forward:2.62,w:.53,h:.29,d:.14}));
export const RIG_BODY=[
 ...RIG_HEADLAMPS,
 {id:'canopy',material:'green',side:0,height:3.69,forward:.1,w:2.52,h:.30,d:2.32},
 // The wide axle rails leave a recessed waist for Joe's existing steps.
 {id:'frame',material:'dark',side:0,height:.8,forward:0,w:2.6,h:.7,d:4.9},
 ...[-1,1].flatMap(sign=>[-1.75,1.75].map(forward=>({id:`axle-rail-${sign}-${forward}`,material:'dark',side:sign*1.46,height:.85,forward,w:.33,h:.8,d:1.4}))),
 // Rear engine and narrow side housings surround the open seated footwell.
 // These dimensions also own contact; no obsolete full-width box spans it.
 {id:'power-unit',material:'cream',side:0,height:1.5,forward:-1.75,w:3.5,h:1.1,d:1.65},
 {id:'hood',material:'green',side:0,height:2.2,forward:-1.75,w:3.35,h:.35,d:1.6},
 {id:'radiator',material:'dark',side:0,height:1.28,forward:2.25,w:3.2,h:1.14,d:.7},
 ...[-1,1].flatMap(sign=>[1.55,-2.05].map(forward=>({id:`fender-${sign}-${forward}`,material:'green',side:sign*1.83,forward,height:1.68,w:.66,h:.52,d:1.6}))),
 ...[-1,1].flatMap(sign=>[
  {id:`side-console-${sign}`,material:'cream',side:sign*1.2,height:1.3,forward:.3,w:.4,h:.6,d:.8},
  {id:`board-${sign}`,material:'metal',side:sign*1.55,height:.48,forward:-.45,w:.5,h:.12,d:.7},
  {id:`step-${sign}`,material:'metal',side:sign*1.85,height:.2,forward:-.45,w:.6,h:.1,d:.7},
  {id:`cab-step-${sign}`,material:'metal',side:sign*1.46,height:.82,forward:-.45,w:.24,h:.1,d:.58},
 ])
];
// Loaded rolling radius, visible tread and axle height agree. Carcass radius
// excludes the tread lugs; it must never drive wheel rotation or collision.
export const RIG_WHEELS=[-1,1].flatMap(sign=>[1.55,-2.05].map(forward=>({id:`wheel-${sign}-${forward}`,side:sign*1.83,forward,height:.85,radius:.85,carcassRadius:.785,width:.64,treadRadius:.85})));
export const RIG_BANK={hinge:1.35,length:3.9,height:.78,forward:1,reelRadius:.46,reelForward:1.4,reelHeight:.53};
export const RIG_WING_PARTS=[
 {id:'deck',material:'green',side:1.95,height:0,forward:0,w:3.9,h:.24,d:1.65},
 {id:'trim',material:'cream',side:1.95,height:.28,forward:-.4,w:3.9,h:.35,d:.4},
 {id:'reel',material:'metal',side:1.95,height:-.25,forward:.4,w:3.9,h:.92,d:.92},
 ...Array.from({length:8},(_,k)=>({id:`comb-${k}`,material:'dark',side:.25+k*.5,height:-.12,forward:.75,w:.08,h:.65,d:.1})),
 {id:'lamp',material:'wingLamp',side:3.9,height:.37,forward:0,w:.5,h:.28,d:.2}
];
export const wingPartId=(p,sign)=>p.id==='reel'?`reel-${sign}`:p.id.startsWith('comb-')?`comb-${sign}-${p.id.slice(5)}`:`wing-${sign}-${p.id}`;
export const CUT_HALF_WIDTH=RIG_BANK.hinge+RIG_BANK.length;
const turn=a=>Math.atan2(Math.sin(a),Math.cos(a));
const BODY_PARTS=RIG_BODY.map(b=>Object.freeze({...b,kind:'chassis',angle:0}));
const WHEEL_PARTS=RIG_WHEELS.map(w=>Object.freeze({...w,kind:'wheel',w:w.width+.04,d:w.treadRadius*2,h:w.treadRadius*2,angle:0}));
const CUT_PARTS=[...[-1,0,1].map(side=>({id:`reel-${side}`,kind:'cutting-bank',side:side*(RIG_BANK.hinge+RIG_BANK.length/2),forward:RIG_BANK.reelForward,height:RIG_BANK.reelHeight,w:side?RIG_BANK.length:RIG_BANK.hinge*2,d:RIG_BANK.reelRadius*2,h:RIG_BANK.reelRadius*2,angle:0})),
 ...[-1,1].flatMap(sign=>RIG_WING_PARTS.filter(p=>p.id.startsWith('comb-')).map(p=>({id:wingPartId(p,sign),kind:'cutting-bank',side:sign*(RIG_BANK.hinge+p.side),forward:RIG_BANK.forward+p.forward,height:RIG_BANK.height+p.height,w:p.w,d:p.d,h:p.h,angle:0})))].map(Object.freeze);
const STRAIGHT_BODY=Object.freeze([...BODY_PARTS,...WHEEL_PARTS]),STRAIGHT_CUT=Object.freeze([...STRAIGHT_BODY,...CUT_PARTS]);
// Opposed four-wheel steering shares the body's instantaneous turn centre.
// Inner and outer tires follow different radii instead of sliding sideways.
export function rigWheelAngle(j,w){const k=Math.tan((j.steering||0)*.7)/1.55;return Math.atan2(k*w.forward,1-k*w.side);}
export function rigParts(j){
 const active=j.phase==='pass'&&j.deployment>.98,steering=j.steering||0;
 if(!steering)return active?STRAIGHT_CUT:STRAIGHT_BODY;
 return [...BODY_PARTS,...WHEEL_PARTS.map(w=>({...w,angle:rigWheelAngle(j,w)})),...(active?CUT_PARTS:[])];
}
export function worldPart(j,p){
 const s=Math.sin(j.yaw),c=Math.cos(j.yaw);
 return {...p,x:j.x+c*p.side+s*p.forward,y:j.y-s*p.side+c*p.forward,yaw:j.yaw+p.angle};
}
function partLocal(p,j,b){const dx=p.x-j.x,dy=p.y-j.y,s=Math.sin(j.yaw),c=Math.cos(j.yaw),x=dx*c-dy*s-b.side,y=dx*s+dy*c-b.forward,sa=Math.sin(b.angle),ca=Math.cos(b.angle);return {x:x*ca-y*sa,y:x*sa+y*ca};}
function slab(a,b,hx,hy){
 let lo=0,hi=1;
 for(const [axis,h]of [['x',hx],['y',hy]]){const d=b[axis]-a[axis];if(Math.abs(d)<1e-12){if(Math.abs(a[axis])>h)return null;}else{let l=(-h-a[axis])/d,u=(h-a[axis])/d;if(l>u)[l,u]=[u,l];lo=Math.max(lo,l);hi=Math.min(hi,u);if(lo>hi)return null;}}
 return lo;
}
// Exact segment against a rectangle expanded by a circular player: two strips
// plus four corner discs. Unlike an expanded AABB, its corners have no reach.
function roundedSweep(a,b,hx,hy,r){
 let first=Infinity;
 for(const [x,y]of [[hx+r,hy],[hx,hy+r]]){const t=slab(a,b,x,y);if(t!==null)first=Math.min(first,t);}
 const dx=b.x-a.x,dy=b.y-a.y,A=dx*dx+dy*dy;
 for(const x of [-hx,hx])for(const y of [-hy,hy]){const ax=a.x-x,ay=a.y-y,C=ax*ax+ay*ay-r*r;if(C<=0){first=0;continue;}if(A<1e-16)continue;const B=2*(ax*dx+ay*dy),D=B*B-4*A*C;if(D<0)continue;const t=(-B-Math.sqrt(D))/(2*A);if(t>=0&&t<=1)first=Math.min(first,t);}
 return Number.isFinite(first)?first:null;
}
export function rigHit(player,j,radius=.3){
 if(Math.abs(player.x-j.x)>7+radius||Math.abs(player.y-j.y)>7+radius)return null;
 for(const part of rigParts(j)){const q=partLocal(player,j,part);if(roundedSweep(q,q,part.w/2,part.d/2,radius)!==null)return {id:part.id,kind:part.kind,t:1};}
 return null;
}
export function sweptRigHit(fromPlayer,toPlayer,fromRig,toRig,radius=.3){
 if(Math.max(fromPlayer.x,toPlayer.x)<Math.min(fromRig.x,toRig.x)-7-radius||Math.min(fromPlayer.x,toPlayer.x)>Math.max(fromRig.x,toRig.x)+7+radius||Math.max(fromPlayer.y,toPlayer.y)<Math.min(fromRig.y,toRig.y)-7-radius||Math.min(fromPlayer.y,toPlayer.y)>Math.max(fromRig.y,toRig.y)+7+radius)return null;
 // Translation is solved continuously. Rotations are subdivided to <=.002 rad
 // and the chord's maximum deviation is below .01 mm at the rig's extremity.
 const angle=turn(toRig.yaw-fromRig.yaw),steer=(toRig.steering||0)-(fromRig.steering||0),wheelTurn=Math.max(...RIG_WHEELS.map(w=>Math.abs(rigWheelAngle(toRig,w)-rigWheelAngle(fromRig,w)))),n=Math.max(1,Math.ceil((Math.abs(angle)+wheelTurn)/.002));
 const pose=t=>({phase:toRig.phase,deployment:toRig.deployment,x:fromRig.x+(toRig.x-fromRig.x)*t,y:fromRig.y+(toRig.y-fromRig.y)*t,yaw:fromRig.yaw+angle*t,steering:(fromRig.steering||0)+steer*t});
 const player=t=>({x:fromPlayer.x+(toPlayer.x-fromPlayer.x)*t,y:fromPlayer.y+(toPlayer.y-fromPlayer.y)*t});
 // Activation belongs to the final pose, not the entire preceding interval.
 const lastParts=rigParts(toRig),ids=new Set(lastParts.map(p=>p.id)),parts=rigParts(fromRig).filter(p=>ids.has(p.id));
 for(let k=0;k<n;k++){
  const t0=k/n,t1=(k+1)/n,j0=pose(t0),j1=pose(t1);let hit=null;
  for(const part of parts){const start=part.kind==='wheel'?{...part,angle:rigWheelAngle(j0,part)}:part,end=part.kind==='wheel'?{...part,angle:rigWheelAngle(j1,part)}:part;
   const a=partLocal(player(t0),j0,start),b=partLocal(player(t1),j1,end),t=roundedSweep(a,b,part.w/2,part.d/2,radius);
   if(t!==null&&(!hit||t<hit.localT))hit={id:part.id,kind:part.kind,t:t0+t/n,localT:t};
  }if(hit)return hit;
 }
 return rigHit(toPlayer,toRig,radius);
}
// Clip the raised part in its side/height plane at the masonry top. Projecting
// only this clipped polygon lets a high wing pass above a low wall without
// allowing its lower heel or deck to go through it.
export function wingClearanceParts(j,wallHeight=Infinity){
 const a=(1-Math.max(0,Math.min(1,j.deployment)))*1.15,c=Math.cos(a),s=Math.sin(a),parts=[];
 function projected(id,sign,polygon,forward,depth){
  const clipped=[];
  for(let k=0;k<polygon.length;k++){const from=polygon[k],to=polygon[(k+1)%polygon.length],f=from.y<=wallHeight,t=to.y<=wallHeight;if(f)clipped.push(from);if(f!==t){const q=(wallHeight-from.y)/(to.y-from.y);clipped.push({x:from.x+(to.x-from.x)*q,y:wallHeight});}}
  if(!clipped.length)return;
  const lo=Math.min(...clipped.map(v=>v.x)),hi=Math.max(...clipped.map(v=>v.x)),bottom=Math.min(...clipped.map(v=>v.y));
  parts.push({id,kind:'structure',side:sign*(lo+hi)/2,height:bottom,forward,w:hi-lo,h:0,d:depth,angle:0});
 }
 for(const sign of [-1,1])for(const p of RIG_WING_PARTS){
  let polygon=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>{const x=p.side+u*p.w/2,y=p.height+v*p.h/2;return {x:RIG_BANK.hinge+x*c-y*s,y:RIG_BANK.height+x*s+y*c};});
  projected(wingPartId(p,sign),sign,polygon,RIG_BANK.forward+p.forward,p.d);
 }
 const hydraulic=hydraulicLayout(a,RIG_BANK);
 for(let i=0;i<hydraulic.parts.length;i++){const p=hydraulic.parts[i],e=hydraulic.envelopes[i];if(e.bottom>wallHeight)continue;if(e.top<=wallHeight){parts.push(...e.full);continue;}for(const sign of [-1,1])projected(hydraulicPartId(sign,p),sign,e.polygon,e.forward,e.depth);}
 return parts;
}
function overlapsWall(j,p,wall){
 const sj=Math.sin(j.yaw),cj=Math.cos(j.yaw),s=Math.sin(j.yaw+p.angle),c=Math.cos(j.yaw+p.angle);
 if(p.height-p.h/2>wall.h)return false;const dx=wall.x-j.x-cj*p.side-sj*p.forward,dy=wall.y-j.y+sj*p.side-cj*p.forward,hx=p.w/2,hy=p.d/2,wx=wall.w/2,wy=wall.d/2;
 return Math.abs(dx)<=Math.abs(c)*hx+Math.abs(s)*hy+wx&&Math.abs(dy)<=Math.abs(s)*hx+Math.abs(c)*hy+wy&&Math.abs(dx*c-dy*s)<=hx+Math.abs(c)*wx+Math.abs(s)*wy&&Math.abs(dx*s+dy*c)<=hy+Math.abs(s)*wx+Math.abs(c)*wy;
}
// Solid geometry differs from damage: an inactive wing still respects stone.
export function rigWallHit(j,walls){
 walls=walls.filter(w=>Math.abs(j.x-w.x)<6+w.w/2&&Math.abs(j.y-w.y)<6+w.d/2);if(!walls.length)return null;
 const body=[...rigParts({...j,phase:'turn'}),{id:'reel-0',side:0,forward:RIG_BANK.reelForward,height:RIG_BANK.reelHeight,w:RIG_BANK.hinge*2,h:RIG_BANK.reelRadius*2,d:RIG_BANK.reelRadius*2,angle:0}],byHeight=new Map();
 for(const wall of walls){
  for(const p of body)if(overlapsWall(j,p,wall))return {id:p.id,wall:wall.id};
  if(!byHeight.has(wall.h))byHeight.set(wall.h,wingClearanceParts(j,wall.h));
  for(const p of byHeight.get(wall.h))if(overlapsWall(j,p,wall))return {id:p.id,wall:wall.id};
 }return null;
}

