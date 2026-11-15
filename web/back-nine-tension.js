import {encounterAllows} from './chase-encounter.js';
import {chaseActor} from './chase-player.js';
import {clamp,distance} from './back-nine-course.js';

// Simulation time owns every cue: pausing, low frame rates and deterministic
// stepping cannot stack scares or advance the director behind a menu.
export function createTension(){return {phase:'opening',age:0,remaining:0,cooldown:7,intensity:0,windup:0,surge:0,motorGain:1,lightDip:0,zoneMask:0,dipTime:0,cue:'',cueTime:0,sting:0,beats:0,lastCheckpoint:0,act:1,silence:0};}
function enter(t,phase,duration){t.phase=phase;t.age=0;t.remaining=duration;}
function cue(t,text){t.cue=text;t.cueTime=3.2;t.sting=1;}
export function updateTension(run,dt,visible){
 const t=run.tension||(run.tension=createTension()),c=chaseActor(run),j=run.joe,d=distance(c,j);
 t.act=c.y<300?1:c.y<580?2:3;t.silence=run.hunt?.occluded?clamp((run.hunt.hiddenTime-0.7)/1.8,0,1):0;
 t.age+=dt;t.remaining=Math.max(0,t.remaining-dt);t.cooldown=Math.max(0,t.cooldown-dt);
 t.cueTime=Math.max(0,t.cueTime-dt);t.sting=Math.max(0,t.sting-dt*.8);t.dipTime=Math.max(0,t.dipTime-dt);
 const protectedMoment=!encounterAllows(run,'tension')||['opening','gather'].includes(run.pressure?.phase)||(run.decoys?.active>=0)||(j.ram?.phase&&j.ram.phase!=='none')||run.grace>0||c.invulnerable>0||run.finishHold>0||c.y>780||(run.hunt&&run.hunt.phase!=='follow');
 if(run.checkpoint!==t.lastCheckpoint){t.lastCheckpoint=run.checkpoint;enter(t,'breather',run.foot?4.5:Math.max(2.5,run.grace));t.cooldown=7;t.dipTime=0;cue(t,'The blades stop. The engine does not.');}
 else if(run.grace>0&&t.phase!=='breather')enter(t,'opening',0);
 else if(protectedMoment&&(t.phase==='windup'||t.phase==='surge')){enter(t,'recover',3);t.cooldown=7;}
 else if(!protectedMoment){
  if((t.phase==='opening'||t.phase==='breather'||t.phase==='recover')&&t.remaining===0)enter(t,'stalk',0);
  if(t.phase==='windup'&&(!visible||d>80)){enter(t,'recover',3);t.cooldown=6;}
  else if(t.phase==='windup'&&t.remaining===0){enter(t,'surge',3.4);t.beats++;cue(t,'The cutting decks drop. Keep moving.');}
  else if(t.phase==='surge'&&t.remaining===0){enter(t,'recover',3.5);t.cooldown=(t.act===3?7.5:9)+(t.beats%3)*1.4;}
  else if(t.phase==='stalk'&&t.cooldown===0&&visible&&d>10&&d<65&&c.speed>5&&Math.abs(c.steer)<.6){enter(t,'windup',2.2);cue(t,'Behind you: the engine climbs.');}
 }
 // Authored one-shot course omens, never a blackout across the driving lane.
 for(const [i,y] of [165,365,640].entries())if(c.y>=y&&!(t.zoneMask&(1<<i))){
  t.zoneMask|=1<<i;
  if(!protectedMoment){t.dipTime=5;if(t.phase!=='windup'&&t.phase!=='surge')cue(t,['The fairway lights are losing power.','Something rings out across the empty course.','The clubhouse lights are fading.'][i]);}
 }
 const proximity=clamp(1-d/62,0,1),target=protectedMoment?proximity*.35:clamp(proximity*.72+(t.act-1)*.045+(t.phase==='windup'?.2:t.phase==='surge'?.4:0),0,1);
 t.intensity+=(target-t.intensity)*(1-Math.exp(-dt*2.2));
 t.windup=t.phase==='windup'?clamp(t.age/2.2,0,1):0;t.surge=t.phase==='surge'?Math.min(1,t.age*3,t.remaining*2):0;
 t.lightDip=t.dipTime?Math.sin(Math.PI*clamp((5-t.dipTime)/5,0,1))*.72:0;
 t.motorGain=t.phase==='breather'&&d>14?.2:t.phase==='windup'?.55+t.windup*.55:1;
 return t;
}

// Only an announced surge on a straight paved stretch gains speed. No boost
// near a pinned/stopped cart, shelters, wet corners or the garage finish.
export function pursuitMultiplier(run,surface,turn,separation){
 const t=run.tension;if(!t)return 1;
 if(t.phase==='windup')return .94;
 if(t.phase==='surge'&&surface==='path'&&Math.abs(turn)<.4&&Math.abs(chaseActor(run).steer)<.6&&chaseActor(run).speed>4&&separation>9&&!chaseActor(run).invulnerable)return 1+.08*t.surge;
 if(t.phase==='breather'&&separation>18)return .82;
 return t.phase==='recover'?.97:1;
}
