import {encounterAllows} from './chase-encounter.js';
import {chaseActor} from './chase-player.js';
import {pressurePose} from './chase-pressure.js';
import {clamp,distance} from './back-nine-course.js';

// A presentation director, never a speed boost or a steering/pathfinding input.
// Sight loss must be sustained before another reveal can be earned.
export function createPanic(checkpoint=0){return {phase:'quiet',age:0,remaining:0,hidden:0,cooldown:0,armed:true,intensity:0,serial:0,lastCheckpoint:checkpoint,finalPush:0};}
function enter(p,phase,duration=0){p.phase=phase;p.age=0;p.remaining=duration;}
const revealBuild=p=>{const duration=p.revealDuration||.65,hold=duration*(.22/.65);return clamp((p.age-hold)/(duration-hold),0,1);};
export function updatePanic(run,dt,visible){
 const p=run.panic,c=chaseActor(run),j=run.joe;if(!p||run.mode==='paused')return;
 if(run.mode==='complete'||run.mode==='caught'){enter(p,'quiet');p.intensity=0;p.finalPush=0;return;}
 p.age+=dt;p.remaining=Math.max(0,p.remaining-dt);p.cooldown=Math.max(0,p.cooldown-dt);p.hidden=visible?0:p.hidden+dt;
 if(p.hidden>=1.5)p.armed=true;
 const waveBusy=['pressure','opening','gather'].includes(run.pressure?.phase);
 if(run.mode==='sealing'){enter(p,'closing');p.finalPush=0;p.intensity=run.finale.latched?0:.48;return;}
 const ram=j.ram?.phase!=='none',protectedMoment=!encounterAllows(run,'reveal')||run.grace>0||run.tension?.phase==='breather'||run.decoys?.active>=0;
 if(run.checkpoint!==p.lastCheckpoint||protectedMoment){p.lastCheckpoint=run.checkpoint;enter(p,'quiet');p.intensity=0;p.finalPush=0;return;}
 if(p.phase==='reveal'){
  if(ram||!visible&&p.hidden>.25){enter(p,'recover',4);p.cooldown=Math.max(p.cooldown,8);}
  else if(p.remaining===0){enter(p,'panic',run.checkpoint===2?11:9);p.serial++;}
 }else if(p.phase==='panic'&&(p.remaining===0||p.hidden>1.25||distance(c,j)>80)){enter(p,'recover',4);p.cooldown=10;}
 else if(p.phase==='recover'&&p.remaining===0)enter(p,'quiet');
 // A ram's own hush/rev is already the reveal: enter panic on its release,
 // without playing a second warning over the committed attack.
 if(!waveBusy&&p.phase==='quiet'&&p.armed&&p.cooldown===0&&visible&&(j.ram?.release||0)>0){enter(p,'panic',run.checkpoint===2?11:9);p.serial++;p.armed=false;}
 if(!waveBusy&&p.phase==='quiet'&&p.armed&&p.cooldown===0&&visible&&distance(c,j)<62&&!ram&&c.invulnerable<=0&&run.hunt?.phase==='follow'){
  p.revealDuration=run.departure?.phase==='notice'?1.65:.65;enter(p,'reveal',p.revealDuration);p.armed=false;
 }
 p.finalPush=run.checkpoint===2&&c.y>700&&visible?clamp((c.y-700)/90,0,1):0;
 const target=p.phase==='panic'?Math.max(.72,1-p.age*.025):p.phase==='reveal'?revealBuild(p):p.phase==='recover'?.36*p.remaining/4:p.finalPush*.65;
 p.intensity+=(target-p.intensity)*(1-Math.exp(-dt*(target>p.intensity?7:2)));
}
export function panicPose(run){
 const p=run.panic||{},ram=run.joe.ram?.phase!=='none',reveal=p.phase==='reveal'&&!ram;
 const wave=pressurePose(run);const drive=run.mode==='driving',baseLevel=drive?(p.intensity||0):run.mode==='sealing'?(p.intensity||0):0;
 const level=Math.max(baseLevel,wave.level)*wave.gain;const release=drive&&!ram?Math.max(wave.release,p.phase==='panic'?clamp(1-(p.age||0)/.6,0,1):0):0;
 const duration=p.revealDuration||.65,hold=duration*(.22/.65),build=duration-hold;
 return {level,release,finalPush:drive?(p.finalPush||0):0,reveal,motor:wave.gather?.18:reveal?(p.age<hold?.12:.55+clamp((p.age-hold)/build,0,1)*.75):1+release*.35,
  lamps:reveal?1+clamp((p.age-hold)/build,0,1)*.3:1+level*.12+release*.35,deckLift:wave.gather?.45:reveal?.48*(1-clamp(p.age/duration,0,1)):0,
  percussion:run.mode==='sealing'?(run.finale?.latched?0:.5):drive&&p.phase!=='reveal'?level*(ram?.3:1)*(p.phase==='recover'?.2:1):0};
}
export function panicCaption(run){const p=run.panic;if(!p)return '';
 if(p.phase==='reveal')return 'His headlights find you. The engine falls silent…';
 if(p.phase==='recover'&&p.hidden>1.25)return 'Out of sight. Keep moving; listen for the engine.';
 if(p.phase!=='panic')return '';
 if(chaseActor(run).y>730&&run.checkpoint===2)return run.foot?'GARAGE AHEAD · run inside, then hold Use.':'GARAGE AHEAD · get fully inside, then hold the brake.';
 for(const [start,end,side]of [[55,155,'left'],[350,465,'left'],[610,700,'right']])if(chaseActor(run).y>=start&&chaseActor(run).y<end)return `TAKE THE ${side.toUpperCase()} SERVICE LANE for cover · fairway for speed.`;
 return 'HE HAS SEEN YOU · keep moving and find cover.';
}
