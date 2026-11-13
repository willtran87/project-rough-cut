// Independent, seeded irrigation timers use simulation time, so pause, retry
// and extra render frames never change the ground beneath the player.
function hash(seed,zone,cycle){
 let h=(seed^Math.imul(zone+1,0x9e3779b9)^Math.imul(cycle+1,0x85ebca6b))>>>0;
 h=Math.imul(h^(h>>>16),0x7feb352d);h=Math.imul(h^(h>>>15),0x846ca68b);
 return ((h^(h>>>16))>>>0)/4294967296;
}
export function irrigationPhase(run,index){
 if((run?.tactics?.floodUntil?.[index]||0)>(run?.time||0))return {active:true,flood:1,remaining:run.tactics.floodUntil[index]-run.time,cycle:-1,manual:true};
 const seed=run?.variation?.seed||0,period=30+Math.floor(hash(seed,index,0)*11);
 const clock=Math.max(0,run?.time||0)+hash(seed,index,1)*period;
 const cycle=Math.floor(clock/period),age=clock-cycle*period;
 const duration=10+Math.floor(hash(seed,index,cycle+2)*8),active=age<duration;
 return {active,flood:active?1:0,remaining:(active?duration:period)-age,cycle};
}
