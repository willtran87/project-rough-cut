import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/under-green-sim.js';
import {distance,solid} from '../web/under-green-course.js';
import {rangeY} from '../web/under-green-layout.js';
import {RANGE_INSPECTION} from '../web/under-green-encounters.js';
import {traverse} from './probe-under-green-folded.mjs';

const out='output/under-green/late-pursuit';
fs.mkdirSync(out,{recursive:true});
const checks=[];
function approach(){
 const r=createRun(2);r.mode='playing';
 Object.assign(r.joe,{x:21,y:38,yaw:Math.PI,phase:'walk'});
 Object.assign(r.player,{x:21,y:rangeY(36),yaw:Math.PI,grace:999});
 step(r);return r;
}
function hidden(r,position={x:-24,y:37},frames=120){
 Object.assign(r.player,position);
 for(let i=0;i<frames;i++){
  const previous={...r.joe};step(r);
  assert.equal(r.joe.seen,false);
  assert(distance(previous,r.joe)<=2.1/60+.00001);
  assert(!solid(r.joe,.72));
 }
 return r;
}
const seen=approach();step(seen,{forward:1});assert(seen.joe.sawRangeRoute);
fs.writeFileSync(out+'/sighting-fixture.json',JSON.stringify(seen));
const copies=[{x:-24,y:37},{x:0,y:5}].map(p=>hidden(structuredClone(seen),p));
assert(copies.every(r=>r.joe.rangeInspectionUsed));
// Distance-trend values feed presentation only, not pursuit decisions.
const decisions=({closingRate,previousGap,...joe})=>joe;
assert.deepEqual(decisions(copies[0].joe),decisions(copies[1].joe));
assert.deepEqual(copies[0].joe.last,RANGE_INSPECTION.target);
assert.equal(copies[0].events.filter(e=>e.reason==='observed-range-route').length,1);
hidden(copies[0],undefined,120);
assert.equal(copies[0].events.filter(e=>e.reason==='observed-range-route').length,1);
checks.push('A witnessed southward route choice triggers one fixed-exit inspection after lost contact; hidden destinations produce identical pursuit decisions and bounded walking');

const stationary=approach();hidden(stationary);assert(!stationary.joe.rangeInspectionUsed);
const reverse=structuredClone(seen);step(reverse,{forward:-1});assert.equal(reverse.joe.sawRangeRoute,false);hidden(reverse);assert(!reverse.joe.rangeInspectionUsed);
const unseen=approach();Object.assign(unseen.joe,{y:38.8,yaw:0});unseen.player.y=rangeY(33);step(unseen,{forward:1});assert(!unseen.joe.seen);hidden(unseen);assert(!unseen.joe.rangeInspectionUsed);
checks.push('A stationary sighting, movement outside the viewing cone, or a witnessed reversal cannot trigger the range-exit inspection');

const fresh=structuredClone(copies[1]);Object.assign(fresh.player,{x:fresh.joe.x,y:fresh.joe.y-2});fresh.joe.yaw=Math.PI;step(fresh);
assert(fresh.joe.seen);assert.equal(fresh.joe.evidence,'sight');assert.deepEqual(fresh.joe.last,{x:fresh.player.x,y:fresh.player.y});
checks.push('Fresh visible evidence supersedes the inspection destination');

const results=[];
for(const options of [{dodge:true},{dodge:true,wet:true},{dodge:true,sprint:true},{dodge:true,cp:1},{dodge:true,cp:2}]){
 let fixtureSaved=false;
 const result=traverse({...options,inspect:r=>{
  if(!fixtureSaved&&r.joe.rangeInspectionUsed){
   fixtureSaved=true;if(!options.cp&&!options.sprint&&!options.wet)fs.writeFileSync(out+'/route-fixture.json',JSON.stringify(r));
  }
 }});
 assert.equal(result.mode,'complete',JSON.stringify(options));
 assert.equal(result.solid,false);
 if(!options.cp&&!options.wet)assert(result.j.rangeInspectionUsed);
 results.push({options,result});
 console.log(JSON.stringify({options,mode:result.mode,seconds:result.elapsed,gap:result.gap,evasions:result.evasions}));
}
checks.push('Full walking wet/dry and sprint routes, plus checkpoints 1 and 2, remain completable with ordinary simulation movement');
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,checks,results},null,2));
console.log(JSON.stringify({passed:true,checks}));
