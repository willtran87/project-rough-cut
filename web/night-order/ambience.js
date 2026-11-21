// Night Order pond chorus: a few synthesised frogs on the pond banks, heard
// only near the water, panned to the pond, and falling silent for a while when
// something heavy or fast comes close. Flavour only (the same standing as
// atmospheric-audio.js): no samples, at most three short voices, one bus into
// the chapter's ambience category. Never read by the round.
import {ATMOSPHERE_SITES,atmosphereSpatial} from '../atmospheric-audio.js?v=20261112-regional-sound';

const PONDS=ATMOSPHERE_SITES.filter(s=>s.kind==='pond');
export function createPondChorus({random=Math.random}={}){
 let context=null,bus=null,next=0,hushedUntil=0,voices=0,croaks=0,lastLevel=0;
 function connect(ctx,destination){
  if(context===ctx||!ctx||!destination)return;
  context=ctx;bus=ctx.createGain();bus.gain.value=1;bus.connect(destination);next=0;
 }
 // One "ribbit": a buzzy low tone gated into two or three quick pulses.
 function croak(at,pan,level,pitch,pulses){
  const osc=context.createOscillator(),filter=context.createBiquadFilter(),gain=context.createGain(),panner=context.createStereoPanner?.();
  osc.type='sawtooth';osc.frequency.setValueAtTime(pitch,at);osc.frequency.linearRampToValueAtTime(pitch*1.18,at+.09*pulses);
  filter.type='bandpass';filter.frequency.value=pitch*7;filter.Q.value=5;
  gain.gain.setValueAtTime(0,at);
  for(let i=0;i<pulses;i++){const t=at+i*.085;gain.gain.linearRampToValueAtTime(level,t+.012);gain.gain.linearRampToValueAtTime(level*.15,t+.05);gain.gain.linearRampToValueAtTime(0,t+.075);}
  osc.connect(filter);filter.connect(gain);
  if(panner){panner.pan.value=pan;gain.connect(panner);panner.connect(bus);}else gain.connect(bus);
  voices++;croaks++;osc.onended=()=>{voices--;try{gain.disconnect();panner?.disconnect();}catch{}};
  osc.start(at);osc.stop(at+.085*pulses+.05);
 }
 return {
  connect,
  // player: {x,z,yaw} in metres (scene coordinates). disturbed: Joe is close or
  // the player is sprinting; the frogs stop and wait before starting again.
  update({player,active=true,disturbed=false}={}){
   if(!context||!bus||!player)return;
   const now=context.currentTime;
   if(disturbed)hushedUntil=now+6+random()*4;
   let best=null;for(const pond of PONDS){const s=atmosphereSpatial(player,{...pond,radius:pond.radius+6});if(!best||s.level>best.level)best=s;}
   lastLevel=best?.level||0;
   if(!active||!best||best.level<=.02||now<hushedUntil){next=Math.max(next,now+.6);return;}
   if(now<next||voices>=3)return;
   // Calls come in loose pairs: one frog, then often an answer.
   const level=.02*Math.min(1,best.level*1.6),pitch=92+random()*46;
   croak(now+.02,best.pan+(random()-.5)*.3,level,pitch,random()>.5?3:2);
   if(random()>.45)croak(now+.42+random()*.3,Math.max(-1,Math.min(1,best.pan+(random()-.5)*.6)),level*.7,pitch*(1.12+random()*.2),2);
   next=now+1.6+random()*3.8;
  },
  stats(){return {croaks,voices,level:+lastLevel.toFixed(3),hushed:!!context&&context.currentTime<hushedUntil};},
 };
}
