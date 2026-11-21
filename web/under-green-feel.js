// Presentation-side reading of a run: tension, heartbeat, near misses and
// the events that drive rumble. Pure observation. It never writes the run
// and keeps its own state, so replays and saved simulations are unaffected.
import {distance} from './under-green-course.js';

const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
export const NEAR_MISS_RANGE=3.4;
// How threatening Joe is right now, 0..1, from what the player could know.
export function tensionTarget(r){
 const j=r.joe;if(r.mode!=='playing'||['absent','blocked'].includes(j.phase))return 0;
 const gap=distance(r.player,j),near=clamp(1-(gap-2)/16);
 if(['windup','sweep'].includes(j.phase)&&gap<6)return 1;
 return near*(j.seen?1:.55);
}
// Two thumps per beat; phase 0..1.
export function heartbeatEnvelope(phase){
 const first=Math.exp(-phase*11),second=phase>=.3?.7*Math.exp(-(phase-.3)*11):0;
 return Math.max(first,second);
}
export function createDrainFeel(){
 let owner=null,last=0,tension=0,beat=0,serial=0,pending=false,closeCalls=0,missAt=-Infinity,useAt=-Infinity,seen=new WeakSet();
 const state={tension:0,pulse:0,flash:0,missAt:-Infinity,useAt:-Infinity,closeCalls:0};
 return {
  // Call once per simulation step (or per frame); returns this step's events.
  observe(r){
   const events=[];
   if(owner!==r||r.time<last){owner=r;last=r.time;tension=0;beat=0;serial=r.joe.attackSerial||0;pending=false;closeCalls=0;missAt=useAt=-Infinity;seen=new WeakSet();for(const e of r.events)seen.add(e);}
   const dt=clamp(r.time-last,0,.1);last=r.time;
   const j=r.joe,target=tensionTarget(r);
   tension+=(target-tension)*(1-Math.exp(-dt*(target>tension?3.2:.7)));
   if(tension>.2&&r.mode==='playing'){beat+=dt*(1.05+1.2*tension);if(beat>=1){beat-=1;events.push({type:'heartbeat',strength:clamp((tension-.2)/.6)});}}else beat=0;
   // A cut that began and ended without catching the player, close enough to feel.
   if((j.attackSerial||0)>serial){serial=j.attackSerial;pending=true;}
   if(pending&&j.phase!=='sweep'){
    pending=false;
    if(r.mode==='playing'&&distance(r.player,j)<NEAR_MISS_RANGE){closeCalls++;missAt=r.time;events.push({type:'near-miss',blocked:!!j.recoveryBlocked});}
   }
   for(const e of r.events){
    if(seen.has(e))continue;seen.add(e);
    if(['water-hit','bypass','evidence','closing','secured','caught','blade-blocked','joe-enter','pipe-knock'].includes(e.type))events.push(e);
    if(['bypass','evidence','closing'].includes(e.type))useAt=r.time;
   }
   const missAge=r.time-missAt;
   state.tension=tension;state.pulse=tension>.2&&r.mode==='playing'?heartbeatEnvelope(beat)*clamp((tension-.2)/.6)*.5:0;
   state.flash=missAge>=0&&missAge<.16?.14*(1-missAge/.16):0;state.missAt=missAt;state.useAt=useAt;state.closeCalls=closeCalls;
   return events;
  },
  state,
 };
}
// Shared difficulty names mapped onto this chapter's existing pressure levels.
export const PRESSURE_FOR={relaxed:'steady',standard:'standard',hard:'relentless'};
export const DIFFICULTY_FOR={steady:'relaxed',standard:'standard',relentless:'hard'};
// Optional goals shown in the end summary.
export const DISCOVERIES=[['record','Groundskeeper’s record recovered'],['dry','Finished without a soaking'],['clean','Finished without a close call']];
