import assert from 'node:assert/strict';
import fs from 'node:fs';
import {advanceWheelTravel,wheelSurface,wheelSupport,cleanWheelFilm} from '../web/final-cut-wheel-travel.js';
import {RIG_WHEELS} from '../web/final-cut-rig.js';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {machineryPose} from '../web/final-cut-machinery.js';
const near=(a,b,t=1e-7)=>assert(Math.abs(a-b)<t,`${a} != ${b}`),checks=[];
for(const w of RIG_WHEELS){near(w.radius,w.height);near(w.radius,w.treadRadius);assert(w.carcassRadius<w.radius);}
for(const hz of [30,60,120,144]){
 const radius=8,angle=1.2,r={rig:{x:0,y:0,yaw:0,distance:0,steering:Math.atan(1.55/radius)/.7},water:0};
 for(let k=1;k<=hz;k++){const before={...r.rig},a=angle*k/hz;Object.assign(r.rig,{x:radius*(1-Math.cos(a)),y:radius*Math.sin(a),yaw:a});advanceWheelTravel(r,before,1/hz);}
 r.rig.wheelTravel.forEach((d,k)=>{const w=RIG_WHEELS[k];near(d,angle*Math.hypot(radius-w.side,w.forward));});
 assert(r.rig.wheelTravel[0]>r.rig.wheelTravel[2],'Outside wheel travels farther');
 for(let k=hz-1;k>=0;k--){const before={...r.rig},a=angle*k/hz;Object.assign(r.rig,{x:radius*(1-Math.cos(a)),y:radius*Math.sin(a),yaw:a});advanceWheelTravel(r,before,1/hz);}
 r.rig.wheelTravel.forEach(d=>near(d,0));
}
checks.push('Independent analytic circular paths match all four wheel distances at 30/60/120/144 Hz; reverse exactly unwinds travel');
near(wheelSurface({x:0,y:50}).height,.006);assert.equal(wheelSurface({x:35,y:50}).material,'gravel');assert.equal(wheelSurface({x:8,y:74},1).material,'mud');assert.equal(wheelSurface({x:8,y:81},1).material,'path');assert.equal(wheelSurface({x:8,y:81},1).wet,0);
const wheel=RIG_WHEELS[0],curb=[];for(let i=0;i<=100;i++){const y=79.8+i*.01;curb.push(wheelSupport({x:8-wheel.side,y:y-wheel.forward,yaw:0,steering:0},wheel));}
assert(curb[30]>.006,'Tread starts rising before axle reaches paving at y80.25');near(curb.at(-1),.12);assert(Math.max(...curb.slice(1).map((h,k)=>Math.abs(h-curb[k])))<.006,'No axle-height jump at slab edge');
checks.push('Circular tread climbs the actual 12 cm paving edge before its axle crosses; support remains continuous');
const r={rig:{x:35,y:40,yaw:0,distance:0,steering:0},water:0};
for(let k=0;k<120;k++)advanceWheelTravel(r,{...r.rig},1/120);assert.deepEqual(r.rig.wheelFilm,cleanWheelFilm());
for(let k=0;k<120;k++){const before={...r.rig};r.rig.y+=.1;advanceWheelTravel(r,before,1/120);}assert(r.rig.wheelFilm.every(f=>f.dust>.5&&f.mud===0));
Object.assign(r.rig,{x:8,y:72});r.water=1;
for(let k=0;k<120;k++){const before={...r.rig};r.rig.y+=.02;advanceWheelTravel(r,before,1/120);}assert(r.rig.wheelFilm.every(f=>f.mud>.2&&f.wet>.9));
checks.push('Actual slab footprints select gravel/turf/mud and dry paving; movement deposits dirt, stationary dry wheels stay clean');
for(const hz of [30,60,120,144]){
 const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:0,y:92});Object.assign(r.rig,{x:12.7,y:74,yaw:-Math.PI/2,direction:-1,phase:'pass',deployment:1,distance:12.34,wheelTravel:[12,13,14,15],wheelFilm:cleanWheelFilm([{mud:.3},{dust:.4},{grass:.2},{wet:.7}])});
 for(let k=0;k<hz/4;k++)step(r,{},1/hz);assert(r.won);assert.equal(new Set(r.ending.wheelBases).size,4);
 for(const wait of [0,3,4,5]){for(let k=0;k<wait*hz;k++)step(r,{},1/hz);const copy=createRun(readSave(JSON.stringify(snapshot(r))));machineryPose(r).wheels.forEach((a,k)=>{near(Math.sin(a),Math.sin(machineryPose(copy).wheels[k]));near(Math.cos(a),Math.cos(machineryPose(copy).wheels[k]));});assert.deepEqual(copy.ending.wheelFilm,r.ending.wheelFilm);}
 r.mode='paused';const before=JSON.stringify(snapshot(r));step(r,{},.25);assert.equal(JSON.stringify(snapshot(r)),before);
}
checks.push('Distinct wheel phases and contact dirt survive live collapse, serialized restoration and pause at four update frequencies');
const legacy=createRun({checkpoint:2,ending:{wheelBase:1.2}});machineryPose(legacy).wheels.forEach(a=>assert(Number.isFinite(a)));assert.deepEqual(legacy.ending.wheelFilm,cleanWheelFilm());
fs.writeFileSync('output/final-cut/visual-hero/wheel-rules.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
