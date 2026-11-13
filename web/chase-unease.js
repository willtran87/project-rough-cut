import {encounterAllows} from './chase-encounter.js';

// The two seats belong to existing parked staff carts, beyond the boundary.
// These are visual opportunities, never actors, collisions or attack cues.
export const STAFF_SIGHTINGS=Object.freeze([
 Object.freeze({id:'closed-bay',x:-47.2,y:89.3,yaw:0}),
 Object.freeze({id:'night-order-bay',x:43.8,y:161.3,yaw:0})
]);
export function createUnease(run){
 // Dress the opening bay before its first frame, like the parked cart itself.
 // It cannot be inserted once play is underway or reappear on checkpoint
 // retries. Waiting for an unseen seat during pursuit starved both sites.
 const opening=!!run&&run.checkpoint===0&&run.time<=.1&&run.departure?.phase==='working'&&!run.foot&&!run.death&&run.cart.hits===0&&run.cart.health===run.cart.maxHealth&&['briefing','driving'].includes(run.mode);
 return {site:opening?0:-1,phase:opening?'staged':'waiting',opening,seen:0,away:0,age:0,eligible:0,used:0,lastTime:null};
}
export function sightingSafe(run){
 const c=run.foot||run.cart,j=run.joe;
 return run.mode==='driving'&&!run.death&&!run.foot&&run.grace<=0&&!(c.invulnerable>0)&&Math.abs(c.speed)<11.5&&
  Math.hypot(c.x-j.x,c.y-j.y)>42&&encounterAllows(run,'omen')&&
  (!j.ram?.phase||j.ram.phase==='none')&&!(j.ram?.footCharge>0)&&run.hunt?.phase==='follow'&&
  !['windup','surge','breather'].includes(run.tension?.phase)&&!(run.lastImpact>0)&&!run.finishHold;
}
// Called from presentation with actual camera observations. Only simulation
// time advances the beat; repeated draws, pause and wall-clock stalls cannot.
// After initial scene dressing, a figure is staged only out of sight.
// Both types disappear only while out of sight.
export function updateUnease(s,run,observed){
 const dt=s.lastTime===null?0:Math.max(0,Math.min(.1,run.time-s.lastTime));s.lastTime=run.time;
 if(run.mode==='paused'||dt===0||run.mode==='briefing'&&s.opening)return s;
 if(run.mode!=='driving'){s.site=-1;s.phase='finished';return s;}
 const openingQuiet=s.opening&&run.departure?.phase==='working'&&!run.foot&&!run.death&&run.cart.hits===0&&['checkpoint','departure'].includes(run.encounter?.owner)&&run.joe.ram.phase==='none'&&!(run.joe.ram.footCharge>0);
 const safe=sightingSafe(run)||openingQuiet,c=run.foot||run.cart;
 if(s.site>=0){
  const looking=!!observed[s.site];s.age+=dt;s.away=looking?0:s.away+dt;
  if(looking){s.seen+=dt;s.phase='observed';}
  // No blink in the player's view, even if an attack begins. The silent,
  // stationary background seat never competes with the actual mower cues.
  if(!looking&&(s.seen>.25&&s.away>=.6||!safe||s.age>12)){
   s.site=-1;s.phase=s.seen>.25?'finished':'waiting';s.used=s.seen>.25?1:s.used;s.eligible=0;s.opening=false;
  }
  return s;
 }
 if(s.used||s.phase==='finished')return s;
 s.eligible=safe?s.eligible+dt:0;
 if(s.eligible<.8)return s;
 for(let i=0;i<STAFF_SIGHTINGS.length;i++){
  const p=STAFF_SIGHTINGS[i],gap=Math.hypot(c.x-p.x,c.y-p.y);
  if(!observed[i]&&gap<61&&gap>12&&c.y>p.y-48&&c.y<p.y+8){s.site=i;s.phase='staged';s.age=0;s.seen=0;s.away=0;break;}
 }
 return s;
}
