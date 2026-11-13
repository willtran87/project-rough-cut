import fs from 'node:fs';
import {createRun,step,nearbyAction,MOVEMENT} from '../web/under-green-sim.js';
import {MAIN_ROUTE,rangeY} from '../web/under-green-layout.js';
import {LEVER,SLUICE,NOTE,WATERS,pathTo,distance,solid,lineClear,waterPoint,waterLocal,waterState,inWater} from '../web/under-green-course.js';
import {crossingAdvice,runningCrossingOption} from '../web/under-green-guidance.js';
import {createLocalTelemetry,telemetrySnapshot} from '../web/local-telemetry.js';
import {observeJoe} from '../web/under-green-senses.js';

export function traverse({cp=0,pressure='standard',sprint=false,crouch=false,shortcut=false,optional=false,wet=false,rangeRoute=null,timedKeeper=false,adaptiveRun=false,adaptiveStance=false,rearChecks=false,smoothPaths=false,decisionPause=0,dodge=false,timeOffset=0,durable={},inspect,inputTape}={}){
 const r=createRun(cp,false,pressure,durable);r.mode='playing';r.time+=timeOffset;r.telemetry=createLocalTelemetry();
 let activeCrouch=crouch,escapeUntil=0,lookUntil=0,nextLook=0;
 const advance=input=>{input={crouch:activeCrouch,rear:rearChecks&&r.elapsed<lookUntil,...input};inputTape?.push({yaw:r.player.yaw,input:{...input}});step(r,input);};
 let targets=MAIN_ROUTE.slice();
 const crossing=id=>{const w=WATERS.find(w=>w.id===id),sign=w.forward||1;return [waterPoint(w,0,-sign*(w.depth/2+.65)),{...waterPoint(w,0,sign*(w.depth/2+.9)),crossing:id}];};
 if(wet)targets=[{x:0,y:55},...crossing('spillway'),{x:0,y:73},{x:-20,y:73},...crossing('bunker'),{x:-20,y:54},LEVER,{x:-16,y:40},{x:0,y:40},{x:12,y:38},...crossing('range-a'),{x:12,y:rangeY(23.5)},...crossing('range-b'),{x:12,y:rangeY(13)},SLUICE];
 if(rangeRoute==='reactive'){
  const start=targets.findIndex(p=>p.x===12&&p.y===38);
  targets.splice(start+1,targets.length,{x:12,y:38,decision:'range-a'},{x:12,y:rangeY(23.5),decision:'range-b'},{x:12,y:rangeY(13)},SLUICE);
 }else if(rangeRoute){
  if(!['wet-dry','dry-wet'].includes(rangeRoute))throw Error('Unknown mixed range route: '+rangeRoute);
  const middle={x:12,y:rangeY(23.5)},outerMiddle={x:21,y:middle.y},lower={x:12,y:rangeY(13)};
  const first=rangeRoute==='wet-dry'?crossing('range-a'):[{x:21,y:38},outerMiddle];
  const second=rangeRoute==='dry-wet'?crossing('range-b'):[outerMiddle,{x:21,y:lower.y}];
  const start=targets.findIndex(p=>p.x===12&&p.y===38);
  targets.splice(start+1,targets.length,...first,middle,...second,lower,SLUICE);
 }
 if(cp===1)targets=targets.slice(targets.findIndex(p=>p.x===-20&&p.y===73));
 if(cp===2||shortcut)targets=[...(cp===2?[]:[LEVER]),...targets.slice(targets.indexOf(LEVER)+1)];
 if(cp===3)targets=wet||rangeRoute?targets.slice(targets.findIndex(p=>p.x===12&&p.y===rangeY(23.5))+(rangeRoute==='reactive'?0:1)):[{x:21,y:rangeY(23.5)},{x:21,y:rangeY(13)},{x:12,y:rangeY(13)},SLUICE];
 if(optional&&cp<2){const index=targets.indexOf(LEVER);targets.splice(index,0,NOTE);}
 // The legacy path pilot sees current water occupancy, not future closure.
 // Route-balance comparisons opt into the same explicit crossing advice for
 // the mandatory keeper channel on both branches, preventing a biased late hit.
 if(timedKeeper)targets.splice(targets.indexOf(SLUICE),0,...crossing('sluice'));
 let index=0,route=[],repath=0,pause=0,evade=[],evasionResume=null,evasions=0,crossingRun=null,crossingStand=null;const reached=[],runChoices=[],branchChoices=[],stanceChoices=[];
 for(let frame=0;frame<60*180&&['playing','aftermath'].includes(r.mode);frame++){
  const goal=targets[index]||SLUICE;
  if(!(rearChecks&&(r.rear||r.elapsed<lookUntil)))r.player.yaw=Math.atan2(goal.x-r.player.x,goal.y-r.player.y);
  // Optional QA policy: decide at the real junction using the current signal
  // and achievable crossing advice. No future phase lookup or per-bank reset.
  if(goal.decision&&distance(r.player,goal)<.7){
   if(rearChecks&&(r.player.rearAmount||0)>.025){lookUntil=0;advance({});inspect?.(r);continue;}
   const water=WATERS.find(w=>w.id===goal.decision),state=waterState(water,r.time,r.bypass,r.bypassAt);
   r.player.yaw=Math.atan2(water.x-r.player.x,water.y-r.player.y);
   const speed=crouch&&!adaptiveStance?MOVEMENT.crouch:sprint?MOVEMENT.sprint:MOVEMENT.walk;
   const advice=crossingAdvice(r.player,water,state,speed),takeWet=advice.action!=='wait';
   const exitY=rangeY(goal.decision==='range-a'?23.5:13);
   const branch=takeWet?crossing(goal.decision).map(p=>({...p,stand:adaptiveStance&&crouch})):[{x:21,y:goal.y},{x:21,y:exitY}];
   branchChoices.push({channel:goal.decision,choice:takeWet?'wet':'dry',time:r.time,position:{x:r.player.x,y:r.player.y},phase:state.phase,safeFor:state.safeFor,advice:advice.action,speed});
   if(takeWet&&adaptiveStance&&crouch)stanceChoices.push({reason:'stand-for-crossing',channel:goal.decision,time:r.time,position:{x:r.player.x,y:r.player.y}});
   targets.splice(index,1,...branch);route=[];repath=0;continue;
  }
  const observed=adaptiveStance?observeJoe(r):null;
  if(rearChecks&&observed?.audible&&r.elapsed>=nextLook){lookUntil=r.elapsed+.45;nextLook=r.elapsed+3;}
  // The ordinary caption recommends a rear glance when the engine is heard.
  // React to a close Joe only after the actual camera sees him, not to an
  // omniscient distance threshold while he is hidden behind the player.
  const visibleClose=rearChecks&&observed?.visible&&observed.distance<8;
  if(adaptiveStance&&(observed.imminent||visibleClose)&&r.elapsed>=escapeUntil){escapeUntil=r.elapsed+2;stanceChoices.push({reason:visibleClose?'visible-close':'audible-attack',time:r.time,position:{x:r.player.x,y:r.player.y}});}
  const escapeRun=adaptiveStance&&r.elapsed<escapeUntil;
  activeCrouch=crouch&&!goal.stand&&!escapeRun;
  // Explicit QA pilot: respond to the visible committed preparation with
  // ordinary lateral input, then walk past. The naive pilot remains available.
  if(dodge&&!evade.length&&r.joe.phase==='windup'&&observeJoe(r).imminent){
   // Pass the visible attacker, not a navigation waypoint that may be beside
   // the player. Try a tighter ordinary sidestep in the 4m service corridor.
   const direction=r.joe;
   const length=distance(r.player,direction)||1,dx=(direction.x-r.player.x)/length,dy=(direction.y-r.player.y)/length;
   evasion:for(const width of [1.5,1.2])for(const side of [1,-1]){
    const a={x:r.player.x-dy*width*side,y:r.player.y+dx*width*side},b={x:r.joe.x+dx*2.2-dy*width*side,y:r.joe.y+dy*2.2+dx*width*side};
    if(lineClear(r.player,a,.3)&&lineClear(a,b,.3)&&!WATERS.some(w=>waterState(w,r.time,r.bypass,r.bypassAt).danger&&(inWater(a,w,.3)||inWater(b,w,.3)))){evade=[a,b];evasionResume={goal,dx,dy};evasions++;break evasion;}
   }
  }
  if(evade.length){
   while(evade.length&&distance(r.player,evade[0])<.15)evade.shift();
    if(evade.length){const target=evade[0],d=distance(r.player,target),dx=(target.x-r.player.x)/d,dy=(target.y-r.player.y)/d;advance({forward:dx*Math.sin(r.player.yaw)+dy*Math.cos(r.player.yaw),strafe:dx*Math.cos(r.player.yaw)-dy*Math.sin(r.player.yaw),sprint:sprint||escapeRun});inspect?.(r);continue;}
   // A successful pass can go beyond an ordinary waypoint. Returning to that
   // old point would walk back into Joe; mechanisms/crossings still require use.
   if(evasionResume?.goal===goal&&![LEVER,NOTE,SLUICE].includes(goal)&&!goal.crossing&&!goal.decision&&(goal.x-r.player.x)*evasionResume.dx+(goal.y-r.player.y)*evasionResume.dy<0){
    reached.push({index,goal,seconds:r.elapsed,gap:distance(r.player,r.joe),reason:'passed-during-evasion'});index++;
   }
   evasionResume=null;route=[];repath=0;
  }
  const action=nearbyAction(r),use=(goal===LEVER&&action?.id==='bypass')||(goal===NOTE&&action?.id==='note')||(goal===SLUICE&&action?.id==='gate');
  // A general waypoint radius can declare a crossing done while the player's
  // body is still in the discharge fringe. New reactive pilots finish the
  // authored landing before turning; legacy comparison policies stay intact.
  const arrivalRadius=(rangeRoute==='reactive'&&goal.crossing) ? .3 : .7;
  if(distance(r.player,goal)<arrivalRadius||use){if(use)advance({use:true});if(index<targets.length)reached.push({index,goal,seconds:r.elapsed,gap:distance(r.player,r.joe),joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase}});index++;route=[];repath=0;if(goal===LEVER||goal===MAIN_ROUTE[0]||goal===MAIN_ROUTE[11])pause=decisionPause;}
  if(pause>0){pause-=1/60;advance({});continue;}
  if(--repath<=0||!route.length){route=pathTo(r.player,targets[index]||SLUICE,r.time,r.bypass,false,r.bypassAt);repath=24;}
  while(route.length&&distance(r.player,route[0])<.3)route.shift();let next=route[0];const cross=targets[index]?.crossing;
  // Optional comparison pilot: ordinary people can cut clear dry corners.
  // Keep authored route goals and crossing decisions; only remove artificial
  // grid bends where the complete player-sized segment stays on dry floor.
  if(smoothPaths&&!cross)for(let i=route.length-1;i>0;i--){
   const target=route[i],count=Math.max(1,Math.ceil(distance(r.player,target)/.15));
   if(!lineClear(r.player,target,.3)||Array.from({length:count+1},(_,n)=>({x:r.player.x+(target.x-r.player.x)*n/count,y:r.player.y+(target.y-r.player.y)*n/count})).some(p=>WATERS.some(w=>inWater(p,w,.3))))continue;
   route.splice(0,i);next=route[0];break;
  }
  // Grid arrival is not exact arrival at a fractional authored landing. Finish
  // the short, clear segment using normal movement instead of waiting forever.
  const exact=targets[index]||SLUICE;
  if(!next&&distance(r.player,exact)<1.5&&lineClear(r.player,exact,.3)&&!WATERS.some(w=>waterState(w,r.time,r.bypass,r.bypassAt).danger&&Array.from({length:11},(_,i)=>({x:r.player.x+(exact.x-r.player.x)*i/10,y:r.player.y+(exact.y-r.player.y)*i/10})).some(p=>inWater(p,w,.3))))next=exact;
  if(crossingRun!==cross)crossingRun=null;
  if(crossingStand!==cross)crossingStand=null;
  if(cross){
   const water=WATERS.find(w=>w.id===cross),state=waterState(water,r.time,r.bypass,r.bypassAt);
   // Once the complete body has cleared onto the authored destination bank,
   // finish the landing. Generic advice at that position concerns crossing
   // BACK; obeying it here can invent a full-cycle wait after a safe crossing.
   const farBank=waterLocal(r.player,water).y*(water.forward||1)>water.depth/2+.3;
   if(!farBank&&adaptiveStance&&activeCrouch&&!crossingStand&&!inWater(r.player,water,.3)&&crossingAdvice(r.player,water,state,MOVEMENT.crouch).action==='wait'&&crossingAdvice(r.player,water,state,MOVEMENT.walk).action==='cross'){
    crossingStand=cross;stanceChoices.push({reason:'walking-window',channel:cross,time:r.time,position:{x:r.player.x,y:r.player.y}});
   }
   if(crossingStand)activeCrouch=false;
   const speed=activeCrouch?MOVEMENT.crouch:sprint||escapeRun?MOVEMENT.sprint:MOVEMENT.walk;
   // Optional QA policy: take only a run window the ordinary bank UI offers,
   // then keep that chosen pace until the far bank. Existing pilots unchanged.
   if(!farBank&&adaptiveRun&&!crossingRun&&runningCrossingOption(r.player,water,state,speed,MOVEMENT.sprint)){
    crossingRun=cross;runChoices.push({channel:cross,time:r.time,position:{x:r.player.x,y:r.player.y},safeFor:state.safeFor});
   }
   const advice=crossingAdvice(r.player,water,state,crossingRun?MOVEMENT.sprint:speed);next=farBank||inWater(r.player,water,.3)||advice.action!=='wait'?targets[index]:null;
  }
  let input={sprint:sprint||!!crossingRun||escapeRun};
  if(next){const dx=next.x-r.player.x,dy=next.y-r.player.y,d=Math.hypot(dx,dy);input.forward=(dx*Math.sin(r.player.yaw)+dy*Math.cos(r.player.yaw))/d;input.strafe=(dx*Math.cos(r.player.yaw)-dy*Math.sin(r.player.yaw))/d;}
  if(nearbyAction(r)?.id==='gate')input.use=true;
  advance(input);inspect?.(r);
 }
 return {cp,pressure,sprint,crouch,shortcut,optional,wet,rangeRoute,timedKeeper,adaptiveRun,adaptiveStance,rearChecks,smoothPaths,runChoices,branchChoices,stanceChoices,decisionPause,dodge,timeOffset,evasions,mode:r.mode,elapsed:r.elapsed,p:r.player,j:r.joe,checkpoint:r.checkpoint,bypass:r.bypass,evidence:r.evidence,goal:targets[index],solid:solid(r.player),waterHits:r.waterHits,gap:distance(r.player,r.joe),metrics:telemetrySnapshot(r.telemetry).metrics,reached};
}
if(process.argv[1]?.endsWith('probe-under-green-folded.mjs')){
 const runs=[traverse(),traverse({sprint:true}),traverse({shortcut:true}),traverse({optional:true,dodge:true}),...['steady','relentless'].map(pressure=>traverse({pressure,dodge:true})),...[1,2,3].map(cp=>traverse({cp,dodge:true})),traverse({wet:true}),traverse({decisionPause:3}),traverse({dodge:true}),traverse({dodge:true,sprint:true})];
 fs.mkdirSync('output/under-green/folded',{recursive:true});fs.writeFileSync('output/under-green/folded/routes.json',JSON.stringify(runs,null,2));
 console.log(JSON.stringify(runs.map(({reached,p,j,...r})=>({...r,position:{x:p.x,y:p.y},joe:{x:j.x,y:j.y,phase:j.phase}})),null,2));
}
