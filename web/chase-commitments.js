import {commitmentPreference} from './chase-variation.js';
import {chaseActor} from './chase-player.js';
import {COURSE,clamp,distance,angleDelta,lineClear,blocked} from './back-nine-course.js';

export const COMMIT_PHASES=['commit_warning','lane_commit','close_pass','commit_recover'];
export const COMMIT_SPEED=24;
export function createCommitment(){return {count:0,kind:'pass',side:0,origin:null,heading:0,passed:false,passes:0,closest:99,release:0,probe:0,paceRemaining:0,paced:false};}
export function commitmentActive(run){return COMMIT_PHASES.includes(run.hunt?.phase);}
function recover(run){const h=run.hunt,j=run.joe,a=h.commit;h.phase='commit_recover';h.age=0;h.cooldown=14;h.cursor=0;const ahead={x:j.x+Math.sin(a.heading)*14,y:j.y+Math.cos(a.heading)*14};h.waypoints=[blocked(ahead,2.7)?{x:j.x,y:j.y}:ahead];j.repath=0;}

export function updateCommitment(run,dt,visible){
 const h=run.hunt,a=h.commit,c=chaseActor(run),j=run.joe;
 a.paceRemaining=Math.max(0,(a.paceRemaining||0)-dt);a.release=Math.max(0,a.release-dt);a.probe=Math.max(0,a.probe-dt);
 if(!commitmentActive(run))return false;
 if(h.phase==='commit_recover'){if(h.age>=3){h.phase='follow';h.age=0;j.repath=0;}return true;}
 // Once announced, hidden steering does not move the recorded lane. A warning
 // may be cancelled if contact/protected moments intervene in the hunt owner.
 if(h.phase==='commit_warning'&&h.age>=1.8){h.phase=a.kind==='pass'?'close_pass':'lane_commit';h.age=0;a.release=.35;j.repath=0;}
 if(h.phase==='close_pass'){
  a.closest=Math.min(a.closest,distance(c,j));
  const longitudinal=(j.x-c.x)*Math.sin(a.heading)+(j.y-c.y)*Math.cos(a.heading);
  if(!a.paced&&longitudinal>-4&&longitudinal<0&&distance(c,j)<9&&c.speed>4){a.paced=true;a.paceRemaining=1;}
  if(!a.passed&&a.closest<9&&longitudinal>2){a.passed=true;a.passes++;a.release=.45;run.message='He tears past. Take the opening.';run.messageTime=1.7;}
 }
 if(h.phase!=='commit_warning'){
  if(h.cursor===0&&h.waypoints.length>1&&distance(j,h.waypoints[0])<3){h.cursor=1;j.repath=0;}
  if(h.age>(a.kind==='pass'?7:4)||distance(j,h.waypoints.at(-1))<3||j.stuck>.55)recover(run);
 }
 return true;
}

