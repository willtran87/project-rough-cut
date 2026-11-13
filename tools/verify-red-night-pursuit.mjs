import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as current from '../web/back-nine-sim.js';
import {mowerBeacon} from '../web/mower-beacon.js';
const source=fs.readFileSync('output/back-nine-red-night/baseline-source/back-nine-sim.js','utf8').replace(/from '([^']+)'/g,(_,p)=>`from '${new URL('../web/'+p,import.meta.url).href}'`);
const baseline=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function accelerate(sim){
 const r=sim.createRun();r.mode='driving';r.grace=0;r.joe.ram.armed=true;
 Object.assign(r.cart,{x:0,y:70,speed:14});Object.assign(r.joe,{x:0,y:10,speed:0});
 for(let i=0;i<60;i++)sim.updateRun(r,{throttle:1},1/60);
 return {speed:r.joe.speed,travel:r.joe.y-10,health:r.cart.health};
}
const before=accelerate(baseline),after=accelerate(current);
assert(after.speed>before.speed+2,'Higher road speed and acceleration must produce a faster actual approach');
assert(after.travel>before.travel+2);assert.equal(after.health,100);
for(const reduced of [false,true])for(const flash of [0,1]){
 const a=mowerBeacon(0,flash,reduced),b=mowerBeacon(.8,flash,reduced);
 assert(a.power>=105&&b.power>=105);
 if(reduced||flash===0){assert.equal(a.power,b.power,'Comfort modes keep steady illumination');assert.equal(a.lens,b.lens);if(reduced)assert.equal(a.angle,b.angle);}
 else assert(a.power>b.power+90);
}
const report={passed:true,before,after,beacon:{periodSeconds:1.6,steadyPower:105,peakPower:200}};
fs.writeFileSync('output/back-nine-red-night/pursuit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
