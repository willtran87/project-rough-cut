import {isDestructibleFeature,featureBroken,featurePose,breakCourseFeature} from './course-destruction-state.js';
import {COURSE,angleDelta,blocked,distance,lineClear} from './back-nine-course.js';

// Metres, +forward along the vehicle's heading. These include the visible
// wheels, bumpers, cart roof and unfolded cutting decks, plus a small clearance.
// Width and length below are half-extents, not full vehicle dimensions.
export const VEHICLE_HULLS={
 cart:[{width:1.16,length:1.6,forward:0}],
 foot:[{width:.32,length:.32,forward:0}],
 mower:[{width:1.43,length:1.98,forward:0},{width:2.46,length:.88,forward:1.4}]
};
function rectangle(p,h){
 const sx=Math.sin(p.yaw||0),sy=Math.cos(p.yaw||0);
 return {x:p.x+sx*h.forward,y:p.y+sy*h.forward,axes:[{x:sy,y:-sx,r:h.width},{x:sx,y:sy,r:h.length}]};
}
function overlap(a,b){
 const dx=a.x-b.x,dy=a.y-b.y;let contact=null;
 for(const n of [...a.axes,...b.axes]){
  const radius=q=>q.axes.reduce((r,u)=>r+Math.abs(u.x*n.x+u.y*n.y)*u.r,0);
  const offset=dx*n.x+dy*n.y,depth=radius(a)+radius(b)-Math.abs(offset);
  if(depth<=1e-7)return null;
  if(!contact||depth<contact.depth){const sign=offset<0?-1:1;contact={x:n.x*sign,y:n.y*sign,depth};}
 }
 return contact;
}
// A standing runner has a round ground footprint. A rotating square can enter
// a fence by a fraction of a millimetre while turning in place; the next sweep
// then starts in contact and rejects every escape step. Keep vehicle decks and
// bodywork rectangular, but make the runner's clearance independent of facing.
function circleRectangle(p,r,b){
 const dx=p.x-b.x,dy=p.y-b.y,u=b.axes[0],v=b.axes[1];
 const x=dx*u.x+dy*u.y,y=dx*v.x+dy*v.y;
 const cx=Math.max(-u.r,Math.min(u.r,x)),cy=Math.max(-v.r,Math.min(v.r,y));
 const ox=x-cx,oy=y-cy,d=Math.hypot(ox,oy);
 if(d>1e-9){const depth=r-d;if(depth<=1e-7)return null;return {x:(ox*u.x+oy*v.x)/d,y:(ox*u.y+oy*v.y)/d,depth};}
 const across=u.r-Math.abs(x),along=v.r-Math.abs(y),axis=across<along?u:v,sign=(across<along?x:y)<0?-1:1;
 return {x:axis.x*sign,y:axis.y*sign,depth:r+Math.min(across,along)};
}
export function hullOverlap(a,kindA,b,kindB){
 if(distance(a,b)>(kindB==='feature'?Math.hypot(b.rx,b.ry)+4:6))return null;let deepest=null;
 const others=kindB==='feature'?[{width:b.rx,length:b.ry,forward:0}]:VEHICLE_HULLS[kindB];
 for(const first of VEHICLE_HULLS[kindA])for(const second of others){
  let hit;
  if(kindA==='foot')hit=circleRectangle(a,first.width,rectangle(b,second));
  else if(kindB==='foot'){hit=circleRectangle(b,second.width,rectangle(a,first));if(hit){hit.x=-hit.x;hit.y=-hit.y;}}
  else hit=overlap(rectangle(a,first),rectangle(b,second));
  if(hit&&(!deepest||hit.depth>deepest.depth))deepest=hit;
 }
 return deepest;
}
export function vehicleOverlap(cart,mower){return hullOverlap(cart,cart.onFoot?'foot':'cart',mower,'mower');}

