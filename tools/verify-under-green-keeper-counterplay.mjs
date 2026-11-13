import assert from 'node:assert/strict';
import fs from 'node:fs';
import {counterplay} from './probe-under-green-keeper-counterplay.mjs';
import {createRun,step,snapshot,nearbyAction} from '../web/under-green-sim.js';
import {interactionFeedback} from '../web/under-green-interactions.js';
import {sluiceObstruction} from '../web/under-green-sluice.js';
import {captureFailure} from '../web/under-green-outcome.js';
import {keeperInside,gateOccupied,gateBlocks,SLUICE,GATE,distance,solid} from '../web/under-green-course.js';
import {JOE_RADIUS,weaponClear} from '../web/under-green-clearance.js';
const out='output/under-green/keeper-counterplay';fs.mkdirSync(out,{recursive:true});
const initial=JSON.parse(fs.readFileSync('tools/fixtures/under-green-keeper-occupied.json')).run,checks=[],results=[];
let r=structuredClone(initial);
assert(keeperInside(r.player)&&keeperInside(r.joe));assert.match(nearbyAction(r).detail,/Stay inside/);
step(r,{use:true});assert(!r.closing&&!r.finished);assert(r.sluiceBlocked);assert.equal(sluiceObstruction(r),'room');assert.match(r.message,/Joe is inside/);
r.messageTime=0;assert.match(nearbyAction(r).label,/blocked/i);assert.match(interactionFeedback(r).text,/spillway/);
assert(!('sluiceBlocked' in snapshot(r)),'Transient queried interlock must not persist');
const originalYaw=r.player.yaw;r.player.yaw+=Math.PI;assert.equal(interactionFeedback(r),null);r.player.yaw=originalYaw;
r.mode='paused';const paused=JSON.stringify(r);for(let i=0;i<90;i++)step(r,{});assert.equal(JSON.stringify(r),paused);assert.equal(interactionFeedback(r),null);r.mode='playing';
Object.assign(r.joe,{x:12,y:25,yaw:0,phase:'walk',weaponPose:null});assert.equal(sluiceObstruction(r),null);assert.match(nearbyAction(r).detail,/Stay inside/);
assert.notEqual(captureFailure(r).kind,'occupied-sluice','Cleared occupancy must not retain old defeat coaching');
checks.push('A requested occupied-room release explains the spillway recovery; nearby fallback persists, looking away hides it, pause freezes it, cleared interlock restores normal detail, and saves omit it');
const death=structuredClone(initial);step(death,{use:true,crouch:true});for(let i=0;i<600&&death.mode==='playing';i++)step(death,{crouch:true});
assert.equal(death.mode,'caught');assert.equal(death.failure.kind,'occupied-sluice');assert.match(death.failure.advice,/run back to the release/);
fs.writeFileSync(out+'/defeat.json',JSON.stringify(death));
checks.push('Actual blade contact after a refused release gets occupied-sluice recovery coaching; unrelated or cleared occupancy does not');
r=createRun(3);r.mode='playing';Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI});
Object.assign(r.joe,{x:GATE.x,y:GATE.y+1.1,yaw:Math.PI,phase:'walk',age:0});
assert(!gateOccupied(r.joe));assert.equal(sluiceObstruction(r),'threshold');step(r,{use:true});assert(!r.closing);assert.match(r.message,/threshold is blocked/);
r=createRun(3);r.mode='playing';r.closing=true;r.gate=.2;Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI});Object.assign(r.joe,{x:12,y:GATE.y-1,phase:'recover',age:0});step(r);assert(!r.closing&&!r.finished);assert(r.sluiceBlocked);assert.match(r.message,/Closure stopped.*Joe is inside/);
checks.push('Body-inside, threshold-tool-only and interrupted closure use the same physical obstruction rules and distinct truthful messages');
for(const side of [-1,1]){
 const tape=counterplay(initial,side),r=structuredClone(initial);let maxPlayerStep=0,maxJoeStep=0,geometrySamples=0;
 for(let frame=0;frame<tape.inputs.length;frame++){
  const previous={...r.player},previousJoe={...r.joe},i=tape.inputs[frame];r.player.yaw=i.yaw;step(r,i.input);
  maxPlayerStep=Math.max(maxPlayerStep,distance(previous,r.player));maxJoeStep=Math.max(maxJoeStep,distance(previousJoe,r.joe));
  assert(!solid(r.player,.3,gateBlocks(r.gate,1.8)));assert(!solid(r.joe,JOE_RADIUS,gateBlocks(r.gate,1.9)));
  if(frame%6===0){assert(weaponClear(r.joe,r.gate),`Tool obstruction at ${side}/${frame}`);geometrySamples++;}
  if(r.finished){assert(keeperInside(r.player));assert(!sluiceObstruction(r));}
 }
 assert.equal(r.mode,'complete');assert.equal(r.waterHits,initial.waterHits);assert.equal(r.gate,1);assert(!keeperInside(r.joe));
 assert(maxPlayerStep<=6.08/60+1e-8);assert(maxJoeStep<=2.1/60+1e-8);
 assert.equal(r.elapsed,tape.final.elapsed);
 fs.writeFileSync(`${out}/attempt-${side}.json`,JSON.stringify(tape));results.push({side,seconds:tape.result.seconds,hits:tape.result.hits,frames:tape.inputs.length,maxPlayerStep,maxJoeStep,geometrySamples,stages:tape.result.samples.filter(s=>s.event)});
}
checks.push('Both retained-state routes physically lure Joe across the spillway, dodge a committed swing and secure the room with ordinary sprint inputs, zero water hits and bounded movement; no actor relocation or altered attack rules');
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,checks,results,limits:['One retained occupied-room state with two return sides, not all reachable keeper states.','Perfect-map/phase/attack pilot; human interpretation, comfort and improvisation are not proven.','Simulation weapon-clearance samples every six frames, not rendered mesh coverage at every pose.']},null,2));
console.log(JSON.stringify({passed:true,checks,results},null,2));
