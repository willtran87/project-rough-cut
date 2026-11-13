import {COURSE,clamp} from './back-nine-course.js';
// Relay caps exceed progress at their trigger, so completing a relay never
// jumps damage. Driving ahead without the required work cannot unlock it.
export function ramDamageScale(run){
 // Keep the opening survivable; build weight through the second relay and
 // final district, instead of spending the cart's health before the finale.
 const start=COURSE.checkpoints[1].y-100;
 const distanceProgress=clamp((run.cart.y-start)/(COURSE.finish.y-start),0,1);
 const progress=Math.min(distanceProgress,[.10,.34,1][clamp(run.checkpoint,0,2)]);
 const smooth=progress*progress*(3-2*progress);
 return 1+1.15*smooth;
}
export function scaledImpactDamage(strength,run=null,front=1){
 const direct=.72+.28*clamp(Math.abs(front),0,1);
 return Math.round((4+clamp(strength,0,1)*12)*direct*(run?ramDamageScale(run):1));
}
