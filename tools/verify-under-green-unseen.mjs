import assert from 'node:assert/strict';
import {createRun,step} from '../web/under-green-sim.js';
import {joeCouldBeSeen,unseenPace} from '../web/under-green-unseen.js';
import {observeJoe} from '../web/under-green-senses.js';
import {createDrainHaunting} from '../web/under-green-haunting.js';
import {weaponClear,settleWeapon} from '../web/under-green-clearance.js';
const r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:56,yaw:0,grace:0});Object.assign(r.joe,{x:0,y:42,yaw:0,phase:'walk',last:{x:0,y:56}});settleWeapon(r,1/60);
assert(!joeCouldBeSeen(r));for(let n=0;n<120;n++)unseenPace(r,1/60);assert(unseenPace(r,0)>2.5);
r.player.rearAngle=Math.PI;assert(joeCouldBeSeen(r));assert.equal(unseenPace(r,1/60),1);assert.equal(r.joe.hiddenSeconds,0);
r.player.rearAngle=0;assert.equal(unseenPace(r,1/60),1,'Look-away delay prevents rapid toggling');
for(const fov of [45,58,85])for(const aspect of [390/844,16/9,2560/1600])for(let a=-Math.PI;a<Math.PI;a+=.1){r.view={fov,aspect};r.player.yaw=a;if(observeJoe(r,r.view).visible)assert(joeCouldBeSeen(r),'Rendered body cannot get the hidden speed');}
Object.assign(r.player,{yaw:0});Object.assign(r.joe,{x:0,y:53,hiddenSeconds:4});assert.equal(unseenPace(r,0),1,'No unseen rush into melee');
Object.assign(r.joe,{x:0,y:63,hiddenSeconds:4});r.player.y=78;assert.equal(unseenPace(r,0),1,'Timed water crossings retain walking pace');
// Actual locomotion, then a rear glance: visible frames may never show fast travel.
const run=createRun();run.mode='playing';Object.assign(run.player,{x:0,y:57,yaw:0,grace:100});Object.assign(run.joe,{x:0,y:43,yaw:0,phase:'walk',last:{x:0,y:57}});settleWeapon(run,1/60);
let fastest=0,visibleFrames=0;
for(let n=0;n<180;n++){step(run,{rear:n>=120});fastest=Math.max(fastest,run.joe.speed);if(joeCouldBeSeen(run)){assert(run.joe.speed<=2.10001);visibleFrames++;}assert(weaponClear(run.joe,run.gate));}
assert(fastest>3.5,fastest);assert(visibleFrames>20);
const covered=createRun();covered.mode='playing';Object.assign(covered.player,{x:0,y:43,yaw:-Math.PI/2});Object.assign(covered.joe,{x:-5.35,y:45.1,phase:'walk',hiddenSeconds:3});assert(!joeCouldBeSeen(covered),'Masonry hides Joe even inside the viewing direction');
const entry=createRun();entry.mode='playing';entry.player.y=30;for(let n=0;n<360;n++)step(entry);assert(entry.joe.y<39,'Scythe clears the arrival door without trapping Joe');
const haunt=createDrainHaunting(),g=createRun();g.mode='playing';g.elapsed=10;g.player.y=19;let previous=null,travel=0,maxAlphaStep=0;
for(let n=0;n<540;n++){g.elapsed=10+n/60;const ghost=haunt.sample(g);assert(ghost);if(previous){const d=Math.hypot(ghost.x-previous.x,ghost.y-previous.y);assert(d>.004&&d<.009);travel+=d;maxAlphaStep=Math.max(maxAlphaStep,Math.abs(ghost.alpha-previous.alpha));}previous=ghost;}
assert(travel>2.2);assert(previous.alpha<.001);assert(maxAlphaStep<.006);g.elapsed=19.1;assert.equal(haunt.sample(g),null);
console.log(JSON.stringify({passed:true,fastest,visibleFrames,ghostTravel:travel,maxAlphaStep}));
