import assert from 'node:assert/strict';import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {distance,blocked} from '../web/back-nine-course.js';
import {vehicleOverlap} from '../web/vehicle-contact.js';
const scenarios=[['rear',[0,35,0],[0,30,0]],['head-on',[0,30,0],[0,37,Math.PI]],['side',[0,35,0],[-7,35,Math.PI/2]],['boundary',[39,30,Math.PI/2],[32,30,Math.PI/2]],['blocked-reverse',[0,7,0],[0,2,0]]];
function setup(c,j){const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{x:c[0],y:c[1],yaw:c[2]});Object.assign(r.joe,{x:j[0],y:j[1],yaw:j[2],speed:16});return r;}
function step(r,input={brake:true}){const before={...r.joe};updateRun(r,input,1/60);assert(!vehicleOverlap(r.cart,r.joe));assert(!blocked(r.cart,.85));assert(!blocked(r.joe,1.65));assert(distance(before,r.joe)<=31.5/60+.003,'No teleport');}
const checks=[];
for(const[name,c,j]of scenarios){
 const r=setup(c,j);for(let i=0;i<180&&!r.cart.hits;i++)step(r);assert.equal(r.cart.hits,1,name);assert.equal(r.joe.ram.phase,'backoff');const contact={...r.joe},time=r.time,plans=r.joe.plans;
 let reversed=false;for(let i=0;i<240&&r.joe.ram.phase==='backoff';i++){step(r);reversed||=r.joe.speed<0;assert.equal(r.cart.hits,1);assert.equal(r.tension.surge,0);assert.equal(r.joe.plans,plans,'Recovery must not run global path searches');}
 assert.equal(r.joe.ram.phase,'lineup',name);assert(reversed,name);assert(distance(r.cart,r.joe)>=8.5);assert(distance(contact,r.joe)>4,name);
 const hold={...r.joe};for(let i=0;i<50;i++){step(r);assert.equal(r.joe.ram.phase,'lineup');assert(distance(hold,r.joe)<.001);assert.equal(r.cart.hits,1);}
 r.mode='paused';const frozen=JSON.stringify(r);step(r);assert.equal(JSON.stringify(r),frozen);r.mode='driving';for(let i=0;i<65;i++)step(r);assert.equal(r.joe.ram.phase,'none');assert(r.joe.plans>plans);
 checks.push({name,backoffMetres:distance(contact,hold),firstRecoverySeconds:r.time-time,hits:r.cart.hits});
}
const escapes=[];
for(const[name,c,j]of scenarios){
 const r=setup(c,j);for(let i=0;i<180&&!r.cart.hits;i++)step(r);const origin={...r.cart},firstHitAt=r.time;for(let i=0;i<42;i++)step(r);
 for(let i=0;i<180;i++){const boundary=name==='boundary';step(r,{throttle:boundary?-1:1,steer:i<80?(boundary?.8:name==='head-on'?.9:0):0});if(r.cart.hits>1){assert(r.time-firstHitAt>2.8,'Escape window shortened');assert(distance(r.cart,origin)>8,'Second attack arrived before escape');}}
 assert(r.cart.hits<=2,'Repeated contact trapped player '+name);assert.equal(r.mode,'driving');assert(distance(r.cart,origin)>8,'Cart remained pinned '+name);escapes.push({name,travel:distance(r.cart,origin),gap:distance(r.cart,r.joe)});
}
// Refusing to move allows repeated distinct attacks through the new durability, then a run-over.
const idle=setup([0,35,0],[0,30,0]);let priorHits=0,hitTimes=[];for(let i=0;i<5400&&['driving','dying'].includes(idle.mode);i++){step(idle);if(idle.cart.hits!==priorHits){priorHits=idle.cart.hits;hitTimes.push(idle.time);}}
assert.equal(idle.mode,'caught');assert(hitTimes.length>=7&&hitTimes.length<=13);assert(hitTimes[1]-hitTimes[0]>2.8&&hitTimes[2]-hitTimes[1]>2.8);
fs.mkdirSync('output/mower-ram',{recursive:true});fs.writeFileSync('output/mower-ram/simulation.json',JSON.stringify({passed:true,checks,escapes,hitTimes},null,2));console.log(JSON.stringify({passed:true,checks,escapes,hitTimes}));
