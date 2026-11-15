// Two opening beats share one simulation clock. No camera steering, inventory,
// enemy evidence or navigation writes belong in this state machine.
export const TEE_ANOMALY=Object.freeze({x:-34,y:52,radius:48,interactionHeight:.55});
export function freshFirstImpression(){
 return {joeSeen:false,joeVisibleSeconds:0,workRemaining:0,workStarted:null,workOutcome:null,anomaly:'waiting',anomalySeenSeconds:0,anomalyAge:0};
}
export function advanceFirstImpression(s,dt,f){
 const events=[];dt=Math.max(0,dt);
 if(!f.active)return events;
 if(f.skip){s.workRemaining=0;s.anomaly='skipped';return events;}
 const danger=!f.calm;
 if(s.workRemaining>0){
  s.workRemaining=danger?0:Math.max(0,s.workRemaining-dt);
  if(s.workRemaining===0){s.workOutcome=danger?'interrupted_by_evidence':'finished';events.push('joe_work_finished');}
 }
 if(!s.joeSeen){
  const canSee=f.calm&&f.clear&&f.time>=3.2&&f.time<80&&f.playerY<190&&f.joeVisible&&f.joeDistance>=65&&f.joeDistance<140;
  s.joeVisibleSeconds=canSee?s.joeVisibleSeconds+dt:0;
  if(s.joeVisibleSeconds>=.35){s.joeSeen=true;s.workRemaining=2.6;s.workStarted=f.time;events.push('joe_first_sighting');}
 }
 if(s.anomaly==='waiting'){
  if(!f.apparitions||f.playerY>140||f.time>95){s.anomaly='skipped';return events;}
  // A discovery for players looking around the tee, not a mandatory jump scare
  // stacked on the phone or Joe's first appearance.
  const eligible=f.time>=7&&f.clear&&f.calm&&f.accentFree&&s.workRemaining===0&&!f.joeVisible&&f.anomalyVisible;
  s.anomalySeenSeconds=eligible?s.anomalySeenSeconds+dt:0;
  if(s.anomalySeenSeconds>=.45){s.anomaly='rising';s.anomalyAge=0;events.push('tee_anomaly');}
 }else if(s.anomaly==='rising'){
  if(!f.apparitions||danger||!f.clear){s.anomaly='spent';events.push('tee_anomaly_yielded');}
  else {s.anomalyAge+=dt;if(s.anomalyAge>=4.4){s.anomaly='spent';events.push('tee_anomaly_finished');}}
 }
 return events;
}
export function teeAnomalyPose(s,reducedMotion=false){
 const active=s?.anomaly==='rising';
 const t=Math.max(0,Math.min(4.4,s?.anomalyAge||0));
 const lift=reducedMotion?.54:t<2.7?.54*(t/2.7)**2:.54;
 const dissolve=t<3.5?1:Math.max(0,(4.4-t)/.9);
 return {visible:active,height:.105+lift,scale:reducedMotion?1:Math.max(.025,dissolve),opacity:reducedMotion?dissolve:1};
}
