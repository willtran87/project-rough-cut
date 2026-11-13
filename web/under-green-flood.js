// Shared simulation/presentation clock. A retry starts dry; pause freezes it.
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function floodState(elapsed=0){
 const age=elapsed-32;
 if(age<0)return {phase:'dry',depth:0,warning:0,cycle:-1,speedScale:1};
 const cycle=Math.floor(age/66),t=age-cycle*66;
 const phase=t<6?'warning':t<14?'rising':t<23?'high':t<33?'falling':'dry';
 const fill=t<6?0:t<14?smooth((t-6)/8):t<23?1:t<33?1-smooth((t-23)/10):0;
 return {phase,depth:.38*fill,warning:phase==='warning'?smooth(t/6):0,cycle,speedScale:1-.26*fill};
}
export function floodPace(depth=0){return 1-.26*Math.max(0,Math.min(1,depth/.38));}
// A bank's crossing recommendation must allow for water still rising while
// the player crosses; do not promise a window using today's faster pace.
export function floodCrossingScale(elapsed){
 const state=floodState(elapsed);
 return state.phase==='warning'||state.phase==='rising'?.74:state.speedScale;
}
