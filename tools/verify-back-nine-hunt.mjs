import assert from 'node:assert/strict';import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateHunt} from '../web/back-nine-hunt.js';
import {COURSE,lineClear,blocked,distance,clamp,angleDelta} from '../web/back-nine-course.js';
import {vehicleOverlap,VEHICLE_HULLS} from '../web/vehicle-contact.js';
const checks=[];function test(name,fn){fn();checks.push(name);}
test('Every windbreak genuinely blocks sight between clear driving spaces',()=>{for(const s of COURSE.sightbreaks){const a={x:s.x-6,y:s.y},b={x:s.x+6,y:s.y};assert(!blocked(a,.85)&&!blocked(b,.85));assert(!lineClear(a,b,.1));}});
test('Each interception warns, follows a fixed last-seen prediction and cannot track hidden turns',()=>{
 for(const [x,y,jx,jy]of [[-6,101,-8,75],[-16,400,-22,376],[-15,650,0,625]]){const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{x,y,speed:12,hits:1});Object.assign(r.joe,{x:jx,y:jy});updateHunt(r,1/60,true);assert.equal(r.hunt.phase,'signal');const target=JSON.stringify(r.hunt.waypoints),seen=JSON.stringify(r.hunt.lastVisual);for(let i=0;i<60;i++)updateHunt(r,1/60,false);assert.equal(r.hunt.phase,'signal');r.cart.x+=15;r.cart.y+=8;for(let i=0;i<35;i++)updateHunt(r,1/60,false);assert.equal(r.hunt.phase,'flank');assert.equal(JSON.stringify(r.hunt.waypoints),target);assert.equal(JSON.stringify(r.hunt.lastVisual),seen);assert.equal(r.hunt.interceptions,1);r.cart.invulnerable=1;updateHunt(r,1/60,false);assert.equal(r.hunt.phase,'follow');}
});
let hiddenSeconds=0,revealed=false;
test('A real input-driven chase loses sight, reveals Joe, and retains collision separation',()=>{
 // Take the reservoir cover route: faster pursuit can retain sight on the
 // exposed main road. Isolate sightbreak behavior with extra fixture durability; normal-health
 // ejection and complete route outcomes are covered by the route/ram tests.
 const main=COURSE.paths[0],alt=COURSE.paths[7],first=main.findIndex(p=>p[1]===alt[0][1]),last=main.findIndex(p=>p[1]===alt.at(-1)[1]),route=[...main.slice(0,first),...alt,...main.slice(last+1)];
 const r=createRun();r.mode='driving';r.hunt.cooldown=120;r.cart.hits=1;r.cart.health=r.cart.maxHealth=1000;let i=1;for(let f=0;f<60*60;f++){while(i<route.length-1&&(distance(r.cart,{x:route[i][0],y:route[i][1]})<7||r.cart.y>route[i][1]+2))i++;const delta=angleDelta(Math.atan2(route[i][0]-r.cart.x,route[i][1]-r.cart.y),r.cart.yaw);updateRun(r,{throttle:1,steer:clamp(delta*2,-1,1),brake:Math.abs(delta)>.7&&r.cart.speed>8},1/60);if(r.hunt.occluded)hiddenSeconds+=1/60;revealed||=r.hunt.revealTime>0;assert(!vehicleOverlap(r.cart,r.joe));}assert(hiddenSeconds>1);assert(revealed);
});
test('Garage requires the whole cart inside; parked finale pauses and seals without mower penetration',()=>{
 const edge=createRun(2);edge.mode='driving';Object.assign(edge.cart,{x:-23,y:801.7});Object.assign(edge.joe,{x:0,y:700});for(let i=0;i<120;i++)updateRun(edge,{brake:true},1/60);assert.equal(edge.mode,'driving');
 const r=createRun(2);r.mode='driving';r.grace=0;Object.assign(r.cart,{x:-23,y:805});Object.assign(r.joe,{x:-23,y:788,speed:16});let maxGate=0;for(let i=0;i<90;i++)updateRun(r,{brake:true},1/60);assert.equal(r.mode,'sealing');const before=JSON.stringify(r);r.mode='paused';const frozen=JSON.stringify(r);updateRun(r,{throttle:1},1);assert.equal(JSON.stringify(r),frozen);r.mode='sealing';assert.equal(JSON.stringify(r),before);
 for(let i=0;i<320;i++){updateRun(r,{throttle:1,steer:1},1/60);assert(!vehicleOverlap(r.cart,r.joe));const front=r.joe.y+Math.max(...VEHICLE_HULLS.mower.map(h=>h.forward*Math.cos(r.joe.yaw)+Math.abs(Math.sin(r.joe.yaw))*h.width+Math.abs(Math.cos(r.joe.yaw))*h.length));assert(front<799.721);assert(r.finale.gate>=maxGate);maxGate=r.finale.gate;}
 assert.equal(r.mode,'complete');assert.equal(r.finale.gate,1);assert(r.finale.latched);assert(r.finale.tail>0);assert.equal(r.cart.y,805);assert.equal(r.cart.hits,0);assert.equal(r.events.filter(e=>e.type==='complete').length,1);for(let i=0;i<600;i++)updateRun(r,{},1/60);assert.equal(r.finale.tail,0);
});
fs.mkdirSync('output/back-nine-hunt',{recursive:true});fs.writeFileSync('output/back-nine-hunt/simulation.json',JSON.stringify({passed:true,checks,hiddenSeconds,revealed},null,2));console.log(JSON.stringify({checks,hiddenSeconds,revealed}));
