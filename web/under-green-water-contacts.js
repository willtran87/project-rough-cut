import {waterLocal,onFloor,solid} from './under-green-course.js';
import {floodState} from './under-green-flood.js';
import {shallowWaterHeight} from './under-green-wet-ground.js';

// Beneath the existing gallery pipe and pump-return pipe, over real water.
export const DRAIN_DRIPS=Object.freeze([
 {x:-2.65,y:23,height:3.1,period:4.7,offset:1.3},
 {x:-2.65,y:64,height:3.1,period:6.1,offset:3.2},
 {x:-20,y:49,height:3.45,period:5.3,offset:.4},
]);
export function drainDripSample(drip,time,waterHeight){
 const age=((time+drip.offset)%drip.period+drip.period)%drip.period;
 const fall=Math.sqrt(2*Math.max(0,drip.height-waterHeight)/9.8);
 return {age,fall,height:drip.height-4.9*age*age,falling:age<fall};
}

export function waterContactHeight(point,waters,states,floodDepth=0){
 if(!onFloor(point.x,point.y)||solid(point,.01))return null;
 let height=shallowWaterHeight(point);
 if(floodDepth>.006)height=Math.max(height??0,floodDepth);
 for(let i=0;i<waters.length;i++){
  const local=waterLocal(point,waters[i]);
  if(Math.abs(local.x)<waters[i].width/2-.08&&Math.abs(local.y)<waters[i].depth/2-.22)height=Math.max(height??0,.025+states[i].level*.08);
 }
 return height;
}

// Presentation history never consumes the actor's audio events or modifies
// the simulation. Retry/time jumps clear the pool; pause cannot add contacts.
export function createDrainWaterContacts(waters,{capacity=40}={}){
 let owner=null,lastTime=null,playerStep=0,joeStep=0,lastBlade=null,previousBlade=null,serial=0,events=[];
 const totals={player:0,joe:0,blade:0,drip:0};
 function reset(r,actor){owner=r;lastTime=r.time;playerStep=Math.floor(r.player.walk/.72);joeStep=actor?.footsteps?.serial||0;lastBlade=null;previousBlade=actor?.blade?structuredClone(actor.blade):null;serial=0;events=[];for(const key in totals)totals[key]=0;}
 function add(kind,point,height,time,strength,velocity={}){events.push({kind,x:point.x,y:point.y,height,time,strength,serial:++serial,...velocity});if(events.length>capacity)events.shift();totals[kind]++;}
 return {
  update(r,states,actor){
   if(owner!==r||lastTime===null||r.time<lastTime||r.time-lastTime>.5){reset(r,actor);return events;}
   if(r.time===lastTime)return events;
   const previousTime=lastTime;lastTime=r.time;events=events.filter(e=>r.time-e.time<1.15);
   if(!['playing','aftermath'].includes(r.mode))return events;
   const flood=floodState(r.elapsed).depth,heightAt=p=>waterContactHeight(p,waters,states,flood);
   for(const drip of DRAIN_DRIPS){
    const height=heightAt(drip);if(height===null)continue;
    const current=drainDripSample(drip,r.time,height),previous=drainDripSample(drip,previousTime,height);
    if(current.age>=current.fall&&previous.age<current.fall&&current.age>=previous.age)add('drip',drip,height,r.time,.32);
   }
   const step=Math.floor(r.player.walk/.72);
   if(step!==playerStep&&r.player.speed>.2){
    const side=step%2?1:-1,p={x:r.player.x+Math.cos(r.player.yaw)*side*.14,y:r.player.y-Math.sin(r.player.yaw)*side*.14},height=heightAt(p);
    if(height!==null)add('player',p,height,r.time,.72);
   }
   playerStep=step;
   const contact=actor?.footsteps?.lastContact;
   if(contact&&contact.serial!==joeStep){
    const foot=actor.soleContacts?.[contact.foot],height=foot&&heightAt(foot);
    if(foot&&height!==null&&Math.abs(r.time-contact.time)<.1)add('joe',foot,height,r.time,.9);
   }
   joeStep=actor?.footsteps?.serial||0;
   if(actor?.blade&&!['absent','enter'].includes(r.joe.phase)){
    const {near,far}=actor.blade;let touching=false;
    for(let i=0;i<=6;i++){
     const t=i/6,p={x:near.x+(far.x-near.x)*t,y:near.y+(far.y-near.y)*t},h=near.height+(far.height-near.height)*t;
     const old=previousBlade&&{x:previousBlade.near.x+(previousBlade.far.x-previousBlade.near.x)*t,y:previousBlade.near.y+(previousBlade.far.y-previousBlade.near.y)*t,height:previousBlade.near.height+(previousBlade.far.height-previousBlade.near.height)*t};
     const dt=r.time-previousTime,vx=old?(p.x-old.x)/dt:0,vy=old?(p.y-old.y)/dt:0;
     let point=p,water=heightAt(p),at=r.time;
     // Catch a descending blade crossing between rendered frames. Limit to
     // continuous local movement; a teleported fixture is not an impact.
     if(old&&water!==null&&old.height>water+.012&&h<water&&Math.hypot(p.x-old.x,p.y-old.y)<1.2){
      const fraction=(old.height-water)/(old.height-h),cross={x:old.x+(p.x-old.x)*fraction,y:old.y+(p.y-old.y)*fraction};
      const crossWater=heightAt(cross);
      if(crossWater!==null&&Math.abs(crossWater-water)<.02){point=cross;water=crossWater;at=previousTime+dt*fraction;}
      else continue;
     }else if(water===null||h>water+.012||h<water-.07)continue;
     touching=true;
     if(!lastBlade||Math.hypot(point.x-lastBlade.x,point.y-lastBlade.y)>.22){add('blade',point,water,at,.62,{vx,vy});lastBlade=point;}
     break;
    }
    if(!touching)lastBlade=null;
    previousBlade={near:{...near},far:{...far}};
   }else{previousBlade=null;lastBlade=null;}
   return events;
  },
  stats:()=>({capacity,active:events.length,serial,totals:{...totals},last:events.at(-1)||null}),
 };
}
