import assert from 'node:assert/strict';
import {createRun,updateRun,objective} from '../web/back-nine-sim.js';
import {speedMph,journalText,storyCaption} from '../web/back-nine-story.js';
const step=(r,input,n)=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);};
assert.equal(speedMph(14),31);assert.equal(speedMph(-4.2),9);assert.equal(speedMph(0),0);
for(const cp of [1,2]){
 const r=createRun(cp);r.mode='driving';r.grace=100;r.cart.health=50;
 step(r,{brake:true},30);assert.equal(r.story.collected,0);assert(r.story.hold>0);
 step(r,{},1);assert.equal(r.story.hold,0);step(r,{brake:true},30);
 r.mode='paused';const paused=JSON.stringify(r);step(r,{brake:true},80);assert.equal(JSON.stringify(r),paused);r.mode='driving';step(r,{brake:true},38);
 assert.equal(r.story.collected,1<<(cp-1));assert(r.cart.health>50&&r.cart.health<75,'The log is collected before the optional full charge');assert(journalText(r).length>80);
 step(r,{brake:true},160);assert.equal(r.cart.health,75,'Continuing to charge completes the finite repair');
 r.cart.health=50;step(r,{brake:true},150);assert.equal(r.cart.health,50,'No repeated repair');assert.equal(r.events.filter(e=>e.type==='crew-log').length,1);
 const retry=createRun(cp,r.story.collected);assert.equal(retry.story.collected,r.story.collected);retry.mode='driving';retry.grace=100;retry.cart.health=50;step(retry,{brake:true},80);assert.equal(retry.cart.health,50);
 Object.assign(r.joe,{x:r.cart.x,y:r.cart.y-5});assert.equal(storyCaption(r),'','Immediate danger suppresses optional copy');
}
const full=createRun(1);full.mode='driving';full.grace=100;step(full,{brake:true},70);assert.equal(full.cart.health,100);assert.match(full.story.cue,/already sound/);
const moving=createRun(1);moving.mode='driving';moving.grace=100;moving.cart.speed=8;step(moving,{throttle:1},90);assert.equal(moving.story.collected,0);
const far=createRun(1);far.mode='driving';far.grace=100;far.cart.x=10;step(far,{brake:true},90);assert.equal(far.story.collected,0);
assert.match(objective(createRun()),/maintenance relay/);assert.match(objective(createRun(1)),/night-range relay/);assert.match(objective(createRun(2)),/Garage powered/);
console.log(JSON.stringify({passed:true,checks:['mph forward/reverse','both optional service stops','hold cancellation and pause','one repair only','retry keeps logs','full health','moving/outside cannot collect','danger priority','three main objectives']}));
