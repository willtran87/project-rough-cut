import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,blocked,lineClear,distance,angleDelta,clamp} from '../web/back-nine-course.js';
import {decoyTarget} from '../web/back-nine-decoys.js';
const results=[];
function staged(i=0){const a=COURSE.alarms[i],r=createRun(i);r.mode='driving';r.grace=0;r.tension.phase='stalk';Object.assign(r.cart,{x:a.x,y:a.y});Object.assign(r.joe,{x:a.bell.x,y:a.y-6,speed:0});return r;}
function step(r,input,n=1){for(let i=0;i<n;i++)updateRun(r,input,1/60);}
for(let i=0;i<3;i++){
 const r=staged(i),a=COURSE.alarms[i];assert(!blocked(a,.85));assert(!blocked(a.bell,1.85));assert(!lineClear(r.joe,r.cart,.1));
 step(r,{brake:true},30);assert.equal(r.decoys.used,0);assert(r.decoys.hold>0);
 step(r,{},1);assert.equal(r.decoys.hold,0,'Release cancels charging');step(r,{brake:true},43);
 assert.equal(r.decoys.active,i);assert.equal(r.decoys.used,1<<i);assert.equal(r.joe.mode,'investigate_alarm');assert.deepEqual(decoyTarget(r),a.bell);
 const prior=distance(r.joe,a.bell),before={...r.joe};step(r,{brake:true},270);const gained=prior-distance(r.joe,a.bell);assert(gained>0,'Mower must actually move toward sound');assert(distance(before,r.joe)<45);assert.equal(r.cart.hits,0);
 const snapshot=JSON.stringify(r);r.mode='paused';const paused=JSON.stringify(r);step(r,{brake:true},60);assert.equal(JSON.stringify(r),paused);r.mode='driving';assert.equal(JSON.stringify(r),snapshot);
 step(r,{brake:true},420);assert.equal(r.decoys.active,-1);assert.equal(r.decoys.serial,1,'Treadles cannot be farmed');assert.equal(r.decoys.result,'expired');
 results.push({alarm:i,investigationDistance:gained,expired:true,oneUse:true});
}
const heard=staged();step(heard,{brake:true},43);heard.cart.speed=7;step(heard,{});assert.equal(heard.decoys.active,-1);assert.equal(heard.decoys.result,'heard');
const seen=staged();step(seen,{brake:true},43);Object.assign(seen.cart,{x:seen.joe.x,y:seen.joe.y+14});step(seen,{});assert.equal(seen.decoys.result,'seen');assert.equal(seen.decoys.active,-1);
const failure=staged();failure.joe.x=failure.cart.x;failure.joe.y=failure.cart.y-20;step(failure,{brake:true},43);assert.equal(failure.decoys.result,'failed');assert.equal(failure.decoys.active,-1);
const coast=staged();coast.cart.speed=5;coast.joe.lastSeen={x:0,y:100};step(coast,{});assert.deepEqual(coast.joe.lastSeen,{x:0,y:100},'Coasting behind cover must not track hidden player');
for(const p of COURSE.machinery){assert(blocked(p,.85));assert(COURSE.alarms.every(a=>distance(p,a)>5));}
const retry=createRun(1);assert.equal(retry.decoys.used,0);assert.equal(retry.decoys.active,-1);
// The same mechanism remains usable after the cart fails; holding Use maps to
// brake in both modes. Put the wreck away from the treadle, not under the runner.
for(let i=0;i<3;i++){
 const r=staged(i),a=COURSE.alarms[i];r.foot={x:a.x,y:a.y,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};
 Object.assign(r.cart,{x:0,y:30,health:0});step(r,{brake:true},43);
 assert.equal(r.decoys.active,i,'Runner can activate each covered bell');assert.equal(r.joe.mode,'investigate_alarm');
 step(r,{brake:true},120);assert.equal(r.mode,'driving');assert.equal(r.foot.invulnerable,0,'Bell must not manufacture invulnerability');
 results.push({alarm:i,onFoot:true,diverted:true});
}
// Same input-driven lane and quiet speed policy, with/without stopping on the
// treadle. A diversion must buy useful escape distance, not just rename AI.
function escape(use){const r=staged();r.joe.lastSeen={x:r.cart.x,y:r.cart.y};r.joe.seenAge=.2;let n=0;const samples=[];const route=[{x:-24,y:165},{x:10,y:190},...COURSE.paths[0].filter(p=>p[1]>190&&p[1]<=235).map(([x,y])=>({x,y}))];
 for(let i=0;i<600;i++){while(n<route.length-1&&distance(r.cart,route[n])<4)n++;const turn=angleDelta(Math.atan2(route[n].x-r.cart.x,route[n].y-r.cart.y),r.cart.yaw),charge=i<43;step(r,{brake:use&&charge||Math.abs(turn)>.7&&r.cart.speed>8,throttle:!charge&&r.cart.speed<(distance(r.cart,r.joe)>48?14:5.5)?1:0,steer:clamp(turn*2,-1,1)});if(i%60===59)samples.push({seconds:r.time,gap:distance(r.cart,r.joe),travel:r.distance,hits:r.cart.hits,active:r.decoys.active});}
 return {gap:distance(r.cart,r.joe),travel:r.distance,hits:r.cart.hits,samples};}
const direct=escape(false),diverted=escape(true);
// The bell is finite and fresh sight restores pursuit. Measure sustained usable
// separation during the escape, not permanent separation after reacquisition.
const relief=diverted.samples.filter((s,i)=>s.gap>direct.samples[i].gap+30&&s.hits===0);
assert(relief.length>=3,'Diversion must buy at least three sampled seconds of useful separation');
assert(diverted.travel>direct.travel+15,'Diversion must translate into actual route progress');
assert.equal(diverted.hits,0);assert(direct.hits>0,'Control route must retain real pursuit pressure');
fs.mkdirSync('output/night-machinery',{recursive:true});fs.writeFileSync('output/night-machinery/simulation.json',JSON.stringify({passed:true,results,escape:{direct,diverted},checks:['hold/release','all three investigate','expiry','one use','pause','sound reacquisition','visual reacquisition','seen activation fails','quiet coast','solid pumps','clean retry','useful escape distance']},null,2));console.log('Decoy decisions passed: all three alarms, real escape benefit, evidence reacquisition, expiry, pause and retry.');
