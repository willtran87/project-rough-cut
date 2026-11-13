import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {UTILITY_STATIONS,UTILITY_HOLD,UTILITY_SECONDS,updateUtility,utilityTarget,utilityCaption} from '../web/chase-utility.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {distance,blocked,planMowerRoute,navigationStats} from '../web/back-nine-course.js';
import {chaseMessages} from '../web/back-nine-messages.js';
const checks=[],paths=[],test=(name,fn)=>{fn();checks.push(name);};
function fixture(index,foot=false){
 const p=UTILITY_STATIONS[index],r=createRun(index+1);r.mode='driving';r.time=20;r.grace=0;r.cart.health=50;
 Object.assign(r.cart,{x:p.x,y:p.y,speed:0});Object.assign(r.joe,{x:0,y:p.y-56,speed:8});r.hunt.cooldown=r.tension.cooldown=100;
 if(foot){leaveBrokenCart(r);Object.assign(r.foot,{x:p.x,y:p.y,invulnerable:0,speed:0});r.grace=0;r.cart.x+=8;r.cart.health=0;}
 updateRun(r,{},1/60);return r;
}
const step=(r,count,input={},fps=60)=>{for(let n=0;n<count;n++)updateRun(r,input,1/fps);};
test('Both reserves offer mutually exclusive repair or alarm, with cancellable hold',()=>{
 for(let index=0;index<2;index++){
  const r=fixture(index);step(r,20,{brake:true});assert(r.utility.hold>0);assert.equal(r.cart.health,50);assert.equal(r.utility.choices[index],'');step(r,1);assert.equal(r.utility.hold,0);
  step(r,52,{brake:true});assert.equal(r.utility.choices[index],'alarm');assert.equal(r.service.remaining[index],0);assert.equal(r.cart.health,50);r.cart.x=0;step(r,240,{brake:true});assert.equal(r.cart.health,50);assert.equal(r.service.transfers,0);
  const repair=fixture(index);repair.cart.x=0;repair.grace=999;step(repair,30,{brake:true});step(repair,1);assert.equal(repair.cart.health,53);assert.equal(repair.utility.choices[index],'repair');repair.cart.x=UTILITY_STATIONS[index].x;step(repair,80,{brake:true});assert.equal(repair.utility.serial,0);assert.equal(repair.utility.choices[index],'repair');assert(utilityCaption(repair).includes('committed to repair'));
 }
});
test('Holding the approach brake cannot silently spend the reserve',()=>{const r=fixture(0);r.utility.near=-1;r.grace=999;step(r,180,{brake:true});assert.equal(r.utility.choices[0],'');assert(utilityCaption(r).includes('release Use'));step(r,1);step(r,60,{brake:true});assert.equal(r.utility.choices[0],'alarm');});
test('Committed attacks, close danger and distant Joe cannot consume the alarm',()=>{
 for(const type of ['lineup','backoff','charge','interception','close','distant','off-axis','other-alarm']){
  const r=fixture(0);if(type==='lineup'||type==='backoff')r.joe.ram.phase=type;
  if(type==='charge')r.joe.ram.footCharge=1;if(type==='interception')r.hunt.phase='commit_warning';if(type==='close')r.joe.y=r.cart.y-5.5;if(type==='distant')r.joe.y=r.cart.y-110;
  if(type==='off-axis')Object.assign(r.joe,{x:-30,y:r.cart.y-82});if(type==='other-alarm')r.decoys.active=0;
  const ram=JSON.stringify(r.joe.ram);for(let n=0;n<120;n++)updateUtility(r,{brake:true},1/60);
  assert.equal(r.utility.choices[0],'');assert.equal(r.service.remaining[0],25);assert.equal(JSON.stringify(r.joe.ram),ram);
 }
});
test('Checkpoint protection and pause do not spend the useful seven-second diversion',()=>{
 const r=fixture(0);r.grace=5;step(r,60,{brake:true});assert.equal(r.utility.pending,0);assert.equal(r.utility.remaining,0);r.mode='paused';const snapshot=JSON.stringify(r);step(r,180,{brake:true});assert.equal(JSON.stringify(r),snapshot);r.mode='driving';step(r,250);assert.equal(r.utility.serial,1);assert(r.utility.remaining>6.7);assert.equal(r.utility.pending,-1);
});
test('The normal eleven-metre checkpoint follower permits a deliberate choice',()=>{
 for(const fps of [30,60])for(let index=0;index<2;index++){
  const r=fixture(index);r.grace=r.checkpointGrace=1.6;r.joe.y=r.cart.y-11;r.joe.speed=4;
  step(r,Math.ceil(.95*fps),{brake:true},fps);assert.equal(r.utility.pending,index);assert.equal(r.utility.choices[index],'alarm');
  step(r,Math.ceil(2*fps),{throttle:1},fps);assert.equal(r.utility.active,index);assert.equal(r.cart.health,50);assert.equal(r.joe.ram.phase,'none');
 }
});
test('Two physically reachable diversions work in cart and on foot at 30/60Hz',()=>{
 for(const fps of [30,60])for(let index=0;index<2;index++)for(const foot of [false,true]){
  const r=fixture(index,foot),p=UTILITY_STATIONS[index];assert(!blocked(p.target,2.7));assert(planMowerRoute(r.joe,p.target).points.length>0);
  step(r,Math.ceil((UTILITY_HOLD+.1)*fps),{brake:true},fps);assert.equal(r.utility.active,index);const initial={...r.joe};let maxStep=0,active=0,minGap=Infinity;
  const target=JSON.stringify(utilityTarget(r));for(let n=0;n<Math.ceil((UTILITY_SECONDS+.1)*fps)&&r.mode==='driving';n++){
   const old={...r.joe};updateRun(r,{throttle:1},1/fps);maxStep=Math.max(maxStep,distance(old,r.joe));minGap=Math.min(minGap,distance(r.foot||r.cart,r.joe));if(r.utility.active>=0){active++;assert.equal(JSON.stringify(utilityTarget(r)),target);assert.equal(r.encounter.owner,'diversion');assert(!blocked(r.joe,1.65));}
  }
  assert.equal(r.mode,'driving');assert.equal(r.utility.result,'expired');assert.equal(r.utility.serial,1);assert(distance(initial,r.joe)>25);assert(Math.sign(r.joe.x)===Math.sign(p.target.x));assert(maxStep<.8);assert(active>fps*6.7);assert(minGap>12);assert.equal(r.cart.health,foot?0:50);paths.push({index,foot,fps,maxStep,minGap,activeSeconds:active/fps,joe:{x:r.joe.x,y:r.joe.y},actorY:(r.foot||r.cart).y});
 }
});
test('Approaching Joe breaks the diversion and waiting is not permanent safety',()=>{
 const r=fixture(0);step(r,60,{brake:true});r.cart.x=r.joe.x;r.cart.y=r.joe.y+5.5;updateUtility(r,{},1/60);assert.equal(r.utility.active,-1);assert.equal(r.utility.result,'approached');assert.equal(utilityTarget(r),null);
 const stationary=fixture(0,true);step(stationary,60,{brake:true});step(stationary,1800);assert(['dying','caught'].includes(stationary.mode));
});
test('Both choices survive checkpoint retry without replay; fresh rounds reset them',()=>{
 for(const choice of ['repair','alarm'])for(const index of [0,1]){
  const r=fixture(index);if(choice==='repair')r.cart.x=0;step(r,60,{brake:true});assert.equal(r.utility.choices[index],choice);
  const restored=createRun(index+1,0,r.variation.seed,JSON.parse(JSON.stringify(r.utility.choices)));assert.equal(restored.utility.choices[index],choice);assert.equal(restored.service.remaining[index],0);assert.equal(restored.utility.pending,-1);assert.equal(restored.utility.active,-1);assert.equal(restored.utility.ring,0);
 }
 assert.deepEqual(createRun().utility.choices,['','']);assert.deepEqual(createRun(0,0,0,['bad',null]).utility.choices,['','']);assert.equal(createRun(1,1).service.remaining[0],0);
});
test('Interaction captions explain the tradeoff, respect remaps, and yield to real warnings',()=>{
 const r=fixture(0);step(r,1);const messages=chaseMessages(r,{method:'gamepad',soundCaptions:true});assert(messages.banner.includes('hold B'));assert(messages.banner.includes('One reserve'));
 step(r,60,{brake:true});assert(chaseMessages(r,{soundCaptions:true}).sound.includes('Service alarm'));assert.equal(chaseMessages(r,{soundCaptions:false}).sound,'');
 r.message='Maintenance relay online · checkpoint saved.';r.messageTime=4;assert(chaseMessages(r).banner.startsWith('Maintenance relay online'));
 r.messageTime=2.9;assert(chaseMessages(r).banner.includes('Service alarm active'));
 const choosing=fixture(0);choosing.message=r.message;choosing.messageTime=2.9;assert(chaseMessages(choosing).banner.includes('One reserve'));
});
fs.mkdirSync('output/back-nine-experience/utility-choice',{recursive:true});fs.writeFileSync('output/back-nine-experience/utility-choice/simulation.json',JSON.stringify({passed:true,checks,paths,navigation:navigationStats()},null,2));console.log(JSON.stringify({passed:true,checks,paths}));