export function tryCommitment(run,visible,requestedKind=null){
 const h=run.hunt,a=h.commit,c=chaseActor(run),j=run.joe,gap=distance(c,j);
 if(h.phase!=='follow'||h.cooldown>0||a.probe>0||!visible||!(run.panic?.serial>0)||c.speed<6||Math.abs(c.steer)>.3||c.y<35||c.y>750||gap<17||gap>37||Math.abs(angleDelta(c.yaw,j.yaw))>.65||['windup','surge','opening','breather'].includes(run.tension.phase))return false;
 a.probe=.8;
 const f={x:Math.sin(c.yaw),y:Math.cos(c.yaw)},right={x:Math.cos(c.yaw),y:-Math.sin(c.yaw)},point=(lead,side)=>({x:c.x+f.x*lead+right.x*side,y:c.y+f.y*lead+right.y*side});
 // At least one side must offer a real steering escape, with no shelter or finish
 // interference. Clearance checks are bounded and run only on candidate beats.
 if(COURSE.checkpoints.some(p=>distance(p,c)<35)||![-1,1].some(side=>lineClear(c,point(18,side*6),1.4)))return false;
 const preference=commitmentPreference(run,a),preferred=preference.kind;
 for(const kind of requestedKind?[requestedKind]:[preferred,preferred==='pass'?'lane':'pass'])for(const side of [preference.side,-preference.side])for(let wide=0;wide<(kind==='pass'?2:1);wide++){
  // Account for travel during the warning, then keep the chosen lane fixed.
  const lead=c.speed*1.8;
  // Leave enough clear road for the one-second alongside hesitation and a
  // real overtake. A short corridor made Joe brake beside a fast cart before
  // ever passing it. The far end is still fixed at the warning, never homing.
  // A planting island at the far end need not reject the entire overtake.
  // After entering the passing lane, a gentle outward exit can clear it.
  // Both segments are checked now and frozen with the original warning;
  // never bend the exit back into the player's announced lane or retarget it.
  const points=kind==='pass'?[point(9+lead,side*6.2),point(60+lead,side*(wide?12.4:6.2))]:[point(24+lead,0)];
  if(points.some(p=>blocked(p,2.7)))continue;
  if(kind==='pass'&&(!lineClear(j,points[0],2.7)||!lineClear(points[0],points[1],2.7)))continue;
  // Lane attacks can use the normal bounded route planner around scenery;
  // passing attempts require an actually clear parallel corridor.
  a.count++;if(run.variation)run.variation.choices++;a.kind=kind;a.side=side;a.origin={x:c.x,y:c.y};a.heading=c.yaw;a.passed=false;a.closest=99;a.paced=false;a.paceRemaining=0;
  h.phase='commit_warning';h.age=0;h.side=side;h.waypoints=points;h.cursor=0;j.repath=0;j.ram.choiceUntil=0;
  run.message=kind==='pass'?`His lights swing ${side<0?'left':'right'}. Hold clear of that side.`:'He lines up your lane. Change lanes before the decks drop.';run.messageTime=1.8;
  return true;
 }
 return false;
}

export function commitmentTarget(run){const h=run.hunt;return ['commit_warning','lane_commit','close_pass','commit_recover'].includes(h.phase)?h.waypoints[h.cursor]:null;}
export function commitmentSpeed(run,goal){
 const h=run.hunt;
 if(h.phase==='signal')return Math.min(goal,Math.max(3,chaseActor(run).speed+.5));
 if(h.phase==='close_pass'&&h.commit.paceRemaining>0)return Math.min(goal,chaseActor(run).speed+.3);
 if(h.phase==='commit_warning')return Math.min(goal,Math.max(7,chaseActor(run).speed+.5));
 if(h.phase==='commit_recover')return Math.min(goal,8);
 if(h.phase==='lane_commit'||h.phase==='close_pass')return Math.min(COMMIT_SPEED,goal*1.14);
 return goal;
}
export function commitmentPose(run){const h=run.hunt||{},a=h.commit||{},pacing=h.phase==='close_pass'&&a.paceRemaining>0,warning=h.phase==='commit_warning'||pacing;return {warning,load:pacing?1-a.paceRemaining:warning?clamp(h.age/1.8,0,1):0,release:a.release||0,pass:h.phase==='close_pass',active:commitmentActive(run)};}
export function commitmentCaption(run){const h=run.hunt,a=h.commit;
 if(h.phase==='commit_warning')return a.kind==='pass'?`HEADLIGHTS ${a.side<0?'LEFT':'RIGHT'} · keep clear of his passing lane`:'HE HAS CHOSEN YOUR LANE · turn out before he commits';if(h.phase==='lane_commit')return 'He is committed. Take the other lane or a timber gate.';if(h.phase==='close_pass')return a.paceRemaining>0?'HE IS BESIDE YOU · hold clear; the decks are lifting.':a.passed?'He overshoots. Take the opening.':`MOWER ${a.side<0?'LEFT':'RIGHT'} · keep your escape line`;if(h.phase==='commit_recover')return 'His turn is wide. Get clear.';return '';}
