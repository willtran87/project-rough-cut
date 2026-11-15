// Camera-local poses for the existing six-second notification. These are a
// function of simulation age, so pausing and replaying cannot drift the hand.
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function courseArrivalPhonePose(age,portrait=false,reducedMotion=false,fov=58){
 const lift=reducedMotion?1:smooth(age/.45);
 const stow=reducedMotion?0:smooth((age-3.45)/2.75);
 const held=portrait?-.12:-.055,lowered=portrait?-.95:-.78;
 // Preserve reading size and margins across the supported world-FOV setting.
 const scale=Math.tan(fov*Math.PI/360)/Math.tan(58*Math.PI/360);
 return {x:(portrait?.06:.31)*scale,y:(lowered+(held-lowered)*(lift-stow))*scale,z:portrait?-.86:-.72,scale,
  roll:-.035-.09*stow,yaw:-.10,pitch:.06*stow,lift,stow};
}
