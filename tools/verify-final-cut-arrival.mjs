import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave,nearbyAction} from '../web/final-cut-sim.js';
import {BOARD_READY,BOARD_WALK,BOARD_TURN,BOARD_CLIMB,boardingPose} from '../web/final-cut-arrival.js';
import {OVERLOOK,ARRIVAL_SPAWNS,ACCESS,ACCESS_FENCE,groundHeight} from '../web/final-cut-arrival-layout.js';
import {solid} from '../web/final-cut-course.js';
import {traverse} from './probe-final-cut.mjs';
const checks=[],runs=[],tick=(r,n,i={},hz=60)=>{for(let k=0;k<n*hz;k++)step(r,i,1/hz);};
for(const route of ['garage','drain','direct']){
 let r=createRun({route});assert.equal(r.player.x,ARRIVAL_SPAWNS[route].x);assert(!solid(r.player,.3,false,[],0,0));
 r.mode='playing';tick(r,180);assert.equal(r.arrival.ready,route==='direct');assert.equal(r.rig.phase,'waiting');assert(!r.arrival.requested);assert(!r.arrival.open);assert.equal(r.cut.length,0);
 if(route!=='direct'){assert.equal(r.arrival.joe.phase,'wait');Object.assign(r.player,{x:-2,y:-2});tick(r,BOARD_READY+.1);assert(r.arrival.ready);assert.equal(r.rig.phase,'waiting');}
 assert.equal(r.events.filter(e=>e.type==='rig-startup').length,1);
}
checks.push('Three valid distinct spawns; Joe waits until each branch reaches the shared overlook; three-minute observation never starts cutting, even after boarding/startup');
for(const hz of [30,60,120]){
 const r=createRun();r.mode='playing';Object.assign(r.player,{x:-2,y:17.3,yaw:-Math.PI/2});assert.equal(nearbyAction(r)?.id,ACCESS.id);step(r,{use:true},1/hz);assert(r.arrival.requested);
 while(!r.arrival.open){const before=r.rig.x;step(r,{},1/hz);assert.equal(r.mode,'playing');assert(r.time<45);if(r.rig.phase==='pass'&&before>=-6)assert(r.rig.x>=-6-.25||r.arrival.open);}
 assert.equal(r.rig.phase,'pass');assert(r.rig.x<-6);assert(r.broken.includes('hospitality-table'));assert(r.cutAreas.some(a=>a.y===26&&a.lo<-3));
 tick(r,.8,{},hz);assert.equal(r.arrival.gate,1);assert(!solid({x:-2,y:19.5},.3,false,r.broken,0,r.arrival.gate));
 const restored=createRun(readSave(JSON.stringify(snapshot(r))));assert(restored.arrival.open&&restored.arrival.ready);assert.equal(restored.arrival.gate,1);assert.equal(restored.rig.phase,'announce');assert.equal(groundHeight(restored.player),OVERLOOK.h);
}
checks.push('30/60/120 Hz: actual Use starts the demonstration, the gate opens only behind the westbound cutting footprint, crushed table and cut ground persist, retry restores a safe overlook and open passage');
for(const gate of [0,.25,.5,.75,1])for(const x of [-3.6,-2.6,-1.6,-.6]){
 const expected=Math.abs(x-(-2-4*gate))<2.3;assert.equal(solid({x,y:19.5},.3,false,[],0,gate),expected);
}
for(const fence of ACCESS_FENCE)assert(solid({x:fence.x,y:fence.y}));
checks.push('Sliding gate collision follows its rendered position through five poses; side fences prevent skipping the first pass');
let r=createRun({route:'garage'});r.mode='playing';Object.assign(r.player,{x:-2,y:-2});tick(r,BOARD_WALK*.5);const first=structuredClone(r.arrival);r.mode='paused';tick(r,10);assert.deepEqual(r.arrival,first);
const reload=createRun(readSave(JSON.stringify(snapshot(r))));assert.deepEqual(reload.arrival.joe,first.joe);assert.equal(reload.arrival.age,first.age);assert.equal(reload.player.x,ARRIVAL_SPAWNS.direct.x);
for(const age of [BOARD_WALK,BOARD_WALK+BOARD_TURN,BOARD_READY-2,BOARD_READY]){
 const p=boardingPose(age),before=boardingPose(age-1e-5);assert(Math.hypot(p.x-before.x,p.y-before.y)<.001);assert(Number.isFinite(p.yaw));
}
assert.equal(boardingPose(BOARD_WALK+BOARD_TURN+BOARD_CLIMB).phase,'cab');
checks.push('Boarding path/turn boundaries are continuous; pause freezes the actor and mid-walk reload restores its actual place');
for(const route of ['garage','drain','direct'])for(const sprint of [false,true]){
 const {run}=traverse({route,sprint});assert(run.completed&&run.won);assert.equal(run.captures,0);assert.deepEqual(run.stats.crossings,[0,1,2]);assert(run.arrival.open&&run.arrival.reached);runs.push({route,sprint,seconds:run.elapsed});
}
checks.push('Six uninterrupted ordinary-control simulation clears from the real branch/direct entrances, walking and sprinting, including the new gate interaction');
fs.mkdirSync('output/final-cut/arrival',{recursive:true});fs.writeFileSync('output/final-cut/arrival/rules.json',JSON.stringify({passed:true,checks,runs},null,2));console.log(JSON.stringify({passed:true,checks,runs},null,2));
