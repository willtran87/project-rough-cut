import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,angleDelta,clamp,distance} from '../web/back-nine-course.js';
import {vehicleOverlap} from '../web/vehicle-contact.js';
const drives=[];
const seeds=Array.from({length:16},(_,i)=>Math.imul(i+1,2654435761)>>>0);
for(const seed of seeds)for(const [branch,useService] of [[0,true],[3,true],[7,true],[0,false]]){
 let route=COURSE.paths[0];if(branch){const alt=COURSE.paths[branch],a=route.findIndex(p=>p[1]===alt[0][1]),b=route.findIndex(p=>p[1]===alt.at(-1)[1]);route=[...route.slice(0,a),...alt,...route.slice(b+1)];}
 const r=createRun(0,0,seed);r.mode='driving';let i=1,served=0,hold=0,maxStep=0;const serviceEntries=[];const warnings=[];let lastPhase='follow';
 for(let f=0;f<10800&&['driving','sealing'].includes(r.mode);f++){
  const c=r.foot||r.cart;while(i<route.length-1&&(distance(c,{x:route[i][0],y:route[i][1]})<(r.foot?2:7)||c.y>route[i][1]+2))i++;
  let target=c.y>788?COURSE.finish:{x:route[i][0],y:route[i][1]},service=useService&&served<2&&!r.foot&&c.y>COURSE.checkpoints[served].y-25&&c.y<COURSE.checkpoints[served].y+5;
  if(service)target=COURSE.checkpoints[served];const d=distance(c,target),delta=angleDelta(Math.atan2(target.x-c.x,target.y-c.y),c.yaw),near=distance(c,COURSE.finish)<(r.foot?1:4.5),charging=service&&d<4&&c.speed<.7;
  if(charging){if(hold===0)serviceEntries[served]=c.health;hold+=1/60;if(hold>3.6){served++;hold=0;}}const desired=service?clamp((d-2)*2,0,14):14,old={...r.joe};
  updateRun(r,r.foot?{throttle:near?0:Math.abs(delta)>1.1?0:1,steer:near?0:clamp(delta*2,-1,1),brake:near}:{throttle:near||charging||c.speed>desired?0:1,steer:charging?0:clamp(delta*2,-1,1),brake:near||charging||c.speed>desired+.3||Math.abs(delta)>.7&&c.speed>8},1/60);
  maxStep=Math.max(maxStep,distance(old,r.joe));assert(!vehicleOverlap(r.cart,r.joe));if(lastPhase!==r.hunt.phase&&['signal','commit_warning'].includes(r.hunt.phase))warnings.push({kind:r.hunt.phase==='signal'?'intercept':r.hunt.commit.kind,seconds:r.time,x:c.x,y:c.y,gap:distance(c,r.joe),target:JSON.parse(JSON.stringify(r.hunt.waypoints))});lastPhase=r.hunt.phase;
 }
 assert.equal(r.mode,'complete',JSON.stringify({seed,branch,useService,mode:r.mode,y:(r.foot||r.cart).y,health:r.cart.health,joe:r.joe,hunt:r.hunt}));if(useService){assert.equal(served,2);assert(r.service.remaining.every((n,i)=>n>=0&&n<=25&&(serviceEntries[i]===100||n<25)),'Damaged service arrivals consume repair supply; a full cart need not waste it');}assert(maxStep<36.5/60+.003);const districts=r.events.filter(e=>e.type==='district-encounter').map(e=>e.id);
 drives.push({seed,branch,useService,health:r.cart.health,onFoot:!!r.foot,hits:r.cart.hits,seconds:r.time,maxStep,districts,warnings,closePasses:r.hunt.commit.passes,serviceRemaining:r.service.remaining,tacticChoices:r.events.filter(e=>e.type==='tactic-choice').length});
}

assert(drives.some(d=>d.onFoot));assert(drives.some(d=>!d.onFoot));
const patterns=new Set(drives.map(d=>JSON.stringify(d.warnings.map(w=>[w.kind,Math.round(w.x),Math.round(w.y)]))));fs.writeFileSync('output/back-nine-experience/variation/route-coverage.json',JSON.stringify({patterns:patterns.size,drives},null,2));assert(patterns.size>4,'Variation must change actual encounters, not just a seed field');
const out='output/back-nine-experience/variation';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/routes.json',JSON.stringify({passed:true,drives,patterns:patterns.size},null,2));console.log(JSON.stringify({passed:true,runs:drives.length,intact:drives.filter(d=>!d.onFoot).length,onFoot:drives.filter(d=>d.onFoot).length,patterns:patterns.size,minHealth:Math.min(...drives.filter(d=>!d.onFoot).map(d=>d.health)),timeRange:[Math.min(...drives.map(d=>d.seconds)),Math.max(...drives.map(d=>d.seconds))]}));
