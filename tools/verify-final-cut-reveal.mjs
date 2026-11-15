import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,nearbyAction} from '../web/final-cut-sim.js';
import {BOARD_READY,BOARD_STARTUP} from '../web/final-cut-arrival.js';
import {rigLampState,courseLightState} from '../web/final-cut-reveal.js';
import {OVERLOOK_ACCESS,ACCESS} from '../web/final-cut-arrival-layout.js';
const checks=[],runs=[];
for(const hz of [30,60,120]){
 const r=createRun();r.mode='playing';assert.equal(nearbyAction(r),OVERLOOK_ACCESS);
 for(let k=0;k<180*hz;k++)step(r,{},1/hz);
 assert.equal(r.rig.phase,'waiting');assert.deepEqual(rigLampState(r),{marker:1,beam:0});assert.equal(courseLightState(r),0);assert(!r.arrival.requested);
 step(r,{use:true},1/hz);assert(r.arrival.requested);assert.equal(nearbyAction(r),null);let previous=0;const samples=[];
 while(r.rig.phase==='reveal') {const lamps=rigLampState(r);if(r.rig.age<=2)assert.equal(lamps.beam,0);assert(lamps.beam>=previous);assert.equal(courseLightState(r),lamps.beam);previous=lamps.beam;samples.push({age:r.rig.age,...lamps,deployment:r.rig.deployment});step(r,{},1/hz);assert.equal(r.mode,'playing');}
 assert(r.openingSeen);assert.equal(rigLampState(r).beam,1);assert(samples.some(s=>s.beam>0&&s.beam<1&&s.deployment>0));
 const restored=createRun(snapshot(r));assert.equal(restored.rig.phase,'announce');assert.deepEqual(rigLampState(restored),{marker:1,beam:1});
 while(!r.arrival.open){step(r,{},1/hz);assert(r.time<230);assert.equal(r.mode,'playing');}
 assert(r.rig.x<-6);runs.push({hz,samples:samples.length,opened:r.rig.x,seconds:r.time});
}
checks.push('30/60/120 Hz: unlimited safe two-marker observation, actual terrace Use, two-second isolated lamps, monotonic main-beam buildup during deployment, protected opening, completed-reveal restore skips repetition');
for(const age of [0,BOARD_READY-BOARD_STARTUP-.1,BOARD_READY-BOARD_STARTUP+.3,BOARD_READY-.2]){const r=createRun({arrival:{reached:true,age,motionVersion:3}});r.mode='playing';const before=rigLampState(r);const restored=createRun(snapshot(r));assert.deepEqual(rigLampState(restored),before);r.mode='paused';step(r,{},2);assert.deepEqual(rigLampState(r),before);if(age<=BOARD_READY-BOARD_STARTUP)assert.equal(before.marker,0);}
checks.push('Startup marker lighting follows saved boarding clock and stays frozen while paused');
const legacy=createRun();legacy.mode='playing';Object.assign(legacy.player,{x:-2,y:17.3,yaw:-Math.PI/2});assert.equal(nearbyAction(legacy),ACCESS);step(legacy,{use:true},1/60);assert(legacy.arrival.requested);
checks.push('Existing ground-level control remains usable and requests the same single encounter');
for(const age of [0,2,4,8,12]){const r=createRun({checkpoint:2,ending:{age}});assert.deepEqual(rigLampState(r),{marker:Math.max(0,1-age/8),beam:Math.max(0,1-age/8)});assert.equal(courseLightState(r),1);}
checks.push('Both light sets share the physical aftermath fade and remain off after shutdown');
checks.push('Tournament floodlights stay off until player-requested reveal, rise smoothly with deployment and remain on through victory/reload after the rig lights fade');
fs.mkdirSync('output/final-cut/reveal',{recursive:true});fs.writeFileSync('output/final-cut/reveal/rules.json',JSON.stringify({passed:true,checks,runs},null,2));console.log(JSON.stringify({passed:true,checks,runs}));
