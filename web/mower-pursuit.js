import {clamp,distance,mowerLineClear,angleDelta} from './back-nine-course.js';

// Six bounded line probes, only when a route is planned. Keep the original
// obstacle-aware path whenever a farther waypoint cannot be reached directly.
export function trimPursuitRoute(joe){
 const horizon=clamp(Math.abs(joe.speed)*.45+4,6,15);let skip=0;
 for(let i=1;i<Math.min(7,joe.route.length);i++){
  if(distance(joe,joe.route[i])>horizon)break;
  if(mowerLineClear(joe,joe.route[i]))skip=i;else break;
 }
 if(skip)joe.route.splice(0,skip);
}

export function pursuitCatchup(run,visible,separation){
 const j=run.joe,h=run.hunt;
 if(run.foot||run.grace>0||run.cart.invulnerable>0||run.mode!=='driving'||run.decoys.active>=0||h.phase!=='follow'||j.ram.phase!=='none'||['opening','gather'].includes(run.pressure.phase)||run.tension.phase==='breather'||run.cart.y>770)return 0;
 // Hidden steering never supplies a catch-up target or distance. Only the
 // last observed position gets a short memory; cover then removes the boost.
 const gap=visible?separation:h.lastVisualAge<1.5&&h.lastVisual?distance(j,h.lastVisual):0;
 return clamp((gap-32)/24,0,1);
}

export function cornerSpeed(joe,goal){
 const first=joe.route[0],next=joe.route[1];if(!first||!next)return goal;
 const incoming=Math.atan2(first.x-joe.x,first.y-joe.y),outgoing=Math.atan2(next.x-first.x,next.y-first.y),bend=Math.abs(angleDelta(outgoing,incoming));
 if(bend<.45)return goal;
 const corner=bend>1?5:9;
 return Math.min(goal,Math.sqrt(corner*corner+24*Math.max(0,distance(joe,first)-2)));
}
