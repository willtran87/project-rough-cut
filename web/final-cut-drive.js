import {RIG} from './final-cut-course.js';

// Each committed cutting strip accelerates from its actual starting point,
// holds cutting speed and brakes
// before folding the banks. Position owns progress, so copied encounter states
// and checkpoint fixtures cannot acquire a second, drifting motion clock.
export const CUT_ACCELERATION=2.4;
const length=RIG.headland*2,peak=Math.min(RIG.speed,Math.sqrt(CUT_ACCELERATION*length));
const ramp=peak/CUT_ACCELERATION,rampDistance=peak*ramp/2,cruiseDistance=length-2*rampDistance;
export const CUT_DURATION=2*ramp+cruiseDistance/peak;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function profile(direction,start=-direction*RIG.headland){
 const length=Math.max(.001,direction*(direction*RIG.headland-start)),peak=Math.min(RIG.speed,Math.sqrt(CUT_ACCELERATION*length)),ramp=peak/CUT_ACCELERATION,rampDistance=peak*ramp/2;
 return {start,length,peak,ramp,rampDistance,cruiseDistance:length-2*rampDistance,duration:2*ramp+(length-2*rampDistance)/peak};
}
export function cuttingTime(x,direction,start){
 const {length,peak,ramp,rampDistance,duration}=profile(direction,start);
 const progress=clamp(direction*(x-(start??-direction*RIG.headland)),0,length);
 if(progress<rampDistance)return Math.sqrt(2*progress/CUT_ACCELERATION);
 if(progress<=length-rampDistance)return ramp+(progress-rampDistance)/peak;
 return duration-Math.sqrt(2*(length-progress)/CUT_ACCELERATION);
}
export function cuttingMotion(x,direction,dt,start){
 const {start:origin,length,peak,ramp,rampDistance,duration}=profile(direction,start);
 const time=clamp(cuttingTime(x,direction,start)+dt,0,duration);
 let progress,speed;
 if(time<ramp){progress=CUT_ACCELERATION*time*time/2;speed=CUT_ACCELERATION*time;}
 else if(time<duration-ramp){progress=rampDistance+(time-ramp)*peak;speed=peak;}
 else {const remaining=duration-time;progress=length-CUT_ACCELERATION*remaining*remaining/2;speed=CUT_ACCELERATION*remaining;}
 return {x:origin+direction*progress,speed,done:time>=duration};
}
