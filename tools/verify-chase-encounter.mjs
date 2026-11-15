import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateEncounter,encounterAllows,encounterQuiet,encounterSpeedLimit} from '../web/chase-encounter.js';
import {beginRamWindup} from '../web/mower-ram.js';
import {distance} from '../web/back-nine-course.js';
const checks=[];const test=(name,f)=>{f();checks.push(name);};
// These are ongoing pursuit fixtures, after the working-mower introduction.
const make=()=>{const r=createRun();r.departure.phase='finished';r.mode='driving';r.grace=0;r.time=20;r.tension.phase='stalk';Object.assign(r.cart,{x:0,y:65,speed:8});Object.assign(r.joe,{x:0,y:35,yaw:0,speed:6,seenAge:0});return r;};
test('One owner preserves an active windup and suppresses competing optional beats',()=>{
 const r=make();beginRamWindup(r);updateEncounter(r,1/60,true);
 assert.equal(r.encounter.owner,'attack');for(const channel of ['hunt','tension','pressure','dialogue','omen'])assert.equal(encounterAllows(r,channel),false,channel);
 assert(encounterAllows(r,'reveal'),'The physical launch may still initiate the existing score reveal');
 assert.equal(encounterSpeedLimit(r),Infinity);const age=r.joe.ram.age;updateRun(r,{throttle:1},1/60);assert(r.joe.ram.age>age);
});
test('A missed charge buys bounded relief, without silently cancelling a committed charge',()=>{
 const r=make();r.joe.ram.phase='missed';updateEncounter(r,1/60,true);
 assert.equal(r.encounter.owner,'relief');assert.equal(r.encounter.rewards,1);assert.equal(r.events.at(-1).type,'earned-relief');assert(encounterQuiet(r));assert.equal(encounterSpeedLimit(r),8.5);
 const deadline=r.encounter.reliefUntil;r.time+=1;r.joe.ram.phase='none';updateEncounter(r,1/60,true);r.joe.ram.phase='missed';updateEncounter(r,1/60,true);assert.equal(r.encounter.reliefUntil,deadline,'Repeated transition cannot extend the window');
 r.joe.ram.phase='none';r.joe.ram.footCharge=1;updateEncounter(r,1/60,true);assert.equal(r.encounter.owner,'attack');assert.equal(encounterSpeedLimit(r),Infinity);
 r.joe.ram.footCharge=0;r.time=deadline+.1;updateEncounter(r,1/60,true);assert.equal(r.encounter.owner,'cruise');assert(encounterAllows(r,'ram'));
});
test('Concealment requires relocation and loss of actual sensory evidence',()=>{
 for(const noisy of [false,true]){const r=make();updateEncounter(r,0,false);r.time+=2.2;r.cart.x+=6;r.joe.seenAge=noisy?0:2.2;updateEncounter(r,2.2,false);assert.equal(r.encounter.rewards,noisy?0:1);assert.equal(r.encounter.reliefReason,noisy?'':'broke-sight');}
 const still=make();updateEncounter(still,0,false);still.time+=3;still.joe.seenAge=3;updateEncounter(still,3,false);assert.equal(still.encounter.rewards,0,'Waiting behind cover does not farm relief');assert.equal(still.encounter.owner,'search');
});
test('Recent damage does not count as a successful evasion; checkpoint/ejection/finale take precedence',()=>{
 const r=make();r.cart.hits=1;r.joe.ram.phase='missed';updateEncounter(r,1/60,true);assert.equal(r.encounter.rewards,0);
 r.joe.ram.phase='none';r.grace=3;updateEncounter(r,1/60,true);assert.equal(r.encounter.owner,'checkpoint');
 r.foot={...r.cart,onFoot:true,invulnerable:4};updateEncounter(r,1/60,true);assert.equal(r.encounter.owner,'recovery');
 r.mode='sealing';updateEncounter(r,1/60,true);assert.equal(r.encounter.owner,'finale');assert.equal(r.encounter.stage,'finale');
 r.mode='paused';const state=JSON.stringify(r);updateEncounter(r,10,true);updateRun(r,{throttle:1},1/60);assert.equal(JSON.stringify(r),state);
});
let actual;
test('Live dodged on-foot charge keeps its long locked motion, then earns a usable escape window',()=>{
 const r=make();r.foot={x:0,y:65,yaw:0,viewYaw:0,speed:0,invulnerable:0,onFoot:true,surface:'path'};Object.assign(r.cart,{x:25,y:20,health:0});r.joe.lastSeen={x:0,y:65};beginRamWindup(r);
 let locked=null,travel=0,frames=0,reliefFrames=0,entered=null,exited=null,escaped=false;
 for(let i=0;i<600&&r.mode==='driving';i++){
  const old={...r.joe};escaped ||= r.joe.ram.phase==='missed';updateRun(r,{throttle:1,steer:i<38?.9:escaped?Math.max(-1,Math.min(1,(.3-r.foot.yaw)*1.8)):0},1/60);
  if(r.joe.mode==='charging'){locked??=r.joe.yaw;assert.equal(r.joe.yaw,locked);travel+=distance(old,r.joe);frames++;}
  if(r.encounter.owner==='relief'){
   entered??=distance(r.foot,r.joe);exited=distance(r.foot,r.joe);reliefFrames++;
   assert(!encounterAllows(r,'ram'));assert(!['windup','surge'].includes(r.tension.phase));assert.notEqual(r.panic.phase,'reveal');
  }
 }
 assert.equal(r.mode,'driving');assert(travel>24&&frames>130);assert(reliefFrames>150);assert(exited>entered,'Running through a successful dodge earns a physical lead');
 actual={travel,frames,reliefFrames,entered,exited,rewards:r.encounter.rewards,mode:r.mode};
});
fs.mkdirSync('output/back-nine-experience',{recursive:true});fs.writeFileSync('output/back-nine-experience/encounter.json',JSON.stringify({passed:true,checks,actual},null,2));console.log(JSON.stringify({passed:true,checks,actual}));
