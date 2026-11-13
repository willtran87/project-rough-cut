import {COURSE,clamp} from './back-nine-course.js';
import {hullOverlap,vehicleOverlap} from './vehicle-contact.js';
import {isDestructibleFeature,featureBroken} from './course-destruction-state.js';

// Full cart footprint, including roof corners, against all authored scenery.
// Only used for the short impact impulse; it cannot shove through a thin post.
export function cartShoveClear(c,joe,run=null){
 const sx=Math.sin(c.yaw),sy=Math.cos(c.yaw),hx=Math.abs(sy)*1.16+Math.abs(sx)*1.6,hy=Math.abs(sx)*1.16+Math.abs(sy)*1.6;
 if(Math.abs(c.x)+hx>COURSE.width||c.y-hy<0||c.y+hy>COURSE.length||vehicleOverlap(c,joe))return false;
 if(COURSE.features.some(f=>isDestructibleFeature(f)&&!featureBroken(run,f)&&hullOverlap(c,'cart',f,'feature')))return false;
 for(const o of COURSE.obstacles){
  if(o.box){if(hullOverlap(c,'cart',o,'feature'))return false;}
  else{const dx=o.x-c.x,dy=o.y-c.y,lx=dx*sy-dy*sx,ly=dx*sx+dy*sy;
   if(Math.hypot(Math.max(0,Math.abs(lx)-1.16),Math.max(0,Math.abs(ly)-1.6))<o.r+.015)return false;
  }
 }
 return true;
}
export function beginCartImpact(run){
 const h=run.impact,c=run.cart;h.incomingSpeed??=Math.abs(c.speed);
 c.speed*=1-(.2+.2*h.strength); // Never add forward throttle or lock steering.
 h.pushDistance=.22+.42*h.strength;h.pushMoved=0;h.pushBlocked=false;
 h.pushX=-(Math.cos(h.yaw)*h.side+Math.sin(h.yaw)*h.front);
 h.pushY=-(-Math.sin(h.yaw)*h.side+Math.cos(h.yaw)*h.front);
}
export function stepCartImpact(run,dt){
 const h=run.impact,c=run.cart;h.incomingSpeed??=Math.abs(c.speed);
 if(run.foot||c.health<=0||run.mode!=='driving'||!h.pushDistance||h.pushBlocked||h.age>.24+dt)return;
 const integral=t=>1-(1-clamp(t/.24,0,1))**3;
 const travel=h.pushDistance*(integral(h.age)-integral(h.age-dt)),steps=Math.max(1,Math.ceil(travel/.06)),step=travel/steps;
 for(let i=0;i<steps;i++){
  const p={x:c.x+h.pushX*step,y:c.y+h.pushY*step,yaw:c.yaw};
  if(!cartShoveClear(p,run.joe,run)){h.pushBlocked=true;break;}
  c.x=p.x;c.y=p.y;h.pushMoved+=step;
 }
}
// Analytic and bounded: pause repeats the same pose; Reduced Motion is steady.
export function cartImpactPose(run,reducedMotion=false,out={}){
 const h=run.impact,t=h?.age??99,p=!reducedMotion&&!run.foot&&!run.death&&h?.damaged&&t<.72?h.strength:0;
 const kick=Math.exp(-t*18)*p,rattle=Math.sin(t*48)*Math.exp(-t*7)*p*(1-clamp(t/.72,0,1));
 out.pitch=-(h?.front||0)*(kick*.025+rattle*.012);
 out.roll=(h?.side??0)*(kick*.022+rattle*.015);
 out.heave=-(kick*.10+rattle*.045);
 out.bodyPitch=-(h?.front||0)*(kick*.065+rattle*.025);
 out.bodyRoll=(h?.side??0)*(kick*.055+rattle*.03);
 return out;
}
