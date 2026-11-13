import {floodState,floodPace} from './under-green-flood.js';
import {unseenPace,joeCouldBeSeen} from './under-green-unseen.js';
import {JOE_RADIUS,weaponClear,turnJoe,recoverStrike,settleWeapon} from './under-green-clearance.js';
import {movementStartScale} from './movement-response.js';
import {sluiceObstruction,sluiceObstructionMessage,SLUICE_COMMITMENT} from './under-green-sluice.js';
import {planJoeRoute,crossingWait,visibleApproachTarget,localSearchTarget} from './under-green-navigation.js';
import {planAttackReposition,advanceAttackReposition,approachingStrike} from './under-green-attack-position.js';
import {updatePump} from './under-green-pump.js';
import {TRIMMER,trimmerContact,trimmerSegment} from './under-green-trimmer.js';
import {CHECKPOINT_LAYOUT} from './under-green-layout.js';
import {ARRIVAL,SEARCH_POINTS,BUNKER_INSPECTION,RANGE_INSPECTION} from './under-green-encounters.js';
import {observeEncounter} from './under-green-observation.js';
import {telemetrySnapshot} from './local-telemetry.js';
import {nearbyAction,interactionFeedback} from './under-green-interactions.js';
export {nearbyAction} from './under-green-interactions.js';
import {captureFailure} from './under-green-outcome.js';
import {observeLesson} from './under-green-lesson.js';
import {clamp,distance,wrap,WATERS,LEVER,gateBlocks,waterState,inWater,waterLocal,waterPoint,keeperInside,solid,lineClear,sightClear,move,pathTo,district} from './under-green-course.js';
export const CHECKPOINTS=CHECKPOINT_LAYOUT;
// Level 1's foundation speeds converted through RCQuality.scale.meters (.16).
export const MOVEMENT={walk:24*.16,sprint:38*.16,crouch:15*.16,listen:15*.16};
// Planned pace before the optional start ramp. An idle ramp reports zero;
// guidance must still respect the active stance instead of assuming a walk.
export function movementPace(player){
 return (player.focus?MOVEMENT.listen:player.crouched?MOVEMENT.crouch:player.sprinting?MOVEMENT.sprint:MOVEMENT.walk)*(player.stumble>0?.45:1)*floodPace(player.floodDepth);
}
// Nonzero start indices are retained for isolated authoring/QA fixtures only.
// Player-facing entry, retry and replay always call this with a fresh start.
export function createRun(checkpoint=0,evidence=false,difficulty='standard',durable={}){
 checkpoint=clamp(checkpoint|0,0,3);const c=CHECKPOINTS[checkpoint];
 const bunkerRouteObserved=checkpoint>0&&durable.bunkerRouteObserved===true;
 const lessonCrossed=checkpoint>0||durable.lessonCrossed===true;
 return {version:3,mode:'briefing',checkpoint,time:c.time,elapsed:0,difficulty:['steady','standard','relentless'].includes(difficulty)?difficulty:'standard',player:{x:c.x,y:c.y,yaw:c.yaw,pitch:0,speed:0,walk:0,stumble:0,grace:2},joe:{x:c.joeX,y:c.joeY,yaw:0,speed:0,walk:0,phase:checkpoint?'walk':'absent',age:0,last:checkpoint?{x:c.x,y:c.y}:{...ARRIVAL.landing},seen:false,evidence:'none',evidenceAt:c.time,sawBunkerRoute:checkpoint===1&&bunkerRouteObserved,searchIndex:0,route:[],repath:0,search:0,attackYaw:0,attackSerial:0},bunkerRouteObserved,lessonCrossed,bypass:checkpoint>=2||durable.bypass===true,bypassAt:checkpoint>=2||durable.bypass===true?c.time-10:0,evidence,gate:0,closing:false,waterHits:0,waterLock:0,message:lessonCrossed?'':'Cross on the chevron. Pressure blocks the channel and throws you back.',messageTime:lessonCrossed?0:5,events:[],saveSerial:0,steps:0,finished:false,reason:'',rear:false};
}
export function say(r,text,seconds=4,kind='event'){r.message=text;r.messageTime=seconds;r.messageKind=kind;}
// Save chapter completion and preferences, never an in-progress attempt.
export function snapshot(r){const completed=r.mode==='complete'||r.finished;return {version:4,unlocked:true,evidence:completed&&r.evidence===true,completed,difficulty:r.difficulty};}
export function readSave(raw){try{
 const s=JSON.parse(raw);if(!s||![1,2,3,4].includes(s.version))return null;
 return {completed:s.completed===true,evidence:s.completed===true&&s.evidence===true,difficulty:['steady','standard','relentless'].includes(s.difficulty)?s.difficulty:'standard'};
}catch{return null;}}
function hurtWater(r,w){
 if(r.waterLock>0||r.player.recovery)return;
 r.waterLock=1.8;r.waterHits++;r.player.stumble=.65;const protectedRecovery=inWater(r.player,w,-.1);if(protectedRecovery)r.player.grace=Math.max(r.player.grace,.85);
 const side=r.player.waterEntry?.[w.id]||(waterLocal(r.player,w).y<=0?-1:1);
 r.player.recovery={channel:w.id,target:waterPoint(w,waterLocal(r.player,w).x,side*(w.depth/2+1.1)),age:0,side,protected:protectedRecovery};
 say(r,w.lesson?'The surge pushes you back. Reach the striped bank, then try a green opening.':'The surge is pushing you back. Steer toward the dry bank; keep an escape route open.',3.6);
 r.events.push({type:'water-hit',id:w.id,time:r.time,x:r.player.x,y:r.player.y});
}
function recoverPlayer(r,dt){
 const p=r.player,recovery=p.recovery;if(!recovery)return;
 recovery.age+=dt;
 // Bounded translation, swept against the same walls and Joe. No camera rotation.
 // Current acts along the channel. A fixed world-space target used to undo
 // every accepted sidestep and funnel the player back to the original lane.
 const water=WATERS.find(w=>w.id===recovery.channel),local=waterLocal(p,water);
 recovery.target=waterPoint(water,local.x,recovery.side*(water.depth/2+1.1));
 const remaining=(waterLocal(recovery.target,water).y-local.y)*recovery.side;
 const scale=Math.min(1,8*dt/Math.max(remaining,.001));
 if(remaining<=.05){p.recovery=null;if(recovery.protected)p.grace=Math.max(p.grace,.3);p.stumble=Math.min(p.stumble,.15);return;}
 // Ordinary movement can legitimately leave less than .75m between actors.
 // A current that increases that separation must still carry the player out;
 // demanding the full clearance in one step cancelled recovery in the jet.
 // Check each swept step against the current gap, never allowing it to shrink
 // below existing close contact or to pass through a body on the return path.
 const blockedByJoe=point=>!['absent','enter'].includes(r.joe.phase)&&distance(point,r.joe)<Math.min(.75,distance(p,r.joe))-.000001;
 const travelled=move(p,(recovery.target.x-p.x)*scale,(recovery.target.y-p.y)*scale,.3,gateBlocks(r.gate,p.crouched?1.25:1.8),blockedByJoe);
 if(Math.abs(waterLocal(p,water).x)>water.width/2+.4||recovery.age>1.2||travelled<.0001){
  p.recovery=null;if(recovery.protected)p.grace=Math.max(p.grace,.3);p.stumble=Math.min(p.stumble,.15);
 }
}
function perceive(r){
 const j=r.joe,p=r.player,d=distance(j,p),bearing=wrap(Math.atan2(p.x-j.x,p.y-j.y)-j.yaw),clear=sightClear(j,p,r.gate);
 j.approachVelocity=null;
 j.seen=clear&&d<34&&(d<3.5||Math.abs(bearing)<1.25);
 if(j.seen){
  const previous=j.previousSight;
  if(previous&&r.time-previous.time<.2){
   const elapsed=r.time-previous.time;
   if(elapsed>0){
    const velocity={x:(p.x-previous.x)/elapsed,y:(p.y-previous.y)/elapsed};
    // Reject teleport/fixture jumps; only actual observed on-foot travel can
    // justify anticipation. Lost sight discards this motion immediately.
    if(Math.hypot(velocity.x,velocity.y)<=MOVEMENT.sprint+.1){j.approachVelocity=velocity;if(Math.hypot(velocity.x,velocity.y)>.2){j.trailHeading=Math.atan2(velocity.x,velocity.y);j.trailAt=r.time;}}
   }
   if(Math.abs(p.x-previous.x)>.005&&p.y>BUNKER_INSPECTION.minimumY&&p.x<BUNKER_INSPECTION.maximumX){
    const observed=p.x<previous.x;
    j.sawBunkerRoute=observed;
    // Route memory belongs to this attempt. A witnessed retreat cancels the
    // inference; an unseen retreat cannot. Every retry resets both memories.
    r.bunkerRouteObserved=observed;
   }
   if(p.x>RANGE_INSPECTION.minimumX&&p.y>RANGE_INSPECTION.minimumY&&p.y<RANGE_INSPECTION.maximumY){
    if(p.y<previous.y-.005)j.sawRangeRoute=true;
    // A witnessed retreat supersedes the route choice. Unseen movement does not.
    if(p.y>previous.y+.005)j.sawRangeRoute=false;
   }
  }
  j.previousSight={x:p.x,y:p.y,time:r.time};
 }
 const masked=WATERS.some(w=>distance(p,w)<10&&waterState(w,r.time,r.bypass,r.bypassAt).danger);
 const hearing=(p.speed>4.5?14:p.speed>2.5?8:p.speed>.2?3:0)*(masked?.45:1);
 const heard=!p.focus&&d<hearing*(clear?1:.4);
 if(j.seen||heard){j.last={x:p.x,y:p.y};j.evidence=j.seen?'sight':'footsteps';j.evidenceAt=r.time;j.search=0;j.searchIndex=0;j.searchOrigin=null;return j.seen;}
 if(j.evidence!=='inspection')j.evidence='last-known';return false;
}
function updateJoe(r,dt){
 const j=r.joe,p=r.player;j.age+=dt;j.speed=0;j.turnRate=0;
 if(j.phase==='absent'){if(p.y>ARRIVAL.triggerY){j.phase='enter';j.age=0;j.yaw=Math.atan2(ARRIVAL.landing.x-ARRIVAL.spawn.x,ARRIVAL.landing.y-ARRIVAL.spawn.y);j.weaponPose=null;r.events.push({type:'joe-enter'});}return;}
 if(j.phase==='enter'){
  const t=clamp((j.age-ARRIVAL.doorSeconds)/ARRIVAL.walkSeconds,0,1),nx=ARRIVAL.spawn.x+(ARRIVAL.landing.x-ARRIVAL.spawn.x)*t,ny=ARRIVAL.spawn.y+(ARRIVAL.landing.y-ARRIVAL.spawn.y)*t;
  j.yaw=Math.atan2(ARRIVAL.landing.x-ARRIVAL.spawn.x,ARRIVAL.landing.y-ARRIVAL.spawn.y);const moved=move(j,nx-j.x,ny-j.y,JOE_RADIUS,false,point=>!weaponClear({...j,...point},r.gate));j.walk+=moved;j.speed=moved/dt;
  if(j.age>=ARRIVAL.doorSeconds+ARRIVAL.walkSeconds){j.phase='walk';j.age=0;j.repath=0;}
  return;
 }
 if(r.finished){j.phase='blocked';return;}
 j.waterEntry??={};for(const w of WATERS)if(!inWater(j,w,.5))j.waterEntry[w.id]=waterLocal(j,w).y<=0?-1:1;
 const struck=WATERS.find(w=>waterState(w,r.time,r.bypass,r.bypassAt).danger&&inWater(j,w,j.phase==='water-recovery'?.6:.5));if(struck){const sign=j.waterEntry?.[struck.id]||(waterLocal(j,struck).y<=0?-1:1);const target=waterPoint(struck,waterLocal(j,struck).x,sign*(struck.depth/2+.65)),scale=Math.min(1,2.1*dt/Math.max(.001,distance(j,target))),moved=move(j,(target.x-j.x)*scale,(target.y-j.y)*scale,JOE_RADIUS,gateBlocks(r.gate,1.9),point=>!weaponClear({...j,...point},r.gate));j.walk+=moved;j.speed=moved/dt;j.phase='water-recovery';j.repath=0;return;}
 const sees=perceive(r),d=distance(j,p);
 if(!sees&&j.sawBunkerRoute&&!j.bunkerInspectionUsed&&j.evidence==='last-known'&&r.time-j.evidenceAt>BUNKER_INSPECTION.afterSeconds){
  j.bunkerInspectionUsed=true;j.last={...BUNKER_INSPECTION.target};j.evidence='inspection';j.searchOrigin={...j.last};j.inspectionIndex=1;j.search=0;j.repath=0;
  r.events.push({type:'joe-inspection',reason:'observed-bunker-route',time:r.time,x:j.last.x,y:j.last.y});
 }
 if(!sees&&j.sawRangeRoute&&!j.rangeInspectionUsed&&j.evidence==='last-known'&&r.time-j.evidenceAt>RANGE_INSPECTION.afterSeconds){
  j.rangeInspectionUsed=true;j.last={...RANGE_INSPECTION.target};j.evidence='inspection';j.searchOrigin={...j.last};j.inspectionIndex=3;j.search=0;j.repath=0;
  r.events.push({type:'joe-inspection',reason:'observed-range-route',time:r.time,x:j.last.x,y:j.last.y});
 }
 if(j.phase==='windup'){if(j.age>= (r.difficulty==='steady'?1.25:.95)){j.phase='sweep';j.age=0;j.attackYaw=j.yaw;j.attackSerial++;}return;}
 if(j.phase==='sweep'){
  // The authored blade arcs from left to right; hit tests use the same arc
  // as the model, with swept substeps supplied by the fixed simulation rate.
  if(j.age>TRIMMER.sweepSeconds)recoverStrike(j);return;
 }
 const walkingSpeed=(r.difficulty==='steady'?1.65:r.difficulty==='relentless'?2.35:2.1)*floodState(r.elapsed).speedScale;
 const speed=walkingSpeed*unseenPace(r,dt);
 if(j.phase==='recover'){if(j.age>TRIMMER.recoverSeconds){
  if(j.recoveryBlocked&&sees){
   j.attackReposition=planAttackReposition(r);
   if(j.attackReposition)r.events.push({type:'joe-reposition',time:r.time,from:{x:j.x,y:j.y},target:{...j.attackReposition.target}});
   else if(distance(j,p)<1.8&&Math.hypot(j.approachVelocity?.x||0,j.approachVelocity?.y||0)<.2)j.coverHold={observed:{x:p.x,y:p.y},gate:r.gate};
  }
  j.phase='walk';j.age=0;j.recoveryFrom=null;
 }return;}
 // If solid cover leaves no reachable clear swing, do not endlessly repeat
 // the same blocked attack. Watch the witnessed opening until the player
 // moves or sight is lost. This preserves cover as an earned opportunity.
 if(j.coverHold){
  if(!sees||distance(j,p)>1.8||distance(p,j.coverHold.observed)>.35||Math.abs(r.gate-j.coverHold.gate)>.05){j.coverHold=null;j.repath=0;}
  else{j.phase='guard';turnJoe(j,Math.atan2(p.x-j.x,p.y-j.y),dt,r.gate);return;}
 }
 if(advanceAttackReposition(r,sees,dt,walkingSpeed))return;
 const windup=r.difficulty==='steady'?1.25:.95;
 if(sees&&p.grace<=0&&(d<1.55||approachingStrike(j,p,j.approachVelocity,windup,r.gate))){const heading=Math.atan2(p.x-j.x,p.y-j.y);turnJoe(j,heading,dt,r.gate);if(Math.abs(wrap(heading-j.yaw))>.12){j.phase='turn';return;}j.phase='windup';j.age=0;j.recoveryFrom=null;return;}
 // Fresh sight can steer across clear ground without following a staircase
 // of stale grid centres. Losing sight immediately returns to evidence-based
 // pathfinding; no hidden player position enters this shortcut.
 const direct=sees?visibleApproachTarget(j,j.last,gateBlocks(r.gate,1.9)):null;
 j.repath-=dt;
 if(direct){j.repath=0;j.route=[];j.investigateAt={...j.last};}
 else if(j.repath<=0&&!WATERS.some(w=>inWater(j,w,.6))){j.repath=.8;j.route=planJoeRoute(j,j.last,r.time,{speed:walkingSpeed,bypass:r.bypass,bypassAt:r.bypassAt,gate:gateBlocks(r.gate,1.9)});j.investigateAt=j.route.destination;}
 if(distance(j,j.last)<1.2||!sees&&distance(j,j.investigateAt||j.last)<1.2){
  j.search+=dt;j.phase='search';turnJoe(j,j.yaw+dt*.65,dt,r.gate,.65);
  if(j.search>(j.evidence==='inspection'?1.1:.55)){
   j.searchOrigin??={...j.last};let point=null;
   if(j.evidence!=='inspection'&&r.time-(j.trailAt??-Infinity)<6)while(!point&&j.searchIndex<3){point=localSearchTarget(j.searchOrigin,j.trailHeading,j.searchIndex++,gateBlocks(r.gate,1.9));}
   if(!point){
    if(j.evidence!=='inspection')j.inspectionIndex=SEARCH_POINTS.reduce((best,point,index)=>distance(j.searchOrigin,point)<distance(j.searchOrigin,SEARCH_POINTS[best])?index:best,0);
    j.inspectionIndex=((j.inspectionIndex??-1)+1)%SEARCH_POINTS.length;point=SEARCH_POINTS[j.inspectionIndex];j.searchOrigin={...point};j.evidence='inspection';
   }
   j.last={...point};
   j.search=0;j.repath=0;
  }return;
 }
 let target=direct||j.route[0];while(!direct&&target&&distance(j,target)<.35){j.route.shift();target=j.route[0];}
 if(!target){j.phase=WATERS.some(w=>distance(j,w)<w.depth/2+2&&waterState(w,r.time,r.bypass,r.bypassAt).danger)?'water-wait':'search';return;}
 j.phase='walk';const angle=Math.atan2(target.x-j.x,target.y-j.y);turnJoe(j,angle,dt,r.gate);const alignment=Math.abs(wrap(angle-j.yaw));if(alignment>.22){j.phase='turn';return;}
 const crossing=target.crossing&&WATERS.find(w=>w.id===target.crossing);
 if(crossing&&!inWater(j,crossing,.6)&&crossingWait(crossing,r.time,distance(j,target)/walkingSpeed,r.bypass,r.bypassAt)>0){j.phase='water-wait';return;}
 let stride=Math.min(distance(j,target),speed*dt),next={x:j.x+Math.sin(j.yaw)*stride,y:j.y+Math.cos(j.yaw)*stride};
 if(speed>walkingSpeed&&joeCouldBeSeen(r,next)){
  j.paceScale=1;j.hiddenSeconds=0;stride=Math.min(distance(j,target),walkingSpeed*dt);next={x:j.x+Math.sin(j.yaw)*stride,y:j.y+Math.cos(j.yaw)*stride};
 }
 if(WATERS.some(w=>waterState(w,r.time,r.bypass,r.bypassAt).danger&&inWater(next,w,.45))){j.phase='water-wait';return;}
 if(distance(next,p)<.65)return;
 // A wide tool must stop at contact, not slide one coordinate sideways.
 const count=Math.max(1,Math.ceil(stride/.05)),dx=(next.x-j.x)/count,dy=(next.y-j.y)/count;let traveled=0;
 for(let n=0;n<count;n++){const point={x:j.x+dx,y:j.y+dy};if(solid(point,JOE_RADIUS,gateBlocks(r.gate,1.9))||!weaponClear({...j,...point},r.gate))break;j.x=point.x;j.y=point.y;traveled+=Math.hypot(dx,dy);}
 j.speed=traveled/dt;j.walk+=traveled;
}
export function step(r,input={},dt=1/60){
 if(!['playing','aftermath'].includes(r.mode))return;dt=clamp(dt,0,1/30);r.time+=dt;r.elapsed+=dt;r.steps++;r.messageTime=Math.max(0,r.messageTime-dt);r.waterLock=Math.max(0,r.waterLock-dt);
 if(input.view)r.view={fov:input.view.fov,aspect:input.view.aspect};
 const p=r.player;p.floodDepth=floodState(r.elapsed).depth;p.grace=Math.max(0,p.grace-dt);p.stumble=Math.max(0,p.stumble-dt);r.rear=!!input.rear;
 if(!r.rear){p.yaw=wrap(p.yaw+(input.lookX||0));p.pitch=clamp(p.pitch-(input.lookY||0),-.85,.85);}
 p.crouched=!!input.crouch;p.focus=!!input.focus;p.sprinting=!!input.sprint&&!p.crouched&&!p.focus;
 const eye=p.crouched?1.12:1.65;p.eyeHeight=eye+((p.eyeHeight??1.65)-eye)*Math.exp(-dt*(input.reduced?30:18));
 if(r.rear&&!p.wasRear)p.rearDirection=Math.abs(input.strafe||0)>.2?Math.sign(input.strafe):-(p.rearDirection||1);
 p.wasRear=r.rear;p.rearAmount=(p.rearAmount||0)+((r.rear?1:0)-(p.rearAmount||0))*(1-Math.exp(-dt*(r.rear?13.5:10.5)));
 if(!r.rear&&p.rearAmount<.002)p.rearAmount=0;
 p.rearAngle=p.rearAmount*p.rearAmount*(3-2*p.rearAmount)*Math.PI*(p.rearDirection||-1);
 let f=clamp(input.forward||0,-1,1),s=clamp(input.strafe||0,-1,1),norm=Math.max(1,Math.hypot(f,s));f/=norm;s/=norm;
 const ramp=movementStartScale(p,s,f,dt,!!input.acceleration);
 const speed=movementPace(p)*ramp,dx=(Math.sin(p.yaw)*f+Math.cos(p.yaw)*s)*speed*dt,dy=(Math.cos(p.yaw)*f-Math.sin(p.yaw)*s)*speed*dt;
 p.crossingSpeed=speed;const next={x:p.x+dx,y:p.y+dy};let traveled=0,contact=null;
 p.waterEntry??={};
 for(const w of WATERS){if(!inWater(p,w,.4))p.waterEntry[w.id]=waterLocal(p,w).y<=0?-1:1;if(waterState(w,r.time,r.bypass,r.bypassAt).danger&&inWater(p,w,.25))hurtWater(r,w);}
 // Recovery immunity suppresses repeated shove effects, never the physical
 // barrier. Test every swept substep so sprinting cannot tunnel through a jet.
 const blocked=point=>{
  const w=WATERS.find(w=>waterState(w,r.time,r.bypass,r.bypassAt).danger&&inWater(point,w,.3));
  if(!w)return false;
  if(p.recovery?.channel===w.id&&inWater(p,w,.3)){
   const from=waterLocal(p,w),to=waterLocal(point,w);
   // During a shove, allow lateral steering (including changing direction)
   // and retreat to the entry bank. Forward progress through a surge remains
   // blocked, and recovery never grants passage into another active outlet.
   if((to.y-from.y)*p.recovery.side>=-.00001)return false;
  }
  contact=w;return true;
 };
 if(r.joe.phase==='absent'||r.joe.phase==='enter'||distance(next,r.joe)>.65)traveled=move(p,dx,dy,.3,gateBlocks(r.gate,p.crouched?1.25:1.8),blocked);p.speed=traveled/dt;p.walk+=traveled;
 if(contact)hurtWater(r,contact);recoverPlayer(r,dt);
 if(observeLesson(r)&&r.messageTime<=0)say(r,'You cleared the channel. Follow the lamps; the next crossings use the same signals.',3);
 if(input.use){
  const a=nearbyAction(r);r.useFeedbackUntil=a?0:r.time+2;
  if(a?.id==='bypass'){
   r.bypass=true;r.bypassAt=r.time;r.saveSerial++;
   say(r,'Bypass open. The onward channel drains; return flow cuts off the approach.',5);r.events.push({type:'bypass'});
   if(distance(r.joe,LEVER)<42){r.joe.last={...LEVER};r.joe.evidence='pump-noise';r.joe.evidenceAt=r.time;r.joe.search=0;r.joe.repath=0;}
  }
  if(a?.id==='note'){r.evidence=true;r.saveSerial++;say(r,'Groundskeeper’s record recovered. Read it in Pause.',4);r.events.push({type:'evidence'});}
  if(a?.id==='gate'&&!r.closing){
   const obstruction=sluiceObstruction(r);r.sluiceBlocked=!!obstruction;
   if(obstruction)say(r,sluiceObstructionMessage(obstruction),4,'gate-response');
   else{r.closing=true;say(r,'The keeper’s sluice is closing. Stay inside until it seals.',3,'gate-response');r.events.push({type:'closing'});}
  }
 }
 if(r.closing){
  const obstruction=sluiceObstruction(r);
  if(!keeperInside(p)||obstruction){
   r.closing=false;r.sluiceBlocked=!!obstruction;
   say(r,obstruction?`Closure stopped. ${sluiceObstructionMessage(obstruction)}`:'Closure cancelled. Get inside and use the release again.',4,'gate-response');
   r.events.push({type:'closure-cancelled',time:r.time});
  }else{
   r.gate=Math.min(1,r.gate+dt/1.4);
   if(r.gate>=1&&!r.finished){r.mode='aftermath';r.aftermathAge=0;r.finished=true;r.saveSerial++;say(r,'The sluice holds. You can breathe. Listen to the course above.',4.5);r.events.push({type:'secured',time:r.time});}
  }
 }
 if(!r.closing&&r.gate>0)r.gate=Math.max(0,r.gate-dt/1.1);
 updatePump(r,dt);updateJoe(r,dt);settleWeapon(r,dt);if(r.mode==='playing'&&p.grace<=0&&(r.joe.sweepContact||trimmerContact(r.joe,p))&&lineClear(r.joe,p,.05,gateBlocks(r.gate,1.9))){r.mode='caught';r.failure=captureFailure(r);r.reason=r.failure.cause;r.events.push({type:'caught',time:r.time});}observeEncounter(r,dt);if(r.mode==='aftermath'){r.aftermathAge+=dt;if(r.aftermathAge>=4.5){r.mode='complete';r.events.push({type:'complete',time:r.time});}return;}if(r.mode!=='playing')return;
}
export function objective(r){return r.finished?'The sluice holds. Look back if you want. Listen to the course above.':r.closing?SLUICE_COMMITMENT:r.bypass?'Reach the keeper’s room ahead of Joe. Keep him outside when you close the sluice.':district(r.player)!=='THE PUMP HOUSE'?'Follow the lamps through the bunker to the pump. The service passage is shorter, but Joe uses it.':'Before leaving: use the red pump-house lever to drain the onward route.';}
export function diagnostics(r){return {mode:'under_green_'+r.mode,level:2,route:'drain',flood:floodState(r.elapsed),coordinateSystem:'Metres: +y north, +x east; yaw 0 faces +y. The course loops back through the maintenance junction.',district:district(r.player),objective:objective(r),checkpoint:r.checkpoint,lessonCrossed:r.lessonCrossed===true,seconds:r.time,elapsed:r.elapsed,player:{...r.player},joe:{x:r.joe.x,y:r.joe.y,yaw:r.joe.yaw,phase:r.joe.phase,speed:r.joe.speed,observed:r.joe.observed===true,paceScale:r.joe.paceScale||1,hiddenSeconds:r.joe.hiddenSeconds||0,evidence:r.joe.evidence,closingRate:r.joe.closingRate,seen:r.joe.seen,last:r.joe.last,age:r.joe.age,turnRate:r.joe.turnRate,weaponBlocked:r.joe.weaponBlocked,blade:trimmerSegment(r.joe),distance:distance(r.player,r.joe)},waters:WATERS.map(w=>({id:w.id,x:w.x,y:w.y,axis:w.axis||'y',width:w.width,depth:w.depth,...waterState(w,r.time,r.bypass,r.bypassAt)})),bypass:r.bypass,evidence:r.evidence,gate:r.gate,closing:r.closing,aftermathAge:r.aftermathAge||0,waterHits:r.waterHits,action:nearbyAction(r),interactionFeedback:interactionFeedback(r),message:r.messageTime>0?r.message:'',reason:r.reason,failure:r.failure||null,telemetry:telemetrySnapshot(r.telemetry)};}
