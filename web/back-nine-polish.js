// Polish-pass rules for the Back Nine that sit beside the simulation: the
// difficulty table, the Use highlight / hold ring, the end-of-run statistics
// and discoveries, and controller rumble. Every function here reads the run;
// only applyDifficulty writes to it, and only before the first step.
import {garageHoldRatio,insideGarage} from './chase-garage.js';
import {TACTIC_HOLD,TACTIC_STATIONS,EXIT_RELEASE_SECONDS,EXIT_CLEARANCE} from './chase-tactics.js';
import {GATE_UNLATCH_SECONDS} from './chase-shortcuts.js';
import {SERVICE_CAPACITY} from './chase-service.js';
import {chaseActor} from './chase-player.js';
import {cartRumble} from './cart-rumble.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

// Standard is the absence of a record, so its simulation is unchanged bit for
// bit. Relaxed and Hard carry two explicit multipliers (Joe's travel speed and
// ram damage). Only Relaxed makes a relay a retry point: Standard and Hard
// keep the chapter's original rule, no checkpoints.
export const DIFFICULTY=Object.freeze({
 relaxed:Object.freeze({name:'relaxed',joe:.92,damage:.7,checkpoints:true}),
 standard:Object.freeze({name:'standard',joe:1,damage:1,checkpoints:false}),
 hard:Object.freeze({name:'hard',joe:1.06,damage:1.3,checkpoints:false}),
});
export const difficultyOf=name=>DIFFICULTY[name]||DIFFICULTY.standard;
export function applyDifficulty(run,name){
 if((run.time||0)>0)return run.difficulty?.name||'standard';
 const d=difficultyOf(name);if(d.name==='standard')delete run.difficulty;else run.difficulty={name:d.name,joe:d.joe,damage:d.damage};
 return d.name;
}

// One description of "what would Use do here": available means a prompt ring
// is shown, ratio fills it while the key is held. Mirrors the sim's own
// conditions and never changes them.
export function holdState(run){
 const none={available:false,ratio:0,label:''};
 if(!run||run.mode!=='driving'||run.death)return none;
 const c=chaseActor(run),slow=Math.abs(c.speed||0)<=.7;
 const s=run.story,t=run.tactics,x=run.exitRelease,fx=run.courseFX,v=run.service;
 if(x&&run.checkpoint===2&&!x.released&&x.near)return {available:true,ratio:clamp(x.hold/EXIT_RELEASE_SECONDS),label:'Free the shutter',ready:slow};
 if(run.checkpoint===2&&(!x||x.open>=EXIT_CLEARANCE)&&insideGarage(c,!!run.foot))return {available:true,ratio:garageHoldRatio(run),label:'Lock the shutter',ready:Math.abs(c.speed||0)<3};
 if(fx&&fx.gateNear>=0){const g=fx.breaks[fx.gateNear];if(g&&g.age<0&&g.open<1&&!g.unlatched)return {available:true,ratio:clamp((g.press||0)/GATE_UNLATCH_SECONDS),label:'Unlatch the gate',ready:slow};}
 if(t&&t.near>=0)return {available:true,ratio:clamp(t.hold/TACTIC_HOLD),label:TACTIC_STATIONS[t.near]?.label||'Use',ready:slow};
 if(v&&v.active>=0)return {available:true,ratio:clamp(1-v.remaining[v.active]/SERVICE_CAPACITY),label:'Charging',ready:true};
 if(s&&s.near>=0)return {available:true,ratio:clamp(s.hold/1.1),label:'Crew log',ready:slow};
 if(v&&v.near>=0)return {available:true,ratio:0,label:'Charger',ready:slow};
 return none;
}

