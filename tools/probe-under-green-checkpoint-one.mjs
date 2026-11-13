// Experimental restart-layout comparison. Mutates only this process's imported
// data, restores it afterwards, and does not change the shipped checkpoint.
import fs from 'node:fs';
import {CHECKPOINT_LAYOUT} from '../web/under-green-layout.js';
import {traverse} from './probe-under-green-folded.mjs';
const checkpoint=CHECKPOINT_LAYOUT[1],original={...checkpoint},runs=[];
try{
 for(const [joeX,joeY]of [[0,55],[0,69.1],[0,71],[0,73],[-1,73]]){
  Object.assign(checkpoint,{joeX,joeY});
  for(const options of [{},{wet:true},{sprint:true}]){
   let firstAttack=null,firstSight=null;
   const run=traverse({cp:1,dodge:true,...options,inspect:r=>{
    if(firstAttack===null&&r.joe.phase==='windup')firstAttack=r.elapsed;
    if(firstSight===null&&r.joe.seen)firstSight=r.elapsed;
   }});
   const {p,j,...report}=run;
   runs.push({spawn:{joeX,joeY},firstAttack,firstSight,...report,player:{x:p.x,y:p.y},joe:{x:j.x,y:j.y,phase:j.phase,evidence:j.evidence}});
   console.log(JSON.stringify({spawn:{joeX,joeY},wet:run.wet,sprint:run.sprint,mode:run.mode,seconds:run.elapsed,gap:run.gap,metrics:run.metrics,firstAttack,firstSight}));
  }
 }
}finally{Object.assign(checkpoint,original);}
fs.mkdirSync('output/under-green/checkpoint-one',{recursive:true});
fs.writeFileSync('output/under-green/checkpoint-one/spawn-experiment.json',JSON.stringify({experimental:true,shippedCheckpoint:original,runs},null,2));
