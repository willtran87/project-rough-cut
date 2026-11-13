import {joeLine} from './back-nine-dialogue.js';
import {chaseActor} from './chase-player.js';

// Admission only: do not flash a taunt just before a fast approach crosses
// the urgent-distance boundary. Estimate closest separation over a minimum
// reading interval using current ground velocities, not future player input
// or hidden pursuit targets. This never reserves time or delays an attack.
export function dialogueApproachClear(run,seconds=3.5){
 const c=chaseActor(run),j=run.joe,dx=j.x-c.x,dy=j.y-c.y;
 const vx=Math.sin(j.yaw)*j.speed-Math.sin(c.yaw)*c.speed;
 const vy=Math.cos(j.yaw)*j.speed-Math.cos(c.yaw)*c.speed;
 const speed2=vx*vx+vy*vy,at=speed2>1e-8?Math.max(0,Math.min(seconds,-(dx*vx+dy*vy)/speed2)):0;
 const closest=Math.hypot(dx+vx*at,dy+vy*at);
 // Four metres of margin avoids admitting a line on the exact cutoff.
 return closest>=22&&Math.hypot(dx,dy)<=81&&Math.hypot(dx+vx*seconds,dy+vy*seconds)<=81;
}

// Observe existing evidence only. No visibility queries, RNG or state changes
// in the pursuit simulation. One pending reaction prevents a backlog of taunts.
const PRIORITY={hiding:1,shortcut:2,repair:2,damage:3,foot:4};
const serviceTotal=run=>(run.service?.applied[0]||0)+(run.service?.applied[1]||0);
export function createJoeReactions(pick=joeLine){
 const states=new WeakMap();
 function state(run){
  let s=states.get(run);
  if(!s){s={cursor:0,choiceMask:run.hunt?.choiceMask||0,hidden:false,pending:null,active:null,next:12,last:{},repairTotal:serviceTotal(run),observedRepair:0};states.set(run,s);}
  return s;
 }
 function offer(run,s,kind){
  if(run.time-(s.last[kind]??-Infinity)<55)return;
  if(s.active?.kind===kind||s.pending?.kind===kind)return;
  if(s.pending&&PRIORITY[s.pending.kind]>PRIORITY[kind])return;
  s.pending={kind,until:run.time+8};
  if(kind==='foot')s.active=null;
 }
 return {
  observe(run){
   const s=state(run);
   if(run.mode==='paused')return;
   if(run.mode!=='driving'){s.pending=s.active=null;s.cursor=run.events.length;return;}
   // Expire before considering new evidence; an old high-priority event must
   // not discard a fresh event on the first frame after its deadline.
   if(s.pending&&run.time>s.pending.until)s.pending=null;
   if(s.active&&run.time>=s.active.until)s.active=null;
   for(;s.cursor<run.events.length;s.cursor++){
    const e=run.events[s.cursor];if(run.time-e.time>10)continue;
    if(e.type==='abandon-cart')offer(run,s,'foot');
    else if(e.type==='contact'&&e.damage>0&&!run.foot)offer(run,s,'damage');
    else if(e.type==='shortcut')offer(run,s,'shortcut');
   }
   // choiceMask is set only when Joe observes a cart-only fork and plans a detour.
   const mask=run.hunt?.choiceMask||0;
   if(mask&~s.choiceMask)offer(run,s,'shortcut');s.choiceMask=mask;
   const hidden=!!run.hunt?.occluded&&run.hunt.hiddenTime>=2.2;
   if(hidden&&!s.hidden)offer(run,s,'hiding');s.hidden=hidden;
   if(s.pending?.kind==='hiding'&&!hidden)s.pending=null;
   if(s.active?.kind==='hiding'&&!hidden)s.active=null;
   if(run.foot&&s.pending?.kind==='damage')s.pending=null;
   // React after leaving service, not over its interaction instructions.
   // Relay health gifts do not count. Only real charger transfers witnessed
   // by Joe qualify; concealment must not produce an omniscient repair taunt.
   const repaired=serviceTotal(run),delta=Math.max(0,repaired-s.repairTotal);
   if(delta>0&&!run.hunt?.occluded&&run.joe.seenAge<.5)s.observedRepair+=delta;
   s.repairTotal=repaired;
   if(run.foot)s.observedRepair=0;
   else if(run.service?.active<0&&s.observedRepair>0){if(s.observedRepair>=5)offer(run,s,'repair');s.observedRepair=0;}
  },
  caption(run,blocked=false){
   const s=state(run);
   if(run.mode!=='driving'||blocked)return '';
   if(!s.active&&s.pending&&run.time<=s.pending.until&&run.time>=s.next){
    const pending=s.pending;s.pending=null;
    if(pending.kind==='damage'&&run.foot)return '';
    if(pending.kind==='hiding'&&(!run.hunt.occluded||run.hunt.hiddenTime<2.2))return '';
    s.active={kind:pending.kind,line:pick(pending,pending.kind),until:run.time+3.5};
    s.last[pending.kind]=run.time;s.next=run.time+35;
   }
   return s.active&&run.time<s.active.until?`JOE: “${s.active.line}”`:'';
  }
 };
}
