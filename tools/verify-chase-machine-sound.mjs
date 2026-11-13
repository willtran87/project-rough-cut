import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {mowerSoundPlacement,mowerSoundCaption} from '../web/chase-machine-sound.js';
import {chaseMessages} from '../web/back-nine-messages.js';
const out='output/back-nine-experience/survival-audio';fs.mkdirSync(out,{recursive:true});
const cases=[];
for(const foot of [false,true])for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const rear of [false,true])for(const side of [-1,1]){
 const r=createRun();r.mode='driving';r.time=20;r.grace=0;
 Object.assign(r.cart,{x:0,y:330,yaw});if(foot)r.foot={...r.cart,onFoot:true,viewYaw:yaw,rearBlend:Number(rear)};else r.lookBack=rear;
 Object.assign(r.joe,{x:Math.cos(yaw)*side*12,y:330-Math.sin(yaw)*side*12,speed:8});
 // Deliberately contrary world-route direction: it is not audible evidence.
 r.hunt.side=-side;r.hunt.phase='commit_warning';r.hunt.commit.kind='pass';
 const place=mowerSoundPlacement(r),caption=chaseMessages(r,{soundCaptions:true}).sound;
 const expected=side*(rear?-1:1)<0?'left':'right';
 assert(Math.abs(place.pan-(expected==='left'?-.85:.85))<1e-9);
 assert(caption.includes('to your '+expected));assert(!caption.includes('connecting lane'));
 assert.equal(chaseMessages(r).sound,'');assert.equal(chaseMessages(r).banner,'');
 cases.push({foot,yaw,rear,side,pan:place.pan,caption});
}
const r=createRun();r.mode='driving';r.grace=0;r.time=20;Object.assign(r.cart,{x:0,y:330});Object.assign(r.joe,{x:12,y:330,speed:2});r.hunt.occluded=true;
const hidden=[];for(const phase of ['none','approach','listen','sweep','depart']){r.joe.senses.phase=phase;hidden.push(mowerSoundCaption(r));}assert.equal(new Set(hidden).size,1,'Caption cannot disclose hidden AI search state');assert.match(hidden[0],/chugging.*cover/);
r.joe.speed=0;assert.match(mowerSoundCaption(r),/idling/);r.joe.speed=12;assert.match(mowerSoundCaption(r),/roaring/);
for(const offset of [-12,12]){r.joe.x=0;r.joe.y=330+offset;assert(!/left|right|behind|ahead/.test(mowerSoundCaption(r)),'Centred stereo cannot name front/back');}
r.joe.x=12;r.joe.y=330;r.hunt.occluded=false;
const stages=[];r.joe.ram.phase='lineup';for(const [age,pattern]of [[.1,/idle/],[.8,/rises/],[1.6,/surges/]]){r.joe.ram.age=age;const text=mowerSoundCaption(r);assert.match(text,pattern);stages.push(text);}
r.joe.ram.phase='none';r.panic.phase='reveal';for(const age of [.1,.4]){r.panic.age=age;const text=mowerSoundCaption(r);assert(!/silent/.test(text));stages.push(text);}
for(const gap of [70,71,120]){r.joe.x=gap;r.joe.y=330;for(const phase of ['none','lineup']){r.joe.ram.phase=phase;assert.equal(mowerSoundCaption(r),'');assert.equal(chaseMessages(r,{soundCaptions:true}).sound,'');}}
r.joe.x=12;r.panic.phase='quiet';r.joe.ram.phase='none';r.message='Maintenance relay online · checkpoint saved.';r.messageTime=3;
assert.match(chaseMessages(r,{soundCaptions:true}).banner,/checkpoint saved/);
r.impact.age=.1;r.impact.damaged=true;assert.match(chaseMessages(r,{soundCaptions:true}).sound,/Metal buckles/);
r.impact.age=99;r.decoys.ring=2;assert.match(chaseMessages(r,{soundCaptions:true}).sound,/bell ringing/);
for(const mode of ['paused','briefing','dying','caught','complete','sealing']){r.mode=mode;assert.equal(chaseMessages(r,{soundCaptions:true}).sound,'');}
fs.writeFileSync(out+'/caption-rules.json',JSON.stringify({passed:true,cases,hidden,stages},null,2));
console.log(JSON.stringify({passed:true,directions:cases.length,checks:['cart and foot camera-relative side','rear glance reverses side','no front/back or hidden search disclosure','actual speed and windup descriptions','range','quiet defaults','objective/impact/bell priority','inactive modes']}));
