// Authored weather progression from actual completed checks. Sampled from the
// simulation clock so render frequency, camera turns and pause cannot age it.
const CHECKS=['audit-bell','field-log','release-review'];
const clamp=v=>Math.max(0,Math.min(1,v));
export const freshCourseNightfall=(completed=[],time=0,saved=[])=>({
 checks:CHECKS.filter(id=>completed.includes(id)).map(id=>{
  const previous=saved.find(check=>check.id===id);
  return {id,time:Number.isFinite(previous?.time)?Math.min(time,previous.time):time-14};
 })
});
export function recordNightfallCheck(state,id,time){
 if(!CHECKS.includes(id)||state.checks.some(check=>check.id===id))return;
 state.checks.push({id,time});
}
export function courseNightfall(state,time){
 const checks=state?.checks||[];
 const progress=checks.reduce((sum,check)=>{
  const t=clamp((time-check.time)/14);return sum+t*t*(3-2*t);
 },0)/3;
 return {progress,completed:checks.length,skyScale:1-.22*progress,
  moonScale:1-.08*progress,cloudWidth:1+.8*progress,
  cloudHeight:1+.16*progress,cloudOpacity:.48+.27*progress};
}
