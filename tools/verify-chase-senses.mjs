import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateSenses,updateSearch,searchTarget,searchSpeedLimit,hearAlarm,SEARCH_SECONDS} from '../web/chase-senses.js';
import {updateEncounter,encounterAllows} from '../web/chase-encounter.js';
import {beginRamWindup,stepRamRecovery} from '../web/mower-ram.js';
import {distance,lineClear,blocked} from '../web/back-nine-course.js';
import {scoreStage} from '../web/chase-score.js';
const checks=[],check=(name,fn)=>{fn();checks.push(name);};
function make(){const r=createRun();r.mode='driving';r.departure.phase='finished';r.grace=0;r.time=20;r.tension.phase='stalk';Object.assign(r.cart,{x:0,y:65,speed:8,yaw:0});Object.assign(r.joe,{x:0,y:40,speed:6});return r;}
function sense(r,dt,visible,heard){r.time+=dt;updateSenses(r,dt,visible,heard);updateSearch(r,dt);}
check('Sight is exact; hidden engine sound is coarse, rate-limited and contains no hidden heading/speed',()=>{
 const r=make();sense(r,.1,true,true);assert.deepEqual(r.joe.lastSeen,{x:0,y:65});assert.equal(r.joe.senses.observation.speed,8);const object=r.joe.senses.observation;
 r.cart.x=1.3;r.cart.y=67.2;r.cart.yaw=2;sense(r,.1,false,true);assert.equal(r.joe.senses.observation,object);assert.deepEqual(r.joe.lastSeen,{x:0,y:65});sense(r,.7,false,true);assert.deepEqual(r.joe.lastSeen,{x:0,y:66});assert.equal(r.joe.senses.source,'sound');assert.equal(r.joe.senses.observation.speed,0);
 const heard=JSON.stringify(r.joe.senses.observation),serial=r.joe.senses.serial;r.cart.x=8;r.cart.yaw=-2;sense(r,.2,false,true);assert.equal(JSON.stringify(r.joe.senses.observation),heard);assert.equal(r.joe.senses.serial,serial);
});
check('A finite search has at most three fixed targets and does not read hidden movement',()=>{
 const a=make();sense(a,.1,true,false);const b=structuredClone(a);a.cart.x=30;b.cart.x=-30;a.cart.y=90;b.cart.y=130;
 for(let i=0;i<660;i++){
  sense(a,1/60,false,false);sense(b,1/60,false,false);assert.deepEqual(a.joe.senses,b.joe.senses);assert.deepEqual(searchTarget(a),searchTarget(b));assert(a.joe.senses.points.length<=3);
 }
 assert.equal(a.joe.senses.phase,'depart');assert.equal(a.joe.mode,'patrol');assert.equal(searchTarget(a),null);assert.equal(a.events.filter(e=>e.type==='search').length,1);
});
check('Search pauses, listens, then follows fixed probes; fresh sight immediately restores pursuit',()=>{
 const r=make();sense(r,.1,true,false);sense(r,.1,false,false);Object.assign(r.joe,r.joe.senses.points[0]);sense(r,.1,false,false);assert.equal(r.joe.senses.phase,'listen');assert.equal(searchSpeedLimit(r),0);
 for(let i=0;i<41;i++)sense(r,1/60,false,false);assert.equal(r.joe.senses.phase,'sweep');assert(searchTarget(r));assert(searchSpeedLimit(r)<=7);
 r.mode='paused';const before=JSON.stringify(r);updateRun(r,{throttle:1},2);assert.equal(JSON.stringify(r),before);r.mode='driving';sense(r,.1,true,false);assert.equal(r.joe.senses.phase,'none');assert.equal(searchTarget(r),null);assert.equal(searchSpeedLimit(r),Infinity);assert.equal(r.joe.mode,'pursuit');
});
check('Alarm evidence is the bell, and search yields to physical attacks and announced detours',()=>{
 const r=make();hearAlarm(r,{x:10,y:100});r.cart.x=-20;sense(r,.1,false,false);assert.equal(r.joe.senses.source,'alarm');assert.deepEqual(r.joe.senses.points[0],{x:10,y:100});
 for(const phase of ['lineup','backoff','missed']){const a=make();sense(a,.1,true,false);a.joe.ram.phase=phase;sense(a,1,false,false);assert.equal(a.joe.senses.phase,'none');}
 const h=make();sense(h,.1,true,false);h.hunt.phase='signal';sense(h,1,false,false);assert.equal(h.joe.senses.phase,'none');
});
check('Hidden changes of player heading/speed do not steer or pace an already announced ram',()=>{
 const a=make();a.foot={...a.cart,onFoot:true,invulnerable:0};sense(a,.1,true,false);beginRamWindup(a);const b=structuredClone(a);a.foot.yaw=2;a.foot.speed=7;b.foot.yaw=-2;b.foot.speed=0;
 const move=()=>0;for(let i=0;i<60;i++){sense(a,1/60,false,false);sense(b,1/60,false,false);stepRamRecovery(a,1/60,move);stepRamRecovery(b,1/60,move);assert.equal(a.joe.yaw,b.joe.yaw);assert.equal(a.joe.speed,b.joe.speed);}
});
check('Quiet search removes optional stings/pressure/dialogue, while real reacquisition restores danger',()=>{
 const r=make();sense(r,.1,true,false);updateEncounter(r,.1,true);sense(r,1,false,false);updateEncounter(r,1,false);sense(r,1,false,false);updateEncounter(r,1,false);assert.equal(r.encounter.owner,'search');assert.equal(scoreStage(r),'relief');for(const channel of ['omen','tension','pressure','dialogue'])assert(!encounterAllows(r,channel));
 r.cart.y+=150;updateEncounter(r,.1,false);assert.equal(r.encounter.owner,'search','Escaping beyond sight range must not restart optional scares');
 sense(r,.1,true,false);updateEncounter(r,.1,true);assert.equal(r.encounter.owner,'cruise');assert(encounterAllows(r,'ram'));
 r.joe.senses.heard=true;r.joe.seenAge=.85;updateEncounter(r,.1,false);assert.equal(r.encounter.owner,'cruise','Audible movement remains a threat between coarse evidence samples');
});
// Real geometry/input scenarios are recorded separately from the unit contracts.
const real=[];
for(const foot of [false,true]){
 const r=make();Object.assign(r.cart,{x:4,y:820,speed:0});if(foot){r.foot={...r.cart,onFoot:true,invulnerable:0,viewYaw:0};Object.assign(r.cart,{x:-34,y:755,health:0});}
 Object.assign(r.joe,{x:4,y:770,speed:0,lastSeen:{x:0,y:760},seenAge:1});assert(!lineClear(r.joe,r.foot||r.cart,.1));let maxStep=0,prior={...r.joe},searchFrames=0;
 for(let i=0;i<720;i++){updateRun(r,{},1/60);assert(!blocked(r.joe,1.65));maxStep=Math.max(maxStep,distance(prior,r.joe));prior={...r.joe};if(r.joe.mode==='search')searchFrames++;}
 assert.equal(r.mode,'driving');assert(searchFrames>100);assert.equal(r.joe.senses.phase,'depart');assert.deepEqual(r.joe.lastSeen,{x:0,y:760});assert(maxStep<.6);assert(r.joe.plans<70);real.push({foot,searchFrames,maxStep,plans:r.joe.plans,joe:{x:r.joe.x,y:r.joe.y},senses:r.joe.senses});
}
checks.push('Actual clubhouse geometry hides a silent cart/runner throughout bounded physical searches without contact, teleport or repeated replanning');
const cover=createRun(1);cover.mode='driving';cover.grace=0;cover.time=20;cover.tension.phase='stalk';cover.panic.serial=1;
cover.foot={x:-14,y:407,yaw:-1.2,viewYaw:-1.2,speed:0,invulnerable:0,onFoot:true,surface:'rough'};Object.assign(cover.cart,{x:-34,y:380,health:0});Object.assign(cover.joe,{x:-5,y:450,speed:6,yaw:-2.8});assert(lineClear(cover.joe,cover.foot,.1));
const route=[[-28,411],[-28,440],[-30,460],[-30,480]];let cursor=0,held=0,hidden=0,searchSeconds=0,relief=0,maxStep=0,reacquired=false,sawSearch=false;
for(let f=0;f<1800&&cover.mode==='driving';f++){
 const p=cover.foot,t=route[cursor],d=distance(p,{x:t[0],y:t[1]});let stop=false;
 if(cursor===1&&d<2&&held<3){held+=1/60;stop=true;}else if(d<2){if(cursor===route.length-1)break;cursor++;}
 const target=route[cursor],delta=Math.atan2(Math.sin(Math.atan2(target[0]-p.x,target[1]-p.y)-p.yaw),Math.cos(Math.atan2(target[0]-p.x,target[1]-p.y)-p.yaw)),prior={...cover.joe};
 updateRun(cover,{throttle:stop||Math.abs(delta)>1.1?0:1,steer:stop?0:Math.max(-1,Math.min(1,delta*2))},1/60);
 maxStep=Math.max(maxStep,distance(prior,cover.joe));if(cover.hunt.occluded)hidden+=1/60;if(cover.joe.mode==='search'){searchSeconds+=1/60;sawSearch=true;}if(cover.encounter.owner==='relief')relief+=1/60;
 if(sawSearch&&cover.joe.senses.visible)reacquired=true;assert(!blocked(cover.foot,.32));
}
assert.equal(cover.mode,'driving');assert(cover.foot.y>477);assert(hidden>7&&searchSeconds>6&&relief>4);assert(reacquired);assert(maxStep<18.3/60+.003);
const coverResult={hidden,searchSeconds,relief,reacquired,maxStep,plans:cover.joe.plans,seconds:cover.time,player:{x:cover.foot.x,y:cover.foot.y}};
checks.push('An input-driven runner crosses behind the windbreak, waits, gains separation and emerges into a real reacquisition');

const out='output/back-nine-experience/search';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/simulation.json',JSON.stringify({passed:true,checks,real,coverResult},null,2));console.log(JSON.stringify({passed:true,checks,real,coverResult}));
