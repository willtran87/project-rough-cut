import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,distance,blocked} from '../web/back-nine-course.js';
import {TACTIC_STATIONS,updateTactics,constrainTacticControls,tacticTarget,tacticSpeedLimit,updateExitRelease} from '../web/chase-tactics.js';
import {updateExperience,tryHiddenCutoff,tryRangeRun,experienceMotor} from '../web/chase-experience.js';
import {featurePose,breakCourseFeature} from '../web/course-destruction-state.js';
import {constrainFeatureMotion,hullOverlap} from '../web/vehicle-contact.js';
import {irrigationPhase} from '../web/chase-irrigation.js';
import {canSealGarage} from '../web/chase-garage.js';
import {encounterAllows,updateEncounter} from '../web/chase-encounter.js';
import {chaseMessages} from '../web/back-nine-messages.js';

const checks=[],test=(name,fn)=>{fn();checks.push(name);},tick=(r,input={},n=1)=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);};
function fresh(){const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=999;r.hunt.cooldown=0;r.pressure.phase='pressure';Object.assign(r.cart,{x:0,y:110,speed:0});Object.assign(r.joe,{x:0,y:50,speed:0});return r;}
test('Pressure valves require a stopped hold, are single-use and make real wet terrain / mower drag',()=>{
 const r=fresh(),s=TACTIC_STATIONS[0];Object.assign(r.cart,s,{speed:0});updateTactics(r,{brake:true},.5,false);assert.equal(r.tactics.used,0);updateTactics(r,{},.1,false);assert.equal(r.tactics.hold,0);
 for(let n=0;n<60;n++){r.time+=1/60;updateTactics(r,{brake:true},1/60,false);}assert.equal(r.tactics.used,1);assert(irrigationPhase(r,0).manual);Object.assign(r.joe,COURSE.wet[0]);assert.equal(tacticSpeedLimit(r),7);
 const until=r.tactics.floodUntil[0];updateTactics(r,{brake:true},3,false);assert.equal(r.tactics.floodUntil[0],until);r.time=until+.01;assert(!irrigationPhase(r,0).manual);assert.equal(tacticSpeedLimit(r),Infinity);
});
test('Rolling cart moves the detailed fixture and collision together, can lure Joe and be crushed',()=>{
 const r=fresh(),station=TACTIC_STATIONS[1],f=COURSE.features.find(f=>f.id===station.feature);Object.assign(r.cart,station,{speed:0});updateTactics(r,{brake:true},1,false);assert.equal(r.tactics.active,1);assert(tacticTarget(r));
 Object.assign(r.cart,{x:0,y:440});for(let n=0;n<60;n++){r.time+=1/60;updateTactics(r,{},1/60,false);}const moved=featurePose(r,f);assert(moved.y>f.y+2);assert.equal(f.y,454);
 const c={x:moved.x,y:moved.y,yaw:0,speed:10},from={...c,y:moved.y-6};assert(constrainFeatureMotion(c,from,'cart',r));assert(!hullOverlap(c,'cart',moved,'feature'));
 const j={x:moved.x,y:moved.y+1,yaw:0,speed:20};constrainFeatureMotion(j,{...j,y:moved.y-6},'mower',r);assert(r.destruction.features[f.id].brokenAt!==null);updateTactics(r,{},1/60,false);assert.equal(tacticTarget(r),null);
});
test('Control pedestals stop the player and Joe can break them without blocking the mandatory exit',()=>{
 const r=fresh(),station=TACTIC_STATIONS[0],x=station.x+2.6,y=station.y,c={x,y:y+1,yaw:0,speed:10},from={x,y:y-4,yaw:0};assert(constrainTacticControls(r,c,from,'cart'));assert.equal(r.tactics.brokenAt[0],null);constrainTacticControls(r,{x,y:y+1,yaw:0,speed:14},from,'mower');assert.equal(r.tactics.brokenAt[0],r.time);Object.assign(r.cart,station,{speed:0});updateTactics(r,{brake:true},2,false);assert.equal(r.tactics.used,0);assert.equal(r.exitRelease.released,false);
});
test('A rolling distraction ends when Joe sees or hears the player again',()=>{
 const r=fresh();Object.assign(r.cart,TACTIC_STATIONS[1],{speed:0});updateTactics(r,{brake:true},1,false);r.time+=1.3;updateTactics(r,{},.1,true);assert.equal(r.tactics.active,-1);assert.equal(r.tactics.result,'spotted');
});
test('Hidden interception uses a fixed last-seen heading and a navigable warned detour',()=>{
 const r=fresh();Object.assign(r.cart,{x:0,y:120,speed:10});Object.assign(r.joe,{x:0,y:85});Object.assign(r.hunt,{lastVisual:{x:0,y:110,yaw:0,speed:10},lastVisualAge:.7,hiddenTime:.7});assert(tryHiddenCutoff(r));assert.equal(r.hunt.phase,'signal');const route=JSON.stringify(r.hunt.waypoints);r.cart.x=30;r.cart.y=160;assert(!tryHiddenCutoff(r));assert.equal(JSON.stringify(r.hunt.waypoints),route);assert(r.hunt.waypoints.every(p=>!blocked(p,2.7)));
});
test('Stopped-engine beat holds Joe, ducks the engine and allows a 1.25 second restart warning',()=>{
 const r=fresh();Object.assign(r.cart,{x:0,y:400});Object.assign(r.joe,{x:30,y:370,speed:9,seenAge:2});updateExperience(r,1/60,false);assert.equal(r.experience.silence.phase,'quiet');assert.equal(experienceMotor(r),0);updateEncounter(r,1/60,false);assert(!encounterAllows(r,'ram'));assert(!encounterAllows(r,'hunt'));
 updateExperience(r,3.6,false);assert.equal(r.experience.silence.phase,'restart');updateExperience(r,1.1,false);assert.equal(r.experience.silence.phase,'restart');updateExperience(r,.16,false);assert.equal(r.experience.silence.phase,'finished');assert.equal(experienceMotor(r),1);assert(r.experience.silence.used);
});
test('Recovery windows cannot be replaced by suspense, and silence aborts to a warning on rediscovery',()=>{
 const r=fresh();Object.assign(r.cart,{x:0,y:400});Object.assign(r.joe,{x:30,y:370,speed:9,seenAge:2});r.encounter.reliefUntil=r.time+4;updateExperience(r,.1,false);assert.equal(r.experience.silence.phase,'waiting');r.encounter.reliefUntil=0;updateExperience(r,.1,false);updateExperience(r,.1,true);assert.equal(r.experience.silence.phase,'restart');
});
test('Range fence run is a real, connected physical route; close pursuit does not trigger it',()=>{
 const r=fresh();Object.assign(r.cart,{x:0,y:450,speed:10});Object.assign(r.joe,{x:12,y:425});assert(tryRangeRun(r));assert.equal(r.experience.rangeRun.phase,'running');assert(r.hunt.waypoints.every(p=>!blocked(p,2.7)));assert.equal(r.hunt.phase,'signal');assert(!tryRangeRun(r));
});
test('Bird warnings originate at Joe; actual near misses emit one bounded feedback event',()=>{
 const r=fresh();Object.assign(r.cart,{x:0,y:110});Object.assign(r.joe,{x:30,y:85,speed:10});updateExperience(r,.1,false);assert.equal(r.experience.birds.serial,1);assert.equal(r.experience.birds.x,r.joe.x);
 Object.assign(r.joe,{x:6,y:110,speed:10});updateExperience(r,.1,true);assert(r.experience.nearMiss.armed);r.joe.x=12;updateExperience(r,.1,true);assert.equal(r.experience.nearMiss.serial,1);updateExperience(r,.1,true);assert.equal(r.experience.nearMiss.serial,1);
});
test('Destruction reveals usable route information once, with no scripted remote break',()=>{
 const r=fresh(),f=COURSE.features.find(f=>f.id==='yard-west');Object.assign(r.cart,{x:f.x,y:f.y-8});assert(breakCourseFeature(r,f,{yaw:0,speed:12}));updateExperience(r,.1,true);assert.match(r.experience.cue,/escape through that gap/);assert(r.experience.opened.includes(f.id));assert.equal(r.experience.opened.length,1);
});
test('Exit shutter physically blocks both player forms until powered and manually released',()=>{
 for(const foot of [false,true]){const r=fresh();r.checkpoint=2;Object.assign(r.cart,{x:-23,y:798,yaw:0,speed:10});if(foot)r.foot={x:-23,y:799,yaw:0,speed:5,onFoot:true};const c=r.foot||r.cart,from={...c};c.y=802;updateExitRelease(r,{},1/60,from);assert(c.y<800);assert(!canSealGarage(r,{brake:true}));
  Object.assign(c,{x:-23,y:795.5,speed:0});for(let n=0;n<160;n++)updateExitRelease(r,{brake:true},1/60,{...c});assert(r.exitRelease.released);assert.equal(r.exitRelease.open,1);c.y=807;assert(canSealGarage(r,{brake:true}));
 }
});
test('The garage approach retains a warned foot charge, and a raised shutter clears the physical player height',()=>{
 const r=fresh();r.checkpoint=2;r.tension.lastCheckpoint=2;r.foot={x:-23,y:792,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};Object.assign(r.joe,{x:-23,y:775,yaw:0,speed:10});tick(r,{},1);assert.equal(r.joe.ram.phase,'lineup');
 r.exitRelease.released=true;r.exitRelease.open=.6;const from={x:-23,y:798,yaw:0};r.foot.y=802;updateExitRelease(r,{},1/60,from);assert.equal(r.foot.y,802);
});
test('Exit release progress resets on interruption and prompts expose the required action',()=>{
 const r=fresh();r.checkpoint=2;Object.assign(r.cart,{x:-23,y:795.5,speed:0});updateExitRelease(r,{brake:true},.6,{...r.cart});assert(r.exitRelease.hold>0);assert.match(chaseMessages(r).banner,/jammed shutter/);updateExitRelease(r,{},.1,{...r.cart});assert.equal(r.exitRelease.hold,0);
});
test('Pause freezes all new mechanics; retry restores the scenery, tools and jam',()=>{
 const r=fresh();r.mode='paused';const before=JSON.stringify(r);tick(r,{brake:true},100);assert.equal(JSON.stringify(r),before);const reset=createRun(0,0,713);assert.equal(reset.tactics.used,0);assert(!reset.exitRelease.released);assert(!reset.experience.silence.used);assert.equal(reset.destruction.features['range-abandoned-cart'].x,undefined);
});
fs.mkdirSync('output/back-nine-experience-upgrade',{recursive:true});fs.writeFileSync('output/back-nine-experience-upgrade/physics.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
