import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,planMowerRoute,mowerLineClear,distance,navigationStats} from '../web/back-nine-course.js';
const reportOnly=process.argv.includes('--report'),label=process.argv.includes('--before')?'before':'after',out='output/back-nine-experience/districts';fs.mkdirSync(out,{recursive:true});
const start={x:-4.643935297,y:582.431010458},end={x:28,y:673},plan=planMowerRoute(start,end),firstLegClear=plan.points.length>0&&mowerLineClear(start,plan.points[0]);
const r=createRun(2);r.mode='driving';r.grace=0;r.panic.serial=1;r.tension.phase='stalk';Object.assign(r.cart,{...end,speed:0});Object.assign(r.joe,{...start,yaw:1.244979337,speed:.314697,seenAge:0,lastSeen:{...end}});r.hunt.cooldown=999;
const times=[];let maxPlansPerSecond=0,priorPlans=0;
for(let i=0;i<720&&r.mode==='driving';i++){const then=performance.now();updateRun(r,{},1/60);times.push(performance.now()-then);if(i%60===59){maxPlansPerSecond=Math.max(maxPlansPerSecond,r.joe.plans-priorPlans);priorPlans=r.joe.plans;}}
times.sort((a,b)=>a-b);const result={firstLegClear,firstPoints:plan.points.slice(0,3),joe:{x:r.joe.x,y:r.joe.y},travel:distance(start,r.joe),plans:r.joe.plans,maxPlansPerSecond,frames:times.length,p95:times[Math.floor(times.length*.95)],p99:times[Math.floor(times.length*.99)],navigation:navigationStats()};fs.writeFileSync(`${out}/rejoin-${label}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
if(!reportOnly){assert(firstLegClear);assert(r.joe.y>620,'Joe must leave the shelter rather than orbit its post');assert(maxPlansPerSecond<=16,'Persistent contact must not replan every simulation tick');assert(result.navigation.baked);assert.equal(result.navigation.edgeChecks,0);
 // Exercise route entry around every shelter corner, both sides of each
 // narrow decision and the garage approaches, not just the reported sample.
 const starts=[start,...COURSE.checkpoints.flatMap(c=>[-1,1].flatMap(s=>[-1,1].map(d=>({x:c.x+s*4.65,y:c.y+d*2.43})))),...COURSE.decisions.flatMap(d=>[{x:d.gate.x-3,y:d.gate.y-5},{x:d.gate.x+3,y:d.gate.y+5}])];let legs=0;
 for(const from of starts)for(const target of [{x:0,y:40},{x:0,y:300},{x:0,y:580},end,{x:-23,y:797.2}]){const route=planMowerRoute(from,target);let prior=from;for(const p of route.points){assert(mowerLineClear(prior,p),JSON.stringify({from,target,prior,p}));prior=p;legs++;}}console.log(JSON.stringify({passed:true,checkedLegs:legs}));}
