import {TRIMMER} from './under-green-trimmer.js';

const clamp=t=>Math.max(0,Math.min(1,t));
// Secondary body acting follows the collision-authoritative weapon pose.
// Analytic phase curves are stable at every render rate and on duplicate frames.
export function attackActing(joe,pose){
 const attack=['windup','sweep','recover'].includes(joe.phase);
 let lead=0,drive=0,settle=0;
 if(joe.phase==='windup')lead=.10*Math.sin(Math.PI*clamp(joe.age/.6))**2;
 if(joe.phase==='sweep'){
  const t=clamp(joe.age/TRIMMER.sweepSeconds);
  // Shoulders initiate the cut, then the blade pulls past the torso.
  const envelope=Math.sin(Math.PI*t);
  lead=-.12*Math.sin(2*Math.PI*t)*envelope;drive=.045*envelope*envelope;
 }
 if(joe.phase==='recover'){
  const t=clamp((joe.age-.16)/(TRIMMER.recoverSeconds-.16));
  settle=.022*Math.sin(3*Math.PI*t)*Math.sin(Math.PI*t)*Math.exp(-3*t)*(1-t);
 }
 const raised=attack?pose.raised:0;
 const result={yaw:-pose.angle*.5+lead*raised+settle,
  pitch:-.06*raised-drive,roll:-.025*Math.sin(pose.angle)*raised+settle*.45};
 // A scenery-blocked cut starts recovery from the exact interrupted body
 // pose as well as the exact interrupted weapon pose, without snapping.
 const from=joe.recoveryFrom;
 if(joe.phase==='recover'&&from?.acting){
  const t=clamp((joe.age-.16)/(TRIMMER.recoverSeconds-.16)),remaining=1-t*t*(3-2*t);
  result.yaw+=(from.acting.yaw+from.angle*.5)*remaining;
  result.pitch+=(from.acting.pitch+.06*from.raised)*remaining;
  result.roll+=(from.acting.roll+.025*Math.sin(from.angle)*from.raised)*remaining;
 }
 return result;
}
