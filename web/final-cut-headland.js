// Authored service-road maneuvers. Quintic corners have zero curvature at
// their straight joins; the vehicle rolls while yawing instead of pivoting.
export const HEADLAND_RADIUS=11.5;
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const SAMPLES=256;
const choose=[1,5,10,10,5,1],choose4=[1,4,6,4,1],choose3=[1,3,3,1];
function bezier(points,t){
 const value={x:0,y:0,dx:0,dy:0,ddx:0,ddy:0},u=1-t;
 for(let i=0;i<6;i++){const w=choose[i]*u**(5-i)*t**i;value.x+=w*points[i].x;value.y+=w*points[i].y;}
 for(let i=0;i<5;i++){const w=5*choose4[i]*u**(4-i)*t**i;value.dx+=w*(points[i+1].x-points[i].x);value.dy+=w*(points[i+1].y-points[i].y);}
 for(let i=0;i<4;i++){const w=20*choose3[i]*u**(3-i)*t**i;value.ddx+=w*(points[i+2].x-2*points[i+1].x+points[i].x);value.ddy+=w*(points[i+2].y-2*points[i+1].y+points[i].y);}
 return value;
}
function corner(a,b,start,end){
 const h=HEADLAND_RADIUS*.32,point=(p,d,n)=>({x:p.x+d.x*h*n,y:p.y+d.y*h*n});
 const points=[a,point(a,start,1),point(a,start,2),point(b,end,-2),point(b,end,-1),b],table=[0];let last=a;
 for(let i=1;i<=SAMPLES;i++){const p=bezier(points,i/SAMPLES);table.push(table.at(-1)+Math.hypot(p.x-last.x,p.y-last.y));last=p;}
 return {kind:'corner',gear:1,points,table,length:table.at(-1)};
}
function line(a,b,facing){
 const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
 return {kind:'line',gear:dx*facing.x+dy*facing.y>=0?1:-1,a,b,length};
}
export function headlandPose(segment,at){
 if(segment.kind==='line'){
  const t=segment.length?at/segment.length:1,dx=segment.b.x-segment.a.x,dy=segment.b.y-segment.a.y;
  return {x:segment.a.x+dx*t,y:segment.a.y+dy*t,yaw:Math.atan2(dx*segment.gear,dy*segment.gear),steering:0};
 }
 let lo=0,hi=SAMPLES;while(hi-lo>1){const mid=(lo+hi)>>1;if(segment.table[mid]<at)lo=mid;else hi=mid;}
 const t=(lo+(at-segment.table[lo])/(segment.table[hi]-segment.table[lo]))/SAMPLES,p=bezier(segment.points,Math.max(0,Math.min(1,t)));
 const curvature=(p.dy*p.ddx-p.dx*p.ddy)/Math.hypot(p.dx,p.dy)**3;
 return {x:p.x,y:p.y,yaw:Math.atan2(p.dx,p.dy),steering:Math.atan(1.55*curvature)/.7};
}
export function planHeadland(j,targetSide,targetY){
 const side=Math.sign(j.x)||1,R=HEADLAND_RADIUS;
 // Off-road clearance recovery retains its existing guarded maneuver. Normal
 // completed passes reach the service-road endpoint with an outward heading.
 if(Math.abs(Math.abs(j.x)-30)>.08||Math.abs(wrap(j.yaw-side*Math.PI/2))>.03)return null;
 const segments=[],start={x:j.x,y:j.y},out={x:side,y:0},north={x:0,y:1};
 if(side===targetSide){
  const sign=targetY>=j.y?1:-1,along={x:0,y:sign},a={x:side*(30+R),y:j.y+sign*R},b={x:a.x,y:targetY-sign*R},end={x:side*30,y:targetY};
  segments.push(corner(start,a,out,along),line(a,b,along),corner(b,end,along,{x:-side,y:0}));
 }else{
  const a={x:side*(30+R),y:j.y+R},b={x:a.x,y:99-R},c={x:side*30,y:99},d={x:-side*30,y:99},e={x:-side*(30+R),y:99-R},f={x:e.x,y:targetY+R};
  segments.push(corner(start,a,out,north),line(a,b,north),corner(b,c,north,{x:-side,y:0}),line(c,d,{x:-side,y:0}),corner(d,e,{x:-side,y:0},{x:0,y:-1}),line(e,f,{x:0,y:-1}),corner(f,{x:-side*30,y:targetY},{x:0,y:-1},{x:side,y:0}));
 }
 return {segments:segments.filter(s=>s.length>1e-6),index:0,at:0,speed:0,shift:0};
}
export function advanceHeadland(j,dt,clear){
 const plan=j.turnPlan,s=plan?.segments[plan.index];if(!s)return true;
 if(plan.shift>0){plan.shift=Math.max(0,plan.shift-dt);j.speed=0;return false;}
 let profile=plan.profile;
 if(!profile){
  let length=s.length-plan.at;
  for(let i=plan.index+1;i<plan.segments.length&&plan.segments[i].gear===s.gear;i++)length+=plan.segments[i].length;
  const peak=Math.min(s.gear<0?2:4.6,Math.sqrt(2.4*length)),ramp=peak/2.4,cruise=Math.max(0,(length-peak*ramp)/peak);
  profile={length,peak,ramp,cruise,duration:2*ramp+cruise,time:0,travel:0};
 }
 // Analytic acceleration/cruise/braking spans all adjacent pieces in one
 // gear. Consuming residual distance across a join prevents a one-frame stop.
 const time=Math.min(profile.time+dt,profile.duration),{peak,ramp,cruise,length,duration}=profile;
 let travelled,speed;
 if(time<ramp){speed=2.4*time;travelled=1.2*time*time;}
 else if(time<ramp+cruise){speed=peak;travelled=peak*ramp/2+peak*(time-ramp);}
 else {const remaining=duration-time;speed=2.4*remaining;travelled=length-1.2*remaining*remaining;}
 let travel=Math.max(0,travelled-profile.travel),remaining=travel,index=plan.index,at=plan.at;
 while(remaining>plan.segments[index].length-at+1e-9){remaining-=plan.segments[index].length-at;index++;at=0;}
 at=Math.min(plan.segments[index].length,at+remaining);
 const pose=headlandPose(plan.segments[index],at),next={...j,...pose};if(!clear(next))return 'blocked';
 Object.assign(j,pose);j.speed=speed;j.distance+=travel*s.gear;j.reverse=s.gear<0;
 plan.speed=speed;plan.index=index;plan.at=at;plan.profile={...profile,time,travel:travelled};
 if(time>=duration){
  plan.index++;plan.at=0;plan.profile=null;plan.speed=0;j.speed=0;
  if(!plan.segments[plan.index]){j.reverse=false;return true;}
  plan.shift=.45;
 }
 return false;
}
