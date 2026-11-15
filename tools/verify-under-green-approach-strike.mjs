import assert from 'node:assert/strict';
import fs from 'node:fs';
import {traverse} from './probe-under-green-folded.mjs';
import {createRun,step,snapshot} from '../web/under-green-sim.js';
import {approachingStrike} from '../web/under-green-attack-position.js';
import {observeJoe} from '../web/under-green-senses.js';
import {distance,wrap,lineClear} from '../web/under-green-course.js';
import {trimmerContact,TRIMMER} from '../web/under-green-trimmer.js';
const out='output/under-green/approach-strike';fs.mkdirSync(out,{recursive:true});
// Preserve the original observed service approach as a regression encounter.
// Route improvements legitimately change where the full campaign meets Joe.
const setup=JSON.parse(fs.readFileSync(new URL('./fixtures/under-green-approach-strike.json',import.meta.url)));
setup.joe.phase='walk';setup.joe.age=0;setup.player.yaw=Math.PI/2;
let initial=null,caught=null;const naive=structuredClone(setup);
for(let i=0;i<180&&naive.mode==='playing';i++){step(naive,{forward:1});if(!initial&&naive.joe.phase==='windup')initial=structuredClone(naive);if(naive.mode==='caught')caught=structuredClone(naive);}
assert(initial&&caught);assert.equal(naive.mode,'caught');assert(distance(initial.player,initial.joe)>4);assert(trimmerContact(caught.joe,caught.player));assert(lineClear(caught.joe,caught.player,.05));
assert(distance(caught.player,caught.joe)<TRIMMER.bladeFar+TRIMMER.bladeRadius+.3);
const facts={windupGap:distance(initial.player,initial.joe),windupSeconds:initial.elapsed,captureSeconds:naive.elapsed,captureGap:distance(caught.player,caught.joe)};
const front=structuredClone(initial);front.player.yaw=Math.atan2(front.joe.x-front.player.x,front.joe.y-front.player.y);front.player.rearAngle=0;
assert(observeJoe(front).visible&&observeJoe(front).imminent);front.player.yaw=wrap(front.player.yaw+Math.PI);assert(!observeJoe(front).visible&&!observeJoe(front).imminent,'A distant hidden windup must not disclose its state');
assert(!approachingStrike(initial.joe,initial.player,null,.95));assert(!approachingStrike(initial.joe,initial.player,{x:0,y:0},.95));assert(!approachingStrike(initial.joe,initial.player,{x:-3.84,y:0},.95));
const responses=[];
for(const delay of [.25,.5,.75])for(const action of ['sidestep','stop']){
 const r=structuredClone(initial);r.player.yaw=Math.PI/2;const start=r.elapsed,jx=r.joe.x,jy=r.joe.y,yaw=r.joe.yaw;let committedFrames=0,firstStrike=true;
 for(let i=0;i<210&&r.mode==='playing';i++){
  const t=r.elapsed-start;const input=t<delay?{forward:1}:action==='stop'?{}:t<delay+.55?{strafe:1}:{forward:1};
  step(r,input);
  if(firstStrike&&['windup','sweep'].includes(r.joe.phase)){assert.equal(r.joe.x,jx);assert.equal(r.joe.y,jy);assert.equal(r.joe.yaw,yaw);committedFrames++;}else firstStrike=false;
 }
 assert.equal(r.mode,'playing',`${action} after ${delay}s`);assert(committedFrames>45);assert.equal(r.waterHits,0);
 if(action==='sidestep')assert(r.player.x>jx+2,'Ordinary walking passes the recovery');
 responses.push({delay,action,mode:r.mode,committedFrames,player:{x:r.player.x,y:r.player.y},gap:distance(r.player,r.joe)});
}
const blind=createRun(2);blind.mode='playing';blind.player.grace=0;Object.assign(blind.player,{x:-20,y:56});Object.assign(blind.joe,{x:-2,y:54,phase:'walk',yaw:Math.PI,previousSight:{x:-20.064,y:56,time:blind.time},approachVelocity:{x:3.84,y:0}});step(blind,{});assert.equal(blind.joe.seen,false);assert.equal(blind.joe.approachVelocity,null);assert.notEqual(blind.joe.phase,'windup');
const reset=createRun(initial.checkpoint,false,'standard',snapshot(initial));assert(!reset.joe.previousSight&&!reset.joe.approachVelocity,'Retries do not invent observed motion');
const routes=[];
for(const options of [{dodge:true},{dodge:true,wet:true},{dodge:true,sprint:true},{dodge:true,decisionPause:3},{dodge:true,optional:true},{dodge:true,rangeRoute:'reactive',timedKeeper:true},{cp:1,dodge:true,durable:{bunkerRouteObserved:true}}]){
 const r=traverse(options);routes.push({options,mode:r.mode,seconds:r.elapsed,evasions:r.evasions,waterHits:r.waterHits,gap:r.gap});
 assert.equal(r.mode,'complete',JSON.stringify(routes.at(-1)));
}
fs.writeFileSync(`${out}/initial.json`,JSON.stringify(initial));fs.writeFileSync(`${out}/verified.json`,JSON.stringify({passed:true,facts,responses,routes,limits:['Scripted reactions prove selected counterplay, not human fear or fairness.','Full continuous animation/device/pursuit acceptance remains open.']},null,2));
console.log(JSON.stringify({passed:true,facts,responses,routes}));
