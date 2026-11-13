import fs from 'node:fs';
import assert from 'node:assert/strict';
import {step} from '../web/under-green-sim.js';
const initial=JSON.parse(fs.readFileSync('output/under-green/approach-strike/initial.json','utf8'));
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
fs.writeFileSync('output/under-green/approach-strike/observation.json',JSON.stringify({passed:true,results},null,2));
console.log(JSON.stringify({passed:true,results}));
