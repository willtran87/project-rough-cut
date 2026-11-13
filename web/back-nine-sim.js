import {createTactics,updateTactics,constrainTacticControls,tacticTarget,tacticSpeedLimit,createExitRelease,updateExitRelease} from './chase-tactics.js';
import {createExperience,updateExperience,experienceSpeedLimit} from './chase-experience.js';
import {createDeparture,DEPARTURE_SPAWN,updateDeparture,departureActive,departureTarget,departureSpeedLimit} from './chase-departure.js';
import {createVariation,enterVariationSegment} from './chase-variation.js';
import {createSenses,updateSenses,updateSearch,searchTarget,searchSpeedLimit} from './chase-senses.js';
import {captureEscape} from './chase-outcome.js';
import {canSealGarage,GARAGE_HOLD_SECONDS} from './chase-garage.js';
import {createEncounter,updateEncounter,encounterAllows,encounterSpeedLimit} from './chase-encounter.js';
import {createService,updateService} from './chase-service.js';
import {createUtility,updateUtility,utilityTarget} from './chase-utility.js';
import {trimPursuitRoute,pursuitCatchup,cornerSpeed} from './mower-pursuit.js';
import {beginCartImpact,stepCartImpact} from './cart-impact.js';
import {beginRunover,updateRunover} from './chase-runover.js';
import {chaseActor,CART_MAX_HEALTH,repairCart,impactDamage,leaveBrokenCart,moveRunner,runnerApproach} from './chase-player.js';
import {createPressure,updatePressure,pressureOpening} from './chase-pressure.js';
import {commitmentSpeed} from './chase-commitments.js';
import {updateShortcuts} from './chase-shortcuts.js';
import {createDecoys,updateDecoys,decoyTarget} from './back-nine-decoys.js';
import {createCourseStory,updateCourseStory} from './back-nine-story.js';
import {createPanic,updatePanic} from './chase-panic.js';
import {createRam,beginRamRecovery,beginRamWindup,stepRamRecovery} from './mower-ram.js';
import {createCourseFX,updateCourseFX} from './back-nine-course-fx.js';
import {COURSE,distance,clamp,angleDelta,blocked,lineClear,mowerLineClear,surfaceAt,runnerSurfaceAt,planMowerRoute} from './back-nine-course.js';
import {createTension,updateTension,pursuitMultiplier} from './back-nine-tension.js';
import {constrainFeatureMotion,constrainVehicleMotion,separateVehicles,VEHICLE_HULLS} from './vehicle-contact.js';
import {createHunt,updateHunt,huntTarget} from './back-nine-hunt.js';
import {createDestruction,createWreck,advanceWreck,strikeWreck,constrainMaintenanceProps} from './chase-destruction.js';
export function createRun(checkpoint=0,collected=0,seed=0,utilityRecord=null){
 const utility=createUtility(collected,utilityRecord);
 const spawn=checkpoint?COURSE.checkpoints[checkpoint-1]:COURSE.start;
 const joeY=Math.max(3,spawn.y-28),road=COURSE.paths[0];let joeX=0;
 for(let i=1;i<road.length;i++)if(joeY<=road[i][1]){const a=road[i-1],b=road[i],t=clamp((joeY-a[1])/(b[1]-a[1]),0,1);joeX=a[0]+(b[0]-a[0])*t;break;}
 return {tactics:createTactics(),experience:createExperience(),exitRelease:createExitRelease(),destruction:createDestruction(),wreck:createWreck(),departure:createDeparture(checkpoint),variation:createVariation(seed,checkpoint),encounter:createEncounter(),utility,service:createService(collected,utility.choices),mode:'briefing',foot:null,death:null,escape:null,failure:null,checkpointGrace:0,time:0,checkpoint,cart:{...spawn,y:spawn.y+2,yaw:0,speed:0,steer:0,surface:'path',health:CART_MAX_HEALTH,maxHealth:CART_MAX_HEALTH,hits:0,invulnerable:0},
  joe:{senses:createSenses(),ram:createRam(),...(checkpoint?{x:joeX,y:joeY,yaw:0}:DEPARTURE_SPAWN),speed:0,mode:'starting',route:[],repath:0,lastSeen:null,seenAge:99,stuck:0,reverse:0,expanded:0,plans:0},
  pressure:createPressure(),panic:createPanic(checkpoint),story:createCourseStory(collected,checkpoint),decoys:createDecoys(),hunt:createHunt(),courseFX:createCourseFX(),finale:{age:0,gate:0,latched:false,tail:0},tension:{...createTension(),lastCheckpoint:checkpoint},impact:{serial:0,age:99,strength:0,x:0,y:0,damaged:false},impactCooldown:0,grace:checkpoint?3:2.5,lookBack:false,message:'',messageTime:0,finishHold:0,lastImpact:0,contact:0,events:[],distance:0};
}
export function objective(run){if(run.mode==='dying')return 'Joe ran you down';if(run.mode==='sealing')return 'Inside · the security shutter is closing';if(run.checkpoint<2)return run.checkpoint?'Reconnect the night-range relay':'Reconnect the maintenance relay';if(run.exitRelease&&!run.exitRelease.released)return 'Garage powered · free the jammed shutter';return run.foot?'Garage powered · run inside and hold Use':'Garage powered · drive inside and hold brake';}
function move(vehicle,dt,r,other,kind,from,run){
 const step=vehicle.speed*dt,dx=Math.sin(vehicle.yaw)*step,dy=Math.cos(vehicle.yaw)*step;
 const next={x:vehicle.x+dx,y:vehicle.y+dy};let hit=false;
 if(!blocked(next,r)){vehicle.x=next.x;vehicle.y=next.y;}
 else {hit=true;if(!blocked({x:vehicle.x+dx,y:vehicle.y},r))vehicle.x+=dx;else if(!blocked({x:vehicle.x,y:vehicle.y+dy},r))vehicle.y+=dy;vehicle.speed*=.3;}
 // The visible narrow entrance bollards admit the cart, not the extended decks.
 // Stop the whole mower footprint before the gate; never teleport it at sealing.
 if(kind==='mower'&&from.y<800&&vehicle.x>-30&&vehicle.x<-16){const front=p=>p.y+Math.max(...VEHICLE_HULLS.mower.map(h=>h.forward*Math.cos(p.yaw)+Math.abs(Math.sin(p.yaw))*h.width+Math.abs(Math.cos(p.yaw))*h.length));if(front(vehicle)>799.72&&front(from)<=799.72){const to={x:vehicle.x,y:vehicle.y,yaw:vehicle.yaw};let a=0,b=1;for(let i=0;i<12;i++){const t=(a+b)/2,p={x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,yaw:from.yaw+angleDelta(to.yaw,from.yaw)*t};if(front(p)>799.72)b=t;else a=t;}Object.assign(vehicle,{x:from.x+(to.x-from.x)*a,y:from.y+(to.y-from.y)*a,yaw:from.yaw+angleDelta(to.yaw,from.yaw)*a,speed:0});hit=true;}}
 if(constrainFeatureMotion(vehicle,from,kind,run))hit=true;
 return (hit?1:0)|(constrainVehicleMotion(vehicle,from,other,kind)?2:0);
}
export function updateRun(run,input,dt){
 if(run.mode==='dying'){updateRunover(run,dt);return;}
 if(run.mode==='complete'){run.finale.tail=Math.max(0,run.finale.tail-clamp(dt,0,1/30));return;}
 if(run.mode!=='driving'&&run.mode!=='sealing')return;
 const sealing=run.mode==='sealing';if(sealing)input={rear:input.rear,brake:true};
 dt=clamp(dt,0,1/30);run.time+=dt;run.checkpointGrace=Math.max(0,(run.checkpointGrace||0)-dt);run.grace=Math.max(0,run.grace-dt);run.messageTime=Math.max(0,run.messageTime-dt);run.lastImpact=Math.max(0,run.lastImpact-dt);
 run.impact.age+=dt;run.impactCooldown=Math.max(0,run.impactCooldown-dt);const wasContact=!!run.contact;
 advanceWreck(run,dt);
 const c=chaseActor(run),j=run.joe;j.ram.release=Math.max(0,j.ram.release-dt);let contact=separateVehicles(c,j,run);const old={x:c.x,y:c.y,yaw:c.yaw};c.invulnerable=Math.max(0,c.invulnerable-dt);c.surface=run.foot?runnerSurfaceAt(c,run):surfaceAt(c,run);run.lookBack=!!input.rear;
 if(sealing){c.speed=0;c.steer=0;run.finale.age+=dt;run.finale.gate=clamp(run.finale.age/3.4,0,1);run.finale.latched=run.finale.gate===1;}
 if(!run.foot&&run.cart.health>0){
 const max={path:14,rough:10.5,wet:11.8,sand:5.4}[c.surface],grip=c.surface==='wet'?.72:1;
 const throttle=clamp(input.throttle||0,-1,1),steer=clamp(input.steer||0,-1,1);
 c.steer+=(steer-c.steer)*(1-Math.exp(-dt*(c.surface==='wet'?5:10)));
 const accel=throttle>0?8:throttle<0?(c.speed>1?-14:-6):-(Math.sign(c.speed)*2.4);
 c.speed=clamp(c.speed+accel*dt,-4.2,max);if(input.brake)c.speed*=Math.exp(-dt*7);if(!throttle&&Math.abs(c.speed)<.09)c.speed=0;
 c.yaw+=c.steer*1.4*grip*clamp(Math.abs(c.speed)/3,0,1)*(c.speed<0?-1:1)*dt;
 }
 const cartIncoming=c.speed;let joeIncoming=j.speed;const cartMove=run.foot?(moveRunner(run,input,dt)?2:0):move(c,dt,.85,j,'cart',old,run);contact=contact||!!(cartMove&2);
 if(cartMove&1){run.lastImpact=.4;if(run.messageTime<=0){run.message='Brake, reverse, then steer clear.';run.messageTime=2;}}
 constrainMaintenanceProps(run,c,old,run.foot?'foot':'cart');
 constrainTacticControls(run,c,old,run.foot?'foot':'cart');
 stepCartImpact(run,dt);
 updateShortcuts(run,input,dt,old);
 updateExitRelease(run,input,dt,old);
 run.distance+=distance(old,c);
 if(run.checkpoint<2&&distance(c,COURSE.checkpoints[run.checkpoint])<7){run.checkpoint++;enterVariationSegment(run);j.ram.armed=false;j.ram.release=0;run.checkpointGrace=2.5;run.grace=Math.max(run.grace,2.5);repairCart(run,20);run.message=run.checkpoint===1?'Maintenance relay online. One relay remains.':'Both relays online · garage shutter powered.';run.messageTime=4;run.events.push({type:'checkpoint',index:run.checkpoint,time:run.time});}
 updateCourseStory(run,input,dt);
 updateService(run,input,dt);
 const separation=distance(c,j),visible=separation<95&&lineClear(j,c,.1),heard=separation<(run.foot?16:52)&&Math.abs(c.speed)>(run.foot?2:6);
 updateSenses(run,dt,visible,heard);
 updateDeparture(run,dt,visible);
 updateTactics(run,input,dt,visible);updateExperience(run,dt,visible);
 updateUtility(run,input,dt);updateDecoys(run,input,dt,visible,heard);const diversion=tacticTarget(run)||utilityTarget(run)||decoyTarget(run);if(diversion)j.mode='investigate_alarm';
 updateEncounter(run,dt,visible);
 updateHunt(run,dt,visible);if(huntTarget(run))j.mode=run.hunt.phase;
 updateTension(run,dt,visible);
 updateSearch(run,dt);
 // Telegraph a deliberate first approach too. Player-caused bumps at point
 // blank range remain physical contacts, not a scripted teleport or immunity.
 if(separation>65||!visible&&j.seenAge>2)j.ram.armed=false;
 const bearing=Math.atan2(c.x-j.x,c.y-j.y),closingSpeed=j.speed-(Math.sin(c.yaw)*Math.sin(bearing)+Math.cos(c.yaw)*Math.cos(bearing))*c.speed;
 if(encounterAllows(run,'ram')&&!pressureOpening(run)&&!sealing&&c.y<799&&run.grace<=0&&c.invulnerable<=0&&j.ram.phase==='none'&&!j.ram.armed&&(!run.foot||run.time>=(j.ram.nextChargeAt||0))&&visible&&separation>=6&&separation<(run.foot?30:20)&&j.speed>3&&closingSpeed>1&&Math.abs(angleDelta(bearing,j.yaw))<.65&&run.hunt.phase==='follow'&&!['windup','surge','breather'].includes(run.tension.phase)&&(!run.foot||runnerApproach(run,c)===c))beginRamWindup(run);
 const chaseMove=(v,step,r,other,kind,from)=>{let hit=move(v,step,r,other,kind,from,run);if(kind==='mower'){if(constrainTacticControls(run,v,from,kind))hit|=1;if(constrainMaintenanceProps(run,v,from,kind))hit|=1;if(strikeWreck(run,from))hit|=4;}return hit;};
 const protectedFollow=!run.foot&&run.checkpointGrace>0&&run.grace>0;
 if(protectedFollow&&j.ram.phase==='lineup'){j.ram.phase='none';j.ram.armed=false;j.ram.release=0;j.repath=0;}
 if(!sealing&&j.ram.phase!=='none'){contact=!!(stepRamRecovery(run,dt,chaseMove)&2)||contact;}
 else if(run.grace>0&&!protectedFollow&&!departureActive(run)){j.mode='starting';j.speed=Math.max(0,j.speed-dt*5);}
 else if(run.foot&&j.ram.footCharge>0){
  const before={x:j.x,y:j.y,yaw:j.yaw};j.mode='charging';j.yaw=j.ram.chargeYaw;j.speed=Math.min(14.8,j.speed+dt*9);joeIncoming=j.speed;
  const hit=chaseMove(j,dt,1.65,c,'mower',before);contact=contact||!!(hit&2);j.ram.footCharge=Math.max(0,j.ram.footCharge-dt);
  if(!contact&&(j.ram.footCharge===0||hit&1)){j.ram.footCharge=0;j.ram.phase='missed';j.ram.age=0;j.ram.armed=false;run.message='He overshot. Cut across his tracks and find cover!';run.messageTime=2;}
 }
 else {
 j.repath-=dt;
 if(j.repath<=0){
  let target;
  if(sealing||c.y>800&&Math.abs(c.x+23)<5.5)target={x:-23,y:797.2};
  else if(departureTarget(run))target=departureTarget(run);
  else if(diversion)target=diversion;
  else if(huntTarget(run))target=huntTarget(run);
  else if(visible){const lead=clamp(separation/12,0,run.foot?1:1.15);target={x:c.x+Math.sin(c.yaw)*c.speed*lead,y:c.y+Math.cos(c.yaw)*c.speed*lead};if(blocked(target,1.85))target={x:c.x,y:c.y};}
  else if(searchTarget(run))target=searchTarget(run);
  else if(j.lastSeen&&j.seenAge<10&&j.senses.phase!=='depart')target=j.lastSeen;
  else {const route=COURSE.paths[0],next=route.find(p=>p[1]>j.y+7)||route.at(-1);target={x:next[0],y:next[1]};}
  if(run.foot&&visible&&!diversion&&!huntTarget(run))target=runnerApproach(run,target);
  // A centre inside the boundary margin can map to an already-reached grid
  // node. Finish a clear, close approach at contact range instead of stalling.
  const contactPoint={x:c.x+(j.x-c.x)/Math.max(.001,separation)*2,y:c.y+(j.y-c.y)/Math.max(.001,separation)*2};
  const direct=!run.foot&&visible&&!diversion&&!huntTarget(run)&&separation<9&&Math.abs(c.speed)<3&&lineClear(j,contactPoint,1.65);
  const plan=direct?{points:[contactPoint],expanded:0}:planMowerRoute(j,target);j.route=plan.points;if(!run.foot)trimPursuitRoute(j);j.expanded=plan.expanded;j.plans++;j.repath=visible&&separation<35?.19:.34;
 }
 while(j.route.length>1&&distance(j,j.route[0])<(run.foot?.9:3)&&mowerLineClear(j,j.route[1]))j.route.shift();
 const target=j.route[0];if(target){const before={x:j.x,y:j.y,yaw:j.yaw},turn=angleDelta(Math.atan2(target.x-j.x,target.y-j.y),j.yaw),surface=surfaceAt(j,run),base=(run.foot?{path:22,rough:21.5,wet:18.5,sand:9.2}:{path:39,rough:35,wet:32,sand:12.2})[surface];
  let goal=base*(Math.abs(turn)>.8?.35:Math.abs(turn)>.4?.65:1)*(j.mode==='patrol'?.9:1)*pursuitMultiplier(run,surface,turn,separation);
  const catchup=pursuitCatchup(run,visible,separation);
  goal*=1+catchup*.18;goal=commitmentSpeed(run,goal);
  if(!run.foot)goal=cornerSpeed(j,goal);
  // Without sensory evidence he still searches at working speed.
  if(j.mode==='patrol')goal=Math.min(goal,run.foot?7:12);
  if(run.foot)goal=Math.min(goal,run.pressure.phase==='pressure'?12.3:11.1);
  if(pressureOpening(run))goal=Math.min(goal,run.foot?4.5:8.5);
  goal=Math.min(goal,run.foot?22:42+catchup*2,encounterSpeedLimit(run),searchSpeedLimit(run),tacticSpeedLimit(run),experienceSpeedLimit(run));
  if(departureActive(run)){j.mode=run.departure.phase==='working'?'working':'watching';goal=Math.min(goal,departureSpeedLimit(run),distance(j,target)*2);}
  if(protectedFollow){j.mode='shadowing';goal=Math.min(goal,18,Math.max(0,c.speed+(separation-16)*1.2));}
  // Brake into tight route corners instead of repeatedly nosing into scenery
  // at the higher pursuit speed. Resume full acceleration once aligned.
  if(!run.foot&&Math.abs(turn)>.8&&distance(j,target)<6)goal=Math.min(goal,Math.abs(turn)>1.1?2.5:distance(j,target)*1.8);
  if(run.hunt.phase==='commit_recover')goal=Math.min(goal,distance(j,target)*2);
  if(sealing||diversion)goal=Math.min(goal,diversion?10:9,distance(j,target)*3);
  if(diversion&&Math.abs(turn)>.65)goal=Math.min(goal,2.2);
  const turnRate=run.foot?1.4:1.65;
  if(j.reverse<=0)j.yaw+=clamp(turn,-turnRate*dt,turnRate*dt);j.speed+=(goal-j.speed)*(1-Math.exp(-dt*(run.foot?(j.ram.armed?4.5:3.5):(j.ram.armed?8:7))));
  if(j.reverse>0){j.reverse-=dt;j.speed=experienceSpeedLimit(run)===0?0:-2.5;}
  if(protectedFollow)j.speed=Math.min(j.speed,Math.max(0,(separation-11)/dt));
  joeIncoming=j.speed;const joeMove=chaseMove(j,dt,1.65,c,'mower',before);contact=contact||!!(joeMove&2);if(joeMove&1)j.repath=Math.min(j.repath,.12);
  j.stuck=departureActive(run)||experienceSpeedLimit(run)===0?0:distance(before,j)<.01&&!(joeMove&2)?j.stuck+dt:Math.max(0,j.stuck-dt);
  if(j.stuck>1){j.reverse=.7;j.stuck=0;j.repath=0;}
 }else j.speed=Math.max(0,j.speed-dt*4);
 }
 updateCourseFX(run,dt);
 run.contact=contact?1:0;
 const damaged=contact&&!sealing&&j.ram.phase!=='backoff'&&run.grace<=0&&c.invulnerable<=0;
 if(contact){const d=Math.max(.001,distance(c,j)),nx=(j.x-c.x)/d,ny=(j.y-c.y)/d,closing=Math.max(0,(Math.sin(c.yaw)*cartIncoming-Math.sin(j.yaw)*joeIncoming)*nx+(Math.cos(c.yaw)*cartIncoming-Math.cos(j.yaw)*joeIncoming)*ny);
  if(damaged||(!wasContact&&closing>.8&&run.impactCooldown<=0)){
   const side=nx*Math.cos(c.yaw)-ny*Math.sin(c.yaw),front=nx*Math.sin(c.yaw)+ny*Math.cos(c.yaw),edge=1/Math.max(Math.abs(side)/1.02,Math.abs(front)/1.49);
   run.impact={serial:run.impact.serial+1,age:0,strength:clamp(closing/12,.32,1),x:c.x+nx*edge,y:c.y+ny*edge,yaw:c.yaw,side,front,damaged,incomingSpeed:Math.abs(cartIncoming),mowerSpeed:Math.abs(joeIncoming)};run.impactCooldown=.3;run.lastImpact=.7;
  }
 }
 if(damaged){
  if(run.foot){beginRunover(run);return;}
  else{c.hits++;const damage=impactDamage(run.impact.strength,run,run.impact.front);c.health=Math.max(0,c.health-damage);c.invulnerable=2.15;beginCartImpact(run);j.speed*=.25;run.lastImpact=.7;run.message=`CART HIT · ${damage} damage. Steer clear!`;run.messageTime=2.5;run.events.push({type:'contact',damage,time:run.time});}
 }
 if(contact&&!sealing&&run.mode==='driving'&&j.ram.phase==='none')beginRamRecovery(run);
 if(!run.foot&&run.cart.health<=0){run.cart.speed=0;if(j.ram.phase==='none')beginRamRecovery(run);leaveBrokenCart(run);return;}

 updatePanic(run,dt,visible);updatePressure(run,dt,visible);
 if(sealing){if(run.finale.age>=4.8){run.mode='complete';run.escape=captureEscape(run);run.finale.tail=8;updatePanic(run,0,false);run.events.push({type:'complete',time:run.time});}return;}
 if(canSealGarage(run,input)){run.finishHold+=dt;if(run.finishHold>GARAGE_HOLD_SECONDS){run.mode='sealing';c.speed=0;j.ram.phase='none';j.ram.release=0;j.repath=0;run.message='The shutter crawls down. The engine is still outside.';run.messageTime=5;}}
 else run.finishHold=0;
}
