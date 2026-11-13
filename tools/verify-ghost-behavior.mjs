import assert from 'node:assert/strict';
import {createGhostBehavior,createGhostSightings} from '../web/ghost-motion.js';
const anchor={x:0,y:0,z:0,yaw:Math.PI/2},player={x:0,z:-7,yaw:Math.PI};
const original=JSON.stringify({anchor,player}),checks=[];
function run(profile,options={}) {
 const b=createGhostBehavior(options),frames=[];
 for(let i=0;i<=100;i++)frames.push(b.sample('ambient:0:2',anchor,i/20,player,profile));
 return {b,frames};
}
for(const profile of ['watcher','stalker','rusher']){
 const {b,frames}=run(profile,{height:(x,z)=>z*.03});
 assert(frames.some(f=>f.behaviorPhase==='notice'));assert(frames.some(f=>f.noticed));
 assert(frames.every(f=>f.y===f.z*.03));assert.deepEqual(b.sample('ambient:0:2',anchor,5,player,profile),frames.at(-1));
 if(profile==='watcher'){assert(frames.some(f=>f.behaviorPhase==='watching'));assert(frames.every(f=>f.distance===0));}
 else {assert(frames.some(f=>f.behaviorPhase==='windup'));assert(frames.some(f=>f.behaviorPhase===(profile==='rusher'?'rush':'stalk')));if(profile==='rusher')assert(frames.at(-1).distance>4);else assert.equal(frames.at(-1).distance,0,'Follower waits when the player is still');}
 assert(frames.filter(f=>f.time<2.15).every(f=>f.distance===0),'Notice and windup precede motion');
 assert(Math.max(...frames.map(f=>f.distance))<=4.8);
 assert(frames.every(f=>f.resolve>=0&&f.resolve<=1&&Math.abs(f.headTilt)<=.22+1e-9&&f.bodyLean>=0&&f.bodyLean<=.12+1e-9));
 assert(frames.filter(f=>!f.noticed).every(f=>f.resolve===0&&f.headTilt===0&&f.bodyLean===0));
 assert(frames.slice(1).every((f,i)=>Math.abs(f.resolve-frames[i].resolve)<.13&&Math.abs(f.headTilt-frames[i].headTilt)<.08),'Reveal and posture ease across phase boundaries');
 assert(frames.every(f=>Math.abs(f.headYaw)<=.665&&Math.abs(f.torsoTurn)<=.14&&Math.abs(f.headNod)<=.07&&Math.abs(f.sway)<=.016&&Math.abs(f.shoulderRoll)<=.022&&f.jawDrop>=0&&f.jawDrop<=.009+1e-9));
 const early=frames.find(f=>f.time===1);assert(Math.abs(early.yaw-anchor.yaw+early.headYaw+early.torsoTurn)>Math.abs(early.yaw-anchor.yaw)+.1,'Head leads the body toward the noticed target');
 const settled=frames.find(f=>f.time===1.6);assert(Math.abs(settled.torsoTurn)<1e-9&&Math.abs(settled.headYaw)<.05,'Head and shoulders settle before the rush');
 assert(frames.slice(1).every((f,i)=>f.jawDrop>=frames[i].jawDrop-1e-9),'The jaw settles without periodic chewing');
 if(profile==='rusher')assert(frames.at(-1).bodyLean<.04,'Torso recovers as the rush stops');
 const held=frames.find(f=>f.time===1.5);assert(held.heldBreath===1&&held.resolve>=.65&&held.distance===0);
 if(profile==='rusher'){const rush=frames.find(f=>f.time===2.5);assert.equal(rush.resolve,1);assert(rush.headTilt<0&&rush.bodyLean>.1);}
}
assert.equal(JSON.stringify({anchor,player}),original);checks.push('Three distinct behaviors, visible notice/windup, grounded motion, fixed distance limits, stable duplicate samples, no input mutation');
const blocked=run('rusher',{blockers:[{x:0,z:-3,rx:1,rz:1}]});assert(blocked.frames.every(f=>!f.noticed&&f.distance===0));
const distant=createGhostBehavior();assert(!distant.sample('one',anchor,0,{x:0,z:-25,yaw:Math.PI},'rusher').noticed);assert(!distant.sample('one',anchor,2,{x:0,z:-25,yaw:Math.PI},'rusher').noticed);
checks.push('Solid cover and distance prevent noticing the player');
const b=createGhostBehavior();b.sample('rush',anchor,0,player,'rusher');b.sample('rush',anchor,1,player,'rusher');const target=b.sample('rush',anchor,2,{x:5,z:-7,yaw:0},'rusher');assert.deepEqual(target.target,{x:0,z:-7});
const later=b.sample('rush',anchor,3,{x:5,z:-7,yaw:0},'rusher');assert.equal(later.x,0);assert(later.distance>0);checks.push('Sidestepping does not retarget a committed rush');
const close=createGhostBehavior();close.sample('rush',anchor,0,player,'rusher');close.sample('rush',anchor,1,player,'rusher');const stopped=close.sample('rush',anchor,2.7,{x:0,z:-2.3,yaw:Math.PI},'rusher');assert.equal(stopped.alpha,0);assert.equal(close.sample('rush',anchor,3.1,player,'rusher').alpha,0);checks.push('Entering the lane dissolves the ghost permanently for that encounter, without clipping through the player');
const edge=run('rusher',{blockers:[{x:1,z:-2,rx:.5,rz:.5}]});assert(edge.frames.at(-1).distance<1.5);checks.push('The full mower footprint stops short of props even when the center sight line is clear');
const reset=createGhostBehavior();reset.sample('old',anchor,0,player,'rusher');reset.sample('old',anchor,2,player,'rusher');reset.sample(null,null,3,player);assert(!reset.sample('new',anchor,4,player,'watcher').noticed);checks.push('Suppression clears perception and motion state');
for(const profile of ['rusher']){
 const behavior=createGhostBehavior(),long=[];
 for(let i=0;i<=240;i++)long.push(behavior.sample('ambient:long:2',anchor,i/20,{...player,z:-10},profile));
 const withdrawal=long.filter(f=>f.behaviorPhase==='withdraw');
 assert(withdrawal.length>20&&withdrawal.some(f=>f.walkWeight>.2));
 assert(withdrawal.at(-1).distance<withdrawal[0].distance-.5);
 assert(long.find(f=>f.time===7).alpha>0,'The ghost stays present after the original short reaction');
 assert(long.every(f=>f.distance>=0&&f.distance<=6.2&&Math.hypot(f.x,f.z+10)>=2.05));
 assert.equal(long.at(-1).alpha,0,'Extended reactions still finish');
}
const sightings=createGhostSightings(),site={x:0,y:50};
const first=sightings.sample(0,true,[site],()=>true);assert(first.end>=13&&first.end<=15);
assert.equal(sightings.sample(9,true,[site],()=>true).key,first.key);
sightings.sample(9.1,false,[site],()=>true);assert.equal(sightings.sample(9.2,true,[site],()=>true),null);
checks.push('Longer sightings hold their anchor; extended movement withdraws on the same safe lane, stays visible, then fades; suppression stays immediate');
console.log(JSON.stringify({passed:true,checks},null,2));
