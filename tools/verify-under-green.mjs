import {traverse} from './probe-under-green-folded.mjs';
import {createLocalTelemetry,telemetrySnapshot} from '../web/local-telemetry.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,readSave,snapshot,nearbyAction} from '../web/under-green-sim.js';
import {WATERS,waterState,inWater,distance,pathTo,LEVER,EXIT,SLUICE,NOTE,lineClear,solid,GATE} from '../web/under-green-course.js';
const checks=[],tick=(r,n,i={})=>{for(let k=0;k<n;k++)step(r,i,1/60);};
for(let cp=0;cp<4;cp++){const r=createRun(cp);assert(!solid(r.player,.3));assert(!solid(r.joe,.4));}checks.push('Every player and Joe spawn occupies real walkable floor');
for(const w of WATERS.filter(w=>!['bypass','return'].includes(w.id))){assert.equal(waterState(w,1-w.offset).phase,'low');assert.equal(waterState(w,((w.lowSeconds??(w.lesson?5:3))+.5)-w.offset).phase,'warning');assert(waterState(w,8-w.offset).danger);assert(waterState(w,11-w.offset).danger);assert(!waterState(w,12.1-w.offset).danger);}checks.push('Every water boundary has truthful low/warning/discharge/recession states');
let r=createRun();r.mode='paused';tick(r,100);assert.equal(r.time,0);checks.push('Pause freezes water and enemy');
r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:23});r.time=8-WATERS[0].offset;assert(waterState(WATERS[0],r.time).danger);tick(r,1);assert.equal(r.waterHits,1);assert(inWater(r.player,WATERS[0]),'Recovery must take visible time');tick(r,45);assert(!inWater(r.player,WATERS[0]));assert.equal(r.waterHits,1);checks.push('Water hit recovers to real landing without repeated stun');
r=createRun(1);r.mode='playing';Object.assign(r.player,{x:0,y:55,grace:0});Object.assign(r.joe,{x:0,y:53.5,yaw:0,phase:'windup',age:0});tick(r,100);assert.equal(r.mode,'caught');checks.push('Committed physical blade strike causes defeat');
r=createRun(1);r.mode='playing';Object.assign(r.player,{x:0,y:55,grace:0});Object.assign(r.joe,{x:0,y:53.5,yaw:0,phase:'windup',age:0});tick(r,70,{strafe:1});assert.equal(r.mode,'playing');checks.push('Ordinary sideways movement dodges a committed strike');
r=createRun(1);r.mode='playing';Object.assign(r.player,{x:-21,y:44.5,grace:0});Object.assign(r.joe,{x:-21,y:41.5,yaw:0,phase:'sweep',age:.15});assert(!lineClear(r.joe,r.player));tick(r,15);assert.equal(r.mode,'playing');checks.push('Solid pump buttress blocks blade and sight');
r=createRun(1);r.mode='playing';Object.assign(r.player,{x:0,y:70});Object.assign(r.joe,{x:0,y:60.9});r.time=5;tick(r,60);assert(r.joe.y<61.6);checks.push('Joe obeys an active spillway');
r=createRun(1);r.mode='playing';const initialJoeGap=distance(r.player,r.joe);tick(r,1800);assert.equal(r.mode,'caught');assert(r.joe.walk>initialJoeGap-1.7);checks.push('Joe reaches and catches a stationary player through actual navigation');
r=createRun(1);r.mode='playing';Object.assign(r.player,{x:LEVER.x,y:LEVER.y+1,yaw:Math.PI});step(r,{use:true});const back=WATERS.find(w=>w.id==='return');assert(r.bypass);assert.equal(waterState(back,r.time,r.bypass,r.bypassAt).phase,'warning');tick(r,130);assert(waterState(back,r.time,r.bypass,r.bypassAt).danger);assert(!waterState(WATERS.find(w=>w.id==='bypass'),r.time,r.bypass).danger);checks.push('Bypass physically drains onward water and warns before the rear discharge');
r=createRun(3);r.mode='playing';Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI});Object.assign(r.joe,{x:GATE.x,y:GATE.y-1});step(r,{use:true});assert(!r.closing);assert.notEqual(r.mode,'complete');checks.push('Cannot claim sluice victory with Joe inside the room');
// All movement below uses ordinary controls with live Joe, no placement hooks.
function walkRun(cp=0,pressure='standard',optional=false){const run=traverse({cp,pressure,optional,dodge:true});assert.equal(run.mode,'complete',JSON.stringify(run));assert(run.j.walk>10);if(optional)assert(run.evidence);return run;}
const runs=[];for(const pressure of ['steady','standard','relentless'])runs.push(walkRun(0,pressure));for(const cp of [1,2,3])runs.push(walkRun(cp));runs.push(walkRun(0,'standard',true));checks.push('Live-Joe completion with ordinary sidesteps against committed attacks from fresh start and all checkpoints, three pressure settings, optional evidence');
r=createRun(2,true);
assert.deepEqual(readSave(JSON.stringify(snapshot(r))),{completed:false,evidence:false,difficulty:'standard'});
assert.equal(snapshot(r).version,4);
r.mode='complete';
assert.deepEqual(readSave(JSON.stringify(snapshot(r))),{completed:true,evidence:true,difficulty:'standard'});
for(const version of [1,2,3]){
 const legacy={version,checkpoint:2,lessonCrossed:true,bypass:true,evidence:true,difficulty:'relentless'};
 assert.deepEqual(readSave(JSON.stringify(legacy)),{completed:false,evidence:false,difficulty:'relentless'});
 assert.deepEqual(readSave(JSON.stringify({...legacy,completed:true})),{completed:true,evidence:true,difficulty:'relentless'});
}
assert.equal(readSave('bad json'),null);assert.equal(readSave('{"version":19}'),null);
checks.push('Version 4 saves retain completion and preferences; partial attempts and legacy checkpoints do not resume');
fs.mkdirSync('output/under-green',{recursive:true});fs.writeFileSync('output/under-green/simulation.json',JSON.stringify({passed:true,checks,runs},null,2));console.log(JSON.stringify({passed:true,checks,runs:runs.map(({p,j,reached,...run})=>run)},null,2));
