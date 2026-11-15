export const COURSE_CIRCUITS=[
  {id:'pond-circuit',label:'POND',x:18,y:231,radius:8,lights:['floodlight']},
  {id:'range-circuit',label:'RANGE',x:0,y:582,radius:8,lights:['range-light-west','range-light-center','range-light-east']},
];
export const CIRCUIT_SECONDS=16;
export function circuitPower(circuits,lightId){
  const active=circuits?.active.find(c=>COURSE_CIRCUITS.find(s=>s.id===c.id)?.lights.includes(lightId));
  if(!active)return 1;
  const t=Math.max(0,Math.min(1,1-active.remaining/2));
  return .06+.94*t*t*(3-2*t);
}
export function advanceCircuits(circuits,dt){
  const warnings=[];
  for(const c of circuits.active){
    const before=c.remaining;c.remaining=Math.max(0,c.remaining-Math.max(0,dt));
    if(before>3&&c.remaining>0&&c.remaining<=3)warnings.push(c.id);
  }
  circuits.active=circuits.active.filter(c=>c.remaining>0);return warnings;
}
// A persistent environmental alteration only appears after a sustained glance
// away, never popping into existence in the player's central view.
export function traceUnseenSeconds(trace,player,yaw,dt){
  const dx=(trace.x-player.x)*.72,dy=trace.y-player.y,d=Math.hypot(dx,dy);
  const dot=(dx*Math.sin(yaw)+dy*Math.cos(yaw))/Math.max(.01,d);
  return d>24&&dot<.15?(trace.unseenSeconds||0)+Math.max(0,dt):0;
}
