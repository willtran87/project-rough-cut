import fs from 'node:fs';
import assert from 'node:assert/strict';
import {traverse} from './probe-under-green-folded.mjs';

const out='output/under-green/range-cadence/advised';fs.mkdirSync(out,{recursive:true});
const cases=[];
for(const pressure of ['steady','standard','relentless'])for(const sprint of [false,true])cases.push({pressure,sprint,wet:true,cp:0});
for(const timeOffset of [0,3,6,9])for(const wet of [false,true])cases.push({cp:3,timeOffset,wet,crouch:true});
for(const pressure of ['steady','relentless'])for(const timeOffset of [0,5])for(const wet of [false,true])cases.push({cp:2,timeOffset,wet,pressure});
const runs=[];
for(const config of cases){
 const r=traverse({...config,timedKeeper:true,dodge:true});
 runs.push({...config,mode:r.mode,seconds:r.elapsed,hits:r.waterHits,evasions:r.evasions,gap:r.gap,solid:r.solid,player:r.p,joe:r.j,goal:r.goal,metrics:r.metrics});
 fs.writeFileSync(out+'/arrivals-partial.json',JSON.stringify(runs,null,2));
 console.log(JSON.stringify({...config,mode:r.mode,seconds:r.elapsed,hits:r.waterHits}));
}
const failures=runs.filter(r=>r.solid||r.mode!=='complete');
fs.writeFileSync(out+'/arrivals.json',JSON.stringify({passed:!failures.length,runs,failures,scope:'Six fresh wet routes across three pressure profiles and walking/sprinting, eight cautious middle-landing retries, eight pump retries across the other pressure profiles. All use continuous live simulation with ordinary pilot inputs.',limits:['Selected arrival samples, not an exhaustive pressure/recovery matrix.','Perfect route/phase and attack-state knowledge; no human fairness, fear or device-ergonomics claim.']},null,2));
assert.deepEqual(failures,[]);console.log(JSON.stringify({passed:true,cases:runs.length}));
