import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,CHECKPOINTS} from '../web/under-green-sim.js';
import {rangeY,EXIT} from '../web/under-green-layout.js';
import {pathTo,solid,WATERS} from '../web/under-green-course.js';
import {traverse} from './probe-under-green-folded.mjs';
const checks=[],out='output/under-green/compact-range';
fs.mkdirSync(out,{recursive:true});
// Both bodies can use the middle escape connection without going north into A.
for(const radius of [.4,.8]){
 const start=CHECKPOINTS[3],target={x:21,y:start.y};
 const path=pathTo(start,target,67,true,false,0,radius);
 assert(path.length&&Math.hypot(path.at(-1).x-target.x,path.at(-1).y-target.y)<1);
 assert(path.every(p=>p.y<30.2&&p.y>26.95));
 assert(path.every(p=>!solid(p,radius)));
}
checks.push('Middle landing has a direct east escape for player and Joe body clearances; the support cannot force a return through outlet A');
for(let cp=0;cp<4;cp++){
 const r=createRun(cp);r.mode='playing';for(let i=0;i<30;i++)step(r);
 assert.equal(r.mode,'playing');assert.equal(r.waterHits,0);assert(!solid(r.player,.3));
}
assert.equal(EXIT.y,rangeY(2));
assert(WATERS.filter(w=>w.id.startsWith('range-')).every(w=>w.depth>=3.8));
checks.push('Every checkpoint restores a dry body-safe start; compaction retains distinct channels and a protected keeper room');
const runs=[],choices=[];
for(let timeOffset=0;timeOffset<12;timeOffset++){
 const pair=[];
 for(const wet of [false,true]){
  const r=traverse({cp:3,dodge:true,wet,timeOffset});
  const landing=r.reached.find(v=>v.goal.x===12&&v.goal.y===rangeY(13));
  const result={timeOffset,wet,mode:r.mode,seconds:r.elapsed,landingSeconds:landing?.seconds,gap:r.gap,waterHits:r.waterHits};
  assert(!r.solid);if(!wet)assert.equal(r.mode,'complete',JSON.stringify(result));
  runs.push(result);pair.push(result);
 }
 if(pair.every(r=>Number.isFinite(r.landingSeconds)))choices.push({timeOffset,faster:pair[1].landingSeconds<pair[0].landingSeconds?'wet':'dry',difference:pair[1].landingSeconds-pair[0].landingSeconds});
}
assert(choices.some(c=>c.faster==='wet'&&c.difference<-.5));
assert(choices.some(c=>c.faster==='dry'&&c.difference>.5));
checks.push('Across all 12 arrival seconds, the dry recovery remains completable and both wet and dry routes can earn a faster next landing');
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,checks,runs,choices},null,2));
console.log(JSON.stringify({passed:true,checks,choices}));
