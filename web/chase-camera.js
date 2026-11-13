import {COURSE} from './back-nine-course.js';

// The relay shelters have 3.45 m eaves. Lower the follow eye before either
// look direction reaches a roof; retain the same heading and horizontal arm.
// The wide transition also covers ejection and long cart look-ahead targets.
export function shelterCameraCeiling(actor){
 let ceiling=Infinity;
 for(const shelter of COURSE.checkpoints){
  const gap=Math.hypot(actor.x-shelter.x,actor.y-shelter.y);
  if(gap>=22)continue;
  const t=Math.max(0,Math.min(1,(gap-14)/8)),smooth=t*t*(3-2*t);
  ceiling=Math.min(ceiling,2.85+smooth*4.15);
 }
 // The garage's entrance lamp sits just above the old follow eye. Descend
 // before the camera crosses its face, instead of filling the top of the
 // view with a giant luminous slab during the final approach.
 const garageGap=Math.hypot(actor.x-COURSE.finish.x,actor.y-COURSE.finish.y);
 if(garageGap<18){const t=Math.max(0,Math.min(1,(garageGap-10)/8)),smooth=t*t*(3-2*t);ceiling=Math.min(ceiling,3.15+smooth*3.85);}
 return ceiling;
}
