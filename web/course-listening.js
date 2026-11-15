const clamp=n=>Math.max(0,Math.min(1,n));
export function listeningPoint(player,target,yaw=0){
 const x=(target.x-player.x)*.72,y=target.y-player.y;
 const angle=Math.atan2(Math.sin(Math.atan2(x,y)-yaw),Math.cos(Math.atan2(x,y)-yaw));
 const bearing=Math.abs(angle)<Math.PI/4?'AHEAD':Math.abs(angle)>Math.PI*3/4?'BEHIND':angle>0?'RIGHT':'LEFT';
 return {angle,bearing,metres:Math.round(Math.hypot(x,y)*1.6)/10};
}
export function courseListeningRead({player,yaw,joe,search,cadence,readSeconds=1.25,clues=[]}){
 const motor=listeningPoint(player,joe,yaw),entries=clues.map(c=>({...c,...listeningPoint(player,c.point,yaw)}));
 if(search?.active&&search.locus)entries.unshift({id:'search',label:search.locusKind==='trail_check'?'Trail check':'Last trace',detail:`${Math.ceil(search.secondsRemaining)}s remain`,...listeningPoint(player,search.locus,yaw)});
 const forecast=cadence?.forecast,forecastPoint=forecast?listeningPoint(player,forecast.target,yaw):null;
 if(forecast)entries.unshift({id:'forecast',label:'Predicted turn',detail:`${Math.ceil(forecast.timer)}s remain`,...listeningPoint(player,forecast.target,yaw)});
 const reasons={not_in_shelter:'Find cover to read the mower cadence',not_crouched:'Crouch to read the mower cadence',concealment_building:'Stay concealed while your cover settles',movement:'Stay still to read the mower cadence',joe_not_patrolling:'Read cadence while Joe is patrolling',exposed:'Break sight before reading cadence',too_close:'Joe is too close for a cadence read',too_far:'Move closer to hear the mower cadence',another_action_active:'Finish the current action before reading cadence',cooldown:'Cadence read is recovering',zone_already_read:'Cadence already read in this area',run_cap_reached:'No cadence reads remain this run',hold_listening_focus:'Hold Listen to read the mower cadence'};
 return {joe:{...motor,trend:search?.active?search.trend:null},entries,
  cadence:{text:forecast?`Predicted turn ${forecastPoint.bearing.toLowerCase()} · ${forecastPoint.metres}m · ${Math.ceil(forecast.timer)}s`:cadence?.active?`Reading mower cadence · ${Math.round(clamp(cadence.progress/readSeconds)*100)}%`:reasons[cadence?.blockedReason]||'Listen for the mower',
   progress:forecast?clamp(forecast.timer/forecast.duration):cadence?.active?clamp(cadence.progress/readSeconds):null}};
}
