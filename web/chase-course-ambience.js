import {COURSE} from './back-nine-course.js';
import {chaseActor} from './chase-player.js';
import {listenerYaw} from './runner-look.js';

// Sources coincide with existing authored cabinets, shelter chargers and the
// garage circuit. One near-field voice is sufficient: their ranges do not
// overlap. Nothing here changes Joe's hearing or reveals his hidden intentions.
export const COURSE_SOUND_SOURCES=Object.freeze([
 ...COURSE.machinery.map((p,i)=>Object.freeze({id:'pump-'+i,kind:'pump',x:p.x,y:p.y,range:22,hz:[82.4,87.3,73.4,98][i%4]})),
 ...COURSE.checkpoints.map((p,i)=>Object.freeze({id:'shelter-'+i,kind:'charger',x:p.x+3.7,y:p.y+3.84,range:20,relay:i,hz:60})),
 Object.freeze({id:'garage',kind:'garage',x:-28.43,y:799.42,range:24,hz:110})
]);
const cover=COURSE.obstacles.filter(o=>o.box&&['windbreak','clubhouse','garage','trailer','cistern'].includes(o.kind));
const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
function crossesBox(a,b,o){
 let enter=0,leave=1;
 for(const axis of ['x','y']){
  const d=b[axis]-a[axis],r=axis==='x'?o.rx:o.ry,offset=a[axis]-o[axis];
  if(Math.abs(d)<1e-9){if(Math.abs(offset)>=r)return false;continue;}
  const t1=(-r-offset)/d,t2=(r-offset)/d;
  enter=Math.max(enter,Math.min(t1,t2));leave=Math.min(leave,Math.max(t1,t2));
  if(leave<=enter)return false;
 }
 return leave>0&&enter<1;
}
export function courseAmbiencePlacement(run,out={}){
 out.id='';out.kind='';out.mix=0;out.pan=0;out.distance=0;out.occluded=false;out.hz=60;out.cutoff=320;out.level=0;out.side='';
 if(run.mode!=='driving'||run.death||run.finishHold>0)return out;
 const actor=chaseActor(run),j=run.joe,ram=j.ram,owner=run.encounter?.owner;
 // Optional environmental detail must leave the attack/reveal audible.
 if(['attack','intercept','gather','tension','finale'].includes(owner)||ram?.phase==='lineup'||ram?.footCharge>0||ram?.release>0||run.panic?.phase==='reveal')return out;
 const safety=smooth((Math.hypot(j.x-actor.x,j.y-actor.y)-12)/18);
 if(!safety)return out;
 let selected=null,best=0,range=0;
 for(const s of COURSE_SOUND_SOURCES){
  if(s.kind==='garage'&&run.checkpoint<2)continue;
  const d=Math.hypot(s.x-actor.x,s.y-actor.y),weight=smooth(1-d/s.range)*safety;
  if(weight>best){selected=s;best=weight;range=d;}
 }
 if(!selected)return out;
 const muffled=cover.some(o=>crossesBox(actor,selected,o)),phase=run.time+selected.y*.173;
 out.id=selected.id;out.kind=selected.kind;out.distance=range;out.occluded=muffled;out.mix=best*(muffled?.4:1);
 out.pan=Math.sin(Math.atan2(selected.x-actor.x,selected.y-actor.y)-listenerYaw(run))*.85*out.mix;
 out.side=Math.abs(out.pan)>.25?(out.pan<0?'to your left':'to your right'):'';
 out.hz=selected.kind==='charger'&&run.checkpoint>selected.relay?110:selected.hz;
 out.cutoff=muffled?145:selected.kind==='pump'?240:380;
 out.level=(selected.kind==='pump'?.065*(.78+.22*Math.sin(phase*2.1)**2):.055*(.94+.06*Math.sin(phase*3.1)))*out.mix;
 return out;
}
export function courseAmbienceCaption(run,placement=courseAmbiencePlacement(run)){
 if(placement.mix<.22)return '';
 const name=placement.kind==='pump'?'Irrigation pump throbs':placement.kind==='garage'?'Garage electrical hum':'Shelter charger hums';
 const where=[placement.side,placement.occluded?'muffled beyond cover':''].filter(Boolean).join(' · ');
 return `[${name}${where?' · '+where:''}]`;
}

// Reuse the existing ambience oscillator and filter. One persistent panner,
// no new voices, buffers, timers, per-event nodes or geometry.
export function createCourseAmbienceAudio(ctx,voice,bus){
 const pan=ctx.createStereoPanner(),placement={};
 // Explicit stereo upmix preserves the old centered mono drone at pan zero.
 pan.channelCount=2;pan.channelCountMode='explicit';voice.level.connect(pan);pan.connect(bus);
 function reset(){if(!placement.id&&!placement.mix)return;voice.osc.frequency.setTargetAtTime(43.65,ctx.currentTime,.08);Object.assign(placement,{id:'',kind:'',mix:0,pan:0,level:0});pan.pan.setTargetAtTime(0,ctx.currentTime,.06);voice.filter.frequency.setTargetAtTime(320,ctx.currentTime,.08);}
 return {
  update(run,running,baseGain,baseHz){
   courseAmbiencePlacement(run,placement);if(!running){placement.id='';placement.mix=0;placement.pan=0;placement.level=0;}
   const now=ctx.currentTime,blend=placement.mix;
   voice.level.gain.setTargetAtTime(running?baseGain*(1-blend)+placement.level:0,now,blend?.18:.3);
   voice.osc.frequency.setTargetAtTime(baseHz+(placement.hz-baseHz)*blend,now,blend?.25:.3);
   voice.filter.frequency.setTargetAtTime(320+(placement.cutoff-320)*blend,now,.15);
   pan.pan.setTargetAtTime(placement.pan,now,.12);
  },reset,stats:()=>({...placement})
 };
}
