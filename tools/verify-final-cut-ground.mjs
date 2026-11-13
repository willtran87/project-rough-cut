import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {BOARD_WALK,BOARD_TURN,BOARD_START,BOARD_CLIMB,BOARD_READY} from '../web/final-cut-arrival.js';
import {EXIT_END} from '../web/final-cut-ending.js';
import {groundSnapshot,restoreGroundFeet,createGroundFeet,groundHomes} from '../web/final-cut-footwork.js';
const checks=[],runs=[];
for(const hz of [30,60,120])for(const kind of ['arrival','ending','late-gate','opposite-low','opposite-high']){
 const r=createRun(kind==='arrival'?{}:{checkpoint:2,ending:{age:EXIT_END,...(kind.startsWith('opposite')?{wreck:{x:kind==='opposite-low'?2.2:13.8,y:74,yaw:Math.PI/2}}:{})}});r.mode=kind==='arrival'?'playing':'aftermath';const end=kind==='arrival'?BOARD_WALK+BOARD_TURN:65;let prior=null,locked=0,swings=0,maxDrift=0,maxReach=0;
 for(let n=0;n<end*hz;n++){
  if(kind==='ending'||kind.startsWith('opposite')||kind==='late-gate'&&n/hz>38)r.player.y=101;
  step(r,{},1/hz);const j=kind==='arrival'?r.arrival.joe:r.ending.joe;if(kind==='arrival'&&j.climb>0)break;const feet=j.feet,homes=groundHomes(j);for(let i=0;i<2;i++){maxReach=Math.max(maxReach,Math.hypot(feet[i].x-homes[i].x,feet[i].y-homes[i].y));}assert(maxReach<.4,'Root outruns its ground supports');
  assert(feet.some(f=>!f.step),'Both feet are airborne');for(let i=0;i<2;i++){const f=feet[i];assert(f.height>=.12-1e-9&&f.height<=.325+1e-9);if(prior&&!prior[i].step&&!f.step){const d=Math.hypot(f.x-prior[i].x,f.y-prior[i].y,f.height-prior[i].height);maxDrift=Math.max(maxDrift,d);assert(d<1e-9,'A planted support moved');assert.equal(f.yaw,prior[i].yaw);locked++;}if(f.step&&!prior?.[i]?.step)swings++;}
  if(n%Math.round(hz*.37)===0){const saved=snapshot(r),restored=createRun(readSave(JSON.stringify(saved))),actor=kind==='arrival'?restored.arrival.joe:restored.ending.joe;assert.deepEqual(actor.feet,feet,'Save changes unfinished ground step');assert.equal(actor.speed,j.speed);if(kind!=='arrival')assert.equal(actor.egress,j.egress);const detached=groundSnapshot(feet);detached[0].x+=1;assert.notEqual(detached[0].x,feet[0].x);}
  prior=groundSnapshot(feet);
 }
 assert(locked>100&&swings>4);if(kind!=='arrival'){assert.equal(r.ending.joe.phase,'fence');assert(Math.abs(r.ending.joe.yaw)<1e-9);assert(r.ending.joe.feet.every(f=>!f.step));}runs.push({hz,kind,locked,swings,maxDrift,maxReach});
}
checks.push('30/60/120Hz arrival, immediate gate and late-gate coda: stationary support position/orientation, at least one planted foot, bounded lift and settled final fence');
checks.push('Live swing snapshots round-trip through readSave/createRun without pose or speed changes; snapshots do not alias supports');
const j={x:0,y:0,yaw:0,speed:0};for(const invalid of [null,[],[{x:NaN}],createGroundFeet(j).map(f=>({...f,x:999})),createGroundFeet(j).map(f=>({...f,height:-1}))])assert.deepEqual(restoreGroundFeet(invalid,j),createGroundFeet(j));
checks.push('Missing and malformed legacy support records fall back to a finite grounded stance');
for(const fraction of [0,.25,.8,1]){const age=Math.hypot(.05,5.92)/1.65+.25+.8+BOARD_CLIMB*fraction,r=createRun(readSave(JSON.stringify({version:1,checkpoint:0,arrival:{motionVersion:2,age,reached:true}})));assert(Math.abs(r.arrival.joe.climb-fraction)<1e-9);assert.equal(snapshot(r).arrival.motionVersion,4);}
const ready=createRun(readSave(JSON.stringify({version:1,checkpoint:0,arrival:{motionVersion:2,age:Math.hypot(.05,5.92)/1.65+.25+.8+BOARD_CLIMB+2,reached:true}})));assert(ready.arrival.ready);assert.equal(ready.arrival.joe.phase,'cab');
checks.push('Version-2 arrival progress/startup migrates once to the acceleration clock; already boarded and ready actors remain boarded and ready');
fs.mkdirSync('output/final-cut/ground',{recursive:true});fs.writeFileSync('output/final-cut/ground/rules.json',JSON.stringify({passed:true,checks,runs},null,2));console.log(JSON.stringify({passed:true,checks,runs}));
