// Exclusive death mix on existing voices. No samples, nodes or timers added.
const cues=[
 {at:0,hz:620,body:1.05,noise:.48,duration:.29},
 {at:.66,hz:340,body:.64,noise:.24,duration:.42},
];
export function createRunoverAudio(ctx,v){
 let death=null,lastCue=-1,wasRunning=false,impacts=0,landings=0,phase='none';
 const voices=[v.cart,v.mower,v.blade,v.drone,v.harmonic,v.pulse,v.wind,v.thump,v.crash];
 function silence(){const now=ctx.currentTime;for(const voice of voices){voice.level.gain.cancelScheduledValues(now);voice.level.gain.setTargetAtTime(0,now,.008);}}
 function release(){if(death){silence();death=null;lastCue=-1;phase='none';wasRunning=false;}}
 function update(run,running){
  const d=run.death,now=ctx.currentTime,age=d.age;
  if(death!==d){silence();death=d;lastCue=-1;}
  if(!running&&wasRunning)silence();wasRunning=running;
  phase=age<.25?'impact':age<.75?'fall':age<1.65?'overrun':'aftermath';
  for(let i=0;i<cues.length;i++){const cue=cues[i];if(i<=lastCue||age<cue.at)continue;lastCue=i;
   // Consume stale/muted cues; never replay the collision after unmuting.
   if(!running||age-cue.at>.18)continue;
   if(i===0)impacts++;else landings++;
   v.impactPan.pan.setValueAtTime(0,now);
   const f=v.thump.osc.frequency;f.cancelScheduledValues(now);f.setValueAtTime(i?68:118,now);f.exponentialRampToValueAtTime(30,now+cue.duration);
   v.crash.filter.frequency.cancelScheduledValues(now);v.crash.filter.Q.cancelScheduledValues(now);v.crash.filter.frequency.setValueAtTime(cue.hz,now);v.crash.filter.frequency.exponentialRampToValueAtTime(160,now+cue.duration);v.crash.filter.Q.setValueAtTime(.65,now);
   for(const [voice,gain]of [[v.thump,cue.body],[v.crash,cue.noise]]){const p=voice.level.gain;p.cancelScheduledValues(now);p.setValueAtTime(.0001,now);p.linearRampToValueAtTime(gain,now+.005);p.exponentialRampToValueAtTime(.0001,now+cue.duration);p.setValueAtTime(0,now+cue.duration+.02);}
  }
  if(!running)return;
  const pass=Math.max(0,1-Math.abs(age-.85)/.85),tail=Math.max(0,1-(age-1.5)/.9),moving=Math.min(1,Math.abs(run.joe.speed)/4.6);
  const bearing=Math.atan2(run.joe.x-d.x,run.joe.y-d.y)-d.yaw;
  v.pan.pan.setTargetAtTime(Math.sin(bearing)*.8,now,.08);
  v.mower.osc.frequency.setTargetAtTime(35+moving*14+pass*22,now,.06);
  v.mower.filter.frequency.setTargetAtTime(180+pass*440,now,.06);
  v.mower.level.gain.setTargetAtTime((.22+pass*.34)*tail,now,.035);
  v.blade.osc.frequency.setTargetAtTime(140+pass*110,now,.04);
  v.blade.filter.frequency.setTargetAtTime(250+pass*450,now,.05);
  v.blade.level.gain.setTargetAtTime((.035+pass*.11*moving)*tail,now,.04);
  // Soft filtered breath and a restrained ringing tail after the landing.
  const breath=Math.max(0,1-Math.abs(age-.34)/.28),ring=Math.max(0,Math.min(1,(age-.72)/.25))*tail;
  v.wind.filter.frequency.setTargetAtTime(480,now,.04);v.wind.level.gain.setTargetAtTime(breath*.2,now,.025);
  v.harmonic.filter.frequency.setTargetAtTime(1500,now,.07);v.harmonic.osc.frequency.setTargetAtTime(910-age*38,now,.07);v.harmonic.level.gain.setTargetAtTime(ring*.027,now,.06);
  v.drone.level.gain.setTargetAtTime(.045*tail,now,.08);
 }
 return {update,release,stats:()=>({phase,impacts,landings})};
}
