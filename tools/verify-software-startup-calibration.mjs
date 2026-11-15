import assert from 'node:assert/strict';
import {createSoftwareFrameBudget} from './fixtures/software-frame-budget-startup-candidate.js';
const options={slowMs:38,recoverMs:26,scales:[.75,.625,.5,.375],startupCalibration:true};
const feed=(b,values)=>values.forEach(v=>b.observe(v));
const b=createSoftwareFrameBudget(options);
feed(b,[500,300,...Array(7).fill(100)]);assert.equal(b.scale(),.75,'Eight post-upload frames are required');
b.observe(100);assert.equal(b.scale(),.375);assert.equal(b.stats().changes,1);
feed(b,Array(24).fill(100));assert.equal(b.stats().changes,1,'Cooldown survives calibration');
feed(b,Array(60).fill(10));assert.equal(b.scale(),.5,'Existing upward recovery remains available');
for(const values of [[500,500,...Array(8).fill(20)],[1,1,20,...Array(7).fill(100)],[1,1,...Array(7).fill(20),500]]){
 const safe=createSoftwareFrameBudget(options);feed(safe,values);assert.equal(safe.scale(),.75,'A cold upload or intermittent stall is insufficient');
}
const moderate=createSoftwareFrameBudget(options);feed(moderate,Array(10).fill(50));assert.equal(moderate.scale(),.625,'Select the highest predicted affordable existing step');
const fastest=createSoftwareFrameBudget(options);feed(fastest,[1,1,40,...Array(7).fill(150)]);assert.equal(fastest.scale(),.625,'The fastest qualifying sample constrains the reduction');
const invalid=createSoftwareFrameBudget(options);feed(invalid,[NaN,Infinity,0,-1]);assert.equal(invalid.stats().samples,0);
const bounded=createSoftwareFrameBudget({...options,scales:[.75]});feed(bounded,Array(10).fill(1000));assert.equal(bounded.scale(),.75);assert.equal(bounded.stats().changes,0);
const original=createSoftwareFrameBudget({...options,startupCalibration:false});feed(original,Array(10).fill(100));assert.equal(original.scale(),.75);feed(original,Array(4).fill(100));assert.equal(original.scale(),.625);
for(const value of [null,1,'true'])assert.throws(()=>createSoftwareFrameBudget({...options,startupCalibration:value}));
console.log('PASS: startup requires eight post-upload slow frames, keeps existing quality bounds, ignores isolated stalls, retains default and recovery behavior');
