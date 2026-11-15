import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart,impactDamage} from '../web/chase-player.js';
import {hullOverlap,vehicleOverlap} from '../web/vehicle-contact.js';
import {blocked,distance,COURSE,angleDelta,clamp} from '../web/back-nine-course.js';
const tick=(r,input={},n=1)=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);},out='output/chase-runover';fs.mkdirSync(out,{recursive:true});
const checks=[];
assert.equal(impactDamage(.32),8);assert.equal(impactDamage(1),16);assert.equal(Math.ceil(100/impactDamage(1)),7);assert.equal(Math.ceil(100/impactDamage(.32)),13);
const stationary=createRun();stationary.mode='driving';stationary.grace=0;Object.assign(stationary.cart,{x:0,y:35});Object.assign(stationary.joe,{x:0,y:23,speed:16});const hitTimes=[];let previous=0;
for(let f=0;f<90*60&&stationary.mode!=='caught';f++){tick(stationary);if(stationary.cart.hits!==previous){previous=stationary.cart.hits;hitTimes.push(stationary.time);}assert(!vehicleOverlap(stationary.cart,stationary.joe));}
assert.equal(stationary.mode,'caught');assert.equal(hitTimes.length,7);for(let i=1;i<hitTimes.length;i++)assert(hitTimes[i]-hitTimes[i-1]>2.15&&hitTimes[i]-hitTimes[i-1]<5);assert(stationary.death.travel>0);assert.equal(stationary.events.filter(e=>e.type==='run-over').length,1);assert.equal(stationary.events.filter(e=>e.type==='caught').length,1);checks.push('Seven distinct strong rams, physical backoff between hits, wreck detour and run-over');
const directions=[];
for(const [name,x,y,yaw]of [['rear',0,37,0],['front',0,43,Math.PI],['side',-3,40,Math.PI/2]]){
 const r=createRun();r.mode='driving';Object.assign(r.cart,{x:0,y:20});leaveBrokenCart(r);r.grace=0;Object.assign(r.foot,{x:0,y:40,speed:0,invulnerable:0});Object.assign(r.joe,{x,y,yaw,speed:10});r.joe.ram.phase='none';
 for(let f=0;f<180&&r.mode==='driving';f++)tick(r);
 assert.equal(r.mode,'dying',name);const at=r.time,health=r.cart.health,point={...r.foot};r.mode='paused';const frozen=JSON.stringify(r);tick(r,{throttle:1},120);assert.equal(JSON.stringify(r),frozen);r.mode='dying';
 let crossed=false;for(let f=0;f<150;f++){tick(r,{throttle:1,steer:1,brake:true});crossed||=!!hullOverlap(r.foot,'foot',r.joe,'mower');assert.equal(r.foot.x,point.x);assert.equal(r.foot.y,point.y);assert(!blocked(r.joe,1.65));}
 assert(crossed,name+' mower must pass over defeated runner');assert.equal(r.mode,'caught');assert.equal(r.cart.health,health);assert(r.time-at>=2.4);directions.push({name,travel:r.death.travel,duration:r.time-at});
}
checks.push('Rear/front/side contacts animate before defeat; mower crosses fallen actor; pause freezes and inputs cannot revive');
const protectedRun=createRun();protectedRun.mode='driving';Object.assign(protectedRun.cart,{x:0,y:20});leaveBrokenCart(protectedRun);Object.assign(protectedRun.foot,{x:0,y:40});Object.assign(protectedRun.joe,{x:0,y:37,speed:10});tick(protectedRun);assert.equal(protectedRun.mode,'driving');assert.equal(protectedRun.death,null);checks.push('Five-second safe ejection grace remains');
// A driver taking the ordinary exposed road must face repeated genuine contact.
const r=createRun();r.mode='driving';let index=1;const drivingHits=[];previous=0;
for(let f=0;f<24*60;f++){const route=COURSE.paths[0];while(index<route.length-1&&(distance(r.cart,{x:route[index][0],y:route[index][1]})<7||r.cart.y>route[index][1]+2))index++;const target={x:route[index][0],y:route[index][1]},turn=angleDelta(Math.atan2(target.x-r.cart.x,target.y-r.cart.y),r.cart.yaw);tick(r,{throttle:1,steer:clamp(turn*2,-1,1),brake:Math.abs(turn)>.7&&r.cart.speed>8});assert(!vehicleOverlap(r.cart,r.joe));if(r.cart.hits!==previous){previous=r.cart.hits;drivingHits.push(r.time);}}
assert(drivingHits.length>=2);assert(r.cart.health>0&&!r.foot);assert(drivingHits[1]-drivingHits[0]>3&&drivingHits[1]-drivingHits[0]<12);checks.push('Moving driver receives repeated rams while retaining a drivable cart and escape windows');
fs.writeFileSync(`${out}/simulation.json`,JSON.stringify({passed:true,checks,hitTimes,stationaryDeath:stationary.death,directions,drivingHits},null,2));console.log(JSON.stringify({passed:true,checks,hitTimes,directions,drivingHits}));
