// A one-shot environmental response to the first completed field check.
// No AI, detection, input, score or navigation changes live in this clock.
export const freshAuditResponse=()=>({phase:'waiting',age:0,source:null});
export function advanceAuditResponse(r,dt,{active=true,ready=false,interrupted=false,source=null}={}){
 if(!active)return null;
 if(r.phase==='quiet'&&interrupted){r.phase='cancelled';r.age=0;return 'cancelled';}
 if(r.phase==='waiting'){
  if(!ready)return null;
  r.phase='quiet';r.age=0;r.source={x:source.x,y:source.y};return 'quiet';
 }
 if(r.phase==='quiet'){
  r.age+=Math.max(0,dt);
  if(r.age>=2.6){r.phase='answer';r.age=0;return 'answer';}
 }else if(r.phase==='answer'){
  r.age+=Math.max(0,dt);if(r.age>=1.6){r.phase='complete';r.age=1.6;}
 }
 return null;
}
export function auditResponseHush(r){
 if(r?.phase==='quiet')return 1-.96*Math.min(1,r.age/.45);
 if(r?.phase==='answer')return .04+.96*Math.min(1,r.age/.9);
 return 1;
}
export function auditResponseBellPose(r,reducedMotion=false){
 if(reducedMotion||r?.phase!=='answer')return 0;
 const t=Math.min(1,r.age/1.35);return Math.sin(t*Math.PI*5)*(1-t)*.24;
}
