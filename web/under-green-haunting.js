import {distance,lineClear,solid} from './under-green-course.js';
import {weaponClear} from './under-green-clearance.js';
import {rangeY} from './under-green-layout.js';
export const HAUNT_SITES=[{x:0,y:34},{x:10,y:70},{x:-30,y:62},{x:-18,y:42},{x:12,y:rangeY(20)}];
const duration=9,speed=.5,smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function hauntingPose(lane,age){
 const pace=lane.speed||speed,travel=age*pace,u=Math.min(1,age/duration),bend=Math.sin(u*Math.PI)*.12,curve=Math.cos(u*Math.PI)*.12*Math.PI/(duration*pace);
 return {x:lane.x+Math.sin(lane.heading)*travel+Math.cos(lane.heading)*bend,y:lane.y+Math.cos(lane.heading)*travel-Math.sin(lane.heading)*bend,heading:lane.heading+Math.atan(curve),walk:travel};
}
function laneFor(site,r,serial){
 const toward=Math.atan2(r.player.x-site.x,r.player.y-site.y),headings=[Math.PI/2,-Math.PI/2,toward,0,Math.PI];
 if(serial%2)headings.push(headings.shift());
 for(const heading of headings){
  const pace=Math.abs(Math.sin(heading))>.95?.25:speed;
  const lane={x:site.x-Math.sin(heading)*duration*pace/2,y:site.y-Math.cos(heading)*duration*pace/2,heading,speed:pace};let clear=true;
  for(let age=0;age<=duration;age+=.25){const p=hauntingPose(lane,age);if(distance(p,r.player)<4||solid(p,.8,true)||!weaponClear({...p,yaw:p.heading,phase:'walk',age:0},1)){clear=false;break;}}
  if(clear)return lane;
 }return null;
}
export function createDrainHaunting(){
 let owner=null,current=null,next=8,serial=0,lastTime=0,lastPose=null;
 return {
  sample(r,reduced=false){
   if(owner!==r||r.elapsed<lastTime){owner=r;current=null;next=8;serial=0;lastPose=null;}
   lastTime=r.elapsed;
   const danger=!['absent','blocked'].includes(r.joe.phase)&&distance(r.player,r.joe)<10;
   const suppressed=r.finished||r.player.recovery||r.closing||danger;
   // Fade an interrupted sighting while it continues along its chosen lane.
   if(suppressed){next=Math.max(next,r.elapsed+5);if(current&&current.fadeAt===undefined)current.fadeAt=r.elapsed;}
   if(current&&(r.elapsed-current.start>=duration||r.elapsed-(current.fadeAt??Infinity)>=1.2)){current=null;lastPose=null;next=r.elapsed+24;}
   if(!current&&!suppressed&&r.mode==='playing'&&r.elapsed>=next){
    const yaw=r.player.yaw+(r.player.rearAngle||0);
    for(const site of HAUNT_SITES){
     const d=distance(r.player,site);if(d<=7||d>=22||!lineClear(r.player,site,.15)||((site.x-r.player.x)*Math.sin(yaw)+(site.y-r.player.y)*Math.cos(yaw))/d<=.55)continue;
     const lane=laneFor(site,r,serial);if(lane){current={...lane,start:r.elapsed,serial:++serial};break;}
    }
   }
   if(!current)return null;
   const age=r.elapsed-current.start,pose=hauntingPose(current,age),fade=smooth(age/2.2)*(1-smooth((age-6)/3))*(1-smooth((r.elapsed-(current.fadeAt??Infinity))/1.2));
   lastPose=pose;
   return {...current,x:pose.x,y:pose.y,yaw:-pose.heading,alpha:.46*fade,motion:{time:age,walk:pose.walk,reduced}};
  },
  stats:()=>({serial,next,site:lastPose?{x:lastPose.x,y:lastPose.y}:null,walking:!!current})
 };
}