// Normally poses start separated. Recover old/debug overlapping states too,
// without pushing either vehicle through a fence, shelter post or garage wall.
export function separateVehicles(cart,mower,run=null){
 let touched=false;
 for(let i=0;i<12;i++){
  const hit=vehicleOverlap(cart,mower);if(!hit)break;touched=true;
  let moved=false;
  for(const share of [.5,0,1]){
   const d=hit.depth+.002,c={x:cart.x+hit.x*d*share,y:cart.y+hit.y*d*share},j={x:mower.x-hit.x*d*(1-share),y:mower.y-hit.y*d*(1-share)};
   if(!blocked(c,cart.onFoot?.32:.85)&&!blocked(j,1.65)&&lineClear(cart,c,cart.onFoot?.32:.85)&&lineClear(mower,j,1.65)&&!COURSE.features.filter(f=>!featureBroken(run,f)).map(f=>featurePose(run,f)).some(f=>hullOverlap({...c,yaw:cart.yaw},cart.onFoot?'foot':'cart',f,'feature')||hullOverlap({...j,yaw:mower.yaw},'mower',f,'feature'))){Object.assign(cart,c);Object.assign(mower,j);moved=true;break;}
  }
  if(!moved)break;
 }
 return touched;
}

// Sweep translation AND rotation in short bounded increments, then find the
// last separated pose. Contact cancels this vehicle's closing motion; the other
// vehicle can continue driving away. No render-time physics or global search.
export function constrainVehicleMotion(vehicle,from,other,kind,otherKind=null){
 const dx=vehicle.x-from.x,dy=vehicle.y-from.y,turn=angleDelta(vehicle.yaw,from.yaw),travel=Math.hypot(dx,dy);
 if(distance(from,other)>(otherKind==='feature'?Math.hypot(other.rx,other.ry)+4:6)+travel)return false;
 const target={x:vehicle.x,y:vehicle.y,yaw:vehicle.yaw},steps=Math.min(24,Math.max(1,Math.ceil((travel+Math.abs(turn)*3.4)/.12)));
 const pose=t=>({x:from.x+dx*t,y:from.y+dy*t,yaw:from.yaw+turn*t});
 const collides=p=>otherKind?hullOverlap(p,kind,other,otherKind):kind==='cart'?vehicleOverlap(p,other):vehicleOverlap(other,p);
 let safe=0;
 for(let i=1;i<=steps;i++){
  const t=i/steps;if(!collides(pose(t))){safe=t;continue;}
  let end=t;for(let n=0;n<12;n++){const mid=(safe+end)/2;if(collides(pose(mid)))end=mid;else safe=mid;}
  Object.assign(vehicle,pose(safe));vehicle.speed=0;return true;
 }
 Object.assign(vehicle,target);return false;
}

// New landmarks use the same swept hulls as vehicle contacts, including deck
// width and rotation. Distant features take only a cheap range rejection.
export function constrainFeatureMotion(vehicle,from,kind,run=null){
 let hit=false;const incoming=vehicle.speed;
 // Resolve buildings first. A wall limits the swept destruction reach, but
 // touching it cannot erase the force of a simultaneous hedge impact.
 if(run&&kind==='mower'){
  for(const f of COURSE.features)if(!isDestructibleFeature(f))hit=constrainVehicleMotion(vehicle,from,f,kind,'feature')||hit;
  for(const original of COURSE.features){
   const f=featurePose(run,original);
   if(!isDestructibleFeature(f)||featureBroken(run,f))continue;
   const probe={...vehicle};if(!constrainVehicleMotion(probe,from,f,kind,'feature'))continue;
   if(Math.abs(incoming)>.4&&breakCourseFeature(run,f,{...vehicle,speed:incoming})){vehicle.speed*=.84;}
   else{Object.assign(vehicle,probe);hit=true;}
  }
 }else for(const f of COURSE.features)if(!featureBroken(run,f))hit=constrainVehicleMotion(vehicle,from,featurePose(run,f),kind,'feature')||hit;
 return hit;
}
