import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {vehicleOverlap,constrainVehicleMotion} from '../web/vehicle-contact.js';
import {blocked,distance} from '../web/back-nine-course.js';
const checks=[];
function test(name,fn){fn();checks.push(name);}
const pose=(x,y,yaw=0)=>({x,y,yaw,speed:0});
function fresh(c,j,grace=0){const r=createRun();r.mode='driving';r.grace=grace;Object.assign(r.cart,c);Object.assign(r.joe,j);return r;}
function tick(r,input={},dt=1/60){updateRun(r,input,dt);assert(!vehicleOverlap(r.cart,r.joe),'Vehicles overlap '+JSON.stringify(r));}
test('Rear impact stops at the cutting deck, before the old distance trigger',()=>{
 const r=fresh(pose(0,35),{...pose(0,30),speed:18});let impact=false;
 for(let i=0;i<120;i++){tick(r);if(r.contact){impact=true;break;}}
 assert(impact);assert.equal(r.cart.hits,1);assert.equal(r.impact.serial,1);assert(r.impact.strength>.5);assert(r.impact.damaged);assert(r.cart.y-r.joe.y>=3.8799);assert(r.cart.y-r.joe.y<3.9);assert.equal(r.cart.speed,0,'No artificial forward launch');
 const hitTime=r.time;for(let i=0;i<120;i++)tick(r);assert.equal(r.cart.hits,1,'Cooldown suppresses damage, not solidity');assert.equal(r.impact.serial,1,'Sustained resting contact must not replay the crash');
 for(let i=0;i<70;i++)tick(r,{throttle:1});assert(r.time>hitTime+2.8);assert(r.cart.y>40,'Player can accelerate away after a rear hit');
});
test('Spawn/checkpoint grace leaves the mower solid without charging damage',()=>{
 const r=fresh({...pose(0,30),speed:14},pose(0,37),20);
 for(let i=0;i<90;i++)tick(r,{throttle:1});assert.equal(r.cart.hits,0);assert(r.impact.serial>=1&&r.impact.serial<8);assert(!r.impact.damaged,'Protected collisions still get feedback');assert(r.joe.ram.cycles>=1,'Joe yields even to a protected collision');
 const stopped=r.cart.y;for(let i=0;i<90;i++)tick(r,{throttle:-1});assert(r.cart.y<stopped-3,'Reverse releases a blocked cart');
});
test('Head-on, side and reverse impacts are solid throughout sustained contact',()=>{
 for(const [c,j,input] of [
  [{...pose(0,28),speed:14},{...pose(0,36,Math.PI),speed:17},{throttle:1}],
  [{...pose(-6,32,Math.PI/2),speed:14},pose(0,30),{throttle:1}],
  [{...pose(0,36),speed:-4.2},pose(0,30),{throttle:-1}]
 ]){const r=fresh(c,j);r.cart.invulnerable=20;let touched=false;for(let i=0;i<120;i++){tick(r,input,1/30);touched||=!!r.contact;}assert(touched);assert.equal(r.cart.hits,0);}
});
test('Turns cannot swing a cart corner through a cutting deck',()=>{
 const mower=pose(0,30),from=pose(3.66,31.4),cart={...from,yaw:Math.PI/2,speed:8};
 assert(!vehicleOverlap(from,mower));assert(constrainVehicleMotion(cart,from,mower,'cart'));assert(!vehicleOverlap(cart,mower));assert(cart.yaw>0&&cart.yaw<Math.PI/2);
});
test('Fast motion is clipped along the swept path even if its endpoint is clear',()=>{
 const mower=pose(0,30),from=pose(-8,31.4,Math.PI/2),cart={...from,x:8,speed:14};
 assert(!vehicleOverlap(cart,mower));assert(constrainVehicleMotion(cart,from,mower,'cart'));assert(cart.x<0);assert(!vehicleOverlap(cart,mower));
});
test('Passing behind the wide decks uses the narrower mower body',()=>{
 const mower=pose(0,30),cart=pose(2.8,27.6);assert(!vehicleOverlap(cart,mower));
 assert(vehicleOverlap(pose(2.8,31.4),mower),'Extended decks catch side swipes');
});
test('Pinned impacts do not push vehicles through the course boundary or garage wall',()=>{
 for(const [c,j]of [[pose(39,30,Math.PI/2),{...pose(32,30,Math.PI/2),speed:16}],
  [pose(-23,812.5),{...pose(-23,805),speed:16}]]){
  const r=fresh(c,j);r.cart.invulnerable=30;let touched=false;
  for(let i=0;i<180;i++){tick(r,{brake:true});touched||=!!r.contact;assert(!blocked(r.cart,.85));assert(!blocked(r.joe,1.65));}
  assert(touched);assert(distance(c,r.cart)<.001,'Impact cannot shove a parked cart through scenery');
 }
});
test('Existing overlapping poses recover while respecting nearby scenery',()=>{
 const r=fresh(pose(0,30),pose(0,28),10);tick(r);assert.equal(r.cart.hits,0);assert(!blocked(r.cart,.85)&&!blocked(r.joe,1.65));
});
test('Cart health runs out before an on-foot catch; pause and defeat retain solid vehicle hulls',()=>{
 const r=fresh(pose(0,35),{...pose(0,30),speed:16});for(let i=0;i<7200&&['driving','dying'].includes(r.mode);i++)tick(r);
 assert.equal(r.mode,'caught');assert(r.cart.hits>=3);assert.equal(r.cart.health,0);assert(r.foot);const frozen=JSON.stringify(r);tick(r,{throttle:1});assert.equal(JSON.stringify(r),frozen);
 const p=fresh(pose(0,35),pose(0,30));p.mode='paused';const paused=JSON.stringify(p);tick(p,{throttle:1});assert.equal(JSON.stringify(p),paused);
});
fs.mkdirSync('output/vehicle-contact',{recursive:true});fs.writeFileSync('output/vehicle-contact/simulation.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
