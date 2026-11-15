import {cloudDelay} from './chase-variation.js';
import {encounterQuiet,encounterAllows} from './chase-encounter.js';
const clamp=v=>Math.max(0,Math.min(1,v));
// Shared visual/audio envelopes, using simulation time and the real pursuit.
// No particles, new lights, scheduled timers or sound-node allocation.
export function createChaseAtmosphere(){
 let lastRun=null,lastTime=0,dread=0,lastSegment=-1,delay=0;
 const out={dread:0,storm:0,shadow:0,ambientGain:1,rumble:0};
 return {update(run){
  if(lastRun!==run){lastRun=run;lastTime=run.time;dread=0;lastSegment=-1;}
  if(lastSegment!==run.checkpoint){lastSegment=run.checkpoint;delay=cloudDelay(run);}
  const dt=Math.max(0,Math.min(.1,run.time-lastTime));lastTime=run.time;
  const c=run.foot||run.cart,j=run.joe,gap=Math.hypot(c.x-j.x,c.y-j.y),active=['driving','paused'].includes(run.mode)&&!run.death;
  const relief=encounterQuiet(run)||run.grace>0||c.invulnerable>0||run.decoys?.active>=0||['backoff','missed'].includes(j.ram?.phase)||['opening','gather'].includes(run.pressure?.phase)||run.tension?.phase==='breather';
  const nearby=active&&!relief&&j.seenAge<3?clamp((56-gap)/42):0;
  dread+=(nearby-dread)*(1-Math.exp(-dt*(nearby>dread?2.4:4)));
  if(!active)dread=0;
  const elapsed=run.time-(run.variation?.seed?run.variation.segmentAt:0),start=18+delay;
  const age=Math.max(0,elapsed-start),cycle=Math.floor(age/47),phase=age%47,duration=cycle%2?15:12;
  const storm=active&&encounterAllows(run,'omen')&&elapsed>=start&&phase<duration?Math.sin(Math.PI*phase/duration)**2:0;
  out.dread=dread;out.storm=storm;out.shadow=storm*.10+dread*.08;
  out.ambientGain=1-dread*.5;out.rumble=storm*(relief?.35:1)*(1-dread*.6);
  return out;
 },stats:()=>out};
}
