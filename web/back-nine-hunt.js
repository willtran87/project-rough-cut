import {tryHiddenCutoff,tryRangeRun,silenceActive} from './chase-experience.js';
import {encounterAllows,tacticChoiceOpen} from './chase-encounter.js';
import {DISTRICT_ENCOUNTERS,pendingDistrict} from './chase-districts.js';
export {DISTRICT_ENCOUNTERS} from './chase-districts.js';
import {chaseActor} from './chase-player.js';
import {createCommitment,updateCommitment,tryCommitment,commitmentTarget} from './chase-commitments.js';
import {COURSE,clamp,distance,blocked,planMowerRoute} from './back-nine-course.js';
export function createHunt(){return {commit:createCommitment(),phase:'follow',age:0,mask:0,choiceMask:0,districtMask:0,lastDistrict:null,side:0,zone:-1,waypoints:[],cursor:0,lastVisual:null,lastVisualAge:99,occluded:false,hiddenTime:0,revealTime:0,interceptions:0,alongside:0,kind:'intercept',cooldown:0,routeProbe:0};}
function laneDistance(p,route){let best=Infinity;for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy),0,1);best=Math.min(best,Math.hypot(p.x-a[0]-dx*t,p.y-a[1]-dy*t));}return best;}
function roadPoint(route,y){for(let i=1;i<route.length;i++)if(y>=route[i-1][1]&&y<=route[i][1]){const a=route[i-1],b=route[i],t=(y-a[1])/(b[1]-a[1]);return {x:a[0]+(b[0]-a[0])*t,y};}return roadPoint(COURSE.paths[0],y);}
function cue(run,text){run.message=text;run.messageTime=2.8;}
function startWindbreak(run,index){
 const h=run.hunt,c=chaseActor(run),j=run.joe,s=COURSE.sightbreaks[index],side=c.x>=s.x?-1:1;
 if(h.cooldown>0||h.routeProbe>0||!h.lastVisual)return false;
 const lane=COURSE.paths.reduce((best,r)=>laneDistance(h.lastVisual,r)<laneDistance(h.lastVisual,best)?r:best,COURSE.paths[0]);
 const flank={x:s.x+side*(s.rx+6),y:s.y+s.ry-4},exit=roadPoint(lane,s.y+s.ry+24);
 if(blocked(flank,1.85)||blocked(exit,1.85))return false;
 h.routeProbe=.8;const approach=planMowerRoute(j,flank),connection=planMowerRoute(flank,exit);if(!approach.points.length||!connection.points.length)return false;
 h.mask|=1<<index;j.ram.choiceUntil=0;
 h.phase='signal';h.kind='intercept';h.age=0;h.side=side;h.zone=index;h.cursor=0;h.waypoints=[flank,exit];j.repath=0;
 cue(run,`The decks lift. His headlights turn ${side<0?'left':'right'}.`);return true;
}
function tryDistrictEncounter(run,visible){
 const h=run.hunt,index=pendingDistrict(run);if(index<0)return false;
 const d=DISTRICT_ENCOUNTERS[index],chosen=d.kind==='intercept'?startWindbreak(run,1):tryCommitment(run,visible,d.kind);
 if(!chosen)return false;h.districtMask|=1<<index;h.lastDistrict=d.id;run.events.push({type:'district-encounter',id:d.id,kind:d.kind,time:run.time});return true;
}
export function updateHunt(run,dt,visible){
 const h=run.hunt,c=chaseActor(run),j=run.joe;h.age+=dt;h.routeProbe=Math.max(0,(h.routeProbe||0)-dt);h.cooldown=Math.max(0,h.cooldown-dt);h.lastVisualAge+=dt;h.revealTime=Math.max(0,h.revealTime-dt);
 if(visible){h.lastVisual={x:c.x,y:c.y,yaw:c.yaw,speed:c.speed};h.lastVisualAge=0;}
 const hidden=!visible&&distance(c,j)<90;if(h.occluded&&visible&&h.hiddenTime>.65){h.revealTime=1.5;if(h.phase!=='follow')cue(run,'The headlights break through the trees.');}h.hiddenTime=hidden?h.hiddenTime+dt:0;h.occluded=hidden;
 if(silenceActive(run)||run.tactics?.active>=0||run.foot||run.decoys?.active>=0||run.utility?.active>=0||j.ram?.phase&&j.ram.phase!=='none'||run.grace>0||c.invulnerable>0||c.y>780||run.mode!=='driving'||run.tension?.phase==='breather'){if(h.phase!=='follow')j.repath=0;h.phase='follow';h.commit.paceRemaining=0;h.waypoints=[];if(!tacticChoiceOpen(run))h.cooldown=Math.max(h.cooldown,run.grace>0&&h.commit.count===0?1.2:6);return;}
 // Abandon an obsolete attack corridor instead of letting it drag the
 // mower far behind a still-visible cart. Hidden turns remain unknown.
 if(visible&&distance(c,j)>42&&['commit_warning','lane_commit','close_pass','commit_recover'].includes(h.phase)){h.phase='follow';h.age=0;h.waypoints=[];h.cooldown=8;j.repath=0;}
 // Once Joe sees that the cart has passed his interception exit, stop
 // driving toward the obsolete corridor. Hidden predictions stay fixed.
 const predictedExit=h.waypoints.at(-1);
 if(visible&&['flank','intercept','alongside'].includes(h.phase)&&predictedExit&&distance(c,j)>24&&(c.y>predictedExit.y+8||h.age>1.5&&predictedExit.y<c.y+c.speed*1.5&&distance(j,predictedExit)>distance(c,predictedExit)*1.7+10)){h.phase='follow';h.age=0;h.waypoints=[];h.cooldown=8;j.repath=0;}
 if(updateCommitment(run,dt,visible))return;
 if(h.phase==='signal'&&h.age>=(h.kind==='alongside'?2.2:1.5)){h.phase=h.kind==='alongside'?'alongside':'flank';h.age=0;j.repath=0;if(h.kind==='alongside')h.alongside++;else h.interceptions++;}
 if(h.phase==='flank'&&distance(j,h.waypoints[0])<4){h.phase='intercept';h.cursor=1;h.age=0;j.repath=0;}
 if(h.phase==='recover'&&h.age>=3.5){h.phase='follow';h.age=0;}
 if(h.phase==='alongside'&&distance(j,h.waypoints[0])<4&&h.cursor===0){h.cursor=1;j.repath=0;}
 if((h.phase==='alongside'&&(h.age>4.5||distance(j,h.waypoints[1])<4))||(h.phase==='intercept'&&distance(j,h.waypoints[1])<5)||h.phase!=='follow'&&h.age>9){h.phase='recover';h.cooldown=12;h.age=0;h.waypoints=[];j.repath=0;}
 if(!encounterAllows(run,'hunt'))return;
 if(run.pressure?.phase==='opening'||run.pressure?.phase==='gather')return;
 if(!visible&&tryHiddenCutoff(run))return;
 if(h.phase==='follow'&&visible&&tryRangeRun(run))return;
 if(h.phase!=='follow'||!visible||c.speed<5||distance(c,j)<14||distance(c,j)>70)return;
 // Establish a real threat before spending time on an optional passing show.
 if(c.hits===0&&!(run.panic?.serial>0)&&distance(c,j)<45)return;
 // These are priorities at real spatial choices, not compulsory scenes. A
 // valid visible approach and the ordinary escape/clearance rules still win.
 if(tryDistrictEncounter(run,visible))return;
 // A visible turn into a cart-only lane gives Joe evidence for a wide detour.
 // Once signalled, hidden player steering never changes the chosen merge.
   const fork=COURSE.decisions.findIndex((d,i)=>!(h.choiceMask&(1<<i))&&c.y>d.entry.y+2&&c.y<d.gate.y&&Math.sign(d.gate.x-d.entry.x)*(c.x-d.entry.x)>3);
 if(fork>=0&&h.cooldown<=0&&h.routeProbe<=0){
  h.routeProbe=.8;
  const d=COURSE.decisions[fork];
  const approach=planMowerRoute(j,d.wide),exit=planMowerRoute(d.wide,d.merge);
  if(approach.points.length&&exit.points.length){h.choiceMask|=1<<fork;j.ram.choiceUntil=0;h.phase='signal';h.kind='intercept';h.age=0;h.side=Math.sign(d.wide.x-j.x)||1;h.cursor=0;h.waypoints=[{...d.wide},{...d.merge}];j.repath=0;cue(run,'His headlights turn toward the wide lane. He is trying to meet you at the far end.');return;}
 }
 const index=COURSE.sightbreaks.findIndex((s,i)=>!(h.mask&(1<<i))&&c.y>=s.trigger&&c.y<s.trigger+20);if(index<0){
  // Close the distance for another physical ram; keep authored distant
  // interceptions, but do not trade a close attack for a passing display.
  if(distance(c,j)<20)return;
  if(tryCommitment(run,visible))return;
  if(h.cooldown>0||c.y<205||c.y>750||Math.abs(c.steer)>.35||distance(c,j)>38||distance(c,j)<13||['windup','surge','opening'].includes(run.tension?.phase))return;
  const forward={x:Math.sin(c.yaw),y:Math.cos(c.yaw)},right={x:Math.cos(c.yaw),y:-Math.sin(c.yaw)};
  // Commit to the observed heading; this is not a homing side-swipe.
  for(const side of [(h.alongside%2)?-1:1,(h.alongside%2)?1:-1]){
   const points=[10,26].map(lead=>({x:c.x+forward.x*lead+right.x*side*6,y:c.y+forward.y*lead+right.y*side*6}));
   if(points.some(p=>blocked(p,2.7)))continue;
   h.phase='signal';h.kind='alongside';h.age=0;h.side=side;h.cursor=0;h.waypoints=points;j.repath=0;
   cue(run,`Watch your ${side<0?'left':'right'}. His engine pulses.`);return;
  }return;
 }
 // Commit to a prediction from the last visible lane. Hidden steering changes
 // never move these targets; Joe can choose wrong and emerge behind the cart.
 startWindbreak(run,index);
}
export function huntTarget(run){const committed=commitmentTarget(run);if(committed)return committed;const h=run.hunt;return h.phase==='signal'||h.phase==='flank'||h.phase==='intercept'||h.phase==='alongside'?h.waypoints[h.cursor]:null;}
