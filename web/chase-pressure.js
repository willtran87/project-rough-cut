import {encounterAllows} from './chase-encounter.js';
import {chaseActor} from './chase-player.js';
import {COURSE,clamp,distance} from './back-nine-course.js';

export function createPressure(){return {phase:'dormant',reliefCooldown:0,age:0,remaining:0,waves:0,seenPanic:0,seenRecover:false,seenLaunch:0,launchAge:99,missedLaunch:0,seenPass:0,gaspAge:99,gaspCooldown:0,gasps:0,choice:null,finale:false,finalAnnounced:false};}
function enter(p,phase,seconds){p.phase=phase;p.age=0;p.remaining=seconds;}
// Pick only an available, forward opportunity in the player's current district.
// This is computed at an opening, not every render frame; the player keeps control.
function choose(run){const c=chaseActor(run);
 for(let i=0;i<COURSE.shortcuts.length;i++){const s=COURSE.shortcuts[i],index=COURSE.hurdles.findIndex(h=>h.shortcut===i);if(s.y>c.y+5&&s.y<c.y+85&&run.courseFX.breaks[index]?.age<0)return {kind:'gate',index:i,text:'OPENING · timber gap ahead for cover, or stay on the fast path.'};}
 for(let i=0;i<COURSE.alarms.length;i++){const a=COURSE.alarms[i];if(!(run.decoys.used&(1<<i))&&a.y>c.y&&a.y<c.y+75)return {kind:'alarm',index:i,text:run.foot?'OPENING · side-lane treadle ahead. Hide, then hold Use to ring it.':'OPENING · side-lane treadle ahead. Hide, then brake to draw him away.'};}
 if(run.checkpoint===2&&c.y>700)return {kind:'garage',index:0,text:run.foot?'GARAGE AHEAD · run inside and hold Use.':'GARAGE AHEAD · take the bend, get fully inside, then hold brake.'};
 return {kind:'cover',index:Math.min(2,run.checkpoint),text:'OPENING · build distance on the path, or take cover before he turns.'};
}
export function pressureOpening(run){return run.mode==='driving'&&run.pressure?.phase==='opening';}
export function updatePressure(run,dt,visible){
 const p=run.pressure;if(!p||run.mode==='paused')return;const c=chaseActor(run),j=run.joe,h=run.hunt,gap=distance(c,j);
 p.reliefCooldown=Math.max(0,(p.reliefCooldown||0)-dt);p.age+=dt;p.remaining=Math.max(0,p.remaining-dt);p.gaspAge+=dt;p.gaspCooldown=Math.max(0,p.gaspCooldown-dt);p.launchAge+=dt;
 if(j.ram.launches!==p.seenLaunch){p.seenLaunch=j.ram.launches;p.launchAge=0;}
 const recovery=h.phase==='commit_recover',newRecovery=recovery&&!p.seenRecover;p.seenRecover=recovery;
 const pass=h.commit.passes!==p.seenPass;p.seenPass=h.commit.passes;
 const protectedMoment=!encounterAllows(run,'pressure')||run.mode!=='driving'||run.grace>0||run.tension.phase==='breather'||run.decoys.active>=0||c.invulnerable>0;
 if(protectedMoment){if(!run.foot){p.reliefCooldown=3.4;p.missedLaunch=p.seenLaunch;}enter(p,'dormant',0);p.choice=null;p.finale=false;p.gaspAge=99;p.seenPanic=run.panic.serial;return;}
 if(run.panic.phase==='reveal'){enter(p,'dormant',0);p.choice=null;return;}
 p.finale=run.checkpoint===2&&c.y>700;
 if(p.gaspCooldown===0&&c.speed>3&&(pass||gap<11&&j.speed>c.speed+2)){p.gaspAge=0;p.gaspCooldown=8;p.gasps++;}
 const missed=p.seenLaunch>p.missedLaunch&&p.launchAge>5.5&&gap>12&&j.ram.phase==='none'&&(gap>45||!visible||j.speed<c.speed+.5);
 if(missed)p.missedLaunch=p.seenLaunch;
 if((newRecovery||missed)&&p.waves>0&&c.y<780&&p.phase!=='opening'&&(run.foot||p.reliefCooldown===0)){enter(p,'opening',3.4);p.choice=choose(run);return;}
 if(p.phase==='dormant'){
  if(run.panic.serial>p.seenPanic||run.panic.serial>0&&visible&&gap<65&&c.speed>4){p.seenPanic=run.panic.serial;p.waves++;enter(p,'pressure',9+(p.waves%3));}
  return;
 }
 const busy=j.ram.phase!=='none'||h.phase!=='follow'||['windup','surge'].includes(run.tension.phase);
 if(p.finale&&!p.finalAnnounced&&c.y>720&&c.y<765&&visible&&gap>18&&!busy&&p.phase!=='opening'){p.finalAnnounced=true;enter(p,'gather',.8);return;}
 if(p.phase==='pressure'&&(p.remaining===0||run.hunt.hiddenTime>1.25)&&!busy){enter(p,'opening',3.4);p.choice=choose(run);}
 else if(p.phase==='opening'&&p.remaining===0){p.choice=null;if(visible&&gap<70&&c.speed>4&&!busy)enter(p,'gather',.8);else enter(p,'dormant',0);}
 else if(p.phase==='gather'){
  if(!visible||gap>75||busy){enter(p,'dormant',0);return;}
  if(p.remaining===0){p.waves++;enter(p,'pressure',9+(p.waves%3));h.cooldown=Math.min(h.cooldown,1.5);}
 }
}
export function pressurePose(run){const p=run.pressure||{},active=run.mode==='driving',opening=active&&p.phase==='opening',gather=active&&p.phase==='gather',pressure=active&&p.phase==='pressure',gasp=active&&p.gaspAge<.7?Math.sin(Math.PI*p.gaspAge/.7):0;return {opening,gather,pressure,gasp,level:pressure?clamp(.82-(p.age||0)*.012,0,1):gather?.3:0,release:pressure?clamp(1-(p.age||0)/.6,0,1):0,gain:opening?.3:gather?.18:1};}
export function pressureCaption(run){const p=run.pressure;if(!p||run.mode!=='driving')return '';if(p.phase==='opening')return p.choice?.text||'';if(p.phase==='gather')return p.finale?'The garage is lit beyond the bend. His engine rises again.':'The engine takes a breath. Choose your escape line.';if(p.finale&&chaseActor(run).y>730)return run.foot?'GARAGE AHEAD · run inside and hold Use.':'GARAGE AHEAD · take the bend, get fully inside, then hold brake.';return '';}
