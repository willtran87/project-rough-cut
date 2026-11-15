const clamp=v=>Math.max(0,Math.min(1,v));
// Absolute simulation age keeps camera motion frozen on pause and deterministic
// at low frame rates. No postprocess, new render target or frame-time allocation.
export function runoverPose(age,reduced,out){
 const t=clamp(age/1.25),settle=t*t*(3-2*t),kick=reduced?0:Math.sin(age*25)*Math.exp(-age*9);
 const landing=reduced?0:Math.max(0,1-Math.abs(age-.66)/.13);
 out.side=reduced?6:7.3-1.95*settle+.13*kick;
 out.height=reduced?4.2:5.4-2.7*settle+.16*kick-.09*landing;
 // Start across the contact so the engine housing does not hide the fall.
 // Settle behind the passed mower to reveal the victim in the aftermath.
 out.behind=reduced?-.8:-.8+4.15*settle;
 out.roll=reduced?0:-.032*settle+.018*kick+.009*landing;
 out.fov=reduced?64:64-4*settle+2.2*Math.exp(-age*12);
 out.phase=age<.25?'impact':age<.75?'fall':age<1.65?'overrun':'aftermath';
 return out;
}

// Choose one side at contact and hold it for the whole shot. Evaluate both
// the early fall and settled view so a nearby wall cannot crush the camera
// against the victim or cause a mid-animation side switch.
export function runoverCameraSide(death,clearance){
 const sx=Math.sin(death.yaw),cx=Math.cos(death.yaw);
 const score=side=>Math.min(...[[7.3,-.8],[5.35,3.35],[6,-.8]].map(([arm,behind])=>clearance(death,{x:death.x+cx*arm*side-sx*behind,y:death.y-sx*arm*side-cx*behind})));
 return score(-1)>score(1)+.08?-1:1;
}
