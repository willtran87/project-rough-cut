import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart,moveRunner} from '../web/chase-player.js';
import {beginRamWindup} from '../web/mower-ram.js';
import {distance,blocked} from '../web/back-nine-course.js';
import {chaseMessages} from '../web/back-nine-messages.js';
import {BACK_NINE_SLIDES,backNineControls} from '../web/back-nine-opening.js';
import {CHASE_BRIEF} from '../web/back-nine-story.js';
import {lampFlicker} from '../web/chase-night.js';
const checks=[];
const run=createRun();run.mode='driving';run.time=10;
Object.assign(run.cart,{x:0,y:40,speed:12});Object.assign(run.joe,{x:5,y:30,speed:10});
assert(leaveBrokenCart(run));assert(!blocked(run.foot,.32));const start={...run.foot};
for(let i=0;i<50;i++)updateRun(run,{throttle:1},1/60);
assert.equal(distance(start,run.foot),0);assert(run.foot.invulnerable>4);
for(let i=0;i<20;i++)updateRun(run,{throttle:1},1/60);
assert(distance(start,run.foot)>1);assert(run.grace>3.8);checks.push('Protected landing holds the safe exit, then promptly restores movement');
const charge=createRun();charge.mode='driving';charge.time=20;charge.grace=0;
charge.foot={x:0,y:65,yaw:0,viewYaw:0,speed:0,invulnerable:0,onFoot:true,surface:'path'};
Object.assign(charge.cart,{x:25,y:20,health:0});Object.assign(charge.joe,{x:0,y:35,yaw:0,speed:6,lastSeen:{x:0,y:65}});
beginRamWindup(charge);let locked=null,travel=0,chargeFrames=0,missed=false,maxSpeed=0;
for(let i=0;i<360&&charge.mode==='driving';i++){
 const before={...charge.joe};updateRun(charge,{throttle:1,steer:i<38?.9:0},1/60);
 if(charge.joe.mode==='charging'){
  locked??=charge.joe.yaw;assert.equal(charge.joe.yaw,locked);travel+=distance(before,charge.joe);chargeFrames++;maxSpeed=Math.max(maxSpeed,charge.joe.speed);
  assert(distance(before,charge.joe)<=14.8/60+.001);
 }
 if(charge.joe.ram.phase==='missed')missed=true;
}
assert.equal(charge.mode,'driving');assert(missed);assert(chargeFrames>130);assert(travel>24);
checks.push('A dodged locked charge covers over 24 metres, then recovers without teleporting');
charge.impact={age:0,strength:1,damaged:true};charge.events.push({type:'contact',time:charge.time,damage:29});charge.joe.ram.phase='lineup';charge.messageTime=0;charge.story.near=-1;
assert(!/RAM INCOMING|CHARGE INCOMING|HEALTH|damage/i.test(chaseMessages(charge).banner));
assert.match(chaseMessages(charge,{soundCaptions:true}).sound,/Metal buckles/);
assert(!/on foot|keep running|cart cannot|cart fails/i.test(BACK_NINE_SLIDES.flatMap(s=>s.lines).join(' ')+CHASE_BRIEF+backNineControls()));
assert.match(backNineControls('keyboard',true),/run/);checks.push('Initial narrative conceals the twist; optional sound captions carry impact descriptions');
for(const time of [0,1,5,12,14,18]){assert.equal(lampFlicker(time,50,0),1);assert.equal(lampFlicker(time,50,1,true),1);}
assert.notEqual(lampFlicker(12,0),lampFlicker(12,48));checks.push('Local light faults vary independently and become steady under comfort settings');
const result={passed:true,checks,charge:{seconds:chargeFrames/60,travel,maxSpeed,mode:charge.mode}};
fs.writeFileSync('output/back-nine-chase-drama/rules.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
