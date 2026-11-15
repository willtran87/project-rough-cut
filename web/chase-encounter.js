import {silenceActive} from './chase-experience.js';
import {departureActive} from './chase-departure.js';
import {pendingDistrict} from './chase-districts.js';
// Shared authority for optional chase beats. Physics, sight and committed
// attacks stay in their existing owners; this policy prevents a second owner
// from spending an earned escape window. Simulation time owns all deadlines.
const ATTACK_HUNTS=new Set(['signal','flank','intercept','alongside','commit_warning','lane_commit','close_pass']);
export function tacticChoiceOpen(run){return !run.foot&&(run.joe.ram.choiceUntil||0)>run.time;}
// After every second ram, or at an unused authored fork, a moving cart can
// make Joe reconsider his approach.
// This begins only after the same physical retreat distance/time. It is a
// bounded selection opportunity, not a second attack timer or a forced event.
export function offerTacticChoice(run){
 const c=run.cart,j=run.joe,r=j.ram;
 if(r.phase!=='backoff'||r.age<1.1||run.foot||run.grace>0||run.mode!=='driving'||(run.encounter?.reliefUntil||0)>run.time||c.speed<5||r.cycles%2!==0&&pendingDistrict(run)<0||c.y<45||c.y>750||j.seenAge>.5||Math.hypot(c.x-j.x,c.y-j.y)<12)return false;
 r.choiceUntil=run.time+2.4;r.choiceSpeed=c.speed+.2;r.phase='none';r.age=0;r.armed=false;j.repath=0;
 run.hunt.cooldown=0;run.hunt.commit.probe=0;
 run.events.push({type:'tactic-choice',time:run.time});return true;
}
export function createEncounter(){return {updated:false,owner:'cruise',stage:'departure',age:0,transitions:0,reliefUntil:0,reliefReason:'',nextReliefAt:0,rewards:0,lastRam:'none',lastHunt:'follow',lastHits:0,lastHitAt:-99,hiddenAt:null,hiddenRewarded:false,wasHidden:false,gap:99};}
export function encounterAllows(run,channel){
 if(channel==='ram'&&tacticChoiceOpen(run))return false;
 if(silenceActive(run))return false;
 const e=run.encounter;if(!e?.updated)return true;
 if(channel==='ram')return ['cruise','search'].includes(e.owner);
 if(channel==='hunt')return ['cruise','search','intercept'].includes(e.owner);
 if(channel==='tension')return ['cruise','tension'].includes(e.owner);
 if(channel==='pressure')return ['cruise','opening','gather'].includes(e.owner);
 if(channel==='reveal')return ['cruise','search','attack'].includes(e.owner)||e.owner==='departure'&&run.departure.phase==='notice';
 // A few calm frames between retreat and a new interception are not a
 // readable dialogue slot. Let that transition settle before selecting a line.
 // Hunt/pressure can change after the owner update within this physics step;
 // their current commitments must suppress dialogue without a one-frame leak.
 if(channel==='dialogue'||channel==='dialogue-start')return e.owner==='cruise'&&e.age>=.8&&!tacticChoiceOpen(run)&&!ATTACK_HUNTS.has(run.hunt?.phase)&&!['opening','gather'].includes(run.pressure?.phase)&&(channel==='dialogue'||!e.wasHidden);
 if(channel==='omen')return e.owner==='cruise';
 return false;
}
export function encounterQuiet(run){const e=run.encounter;return !!e?.updated&&['relief','checkpoint','recovery','diversion','search','opening'].includes(e.owner);}
export function encounterSpeedLimit(run){
 const e=run.encounter;if(!e?.updated)return Infinity;
 // Real engine deceleration and limited pursuit, not a teleport or stun.
 if(e.owner==='relief')return run.foot?4.5:8.5;
 if(e.owner==='recovery')return 4.5;
 if(tacticChoiceOpen(run))return Math.max(5,run.joe.ram.choiceSpeed||5);
 return Infinity;
}
export function updateEncounter(run,dt,visible){
 if(!['driving','sealing'].includes(run.mode))return run.encounter;
 const e=run.encounter||(run.encounter=createEncounter()),c=run.foot||run.cart,j=run.joe,ram=j.ram,h=run.hunt,gap=Math.hypot(c.x-j.x,c.y-j.y);
 e.updated=true;e.age+=dt;e.gap=gap;
 if(tacticChoiceOpen(run)&&visible)ram.choiceSpeed=c.speed+.2;
 if(run.cart.hits!==e.lastHits){e.lastHits=run.cart.hits;e.lastHitAt=run.time;}
 const hidden=!visible&&gap<95;
 if(hidden&&!e.wasHidden){e.hiddenAt={x:c.x,y:c.y,time:run.time};e.hiddenRewarded=false;}
 if(!hidden){e.hiddenAt=null;e.hiddenRewarded=false;}e.wasHidden=hidden;
 const available=run.mode==='driving'&&run.grace<=0&&c.invulnerable<=0&&run.time>=e.nextReliefAt&&run.time-e.lastHitAt>3&&gap>12&&c.y<780;
 let reward='';
 if(available){
  if(ram.phase==='missed'&&e.lastRam!=='missed')reward='dodged-charge';
  else if(h?.phase==='commit_recover'&&e.lastHunt!=='commit_recover')reward='evaded-lane';
  else if(e.hiddenAt&&!e.hiddenRewarded&&j.seenAge>=2&&gap>18&&run.time-e.hiddenAt.time>=2&&Math.hypot(c.x-e.hiddenAt.x,c.y-e.hiddenAt.y)>5&&ram.phase==='none'&&!(ram.footCharge>0)&&!ATTACK_HUNTS.has(h?.phase))reward='broke-sight';
 }
 if(reward){
  e.reliefUntil=run.time+(reward==='dodged-charge'?4.8:4.5);e.reliefReason=reward;e.nextReliefAt=run.time+14;e.rewards++;e.hiddenRewarded=true;
  run.events.push({type:'earned-relief',reason:reward,time:run.time});
 }
 e.lastRam=ram.phase;e.lastHunt=h?.phase||'follow';
 // A committed physical attack always completes its existing warning/heading
 // contract. An earned window cannot erase an attack already in flight.
 let owner='cruise';
 if(run.mode==='sealing'||run.finishHold>0)owner='finale';
 else if(run.foot&&c.invulnerable>0)owner='recovery';
 else if(run.grace>0)owner='checkpoint';
 else if(ram.phase==='lineup'||ram.footCharge>0||ram.release>0)owner='attack';
 else if(ram.phase==='backoff')owner='recovery';
 else if(run.decoys?.active>=0||run.utility?.active>=0||run.tactics?.active>=0)owner='diversion';
 else if(silenceActive(run))owner='silence';
 else if(run.time<e.reliefUntil)owner='relief';
 else if(ram.phase==='missed')owner='recovery';
 else if(ATTACK_HUNTS.has(h?.phase))owner='intercept';
 // Pressure-wave escape windows and their announced build-up own their
 // whole interval. A new ram or optional sting must not cut across either.
 // The pressure channel keeps ownership so its own timer can finish.
 else if(run.pressure?.phase==='opening')owner='opening';
 else if(run.pressure?.phase==='gather')owner='gather';
 else if(['windup','surge'].includes(run.tension?.phase))owner='tension';
 else if(departureActive(run))owner='departure';
 else if(!visible&&!j.senses?.heard&&j.seenAge>.7&&(j.senses?.observation||hidden&&run.time-(e.hiddenAt?.time??run.time)>.7))owner='search';
 if(e.owner!==owner){e.owner=owner;e.age=0;e.transitions++;}
 e.stage=run.mode==='sealing'||run.checkpoint===2&&c.y>700?'finale':run.foot?'flight':run.checkpoint>0||run.cart.health<65?'escalation':run.panic?.serial>0||run.cart.hits>0?'pursuit':'departure';
 return e;
}
