import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,distance,angleDelta,clamp,blocked} from '../web/back-nine-course.js';
import {vehicleOverlap} from '../web/vehicle-contact.js';
const out='output/joe-aggression';fs.mkdirSync(out,{recursive:true});
const results=[];
for(const moving of [true,false]){
 const r=createRun();r.mode='driving';let index=1,hits=0,maxSpeed=0,maxStep=0,last={...r.joe};const times=[];
 for(let f=0;f<24*60&&r.mode==='driving'&&!r.foot;f++){
  const route=COURSE.paths[0];while(index<route.length-1&&(distance(r.cart,{x:route[index][0],y:route[index][1]})<7||r.cart.y>route[index][1]+2))index++;
  const target={x:route[index][0],y:route[index][1]},turn=angleDelta(Math.atan2(target.x-r.cart.x,target.y-r.cart.y),r.cart.yaw);
  updateRun(r,moving?{throttle:1,steer:clamp(turn*2,-1,1),brake:Math.abs(turn)>.7&&r.cart.speed>8}:{},1/60);
  assert(!vehicleOverlap(r.cart,r.joe));assert(!blocked(r.joe,1.65));maxSpeed=Math.max(maxSpeed,r.joe.speed);maxStep=Math.max(maxStep,distance(last,r.joe));last={...r.joe};
  if(r.cart.hits!==hits){hits=r.cart.hits;times.push(r.time);assert.equal(r.joe.ram.phase,'backoff');}
 }
 results.push({moving,times,hits,maxSpeed,maxStep,health:r.cart.health,foot:!!r.foot,plans:r.joe.plans});
}
// Exposed-drive figures recorded from the pre-aggression tuning
// (output/joe-aggression/baseline.json, a local untracked snapshot).
const old=[{hits:2,maxSpeed:18.2247351419536,times:[11.483333333333483,20.583333333333446]}];
{assert(results[0].hits>=3,'At least three physical rams during exposed 24-second drive');assert(results[0].hits>old[0].hits);assert(results[0].maxSpeed>old[0].maxSpeed*1.25);assert(results[0].times[0]<old[0].times[0]);assert(results[0].health>0);for(const r of results){assert(r.maxStep<44/60+.003,'Joe stays within his 42+2 catch-up road cap (back-nine-sim.js)');for(let i=1;i<r.times.length;i++)assert(r.times[i]-r.times[i-1]>2.8,'Physical escape window between attacks');}}
fs.writeFileSync(`${out}/aggressive.json`,JSON.stringify(results,null,2));console.log(JSON.stringify({passed:true,results}));
