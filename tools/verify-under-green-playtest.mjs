import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot} from '../web/under-green-sim.js';
import {createUnderGreenPlaytest} from '../web/under-green-playtest.js';
import {observeEncounter} from '../web/under-green-observation.js';
import {createLocalTelemetry} from '../web/local-telemetry.js';
const checks=[],recorder=createUnderGreenPlaytest({attemptLimit:3,eventLimit:8});
let r=createRun();recorder.observe(r,'keyboard');assert.equal(recorder.report().attempts.length,0,'Briefing is not an attempt');
r.mode='playing';recorder.observe(r,'keyboard');
for(let i=0;i<60;i++){step(r,{forward:1});recorder.observe(r,'keyboard');}
const before=snapshot(r),first=recorder.report();assert.equal(first.attempts.length,1);assert(Math.abs(first.attempts[0].activeSeconds-1)<.001);assert.deepEqual(snapshot(r),before);assert.equal(first.sessionKind,'unclassified');
r.mode='paused';for(let i=0;i<60;i++){step(r,{forward:1});recorder.observe(r,'keyboard');}assert.equal(recorder.report().attempts[0].activeSeconds,first.attempts[0].activeSeconds);
r.mode='playing';r.checkpoint=1;recorder.observe(r,'gamepad');r.elapsed+=2;recorder.observe(r,'gamepad');assert.equal(recorder.report().attempts[0].secondsSinceCheckpoint,2);
for(let i=0;i<20;i++){r.events.push({type:'blade-blocked',time:r.time+i});recorder.observe(r,'keyboard');}
r.mode='caught';r.failure={kind:'sweep',cause:'Recorded contact',advice:'Move sideways'};r.events.push({type:'caught',time:r.time});recorder.observe(r,'keyboard');
const caught=recorder.report().attempts[0];assert.equal(caught.outcome,'caught');assert.equal(caught.events.length,8);assert.equal(caught.eventsDropped,13);assert.equal(caught.outcomes.blockedBlades,20);assert.equal(caught.outcomes.captures,1);assert.deepEqual(caught.inputMethods,['keyboard','gamepad']);
const next=createRun(1);next.mode='playing';recorder.observe(next,'touch');assert.equal(recorder.report().attempts.length,2);r.failure.cause='mutated';assert.equal(recorder.report().attempts[0].failure.cause,'Recorded contact');
for(let i=0;i<5;i++){const n=createRun(2);n.mode='playing';recorder.observe(n,'keyboard');}
const bounded=recorder.report({sessionKind:'automated',notes:'x'.repeat(3000)});assert.equal(bounded.attempts.length,3);assert.equal(bounded.droppedAttempts,4);assert.equal(bounded.observations.notes.length,2000);assert.equal(bounded.sessionKind,'automated');
checks.push('Opt-in attempt lifecycle, active time, pause, checkpoint timing, actual failure, device changes, immutable retry snapshots and bounded events/attempts');

// Observation classifies visited geometry, not an assumed wet-route decision.
r=createRun(1);r.mode='playing';r.telemetry=createLocalTelemetry();Object.assign(r.player,{x:0,y:55,speed:0});observeEncounter(r,1/60);
assert.equal(r.telemetry.crossings.spillway.choice,'undecided');assert(r.telemetry.crossings.spillway.partial);
r.player.y=64;observeEncounter(r,1/60);assert.equal(r.telemetry.crossings.spillway.choice,'wet');r.player.x=10;observeEncounter(r,1/60);assert.equal(r.telemetry.crossings.spillway.choice,'mixed');r.player.y=74;observeEncounter(r,1/60);assert(r.telemetry.crossings.spillway.finished);
const phases=createRun(1);phases.mode='playing';phases.telemetry=createLocalTelemetry();phases.player.x=-20;phases.player.y=70;phases.joe.phase='windup';observeEncounter(phases,.1);phases.joe.phase='sweep';observeEncounter(phases,.1);phases.joe.phase='recover';observeEncounter(phases,.1);
assert.equal(phases.telemetry.metrics.windupEntries,1);assert.equal(phases.telemetry.metrics.sweepEntries,1);assert.equal(phases.telemetry.metrics.recoverEntries,1);
const close=phases.telemetry.metrics.closeSeconds;phases.finished=true;Object.assign(phases.joe,phases.player);observeEncounter(phases,1);assert.equal(phases.telemetry.metrics.closeSeconds,close,'Safe aftermath cannot add threat exposure');
checks.push('Undecided/wet/mixed and partial crossings, observed attack state entries, and safe aftermath exposure');

// The same ordinary input sequence has identical physical outcomes with and
// without the recorder. Diagnostic data is excluded from the comparison.
const a=createRun(),b=createRun(),mirror=createUnderGreenPlaytest();a.mode=b.mode='playing';mirror.observe(b,'keyboard');
for(let i=0;i<500;i++){const input={forward:1,sprint:i>200};step(a,input);step(b,input);mirror.observe(b,'keyboard');}
for(const key of ['player','joe','mode','checkpoint','waterHits','bypass','gate','failure'])assert.deepEqual(a[key],b[key],key);
assert(!Object.hasOwn(snapshot(b),'telemetry'));
checks.push('Recording does not change movement, Joe, collisions, water, progress, failure or save payload');
fs.mkdirSync('output/under-green/playtest',{recursive:true});fs.writeFileSync('output/under-green/playtest/rules.json',JSON.stringify({passed:true,checks,example:bounded},null,2));console.log(JSON.stringify({passed:true,checks}));
