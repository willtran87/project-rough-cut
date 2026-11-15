import {blocked,lineClear,distance,clamp,angleDelta} from './back-nine-course.js';
import {constrainFeatureMotion,vehicleOverlap,constrainVehicleMotion} from './vehicle-contact.js';
import {scaledImpactDamage} from './ram-damage.js';
import {updateRunnerLook} from './runner-look.js';
import {ejectionPathClear} from './chase-ejection-clearance.js';

export const CART_MAX_HEALTH=100;
export const chaseActor=run=>run.foot||run.cart;
export function repairCart(run,amount){
 if(run.foot||run.cart.health<=0)return false;
 const before=run.cart.health;run.cart.health=Math.min(CART_MAX_HEALTH,before+amount);return run.cart.health>before;
}
export const impactDamage=scaledImpactDamage;

// Joe now pushes through the wreck. Keep the former approach hook for callers,
// but aim at the runner instead of treating the abandoned cart as safe cover.
export function runnerApproach(run,target){
 return target;
}

// Search a small local set of door exits. Reject walls, the wreck and the
// mower; never launch the player through a fence or across the course.
export function leaveBrokenCart(run){
 if(run.foot)return true;
 const c=run.cart,j=run.joe,incomingSpeed=run.impact?.incomingSpeed??Math.abs(c.speed);c.health=0;c.speed=0;c.steer=0;c.failedAt??=run.time;
 const candidates=[],seat={x:c.x-.36*Math.cos(c.yaw)-.2*Math.sin(c.yaw),y:c.y+.36*Math.sin(c.yaw)-.2*Math.cos(c.yaw)};
 for(const radius of [2.05,2.7,3.5])for(let i=0;i<16;i++){
  const yaw=c.yaw+i*Math.PI/8,p={x:c.x+Math.sin(yaw)*radius,y:c.y+Math.cos(yaw)*radius,yaw:c.yaw,onFoot:true};
  if(!ejectionPathClear(c,p,.32,run)||!ejectionPathClear(seat,p,.32,run)||vehicleOverlap(p,j))continue;
  const probe={...p,speed:0};if(constrainVehicleMotion(probe,p,c,'foot','cart'))continue;
  const side=(p.x-c.x)*Math.cos(c.yaw)-(p.y-c.y)*Math.sin(c.yaw);
  // Prefer open side doors and the actual impulse, not an arbitrary launch.
  const h=run.impact,momentum=((p.x-c.x)*(h?.pushX||0)+(p.y-c.y)*(h?.pushY||0))/radius;
  // Prefer a door with room to run in the cart's established direction. A
  // mower ahead otherwise favours landing directly behind the wreck, leaving
  // the first forward input aimed into its rear panel. Keep the old safe
  // candidates when a narrow location genuinely requires turning first.
  const escape={...p,x:p.x+Math.sin(c.yaw)*3.5,y:p.y+Math.cos(c.yaw)*3.5,speed:0};
  const open=lineClear(p,escape,.32)&&!constrainFeatureMotion(escape,p,'foot',run)&&!constrainVehicleMotion(escape,p,c,'foot','cart')&&!constrainVehicleMotion(escape,p,j,'foot','mower');
  candidates.push({p,score:distance(p,j)-radius*.35+Math.abs(side)/radius*.8+momentum*.25+(open?2.2:0)});
 }
 if(!candidates.length)return false; // Try again after Joe's physical backoff.
 candidates.sort((a,b)=>b.score-a.score);
 run.foot={...candidates[0].p,viewYaw:c.yaw,speed:0,steer:0,surface:c.surface,invulnerable:5};
 // Presentation follows the already validated escape point. Recovery and the
 // five-second protection begin together. A short landing recovery precedes control.
 run.foot.ejection={at:run.time,x:run.foot.x,y:run.foot.y,seatX:seat.x,seatY:seat.y,yaw:c.yaw,incomingSpeed,side:(run.foot.x-c.x)*Math.cos(c.yaw)-(run.foot.y-c.y)*Math.sin(c.yaw)<0?1:-1};
 run.grace=Math.max(run.grace,5);run.finishHold=0;run.contact=0;
 Object.assign(run.panic,{phase:'panic',age:0,remaining:9,intensity:1,serial:run.panic.serial+1});
 run.message=run.checkpoint===2?'CART WRECKED · RUN! Use the small maintenance gaps, then hold Use inside the powered garage.':'CART WRECKED · RUN! Use cover and small fence gaps. Both relay shelters still work on foot.';run.messageTime=6;
 run.events.push({type:'abandon-cart',time:run.time});return true;
}

// Cart-style steering on foot; retain small swept steps and sliding collision.
export function moveRunner(run,input,dt){
 const p=run.foot;if(p.ejection&&run.time-p.ejection.at<.86){p.speed=0;p.driveSpeed=0;return false;}
 const old={x:p.x,y:p.y,yaw:p.yaw},side=clamp(input.steer||0,-1,1),forward=clamp(input.throttle||0,-1,1);
 p.yaw=angleDelta(p.yaw+side*2.6*dt*(forward<0?-1:1),0);
 updateRunnerLook(p,input,dt);
 const yaw=p.yaw,dx=Math.sin(yaw)*forward,dy=Math.cos(yaw)*forward;
 p.travelSign=forward<0?-1:1;
 const targetSpeed=input.brake||!forward?0:({path:7.2,rough:6.6,wet:6.4,sand:4.8}[p.surface]||7.2);
 p.driveSpeed=input.brake||!forward?0:(p.driveSpeed||0)+(targetSpeed-(p.driveSpeed||0))*(1-Math.exp(-dt*18));
 const amount=p.driveSpeed*dt,steps=Math.max(1,Math.ceil(amount/.06));let touched=false;
 for(let i=0;i<steps;i++){
  const from={x:p.x,y:p.y,yaw:p.yaw},sx=dx*amount/steps,sy=dy*amount/steps;
  let best=from,score=0,bestHit=false;
  for(const [mx,my]of [[sx,sy],[sx,0],[0,sy]]){
   const candidate={...p,x:from.x+mx,y:from.y+my};if(blocked(candidate,.32))continue;
   constrainFeatureMotion(candidate,from,'foot',run);if((run.wreck?.crush??0)<1)constrainVehicleMotion(candidate,from,run.cart,'foot','cart');
   const hit=constrainVehicleMotion(candidate,from,run.joe,'foot','mower');
   const progress=(candidate.x-from.x)*dx+(candidate.y-from.y)*dy;
   if(progress>score){best=candidate;score=progress;bestHit=hit;}
   if(mx===sx&&my===sy&&Math.abs(candidate.x-from.x-sx)<.00001&&Math.abs(candidate.y-from.y-sy)<.00001)break;
  }p.x=best.x;p.y=best.y;touched||=bestHit;
 }
 p.speed=distance(old,p)/Math.max(dt,.0001);
 // Face actual swept motion: a diagonal stopped by a fence must not leave
 // the runner facing the blocked direction while sliding along the boards.
 if(p.speed>.025)p.moveYaw=angleDelta(Math.atan2(p.x-old.x,p.y-old.y)+(forward<0?Math.PI:0),0);
 else p.moveYaw=p.yaw;
 p.steer=side;return touched;
}
