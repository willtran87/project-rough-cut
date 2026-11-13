import fs from 'node:fs';
import assert from 'node:assert/strict';
import {traverse} from './probe-under-green-folded.mjs';
import {createRun} from '../web/under-green-sim.js';
import {WATERS,inWater,distance,solid} from '../web/under-green-course.js';
import {rangeY} from '../web/under-green-layout.js';
const out='output/under-green/mixed-routes';fs.mkdirSync(out,{recursive:true});
const rows=[],tapes=[],failures=[];
for(const [stance,input] of [['walk',{}],['sprint',{sprint:true}],['crouch',{crouch:true}]]){
 for(let timeOffset=0;timeOffset<12;timeOffset++)for(const rangeRoute of ['wet-dry','dry-wet']){
  const entries=new Set(),stages=[],inputs=[],keep=stance==='walk'&&timeOffset===0;
  let previousPhase='',attacks=0,closeSeconds=0,minimumGap=Infinity,middle=false,bodyHit=false;
  const r=traverse({cp:2,timeOffset,rangeRoute,timedKeeper:true,dodge:true,...input,inputTape:keep?inputs:undefined,inspect:r=>{
   const gap=distance(r.player,r.joe);minimumGap=Math.min(minimumGap,gap);if(gap<10)closeSeconds+=1/60;
   if(r.joe.phase==='windup'&&previousPhase!=='windup')attacks++;previousPhase=r.joe.phase;
   bodyHit ||= solid(r.player,.3);
   for(const w of WATERS.filter(w=>w.id.startsWith('range-')||w.id==='sluice'))if(inWater(r.player,w)&&!entries.has(w.id)){entries.add(w.id);if(keep)stages.push({name:w.id,frame:inputs.length});}
   if(!middle&&Math.abs(r.player.y-rangeY(23.5))<.7&&r.player.x<14&&r.player.x>10){middle=true;if(keep)stages.push({name:'middle',frame:inputs.length});}
  }});
  const row={stance,timeOffset,rangeRoute,mode:r.mode,seconds:r.elapsed,hits:r.waterHits,gap:r.gap,evasions:r.evasions,attacks,closeSeconds,minimumGap,middle,entries:[...entries],bodyHit};rows.push(row);
  if(bodyHit||r.mode==='playing')failures.push({...row,reason:bodyHit?'body overlap':'unfinished pilot'});
  if(r.mode==='complete'){
   const expected=rangeRoute==='wet-dry'?'range-a':'range-b',avoided=rangeRoute==='wet-dry'?'range-b':'range-a';
   if(!entries.has(expected)||entries.has(avoided)||!entries.has('sluice')||!middle)failures.push({...row,reason:'Completed route does not actually exercise its advertised mixed branches'});
  }
  if(keep){const initial=createRun(2);initial.mode='playing';initial.time+=timeOffset;tapes.push({name:rangeRoute,initial,inputs,stages,final:{mode:r.mode,player:r.p,seconds:r.elapsed,hits:r.waterHits}});}
  fs.writeFileSync(out+'/partial.json',JSON.stringify(rows,null,2));
 }
 console.log(JSON.stringify({stance,completed:rows.filter(r=>r.stance===stance&&r.mode==='complete').length,caught:rows.filter(r=>r.stance===stance&&r.mode==='caught').length,failures:failures.length}));
}
const coverage=[];
for(const stance of ['walk','sprint','crouch'])for(const rangeRoute of ['wet-dry','dry-wet'])coverage.push({stance,rangeRoute,completed:rows.filter(r=>r.stance===stance&&r.rangeRoute===rangeRoute&&r.mode==='complete').length});
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:!failures.length&&coverage.every(c=>c.completed),rows,coverage,failures,scope:'72 continuous pump-to-exit mixed branch policies: 12 integer-second arrivals, three movement stances and two branch orders. Live Joe, no per-outlet reset.',limits:['Fixed stance and branch policies with perfect route/phase and attack knowledge. Deaths do not establish unavoidable losses.','Integer-second samples only; boundary arrivals and changed decisions during a run require additional coverage.','Completion is mechanical evidence, not first-time wayfinding, enjoyment or device comfort.']},null,2));
fs.writeFileSync(out+'/tapes.json',JSON.stringify(tapes));
assert.deepEqual(failures,[]);assert(coverage.every(c=>c.completed));console.log(JSON.stringify({passed:true,cases:rows.length,coverage}));
