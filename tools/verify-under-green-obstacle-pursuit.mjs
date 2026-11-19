import fs from 'node:fs';
import assert from 'node:assert/strict';
import {step} from '../web/under-green-sim.js';
import {distance,solid} from '../web/under-green-course.js';
import {weaponClear} from '../web/under-green-clearance.js';
import {strikeQuery} from '../web/under-green-strike-surfaces.js';
import {trimmerPose} from '../web/under-green-trimmer.js';
import {observeJoe} from '../web/under-green-senses.js';
import {pursuitCaption} from '../web/under-green-observation.js';
const out='output/under-green/obstacle-pursuit';const {stalls}=JSON.parse(fs.readFileSync(new URL('./fixtures/under-green-obstacle-pursuit.json',import.meta.url)));
fs.mkdirSync(out,{recursive:true});const results=[],tapes=[];
let guards=0;
function tick(r,input={}){
 const old={...r.joe};step(r,input);
 // Hidden Joe may exceed walking pace by paceScale (under-green-unseen.js).
 assert(distance(old,r.joe)<=2.1*Math.max(1,r.joe.paceScale??1)/60+.00001);assert(!solid(r.player,.3));assert(!solid(r.joe,.72));
 // A planted strike is solved against the blade's own outline so it can reach
 // masonry before recoiling; carrying and turning keep the broad capsule.
 const planted=['windup','sweep','recover'].includes(r.joe.phase)||r.joe.strikeRetraction;
 assert(planted?!strikeQuery(r.joe,r.gate)(trimmerPose(r.joe)):weaponClear(r.joe,r.gate));
}
for(const [index,fixture]of stalls.entries()){
 const r=structuredClone(fixture.initial),frames=[];let blocked=null,stalled=0,maxStall=0;
 for(let i=0;i<1200&&r.mode==='playing';i++){
  const before={x:r.joe.x,y:r.joe.y,yaw:r.joe.yaw};tick(r);
  // Cover may stop the scythe; Joe must then reposition, swing or guard, never
  // sit turning or walking in place (the freeze fixed with walkStalled/turnStall).
  stalled=['walk','turn'].includes(r.joe.phase)&&distance(before,r.joe)<1e-6&&before.yaw===r.joe.yaw?stalled+1:0;maxStall=Math.max(maxStall,stalled);
  if(!blocked&&(r.joe.phase==='recover'&&r.joe.recoveryBlocked||r.joe.phase==='guard'))blocked=structuredClone(r);
  if(i%6===0)frames.push(structuredClone(r));
 }
 assert(maxStall<90,`Joe stalled ${maxStall} frames beside ${fixture.row.obstacle}`);
 const held=r.mode==='playing';
 if(held){
  guards++;
  assert.equal(r.joe.phase,'guard',`${fixture.row.obstacle}: a held pocket must be an explicit guard`);
  const view=structuredClone(r);view.player.yaw=Math.atan2(view.joe.x-view.player.x,view.joe.y-view.player.y);assert(observeJoe(view).visible);assert.match(pursuitCaption(view,'R'),/WATCHING FOR AN OPENING/);
  view.player.yaw+=Math.PI;assert(!observeJoe(view).visible);assert(!pursuitCaption(view,'R').includes('WATCHING'));
  const paused=structuredClone(r);paused.mode='paused';const before=structuredClone(paused);for(let i=0;i<60;i++)step(paused);assert.deepEqual(paused,before);
  for(const yaw of [0,Math.PI/2]){
   const leave=structuredClone(r);leave.player.yaw=yaw;
   for(let i=0;i<600&&leave.mode==='playing';i++)tick(leave,i<60?{forward:1}:{});
   // The authored pump-machine pocket must always resume pursuit. Other pockets
   // may lead into fresh cover, which earns a new guard at the new position.
   const reguarded=leave.mode==='playing'&&leave.joe.phase==='guard'&&distance(leave.joe.coverHold.observed,r.joe.coverHold.observed)>.35;
   assert(leave.mode==='caught'||fixture.row.obstacle!=='pump-machine'&&reguarded,'Leaving the pocket resumes real pursuit, including moving during blocked recovery');
  }
  const hidden=[{x:0,y:5},{x:-30,y:60}].map(p=>{const q=structuredClone(r);Object.assign(q.player,p);for(let i=0;i<60;i++)tick(q);assert(!q.joe.coverHold);return q.joe;});
  const decisions=({closingRate,previousGap,...j})=>j;assert.deepEqual(decisions(hidden[0]),decisions(hidden[1]));
 }
 if(!blocked){results.push({index,obstacle:fixture.row.obstacle,mode:r.mode,phase:r.joe.phase,seconds:r.elapsed,maxStall});tapes.push({index,obstacle:fixture.row.obstacle,initial:fixture.initial,frames});continue;}
 const escapes=[];
 for(let direction=0;direction<8;direction++){
  const q=structuredClone(blocked);q.player.yaw=direction*Math.PI/4;
  for(let i=0;i<180&&q.mode==='playing';i++)tick(q,{forward:1});
  if(q.mode==='playing'&&distance(q.player,q.joe)>3)escapes.push({direction,gap:distance(q.player,q.joe)});
 }
 assert(escapes.length,`Blocked recovery must leave a walking escape: ${index}`);
 results.push({index,obstacle:fixture.row.obstacle,mode:r.mode,phase:r.joe.phase,seconds:r.elapsed,maxStall,blockedStrikes:r.events.filter(e=>e.type==='blade-blocked').length,escapes});
 tapes.push({index,obstacle:fixture.row.obstacle,initial:fixture.initial,frames});
}
assert(guards>=1&&results.some(x=>x.mode==='caught'),'Fixtures cover both a guarded pocket and a resumed attack');
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,results},null,2));fs.writeFileSync(out+'/frames.json',JSON.stringify(tapes));
console.log(JSON.stringify({passed:true,results},null,2));
