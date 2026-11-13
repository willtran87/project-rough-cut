import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateHunt,DISTRICT_ENCOUNTERS} from '../web/back-nine-hunt.js';
import {offerTacticChoice,tacticChoiceOpen,encounterAllows,encounterSpeedLimit} from '../web/chase-encounter.js';
import {COURSE,angleDelta,clamp,distance,lineClear,mowerLineClear,planMowerRoute} from '../web/back-nine-course.js';
import {vehicleOverlap} from '../web/vehicle-contact.js';
import {chaseMessages} from '../web/back-nine-messages.js';
const checks=[],staged=[];
for(const [index,x,y,jx,jy]of [[0,4.5,183,4.5,161],[1,-16,400,-22,376],[2,28,640,28,616]]){
 const r=createRun(index);r.mode='driving';r.grace=0;r.panic.serial=1;r.tension.phase='stalk';Object.assign(r.cart,{x,y,speed:8});Object.assign(r.joe,{x:jx,y:jy,yaw:0,speed:12});assert(lineClear(r.joe,r.cart,.1));updateRun(r,{throttle:1},1/60);
 const d=DISTRICT_ENCOUNTERS[index];assert.equal(r.hunt.lastDistrict,d.id);assert(r.hunt.districtMask&(1<<index));assert.equal(r.hunt.phase,index===1?'signal':'commit_warning');
 assert.equal(chaseMessages(r).sound,'');assert.match(chaseMessages(r,{soundCaptions:true}).sound,/Mower/);assert(!/RAM|HEADLIGHTS|CHOSEN YOUR LANE/.test(chaseMessages(r).banner));
 const points=JSON.stringify(r.hunt.waypoints);let previous={...r.joe};for(const point of r.hunt.waypoints){const route=planMowerRoute(previous,point);assert(route.points.length,'Each announced leg has a physical connection');for(const p of route.points){assert(mowerLineClear(previous,p));previous=p;}}
 r.cart.x-=10;const warning=index===1?1.5:1.8;for(let i=0;i<Math.floor(warning*60)-1;i++)updateHunt(r,1/60,false);assert.equal(r.hunt.phase,index===1?'signal':'commit_warning');assert.equal(JSON.stringify(r.hunt.waypoints),points,'Hidden turn does not update the announced corridor');updateHunt(r,1/30,false);assert.equal(r.hunt.phase,index===1?'flank':d.kind==='pass'?'close_pass':'lane_commit');assert.equal(r.events.filter(e=>e.type==='district-encounter').length,1);staged.push({id:d.id,kind:d.kind,points:JSON.parse(points),warning});
}
checks.push('Three spatial priorities select distinct feasible attacks with full warnings, captured targets and optional sound captions');
const choice=createRun();choice.mode='driving';choice.grace=0;choice.time=10;Object.assign(choice.cart,{y:175,speed:12});Object.assign(choice.joe,{y:155,seenAge:0});Object.assign(choice.joe.ram,{phase:'backoff',age:1.1,cycles:2});Object.assign(choice.encounter,{updated:true,owner:'cruise'});assert(offerTacticChoice(choice));assert(tacticChoiceOpen(choice));assert.equal(encounterAllows(choice,'ram'),false);assert.equal(encounterSpeedLimit(choice),12.2);choice.cart.speed=0;assert.equal(encounterSpeedLimit(choice),12.2,'Choice pace comes from observed speed');assert.equal(offerTacticChoice(choice),false,'Cannot renew the window without another physical retreat');choice.mode='paused';const frozen=JSON.stringify(choice);updateRun(choice,{throttle:1},1/60);assert.equal(JSON.stringify(choice),frozen);choice.mode='driving';choice.encounter.owner='relief';assert.equal(encounterSpeedLimit(choice),8.5,'Earned relief overrides tactic selection');choice.time=12.41;choice.encounter.owner='cruise';assert.equal(tacticChoiceOpen(choice),false);assert(encounterAllows(choice,'ram'));
for(const reason of ['stationary','foot','grace','odd','too-soon','unseen']){const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{y:175,speed:12});Object.assign(r.joe,{y:155,seenAge:0});Object.assign(r.joe.ram,{phase:'backoff',age:1.1,cycles:2});if(reason==='stationary')r.cart.speed=0;if(reason==='foot')r.foot={...r.cart};if(reason==='grace')r.grace=1;if(reason==='odd'){r.joe.ram.cycles=1;r.hunt.districtMask=7;}if(reason==='too-soon')r.joe.ram.age=.8;if(reason==='unseen')r.joe.seenAge=1;assert.equal(offerTacticChoice(r),false,reason);}
checks.push('Tactic choice starts only after a real completed retreat, expires, pauses, uses observed pace and yields to earned protection');
const drives=[];
for(const [branch,useService,seed=0,pace=14] of [[0,true],[3,true],[7,true],[0,false],[3,true,2654435761],[3,true,0,12],[0,true,0,10]]){
 let route=COURSE.paths[0];if(branch){const alt=COURSE.paths[branch],a=route.findIndex(p=>p[1]===alt[0][1]),b=route.findIndex(p=>p[1]===alt.at(-1)[1]);route=[...route.slice(0,a),...alt,...route.slice(b+1)];}
 const r=createRun(0,0,seed);r.mode='driving';let i=1,served=0,hold=0,maxStep=0;const serviceEntries=[];const warnings=[];let lastPhase='follow';
 for(let f=0;f<10800&&['driving','sealing'].includes(r.mode);f++){
  const c=r.foot||r.cart;while(i<route.length-1&&(distance(c,{x:route[i][0],y:route[i][1]})<(r.foot?2:7)||c.y>route[i][1]+2))i++;
  let target=c.y>788?COURSE.finish:{x:route[i][0],y:route[i][1]},service=useService&&served<2&&!r.foot&&c.y>COURSE.checkpoints[served].y-25&&c.y<COURSE.checkpoints[served].y+5;
  if(service)target=COURSE.checkpoints[served];const d=distance(c,target),delta=angleDelta(Math.atan2(target.x-c.x,target.y-c.y),c.yaw),near=distance(c,COURSE.finish)<(r.foot?1:4.5),charging=service&&d<4&&c.speed<.7;
  if(charging){if(hold===0)serviceEntries[served]=c.health;hold+=1/60;if(hold>3.6){served++;hold=0;}}const desired=service?clamp((d-2)*2,0,pace):pace,old={...r.joe};
  updateRun(r,r.foot?{throttle:near?0:Math.abs(delta)>1.1?0:1,steer:near?0:clamp(delta*2,-1,1),brake:near}:{throttle:near||charging||c.speed>desired?0:1,steer:charging?0:clamp(delta*2,-1,1),brake:near||charging||c.speed>desired+.3||Math.abs(delta)>.7&&c.speed>8},1/60);
  maxStep=Math.max(maxStep,distance(old,r.joe));assert(!vehicleOverlap(r.cart,r.joe));if(lastPhase!==r.hunt.phase&&['signal','commit_warning'].includes(r.hunt.phase))warnings.push({kind:r.hunt.phase==='signal'?'intercept':r.hunt.commit.kind,seconds:r.time,x:c.x,y:c.y,gap:distance(c,r.joe),target:JSON.parse(JSON.stringify(r.hunt.waypoints))});lastPhase=r.hunt.phase;
 }
 assert.equal(r.mode,'complete');if(useService){assert.equal(served,2);assert(r.service.remaining.every((n,i)=>n>=0&&n<=25&&(serviceEntries[i]===100||n<25)),'Damaged service arrivals consume repair supply; a full cart need not waste it');}assert(maxStep<36.5/60+.003);const districts=r.events.filter(e=>e.type==='district-encounter').map(e=>e.id);
 if(pace===12){assert(districts.includes('clubhouse-pass'));assert(r.hunt.commit.passes>0,'The real moderate-pace route must produce an actual overtake, not only a warning');}
 drives.push({branch,useService,seed,pace,health:r.cart.health,onFoot:!!r.foot,hits:r.cart.hits,seconds:r.time,maxStep,districts,warnings,closePasses:r.hunt.commit.passes,serviceRemaining:r.service.remaining,tacticChoices:r.events.filter(e=>e.type==='tactic-choice').length});
}
assert.deepEqual([...new Set(drives.flatMap(d=>d.districts))].sort(),DISTRICT_ENCOUNTERS.map(d=>d.id).sort(),'All authored opportunities occur across real routes and seeds');
assert(drives.some(d=>d.onFoot),JSON.stringify(drives.map(({branch,useService,health,hits})=>({branch,useService,health,hits}))));assert(drives.some(d=>!d.onFoot&&d.health>0));checks.push('Full normal-health runs with real repair stops reach all three encounters, preserve contact separation and finish both with a cart and on foot');
const out='output/back-nine-experience/districts';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/simulation.json',JSON.stringify({passed:true,checks,staged,drives},null,2));console.log(JSON.stringify({passed:true,checks,drives}));
