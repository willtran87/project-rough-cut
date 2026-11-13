// Fixed machinery positions: both presentation and hearing use these sources.
export const PUMP_KNOCKS=Object.freeze([
 {id:'junction',age:.6,x:0,y:40,range:48},
 {id:'outlet',age:1.4,x:6,y:38,range:42},
 {id:'return',age:2,x:-20,y:49,range:24}
]);
export function pumpProgress(run){return run.bypass?Math.min(1,Math.max(0,(run.time-run.bypassAt)/.8)):0;}
export function updatePump(run,dt){
 if(!run.bypass)return;
 const age=run.time-run.bypassAt;
 for(const source of PUMP_KNOCKS){
  if(age<source.age||age-dt>=source.age)continue;
  run.events.push({type:'pipe-knock',id:source.id,x:source.x,y:source.y,time:run.time});
  const j=run.joe;
  if(!['absent','enter'].includes(j.phase)&&Math.hypot(j.x-source.x,j.y-source.y)<source.range){
   j.last={x:source.x,y:source.y};j.evidence='pipe-noise';j.evidenceAt=run.time;
   j.search=0;j.searchIndex=0;j.searchOrigin=null;j.repath=0;
  }
 }
}
