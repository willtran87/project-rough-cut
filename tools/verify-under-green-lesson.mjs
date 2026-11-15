import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave,MOVEMENT} from '../web/under-green-sim.js';
import {WATERS,waterState} from '../web/under-green-course.js';
import {crossingAdvice} from '../web/under-green-guidance.js';
import {observeLesson} from '../web/under-green-lesson.js';
const out='output/under-green/lesson';fs.mkdirSync(out,{recursive:true});
const water=WATERS.find(w=>w.lesson),near=water.y-water.depth/2-.6,far=water.y+water.depth/2+.4,rows=[];
for(const [stance,speed,input]of [['walk',MOVEMENT.walk,{}],['sprint',MOVEMENT.sprint,{sprint:true}],['crouch',MOVEMENT.crouch,{crouch:true}]])for(let phase=0;phase<12;phase+=.5){
 const r=createRun();r.mode='playing';r.time=phase;r.messageTime=0;Object.assign(r.player,{x:0,y:near});let committed=false,wait=0,firstAdvice;
 for(let n=0;n<1200&&!r.lessonCrossed;n++){
  const advice=crossingAdvice(r.player,water,waterState(water,r.time),speed);firstAdvice??=advice.action;
  if(['cross','approach'].includes(advice.action))committed=true;
  if(!committed)wait+=1/60;
  step(r,{...input,forward:committed?1:0});
  assert.equal(r.joe.phase,'absent');assert.equal(r.mode,'playing');
 }
 assert(r.lessonCrossed,JSON.stringify({stance,phase,y:r.player.y}));assert(r.player.y>=far);assert.equal(r.waterHits,0);assert.equal(r.checkpoint,0);assert.equal(r.events.filter(e=>e.type==='lesson-crossed').length,1);assert.equal(r.saveSerial,1);
 if(firstAdvice==='cross')assert.equal(wait,0,'An available opening must not impose a tutorial wait');
 const saved=readSave(JSON.stringify(snapshot(r))),retry=createRun(saved.checkpoint,saved.evidence,saved.difficulty,saved);assert(retry.lessonCrossed);assert.equal(retry.messageTime,0);
 rows.push({stance,phase,wait,seconds:r.time-phase,firstAdvice});
}
const approaches=[];
for(const [stance,speed,input]of [['walk',MOVEMENT.walk,{}],['sprint',MOVEMENT.sprint,{sprint:true}],['crouch',MOVEMENT.crouch,{crouch:true}]]){
 const r=createRun();r.mode='playing';let committed=false,wait=0;
 for(let n=0;n<1200&&!r.lessonCrossed;n++){
  let forward=1;
  if(r.player.y>=near&&!committed){
   committed=['cross','approach'].includes(crossingAdvice(r.player,water,waterState(water,r.time),speed).action);
   if(!committed){forward=0;wait+=1/60;}
  }
  step(r,{...input,forward});
 }
 assert(r.lessonCrossed);assert.equal(r.waterHits,0);assert.equal(r.joe.phase,'absent');assert(wait<2);
 if(stance==='walk')assert.equal(wait,0);
 approaches.push({stance,wait,finish:r.time});
}
fs.writeFileSync(out+'/approaches.json',JSON.stringify({passed:true,approaches},null,2));
const missed=createRun();missed.mode='playing';missed.time=(6.4-water.offset+12)%12;Object.assign(missed.player,{x:0,y:near});
for(let i=0;i<90;i++)step(missed,{forward:1});assert(missed.waterHits>0);assert(!missed.lessonCrossed);assert.equal(missed.joe.phase,'absent');
const jumped=createRun();jumped.mode='playing';step(jumped,{});jumped.player.y=far+1;step(jumped,{});assert(!jumped.lessonCrossed,'No crossing credit from jumping between fixture positions');
const backed=createRun();backed.player.y=near;observeLesson(backed);backed.player.y=23;observeLesson(backed);backed.player.y=near;observeLesson(backed);assert(!backed.lessonCrossed);assert(!backed.lessonEntered);
for(const w of WATERS.filter(w=>!w.detour&&!['return','bypass'].includes(w.id))){
 for(let t=0;t<12;t+=.25){const state=waterState(w,t),p={x:w.x,y:w.y-w.depth/2-.6};const a=crossingAdvice(p,w,state);assert(!a.advice.includes('dry route'),w.id);}
}
for(const value of ['true',1,{},null])assert(!readSave(JSON.stringify({version:3,checkpoint:0,lessonCrossed:value})).lessonCrossed);
for(const version of [1,2,3]){assert(!readSave(JSON.stringify({version,checkpoint:0})).lessonCrossed);assert(readSave(JSON.stringify({version,checkpoint:1})).lessonCrossed);}
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,rows,checks:['72 phase/stance crossings retire coaching only after far-bank clearance','No compulsory wait when the opening fits; no water hits or active Joe during protected completion','A missed opening recovers without teaching completion; reversal and fixture jump do not award it','Strict optional saved fact preserves existing checkpoints and legacy migration','No-detour crossings never advertise an imaginary dry route']},null,2));console.log(JSON.stringify({passed:true,cases:rows.length,maxWait:Math.max(...rows.map(r=>r.wait)),missedHits:missed.waterHits}));
