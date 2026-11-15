import {captureFailure} from './chase-outcome.js';
import {blocked,clamp} from './back-nine-course.js';
import {constrainFeatureMotion,constrainVehicleMotion,VEHICLE_HULLS} from './vehicle-contact.js';

export const RUNOVER_SECONDS=2.4;
export function beginRunover(run){
 if(run.death||!run.foot)return;
 run.failure=captureFailure(run);
 const p=run.foot,j=run.joe;
 run.death={age:0,x:p.x,y:p.y,yaw:j.yaw,startYaw:p.moveYaw??p.yaw,strength:run.impact?.strength??.7,rollSpeed:clamp((run.impact?.mowerSpeed??Math.abs(j.speed))*.38,3.5,6),travel:0};
 run.mode='dying';p.speed=0;p.steer=0;
 j.ram.phase='none';j.ram.release=0;j.route=[];j.mode='running_over';j.speed=run.death.rollSpeed;
 run.finishHold=0;run.message='Joe ran you down.';run.messageTime=RUNOVER_SECONDS;
 run.events.push({type:'run-over',time:run.time});
}

// The victim is already defeated. Only then may the mower cross their space.
// Keep the real wreck, course boundaries and scenery solid during the roll-over.
export function updateRunover(run,dt){
 const death=run.death,j=run.joe;dt=clamp(dt,0,1/30);run.time+=dt;death.age+=dt;run.impact.age+=dt;
 if(death.age<1.65){
  const from={x:j.x,y:j.y,yaw:j.yaw},step=death.rollSpeed*dt;j.yaw=death.yaw;
  const next={x:j.x+Math.sin(j.yaw)*step,y:j.y+Math.cos(j.yaw)*step};
  const front=Math.max(...VEHICLE_HULLS.mower.map(h=>h.forward*Math.cos(j.yaw)+Math.abs(Math.sin(j.yaw))*h.width+Math.abs(Math.cos(j.yaw))*h.length));
  const gate=from.y<800&&next.x>-30&&next.x<-16&&next.y+front>799.72&&from.y+front<=799.72;
  if(!gate&&!blocked(next,1.65)){j.x=next.x;j.y=next.y;constrainFeatureMotion(j,from,'mower',run);constrainVehicleMotion(j,from,run.cart,'mower','cart');}
  const moved=Math.hypot(j.x-from.x,j.y-from.y);death.travel+=moved;j.speed=moved/Math.max(dt,.0001);
 }else j.speed=0;
 if(death.age>=RUNOVER_SECONDS){death.age=RUNOVER_SECONDS;run.mode='caught';j.speed=0;run.events.push({type:'caught',time:run.time});}
}
