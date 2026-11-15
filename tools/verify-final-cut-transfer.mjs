import {actorGroundHeight} from '../web/final-cut-ground-layout.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {createRun,readSave,snapshot,step} from '../web/final-cut-sim.js';
import {BOARD_SPEED,BOARD_WALK,BOARD_STOP,BOARD_TURN,BOARD_CLIMB,BOARD_READY,boardingPose} from '../web/final-cut-arrival.js';
import {EXIT_START,EXIT_DURATION,EXIT_END,collapsePose,advanceEnding} from '../web/final-cut-ending.js';
import {transferPose} from '../web/final-cut-transfer.js';
import {cabExitRoot} from '../web/final-cut-cab.js';

const checks=[],oldWalk=Math.hypot(6,.1)/BOARD_SPEED,oldStart=oldWalk+.8;
for(const fraction of [0,.2,.5,.8,.999]){
 const old={version:1,checkpoint:0,arrival:{age:oldStart+fraction*3.5,reached:true,requested:true}},restored=createRun(readSave(JSON.stringify(old)));
 assert(Math.abs(restored.arrival.joe.climb-fraction)<1e-9);assert(restored.arrival.requested);assert(!restored.arrival.open);
 const save=snapshot(restored),again=readSave(JSON.stringify(save));assert.equal(again.arrival.motionVersion,4);assert(Math.abs(again.arrival.age-save.arrival.age)<1e-10);
}
const ready=createRun(readSave(JSON.stringify({version:1,checkpoint:0,arrival:{age:oldStart+3.5+2,reached:true,requested:true}})));assert(ready.arrival.ready);assert.equal(ready.arrival.age,BOARD_READY);
for(const fraction of [0,.2,.5,.8,1]){
 const oldWalk=Math.hypot(.05,5.92)/BOARD_SPEED+.5,oldAge=oldWalk+.8+BOARD_CLIMB*fraction;
 const old={version:1,checkpoint:0,arrival:{motionVersion:3,age:oldAge,reached:true,feet:[{x:30,y:24,height:.12,yaw:0},{x:31,y:24,height:.12,yaw:0}]}},restored=createRun(readSave(JSON.stringify(old)));
 assert(Math.abs(restored.arrival.joe.climb-fraction)<1e-9);assert.equal(snapshot(restored).arrival.motionVersion,4);assert(restored.arrival.joe.feet.every(f=>f.x<27),'Old parking-location feet survived migration');
}
checks.push('Version3 parking relocation preserves climb progress and reconstructs old ground supports at the current apron');
for(const fraction of [0,.2,.5,.8]){
 const oldWalk=Math.hypot(.05,5.92)/BOARD_SPEED+.5,old={version:1,checkpoint:0,arrival:{motionVersion:3,age:oldWalk*fraction,reached:true}};
 const restored=createRun(readSave(JSON.stringify(old)));assert(Math.abs(restored.arrival.age-BOARD_WALK*fraction)<1e-9);
 const current=snapshot(restored),again=createRun(readSave(JSON.stringify(current)));assert.deepEqual(again.arrival.joe,restored.arrival.joe);
}
checks.push('Version3 mid-walk saves retain normalized walk progress and their migrated current foot pose round-trips exactly');
checks.push('Legacy boarding progress and completed startup migrate once; current snapshots do not remap their clocks');
for(const age of [0,3.2,6.99,7,8,9,10.9,11,12,50]){
 const j=age>=11?{x:13,y:78,yaw:.2,walk:2,target:0,phase:'walk'}:undefined,save={version:1,checkpoint:2,won:true,pump:true,ending:{age,joe:j,wreck:{x:12,y:74,yaw:-Math.PI/2}}},r=createRun(readSave(JSON.stringify(save))),expected=age<7?age:age<11?7+(age-7)/4*EXIT_DURATION:age+EXIT_DURATION-4;
 assert(Math.abs(r.ending.age-expected)<1e-8);assert(r.won&&r.pump);if(j){assert.equal(r.ending.joe.x,j.x);assert.equal(r.ending.joe.y,j.y);r.mode='aftermath';step(r,{},.01);assert.notEqual(r.ending.joe.phase,'dismount');}
 const current=snapshot(r),roundtrip=readSave(JSON.stringify(current));assert.equal(roundtrip.ending.motionVersion,2);assert(Math.abs(roundtrip.ending.age-current.ending.age)<1e-8);
}
checks.push('Legacy victory/dismount/walking saves preserve earned victory, transfer progress and recorded on-foot position; no return to the cab');
for(const yaw of [-Math.PI/2,Math.PI/2]){
 const rig=new THREE.Group(),body=new THREE.Group();rig.add(body);rig.position.set(12,0,-74);rig.rotation.y=-yaw;const collapsed=collapsePose(EXIT_START);body.position.y=-collapsed.sink;body.rotation.z=collapsed.roll;rig.updateMatrixWorld(true);
 let previous=null,locked=0;for(let i=0;i<=1200;i++){
  const pose=transferPose('exit',i/1200,body);assert(pose.feet.some(f=>f.planted));
  for(let k=0;k<2;k++)if(previous?.feet[k].planted&&pose.feet[k].planted){assert(pose.feet[k].position.distanceTo(previous.feet[k].position)<1e-9);locked++;}
  const duplicate=transferPose('exit',i/1200,body);for(let k=0;k<2;k++){assert.deepEqual(duplicate.feet[k].position,pose.feet[k].position);assert.deepEqual(duplicate.feet[k].rotation,pose.feet[k].rotation);}previous=pose;
 }
 const root=cabExitRoot({x:12,y:74,yaw}),feetCentre=previous.feet[0].position.clone().add(previous.feet[1].position).multiplyScalar(.5),expected=new THREE.Vector3(root.x,.12,-root.y).add(new THREE.Vector3(0,0,.38).applyAxisAngle(new THREE.Vector3(0,1,0),-root.yaw));expected.y+=actorGroundHeight(expected.x,-expected.z);assert(feetCentre.distanceTo(expected)<1e-8);assert(locked>1000);
}
checks.push('2,402 exit samples at both wreck headings retain at least one fixed support, deterministic duplicate poses, and an exact shared root/foot handoff to the road walk');
const r=createRun({checkpoint:2,ending:{age:EXIT_END+.1}});assert.notEqual(r.ending.joe.phase,'dismount');
for(const hz of [30,60,120]){
 let previous=boardingPose(BOARD_WALK-BOARD_STOP-.1);
 for(let age=BOARD_WALK-BOARD_STOP-.1+1/hz;age<BOARD_WALK;age+=1/hz){const p=boardingPose(age),travel=Math.hypot(p.x-previous.x,p.y-previous.y);assert(travel<=BOARD_SPEED/hz+1e-8);assert(p.walk>=previous.walk);assert(p.speed<=previous.speed+1e-8);previous=p;}
 const stopped=boardingPose(BOARD_WALK);assert.equal(stopped.speed,0);assert(Math.hypot(stopped.x-previous.x,stopped.y-previous.y)<=BOARD_SPEED/hz);
 const run=createRun({checkpoint:2,ending:{age:EXIT_END-.0001}}),yaw=run.ending.joe.yaw;advanceEnding(run,.0002);assert(Math.abs(Math.atan2(Math.sin(run.ending.joe.yaw-yaw),Math.cos(run.ending.joe.yaw-yaw)))<=.0001*1.8+1e-9,'Dismount edge consumes time from before ground contact');
}
checks.push('Arrival decelerates without exceeding walking speed at 30/60/120Hz; the dismount boundary consumes only elapsed ground-turn time');
fs.mkdirSync('output/final-cut/transfer',{recursive:true});fs.writeFileSync('output/final-cut/transfer/rules.json',JSON.stringify({passed:true,checks,timing:{BOARD_WALK,BOARD_CLIMB,BOARD_READY,EXIT_START,EXIT_DURATION,EXIT_END}},null,2));console.log(JSON.stringify({passed:true,checks}));
