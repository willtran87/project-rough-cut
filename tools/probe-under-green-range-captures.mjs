import fs from 'node:fs';
import assert from 'node:assert/strict';
import {traverse} from './probe-under-green-folded.mjs';
import {createRun,step} from '../web/under-green-sim.js';
import {distance,solid} from '../web/under-green-course.js';
import {observeJoe} from '../web/under-green-senses.js';

const out='output/under-green/range-captures';fs.mkdirSync(out,{recursive:true});
const source=JSON.parse(fs.readFileSync('output/under-green/reactive-routes/full-observed.json'));
const candidates=source.incomplete.filter(r=>r.pressure==='relentless'&&r.timeOffset!==1.5),reports=[];
assert.equal(candidates.length,4);
for(const row of candidates){
 const inputs=[],samples=[];let lastPhase='',windup=null,windupFrame=null;
 const result=traverse({cp:2,pressure:row.pressure,crouch:row.crouch,timeOffset:row.timeOffset,rangeRoute:'reactive',timedKeeper:true,adaptiveRun:true,adaptiveStance:true,rearChecks:true,dodge:true,inputTape:inputs,inspect:r=>{
  if(r.joe.phase==='windup'&&lastPhase!=='windup'){windup=structuredClone(r);windupFrame=inputs.length;}
  if(inputs.length%12===0||r.joe.phase!==lastPhase)samples.push({frame:inputs.length,player:{...r.player},joe:{...r.joe},observed:observeJoe(r),time:r.time,mode:r.mode});
  lastPhase=r.joe.phase;
 }});
 assert.equal(result.mode,'caught');assert(windup);assert(distance(result.p,row.player)<1e-7);
 const initial=createRun(2,false,row.pressure);initial.mode='playing';initial.time+=row.timeOffset;
 const trials=[];
 for(const delay of [.25,.5])for(const pace of ['walk','crouch','run'])for(let direction=0;direction<16;direction++){
  const r=structuredClone(windup);let overlaps=0;
  for(let frame=0;frame<120&&r.mode==='playing';frame++){
   r.player.yaw=direction*Math.PI/8;
   step(r,frame<delay*60?{}:{forward:1,crouch:pace==='crouch',sprint:pace==='run'});
   if(solid(r.player,.3))overlaps++;
  }
  trials.push({delay,pace,direction,mode:r.mode,gap:distance(r.player,r.joe),hits:r.waterHits-windup.waterHits,overlaps,evaded:r.mode==='playing'&&distance(r.player,r.joe)>2&&!overlaps});
 }
 const name=`relentless-cautious-${row.timeOffset}`,report={name,source:row,result,initial,inputs,samples,windup,windupFrame,trials};
 fs.writeFileSync(`${out}/${name}.json`,JSON.stringify(report));
 const summary={name,mode:result.mode,seconds:result.elapsed,evasions:result.evasions,windupFrame,windup:{player:windup.player,joe:windup.joe,observed:observeJoe(windup)},available:[]};
 for(const delay of [.25,.5])for(const pace of ['walk','crouch','run'])summary.available.push({delay,pace,directions:trials.filter(t=>t.delay===delay&&t.pace===pace&&t.evaded).map(t=>t.direction)});
 reports.push(summary);fs.writeFileSync(out+'/diagnostic.json',JSON.stringify({reports,limits:['Continuous CP2 reproductions preserve ordinary simulation and prior state.','Evasion branches use perfect choice among instant headings; short survival is not a complete escape or human fairness validation.']},null,2));
 console.log(JSON.stringify({name,mode:result.mode,evasions:result.evasions,available:summary.available.map(x=>({...x,directions:x.directions.length}))}));
}
