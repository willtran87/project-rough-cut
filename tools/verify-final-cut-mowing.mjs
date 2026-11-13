import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {isCut,concealed,solid,BREAKABLES} from '../web/final-cut-course.js';
import {mow,restoreCutAreas} from '../web/final-cut-mowing.js';
const checks=[],tick=(r,t,hz=60)=>{for(let i=0;i<t*hz;i++)step(r,{},1/hz);};
for(const direction of [-1,1])for(const hz of [30,60,120]){
 const r=createRun();r.mode='playing';Object.assign(r.player,{x:-10,y:15});Object.assign(r.rig,{x:direction*-30,y:26,yaw:direction*Math.PI/2,phase:'pass',deployment:1,direction});
 tick(r,3,hz);const behind={x:r.rig.x-direction*4,y:26},ahead={x:r.rig.x+direction*4,y:26};assert(isCut(r,behind));assert(!isCut(r,ahead));assert(!r.cut.includes('rough-0-1'));
 Object.assign(r.player,behind,{crouch:true});assert(!concealed(r));Object.assign(r.player,ahead);assert(concealed(r));Object.assign(r.player,{x:-10,y:15});
 let remaining=0;while(r.rig.phase==='pass'&&remaining++<20*hz)step(r,{},1/hz);assert(remaining<20*hz,'Cutting pass failed to finish');assert.equal(r.rig.speed,0);assert.deepEqual(r.cut.slice().sort(),['rough-0-0','rough-0-1','rough-0-2']);assert.equal(r.broken.length,2);assert(r.opening.closePass);assert(r.opening.firstCut);assert.equal(r.events.filter(e=>e.type==='ceremony-stop').length,1);assert.equal(r.events.filter(e=>e.type==='protected-pass').length,1);assert.equal(r.mode,'playing');
 const restored=createRun(readSave(JSON.stringify(snapshot(r))));assert.deepEqual(restored.cutAreas,r.cutAreas);assert.deepEqual(restored.broken,r.broken);assert(isCut(restored,{x:0,y:26}));
}
checks.push('Both real pass directions at 30/60/120Hz: continuous partial cut, local concealment, full cut, two crushed props, one protected cue and one silence beat; save restoration');
let r=createRun();Object.assign(r.rig,{x:0,y:26,direction:1});mow(r,-5);mow(r,0);Object.assign(r.rig,{x:20});mow(r,18);assert(!isCut(r,{x:10,y:26}));assert(isCut(r,{x:20,y:26}));assert.equal(r.cutAreas.length,2);checks.push('Separated passes preserve the standing gap instead of merging across uncut ground');
for(const b of BREAKABLES){assert(solid(b));assert(!solid(b,.3,false,[b.id]));}checks.push('Furniture blocks movement while intact and clears after destruction');
r=createRun();r.mode='playing';tick(r,12);Object.assign(r.player,{x:-2,y:17.3,yaw:-Math.PI/2});step(r,{use:true});let revealWait=0;while(!r.openingSeen&&revealWait++<2400)step(r,{},1/120);assert(r.openingSeen);const retry=createRun(snapshot(r));assert.equal(retry.rig.phase,'announce');assert(!retry.opening.ceremony);assert.equal(retry.rig.age,0);checks.push('Seen reveal persists; retry skips ceremony and gives a fresh full announcement');
assert.deepEqual(restoreCutAreas([{y:999,lo:0,hi:20},{y:26,lo:Infinity,hi:3},{y:26,lo:5,hi:3}]),[]);checks.push('Malformed cut geometry rejected');
fs.mkdirSync('output/final-cut',{recursive:true});fs.writeFileSync('output/final-cut/mowing.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
