import {createEngineMotion,advanceEngineMotion} from './final-cut-engine-motion.js';
import {clamp,wrap,distance,LANES,SECTORS,WALLS,BREAKABLES,PUMP,BELL,NOTE,BALL_BASKETS,SWALE,CHECKPOINTS,RIG,MOVEMENT,inside,move,lineClear,concealed,refuge,laneFor,rigContact} from './final-cut-course.js';
import {restoreCrossings,advanceCrossings,crossingObjective,crossingState} from './final-cut-crossings.js';
import {movementStartScale} from './movement-response.js';
import {capturePresentation} from './final-cut-defeat.js';
import {RIG_WHEELS,sweptRigHit,rigWallHit} from './final-cut-rig.js';
import {planHeadland,advanceHeadland} from './final-cut-headland.js';
import {cuttingMotion} from './final-cut-drive.js';
import {AMBUSH,planAmbush,ambushPath,advanceAmbushTravel,ambushMotion,attackWarning,ambushTell,rememberNoise,heardPlayer,wetFooting,seesPlayer,observedPlayer} from './final-cut-ambush.js';
import {createDrama,dramaSnapshot,queueJoeLine,advanceDrama} from './final-cut-drama.js';
import {createSchedule,scheduleSnapshot,nextScheduledStrip,consumeScheduledStrip,cutPlan} from './final-cut-schedule.js';
import {normalizeStationReceipt} from './night-order-receipt.js';
import {createAnnouncement,announcementSnapshot,advanceAnnouncement,championshipBoard} from './final-cut-announcement.js';
import {createUnease,uneaseSnapshot,advanceUnease} from './final-cut-unease.js';
import {BALL_CAPACITY,restoreBallState,ballSnapshot,ballAction,advanceBalls,freshAim} from './final-cut-balls.js';
import {mow,restoreCutAreas} from './final-cut-mowing.js';
import {recordPlantTravel} from './final-cut-plant-contact.js';
import {advanceWheelTravel,advanceWheelFilm} from './final-cut-wheel-travel.js';
import {evidenceFields,restoreFacts,runFacts} from './final-cut-outcome.js';
import {createArrival,arrivalSpawn,advanceArrival,arrivalSnapshot,upgradeArrivalMotion} from './final-cut-arrival.js';
import {ACCESS,OVERLOOK_ACCESS,OPENING_RIG} from './final-cut-arrival-layout.js';
import {ROAD_EXIT,EXIT_END,upgradeEndingMotion,createEnding,advanceEnding,restoreEnding,endingSnapshot,wreckFromSave,collapsePose} from './final-cut-ending.js';
export {MOVEMENT} from './final-cut-course.js';
export function createRun(saved={},route='direct'){
 const cp=clamp(saved.checkpoint|0,0,2),won=saved.won===true||cp===2;
 const actualRoute=['garage','drain','direct'].includes(saved.route)?saved.route:route,arrival=createArrival(saved.arrival,actualRoute,cp>0||saved.openingSeen===true,cp>0||(!saved.arrival&&saved.openingSeen===true)),spawn=cp?CHECKPOINTS[cp]:arrivalSpawn(arrival,actualRoute);
 const facts=restoreFacts(saved.runFacts,cp);
 const seed=clamp(saved.seed|0,0,2),schedule=createSchedule(saved.schedule,seed,cp);
 const r={version:1,mode:'briefing',route:actualRoute,arrival,crossings:restoreCrossings(saved.crossings),time:0,elapsed:facts.elapsed,runId:facts.id,captures:facts.captures,masteryEligible:facts.eligible,checkpoint:cp,player:{pitch:0,...spawn,speed:0,walk:0,rearAngle:0},
 rig:{...OPENING_RIG,phase:'waiting',age:0,lane:0,direction:-1,deployment:0,speed:0,steering:0,passSerial:0,evidence:'mowing schedule',path:[],distance:0,reelAngle:0,seen:false},
 cut:Array.isArray(saved.cut)?[...new Set(saved.cut.filter(id=>SECTORS.some(s=>s.id===id)))]:[],pump:saved.pump===true||cp>=1,water:cp>=1?1:0,won,completed:won&&saved.completed===true,
 cutAreas:restoreCutAreas(saved.cutAreas),cutRevision:0,broken:Array.isArray(saved.broken)?[...new Set(saved.broken.filter(id=>BREAKABLES.some(b=>b.id===id)))]:[],breakTimes:{},openingSeen:cp>0||saved.openingSeen===true,opening:{ceremony:cp===0&&saved.openingSeen!==true,closePass:false,firstCut:false,silenceAt:null},
 ...evidenceFields(saved),priorEvidence:clamp(Number(saved.priorEvidence)||0,0,3),...restoreBallState(saved),lure:null,bellCooldown:0,saveSerial:0,events:[],message:'',messageTime:0,dialogue:'',dialogueTime:0,
 stats:{crossings:facts.crossings,nearMisses:0,lures:0,balls:facts.balls,ballRedirects:facts.ballRedirects,wait:0},drama:createDrama(saved.drama),stationReceipt:normalizeStationReceipt(saved.stationReceipt,actualRoute),announcement:createAnnouncement(saved.announcement,cp>0),unease:createUnease(saved.unease),failure:null,seed,schedule,attempt:1};
 if(cp===1){r.rig.x=30;r.rig.y=50;r.rig.lane=1;r.rig.phase='announce';r.rig.deployment=0;}
 if(cp===0&&r.openingSeen)r.rig.phase='announce';
 r.ending=createEnding();
 if(r.won){const wreck=wreckFromSave(saved.ending);r.rig={...r.rig,...wreck,phase:'disabled',deployment:1};r.water=1;restoreEnding(r,saved.ending||{age:EXIT_END});r.rig.phase=r.ending.age<7?'bogged':'disabled';r.rig.age=r.ending.age;r.mode=r.completed?'complete':'briefing';}
 r.engine=createEngineMotion(saved.engine,r);
 return r;
}
export function readSave(raw){try{const s=JSON.parse(raw);if(!s||s.version!==1||!Number.isInteger(s.checkpoint)||s.checkpoint<0||s.checkpoint>2)return null;return snapshot(createRun({...s,arrival:upgradeArrivalMotion(s.arrival),ending:upgradeEndingMotion(s.ending),runFacts:s.runFacts||{eligible:false}}));}catch{return null;}}
export function snapshot(r){return {version:1,engine:{...r.engine},checkpoint:r.checkpoint,route:r.route,arrival:arrivalSnapshot(r),crossings:{...r.crossings},drama:dramaSnapshot(r),stationReceipt:r.stationReceipt?{...r.stationReceipt,stations:[...r.stationReceipt.stations]}:null,announcement:announcementSnapshot(r),unease:uneaseSnapshot(r),pump:r.pump,won:r.won,completed:r.completed,ending:endingSnapshot(r),cut:[...r.cut],cutAreas:(r.cutAreas||[]).map(a=>({...a})),broken:[...(r.broken||[])],openingSeen:r.openingSeen,...evidenceFields(r),...ballSnapshot(r),priorEvidence:r.priorEvidence,runFacts:runFacts(r),seed:r.seed,schedule:scheduleSnapshot(r)};}
function event(r,type,data={}){r.events.push({type,time:r.time,...data});if(r.events.length>24)r.events.shift();}
function say(r,text,t=4){r.message=text;r.messageTime=t;}
function phase(r,name){if(name==='disengage'&&r.rig.phase==='pass'&&r.rig.evidence==='observed player')queueJoeLine(r,'missed');r.rig.phase=name;r.rig.age=0;event(r,'phase',{phase:name});}
export function nearbyAction(r){
 if(r.won)return r.mode==='aftermath'&&distance(r.player,ROAD_EXIT)<2.5?ROAD_EXIT:null;
 if(r.mode!=='playing'||r.ballAim.active)return null;
 const view=r.player.yaw+r.player.rearAngle;
 return [!r.arrival.requested&&OVERLOOK_ACCESS,!r.arrival.requested&&ACCESS,!r.pump&&PUMP,!r.loadLimit&&NOTE,BELL,...(r.ballCount<BALL_CAPACITY?BALL_BASKETS:[])].filter(Boolean).find(a=>{
  const d=distance(r.player,a),angle=wrap(Math.atan2(a.x-r.player.x,a.y-r.player.y)-view);
  return d<=2.3&&(d<.5||Math.abs(angle)<1.05)&&lineClear(r.player,a);
 })||ballAction(r);
}
function interact(r){
 const a=nearbyAction(r);if(!a)return;
 if(a.id.startsWith('balls-')){r.ballCount=BALL_CAPACITY;r.saveSerial++;say(r,'Three practice balls. Hold Chip to aim; release to send one toward a different strip.',4);event(r,'ball-refill',{id:a.id});return;}
 if(a.id==='recover-ball'){r.balls=r.balls.filter(b=>b.id!==a.ballId);r.ballCount++;r.saveSerial++;say(r,'Golf ball recovered.',2);event(r,'ball-recovered');return;}
 if(a.id==='course-access'){r.arrival.requested=true;r.saveSerial++;say(r,'Final round requested. Stay behind the rail: it opens after the first cutting pass clears the walk.',7);return;}
 if(a.id==='road'){r.completed=true;r.mode='complete';r.saveSerial++;event(r,'complete');return;}
 if(a.id==='pump'){
  r.pump=true;r.checkpoint=1;r.saveSerial++;event(r,'pump');say(r,'Bypass open. Watch the nursery swale fill. The stone path stays dry.',6);
 }else if(a.id==='record'){
  r.evidence=true;r.loadLimit=true;r.saveSerial++;event(r,'evidence');say(r,'LOAD LIMIT: No heavy machinery on saturated turf. Record secured.',5);
 }else if(r.bellCooldown<=0){
  r.lure={x:BELL.x,y:74,source:'groundskeeping bell',time:r.time,trap:r.water>=1};r.bellCooldown=3;r.stats.lures++;event(r,'bell');
  say(r,r.water>=1?'The bell calls him across the flooded swale. Stay behind masonry.':'The bell calls him to the final fairway. Prepare the pump before the trap can work.',5);
 }
}
function select(r){
 const j=r.rig;
 // Perception is sampled only for the next pass, never used to bend a committed strip.
 j.seen=seesPlayer(r);const observed=j.seen?r.player:observedPlayer(r);
 const scheduled=nextScheduledStrip(r);
 let lane=scheduled.lane,source='mowing schedule',trap=false;
 if(r.lure&&r.time-r.lure.time<50){lane=laneFor(r.lure);source=r.lure.source;trap=r.lure.trap===true;if(source==='golf ball'){r.stats.ballRedirects++;r.saveSerial++;event(r,'ball-selected',{lane});queueJoeLine(r,'distraction');}r.lure=null;}
 else if(!scheduled.opening&&observed&&observed.y>19){lane=laneFor(observed);source='observed player';trap=r.water>=1&&lane===2&&observed.x<-2&&Math.abs(observed.y-74)<5.4;}
 else if(!scheduled.opening&&heardPlayer(r)){lane=laneFor(heardPlayer(r));source='running footsteps';}
 // Replay plans finish their advertised opening strips; real audible lures
 // still override them. After that, the ordinary perception rules resume.
 consumeScheduledStrip(r,scheduled);
 const side=trap?1:(j.x>=0?1:-1);j.lane=lane;j.direction=-side;j.evidence=source;j.trapApproach=trap;j.path=[];
 if(trap&&source==='observed player'){
  event(r,'visual-lure',{x:r.player.x,y:r.player.y});
  say(r,'Joe saw you across the swale. His next pass is set. Move toward the pavilion.',6);
 }
 if(j.passSerial>0){
  j.attack=planAmbush(r,lane,source,trap,scheduled.opening);j.direction=j.attack.axis==='x'?Math.sign(j.attack.to.x-j.attack.from.x):Math.sign(j.attack.to.y-j.attack.from.y);
  j.path=ambushPath(j,j.attack);j.turnPlan=null;j.travel=null;j.travelSpeed=0;phase(r,'turn');return;
 }
 // All lane changes stay outside the player boundary. A side change follows
 // the back headland, beyond the pre-victory boundary, rather than teleporting.
 if(Math.sign(j.x)!==side)j.path.push({x:Math.sign(j.x)*30,y:99},{x:side*30,y:99});
 j.path.push({x:side*30,y:trap?SWALE.y:LANES[lane]});j.turnPlan=planHeadland(j,side,trap?SWALE.y:LANES[lane]);phase(r,'turn');
}
function followPath(j,dt){
 if(j.attack)return advanceAmbushTravel(j,dt);
 if(j.turnPlan){const result=advanceHeadland(j,dt,pose=>!rigWallHit(pose,WALLS));if(result===true){j.path=[];j.turnPlan=null;}return result;}
 const target=j.path[0];if(!target)return true;
 const d=distance(j,target),heading=Math.atan2(target.x-j.x,target.y-j.y),turn=clamp(wrap(heading-j.yaw),-dt*.95,dt*.95),yaw=wrap(j.yaw+turn);
 const stride=Math.min(d,Math.abs(wrap(heading-yaw))<.08?4.6*dt:0),next={...j,yaw,x:j.x+Math.sin(heading)*stride,y:j.y+Math.cos(heading)*stride};
 if(rigWallHit(next,WALLS))return 'blocked';
 j.yaw=yaw;j.x=next.x;j.y=next.y;j.speed=stride/dt;j.distance+=stride;
 if(d<.04)j.path.shift();return j.path.length===0;
}
function deploy(j,target){
 if(target===j.deployment)return true;
 if(rigWallHit({...j,deployment:target},WALLS))return false;
 j.deployment=target;return true;
}
function blockedRig(r){r.rig.turnPlan=null;r.rig.reverse=false;event(r,'blocked-pass');queueJoeLine(r,'blocked');phase(r,'disengage');}
function updateRig(r,dt){
 const j=r.rig;j.age+=dt;j.speed=0;
 if(j.phase==='waiting'){if(r.arrival.ready&&r.arrival.requested){phase(r,'reveal');say(r,'Two high lamps wait across the near fairway.',2);}return;}
 if(j.phase==='disabled')return;
 if(j.phase==='bogged'){
  if(j.age>7){phase(r,'disabled');say(r,'The reels have stopped. Follow the stone path to the public road.',6);}return;
 }
 if(j.phase==='reveal'){
  if(!deploy(j,clamp((j.age-2)/4,0,1))){blockedRig(r);return;}
  if(j.age>2&&!j.spoken){j.spoken=true;queueJoeLine(r,'opening');event(r,'reveal');say(r,'The lamps spread apart. One machine spans the strip.',4);}
  if(j.age>=8){r.openingSeen=true;r.saveSerial++;phase(r,'announce');}return;
 }
 if(j.phase==='turn'){
  if(!deploy(j,Math.max(0,j.deployment-dt))){blockedRig(r);return;}
  const result=followPath(j,dt);if(result==='blocked')blockedRig(r);else if(result){phase(r,j.attack?'announce':'align');if(j.attack)event(r,'grass-rustle',{entry:j.attack.entry,x:j.attack.from.x,y:j.attack.from.y});}return;
 }
 if(j.phase==='align'){
  const target=j.attack?.yaw??j.direction*Math.PI/2,rate=j.attack?2.4:.7,yaw=wrap(j.yaw+clamp(wrap(target-j.yaw),-dt*rate,dt*rate));
  if(rigWallHit({...j,yaw},WALLS)){blockedRig(r);return;}j.yaw=yaw;
  if(Math.abs(wrap(target-j.yaw))<.015){j.yaw=target;phase(r,'announce');if(j.attack)event(r,'grass-rustle',{entry:j.attack.entry,x:j.attack.from.x,y:j.attack.from.y});}return;
 }
 if(j.phase==='announce'){
  if(!deploy(j,clamp(j.deployment+dt*(j.attack?1/attackWarning(r):.4),0,1))){blockedRig(r);return;}
  if(j.age>=(j.attack?attackWarning(r):4)){j.cutStartX=j.x;phase(r,'pass');j.passSerial++;event(r,'commit',{lane:j.lane,direction:j.direction,entry:j.attack?.entry});}return;
 }
 if(j.phase==='pass'){
  const motion=j.attack?ambushMotion(j,dt):{...cuttingMotion(j.x,j.direction,dt,j.cutStartX),y:j.y},dx=motion.x-j.x,dy=motion.y-j.y;
  if(rigWallHit({...j,x:motion.x,y:motion.y},WALLS)){
   blockedRig(r);return;
  }
  const previousX=j.x,previousY=j.y;j.x=motion.x;j.y=motion.y;j.speed=motion.speed;j.distance+=Math.hypot(dx,dy);j.reelAngle=wrap((j.reelAngle||0)-8*dt);
  for(const id of mow(r,previousX,previousY)){event(r,'cut',{id});if(!r.opening.firstCut){r.opening.firstCut=true;r.opening.silenceAt=r.time;event(r,'ceremony-stop');}}
  for(const b of BREAKABLES)if(!r.broken.includes(b.id)&&rigWallHit(j,[b])){r.broken.push(b.id);r.breakTimes[b.id]=r.time;event(r,'break-prop',{id:b.id,x:b.x,y:b.y});}
  if(!r.opening.closePass&&refuge(r.player)?.id==='bunker'&&j.lane===0&&distance(j,r.player)<13){r.opening.closePass=true;event(r,'protected-pass');say(r,'The stone holds. Watch the open ground behind his reels.',4);}
  if(r.water>=1&&inside(j,SWALE,-1.5)){
   r.won=true;r.checkpoint=2;r.ending=createEnding({wheelBase:-j.distance/RIG_WHEELS[0].radius,reelBase:j.reelAngle},j);r.saveSerial++;phase(r,'bogged');r.mode='aftermath';event(r,'victory');queueJoeLine(r,'bogging');say(r,'The ground gives way. You did it.',4);return;
  }
  if(motion.done){if(!j.attack)j.x=j.direction*RIG.headland;r.saveSerial++;phase(r,'disengage');}return;
 }
 if(j.phase==='disengage'){
  if(!deploy(j,Math.max(0,j.deployment-dt*(j.attack?1/AMBUSH.lift:.55)))){
   // A lifting heel can swing toward stone. Ease straight back to make room;
   // cutters stay inactive and all central vehicle contacts remain physical.
   const stride=.8*dt,next={...j,x:j.x-Math.sin(j.yaw)*stride,y:j.y-Math.cos(j.yaw)*stride};
   if(!rigWallHit(next,WALLS)){j.x=next.x;j.y=next.y;j.speed=.8;j.distance-=stride;}
   if(!j.clearanceWarning){j.clearanceWarning=true;say(r,j.speed?'Joe is backing clear of the stone. Keep away from the central vehicle.':'The wing is tight against the stone. Joe is holding the rig.',4);}
   j.age=0;return;
  }
  j.clearanceWarning=false;if(j.age>=(j.attack?AMBUSH.lift:2.2))select(r);
 }
}
function capture(r,contact){
 r.captures++;
 r.ballAim=freshAim();
 r.mode='caught';r.saveSerial++;r.failure=capturePresentation(r,contact);event(r,'capture',{kind:r.failure.kind,part:contact.id});
}
function stepFixed(r,i,dt){
 r.time+=dt;r.elapsed+=dt;r.messageTime=Math.max(0,r.messageTime-dt);r.dialogueTime=Math.max(0,r.dialogueTime-dt);r.bellCooldown=Math.max(0,r.bellCooldown-dt);
 const p=r.player;
 // Rear glance changes the view without steering the travel heading. Discard
 // look input during the glance, matching the other on-foot chapters.
 if(!i.rear){p.yaw=wrap(p.yaw+(i.lookX||0));p.pitch=clamp(p.pitch+(i.lookY||0),-1.1,1.1);}
 p.rearAngle+=( (i.rear?Math.PI:0)-p.rearAngle)*Math.min(1,dt*12);p.crouch=!!i.crouch;p.focus=!!i.focus;
 const speed=(p.focus?MOVEMENT.listen:p.crouch?MOVEMENT.crouch:i.sprint?MOVEMENT.sprint:MOVEMENT.walk)*i.motionScale*(wetFooting(r)?.78:1);
 let f=i.forward||0,s=i.strafe||0,length=Math.hypot(f,s);if(length>1){f/=length;s/=length;}
 const before={x:p.x,y:p.y},beforeRig={...r.rig};p.speed=move(p,(Math.sin(p.yaw)*f+Math.cos(p.yaw)*s)*speed*dt,(Math.cos(p.yaw)*f-Math.sin(p.yaw)*s)*speed*dt,r.won,r.broken,r.ending.gate,r.arrival.gate)/dt;p.walk+=p.speed*dt;
 if(p.speed<.1)r.stats.wait+=dt;
 rememberNoise(r);
 for(let k=0;k<LANES.length;k++)if(before.y<LANES[k]+6&&p.y>=LANES[k]+6&&!r.stats.crossings.includes(k)){r.stats.crossings.push(k);r.saveSerial++;event(r,'crossing',{lane:k});}
 const cancelChip=i.use&&r.ballAim.active;if(i.use&&!cancelChip)interact(r);
 advanceBalls(r,{...i,cancelChip},dt,event,say);
 if(r.pump)r.water=Math.min(1,r.water+dt/6);
 advanceArrival(r,dt);updateRig(r,dt);recordPlantTravel(r,beforeRig);advanceCrossings(r,event);
 const j=r.rig,target=j.phase==='turn'&&j.path[0]?Math.atan2(j.path[0].x-j.x,j.path[0].y-j.y):j.phase==='align'?(j.attack?.yaw??j.direction*Math.PI/2):j.yaw;
 const steer=clamp(wrap(target-j.yaw)*.65,-.65,.65),steering=(j.steering||0)+clamp(steer-(j.steering||0),-dt*1.5,dt*1.5);
 if(!j.turnPlan&&!(j.attack&&j.phase==='turn')&&steering!==j.steering&&(r.won||!rigWallHit({...j,steering},WALLS)))j.steering=steering;
 if(!['bogged','disabled'].includes(beforeRig.phase)){
  advanceWheelTravel(r,beforeRig,dt);
  if(r.won){r.ending.wheelBases=j.wheelTravel.map((d,k)=>wrap(-d/RIG_WHEELS[k].radius));r.ending.wheelFilm=j.wheelFilm.map(f=>({...f}));}
 }
 const contact=!r.won&&sweptRigHit(before,p,beforeRig,r.rig);
 if(contact&&!WALLS.some(w=>inside(p,w,.05))&&lineClear(p,r.rig))capture(r,contact);
 if(r.won){const spin=collapsePose(r.ending.age).wheelSpin;advanceEnding(r,dt);const churn=collapsePose(r.ending.age).wheelSpin-spin;advanceWheelFilm(r,RIG_WHEELS.map(w=>churn*w.radius),dt);}
 advanceEngineMotion(r,dt);
 advanceDrama(r,dt);
 advanceAnnouncement(r,dt,!!nearbyAction(r));
 advanceUnease(r,dt,!!nearbyAction(r),i);
}
export function step(r,input={},dt=1/60){
 if(!['playing','aftermath'].includes(r.mode)||!Number.isFinite(dt)||dt<=0)return;
 const n=Math.max(1,Math.ceil(Math.min(dt,.25)*120)),delta=Math.min(dt,.25)/n;
 // Apply the response once per input update, not once per collision substep.
 const motionScale=movementStartScale(r.player,input.strafe||0,input.forward||0,Math.min(dt,.25),!!input.acceleration);
 for(let k=0;k<n&&['playing','aftermath'].includes(r.mode);k++)stepFixed(r,{...input,motionScale,lookX:(input.lookX||0)/n,lookY:(input.lookY||0)/n,use:k===0&&input.use,chipStart:k===0&&input.chipStart,chipRelease:k===n-1&&input.chipRelease},delta);
}
export function objective(r){if(r.won)return r.ending.secured?'You are safe. Follow the road sign to leave, or look back.':'Reach the public road';if(!r.arrival.reached)return 'Follow the service walk up to the protected overlook.';if(!r.arrival.requested)return 'Find the public road. When ready, use either final-round control.';if(!r.arrival.open)return 'Stay behind the rail. It opens after the first pass clears the walk.';if(!r.pump)return 'Cross behind the mower. Reach the pump shelter.';if(r.water<1)return 'The swale is filling. Find the starter’s pavilion.';return crossingObjective(r);}
export function threat(r){
 const j=r.rig,relative=j.x-r.player.x,side=relative<0?'left':'right';
 if(r.won)return j.phase==='bogged'?'THE RIG IS SINKING':'THE REELS HAVE STOPPED';
 const tell=ambushTell(r);if(tell)return `GRASS RUSTLING · ${tell.entry.toUpperCase()} · ${j.trapApproach?'FLOODED SWALE':'GET CLEAR'}`;
 if(j.attack&&j.phase==='pass')return `CHARGE FROM ${j.attack.entry.toUpperCase()} · ${j.trapApproach?'FLOODED SWALE':'MOVE ACROSS HIS PATH'}`;
 if(j.attack&&['turn','align'].includes(j.phase))return 'JOE IS IN THE REEDS · WATCH AND LISTEN';
 if(j.clearanceWarning)return j.speed?'CUTTERS INACTIVE · JOE IS BACKING CLEAR':'CUTTERS INACTIVE · JOE IS HOLDING THE RIG';
 if(j.phase==='disengage')return 'CUTTERS INACTIVE · WINGS LIFTING';
 if(j.phase==='align')return 'ALIGNING · KEEP CLEAR OF THE CHASSIS';
 if(j.trapApproach&&['announce','pass'].includes(j.phase))return `${j.phase==='announce'?'ALIGNING':'CUTTING'} · FLOODED SWALE · ${side.toUpperCase()}`;
 if(['announce','pass'].includes(j.phase))return `${j.phase==='announce'?'ALIGNING':'CUTTING'} · ${['NEAR','MIDDLE','FINAL'][j.lane]} FAIRWAY · ${side.toUpperCase()}`;
 if(j.phase==='waiting')return !r.arrival.reached?'SERVICE WALK · FOLLOW THE RAMP':r.arrival.requested?'JOE IS STARTING THE MACHINE · STAY BEHIND THE RAIL':'THE OVERLOOK IS SAFE · BEGIN WHEN READY';if(j.phase==='reveal')return 'THE CUTTING WINGS ARE OPENING';return 'REELS LIFTED · JOE IS TURNING';
}
export function diagnostics(r){return {mode:'final_cut_'+r.mode,coordinates:'metres; x east, y towards road; yaw 0 north',seconds:+r.time.toFixed(2),engine:{...r.engine},player:{...r.player},arrival:{...r.arrival,joe:{...r.arrival.joe}},rig:{...r.rig,travel:r.rig.travel?{time:r.rig.travel.time,distance:r.rig.travel.distance,duration:r.rig.travel.route.duration,length:r.rig.travel.route.length}:null,turnPlan:r.rig.turnPlan?{segment:r.rig.turnPlan.index,segments:r.rig.turnPlan.segments.length,at:r.rig.turnPlan.at,speed:r.rig.turnPlan.speed,shift:r.rig.turnPlan.shift}:null,path:r.rig.path.map(p=>({...p}))},ambush:{tell:ambushTell(r),noise:heardPlayer(r),wetFooting:wetFooting(r)},objective:objective(r),action:nearbyAction(r),shelter:refuge(r.player)?.name||null,cut:[...r.cut],cutAreas:r.cutAreas,broken:r.broken,opening:r.opening,crossings:crossingState(r),openingSeen:r.openingSeen,pump:r.pump,water:r.water,won:r.won,completed:r.completed,ending:r.ending,checkpoint:r.checkpoint,route:r.route,cutPlan:{...cutPlan(r),...r.schedule},...evidenceFields(r),runFacts:runFacts(r),balls:r.ballCount,ballAim:{active:r.ballAim.active,power:r.ballAim.power,target:r.ballAim.plan?.target,blocked:r.ballAim.plan?.blocked,reason:r.ballAim.plan?.reason},worldBalls:r.balls.map(b=>({id:b.id,x:b.x,y:b.y,z:b.z,age:b.age,landed:b.landed})),failure:r.failure,stationReceipt:r.stationReceipt,announcement:{...r.announcement,board:championshipBoard(r)},unease:{...r.unease},drama:{phase:r.drama.phase,pressure:r.drama.pressure,heard:r.drama.heard,active:r.drama.active,pending:r.drama.pending},stats:r.stats};}
