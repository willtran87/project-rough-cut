import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/final-cut-sim.js';
import {createPlantContacts,recordPlantTravel,plantRecovery,PLANT_RECOVERY_SECONDS} from '../web/final-cut-plant-contact.js';

const checks=[];
for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 const point=(side,forward)=>({x:Math.cos(yaw)*side+Math.sin(yaw)*forward,y:-Math.sin(yaw)*side+Math.cos(yaw)*forward});
 const plants=[point(0,0),point(5,1.4),point(4,-2),point(6.5,0)],changes=[];
 const tracker=createPlantContacts(plants,(i,v)=>changes.push({i,v})),r={time:0,rig:{x:0,y:0,yaw,phase:'pass',deployment:1}};
 tracker.update(r);assert(tracker.sample(0,0));assert.equal(tracker.sample(1,0).part,'reel-1');
 assert.equal(tracker.sample(2,0),null,'Empty space behind the wing must not react');assert.equal(tracker.sample(3,0),null);
 const count=changes.length;tracker.update(r);assert.equal(changes.length,count,'Repeated draws cannot create contact');
 r.time=1;assert(tracker.sample(0,r.time).strength<.3);r.time=PLANT_RECOVERY_SECONDS;assert.equal(tracker.sample(0,r.time).strength,0);
 const next={time:0,rig:{...r.rig,phase:'announce'}};tracker.update(next);assert.equal(tracker.sample(0,0),null,'New run clears old movement');assert.equal(tracker.stats(next).active,0);
}
checks.push('Actual body/reel contact from four headings, untouched empty wing wake, analytic settling, repeated-render invariance and new-run reset');
for(const hz of [30,60,120]){
 const r=createRun();r.mode='playing';Object.assign(r.player,{x:-10,y:15});Object.assign(r.rig,{x:-30,y:26,yaw:Math.PI/2,phase:'pass',deployment:1,direction:1});
 const plants=Array.from({length:30},(_,i)=>({x:-29+i*.3,y:30.9})),tracker=createPlantContacts(plants,()=>{});
 tracker.update(r);for(let i=0;i<hz*2;i++)step(r,{},1/hz);
 // No renderer updates occurred during those two seconds.
 tracker.update(r);assert(tracker.stats(r).contacts>15,'Simulation history must recover contacts after dropped presentation');
 const stats=tracker.stats(r);assert(stats.historySamples<=512);assert(stats.active>0);
 r.mode='paused';const before=tracker.stats(r);step(r,{},.25);tracker.update(r);assert.deepEqual(tracker.stats(r),before);
}
checks.push('Real simulation at 30/60/120Hz preserves contacts across two seconds without rendering; pause freezes recovery');
const r={time:0,rig:{x:0,y:0,yaw:0,phase:'turn',deployment:0}},t=createPlantContacts([{x:0,y:0}],()=>{});t.update(r);
for(let i=0;i<600;i++){r.time+=1/120;recordPlantTravel(r,{...r.rig});}t.update(r);assert.equal(t.stats(r).contacts,0,'Hidden setup travel must not produce an early physical tell');
assert.equal(plantRecovery(-1),0);assert.equal(plantRecovery(0),1);assert.equal(plantRecovery(10),0);
checks.push('Offscreen setup does not leak a directional plant reaction; recovery has finite support');
fs.mkdirSync('output/final-cut/visual-reeds',{recursive:true});fs.writeFileSync('output/final-cut/visual-reeds/contact.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
