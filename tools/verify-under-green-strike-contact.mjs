import assert from 'node:assert/strict';
import {createRun,step} from '../web/under-green-sim.js';
import {settleWeapon,weaponClear} from '../web/under-green-clearance.js';
import {strikeClear,strikeSamples} from '../web/under-green-strike-surfaces.js';
import {strikeDebrisSample} from '../web/under-green-strike-debris.js';
import {trimmerContact} from '../web/under-green-trimmer.js';
const results=[];
for(const hz of [30,60,120])for(const fixture of ['windup','sweep']){
 const r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:48,grace:100});
 Object.assign(r.joe,{x:fixture==='windup'?2:1.5,y:50,yaw:fixture==='windup'?Math.PI/2:.8,phase:'walk',age:0});settleWeapon(r,1/hz);
 let contactPhase=null,minGap=Infinity,frames=0;
 for(const [phase,duration]of [['windup',.95],['sweep',.22]]){
  if(r.sceneryContactSerial)break;r.joe.phase=phase;
  for(let i=0;i<=Math.ceil(duration*hz);i++){
   r.time+=1/hz;r.joe.age=Math.min(duration,i/hz);settleWeapon(r,1/hz);assert(strikeClear(r.joe));frames++;
   if(r.sceneryContactSerial){contactPhase=phase;break;}
  }
 }
 assert.equal(contactPhase,fixture);assert.equal(r.sceneryContactSerial,1);
 const contact=r.sceneryContacts[0];assert.equal(contact.point.x,2.89);assert.equal(contact.material,'masonry');assert.deepEqual(contact.normal,{x:-1,y:0,height:0});
 for(const p of strikeSamples(r.joe).filter(p=>p.kind==='blade'))minGap=Math.min(minGap,Math.abs(p.x-2.89)-p.radius);
 assert(minGap>=.0019&&minGap<.0021,'Blade must reach within 2.1mm of physical wall with no penetration');
 const atHit=JSON.stringify(r.joe.weaponPose);
 for(let i=0;i<Math.floor(hz*.14);i++){r.time+=1/hz;r.joe.age+=1/hz;settleWeapon(r,1/hz);assert.equal(JSON.stringify(r.joe.weaponPose),atHit,'Contact hold moves blade');}
 for(let i=0;i<hz*2;i++){r.time+=1/hz;r.joe.age+=1/hz;settleWeapon(r,1/hz);assert(strikeClear(r.joe));}
 assert(weaponClear(r.joe),'Recovery must return inside safe navigation margin');assert.equal(r.sceneryContactSerial,1,'Recovery repeats debris event');
 for(let i=0;i<6;i++)for(let frame=0;frame<hz;frame++){
  const p=strikeDebrisSample(contact,i,contact.time+frame/hz);if(p){assert(p.x<contact.point.x,'Debris passes into wall');assert(p.height>=.02);assert(p.alpha>0&&p.alpha<=1);}
 }
 assert.equal(strikeDebrisSample(contact,0,contact.time+1),null);
 results.push({hz,fixture,frames,minGap,contact});
}
// Actual simulation must also resume pursuit after contact, not just return
// a mathematically clear authored pose in the isolated animation fixture.
const r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:50,grace:100});Object.assign(r.joe,{x:2,y:50,yaw:Math.PI/2,phase:'search',age:0});settleWeapon(r,1/60);r.joe.phase='windup';
for(let i=0;i<240;i++)step(r,{},1/60);
assert.equal(r.sceneryContactSerial,1);assert(weaponClear(r.joe));assert(!r.joe.strikeRetraction);assert.equal(r.mode,'playing');assert(!createRun().sceneryContacts);
const outcomes=[];
for(const flee of [false,true]){
 const r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:50,grace:0});Object.assign(r.joe,{x:2,y:50,yaw:Math.PI/2,phase:'search',age:0});settleWeapon(r,1/60);r.joe.phase='windup';
 for(let i=0;i<(flee?240:720)&&r.mode==='playing';i++){step(r,flee?{forward:-1}:{});assert(strikeClear(r.joe));}
 assert.equal(r.mode,flee?'playing':'caught');assert.equal(r.sceneryContactSerial,1);assert.equal(r.waterHits,0);assert.equal(trimmerContact(r.joe,r.player),!flee);outcomes.push({flee,mode:r.mode});
}
const empty=createRun();Object.assign(empty.joe,{x:0,y:50,yaw:0,phase:'walk',age:0});settleWeapon(empty,1/60);
for(const [phase,seconds]of [['windup',.95],['sweep',.22]]){empty.joe.phase=phase;for(let i=0;i<=Math.ceil(seconds*60);i++){empty.time+=1/60;empty.joe.age=Math.min(seconds,i/60);settleWeapon(empty,1/60);}}
assert(!empty.sceneryContacts,'An air cut must not invent a scenery impact');
const roots=[];
for(const hz of [30,60,120])for(const rear of [false,true]){
 const r=createRun();Object.assign(r.joe,{x:-1.8,y:rear?16.4:13.6,yaw:rear?Math.PI:0,phase:'walk',age:0});settleWeapon(r,1/hz);
 for(const [phase,duration]of [['windup',.95],['sweep',.22]]){if(r.sceneryContactSerial)break;r.joe.phase=phase;for(let i=0;i<=Math.ceil(duration*hz);i++){r.time+=1/hz;r.joe.age=Math.min(duration,i/hz);settleWeapon(r,1/hz);assert(strikeClear(r.joe));if(r.sceneryContactSerial)break;}}
 const contact=r.sceneryContacts?.[0];assert.equal(contact?.material,'root');assert.equal(contact.surface,'organic-geometry');assert.equal(contact.part,'blade');
 const initial=strikeDebrisSample(contact,0,contact.time),falling=strikeDebrisSample(contact,0,contact.time+.1);assert(falling.height<initial.height,'Dirt must fall from the struck root');
 for(let i=0;i<hz*2;i++){r.time+=1/hz;r.joe.age+=1/hz;settleWeapon(r,1/hz);assert(strikeClear(r.joe));}assert(weaponClear(r.joe));assert.equal(r.sceneryContactSerial,1);roots.push({hz,rear,contact});
}
console.log(JSON.stringify({passed:true,results,roots,liveRecovery:r.joe.phase,outcomes}));
