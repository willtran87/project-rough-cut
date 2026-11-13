import fs from 'node:fs';
import assert from 'node:assert/strict';
import {traverse} from './probe-under-green-folded.mjs';
import {createRun} from '../web/under-green-sim.js';
const out='output/under-green/running-option';fs.mkdirSync(out,{recursive:true});
const rows=[],tapes=[],failures=[];
const offsets=[...new Set([...Array.from({length:48},(_,i)=>i/4),1.49,1.51,4.49,4.51,8.49,8.51,11.99])].sort((a,b)=>a-b);
for(const timeOffset of offsets)for(const policy of ['wet','wet-dry','dry-wet']){
 const inputs=[],r=traverse({cp:2,timeOffset,wet:policy==='wet',rangeRoute:policy==='wet'?null:policy,timedKeeper:true,adaptiveRun:true,dodge:true,inputTape:inputs});
 const row={timeOffset,policy,mode:r.mode,seconds:r.elapsed,hits:r.waterHits,solid:r.solid,evasions:r.evasions,runChoices:r.runChoices,gap:r.gap};rows.push(row);
 if(r.mode!=='complete'||r.solid||r.waterHits)failures.push(row);
 if(r.runChoices.length&&!tapes.some(t=>t.name===policy)){const initial=createRun(2);initial.mode='playing';initial.time+=timeOffset;tapes.push({name:policy,initial,inputs,final:{mode:r.mode,player:r.p,seconds:r.elapsed,hits:r.waterHits},choices:r.runChoices});}
 fs.writeFileSync(out+'/adaptive-partial.json',JSON.stringify(rows,null,2));
 if(rows.length%9===0)console.log(JSON.stringify({done:rows.length,complete:rows.filter(r=>r.mode==='complete').length,choices:rows.reduce((n,r)=>n+r.runChoices.length,0)}));
}
fs.writeFileSync(out+'/adaptive.json',JSON.stringify({passed:!failures.length&&tapes.length===3,rows,failures,coverage:tapes.map(t=>t.name),limits:['Continuous standard-pressure CP2 routes over a full quarter-second arrival cycle plus selected boundary neighbors, with live Joe and no per-outlet reset. Walking pilot accepts a displayed run option at a bank.','Route orders remain planned; this does not prove reactive branch selection, cautious stance-changing policies or every boundary/pressure state.','Perfect map and attack knowledge. Not human comprehension or preference.']},null,2));
fs.writeFileSync(out+'/adaptive-tapes.json',JSON.stringify(tapes));assert.deepEqual(failures,[]);assert.equal(tapes.length,3);console.log(JSON.stringify({passed:true,cases:rows.length,choices:rows.reduce((n,r)=>n+r.runChoices.length,0),tapes:tapes.length}));
