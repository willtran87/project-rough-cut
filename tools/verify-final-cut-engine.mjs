import assert from 'node:assert/strict';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {advanceEngineMotion,createEngineMotion} from '../web/final-cut-engine-motion.js';
const checks=[],tau=Math.PI*2;
const r=createRun();assert.deepEqual(r.engine,{angle:0,speed:0});advanceEngineMotion(r,1);assert.deepEqual(r.engine,{angle:0,speed:0});
r.arrival.ready=true;for(let i=0;i<120;i++)advanceEngineMotion(r,1/120);assert(Math.abs(r.engine.speed-12)<1e-10);assert(Math.abs(r.engine.angle-6)<1e-10);for(let i=0;i<30;i++)advanceEngineMotion(r,1/120);assert.equal(r.engine.speed,14);checks.push('Stopped arrival and gradual start; full cooling speed independent of driving speed');
for(const phase of ['turn','align','pass']){r.rig.phase=phase;r.rig.speed=0;advanceEngineMotion(r,.1);assert.equal(r.engine.speed,14);}
const saved=readSave(JSON.stringify(snapshot(r)));assert.deepEqual(saved.engine,r.engine);assert.deepEqual(createRun(saved).engine,r.engine);checks.push('Exact rotor angle and speed survive public save/readSave/createRun round trip');
for(const mode of ['paused','caught','briefing']){r.mode=mode;const before={...r.engine};step(r,{},.25);assert.deepEqual(r.engine,before);}checks.push('Pause, capture and briefing freeze engine motion');
const end=createRun({checkpoint:2,ending:{age:3.2}});end.mode='aftermath';let before=end.engine.speed;for(let i=0;i<480;i++){step(end,{},1/120);assert(end.engine.speed<=before+1e-9);before=end.engine.speed;}assert.equal(end.engine.speed,0);const stopped=end.engine.angle;step(end,{},.25);assert.equal(end.engine.angle,stopped);assert.deepEqual(createRun(readSave(JSON.stringify(snapshot(end)))).engine,end.engine);checks.push('Physical ending decelerates fan to rest by shutdown and restores exact stopped pose');
for(const hz of [30,60,120,144]){const a=createRun({checkpoint:1});for(let i=0;i<hz*2;i++)advanceEngineMotion(a,1/hz);assert(Math.abs(a.engine.angle-28%tau)<1e-11);}checks.push('Steady running phase is independent of 30/60/120/144 Hz');
assert.equal(createRun({checkpoint:1}).engine.speed,14);assert.equal(createRun({checkpoint:2,ending:{age:8}}).engine.speed,0);
for(const bad of [{angle:Infinity,speed:NaN},{angle:-1,speed:999},{angle:1e15,speed:-4}]){const e=createEngineMotion(bad,r);assert(Number.isFinite(e.angle)&&e.angle>=0&&e.angle<tau);assert(e.speed>=0&&e.speed<=14);}checks.push('Legacy saves initialize coherently; malformed optional fields remain bounded');
console.log(JSON.stringify({passed:true,checks}));
