import {COURSE} from './back-nine-course.js';

// Four quiet layers added by the polish pass, all synthesised and all routed
// through the existing category buses:
//   tyres    rolling noise whose colour follows the surface under the cart
//   rain     the drizzle that is already drawn, as a thin steady hiss
//   breath   the runner's breathing on foot, quickening with pace and fear
//   frogs    croaks from the flooded hollows and reservoirs, placed in stereo;
//            they stop while the mower is close
// One shared noise buffer, three filter chains and one oscillator: nothing is
// allocated after start. Decorative only: none of these cues carries
// information the captions do not already give.
const TYRES={path:[1050,.5,.03],rough:[250,.9,.075],sand:[520,.35,.06],wet:[2300,.6,.07]};
// Flooded hollows plus the two reservoirs (COURSE_RESERVOIRS in the landscape).
const WATER=[...COURSE.wet.map(w=>({x:w.x,y:w.y})),{x:59,y:232},{x:59,y:474}];
const hash=n=>{const s=Math.sin(n*91.7+17.3)*43758.5453;return s-Math.floor(s);};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
// Pure placement rule, exported for checks.
export function frogPlacement(actor,joe,yaw){
 let best=null,range=Infinity;
 for(const w of WATER){const d=Math.hypot(w.x-actor.x,w.y-actor.y);if(d<range){range=d;best=w;}}
 if(!best||range>60)return {gain:0,pan:0,range};
 const scared=clamp((Math.hypot(best.x-joe.x,best.y-joe.y)-14)/14),near=clamp((60-range)/38);
 return {gain:near*scared,pan:clamp(Math.sin(Math.atan2(best.x-actor.x,best.y-actor.y)-yaw),-1,1)*.75,range};
}
export const tyreVoice=(surface,speed)=>{const t=TYRES[surface]||TYRES.path,v=clamp(Math.abs(speed)/11);return {hz:t[0]*(.8+.35*v),q:t[1],gain:t[2]*Math.sqrt(v)};};

export function createBackNineAirAudio(ctx,{effects,ambience}){
 const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);let seed=4273;
 for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;data[i]=(seed>>>0)/2147483648-1;}
 const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;
 const chain=(type,hz,q,to)=>{const filter=ctx.createBiquadFilter(),level=ctx.createGain();filter.type=type;filter.frequency.value=hz;filter.Q.value=q;level.gain.value=0;source.connect(filter);filter.connect(level);level.connect(to);return {filter,level};};
 const tyres=chain('bandpass',900,.6,effects),rain=chain('highpass',3600,.4,ambience),breath=chain('bandpass',900,1.4,effects);
 const frog=ctx.createOscillator(),frogLevel=ctx.createGain(),frogPan=ctx.createStereoPanner();frog.type='triangle';frog.frequency.value=470;frogLevel.gain.value=0;frog.connect(frogLevel);frogLevel.connect(frogPan);frogPan.connect(ambience);
 source.start();frog.start();
 let owner=null,nextCroak=0,croaks=0,breathPhase=0,last=null,tyreGain=0,breathGain=0,rainGain=0;
 function update(run,running,{fear=0,ears=0}={}){
  const now=ctx.currentTime,c=run.foot||run.cart,dt=last===null?0:clamp(run.time-last,0,.1);last=run.time;
  if(owner!==run){owner=run;nextCroak=(run.time||0)+2;breathPhase=0;}
  const playing=running&&run.mode==='driving'&&!run.death,outdoors=c.y<800;
  // Tyres.
  const rolling=playing&&!run.foot&&(run.cart.health??100)>0,voice=tyreVoice(c.surface,rolling?c.speed:0);tyreGain=rolling?voice.gain:0;
  tyres.filter.frequency.setTargetAtTime(voice.hz,now,.08);tyres.filter.Q.setTargetAtTime(voice.q,now,.1);tyres.level.gain.setTargetAtTime(tyreGain,now,.07);
  // Rain: quieter under the garage roof and under the chase at its loudest.
  rainGain=running&&run.mode!=='caught'?.016*(outdoors?1:.35)*(1-.4*clamp(fear)):0;rain.level.gain.setTargetAtTime(rainGain,now,.4);
  // Breath: in on the first 42% of the cycle (brighter), out on the rest.
  const footAge=run.foot?.ejection?run.time-run.foot.ejection.at:99,panting=playing&&!!run.foot&&footAge>1.3,effort=clamp(Math.abs(c.speed||0)/7)*.6+clamp(fear)*.4;
  if(panting){breathPhase=(breathPhase+dt*(.55+effort*.95))%1;const inhale=breathPhase<.42,t=inhale?breathPhase/.42:(breathPhase-.42)/.58,shape=Math.sin(t*Math.PI);
   breathGain=(.012+.03*effort)*shape*(inhale?.75:1);breath.filter.frequency.setTargetAtTime(inhale?1500:820,now,.03);breath.level.gain.setTargetAtTime(breathGain,now,.03);}
  else if(breathGain!==0){breathGain=0;breath.level.gain.setTargetAtTime(0,now,.08);}
  // Frogs: three short pulses per croak, at uneven intervals.
  if(playing&&run.time>=nextCroak){
   const n=Math.floor(run.time*7.3)+croaks*13,place=frogPlacement(c,run.joe,ears);nextCroak=run.time+1.6+hash(n)*3.4;
   if(place.gain>.02){croaks++;const g=.05*place.gain,hz=410+hash(n+.4)*130;frogPan.pan.setValueAtTime(place.pan,now);frog.frequency.cancelScheduledValues(now);frogLevel.gain.cancelScheduledValues(now);
    for(let k=0;k<3;k++){const t=now+k*.105;frog.frequency.setValueAtTime(hz*1.12,t);frog.frequency.exponentialRampToValueAtTime(hz*.86,t+.08);frogLevel.gain.setValueAtTime(.0001,t);frogLevel.gain.linearRampToValueAtTime(g,t+.012);frogLevel.gain.exponentialRampToValueAtTime(.0001,t+.085);}
    frogLevel.gain.setValueAtTime(0,now+.34);}
  }
 }
 function silence(){const now=ctx.currentTime;for(const v of [tyres,rain,breath])v.level.gain.setTargetAtTime(0,now,.05);frogLevel.gain.cancelScheduledValues(now);frogLevel.gain.setValueAtTime(0,now);tyreGain=breathGain=rainGain=0;}
 return {update,silence,stats:()=>({tyres:tyreGain,rain:rainGain,breath:breathGain,croaks,water:WATER.length,voices:2})};
}
