import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,distance} from '../web/back-nine-course.js';
import {beginCartImpact,stepCartImpact,cartImpactPose,cartShoveClear} from '../web/cart-impact.js';
const results=[];
function fixture(x=0,y=35,yaw=0,side=0,front=-1,strength=1){const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{x,y,yaw,speed:12});Object.assign(r.joe,{x:0,y:3});r.impact={age:0,serial:1,damaged:true,strength,side,front,yaw};return r;}
for(const [side,front]of [[0,-1],[0,1],[-1,0],[1,0]])for(const strength of [.32,1]){
 const r=fixture(0,35,0,side,front,strength),start={...r.cart};beginCartImpact(r);assert(r.cart.speed<12&&r.cart.speed>5);
 for(let i=0;i<30;i++){r.impact.age+=1/60;stepCartImpact(r,1/60);assert(cartShoveClear(r.cart,r.joe));}
 const moved=distance(start,r.cart);assert(moved>.3&&moved<=.641);assert(Math.abs(moved-r.impact.pushDistance)<1e-6);assert((r.cart.x-start.x)*side+(r.cart.y-start.y)*front<0);
 results.push({side,front,strength,moved,speed:r.cart.speed});
}
// Stop at boundary, a thin shelter post, a landmark and a garage wall.
for(const [x,y,side,front]of [[38.7,35,-1,0],[3.7,293.9,0,-1],[8.25,205,-1,0],[-18.8,807,-1,0]]){
 const r=fixture(x,y,0,side,front);assert(cartShoveClear(r.cart,r.joe));beginCartImpact(r);
 for(let i=0;i<20;i++){r.impact.age+=1/60;stepCartImpact(r,1/60);assert(cartShoveClear(r.cart,r.joe),'Shove penetrated scenery');}
 assert(r.impact.pushBlocked);assert(r.impact.pushMoved<.64);
}
// Protect animation pause, Reduced Motion, direction, decay and bounded amplitudes.
const r=fixture();beginCartImpact(r);for(let i=0;i<90;i++){r.impact.age=i/100;const pose=cartImpactPose(r);assert(Math.abs(pose.pitch)<=.037&&Math.abs(pose.roll)<=.037);assert(Math.abs(pose.heave)<=.145);assert.deepEqual(cartImpactPose(r,true),{pitch:0,roll:0,heave:-0,bodyPitch:0,bodyRoll:0});}
r.impact.age=.8;assert(Object.values(cartImpactPose(r)).every(v=>v===0));r.impact.age=.04;r.mode='paused';const snapshot=JSON.stringify(r),pose=cartImpactPose(r);updateRun(r,{throttle:1},1/60);assert.equal(JSON.stringify(r),snapshot);assert.deepEqual(cartImpactPose(r),pose);
for(const protectedState of ['grace','invulnerable']){const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{x:0,y:35,speed:0});Object.assign(r.joe,{x:0,y:30,speed:18});if(protectedState==='grace')r.grace=10;else r.cart.invulnerable=10;for(let i=0;i<90;i++)updateRun(r,{},1/60);assert.equal(r.cart.hits,0);assert(!r.impact.pushDistance);}
fs.writeFileSync('output/heavy-impact/physics.json',JSON.stringify({passed:true,results,boundaries:4},null,2));console.log(JSON.stringify({passed:true,results,boundaries:4}));
