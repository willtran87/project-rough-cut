import {inWater,waterLocal} from './under-green-course.js';

// Leaving a slow stance is a separate choice. The current-pace warning remains
// authoritative until the player actually releases Listen and/or stands up.
export function walkingCrossingOption(player,water,state,speed,walkSpeed){
 if(!(player.crouched||player.focus)||!(walkSpeed>speed)||state.danger||
    state.timing.kind!=='timed'||player.stumble>0||player.recovery||inWater(player,water,.3))return null;
 const current=crossingAdvice(player,water,state,speed);
 if(current.action!=='wait'||current.approach>1)return null;
 const walking=crossingAdvice(player,water,state,walkSpeed);
 return walking.action==='cross'?walking:null;
}

// An optional change of pace at the bank, never an implicit requirement behind
// a walking CROSS recommendation. Use the simulation's run speed at the call
// site; this helper owns no separate movement constants or water timing.
export function runningCrossingOption(player,water,state,speed,runSpeed){
 if(state.danger||state.timing.kind!=='timed'||!(runSpeed>speed)||
    player.crouched||player.focus||player.sprinting||player.stumble>0||player.recovery||inWater(player,water,.3))return null;
 const current=crossingAdvice(player,water,state,speed);
 if(current.action!=='wait'||current.approach>1)return null;
 const running=crossingAdvice(player,water,state,runSpeed);
 return running.action==='cross'?running:null;
}

// Advice includes approach and body clearance. Running is never assumed by an idle player.
export function crossingAdvice(player,water,state,speed=3.84){
 const local=waterLocal(player,water);
 const inside=inWater(player,water,.3),side=inside?(player.waterEntry?.[water.id]||(local.y<=0?-1:1)):(local.y<=0?-1:1);
 const near=side*(water.depth/2+.4),far=-side*(water.depth/2+.4);
 const approach=inside?0:Math.hypot(Math.max(0,Math.abs(local.x)-(water.width/2-.35)),near-local.y);
 const remaining=inside?Math.abs(far-local.y):water.depth+.8;
 const seconds=(approach+remaining)/Math.max(.1,speed)+.35;
 // The return spans the whole approach corridor: there is no adjacent bypass.
 // Name the real onward route on the pump side, or the full backtrack outside.
 const returnRoute=local.y<=0?'Leave through the drained pump outflow.':'Backtrack via the bunker and spillway to the junction.';
 if(state.danger)return {action:'wait',seconds,approach,remaining,title:state.phase==='receding'?'WAIT · STILL UNSAFE':'STOP · HIGH PRESSURE',advice:state.timing.kind==='blocked-until-event'?(water.control==='pump-outflow'?'Use the pump lever to drain this crossing.':`Return flow stays on. ${returnRoute}`):water.detour?'Wait behind the striped line or take the marked dry route.':'Wait behind the striped line until the flow drops and the chevron lights.'};
 const unlimited=state.timing.kind==='safe-until-event',enough=unlimited||state.safeFor>=seconds;
 const window=unlimited?(water.control==='pump-return'?'SAFE UNTIL BYPASS':'DRAINED'):`${state.safeFor.toFixed(1)}s TO SURGE`;
 if(inside)return {action:'clear',seconds,approach,remaining,title:`CLEAR THE CHANNEL · ${window}`,advice:enough?'Keep moving to the far striped line.':'The surge is close. Clear the channel now.'};
 if(!enough)return {action:'wait',seconds,approach,remaining,title:`WAIT · ${window}`,advice:water.control==='pump-return'?`The return flow will stay on. ${returnRoute}`:`Not enough time to reach the far bank at this pace. ${water.detour?'Wait for the next opening or use the dry route.':'Wait behind the striped line for the next opening.'}`};
 const safeAdvice=water.control==='pump-return'?'This channel stays low until the bypass is operated.':'This channel is drained. Cross to the far striped line.';
 return {action:approach>1?'approach':'cross',seconds,approach,remaining,title:`${approach>1?'APPROACH':'CROSS'} · ${window}`,advice:unlimited?(approach>1?'Move to the striped bank. ':'')+safeAdvice:approach>1?'Move to the striped bank; reassess the signal as you approach.':'Cross now and reach the far striped line before the surge.'};
}
