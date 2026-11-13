import {distance,solid,lineClear,WATERS,waterState,inWater,gateBlocks,wrap,move} from './under-green-course.js';
import {JOE_RADIUS,weaponClear,turnJoe} from './under-green-clearance.js';
import {TRIMMER,authoredTrimmerPose,trimmerContact} from './under-green-trimmer.js';

// A player walking directly toward the visible blade can otherwise pass Joe
// during a late windup. Prepare from fresh observed motion, then commit to the
// same stationary sweep. This changes preparation distance, never blade reach.
export function approachingStrike(joe,player,velocity,windup,gate=0){
 if(!velocity)return false;
 const dx=player.x-joe.x,dy=player.y-joe.y,gap=Math.hypot(dx,dy);
 if(gap<=1.55||gap>8||-(dx*velocity.x+dy*velocity.y)/gap<.5)return false;
 const yaw=Math.atan2(dx,dy);
 const turnSeconds=Math.max(0,Math.abs(wrap(yaw-joe.yaw))-.12)/2.4;
 for(const fraction of [1/6,1/3,1/2,2/3,5/6]){
  const age=TRIMMER.sweepSeconds*fraction,horizon=turnSeconds+windup+age;
  const predicted={...player,x:player.x+velocity.x*horizon,y:player.y+velocity.y*horizon};
  const strike={...joe,yaw,phase:'sweep',age,weaponPose:null,weaponBlocked:false};
  // Aim for the body's centre rather than forecasting a marginal edge graze.
  // Small steering changes can still beat the committed swing naturally.
  if(trimmerContact(strike,predicted,.12)&&lineClear(player,predicted,.3,gateBlocks(gate,1.8)))return true;
 }
 return false;
}

// A blocked blade earns its full recovery. Only then may Joe walk to a nearby
// stance based on the player he can currently see. This is not a strike lunge.
export function clearAttackFrom(position,target,gate=0){
 const yaw=Math.atan2(target.x-position.x,target.y-position.y);
 const joe={...position,yaw,weaponPose:null,weaponBlocked:false};
 for(const [phase,ages] of [['windup',[0,.2,.4,.6,.95]],['sweep',Array.from({length:13},(_,i)=>TRIMMER.sweepSeconds*i/12)],['recover',[0,.4,.8,TRIMMER.recoverSeconds]]]){
  for(const age of ages){const pose=authoredTrimmerPose({...joe,phase,age});if(!weaponClear(joe,gate,pose))return false;}
 }
 return true;
}

export function planAttackReposition(run){
 const j=run.joe,p=run.player,heading=Math.atan2(p.x-j.x,p.y-j.y),candidates=[];
 const blocked=point=>solid(point,JOE_RADIUS,gateBlocks(run.gate,1.9))||WATERS.some(w=>waterState(w,run.time,run.bypass,run.bypassAt).danger&&inWater(point,w,JOE_RADIUS));
 const consider=target=>{
  const gap=distance(target,p),travel=distance(j,target);
  if(gap<.95||gap>1.5||travel<.15||travel>2.5||blocked(target)||!lineClear(j,target,JOE_RADIUS,gateBlocks(run.gate,1.9)))return;
  // Check the whole short step for water and body clearance; the live mover
  // additionally checks the carried weapon and the player's changing position.
  const count=Math.ceil(travel/.1);
  if(Array.from({length:count},(_,i)=>({x:j.x+(target.x-j.x)*(i+1)/count,y:j.y+(target.y-j.y)*(i+1)/count})).some(point=>blocked(point)||distance(point,p)<Math.min(.75,distance(j,p))-.000001))return;
  candidates.push({target,travel});
 };
 for(const back of [0,.4,.7])for(const side of [-.55,.55,-.85,.85,0]){
  if(back===0&&side===0)continue;
  consider({x:j.x-Math.sin(heading)*back+Math.cos(heading)*side,y:j.y-Math.cos(heading)*back-Math.sin(heading)*side});
 }
 candidates.sort((a,b)=>a.travel-b.travel);
 let candidate=candidates.find(c=>clearAttackFrom(c.target,p,run.gate));
 // At normal attack distance a purely sideways/backward step increases the
 // gap beyond reach, leaving no candidates. Try nearby stances around the
 // observed target instead. The whole move stays clear of player and world;
 // this is an ordinary walking adjustment after the full blocked recovery.
 if(!candidate){
  candidates.length=0;
  for(const radius of [1,1.1,1.25,1.45])for(let turn=1;turn<=10;turn++)for(const side of [-1,1]){
   const angle=side*turn*Math.PI/12;consider({x:p.x-Math.sin(heading+angle)*radius,y:p.y-Math.cos(heading+angle)*radius});
  }
  candidates.sort((a,b)=>a.travel-b.travel);candidate=candidates.find(c=>clearAttackFrom(c.target,p,run.gate));
 }
 return candidate?{target:candidate.target,observed:{x:p.x,y:p.y},started:run.time}:null;
}

export function advanceAttackReposition(run,sees,dt,speed){
 const j=run.joe,plan=j.attackReposition;if(!plan)return false;
 // Never follow a hidden player or chase a moving aim point through this step.
 if(!sees||distance(run.player,plan.observed)>1.5||run.time-plan.started>3.5||distance(j,plan.target)<.03){
  j.attackReposition=null;j.repath=0;return false;
 }
 j.phase='walk';
 const heading=Math.atan2(plan.target.x-j.x,plan.target.y-j.y);
 // The shortest turn can sweep the carried blade into the same wall that
 // blocked the strike. Try the other direction with the same bounded turn
 // speed; never rotate the tool through scenery to reach the new stance.
 if(plan.turnDirection){
  const remaining=((heading-j.yaw)*plan.turnDirection%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
  turnJoe(j,j.yaw+plan.turnDirection*Math.min(remaining,2.4*dt),dt,run.gate);
 }else if(!turnJoe(j,heading,dt,run.gate)){
  plan.turnDirection=-Math.sign(wrap(heading-j.yaw));
  turnJoe(j,j.yaw+plan.turnDirection*2.4*dt,dt,run.gate);
 }
 if(Math.abs(wrap(heading-j.yaw))>.22){j.phase='turn';return true;}
 delete plan.turnDirection;
 const amount=Math.min(speed*dt,distance(j,plan.target));
 // Existing body contact can be closer than the desired .75m clearance.
 // Permit a step that increases separation instead of trapping both actors.
 const clearance=Math.min(.75,distance(j,run.player));
 const blocked=point=>distance(point,run.player)<clearance-.000001||!weaponClear({...j,...point},run.gate)||WATERS.some(w=>waterState(w,run.time,run.bypass,run.bypassAt).danger&&inWater(point,w,JOE_RADIUS));
 const traveled=move(j,Math.sin(j.yaw)*amount,Math.cos(j.yaw)*amount,JOE_RADIUS,gateBlocks(run.gate,1.9),blocked);
 j.speed=traveled/dt;j.walk+=traveled;
 return true;
}
