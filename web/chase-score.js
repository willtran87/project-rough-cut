import {encounterQuiet} from './chase-encounter.js';
const clamp=v=>Math.max(0,Math.min(1,v));
const MIX_KEYS=['steps','bass','pulse','upper','bow'];
const arrangements={
 departure:{tempo:62,steps:.5,bass:.45,pulse:0,upper:.12,bow:.2,notes:[0,0,7,6]},
 pursuit:{tempo:108,steps:2,bass:1,pulse:1,upper:1,bow:1,notes:[0,0,7,0,3,0,7,6,0,0,7,10,3,1,7,6]},
 escalation:{tempo:118,steps:2,bass:1,pulse:1.1,upper:1.15,bow:1,notes:[0,7,0,1,3,0,7,6,0,7,10,7,3,1,7,6]},
 flight:{tempo:130,steps:2,bass:.85,pulse:1.2,upper:1.25,bow:.65,notes:[0,0,1,0,7,6,0,1,0,0,3,1,7,6,1,0]},
 finale:{tempo:124,steps:2,bass:1.1,pulse:1,upper:.8,bow:1.3,notes:[0,7,6,3,0,7,6,1,0,3,1,0,6,3,1,0]},
 closing:{tempo:72,steps:1,bass:.7,pulse:.3,upper:.25,bow:.8,notes:[0,0,1,0,7,6,1,0]},
 relief:{tempo:72,steps:.5,bass:.3,pulse:0,upper:0,bow:.15,notes:[0,0,7,0]}
};
export function scoreStage(run){
 const c=run.foot||run.cart;
 if(run.mode==='sealing')return 'closing';
 if(encounterQuiet(run)||run.grace>0||run.pressure?.phase==='opening'||run.tension?.phase==='breather'||['backoff','missed'].includes(run.joe.ram?.phase))return 'relief';
 if(run.encounter?.updated)return run.encounter.stage;
 return run.checkpoint===2&&c.y>700?'finale':run.foot?'flight':run.checkpoint>0||run.cart.health<65?'escalation':run.panic?.serial>0||run.cart.hits>0?'pursuit':'departure';
}
// Five persistent, filtered voices. Simulation-time phrasing survives pauses
// and pressure changes; no audio files, per-note nodes or timer queues.
export function createChaseScore(ctx,destination){
 const voices=['triangle','sawtooth','sawtooth','sine','sawtooth'].map((type,i)=>{
  const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  osc.type=type;osc.frequency.value=55;osc.detune.value=i===2?-9:i===4?7:0;
  filter.type='lowpass';filter.frequency.value=250;filter.Q.value=.6;
  gain.gain.value=0;osc.connect(filter);filter.connect(gain);gain.connect(destination);osc.start();
  return {osc,filter,gain};
 });
 let lastRun=null,lastTime=0,phase=0,level=0,step=-1,playing=false,tempo=62,arrangement='departure',duck=1;
 const mix={steps:.5,bass:.45,pulse:0,upper:.12,bow:.2};
 function silence(){for(const v of voices)v.gain.gain.setTargetAtTime(0,ctx.currentTime,.06);playing=false;}
 function update(run,active,settings={}){
  if(!run){silence();return;}
  if(lastRun!==run){lastRun=run;lastTime=run.time;phase=0;step=-1;level=0;tempo=62;Object.assign(mix,{steps:.5,bass:.45,pulse:0,upper:.12,bow:.2});}
  const dt=Math.max(0,Math.min(.1,run.time-lastTime));lastTime=run.time;
  const actor=run.foot||run.cart,gap=Math.hypot(actor.x-run.joe.x,actor.y-run.joe.y);
  const revealed=!!run.foot||run.panic?.phase==='panic'||run.panic?.serial>0||run.cart.hits>0;
  arrangement=scoreStage(run);const score=arrangements[arrangement]||arrangements.departure,relief=arrangement==='relief';
  // The opening leaves room for the real engine before a sparse four-note
  // phrase appears. Earned silence removes the driving pulse, not world audio.
  const target=revealed?clamp(.25+clamp(1-gap/65)*.4+(run.foot?.25:(1-run.cart.health/100)*.2)+(run.checkpoint===2?.1:0))*(relief?.24:1):run.time>6&&!relief?.12:0;
  level+=(target-level)*(1-Math.exp(-dt*(target>level?1.8:3)));
  const blend=1-Math.exp(-dt*2);for(const key of MIX_KEYS)mix[key]+=(score[key]-mix[key])*blend;
  tempo+=(score.tempo+level*(relief||arrangement==='departure'?0:22)-tempo)*(1-Math.exp(-dt*1.6));if(active)phase+=dt*tempo/60*mix.steps;
  const whole=Math.floor(phase),beat=phase-whole,now=ctx.currentTime;
  if(whole!==step){step=whole;const n=score.notes[whole%score.notes.length],root=55*Math.pow(2,n/12);
   voices[0].osc.frequency.setTargetAtTime(root,now,.012);
   voices[1].osc.frequency.setTargetAtTime(root*4,now,.025);
   // A held, slightly beating minor ninth above the bass across each phrase.
   voices[2].osc.frequency.setTargetAtTime(220*Math.pow(2,(Math.floor(whole/16)%2?1:0)/12),now,.2);
   voices[4].osc.frequency.setTargetAtTime(root*2*Math.pow(2,3/12),now,.03);
  }
  const allowed=active&&!run.death&&['driving','sealing'].includes(run.mode)&&!run.finale?.latched;
  duck=run.experience?.silence.phase==='quiet'?.025:run.experience?.silence.phase==='restart'?.15:run.panic?.phase==='reveal'?.08:run.joe.ram?.phase==='lineup'||run.pressure?.phase==='gather'||['commit_warning','signal'].includes(run.hunt?.phase)?.32:(run.impact?.age??99)<.5?.25:gap<18?.65:1;
  const gain=allowed?level*(settings.musicVolume??.7)*duck:0;
  const pulse=Math.exp(-beat*7),bow=.65+.35*Math.sin(phase*Math.PI*2),downbeat=whole%4===0?Math.exp(-beat*13):0;
  // Low drum accents and bowed minor thirds make the pursuit more forceful.
  // Both still duck beneath Joe's attack cues and fall away in earned relief.
  voices[3].osc.frequency.setTargetAtTime(42+downbeat*58,now,.012);
  const amounts=[gain*(.12*mix.bass+.2*pulse*mix.pulse),gain*level*.12*pulse*mix.upper,gain*Math.max(0,level-.2)*.1*bow*mix.bow,gain*.24*downbeat*mix.pulse,gain*level*.075*pulse*mix.upper];
  for(let i=0;i<voices.length;i++){voices[i].gain.gain.setTargetAtTime(amounts[i],now,allowed?.018:.05);voices[i].filter.frequency.setTargetAtTime(i===3?180:180+i*150+level*(i?1000:230),now,.12);}
  playing=gain>.001;
 }
 return {update,silence,stats:()=>({voices:voices.length,playing,level,tempo,step,phase,arrangement,duck,pulse:mix.pulse}),dispose(){for(const v of voices){v.osc.stop();v.osc.disconnect();v.filter.disconnect();v.gain.disconnect();}}};
}
