// Night Order "feel" layer: controller rumble, the heartbeat screen pulse, and
// near-miss feedback (a short flash, rumble and presentation slow-down).
// game.js reports events it already plays a sound for and passes a few read-only
// numbers each drawn frame; nothing here writes to the round, so replays and
// advanceTime() checks are unaffected. The slow-down scales only the real-time
// frame loop's delta (see timeScale()).
import {createRumble,firstPad} from '../pad-rumble.js';

// strong = low motor (weight), weak = high motor (texture).
const RUMBLES={
 step:{duration:30,weak:.08},run:{duration:40,weak:.16,strong:.04},rough:{duration:45,weak:.2,strong:.06},
 heartbeat:{duration:70,strong:.22},
 swing:{duration:60,weak:.3},strike:{duration:90,strong:.35,weak:.4},
 confirm:{duration:110,strong:.2,weak:.35},pickup:{duration:70,weak:.3},
 bump:{duration:120,strong:.5,weak:.2},rattle:{duration:220,strong:.3,weak:.5},
 spotted:{duration:260,strong:.55,weak:.3},near:{duration:200,strong:.6,weak:.5},
 capture:{duration:650,strong:1,weak:.8},victory:{duration:420,strong:.3,weak:.6},
 scare:{duration:180,strong:.35,weak:.45},
};
export const NEAR_MISS_DISTANCE=12,NEAR_MISS_REARM=20;
export function createNightFeel({rumbleStrength=()=>.5,clock=()=>performance.now(),pad=firstPad}={}){
 const rumble=createRumble({strength:rumbleStrength,clock});
 let beatAt=-1e9,beatStrength=0,flashAt=-1e9,flashPeak=0,slowUntil=0,armed=true,activations=null,nearMisses=0,events=0,live=false,fov=0,lastAt=0;
 const out={tension:0,pulse:0,flash:0,flashColor:0xffe8d0,grain:true};
 function event(kind,scale=1){
  const e=RUMBLES[kind];if(!e||!live)return false;events++;
  return rumble.pulse(pad(),{duration:e.duration,strong:(e.strong||0)*scale,weak:(e.weak||0)*scale,kind});
 }
 function nearMiss(level,{reduced=false,flashes=true}={}){
  const now=clock();nearMisses++;event('near',level);
  if(reduced)return;
  if(flashes){flashAt=now;flashPeak=.14*level;}
  slowUntil=now+200;
 }
 return {
  event,
  heartbeat(strength){beatAt=clock();beatStrength=Math.max(0,Math.min(1,strength));if(beatStrength>.5)event('heartbeat',beatStrength);},
  // One call per drawn play frame. distance is in course units (the same
  // units the round's own close-call rule uses).
  frame({distance=Infinity,chase=false,pressure=0,activations:count=0,reduced=false,flashes=true,grain=true,paused=false,play=true,sprint=false}={}){
   const now=clock();live=play&&!paused;
   out.grain=grain;
   // Same shape as the round's own heartbeat rule: Joe's distance, a chase, or the director's pressure.
   out.tension=live?Math.max(0,Math.min(1,Math.max(1-distance/40+(chase?.3:0),pressure*.5))):0;
   if(!live){out.pulse=out.flash=0;lastAt=0;return out;}
   // Sprinting opens the view a few degrees; eased, and never with Reduced motion.
   {const dt=lastAt?Math.min(.1,(now-lastAt)/1000):0;lastAt=now;fov+=((sprint&&!reduced?3.5:0)-fov)*Math.min(1,dt*5);if(Math.abs(fov)<.02&&!sprint)fov=0;}
   if(activations!==null&&count>activations)nearMiss(1,{reduced,flashes});
   activations=count;
   if(chase&&distance<NEAR_MISS_DISTANCE){if(armed){armed=false;nearMiss(.7,{reduced,flashes});}}
   else if(!chase||distance>NEAR_MISS_REARM)armed=true;
   // Lub-dub: two decaying thumps 180 ms apart, only once the pulse is strong.
   const t=now-beatAt,drive=Math.max(0,(beatStrength-.45)/.55);
   out.pulse=reduced||t>600?0:drive*.6*(Math.exp(-t/90)+(t>180?.7*Math.exp(-(t-180)/80):0));
   const f=now-flashAt;out.flash=reduced||!flashes||f>240?0:flashPeak*Math.pow(1-f/240,2);
   // Joe's mower through the pad as he closes.
   if(distance<16)rumble.hum(pad(),(1-distance/16)*(chase?1:.55),{strong:.45,weak:.25});
   return out;
  },
  // Real-time loop only: 1 normally, briefly lower after a near miss.
  fovKick(){return fov;},
  timeScale(){return clock()<slowUntil?.6:1;},
  reset(){fov=0;lastAt=0;activations=null;armed=true;beatAt=flashAt=-1e9;slowUntil=0;},
  stats(){return {events,nearMisses,rumble:{...rumble.stats},pulse:out.pulse,flash:out.flash,tension:out.tension,fov,slow:clock()<slowUntil};},
 };
}
