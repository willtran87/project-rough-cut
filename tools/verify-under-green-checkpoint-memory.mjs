import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave} from '../web/under-green-sim.js';
import {floodState} from '../web/under-green-flood.js';
import {distance,solid} from '../web/under-green-course.js';
import {weaponClear,JOE_RADIUS} from '../web/under-green-clearance.js';
import {BUNKER_INSPECTION} from '../web/under-green-encounters.js';
import {strikeQuery} from '../web/under-green-strike-surfaces.js';
import {trimmerPose} from '../web/under-green-trimmer.js';
import {traverse} from './probe-under-green-folded.mjs';
const out='output/under-green/checkpoint-one';fs.mkdirSync(out,{recursive:true});
const checks=[];
// Route memory now belongs to a single attempt: the run never advances a saved
// checkpoint and saves carry only completion/preferences (under-green-sim.js,
// "Every retry resets both memories"). Restored knowledge survives only as an
// isolated QA fixture via createRun(1,...,{bunkerRouteObserved:true}).
function approach(visible=true){
 const r=createRun();r.mode='playing';r.time=24;
 Object.assign(r.player,{x:-3.7,y:73,yaw:-Math.PI/2});
 Object.assign(r.joe,{x:visible?0:-30,y:visible?58:54,yaw:0,phase:'walk',last:{x:0,y:55}});
 for(let i=0;i<8;i++)step(r,{forward:1});
 assert.equal(r.checkpoint,0,'Attempts never advance a checkpoint');return r;
}
const witnessed=approach(),unseen=approach(false);
assert(witnessed.joe.sawBunkerRoute&&witnessed.bunkerRouteObserved);
assert(!unseen.joe.sawBunkerRoute&&!unseen.bunkerRouteObserved);
const saved=readSave(JSON.stringify(snapshot(witnessed)));
assert(!('bunkerRouteObserved' in snapshot(witnessed))&&!('checkpoint' in snapshot(witnessed)));assert(!('bunkerRouteObserved' in saved));
fs.writeFileSync(out+'/witnessed-save.json',JSON.stringify(snapshot(witnessed),null,2));
const retry=createRun(0,saved.evidence,saved.difficulty,saved);assert(!retry.bunkerRouteObserved&&!retry.joe.sawBunkerRoute,'A retry forgets the witnessed route');
const restored=createRun(1,false,'standard',{bunkerRouteObserved:true});
assert(restored.joe.sawBunkerRoute);assert.equal(restored.joe.evidenceAt,restored.time);
assert.equal(restored.joe.x,0);assert.equal(restored.joe.y,55);
assert.equal(restored.joe.phase,'walk');assert.equal(restored.joe.attackSerial,0);
checks.push('Real observed westward movement is remembered for the attempt only; saves and retries forget it. The checkpoint-1 QA fixture restores it as route knowledge without a live enemy position or attack');

const copies=[{x:-30,y:70},{x:-30,y:54}].map(p=>{
 const r=structuredClone(restored);r.mode='playing';Object.assign(r.player,p);
 for(let i=0;i<240;i++){const before={...r.joe};step(r);assert(!r.joe.seen);assert(r.joe.paceScale>=1&&r.joe.paceScale<=2.6+1e-9);assert(distance(before,r.joe)<=2.1*r.joe.paceScale*floodState(r.elapsed).speedScale/60+.00001);}
 return r;
});
const decisions=({closingRate,previousGap,...j})=>j;
assert.deepEqual(decisions(copies[0].joe),decisions(copies[1].joe));
assert.deepEqual(copies[0].joe.last,BUNKER_INSPECTION.target);
assert.equal(copies[0].events.filter(e=>e.reason==='observed-bunker-route').length,1);
checks.push('Restored knowledge selects one authored service-exit inspection through ordinary walking (with unseen catch-up pace); hidden player destinations produce identical decisions');

const serial=witnessed.saveSerial;step(witnessed,{forward:-1});
assert(witnessed.joe.seen);assert(!witnessed.bunkerRouteObserved&&!witnessed.joe.sawBunkerRoute);
assert.equal(witnessed.saveSerial,serial,'Route memory is not saved, so no save is requested');assert(!('bunkerRouteObserved' in snapshot(witnessed)));
checks.push('A witnessed reversal invalidates the remembered route without requesting a save');
for(const value of [undefined,false,true,'true',1,{},null]){const legacy=readSave(JSON.stringify({version:3,checkpoint:1,bunkerRouteObserved:value}));assert(!('bunkerRouteObserved' in legacy)&&!('checkpoint' in legacy));assert(!createRun(0,false,'standard',legacy).bunkerRouteObserved);}
assert(!('bunkerRouteObserved' in readSave(JSON.stringify({version:2,checkpoint:1}))));
assert(!createRun(0,false,'standard',{bunkerRouteObserved:true}).bunkerRouteObserved);
assert(!createRun(2,false,'standard',{bunkerRouteObserved:true}).joe.sawBunkerRoute);
assert(!createRun(1).joe.sawBunkerRoute);
checks.push('Legacy saves (even with a genuine flag) do not carry knowledge; chapter restarts and later checkpoints cannot activate the checkpoint-1 inference');

// Checkpoint retries are no longer player-facing, so the escape guarantee is
// exercised on complete attempts in which Joe can witness the bunker route.
const runs=[];let clearanceFrames=0,inspected=0;
for(const options of [{},{wet:true},{sprint:true},{pressure:'steady'},{pressure:'relentless'}]){
 let fixtureSaved=false,used=false;
 const result=traverse({dodge:true,...options,inspect:r=>{
  assert(!solid(r.joe,JOE_RADIUS));
  // A planted strike (and its retraction) is solved against the forged steel
  // perimeter so the blade can reach masonry before recoiling
  // (under-green-clearance.js settleWeapon); navigation keeps the broad capsule.
  const planted=['windup','sweep','recover'].includes(r.joe.phase)||r.joe.strikeRetraction;
  assert(planted?!strikeQuery(r.joe,r.gate)(trimmerPose(r.joe)):weaponClear(r.joe,r.gate));clearanceFrames++;used||=r.joe.bunkerInspectionUsed===true;
  if(!Object.keys(options).length&&!fixtureSaved&&r.elapsed>10&&r.player.y<45&&distance(r.player,r.joe)<6){
   fixtureSaved=true;fs.writeFileSync(out+'/restored-encounter.json',JSON.stringify(r));
  }
 }});
 assert.equal(result.mode,'complete',JSON.stringify(options));assert(!result.solid);if(used)inspected++;
 runs.push({options,used,elapsed:result.elapsed,gap:result.gap,metrics:result.metrics,evasions:result.evasions});
 console.log(JSON.stringify(runs.at(-1)));
}
assert(inspected>=1,'At least one complete attempt exercises the witnessed bunker-route inspection');assert(runs[0].used,'The standard walking attempt meets the bunker inspection');
checks.push('Complete attempts, including ones where Joe uses the witnessed bunker-route inspection, finish via dry walking, wet crossings, sprinting and all pressure settings with ordinary evasions and physical body/tool clearance');
fs.writeFileSync(out+'/memory-verified.json',JSON.stringify({passed:true,checks,runs,clearanceFrames},null,2));
console.log(JSON.stringify({passed:true,checks}));
