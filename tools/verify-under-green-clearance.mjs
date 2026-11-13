import {strikeClear} from '../web/under-green-strike-surfaces.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/under-green-sim.js';
import {solid,BOUNDS,GATE,SLUICE,distance,wrap} from '../web/under-green-course.js';
import {JOE_RADIUS,weaponClear,weaponAtGate,turnJoe,settleWeapon} from '../web/under-green-clearance.js';
import {traverse} from './probe-under-green-folded.mjs';
const checks=[],errors=[];let placements=0,frames=0,raisedFrames=0,maximumYawStep=0;
// Initial/idle safety across the real course, including narrow side passages.
for(let y=BOUNDS.minY+2;y<BOUNDS.maxY;y+=3)for(let x=BOUNDS.minX+2;x<BOUNDS.maxX;x+=3){
 if(solid({x,y},.8))continue;
 for(let i=0;i<8;i++){
  const r=createRun();r.mode='playing';Object.assign(r.joe,{x,y,yaw:i*Math.PI/4,phase:'search'});settleWeapon(r,1/60);
  placements++;if(!weaponClear(r.joe))errors.push({kind:'initial-carry',x,y,yaw:r.joe.yaw});
 }
}
assert.deepEqual(errors,[]);checks.push(`Scythe shaft, grips and blade clear all ${placements} sampled floor/heading placements`);
// Continuous turns at close walls: the tool rises before the heading can change.
for(const point of [{x:2,y:55},{x:9,y:64},{x:-29,y:62},{x:-18,y:45},{x:20,y:30}]){
 const r=createRun();r.mode='playing';Object.assign(r.joe,point,{phase:'search',yaw:0});settleWeapon(r,1/60);
 for(let i=0;i<240;i++){const old=r.joe.yaw;turnJoe(r.joe,wrap(r.joe.yaw+.04),1/60);settleWeapon(r,1/60);maximumYawStep=Math.max(maximumYawStep,Math.abs(wrap(r.joe.yaw-old)));assert(weaponClear(r.joe));if(r.joe.weaponPose.pitch>.8)raisedFrames++;}
}
assert(raisedFrames>0);assert(maximumYawStep<=2.4/60+.000001);checks.push('Close-wall turns raise the tool and remain bounded through the entire rotation');
let r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:50,grace:0});Object.assign(r.joe,{x:2,y:50,yaw:Math.PI/2,phase:'search',age:0});settleWeapon(r,1/60);r.joe.phase='windup';
for(let i=0;i<75;i++){step(r);assert(strikeClear(r.joe));assert.equal(r.mode,'playing');}
assert(r.events.some(e=>e.type==='blade-blocked'));checks.push('A wall interrupts preparation/sweep, keeps the player safe and emits a physical impact event');
r=createRun(3);r.mode='playing';Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI});Object.assign(r.joe,{x:GATE.x,y:GATE.y+1.2,yaw:Math.PI,phase:'walk'});assert(weaponAtGate(r.joe));step(r,{use:true});assert(!r.closing);assert.equal(r.mode,'playing');checks.push('An extended blade across the threshold prevents closure even while Joe’s body is outside');
const samples=[],runs=[];
for(const options of [{},{wet:true},{cp:2},{cp:3}]){
 let previous=null;const result=traverse({...options,dodge:true,inspect:r=>{
  if(r.joe.phase==='absent')return;frames++;
  if(!(r.joe.strikeRetraction||['windup','sweep','recover'].includes(r.joe.phase)?strikeClear(r.joe,r.gate):weaponClear(r.joe,r.gate))&&errors.length<12)errors.push({kind:'route',options,seconds:r.time,j:{...r.joe}});
  assert(!solid(r.joe,JOE_RADIUS));
  if(previous&&r.joe.phase==='walk'&&r.joe.speed>.1){const dx=r.joe.x-previous.x,dy=r.joe.y-previous.y;if(Math.hypot(dx,dy)>.001)assert(Math.abs(wrap(Math.atan2(dx,dy)-r.joe.yaw))<.05,'Walking translation must follow the facing direction');}
  if(samples.length<12&&r.joe.weaponPose.pitch>.9)samples.push({seconds:r.time,joe:{...r.joe}});previous={...r.joe};
 }});runs.push({options,mode:result.mode,gap:result.gap});assert.equal(result.mode,'complete');
}
checks.push(`All ${frames} observed live-Joe route frames preserve tool/body clearance and forward locomotion`);
fs.mkdirSync('output/under-green/clearance',{recursive:true});fs.writeFileSync('output/under-green/clearance/simulation.json',JSON.stringify({passed:errors.length===0,checks,placements,frames,raisedFrames,maximumYawStep,runs,samples,errors},null,2));assert.deepEqual(errors,[]);
console.log(JSON.stringify({passed:true,checks,placements,frames,raisedFrames,runs}));
