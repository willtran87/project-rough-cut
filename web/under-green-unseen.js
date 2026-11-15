import {sightClear,distance,WATERS,inWater} from './under-green-course.js';
const clamp=t=>Math.max(0,Math.min(1,t));
// Conservative visibility: include weapon/body edges and a generous screen
// margin, so Joe slows BEFORE he rounds a corner or enters the actual frame.
export function joeCouldBeSeen(r,position=r.joe){
 const p=r.player,view=r.view||{},yaw=p.yaw+(p.rearAngle||0),pitch=p.pitch||0;
 const vertical=Math.tan((view.fov||58)*Math.PI/360),horizontal=vertical*(view.aspect||16/9);
 const dx=position.x-p.x,dy=position.y-p.y,right=dx*Math.cos(yaw)-dy*Math.sin(yaw),ahead=dx*Math.sin(yaw)+dy*Math.cos(yaw);
 if(ahead<-1.8||Math.abs(right)>Math.max(0,ahead)*horizontal+1.8)return false;
 for(const height of [.3,1.15,2.1]){
  const up=height-(p.eyeHeight??1.65),depth=ahead*Math.cos(pitch)+up*Math.sin(pitch),screenUp=up*Math.cos(pitch)-ahead*Math.sin(pitch);
  if(depth<-.3||Math.abs(screenUp)>Math.max(0,depth)*vertical+.5)continue;
  for(const offset of [0,-.65,.65])if(sightClear(p,{x:position.x+Math.cos(yaw)*offset,y:position.y-Math.sin(yaw)*offset,eyeHeight:height},r.gate))return true;
 }return false;
}
export function unseenPace(r,dt){
 const j=r.joe,visible=joeCouldBeSeen(r),gap=distance(r.player,j);
 j.observed=visible;j.hiddenSeconds=visible?0:(j.hiddenSeconds||0)+dt;
 // Keep the last few metres and timed water crossings at the ordinary pace.
 const crossing=WATERS.some(w=>inWater(j,w,1.2));
 j.paceScale=visible||crossing?1:1+1.6*clamp((j.hiddenSeconds-.7)/.8)*clamp((gap-5)/7);
 return j.paceScale;
}
