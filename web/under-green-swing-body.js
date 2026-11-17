import {TRIMMER} from './under-green-trimmer.js';

const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
// How Joe's whole body carries the cut. The weapon pose is authoritative and
// already solved against scenery; this only reads it, so the hips, weight and
// lunge can never move the blade or change what it reaches.
//   turn   hips turned with the blade, radians about the spine
//   shift  weight moved onto the foot on the blade's side, metres to his right
//   reach  hips driven forward through the cut and held in the follow-through
//   drop   hips lowered as he sits into the stroke
//   pitch  extra chest lean (negative leans into the cut)
//   roll   chest tipped toward the blade
export function swingTarget(joe,pose){
 const side=clamp(pose.angle/TRIMMER.arc,-1,1),raised=clamp(pose.raised);
 // The lunge builds through the sweep and is released as the blade lowers.
 let lunge=0;
 if(joe.phase==='sweep'){const t=clamp(joe.age/TRIMMER.sweepSeconds);lunge=t*t*(3-2*t);}
 else if(joe.phase==='recover')lunge=raised;
 const coil=raised*Math.max(0,-side)*(joe.phase==='windup'?1:0);
 return {
  turn:-pose.angle*.24*raised,
  shift:.075*side*raised,
  reach:.11*lunge-.035*coil,
  drop:.03*raised+.02*lunge,
  pitch:-.085*lunge+.05*coil,
  roll:-.06*side*raised
 };
}
const KEYS=['turn','shift','reach','drop','pitch','roll'];
// The cut itself lasts a fifth of a second, so the body eases toward its
// target instead of snapping; a blocked cut then settles without a jump.
export function createSwingBody(){
 const now=Object.fromEntries(KEYS.map(k=>[k,0]));let fresh=true;
 return {
  reset(){fresh=true;},
  update(joe,pose,dt){
   const target=swingTarget(joe,pose),ease=fresh?1:1-Math.exp(-dt*(joe.phase==='sweep'?26:11));fresh=false;
   for(const k of KEYS)now[k]+=(target[k]-now[k])*ease;
   now.active=KEYS.some(k=>Math.abs(now[k])>.0005);
   return now;
  }
 };
}
