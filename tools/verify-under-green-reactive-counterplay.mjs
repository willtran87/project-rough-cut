import fs from 'node:fs';
import assert from 'node:assert/strict';
import {step,MOVEMENT,snapshot} from '../web/under-green-sim.js';
import {solid,distance,keeperInside} from '../web/under-green-course.js';
import {JOE_RADIUS} from '../web/under-green-clearance.js';
import {sluiceObstruction} from '../web/under-green-sluice.js';
const out='output/under-green/reactive-counterplay',study=JSON.parse(fs.readFileSync(out+'/expanded.json')),rows=[];
for(const report of study.reports)for(const row of report.rows){
 const tape=JSON.parse(fs.readFileSync(row.file)),r=structuredClone(tape.initial);let maxPlayerStep=0,maxJoeStep=0,overlaps=0,securedFrames=0;
 for(const frame of tape.inputs){
  const player={...r.player},joe={...r.joe};r.player.yaw=frame.yaw;step(r,frame.input);
  maxPlayerStep=Math.max(maxPlayerStep,distance(player,r.player));maxJoeStep=Math.max(maxJoeStep,distance(joe,r.joe));
  if(solid(r.player,.3)||solid(r.joe,JOE_RADIUS))overlaps++;
  if(r.finished){securedFrames++;assert(keeperInside(r.player));assert(!sluiceObstruction(r));assert.equal(r.gate,1);}
 }
 assert.equal(r.mode,tape.final.mode);assert.equal(r.waterHits,tape.final.waterHits);assert(Math.abs(r.elapsed-tape.final.elapsed)<1e-7);assert(distance(r.player,tape.final.player)<1e-7);assert(distance(r.joe,tape.final.joe)<1e-7);
 assert.equal(overlaps,0);assert(maxPlayerStep<=MOVEMENT.sprint/60+1e-7);assert(maxJoeStep<=2.35/60+1e-7);
 assert(!('messageKind' in snapshot(r)),'Message priority is not durable chapter progress');
 rows.push({source:report.source,moment:row.moment,delay:row.delay,side:row.side,mode:r.mode,seconds:row.seconds,hits:row.hits,frames:tape.inputs.length,maxPlayerStep,maxJoeStep,overlaps,securedFrames});
}
const complete=rows.filter(r=>r.mode==='complete').length,caught=rows.filter(r=>r.mode==='caught').length;
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,rows,complete,caught,limits:['Retained reachable states and scripted sprint/strafe routes, not a universal recovery or unfamiliar-player claim.','Both failed and successful policies remain in the report; matching a caught replay is not a success claim.']},null,2));
console.log(JSON.stringify({passed:true,cases:rows.length,complete,caught,frames:rows.reduce((n,r)=>n+r.frames,0)}));
