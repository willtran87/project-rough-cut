import fs from 'node:fs';
import assert from 'node:assert/strict';
import {step} from '../web/under-green-sim.js';
// Rebuild the observed-approach windup state from the tracked regression
// fixture instead of reading verify-under-green-approach-strike's untracked
// output, which goes stale whenever movement tuning changes (e.g. wading).
const out='output/under-green/approach-strike';fs.mkdirSync(out,{recursive:true});
const setup=JSON.parse(fs.readFileSync(new URL('./fixtures/under-green-approach-strike.json',import.meta.url)));
setup.joe.phase='walk';setup.joe.age=0;setup.player.yaw=Math.PI/2;
let initial=null;for(let i=0;i<180&&setup.mode==='playing'&&!initial;i++){step(setup,{forward:1});if(setup.joe.phase==='windup')initial=structuredClone(setup);}
assert(initial,'Fixture approach reaches a windup');
const results=[];
for(const kind of ['fresh','stale','teleport','stationary','retreat']){
 const r=structuredClone(initial);r.joe.phase='walk';r.joe.age=0;r.player.yaw=Math.PI/2;
 r.joe.previousSight={x:r.player.x-(kind==='teleport'?1:0),y:r.player.y,time:r.time-(kind==='stale'?1:0)};
 step(r,{forward:kind==='stationary'?0:kind==='retreat'?-1:1});
 assert(r.joe.seen);
 if(kind==='fresh')assert.equal(r.joe.phase,'windup','Fresh observed approach starts preparation');
 else assert.notEqual(r.joe.phase,'windup',kind);
 if(['stale','teleport'].includes(kind))assert.equal(r.joe.approachVelocity,null);
 results.push({kind,phase:r.joe.phase,velocity:r.joe.approachVelocity});
}
fs.writeFileSync(out+'/observation.json',JSON.stringify({passed:true,results},null,2));
console.log(JSON.stringify({passed:true,results}));
