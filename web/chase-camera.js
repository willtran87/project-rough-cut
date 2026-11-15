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

// Track an obstacle-avoiding cart boom along an arc. Linear interpolation
// between opposite shoulders passes straight through the cart's canopy.
export function trackCartCamera(eye,target,anchor,dt,sweep){
 if(dt<=0)return;
 const ax=anchor.x,az=-anchor.y,dx=target.x-ax,dz=target.z-az;
 const radius=Math.hypot(eye.x-ax,eye.z-az),targetRadius=Math.hypot(dx,dz),blend=1-Math.exp(-dt*8);
 if(radius<.2||targetRadius<.2){eye.x+=(target.x-eye.x)*blend;eye.y+=(target.y-eye.y)*blend;eye.z+=(target.z-eye.z)*blend;return;}
 const angle=Math.atan2(eye.x-ax,eye.z-az),wanted=Math.atan2(dx,dz);
 let delta=Math.atan2(Math.sin(wanted-angle),Math.cos(wanted-angle));
 const probe={x:0,y:eye.y,z:0};
 function arcClear(turn){
  const steps=Math.max(1,Math.ceil(Math.abs(turn)/(.1)));
  for(let i=1;i<=steps;i++){
   const t=i/steps,a=angle+turn*t,r=radius+(targetRadius-radius)*t;
   probe.x=ax+Math.sin(a)*r;probe.y=eye.y+(target.y-eye.y)*t;probe.z=az+Math.cos(a)*r;
   if(sweep(probe)<.999)return false;
  }
  return true;
 }
 if(Math.abs(delta)>.12&&!arcClear(delta)){
  const alternate=delta>0?delta-Math.PI*2:delta+Math.PI*2;
  if(arcClear(alternate))delta=alternate;
  else{eye.x+=(target.x-eye.x)*blend;eye.y+=(target.y-eye.y)*blend;eye.z+=(target.z-eye.z)*blend;return;}
 }
 const step=Math.max(-dt*2.4,Math.min(dt*2.4,delta*blend)),r=radius+(targetRadius-radius)*blend;
 eye.x=ax+Math.sin(angle+step)*r;eye.z=az+Math.cos(angle+step)*r;eye.y+=(target.y-eye.y)*blend;
}
