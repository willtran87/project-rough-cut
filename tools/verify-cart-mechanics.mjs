import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {cartMechanics} from '../web/cart-mechanics.js';
import {cartRumble} from '../web/cart-rumble.js';
import {cartImpactPose} from '../web/cart-impact.js';

const out='output/back-nine-experience/mechanics';fs.mkdirSync(out,{recursive:true});
const rows=[];let samples=0,maxHeave=0,maxPitch=0,maxRoll=0;
for(const health of [100,75,55,35,15,5])for(const surface of ['path','rough','wet','sand'])for(const speed of [0,3,8,14,-4.2]){
 const r=createRun();r.mode='driving';r.grace=0;r.joe.y=-100;Object.assign(r.cart,{speed,surface,health});let energy=0;
 for(let i=0;i<600;i++){
  r.time=i/60;r.distance=i*Math.abs(speed)/60;
  const frozen=JSON.stringify(r),m=cartMechanics(r),pose=cartRumble(r);assert.equal(JSON.stringify(r),frozen);
  assert.deepEqual(cartMechanics(r),m);assert(m.engineGain>=.63&&m.engineGain<=1);
  assert(Number.isFinite(pose.heave)&&Number.isFinite(pose.pitch)&&Number.isFinite(pose.roll));
  if(!speed){assert.equal(m.heave,0);assert.equal(m.panel,0);assert.equal(m.wheelWobble,0);}
  maxHeave=Math.max(maxHeave,Math.abs(pose.heave));maxPitch=Math.max(maxPitch,Math.abs(pose.pitch));maxRoll=Math.max(maxRoll,Math.abs(pose.roll));energy+=m.heave*m.heave;samples++;
 }
 rows.push({health,surface,speed,heaveRms:Math.sqrt(energy/600)});
}
assert(maxHeave<.065&&maxPitch<.019&&maxRoll<.024);
for(const health of [100,15])for(const speed of [3,8,14]){
 const get=s=>rows.find(r=>r.health===health&&r.speed===speed&&r.surface===s).heaveRms;
 assert(get('sand')>get('rough')&&get('rough')>get('wet')&&get('wet')>get('path'));
}
for(const surface of ['path','rough','wet','sand'])assert(rows.find(r=>r.health===15&&r.speed===8&&r.surface===surface).heaveRms>rows.find(r=>r.health===100&&r.speed===8&&r.surface===surface).heaveRms*1.3);
const r=createRun();r.mode='driving';r.time=4;r.distance=21;r.grace=10;Object.assign(r.cart,{speed:8,health:15});r.joe.y=-100;
const before=cartMechanics(r);r.time+=3;const later=cartMechanics(r);
for(const key of ['heave','pitch','roll','panel','roofFlex','wheelWobble','rattleCycle'])assert.equal(later[key],before[key],'No travel: no change in '+key);
r.cart.speed=14;const faster=cartMechanics(r);for(const key of ['heave','pitch','roll','panel','roofFlex','wheelWobble'])assert.equal(faster[key],before[key],'Speed alone must not jump the phase');
r.mode='paused';const snapshot=JSON.stringify(r),pose=cartRumble(r);updateRun(r,{throttle:1,steer:1},1/60);assert.equal(JSON.stringify(r),snapshot);assert.deepEqual(cartRumble(r),pose);
for(const mode of ['briefing','caught','sealing','complete']){r.mode=mode;const m=cartRumble(r);for(const key of ['heave','pitch','roll'])assert.equal(Math.abs(m[key]),0);}
r.mode='driving';r.foot={};assert.equal(cartMechanics(r).rolling,0);r.foot=null;r.cart.health=0;assert.equal(cartMechanics(r).rolling,0);
for(const front of [-1,1])for(const strength of [.32,1]){r.cart.health=100;r.impact={age:.04,side:0,front,strength,damaged:true};const p=cartImpactPose(r);assert.equal(Math.abs(p.roll),0);assert.equal(Math.abs(p.bodyRoll),0);assert(Math.sign(p.pitch)===-front);}
for(const side of [-1,1]){r.impact={age:.04,side,front:0,strength:1,damaged:true};const p=cartImpactPose(r);assert.equal(Math.abs(p.pitch),0);assert(Math.sign(p.roll)===side);assert(Object.values(cartImpactPose(r,true)).every(v=>v===0));}
fs.writeFileSync(out+'/signals.json',JSON.stringify({passed:true,samples,maxHeave,maxPitch,maxRoll,rows},null,2));console.log(JSON.stringify({passed:true,samples,maxHeave,maxPitch,maxRoll}));
