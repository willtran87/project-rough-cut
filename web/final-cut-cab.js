import {travelPose} from './final-cut-travel.js';
import {headlandPose} from './final-cut-headland.js';
import {AMBUSH,attackWarning} from './final-cut-ambush.js';
// Rig-body coordinates, shared by visible controls and the single actor's IK.
export const CAB={wheel:{x:0,y:2.12,z:-.05,radius:.24,tilt:-.6},lever:{x:.45,y:1.7,z:.2,length:.38},feet:[{x:-.24,y:1.45,z:-.12},{x:.24,y:1.45,z:-.12}],
 seat:{x:0,y:1.775,z:.41,w:.76,h:.1,d:.36,tilt:-.2},seatBack:{x:0,y:2.25,z:.66,w:.8,h:.9,d:.2},seatSupport:{x:0,y:1.535,z:.45,w:.28,h:.42,d:.2}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Upright actor root after stepping clear of the wreck, including the model's
// .38 m hip offset. The renderer and authoritative road walk share this end.
export function cabExitRoot(rig){const x=2.73,z=.45,c=Math.cos(rig.yaw),s=Math.sin(rig.yaw);return {x:rig.x+c*x-s*z,y:rig.y-s*x-c*z,yaw:Math.atan2(Math.sin(rig.yaw-Math.PI/2),Math.cos(rig.yaw-Math.PI/2))};}
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
function drivingLook(j){
 if(j.phase==='turn'&&j.travel){const future=travelPose(j.travel.route,Math.min(j.travel.route.length,j.travel.distance+4+(j.speed||0)*.35)),delta=Math.atan2(Math.sin(future.yaw-j.yaw),Math.cos(future.yaw-j.yaw));return {reverseCheck:0,lead:clamp(-delta*1.35,-.55,.55)*smooth(0,.35,j.age),shoulder:0};}
 const plan=j.turnPlan,segment=plan?.segments[plan.index];
 if(j.phase!=='turn'||!segment)return {reverseCheck:0,lead:clamp(-(j.steering||0)*.55,-.35,.35),shoulder:0};
 let reverseCheck=0;
 if(segment.gear<0)reverseCheck=1;
 else if(plan.shift>0&&plan.segments[plan.index-1]?.gear<0)reverseCheck=1-smooth(0,.45,.45-plan.shift);
 else if(plan.profile){
  const nextGear=plan.segments.slice(plan.index).find(s=>s.gear!==segment.gear);
  if(nextGear?.gear<0)reverseCheck=smooth(plan.profile.duration-1.1,plan.profile.duration-.05,plan.profile.time);
 }
 // Read only the already committed road, never the player's hidden position.
 let index=plan.index,at=plan.at+4+Math.abs(j.speed||0)*.35;
 while(at>plan.segments[index].length&&plan.segments[index+1]?.gear===segment.gear){at-=plan.segments[index].length;index++;}
 const future=headlandPose(plan.segments[index],Math.min(at,plan.segments[index].length)),delta=Math.atan2(Math.sin(future.yaw-j.yaw),Math.cos(future.yaw-j.yaw));
 // Check the course-facing rear quarter. This is the side shared with foot
 // traffic, and makes the human action readable from inside the fence.
 return {reverseCheck,lead:clamp(-delta*1.35,-.55,.55)*smooth(0,.55,j.age),shoulder:Math.sign(j.x*Math.cos(j.yaw))||1};
}
export function cabPerformance(r,reduced=false){
 const j=r.rig,setting=j.phase==='announce',checking=j.phase==='disengage',age=j.age*(j.attack?(setting?4/attackWarning(r):checking?2.2/AMBUSH.lift:1):1),bog=r.won&&r.ending.age<7;
 const check=checking?Math.sin(Math.PI*clamp(age/2.2,0,1)):0;
 const panic=bog?smooth(.4,1.5,r.ending.age)*(1-smooth(4.7,7,r.ending.age)):0;
 const look=drivingLook(j),rear=look.reverseCheck;
 return {action:bog?'traction-loss':setting?'set-pass':checking?'check-cut':rear>.01?'check-reverse':['turn','align'].includes(j.phase)?'steer':'hold-course',
  wheel:-(j.steering||0)+(bog?Math.sin(r.ending.age*4)*.55*panic:0),
  lever:-.45*j.deployment,
  rightLever:setting?smooth(0,.5,age)*(1-smooth(2.2,3.5,age)):0,
  reverseCheck:rear,lookAhead:look.lead,
  headYaw:checking?-1.15*check:bog?-.45*panic:look.lead*(1-rear)+look.shoulder*1.25*rear,
  headPitch:checking?.13*check:bog?.18*panic:setting?.12*smooth(0,.6,age)*(1-smooth(2.2,3.5,age)):0,
  chestYaw:checking?-.5*check:look.shoulder*.6*rear,
  chestPitch:bog?-.1*panic:setting?-.025*smooth(0,.6,age)*(1-smooth(2.2,3.5,age)):.04*rear,
  // Optional high-frequency strain is suppressed by reduced motion. The
  // controlled wheel struggle and downward look still explain traction loss.
  strain:bog&&!reduced?Math.sin(r.ending.age*13)*.012*panic:0};
}
