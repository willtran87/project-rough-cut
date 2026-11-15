import fs from 'node:fs';
import assert from 'node:assert/strict';
import {step} from '../web/under-green-sim.js';
import {distance,solid} from '../web/under-green-course.js';
import {weaponClear} from '../web/under-green-clearance.js';
import {observeJoe} from '../web/under-green-senses.js';
import {pursuitCaption} from '../web/under-green-observation.js';
const out='output/under-green/obstacle-pursuit';const {stalls}=JSON.parse(fs.readFileSync(new URL('./fixtures/under-green-obstacle-pursuit.json',import.meta.url)));
const results=[],tapes=[];
function tick(r,input={}){
 const old={...r.joe};step(r,input);
 assert(distance(old,r.joe)<=2.1/60+.00001);assert(!solid(r.player,.3));assert(!solid(r.joe,.72));assert(weaponClear(r.joe,r.gate));
}
for(const [index,fixture]of stalls.entries()){
 const r=structuredClone(fixture.initial),frames=[];let blocked=null;
 for(let i=0;i<1200&&r.mode==='playing';i++){
  tick(r);if(!blocked&&r.joe.phase==='recover'&&r.joe.recoveryBlocked)blocked=structuredClone(r);
  if(i%6===0)frames.push(structuredClone(r));
 }
 assert(blocked);const held=fixture.row.obstacle==='pump-machine';
 assert.equal(r.mode,held?'playing':'caught');
 if(held){
  assert.equal(r.joe.phase,'guard');assert.equal(r.events.filter(e=>e.type==='blade-blocked').length,1);
  const view=structuredClone(r);view.player.yaw=Math.atan2(view.joe.x-view.player.x,view.joe.y-view.player.y);assert(observeJoe(view).visible);assert.match(pursuitCaption(view,'R'),/WATCHING FOR AN OPENING/);
  view.player.yaw+=Math.PI;assert(!observeJoe(view).visible);assert(!pursuitCaption(view,'R').includes('WATCHING'));
  const paused=structuredClone(r);paused.mode='paused';const before=structuredClone(paused);for(let i=0;i<60;i++)step(paused);assert.deepEqual(paused,before);
  for(const yaw of [0,Math.PI/2]){
   const leave=structuredClone(r);leave.player.yaw=yaw;
   for(let i=0;i<600&&leave.mode==='playing';i++)tick(leave,i<60?{forward:1}:{});
   assert.equal(leave.mode,'caught','Leaving the pocket resumes real pursuit, including moving during blocked recovery');
  }
  const hidden=[{x:0,y:5},{x:-30,y:60}].map(p=>{const q=structuredClone(r);Object.assign(q.player,p);for(let i=0;i<60;i++)tick(q);assert(!q.joe.coverHold);return q.joe;});
  const decisions=({closingRate,previousGap,...j})=>j;assert.deepEqual(decisions(hidden[0]),decisions(hidden[1]));
 }
 const escapes=[];
 for(let direction=0;direction<8;direction++){
  const q=structuredClone(blocked);q.player.yaw=direction*Math.PI/4;
  for(let i=0;i<180&&q.mode==='playing';i++)tick(q,{forward:1});
  if(q.mode==='playing'&&distance(q.player,q.joe)>3)escapes.push({direction,gap:distance(q.player,q.joe)});
 }
 assert(escapes.length,`Blocked recovery must leave a walking escape: ${index}`);
 results.push({index,obstacle:fixture.row.obstacle,mode:r.mode,phase:r.joe.phase,seconds:r.elapsed,blockedStrikes:r.events.filter(e=>e.type==='blade-blocked').length,escapes});
 tapes.push({index,obstacle:fixture.row.obstacle,initial:fixture.initial,frames});
}
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,results},null,2));fs.writeFileSync(out+'/frames.json',JSON.stringify(tapes));
console.log(JSON.stringify({passed:true,results},null,2));
