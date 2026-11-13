import {COURSE,distance,blocked,planMowerRoute} from './back-nine-course.js';
import {variationChoice} from './chase-variation.js';
import {emitCourseCue} from './back-nine-course-fx.js';

export function createExperience(){return {silence:{phase:'waiting',age:0,used:false},birds:{serial:0,at:-99,x:0,y:0},nearMiss:{serial:0,at:-99,x:0,y:0,side:1,closest:99,armed:false,cooldown:0},rangeRun:{phase:'waiting',age:0},lastBreak:0,opened:[],cue:'',cueUntil:0};}
function cue(run,text,seconds=3){run.experience.cue=text;run.experience.cueUntil=run.time+seconds;}
export function silenceActive(run){return ['quiet','restart'].includes(run.experience?.silence.phase);}
export function experienceMotor(run){const s=run.experience?.silence;return s?.phase==='quiet'?0:s?.phase==='restart'?Math.min(1,s.age/.9):1;}
export function experienceSpeedLimit(run){return silenceActive(run)?0:Infinity;}
export function updateExperience(run,dt,visible){
 const e=run.experience;if(!e||run.mode!=='driving')return;
 const c=run.foot||run.cart,j=run.joe,gap=distance(c,j),s=e.silence;
 const protectedBeat=run.grace>0||c.invulnerable>0||run.tactics?.active>=0||j.ram.phase!=='none'||j.ram.footCharge>0||run.hunt.phase!=='follow'||['windup','surge','breather'].includes(run.tension.phase)||['opening','gather'].includes(run.pressure.phase)||run.encounter?.reliefUntil>run.time;
 if(s.phase==='waiting'&&!s.used&&!protectedBeat&&!visible&&gap>26&&gap<80&&c.y>315+variationChoice(run,'silence-entry',0,3)*25&&c.y<680&&j.seenAge>.7){
  s.phase='quiet';s.age=0;s.used=true;j.repath=0;cue(run,'The engine stops. Somewhere behind the hedge, metal ticks as it cools.',4);run.events.push({type:'engine-silence',time:run.time});
 }
 if(silenceActive(run)){
  s.age+=dt;
  if(s.phase==='quiet'&&(s.age>=3.6||visible||gap<18)){s.phase='restart';s.age=0;cue(run,'A starter grinds. Red light spills through the trees.',2);emitCourseCue(run.courseFX,'metal',j,.35);}
  else if(s.phase==='restart'&&s.age>=1.25){s.phase='finished';s.age=0;j.repath=0;j.ram.armed=false;run.events.push({type:'engine-restart',time:run.time});}
 }
 // Birds mark the actual moving mower, never a fabricated threat location.
 if(!visible&&j.speed>5&&gap>20&&gap<70&&run.time-e.birds.at>16&&!silenceActive(run)&&!protectedBeat){Object.assign(e.birds,{serial:e.birds.serial+1,at:run.time,x:j.x,y:j.y});cue(run,'Birds scatter above the trees. Something is moving underneath.',2.8);}
 const n=e.nearMiss;n.cooldown=Math.max(0,n.cooldown-dt);
 if(gap<8&&j.speed>6&&!run.contact&&n.cooldown<=0&&!protectedBeat){n.armed=true;n.closest=Math.min(n.closest,gap);}
 if(n.armed&&(run.contact||gap>11)){if(!run.contact&&n.closest>2.5){Object.assign(n,{serial:n.serial+1,at:run.time,x:c.x,y:c.y,side:Math.sign(Math.sin(Math.atan2(j.x-c.x,j.y-c.y)-c.yaw))||1});emitCourseCue(run.courseFX,'brush',c,.8);}n.armed=false;n.closest=99;n.cooldown=5;}
 // Name new traversable gaps once, only when close enough to use them.
 if(e.lastBreak!==run.destruction.serial){e.lastBreak=run.destruction.serial;for(const f of COURSE.features){const b=run.destruction.features[f.id];if(b?.brokenAt!=null&&!e.opened.includes(f.id)){e.opened.push(f.id);if(distance(c,f)<35&&f.kind==='service-fence')cue(run,'He tore the hedge open · you can escape through that gap.',3);}}}
 const r=e.rangeRun;if(r.phase==='running'){r.age+=dt;if(c.y>515||r.age>12){r.phase='finished';cue(run,'The range opens out. Choose a lane and keep moving.',2);}}
}

// Select once from the last observed heading, never from hidden player input.
// This is a real navigated detour with a full 1.5 s headlight/engine warning.
export function tryHiddenCutoff(run){
 const h=run.hunt,j=run.joe,o=h.lastVisual,c=run.foot||run.cart;
 if(run.foot||!o||h.lastVisualAge<.45||h.lastVisualAge>2||h.hiddenTime<.35||h.cooldown>0||h.routeProbe>0||h.phase!=='follow'||o.speed<4||distance(c,j)<20||distance(c,j)>75||o.y<70||o.y>735)return false;
 const lead=Math.min(28,Math.max(16,o.speed*2.6)),end={x:o.x+Math.sin(o.yaw)*lead,y:o.y+Math.cos(o.yaw)*lead};
 h.routeProbe=1;
 for(const side of variationChoice(run,'hidden-flank',Math.floor(o.y/100))?[-1,1]:[1,-1]){
  const flank={x:o.x+Math.cos(o.yaw)*side*8+Math.sin(o.yaw)*8,y:o.y-Math.sin(o.yaw)*side*8+Math.cos(o.yaw)*8};
  if(blocked(flank,2.7)||blocked(end,2.7)||!planMowerRoute(j,flank).points.length||!planMowerRoute(flank,end).points.length)continue;
  Object.assign(h,{phase:'signal',kind:'intercept',age:0,side,cursor:0,waypoints:[flank,end],cooldown:16});j.repath=0;j.ram.choiceUntil=0;
  cue(run,`His engine turns ${side<0?'left':'right'}. He is heading for the far end of the lane.`,3);run.events.push({type:'hidden-cutoff',target:{...end},time:run.time});return true;
 }
 return false;
}

export function tryRangeRun(run){
 const e=run.experience,h=run.hunt,c=run.cart,j=run.joe;if(!e||e.rangeRun.phase!=='waiting'||run.foot||c.y<425||c.y>475||c.speed<5||h.cooldown>0||distance(c,j)<20||distance(c,j)>65)return false;
 // The dry perimeter runs parallel to the flooded crossover. Joe drives
 // through the existing crushable hedge at its far end; no remote explosions.
 const points=[{x:36.3,y:480},{x:36.3,y:510}];
 if(points.some(p=>blocked(p,2.7))||!planMowerRoute(j,points[0]).points.length)return false;
 Object.assign(h,{phase:'signal',kind:'intercept',age:0,side:1,cursor:0,waypoints:points,cooldown:16});j.repath=0;j.ram.choiceUntil=0;
 e.rangeRun.phase='running';e.rangeRun.age=0;cue(run,'His headlights race along the range fence · cross the wet lane or take the outer gap.',4);run.events.push({type:'range-run',time:run.time});return true;
}

export function experienceCaption(run){const e=run.experience;return e&&e.cueUntil>run.time?e.cue:'';}
