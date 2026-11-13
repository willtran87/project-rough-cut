import fs from 'node:fs';
import {traverse} from './probe-under-green-folded.mjs';
import {WATERS} from '../web/under-green-course.js';

// Test-only authored-data override. Every run carries uninterrupted live Joe and
// water state from the real pump checkpoint through both outlets and the exit.
const advised=process.argv.includes('--advised');
const out='output/under-green/range-cadence'+(advised?'/advised':'');
fs.mkdirSync(out,{recursive:true});
const outlet=WATERS.find(w=>w.id==='range-b'),original=outlet.offset;
const keeper=WATERS.find(w=>w.id==='sluice'),keeperOriginal=keeper.offset;
const candidates=[];
try {
 if(advised)keeper.offset=4; // Retain the original schedule for a fair baseline.
 for(const offset of advised?[1]:[1,3,4,5]){
  outlet.offset=offset;
  const runs=[];
  for(let timeOffset=0;timeOffset<12;timeOffset++)for(const wet of [false,true]){
   const r=traverse({cp:2,timeOffset,wet,timedKeeper:advised,dodge:true});
   runs.push({timeOffset,wet,mode:r.mode,seconds:r.elapsed,hits:r.waterHits,gap:r.gap,evasions:r.evasions,solid:r.solid});
  }
  const comparisons=Array.from({length:12},(_,i)=>({timeOffset:i,difference:runs[i*2+1].seconds-runs[i*2].seconds}));
  const candidate={offset,runs,comparisons};candidates.push(candidate);
  fs.writeFileSync(out+'/candidates.json',JSON.stringify({original,candidates},null,2));
  console.log(JSON.stringify({offset,completed:runs.filter(r=>r.mode==='complete').length,hits:runs.reduce((n,r)=>n+r.hits,0),comparisons}));
 }
}finally{outlet.offset=original;keeper.offset=keeperOriginal;}
