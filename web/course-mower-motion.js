// Course metric units: x is scaled by .72, y is longitudinal. These limits
// govern actual movement; the actor and wheels follow the resulting travel.
export const COURSE_MOWER_MOTION=Object.freeze({acceleration:64,braking:112,pivotRate:2.9,cruiseTurnRate:1.35});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const mowerAngleDelta=(target,current)=>Math.atan2(Math.sin(target-current),Math.cos(target-current));
export function courseMowerStep({speed=0,heading=0},desiredSpeed,targetHeading,distance,dt){
  dt=Math.max(0,dt);speed=Math.max(0,speed);
  const c=COURSE_MOWER_MOTION,error=mowerAngleDelta(targetHeading,heading);
  const turnRate=c.pivotRate+(c.cruiseTurnRate-c.pivotRate)*clamp(speed/40,0,1);
  const turn=clamp(error,-turnRate*dt,turnRate*dt);
  heading+=turn;
  // Slow before a tight bend and pivot for a reversal, rather than instantly
  // translating sideways. Distance braking prevents orbiting a reached point.
  const alignment=Math.max(0,Math.cos(error));
  const wanted=Math.min(Math.max(0,desiredSpeed)*alignment*alignment,Math.sqrt(2*c.braking*Math.max(0,distance)));
  const rate=wanted>speed?c.acceleration:c.braking;
  const next=speed+clamp(wanted-speed,-rate*dt,rate*dt);
  const reachTime=Math.min(dt,Math.abs(wanted-speed)/rate);
  const travel=Math.min(Math.max(0,distance),(speed+next)*.5*reachTime+next*(dt-reachTime));
  return {speed:next,heading,travel,turn,desiredSpeed:wanted};
}
