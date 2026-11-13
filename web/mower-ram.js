import {chaseActor} from './chase-player.js';
import {offerTacticChoice} from './chase-encounter.js';
import {RAM_WINDUP_SECONDS} from './ram-windup.js';
import {angleDelta,blocked,distance,clamp,lineClear} from './back-nine-course.js';

export function createRam(){return {phase:'none',age:0,cycles:0,replan:0,escapeYaw:0,direction:-1,armed:false,launches:0,release:0,fromBackoff:false,chargeYaw:0,footCharge:0,nextChargeAt:0,choiceUntil:0,choiceSpeed:0};}
export function beginRamRecovery(run){
 const j=run.joe,r=j.ram;if(r.phase==='backoff')return;
 r.phase='backoff';r.armed=false;r.release=0;r.footCharge=0;r.choiceUntil=0;r.age=0;r.replan=0;r.cycles++;
 const away=Math.atan2(j.x-chaseActor(run).x,j.y-chaseActor(run).y);
 r.direction=Math.cos(angleDelta(away,j.yaw))>.3?1:-1;
 j.route=[];j.repath=0;j.stuck=0;j.reverse=0;j.speed=0;j.mode='backing_off';
 run.hunt.phase='follow';run.hunt.waypoints=[];run.hunt.cooldown=Math.max(run.hunt.cooldown,5);
 run.tension.phase='recover';run.tension.age=0;run.tension.remaining=3;run.tension.cooldown=Math.max(run.tension.cooldown,5);run.tension.surge=0;run.tension.windup=0;
 run.message=run.foot?'Joe is backing off. Run for cover!':'Joe is backing off. Drive clear!';run.messageTime=2.6;
}

export function beginRamWindup(run){const j=run.joe,r=j.ram;r.fromBackoff=r.phase==='backoff';r.phase='lineup';r.age=0;r.armed=false;r.release=0;j.speed=run.foot?Math.min(j.speed,3):0;j.mode='lining_up';j.route=[];j.repath=0;run.message='The engine falls quiet. Joe braces against the wheel.';run.messageTime=RAM_WINDUP_SECONDS;}

// Active during a deliberate ram windup or post-contact recovery. A fixed local set of swept moves finds clearance
// without teleporting, ignoring walls, or running global pathfinding each tick.
export function stepRamRecovery(run,dt,move){
 const j=run.joe,c=chaseActor(run),r=j.ram;r.age+=dt;j.stuck=0;j.reverse=0;
 const gap=distance(c,j),from={x:j.x,y:j.y,yaw:j.yaw};
 if(r.phase==='missed'){
  j.mode='recovering_charge';j.speed*=Math.exp(-dt*7);const contact=move(j,dt,1.65,c,'mower',from);
  if(r.age>=1.6){r.phase='none';r.age=0;j.repath=0;}return contact;
 }
 if(r.phase==='lineup'){
  j.mode='lining_up';
  // Keep pace with a fleeing cart while telegraphing. A stopped/nearby
  // player still gets the full stationary windup after Joe backs away.
  const observation=j.senses?.observation,observedSpeed=observation?.speed??0,observedGap=observation?distance(j,observation):gap;
  j.speed=run.foot?j.speed+(Math.min(3,Math.max(0,observedGap-8))-j.speed)*(1-Math.exp(-dt*5)):observedSpeed>5&&observedGap>10?Math.min(15,observedSpeed*.98):0;
  if(gap<6){beginRamRecovery(run);return;}
  if(run.grace>0){r.age=0;return;}
  const seen=j.lastSeen,lead=run.foot?Math.min(.8,observedGap/30):0,observedYaw=observation?.yaw??j.yaw;const target=seen&&{x:seen.x+Math.sin(observedYaw)*observedSpeed*lead,y:seen.y+Math.cos(observedYaw)*observedSpeed*lead};if(target&&r.age<(run.foot?1.1:.7))j.yaw+=clamp(angleDelta(Math.atan2(target.x-j.x,target.y-j.y),j.yaw),-.9*dt,.9*dt);
  const contact=move(j,dt,1.65,c,'mower',from);
  if(r.age>=RAM_WINDUP_SECONDS){r.phase='none';r.age=0;r.armed=true;r.launches++;r.release=.35;r.footCharge=run.foot?2.9:0;r.nextChargeAt=run.time+5.2;r.chargeYaw=j.yaw;j.repath=0;run.message='The decks bite. Joe lunges.';run.messageTime=1.6;}
  return contact;
 }
 j.mode='backing_off';r.replan-=dt;
 if(r.replan<=0){
  const away=Math.atan2(j.x-c.x,j.y-c.y);let best=-Infinity;r.escapeYaw=away;
  for(const offset of [0,-.55,.55,-1.1,1.1,-1.57,1.57]){
   const yaw=away+offset,p={x:j.x+Math.sin(yaw)*3,y:j.y+Math.cos(yaw)*3};
   if(blocked(p,1.65)||!lineClear(j,p,1.65))continue;
   const score=distance(p,c)-gap-Math.abs(offset)*.12;
   if(score>best){best=score;r.escapeYaw=yaw;}
  }r.replan=.3;
 }
 let best=null,bestScore=-Infinity;
 for(const direction of [r.direction,-r.direction,0])for(const turn of [0,-.9,.9]){
  if(!direction&&!turn)continue;
  const v={...from,yaw:j.yaw+turn*dt,speed:direction*4.6};move(v,dt,1.65,c,'mower',from);
  const progress=distance(v,c)-gap,heading=v.yaw+(r.direction<0?Math.PI:0);
  // Do not use a forward nudge that closes the gap just to turn more quickly.
  if(progress<-.0001)continue;
  const score=progress*40-Math.abs(angleDelta(heading,r.escapeYaw))*.25+(direction===r.direction?.001:0);
  if(score>bestScore){bestScore=score;best=v;}
 }
 if(best){j.x=best.x;j.y=best.y;j.yaw=best.yaw;j.speed=best.speed;}else j.speed=0;
 if(r.age>=1.1&&distance(c,j)>=8.5){
  // A completed retreat cannot aim another charge through cover using stale evidence.
  if(j.senses?.observation&&j.seenAge>1.2){r.phase='none';r.age=0;r.armed=false;j.repath=0;}
  else if(!offerTacticChoice(run))beginRamWindup(run);
 }
 else if(r.age>4&&(!best||Math.abs(j.speed)<.1)){r.phase='none';r.armed=true;r.age=0;j.repath=0;} // Route out of a blocked retreat.
}
