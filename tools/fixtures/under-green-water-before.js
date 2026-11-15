// Frozen pre-refactor oracle; do not import into runtime.
import {timedHazard,eventHazard} from '../../web/hazard-timing.js';
const reserve=.25;
export function waterState(w,time,bypass=false,bypassAt=-99){
 if(w.id==='return'){
  const age=Math.max(0,time-bypassAt);
  if(!bypass)return {phase:'low',danger:false,level:.02,cycle:0,...eventHazard(true,'bypass-open')};
  if(age<2)return {phase:'warning',danger:false,level:age/2,cycle:age,...timedHazard(2-age,2-age)};
  return {phase:'surge',danger:true,level:1,cycle:age,...eventHazard(false,'chapter-restart')};
 }
 if(w.id==='bypass')return {phase:bypass?'low':'surge',danger:!bypass,level:bypass?.08:1,cycle:0,...eventHazard(bypass,bypass?'chapter-restart':'bypass-open')};
 const c=((time+w.offset)%12+12)%12,low=w.lowSeconds??(w.lesson?5:3),close=low+1.5;
 return c<low?{phase:'low',danger:false,level:.04,cycle:c,...timedHazard(low-c,close-c)}:c<close?{phase:'warning',danger:false,level:.08+(c-low)*.28,cycle:c,...timedHazard(close-c,close-c)}:c<10?{phase:'surge',danger:true,level:1,cycle:c,...timedHazard(10-c)}:{phase:'receding',danger:true,level:1-(c-10)*.35,cycle:c,...timedHazard(12-c)};
}
export function crossingWait(w,time,seconds,bypass,bypassAt){
 const state=waterState(w,time,bypass,bypassAt);
 if(!state.danger&&(state.safeFor===null||state.safeFor>=seconds+reserve))return 0;
 // Event-controlled return/outflow cannot promise another timed opening.
 if(w.id==='return'||w.id==='bypass')return Infinity;
 const window=(w.lowSeconds??(w.lesson?5:3))+1.5;
 if(seconds+reserve>window)return Infinity;
 return 12-state.cycle;
}

