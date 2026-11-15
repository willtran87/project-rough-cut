import fs from 'node:fs';
import assert from 'node:assert/strict';
import {traverse} from './probe-under-green-folded.mjs';
import {WATERS,waterState,inWater,waterLocal} from '../web/under-green-course.js';

const out='output/under-green/range-recovery';fs.mkdirSync(out,{recursive:true});
const runs=[];
for(let timeOffset=0;timeOffset<12;timeOffset++)for(const wet of [false,true]){
 const channels=WATERS.filter(w=>w.id.startsWith('range-')||w.id==='sluice');
 const arrivals={},entries={},clears={};
 const result=traverse({cp:2,timeOffset,wet,dodge:true,inspect:r=>{
  for(const w of channels){
   const local=waterLocal(r.player,w),state=waterState(w,r.time,r.bypass,r.bypassAt);
   if(!arrivals[w.id]&&Math.abs(local.x)<w.width/2&&local.y>w.depth/2&&local.y<w.depth/2+2)arrivals[w.id]={time:r.time,phase:state.phase,safeFor:state.safeFor};
   if(!entries[w.id]&&inWater(r.player,w))entries[w.id]={time:r.time,phase:state.phase};
   if(!clears[w.id]&&local.y<-(w.depth/2+.4)&&Math.abs(local.x)<w.width/2-.35)clears[w.id]={time:r.time,joePhase:r.joe.phase};
  }
 }});
 const row={timeOffset,wet,mode:result.mode,seconds:result.elapsed,waterHits:result.waterHits,solid:result.solid,evasions:result.evasions,arrivals,entries,clears};
 runs.push(row);fs.writeFileSync(out+'/sequence-partial.json',JSON.stringify(runs,null,2));
 console.log(JSON.stringify(row));
}
const failures=runs.filter(r=>r.solid||!r.wet&&r.mode!=='complete'||r.wet&&r.mode==='complete'&&['range-a','range-b','sluice'].some(id=>!r.entries[id]||!r.clears[id]));
assert(runs.some(r=>r.wet&&r.mode==='complete'),'At least one whole wet sequence must be exercised');
fs.writeFileSync(out+'/sequence.json',JSON.stringify({passed:failures.length===0,runs,failures,scope:'Continuous live-Joe runs from the actual pump checkpoint across twelve one-second arrival offsets, wet and dry route policies. No per-channel placement, time reset, speed override or enemy relocation.',limits:['Perfect-map/phase pilot; successful routes do not establish first-time comprehension or preference.','Standard-pressure walking only. A failed wet pilot does not prove an unavoidable death.','Dry route may bypass both outlets; wet-completion assertions require actual entries and clears for A, B and keeper spillway.']},null,2));
assert.deepEqual(failures,[]);
console.log(JSON.stringify({passed:true,cases:runs.length,completed:runs.filter(r=>r.mode==='complete').length}));
