import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,step,snapshot} from '../web/under-green-sim.js';
import {createUnderGreenPlaytest} from '../web/under-green-playtest.js';
import {observeEncounter} from '../web/under-green-observation.js';
import {DRY_ROUTES,rangeY} from '../web/under-green-layout.js';
import {solid} from '../web/under-green-course.js';

const out='output/under-green/mixed-routes',tapes=JSON.parse(fs.readFileSync(out+'/tapes.json')),reports=[];
for(const tape of tapes){
 const r=structuredClone(tape.initial),plain=structuredClone(tape.initial),recorder=createUnderGreenPlaytest();
 recorder.observe(r,'keyboard');
 for(const f of tape.inputs){
  r.player.yaw=plain.player.yaw=f.yaw;step(r,f.input);step(plain,f.input);recorder.observe(r,'keyboard');
 }
 const report=recorder.report({sessionKind:'automated'}),crossings=report.attempts[0].crossings;
 const aggregate=crossings.find(c=>c.id==='range');assert.equal(aggregate.choice,'mixed');assert(aggregate.finished);
 for(const [index,id]of ['range-a','range-b'].entries()){
  const c=crossings.find(c=>c.id===id);
  assert(c.finished);assert.equal(c.parent,'range');assert.equal(c.choice,tape.name.split('-')[index]);
  assert.equal(c.partial,false);assert.deepEqual(Object.keys(c.arrivalPhases),[id]);
 }
 for(const key of ['player','joe','mode','checkpoint','waterHits','bypass','gate','failure'])assert.deepEqual(r[key],plain[key],key);
 assert.deepEqual(snapshot(r),snapshot(plain));assert.equal(r.mode,tape.final.mode);assert.equal(r.waterHits,tape.final.hits);
 assert(Math.hypot(r.player.x-tape.final.player.x,r.player.y-tape.final.player.y)<1e-7);
 reports.push({route:tape.name,report});
}

// Beginning at the middle checkpoint must not invent a visit to outlet A.
const partial=createRun(3),recorder=createUnderGreenPlaytest();partial.mode='playing';recorder.observe(partial,'keyboard');observeEncounter(partial,1/60);
let crossings=recorder.report().attempts[0].crossings;
assert(!crossings.some(c=>c.id==='range-a'));assert(crossings.find(c=>c.id==='range-b').partial);
assert.equal(crossings.find(c=>c.id==='range-b').choice,'undecided');
// Merely walking across the middle connector is not taking B's dry bypass.
Object.assign(partial.player,{x:21,y:rangeY(23.5)});observeEncounter(partial,1/60);
assert.equal(partial.telemetry.crossings['range-b'].choice,'undecided');
partial.player.y=rangeY(18);observeEncounter(partial,1/60);
assert.equal(partial.telemetry.crossings['range-b'].choice,'dry');
partial.player.x=12;observeEncounter(partial,1/60);
assert.equal(partial.telemetry.crossings['range-b'].choice,'mixed');

const connector=DRY_ROUTES.find(p=>p.length===2&&p[0][0]===12&&p[0][1]===rangeY(23.5));
assert(connector);assert.deepEqual(connector[1],[21,rangeY(23.5)]);
for(let x=12;x<=21;x+=.05)assert(!solid({x,y:rangeY(23.5)},.3),'Painted middle route must have body clearance');
const checks=['Both continuous mixed tapes retain exact physical outcomes with recording enabled or disabled',
 'Aggregate mixed choice is preserved; outlet A/B report actual wet/dry order and arrival phase',
 'Middle-checkpoint partial reports omit unvisited A; connector visits alone do not claim a dry B choice',
 'Middle dry marking connects to the perimeter with player-body clearance'];
fs.writeFileSync(out+'/report-verified.json',JSON.stringify({passed:true,checks,reports},null,2));
console.log(JSON.stringify({passed:true,checks}));
