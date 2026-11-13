import assert from 'node:assert/strict';import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {ramWindup,RAM_WINDUP_SECONDS} from '../web/ram-windup.js';
import {vehicleOverlap} from '../web/vehicle-contact.js';
const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{y:50});Object.assign(r.joe,{y:40,speed:12});
function tick(n=1){for(let i=0;i<n;i++){updateRun(r,{brake:true},1/60);assert(!vehicleOverlap(r.cart,r.joe));}}
tick();assert.equal(r.joe.ram.phase,'lineup','First deliberate approach must also wind up');assert.equal(ramWindup(r).stage,'hush');const position={x:r.joe.x,y:r.joe.y};
tick(45);assert.equal(ramWindup(r).stage,'rev');const locked=r.joe.yaw;r.cart.x+=3;tick(40);assert.equal(ramWindup(r).stage,'commit');assert.equal(r.joe.yaw,locked,'Late windup cannot keep tracking a dodge');assert.deepEqual({x:r.joe.x,y:r.joe.y},position);assert.equal(r.cart.hits,0);assert(r.joe.ram.age<RAM_WINDUP_SECONDS);
r.mode='paused';const frozen=JSON.stringify(r);tick(30);assert.equal(JSON.stringify(r),frozen);r.mode='driving';tick(24);assert.equal(r.joe.ram.phase,'none');assert.equal(r.joe.ram.launches,1);assert(r.joe.ram.release>0);tick(5);assert.equal(r.joe.ram.launches,1);
// A protected checkpoint holds the warning rather than releasing an attack.
r.joe.ram.phase='lineup';r.joe.ram.age=1.6;r.grace=2;tick(10);assert.equal(r.joe.ram.phase,'lineup');assert.equal(r.joe.ram.age,0);assert.equal(r.joe.speed,0);
fs.mkdirSync('output/ram-windup',{recursive:true});fs.writeFileSync('output/ram-windup/simulation.json',JSON.stringify({passed:true,duration:RAM_WINDUP_SECONDS,checks:['First approach telegraphed','Hush/rev/commit stages','Stationary windup','Late heading locked','Pause freezes warning','One release event','Checkpoint grace holds attack']},null,2));console.log('PASS: first approach, three stages, stationary/locked windup, pause, single launch and checkpoint protection');
