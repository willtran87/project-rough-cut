import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave,nearbyAction} from '../web/final-cut-sim.js';
import {solid,gateContact,distance} from '../web/final-cut-course.js';
import {collapsePose} from '../web/final-cut-ending.js';
const checks=[],tick=(r,t,i={},hz=60)=>{for(let k=0;k<t*hz;k++)step(r,i,1/hz);};
for(const hz of [30,60,120]){
 const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:0,y:92,yaw:0});Object.assign(r.rig,{x:12.7,y:74,yaw:-Math.PI/2,phase:'pass',deployment:1,direction:-1});tick(r,.1,{},hz);assert(r.won);assert.equal(r.ending.joe.phase,'cab');const won=readSave(JSON.stringify(snapshot(r)));assert(won.won);assert.equal(won.ending.wreck.x,r.rig.x);
 tick(r,4,{},hz);assert(r.ending.ruptured);assert(!r.ending.shutdown);assert(collapsePose(r.ending.age).sink>.5);
 tick(r,3,{forward:1},hz);assert(r.player.y>102);assert(r.ending.secured);tick(r,2,{},hz);assert.equal(r.ending.gate,1);assert(r.ending.shutdown);assert.equal(r.ending.joe.phase,'dismount');
 const paused=structuredClone(r.ending);r.mode='paused';tick(r,10,{},hz);assert.deepEqual(r.ending,paused);r.mode='aftermath';
 const saved=createRun(readSave(JSON.stringify(snapshot(r))));assert(saved.won);assert(saved.player.y>98);assert.equal(saved.ending.gate,1);assert.equal(saved.ending.joe.x,r.ending.joe.x);
 const before=r.player.y;tick(r,4,{forward:-1},hz);assert(r.player.y>=94.35-.01&&r.player.y<before);assert.equal(r.mode,'aftermath');
 tick(r,50,{},hz);assert.equal(r.ending.joe.phase,'fence');assert(r.ending.joe.y<94);assert.equal(r.ending.joe.speed,0);assert.equal(r.events.filter(e=>e.type==='gate-latched').length,1);assert.equal(r.events.filter(e=>e.type==='last-applause').length,1);
 const old={...r.ending.joe};tick(r,4,{},hz);assert(distance(old,r.ending.joe)<.001);assert.equal(r.mode,'aftermath');
 Object.assign(r.player,{x:0,y:104});assert.equal(nearbyAction(r)?.id,'road');step(r,{use:true},1/hz);assert.equal(r.mode,'complete');assert(readSave(JSON.stringify(snapshot(r))).completed);
}
checks.push('30/60/120Hz physical trap, immediate victory save, staged rupture/shutdown, free movement, gate closure/collision, exact pause, coherent reload, one nonlethal fence actor and explicit finish');
let r=createRun({checkpoint:2,ending:{age:0,wreck:{x:12,y:74,yaw:-Math.PI/2}}});r.mode='aftermath';tick(r,70);assert.equal(r.ending.joe.phase,'wait');assert.equal(r.ending.joe.target,2);const restore=createRun(snapshot(r));assert.equal(restore.ending.joe.phase,'wait');assert.equal(restore.ending.joe.x,r.ending.joe.x);assert.equal(restore.ending.joe.y,r.ending.joe.y);checks.push('Joe waits on course side until player secures the gate; late-departure actor restoration is exact');
for(const closure of [0,.25,.5,.75,1]){const a=(1-closure)*Math.PI/2,p={x:-2+2*Math.cos(a),y:94+2*Math.sin(a)};assert(gateContact(p,.3,closure));assert(solid(p,.3,true,[],closure));}checks.push('Gate collision follows its actual rotating leaf at five poses');
for(const x of [-1.5,0,1.5]){r=createRun({checkpoint:2});r.mode='aftermath';Object.assign(r.player,{x,y:98.49,yaw:0});step(r,{forward:1,sprint:true});assert(r.ending.secured);tick(r,2,{forward:-1,sprint:true});assert(r.player.y>=94.35-.01);assert.equal(r.ending.gate,1);}checks.push('Immediate sprint reversal at both gate edges cannot strand the player on the course side');
fs.mkdirSync('output/final-cut/ending',{recursive:true});fs.writeFileSync('output/final-cut/ending/rules.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
