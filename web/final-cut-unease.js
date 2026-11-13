import {distance,lineClear,refuge,wrap,clamp} from './final-cut-course.js';
import {approachingCut} from './final-cut-messages.js';

// A real cloth banner outside the playing boundary; never an enemy or a cue
// about Joe's location. Its one optional beat only belongs to settled downtime.
export const UNEASE_BANNER={x:27.5,y:38,height:2.05,width:2.6,clothHeight:1.5};
export const createUnease=saved=>({seen:saved?.seen===true,settled:0,age:null});
export const uneaseSnapshot=r=>({seen:r.unease.seen});
export function advanceUnease(r,dt,interaction=false,view={}){
 const u=r.unease,p=r.player;
 const quiet=!view.reducedMotion&&r.mode==='playing'&&!r.won&&r.arrival.open&&r.pump&&r.water===1&&refuge(p)?.id==='pump'&&
  !approachingCut(r)&&distance(p,r.rig)>25&&p.speed<.15&&!p.focus&&!r.ballAim.active&&
  !interaction&&r.messageTime<=0&&!r.drama.active&&!r.drama.pending&&r.drama.phase==='refuge';
 if(!quiet){u.settled=0;u.age=null;return;}
 if(u.age!==null){u.age+=dt;if(u.age>=6)u.age=null;return;}
 if(u.seen)return;
 const angle=Math.abs(wrap(Math.atan2(UNEASE_BANNER.x-p.x,UNEASE_BANNER.y-p.y)-p.yaw-p.rearAngle));
 const halfFov=Number.isFinite(view.viewHalfFov)?view.viewHalfFov:1;
 const visible=angle>.06&&angle<Math.min(.9,halfFov-.1)&&Math.abs(p.pitch)<.3&&distance(p,UNEASE_BANNER)<25&&lineClear(p,UNEASE_BANNER);
 u.settled=visible?u.settled+dt:0;
 if(u.settled>=2){u.seen=true;u.age=0;r.saveSerial++;}
}
export function uneaseFrame(r,reduced=false){
 const age=r.unease.age;
 // Wind falls away first; the single, slow fold then moves against the still
 // surrounding cloth. No flashes, stinger, caption, camera tug or extra task.
 const moving=!reduced&&age!==null;
 const fold=moving?Math.sin(Math.PI*clamp((age-1.7)/3.5,0,1))**2:0;
 return {age,fold,wind:moving?.003:null};
}
