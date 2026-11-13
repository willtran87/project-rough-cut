import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,angleDelta,clamp,distance} from '../web/back-nine-course.js';
import {createUnease,sightingSafe,STAFF_SIGHTINGS} from '../web/chase-unease.js';

// Ordinary routes and real pursuit state, without moving Joe or overriding
// the director. This measures opportunity, not camera visibility or fear.
const out='output/back-nine-experience/staff-natural';fs.mkdirSync(out,{recursive:true});
const rows=[],sites=[...STAFF_SIGHTINGS,{id:'clubhouse-bay',x:-46.2,y:775.3}];
for(const seed of [0,2654435761])for(const branch of [0,3])for(const pace of [8,10,12,14]){
 let route=COURSE.paths[0];if(branch){const alt=COURSE.paths[branch],a=route.findIndex(p=>p[1]===alt[0][1]),b=route.findIndex(p=>p[1]===alt.at(-1)[1]);route=[...route.slice(0,a),...alt,...route.slice(b+1)];}
 const r=createRun(0,0,seed);r.mode='driving';const initialOpeningStaged=createUnease(r).site===0;let i=1,served=0,hold=0;
 const opportunities=sites.map(p=>({id:p.id,nearSeconds:0,safeSeconds:0,longestSafe:0,currentSafe:0,owners:{},reasons:{},samples:[]}));
 for(let f=0;f<10800&&['driving','sealing'].includes(r.mode);f++){
  const c=r.foot||r.cart;while(i<route.length-1&&(distance(c,{x:route[i][0],y:route[i][1]})<(r.foot?2:7)||c.y>route[i][1]+2))i++;
  let target=c.y>788?COURSE.finish:{x:route[i][0],y:route[i][1]},service=served<2&&!r.foot&&c.y>COURSE.checkpoints[served].y-25&&c.y<COURSE.checkpoints[served].y+5;
  if(service)target=COURSE.checkpoints[served];const d=distance(c,target),delta=angleDelta(Math.atan2(target.x-c.x,target.y-c.y),c.yaw),near=distance(c,COURSE.finish)<(r.foot?1:4.5),charging=service&&d<4&&c.speed<.7;
  if(charging){hold+=1/60;if(hold>3.6){served++;hold=0;}}const desired=service?clamp((d-2)*2,0,pace):pace;
  updateRun(r,r.foot?{throttle:near?0:Math.abs(delta)>1.1?0:1,steer:near?0:clamp(delta*2,-1,1),brake:near}:{throttle:near||charging||c.speed>desired?0:1,steer:charging?0:clamp(delta*2,-1,1),brake:near||charging||c.speed>desired+.3||Math.abs(delta)>.7&&c.speed>8},1/60);
  for(const [n,p]of sites.entries()){
   const o=opportunities[n],dist=distance(c,p),eligible=dist<61&&dist>12&&c.y>p.y-48&&c.y<p.y+8;
   if(!eligible){o.currentSafe=0;continue;}
   o.nearSeconds+=1/60;o.owners[r.encounter.owner]=(o.owners[r.encounter.owner]||0)+1/60;
   const safe=sightingSafe(r),gap=distance(c,r.joe);
   o.currentSafe=safe?o.currentSafe+1/60:0;o.longestSafe=Math.max(o.longestSafe,o.currentSafe);if(safe)o.safeSeconds+=1/60;
   const reasons={foot:!!r.foot,grace:r.grace>0,invulnerable:c.invulnerable>0,speed:Math.abs(c.speed)>=11.5,gap:gap<=42,owner:r.encounter.owner!=='cruise',ram:r.joe.ram.phase!=='none'||r.joe.ram.footCharge>0,hunt:r.hunt.phase!=='follow',tension:['windup','surge','breather'].includes(r.tension.phase),impact:r.lastImpact>0,finish:!!r.finishHold};
   for(const [key,blocked]of Object.entries(reasons))if(blocked)o.reasons[key]=(o.reasons[key]||0)+1/60;
   if(f%30===0)o.samples.push({time:r.time,x:c.x,y:c.y,speed:c.speed,gap,owner:r.encounter.owner,ram:r.joe.ram.phase,hunt:r.hunt.phase,tension:r.tension.phase,safe});
  }
 }
 rows.push({seed,branch,pace,mode:r.mode,foot:!!r.foot,initialOpeningStaged,opportunities});
}
const baseline=JSON.parse(fs.readFileSync(out+'/baseline-opportunities.json','utf8'));
assert.deepEqual(rows.map(({initialOpeningStaged,...r})=>r),baseline.rows,'All observed simulation positions, speeds, phases and outcomes remain unchanged');
assert(rows.every(r=>r.initialOpeningStaged));
fs.writeFileSync(out+'/opportunities.json',JSON.stringify({passed:true,unchangedSimulation:true,rows},null,2));
console.log(JSON.stringify({passed:true,runs:rows.length,unchangedSimulation:true,openingDressed:rows.filter(r=>r.initialOpeningStaged).length,lateOpportunitySeconds:rows.map(r=>r.opportunities.map(o=>o.safeSeconds))}));
