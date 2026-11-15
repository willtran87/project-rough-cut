import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave} from '../web/under-green-sim.js';
import {distance,solid} from '../web/under-green-course.js';
import {weaponClear,JOE_RADIUS} from '../web/under-green-clearance.js';
import {BUNKER_INSPECTION} from '../web/under-green-encounters.js';
import {traverse} from './probe-under-green-folded.mjs';
const out='output/under-green/checkpoint-one';fs.mkdirSync(out,{recursive:true});
const checks=[];
function approach(visible=true){
 const r=createRun();r.mode='playing';r.time=24;
 Object.assign(r.player,{x:-3.7,y:73,yaw:-Math.PI/2});
 Object.assign(r.joe,{x:visible?0:-30,y:visible?58:54,yaw:0,phase:'walk',last:{x:0,y:55}});
 for(let i=0;i<8;i++)step(r,{forward:1});
 assert.equal(r.checkpoint,1);return r;
}
const witnessed=approach(),unseen=approach(false);
assert(witnessed.joe.sawBunkerRoute&&witnessed.bunkerRouteObserved);
assert(!unseen.joe.sawBunkerRoute&&!unseen.bunkerRouteObserved);
const saved=readSave(JSON.stringify(snapshot(witnessed)));
assert(saved.bunkerRouteObserved);assert(!snapshot(unseen).bunkerRouteObserved);
fs.writeFileSync(out+'/witnessed-save.json',JSON.stringify(snapshot(witnessed),null,2));
const restored=createRun(saved.checkpoint,saved.evidence,saved.difficulty,saved);
assert(restored.joe.sawBunkerRoute);assert.equal(restored.joe.evidenceAt,restored.time);
assert.equal(restored.joe.x,0);assert.equal(restored.joe.y,55);
assert.equal(restored.joe.phase,'walk');assert.equal(restored.joe.attackSerial,0);
checks.push('Real observed westward movement is saved at checkpoint 1 and restored as route knowledge, without saving a live enemy position or attack');

const copies=[{x:-30,y:70},{x:-30,y:54}].map(p=>{
 const r=structuredClone(restored);r.mode='playing';Object.assign(r.player,p);
 for(let i=0;i<240;i++){const before={...r.joe};step(r);assert(!r.joe.seen);assert(distance(before,r.joe)<=2.1/60+.00001);}
 return r;
});
const decisions=({closingRate,previousGap,...j})=>j;
assert.deepEqual(decisions(copies[0].joe),decisions(copies[1].joe));
assert.deepEqual(copies[0].joe.last,BUNKER_INSPECTION.target);
assert.equal(copies[0].events.filter(e=>e.reason==='observed-bunker-route').length,1);
checks.push('Restored knowledge selects one authored service-exit inspection through ordinary walking; hidden player destinations produce identical decisions');

const serial=witnessed.saveSerial;step(witnessed,{forward:-1});
assert(witnessed.joe.seen);assert(!witnessed.bunkerRouteObserved&&!witnessed.joe.sawBunkerRoute);
assert.equal(witnessed.saveSerial,serial+1);assert(!snapshot(witnessed).bunkerRouteObserved);
checks.push('A witnessed reversal invalidates the remembered route and requests a new save');
for(const value of [undefined,false,'true',1,{},null])assert(!readSave(JSON.stringify({version:3,checkpoint:1,bunkerRouteObserved:value})).bunkerRouteObserved);
assert(!readSave(JSON.stringify({version:2,checkpoint:1})).bunkerRouteObserved);
assert(!createRun(0,false,'standard',saved).bunkerRouteObserved);
assert(!createRun(2,false,'standard',saved).joe.sawBunkerRoute);
assert(!createRun(1).joe.sawBunkerRoute);
checks.push('Legacy/unwitnessed saves do not invent knowledge; malformed values, chapter restarts and later checkpoints cannot activate the checkpoint-1 inference');

const runs=[];let clearanceFrames=0;
for(const options of [{},{wet:true},{sprint:true},{pressure:'steady'},{pressure:'relentless'}]){
 let fixtureSaved=false;
 const result=traverse({cp:1,dodge:true,durable:saved,...options,inspect:r=>{
  assert(!solid(r.joe,JOE_RADIUS));assert(weaponClear(r.joe,r.gate));clearanceFrames++;
  if(!Object.keys(options).length&&!fixtureSaved&&r.elapsed>10&&r.player.y<45&&distance(r.player,r.joe)<6){
   fixtureSaved=true;fs.writeFileSync(out+'/restored-encounter.json',JSON.stringify(r));
  }
 }});
 assert.equal(result.mode,'complete',JSON.stringify(options));assert(!result.solid);
 runs.push({options,elapsed:result.elapsed,gap:result.gap,metrics:result.metrics,evasions:result.evasions});
 console.log(JSON.stringify(runs.at(-1)));
}
checks.push('Observed-route checkpoint retries complete via dry walking, wet crossings, sprinting and all pressure settings with ordinary evasions and physical body/tool clearance');
fs.writeFileSync(out+'/memory-verified.json',JSON.stringify({passed:true,checks,runs,clearanceFrames},null,2));
console.log(JSON.stringify({passed:true,checks}));
