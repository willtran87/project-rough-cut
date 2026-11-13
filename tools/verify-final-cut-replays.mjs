import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {CUT_PLANS,nextScheduledStrip,consumeScheduledStrip} from '../web/final-cut-schedule.js';
import {traverse} from './probe-final-cut.mjs';
const checks=[],runs=[],failures=[];fs.mkdirSync('output/final-cut/replays',{recursive:true});
for(const plan of CUT_PLANS){
 const r=createRun({seed:plan.seed}),sequence=[r.rig.lane];
 for(let k=0;k<12;k++){const choice=nextScheduledStrip(r);sequence.push(choice.lane);r.rig.lane=choice.lane;consumeScheduledStrip(r,choice);}
 assert.deepEqual(sequence.slice(0,plan.order.length),plan.order);assert(new Set(sequence).size===3);assert.deepEqual(createRun(readSave(JSON.stringify(snapshot(r)))).schedule,r.schedule);
 const late=createRun({...snapshot(r),checkpoint:1});assert.equal(late.schedule.openingRemaining,0);
}
checks.push('All plans include every strip, persist their cursor, preserve the near demonstration and do not replay an opening from the pump checkpoint');
for(const seed of [1,2]){
 const r=createRun({seed});r.mode='playing';Object.assign(r.arrival,{open:true,requested:true});Object.assign(r.player,{x:0,y:66});Object.assign(r.rig,{x:30,y:26,phase:'disengage',age:3,deployment:0});r.lure={x:0,y:50,time:0,source:'golf ball',trap:false};step(r);assert.equal(r.rig.lane,1);assert.equal(r.rig.evidence,'golf ball');assert.equal(r.stats.ballRedirects,1);
 const copy=structuredClone(r);copy.rig.phase='pass';copy.rig.age=0;copy.rig.deployment=1;copy.rig.yaw=-Math.PI/2;copy.rig.direction=-1;const lane=copy.rig.lane;step(copy,{strafe:1},.1);assert.equal(copy.rig.lane,lane);
}
checks.push('Real distraction priority overrides either replay opening; a committed pass stays locked');
for(const seed of [0,1,2])for(const finalRoute of ['bank','open'])for(const stance of ['walk','sprint','crouch'])for(const fullyCut of [false,true]){
 const options={seed,finalRoute,sprint:stance==='sprint',crouch:stance==='crouch',fullyCut,depleted:true};
 try{const {run:r,passes,crossings}=traverse(options);assert(r.completed&&r.won);assert.equal(r.captures,0);assert.equal(r.stats.balls,0);runs.push({seed,finalRoute,stance,fullyCut,seconds:r.time,wait:r.stats.wait,passes,crossings});}
 catch(error){failures.push({options,error:error.message});}
 fs.writeFileSync('output/final-cut/replays/matrix.json',JSON.stringify({passed:failures.length===0,checks,runs,failures},null,2));
 console.log(JSON.stringify({seed,finalRoute,stance,fullyCut,passed:failures.length===0,runs:runs.length,failures:failures.length}));
}
assert.equal(failures.length,0,JSON.stringify(failures));
const originals=runs.filter(r=>r.finalRoute==='bank'&&r.stance==='walk'&&!r.fullyCut);
assert.equal(new Set(originals.map(r=>r.passes.slice(0,3).map(p=>p.lane).join(','))).size,3);
assert(new Set(originals.map(r=>JSON.stringify(r.crossings))).size>1);
checks.push('36 zero-ball full routes: three plans, both fork paths, walk/sprint/crouch and intact/fully-cut terrain; all finish without capture');
checks.push('Observed opening pass sequences differ across all plans and change the crossing/cover timeline');
fs.writeFileSync('output/final-cut/replays/matrix.json',JSON.stringify({passed:true,checks,runs,failures},null,2));console.log(JSON.stringify({passed:true,checks,count:runs.length}));
