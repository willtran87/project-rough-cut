import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateService} from '../web/chase-service.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {distance} from '../web/back-nine-course.js';
const make=cp=>{const r=createRun(cp);r.mode='driving';r.grace=999;r.cart.health=50;return r;};
const step=(r,n,input={brake:true})=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);};
const checks=[],test=(name,f)=>{f();checks.push(name);};
test('Both shelters offer a finite timed repair; releasing early preserves earned health',()=>{
 for(const cp of [1,2]){const r=make(cp);step(r,30);assert.equal(r.cart.health,50);assert(r.service.credit>3);step(r,1,{});assert.equal(r.cart.health,53);assert.equal(r.service.remaining[cp-1],22);
  step(r,240);assert.equal(r.cart.health,75);assert.equal(r.service.remaining[cp-1],0);assert.equal(r.story.collected,1<<(cp-1));assert(r.service.transfers<=6);
  r.cart.health=40;step(r,180);assert.equal(r.cart.health,40);assert.equal(r.events.filter(e=>e.type==='service-empty').length,1);
 }
});
test('Pause holds the charger; movement interrupts it; full health does not waste supply',()=>{
 const r=make(1);step(r,20);r.mode='paused';const before=JSON.stringify(r);step(r,180);assert.equal(JSON.stringify(r),before);r.mode='driving';r.cart.speed=2;updateService(r,{brake:true},1/60);assert.equal(r.service.active,-1);assert.equal(r.cart.health,52);
 const nearFull=make(1);nearFull.cart.health=98;step(nearFull,100);assert.equal(nearFull.cart.health,100);assert.equal(nearFull.service.remaining[0],23);assert.equal(nearFull.service.transfers,1);
});
test('Charging never resurrects the wreck or refunds consumed supply on retry',()=>{
 const r=make(1);step(r,50);r.cart.health=0;leaveBrokenCart(r);step(r,150);assert.equal(r.cart.health,0);assert.equal(r.service.active,-1);
 const retry=createRun(1,1);retry.mode='driving';retry.grace=999;retry.cart.health=50;step(retry,300);assert.equal(retry.cart.health,50);assert.equal(retry.service.remaining[0],0);
});
let approach;
test('Joe physically approaches while the player chooses to keep charging',()=>{
 const r=make(1);r.grace=0;r.time=30;r.hunt.cooldown=100;r.tension.cooldown=100;Object.assign(r.joe,{x:r.cart.x,y:r.cart.y-48,yaw:0,speed:8});const before={...r.joe},gap=distance(r.cart,r.joe);step(r,120);approach={travel:distance(before,r.joe),before:gap,after:distance(r.cart,r.joe),health:r.cart.health,transfers:r.service.transfers};assert(approach.travel>10);assert(approach.after<gap-10);assert(r.cart.health>50);
});
fs.mkdirSync('output/back-nine-experience',{recursive:true});fs.writeFileSync('output/back-nine-experience/service.json',JSON.stringify({passed:true,checks,approach},null,2));console.log(JSON.stringify({passed:true,checks,approach}));
