import fs from 'node:fs';
import assert from 'node:assert/strict';
import {step} from '../web/under-green-sim.js';
import {distance,solid} from '../web/under-green-course.js';

const study=JSON.parse(fs.readFileSync('output/under-green/reactive-counterplay/expanded.json'));
const rows=[];
for(const report of study.reports)for(const row of report.rows){
 if(row.mode!=='caught')continue;
 const tape=JSON.parse(fs.readFileSync(row.file)),r=structuredClone(tape.initial);
 let windup=null,stuckFrames=0;
 for(const f of tape.inputs){
  r.player.yaw=f.yaw;step(r,f.input);
  if(r.joe.phase==='windup'&&r.joe.age<.02)windup=structuredClone(r);
  if(r.player.speed<.01&&Math.hypot(f.input.forward||0,f.input.strafe||0)>.5)stuckFrames++;
 }
 assert.equal(r.mode,'caught');assert(windup);
 assert(distance(r.player,tape.final.player)<1e-7);
 const trials=[];
 for(const pace of ['walk','crouch','run'])for(let direction=0;direction<16;direction++){
  const trial=structuredClone(windup);let worldOverlap=false;
  // Diagnostic choice of heading, then ordinary forward input after 250ms.
  // This tests an available evasion, not a player's ability to select it.
  for(let frame=0;frame<90&&trial.mode==='playing';frame++){
   trial.player.yaw=direction*Math.PI/8;
   step(trial,frame<15?{}:{forward:1,crouch:pace==='crouch',sprint:pace==='run'});
   worldOverlap ||= solid(trial.player,.3);
  }
  trials.push({pace,direction,mode:trial.mode,gap:distance(trial.player,trial.joe),waterHits:trial.waterHits-windup.waterHits,worldOverlap,
   evaded:trial.mode==='playing'&&distance(trial.player,trial.joe)>2&&!worldOverlap});
 }
 const available=Object.fromEntries(['walk','crouch','run'].map(pace=>[pace,trials.filter(t=>t.pace===pace&&t.evaded).length]));
 assert(Object.values(available).every(n=>n>0));
 rows.push({source:row.file,stuckFrames,windupGap:distance(windup.player,windup.joe),available,trials});
 console.log(JSON.stringify({source:row.file.split('/').at(-1),stuckFrames,available}));
}
fs.mkdirSync('output/under-green/bank-evasion',{recursive:true});
fs.writeFileSync('output/under-green/bank-evasion/diagnostic.json',JSON.stringify({rows,limits:[
 'Original failed policies remain caught; these are separate branches at their final windup.',
 'Perfect choice among sixteen instantaneous headings, then 250ms neutral delay and ordinary movement.',
 'Surviving the short strike interval with over two metres separation is not a full keeper escape or human fairness proof.',
 'The other four original range-approach captures are outside this diagnostic.'
]},null,2));
console.log(JSON.stringify({attempts:rows.length,trials:rows.reduce((n,r)=>n+r.trials.length,0)}));
