import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,step,nearbyAction} from '../web/final-cut-sim.js';
import {REFUGES,BELL} from '../web/final-cut-course.js';
import {CUT_PLANS} from '../web/final-cut-schedule.js';
const checks=[],refuges=[],traps=[],tick=(r,t,input={})=>{for(let k=0;k<t*60;k++)step(r,input,1/60);};
for(const seed of [0,1,2])for(const shelter of REFUGES){
 const r=createRun({seed,openingSeen:true});r.mode='playing';Object.assign(r.player,{x:shelter.x,y:shelter.y});const lanes=new Set();
 for(let k=0;k<240*60;k++){step(r,{},1/60);if(r.rig.phase==='pass')lanes.add(r.rig.lane);assert.equal(r.mode,'playing');assert(!r.won);}
 assert.equal(lanes.size,3,`${seed}/${shelter.id} must exercise every strip`);refuges.push({seed,shelter:shelter.id,seconds:r.time,lanes:[...lanes]});
}
checks.push('Four minutes in each of three permanent refuges under each plan: every strip exercised, no capture or automatic win');
for(const seed of [0,1,2]){
 // a501e79: the bell now stands on the open bank and only traps him over a
 // flooded swale, whose valve needs two fairway holds. Start with two holds
 // saved but no checkpoint, so every plan still has its opening strips left,
 // and flood the swale with a real valve Use before ringing.
 const r=createRun({seed,openingSeen:true,basins:{spent:['near','far']}});r.mode='playing';r.pump=true;assert(r.schedule.openingRemaining===CUT_PLANS[seed].opening);
 Object.assign(r.player,{x:.8,y:77.7,yaw:Math.PI});assert.equal(nearbyAction(r).id,'valve-swale');step(r,{use:true});assert.equal(r.basins.swale.state,'filling');
 Object.assign(r.player,{x:BELL.x,y:BELL.y+.9,yaw:Math.PI});Object.assign(r.rig,{phase:'disengage',age:2.3,deployment:0});
 assert.equal(nearbyAction(r).id,'bell');step(r,{use:true});assert.equal(r.rig.evidence,'groundskeeping bell');assert.equal(r.rig.lane,2);assert(r.rig.trapApproach);const remaining=r.schedule.openingRemaining;
 tick(r,60);assert(r.won);assert.equal(r.mode,'aftermath');assert.equal(r.checkpoint,2);traps.push({seed,openingRemainingAtLure:remaining,won:r.won});
}
checks.push('Actual reusable bell Use overrides every advertised opening and earns a physical saturated-swale victory');
fs.mkdirSync('output/final-cut/replays',{recursive:true});fs.writeFileSync('output/final-cut/replays/safety.json',JSON.stringify({passed:true,checks,refuges,traps},null,2));console.log(JSON.stringify({passed:true,checks,refuges,traps}));
