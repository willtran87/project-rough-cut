import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/under-green-sim.js';
import {LEVER,GATE,solid,lineClear,sightClear,move} from '../web/under-green-course.js';
const checks=[];
function fixture(crouched=false){
 const r=createRun(1);r.mode='playing';r.time=30;
 Object.assign(r.player,{x:LEVER.x+.8,y:LEVER.y-.19,eyeHeight:crouched?1.12:1.65,grace:999});
 Object.assign(r.joe,{x:LEVER.x-2.2,y:LEVER.y-.19,yaw:Math.PI/2,phase:'walk',last:{x:LEVER.x-2.2,y:LEVER.y-.19}});
 return r;
}
let r=fixture();assert(!lineClear(r.joe,r.player,.05));assert(sightClear(r.joe,r.player));
step(r);assert(r.joe.seen);assert.equal(r.joe.evidence,'sight');assert.equal(r.joe.last.x,r.player.x);
checks.push('Standing players visibly above the low pump control are acquired as sight evidence');
r=fixture(true);assert(!sightClear(r.joe,r.player));step(r,{crouch:true});assert(!r.joe.seen);
const last={...r.joe.last};r.player.y-=.05;step(r,{crouch:true});assert.deepEqual(r.joe.last,last);
checks.push('A crouched target behind the instruments remains hidden; unseen movement does not update evidence');
// Standing up exposes the head through the existing smooth eye-height change.
for(let i=0;i<60&&!r.joe.seen;i++)step(r);assert(r.joe.seen);
checks.push('Standing up reacquires sight naturally without a new input or hidden tracking rule');
assert(!sightClear({x:-23,y:43},{x:-19,y:43}));
assert(!sightClear({x:0,y:50},{x:10,y:50}));
const gateA={x:GATE.x,y:GATE.y-2},gateB={x:GATE.x,y:GATE.y+2};
assert(sightClear(gateA,gateB,0));assert(!sightClear(gateA,gateB,1));
checks.push('Masonry, room boundaries and a closed keeper gate still hide the player');
const p={x:LEVER.x-1.4,y:LEVER.y};move(p,3,0,.3);assert(p.x<LEVER.x-.69);assert(solid(LEVER,.3));
assert(!lineClear({x:LEVER.x-1,y:LEVER.y},{x:LEVER.x+1,y:LEVER.y},.05));
checks.push('Movement and blade obstruction still treat the console as physical cover');
r=fixture();r.joe.x=LEVER.x-2;r.player.x=LEVER.x+3;r.joe.yaw=-Math.PI/2;step(r);assert(!r.joe.seen);
checks.push('Seeing over the control preserves Joe’s existing facing cone');
fs.mkdirSync('output/under-green/sight',{recursive:true});fs.writeFileSync('output/under-green/sight/rules.json',JSON.stringify({passed:true,checks},null,2));
console.log(JSON.stringify({passed:true,checks}));
