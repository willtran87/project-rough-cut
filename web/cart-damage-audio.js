import {cartMechanics} from './cart-mechanics.js';
import {listenerYaw} from './runner-look.js';
// Reuses the cart oscillator and the existing impact pair. No new sources,
// buffers, timers, downloads or audio nodes are created by a collision.
const clamp=v=>Math.max(0,Math.min(1,v));
const collapse=[
 {at:.16,hz:760,q:3.8,gain:.48,duration:.56,body:.12}, // supports buckle
 {at:.93,hz:560,q:2.2,gain:.57,duration:.29,body:.34}, // hood drops
 {at:1.34,hz:1920,q:4.2,gain:.34,duration:.24,body:.12}, // cover/bumper settle
 {at:1.65,hz:390,q:1.1,gain:.21,duration:.25,body:.22}, // wheel and last clunk
];
export function createCartDamageAudio(ctx,{cart,crash,thump,impactPan}){
 let lastRun=null,lastCycle=-1,lastCue=-1,seenFailure=false,wasRunning=false,fallbackFailure=null,landed=false;
 let crunches=0,rattles=0,failures=0,collapseCues=0,ejectionLandings=0,rattleLevel=0,engineFailure=0,phase='intact';
 function silence(now){for(const v of [crash,thump]){v.level.gain.cancelScheduledValues(now);v.level.gain.setTargetAtTime(0,now,.008);}}
 function begin(run,running){
  if(run!==lastRun){lastRun=run;lastCycle=Math.floor((run.distance||0)/3.2);lastCue=-1;seenFailure=false;fallbackFailure=null;landed=false;silence(ctx.currentTime);}
  if(!running&&wasRunning)silence(ctx.currentTime);
  wasRunning=running;rattleLevel=0;engineFailure=0;
  if(run.cart.health<=0){fallbackFailure??=run.time;if(!seenFailure){seenFailure=true;if(running&&run.time-(run.cart.failedAt??fallbackFailure)<.25)failures++;}}
 }
 function ownsStrike(run){return run.cart.health<=0&&run.time-(run.cart.failedAt??fallbackFailure)<1.95||run.impact?.damaged&&run.impact.age<.65;}
 function panToCart(run,now){const p=run.foot||run.cart,c=run.cart,range=Math.hypot(c.x-p.x,c.y-p.y);
  impactPan.pan.setValueAtTime(Math.sin(Math.atan2(c.x-p.x,c.y-p.y)-listenerYaw(run))*.8,now);return 1/(1+(range/10)**2);
 }
 function crunch(power,health){
  crunches++;const now=ctx.currentTime,d=1-clamp((health??100)/100),gain=.4+power*.48+d*.12,p=crash.level.gain;
  crash.filter.frequency.cancelScheduledValues(now);crash.filter.Q.cancelScheduledValues(now);
  crash.filter.frequency.setValueAtTime(2050+d*430,now);crash.filter.frequency.exponentialRampToValueAtTime(430+d*120,now+.39);crash.filter.Q.setValueAtTime(2.4+d,now);
  // Several compression/shear pulses, rather than one white-noise burst.
  p.cancelScheduledValues(now);p.setValueAtTime(.0001,now);p.linearRampToValueAtTime(gain,now+.004);p.exponentialRampToValueAtTime(gain*.18,now+.035);p.linearRampToValueAtTime(gain*.72,now+.057);p.exponentialRampToValueAtTime(gain*.07,now+.15);p.linearRampToValueAtTime(gain*.28,now+.19);p.exponentialRampToValueAtTime(gain*.015,now+.29);p.linearRampToValueAtTime(gain*.12,now+.32);p.exponentialRampToValueAtTime(gain*.009,now+.39);p.linearRampToValueAtTime(gain*.06,now+.43);p.exponentialRampToValueAtTime(.0001,now+.6);p.setValueAtTime(0,now+.62);
 }
 function strike(cue,gain,now){
  const p=crash.level.gain,f=crash.filter.frequency;
  f.cancelScheduledValues(now);crash.filter.Q.cancelScheduledValues(now);f.setValueAtTime(cue.hz,now);f.exponentialRampToValueAtTime(cue.hz*.58,now+cue.duration);crash.filter.Q.setValueAtTime(cue.q,now);
  p.cancelScheduledValues(now);p.setValueAtTime(.0001,now);p.linearRampToValueAtTime(cue.gain*gain,now+.006);p.exponentialRampToValueAtTime(.0001,now+cue.duration);p.setValueAtTime(0,now+cue.duration+.01);
  if(cue.body){const f=thump.osc.frequency,g=thump.level.gain;f.cancelScheduledValues(now);f.setValueAtTime(78,now);f.exponentialRampToValueAtTime(32,now+.18);g.cancelScheduledValues(now);g.setValueAtTime(.0001,now);g.linearRampToValueAtTime(cue.body*gain,now+.005);g.exponentialRampToValueAtTime(.0001,now+.24);g.setValueAtTime(0,now+.26);}
 }
 const loose={hz:2100,q:5,gain:.12,duration:.085,body:0};
 const mechanicalScratch={};
 function update(run,running,allowRattle,mechanics=cartMechanics(run,mechanicalScratch)){
  const now=ctx.currentTime,c=run.cart,d=1-clamp((c.health??100)/100),failed=c.health<=0,age=failed?Math.max(0,run.time-(c.failedAt??fallbackFailure)):-1,cycle=mechanics.rattleCycle;
  phase=failed?(age<.82?'engine-failure':age<1.95?'falling-apart':'silent-wreck'):c.health<45?'loose-panels':d>0?'dented':'intact';
  if(failed){
   const ejection=run.foot?.ejection,landingAge=ejection?run.time-ejection.at:-1;
   if(!landed&&landingAge>=.64){
    landed=true;
    // The boots catch the ground between the support buckle and hood drop.
    // Use only the existing body voice, leaving metal decay uninterrupted.
    if(running&&run.mode==='driving'&&landingAge<.82){
     ejectionLandings++;const f=thump.osc.frequency,g=thump.level.gain;
     impactPan.pan.setValueAtTime(0,now);f.cancelScheduledValues(now);f.setValueAtTime(96,now);f.exponentialRampToValueAtTime(42,now+.11);
     g.cancelScheduledValues(now);g.setValueAtTime(.0001,now);g.linearRampToValueAtTime(.18+.12*clamp((ejection.incomingSpeed||0)/14),now+.005);g.exponentialRampToValueAtTime(.0001,now+.16);g.setValueAtTime(0,now+.18);
    }
   }
   for(let i=0;i<collapse.length;i++){const cue=collapse[i];if(i<=lastCue||age<cue.at)continue;lastCue=i;
    // Consume missed/muted cues without stacking stale clanks on resume.
    if(running&&age-cue.at<.18&&run.mode==='driving'){collapseCues++;strike(cue,panToCart(run,now),now);}
   }
   if(age<.82){const fall=clamp(age/.82),sputter=(age<.16||age>.3&&age<.44||age>.54&&age<.64)?1:.08;
    engineFailure=running?(1-fall)*sputter:0;
    cart.osc.frequency.setTargetAtTime(24+84*(1-fall)**2+Math.sin(age*83)*4*(1-fall),now,.012);
    cart.filter.frequency.setTargetAtTime(110+520*(1-fall),now,.018);cart.level.gain.setTargetAtTime(engineFailure*.48,now,.008);
   }else if(!run.foot)cart.level.gain.setTargetAtTime(0,now,.008);
  }else if(running&&c.health<45&&Math.abs(c.speed)>.5&&allowRattle&&cycle!==lastCycle&&cycle%5!==2){
   // The cover reaches its latch once per travel cycle. Interrupted/muted
   // cycles are consumed; no clanks while spinning against an obstacle.
   rattles++;rattleLevel=clamp(mechanics.rattleGain);loose.hz=1850+(cycle%7)*137;loose.gain=.055+rattleLevel*.16;strike(loose,1,now);
  }
  lastCycle=cycle;
 }
 return {begin,ownsStrike,crunch,update,release(){crash.filter.frequency.cancelScheduledValues(ctx.currentTime);crash.filter.Q.cancelScheduledValues(ctx.currentTime);},stats:()=>({crunches,rattles,failures,collapseCues,ejectionLandings,rattleLevel,engineFailure,phase})};
}
