export const CLOSE_PUSH_TIMING=Object.freeze({warning:.65,push:.48,recovery:.85});
export function freshCloseEscape(){return {armed:true,remaining:0,safeSeconds:0,activations:0,phase:'none',age:0,target:null,heading:0,pushRemaining:0,recoveryRemaining:0};}
export function recoverClosePush(s){s.phase='recovery';s.age=0;s.remaining=s.pushRemaining=0;s.recoveryRemaining=CLOSE_PUSH_TIMING.recovery;}
export function advanceCloseEscape(s,dt,input){
 const events=[];dt=Math.max(0,dt);s.phase??='none';s.age??=0;let idleDt=dt;
 if(input.interrupt){s.phase='none';s.remaining=s.pushRemaining=s.recoveryRemaining=0;s.target=null;}
 else if(s.phase!=='none'){
  idleDt=0;
  let left=dt;
  while(left>0&&s.phase!=='none'){
   const duration=CLOSE_PUSH_TIMING[s.phase],used=Math.min(left,Math.max(0,duration-s.age));s.age+=used;left-=used;
   if(s.age+1e-9<duration)break;
   s.age=0;
   if(s.phase==='warning'){s.phase='push';events.push('close_push');}
   else if(s.phase==='push'){s.phase='recovery';events.push('close_push_recovery');}
   else{s.phase='none';s.target=null;events.push('close_push_finished');}
  }
  if(s.phase==='none')idleDt=left;
 }
 s.safeSeconds=input.safe&&s.phase==='none'?s.safeSeconds+idleDt:0;
 if(s.safeSeconds>=8)s.armed=true;
 if(s.phase==='none'&&s.armed&&input.start&&!input.interrupt){
  s.phase='warning';s.age=0;s.armed=false;s.safeSeconds=0;s.activations++;
  s.target={...input.target};s.heading=input.heading;events.push('close_escape_warning');
 }
 s.remaining=s.phase==='warning'?Math.max(0,CLOSE_PUSH_TIMING.warning-s.age):0;
 s.pushRemaining=s.phase==='push'?Math.max(0,CLOSE_PUSH_TIMING.push-s.age):0;
 s.recoveryRemaining=s.phase==='recovery'?Math.max(0,CLOSE_PUSH_TIMING.recovery-s.age):0;
 return events;
}
export function closePushMotor(s){
 if(s.phase==='warning'){const t=Math.min(1,s.age/CLOSE_PUSH_TIMING.warning);return {gain:1+.08*t,pitch:8+12*t};}
 if(s.phase==='push')return {gain:1.12,pitch:24};
 if(s.phase==='recovery')return {gain:.82,pitch:-10};
 return {gain:1,pitch:0};
}