// Optional goals, remembered across runs. Each is earned by evidence already
// in the run's event log or final state.
export const DISCOVERIES=Object.freeze([
 {id:'crew-log-0',title:'The last groundskeeper’s log'},
 {id:'crew-log-1',title:'The empty clubhouse log'},
 {id:'flood',title:'Flooded an approach under Joe'},
 {id:'decoy',title:'Sent the empty cart rolling'},
 {id:'gate',title:'Unlatched a narrow cut'},
 {id:'clean',title:'Reached the garage without a scratch'},
 {id:'on-foot',title:'Finished on foot'},
 {id:'close-shave',title:'Three close calls in one run'},
]);
export function discoveriesIn(run,from=0){
 const found=[];
 for(let i=from;i<run.events.length;i++){
  const e=run.events[i];
  if(e.type==='crew-log')found.push('crew-log-'+e.index);
  else if(e.type==='course-tactic')found.push(TACTIC_STATIONS.find(s=>s.id===e.id)?.kind==='cart'?'decoy':'flood');
  else if(e.type==='gate-unlatched')found.push('gate');
  else if(e.type==='complete'){if(run.foot)found.push('on-foot');else if(run.cart.health>=100&&run.cart.hits===0)found.push('clean');}
 }
 if((run.experience?.nearMiss?.serial||0)>=3)found.push('close-shave');
 return found;
}
const ROUTES={'on-foot':'On foot','battered-cart':'Battered cart','running-cart':'Cart intact'};
export function runStats(run,{carriedSeconds=0,carriedCalls=0,retries=0}={}){
 const logs=(run.story.collected&1?1:0)+(run.story.collected&2?1:0);
 return {seconds:carriedSeconds+run.time,closeCalls:carriedCalls+(run.experience?.nearMiss?.serial||0),route:ROUTES[run.escape?.kind]||'',difficulty:run.difficulty?.name||'standard',
  extras:{'Cart health':run.foot?'Wrecked':Math.ceil(run.cart.health)+'%','Hits taken':run.cart.hits|0,'Crew logs':logs+' of 2',...(retries?{'Relay retries':retries}:{})}};
}

// Controller rumble from what the run shows this frame. `rumble` is the shared
// pad-rumble object; `pad` may be null. Returns the kind played, for checks.
export function createRumbleFeedback(rumble){
 let owner=null,impact=0,miss=0,launch=0,checkpoint=0,foot=false,dead=false,contacts=0;
 return function present(run,pad,footContacts=[]){
  if(owner!==run){owner=run;impact=run.impact?.serial||0;miss=run.experience?.nearMiss?.serial||0;launch=run.joe?.ram?.launches||0;checkpoint=run.checkpoint;foot=!!run.foot;dead=!!run.death;contacts=0;}
  if(!pad)return '';
  let played='';
  const hit=run.impact;
  if(hit&&hit.serial!==impact){impact=hit.serial;if(hit.age<.3){const power=clamp(hit.strength||0);rumble.pulse(pad,hit.damaged?{duration:180+power*160,strong:.55+power*.45,weak:.5,kind:'impact'}:{duration:90,strong:.3,weak:.25,kind:'bump'});played='impact';}}
  if(!!run.death!==dead){dead=!!run.death;if(dead){rumble.pulse(pad,{duration:650,strong:1,weak:.8,kind:'run-down'});played='run-down';}}
  if(!!run.foot!==foot){foot=!!run.foot;if(foot){rumble.pulse(pad,{duration:420,strong:.9,weak:.6,kind:'wreck'});played='wreck';}}
  const n=run.experience?.nearMiss?.serial||0;if(n!==miss){miss=n;rumble.pulse(pad,{duration:110,strong:.15,weak:.6,kind:'near-miss'});played=played||'near-miss';}
  const l=run.joe?.ram?.launches||0;if(l!==launch){launch=l;rumble.pulse(pad,{duration:140,strong:.35,weak:.2,kind:'ram-launch'});played=played||'ram-launch';}
  if(run.checkpoint!==checkpoint){checkpoint=run.checkpoint;rumble.pulse(pad,{duration:160,strong:.2,weak:.5,kind:'relay'});played=played||'relay';}
  if(footContacts.length>contacts||footContacts.length&&!contacts){rumble.pulse(pad,{duration:35,strong:0,weak:.18,kind:'step'});played=played||'step';}
  contacts=0;
  if(run.mode==='driving'&&!run.foot&&!run.death){
   // Engine and ground texture, plus the mower's weight as it lines up close.
   const r=cartRumble(run),speed=clamp(Math.abs(run.cart.speed||0)/10),lineup=run.joe?.ram?.phase==='lineup'?.35:0;
   if(rumble.hum(pad,clamp(.12*speed+r.intensity*.75*speed+lineup),{strong:.3,weak:.55}))played=played||'hum';
  }
  return played;
 };
}

// Loading: the scene reports three named stages; map them, and the time spent
// inside the long last one, onto a bar that only ever moves forward.
const STAGES=[['Laying out',.12],['Preparing the cart',.52],['Preparing course details',.78]];
export function loadingFraction(message,previous=0,secondsInStage=0){
 let base=.04,next=.12;
 for(let i=0;i<STAGES.length;i++)if(String(message).startsWith(STAGES[i][0])){base=STAGES[i][1];next=STAGES[i+1]?.[1]??.98;}
 return Math.max(previous,Math.min(next,base+(next-base)*(1-Math.exp(-secondsInStage/2.5))));
}
