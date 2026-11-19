import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {createChaseAtmosphere} from '../web/chase-atmosphere.js';
import {COURSE,distance,angleDelta,clamp} from '../web/back-nine-course.js';
// The one-off before/after comparison against a saved pre-change
// back-nine-sim.js in output/ is retired; the current chase must still land a
// real approach from every starting gap and leave escape windows between hits.
function chase(sim,gap){const r=sim.createRun();r.mode='driving';r.grace=0;r.panic.armed=false;Object.assign(r.cart,{x:0,y:gap+5,speed:14});Object.assign(r.joe,{x:0,y:5});let firstHit=null,maxSpeed=0,gapAtThree=0;const hits=[];let n=0;
 for(let f=0;f<25*60&&!r.foot;f++){const target=COURSE.paths[0].find(p=>p[1]>r.cart.y+7)||COURSE.paths[0].at(-1),delta=angleDelta(Math.atan2(target[0]-r.cart.x,target[1]-r.cart.y),r.cart.yaw);sim.updateRun(r,{throttle:1,steer:clamp(delta*2,-1,1),brake:Math.abs(delta)>.7&&r.cart.speed>8},1/60);maxSpeed=Math.max(maxSpeed,r.joe.speed);if(f===179)gapAtThree=distance(r.cart,r.joe);if(r.cart.hits>n){n=r.cart.hits;firstHit??=r.time;hits.push(r.time);}}
 return {gap,firstHit,maxSpeed,gapAtThree,hits};}
const comparisons=[30,50,65].map(gap=>({after:chase({createRun,updateRun},gap)}));
for(const c of comparisons){assert(c.after.firstHit!==null&&c.after.firstHit<12,'Joe lands a real approach from every starting gap within the opening run');assert(c.after.hits.length>=2,'Pressure repeats after the first hit');assert(c.after.maxSpeed<=44+1e-9,'Within the 42+2 m/s pursuit cap');}
for(const c of comparisons)for(let i=1;i<c.after.hits.length;i++)assert(c.after.hits[i]-c.after.hits[i-1]>2.8,'Post-hit escape window');
const r=createRun();r.mode='driving';r.grace=0;r.time=24;r.cart.y=50;r.joe.x=r.cart.x;r.joe.y=35;r.joe.seenAge=0;r.tension.phase='stalk';const a=createChaseAtmosphere();a.update(r);for(let i=0;i<60;i++){r.time+=1/60;a.update(r);}assert(a.stats().storm>.9);assert(a.stats().dread>.8);assert(a.stats().ambientGain<.6);const pose={...a.stats()};r.mode='paused';for(let i=0;i<30;i++)a.update(r);assert.deepEqual(a.stats(),pose,'Pause freezes envelopes');r.mode='driving';r.joe.ram.phase='backoff';for(let i=0;i<120;i++){r.time+=1/60;a.update(r);}assert(a.stats().dread<.001);assert(a.stats().shadow<=.18);
r.mode='complete';a.update(r);assert.equal(a.stats().storm,0);assert.equal(a.stats().dread,0);
fs.mkdirSync('output/chase-menace',{recursive:true});fs.writeFileSync('output/chase-menace/simulation.json',JSON.stringify({passed:true,comparisons,atmosphere:pose},null,2));console.log(JSON.stringify({passed:true,comparisons,atmosphere:pose}));
