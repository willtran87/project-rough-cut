import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dampLampLevel} from '../web/under-green-atmosphere.js';
const rows=[];for(let index=0;index<17;index++){
 let min=Infinity,max=-Infinity,maxStep=0,previous=dampLampLevel(0,index);
 for(let frame=0;frame<=240*120;frame++){const t=frame/120,v=dampLampLevel(t,index);assert(v>=.16&&v<=.96);assert.equal(dampLampLevel(t,index,true),.72);maxStep=Math.max(maxStep,Math.abs(v-previous));min=Math.min(min,v);max=Math.max(max,v);previous=v;}
 assert(maxStep<.02);rows.push({index,min,max,maxStep});
}
assert(new Set(rows.map(r=>dampLampLevel(26.3,r.index).toFixed(5))).size===17,'Sources share one synchronized phase');
const out='output/under-green/visual-upgrade-local/pass40-source';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/flicker.json',JSON.stringify({passed:true,seconds:240,hz:120,rows},null,2));console.log(JSON.stringify({passed:true,rows}));
