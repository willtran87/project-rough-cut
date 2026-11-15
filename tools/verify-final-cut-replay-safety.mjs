import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,step,nearbyAction} from '../web/final-cut-sim.js';
import {REFUGES} from '../web/final-cut-course.js';
const checks=[],refuges=[],traps=[],tick=(r,t,input={})=>{for(let k=0;k<t*60;k++)step(r,input,1/60);};
for(const seed of [0,1,2])for(const shelter of REFUGES){
 const r=createRun({seed,openingSeen:true});r.mode='playing';Object.assign(r.player,{x:shelter.x,y:shelter.y});const lanes=new Set();
 for(let k=0;k<240*60;k++){step(r,{},1/60);if(r.rig.phase==='pass')lanes.add(r.rig.lane);assert.equal(r.mode,'playing');assert(!r.won);}
 assert.equal(lanes.size,3,`${seed}/${shelter.id} must exercise every strip`);refuges.push({seed,shelter:shelter.id,seconds:r.time,lanes:[...lanes]});
}
checks.push('Four minutes in each of three permanent refuges under each plan: every strip exercised, no capture or automatic win');
for(const seed of [0,1,2]){
 const r=createRun({seed,openingSeen:true});r.mode='playing';r.pump=true;r.water=1;Object.assign(r.player,{x:-9.1,y:85,yaw:-Math.PI/2});Object.assign(r.rig,{phase:'disengage',age:2.3,deployment:0});
 assert.equal(nearbyAction(r).id,'bell');step(r,{use:true});assert.equal(r.rig.evidence,'groundskeeping bell');assert.equal(r.rig.lane,2);assert(r.rig.trapApproach);const remaining=r.schedule.openingRemaining;
 tick(r,60);assert(r.won);assert.equal(r.mode,'aftermath');assert.equal(r.checkpoint,2);traps.push({seed,openingRemainingAtLure:remaining,won:r.won});
}
checks.push('Actual reusable bell Use overrides every advertised opening and earns a physical saturated-swale victory');
fs.writeFileSync('output/final-cut/replays/safety.json',JSON.stringify({passed:true,checks,refuges,traps},null,2));console.log(JSON.stringify({passed:true,checks,refuges,traps}));
