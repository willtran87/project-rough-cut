import fs from 'node:fs';
import {execute,stances} from './verify-under-green-pressure-envelopes.mjs';
import {WATERS} from '../web/under-green-course.js';
const out='output/under-green/range-recovery';fs.mkdirSync(out,{recursive:true});
const results=[];
for(const [phase,name] of [[3.75,'walk'],[3.75,'sprint'],[4.25,'crouch'],[4.75,'crouch']]){
 const result=execute(WATERS.find(w=>w.id==='range-b'),phase,stances.find(s=>s[0]===name),9,'recover-and-evade',{diagnostic:true});
 results.push(result);console.log(JSON.stringify({phase,stance:name,row:result.row,lastSamples:result.samples.slice(-3)}));
}
fs.writeFileSync(out+'/diagnostic.json',JSON.stringify(results,null,2));
