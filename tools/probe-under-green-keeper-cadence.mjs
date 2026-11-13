import fs from 'node:fs';
import {traverse} from './probe-under-green-folded.mjs';
import {WATERS} from '../web/under-green-course.js';
const out='output/under-green/range-cadence';fs.mkdirSync(out,{recursive:true});
const keeper=WATERS.find(w=>w.id==='sluice'),original=keeper.offset,runs=[];
try{
 for(const offset of [3.25]){
  keeper.offset=offset;
  for(const [stance,input,times] of [['walk',{},[0,5,9]],['sprint',{sprint:true},[0,1,9]],['crouch',{crouch:true},[0,3,5,9]]])for(const timeOffset of times)for(const wet of [false,true]){
   const r=traverse({cp:2,...input,timeOffset,wet,dodge:true});
   const row={offset,stance,timeOffset,wet,mode:r.mode,seconds:r.elapsed,hits:r.waterHits,gap:r.gap};runs.push(row);
   fs.writeFileSync(out+'/keeper-candidates.json',JSON.stringify({original,runs},null,2));console.log(JSON.stringify(row));
  }
 }
}finally{keeper.offset=original;}
