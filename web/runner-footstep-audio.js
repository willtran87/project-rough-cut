import {runnerSurfaceAt} from './back-nine-course.js';

const surfaces={
 path:{hz:116,end:48,cutoff:620,gain:.19,duration:.105},
 rough:{hz:79,end:36,cutoff:230,gain:.13,duration:.075},
 wet:{hz:94,end:32,cutoff:430,gain:.16,duration:.13},
 sand:{hz:66,end:31,cutoff:165,gain:.105,duration:.085},
};

// The cart oscillator is no longer an engine after its failure tail. Reuse it
// for short, surface-specific boot contacts; the danger/metal voices stay free.
export function createRunnerFootstepAudio(ctx,cart){
 let owner=null,seen=0,owns=false,enabled=false,played=0,dropped=0,last=null;
 function silence(){const now=ctx.currentTime;cart.level.gain.cancelScheduledValues(now);cart.level.gain.setTargetAtTime(0,now,.008);}
 function begin(run,running){
  const foot=run.foot,age=foot?.ejection?run.time-foot.ejection.at:99;
  const available=!!foot&&age>=.82&&!run.death;
  if(foot!==owner){owner=foot;seen=0;last=null;if(owns)silence();}
  if(owns&&!available){silence();cart.osc.frequency.cancelScheduledValues(ctx.currentTime);cart.filter.frequency.cancelScheduledValues(ctx.currentTime);cart.filter.Q.setValueAtTime(1,ctx.currentTime);}
  if(available&&!owns)silence();
  const next=available&&running&&run.mode==='driving';
  if(owns&&enabled&&!next)silence();
  owns=available;enabled=next;
 }
 function present(run,events,running){
  begin(run,running);
  for(const e of events){
   if(e.owner!==run.foot||e.serial<=seen)continue;
   seen=e.serial;
   const age=run.time-e.time,ejectionAge=run.foot?.ejection?run.time-run.foot.ejection.at:99;
   // A late frame, pause, mute or retry consumes its contact without replay.
   if(!enabled||age<-.001||age>.18||ejectionAge<1.18){dropped++;continue;}
   const surface=runnerSurfaceAt(e,run),sound=surfaces[surface],now=ctx.currentTime;
   const force=e.phase==='turn'?.32:Math.min(1,.58+(run.foot.speed||0)/16);
   const variation=e.foot?1.035:.965,gain=sound.gain*force,g=cart.level.gain,f=cart.osc.frequency;
   f.cancelScheduledValues(now);f.setValueAtTime(sound.hz*variation,now);f.exponentialRampToValueAtTime(sound.end,now+sound.duration);
   cart.filter.frequency.cancelScheduledValues(now);cart.filter.frequency.setValueAtTime(sound.cutoff,now);cart.filter.Q.setValueAtTime(.65,now);
   g.cancelScheduledValues(now);g.setValueAtTime(.0001,now);g.linearRampToValueAtTime(gain,now+.004);
   if(surface==='wet'){g.exponentialRampToValueAtTime(gain*.15,now+.025);g.linearRampToValueAtTime(gain*.32,now+.043);}
   g.exponentialRampToValueAtTime(.0001,now+sound.duration);g.setValueAtTime(0,now+sound.duration+.01);
   played++;last={serial:e.serial,time:e.time,foot:e.foot,phase:e.phase,surface,height:e.height,age};
  }
 }
 return {begin,present,stats:()=>({played,dropped,ownsVoice:owns,last})};
}
