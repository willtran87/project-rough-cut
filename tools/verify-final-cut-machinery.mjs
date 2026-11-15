import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {createFinalCutMachinery,machineryPose} from '../web/final-cut-machinery.js';
import {createEnding} from '../web/final-cut-ending.js';
import {RIG_WHEELS,RIG_BANK} from '../web/final-cut-rig.js';
const checks=[],near=(a,b,t=1e-8)=>assert(Math.abs(a-b)<t,`${a} != ${b}`),angle=(a,b)=>near(Math.sin(a),Math.sin(b)),tick=(r,t,hz)=>{for(let i=0;i<Math.round(t*hz);i++)step(r,{},1/hz);};
for(const hz of [30,60,120,144]){
 const r=createRun({openingSeen:true});r.mode='playing';Object.assign(r.player,{x:-10,y:15});Object.assign(r.rig,{x:0,y:26,phase:'pass',yaw:Math.PI/2,direction:1,deployment:1});
 tick(r,1,hz);angle(r.rig.reelAngle,-8);near(machineryPose(r).wheel,-r.rig.distance/RIG_WHEELS[0].radius);
 // At the contact point, backward relative wheel velocity cancels forward
 // vehicle velocity. Positive rotation would skate in the travel direction.
 const roll=machineryPose(r).wheel;assert(roll<0);near(-roll*RIG_WHEELS[0].radius,r.rig.distance);
 const stopped=r.rig.reelAngle;Object.assign(r.rig,{phase:'turn',x:30,y:26,yaw:0,deployment:0,path:[{x:30,y:50}]});const distance=r.rig.distance;tick(r,.5,hz);assert(r.rig.distance>distance);near(r.rig.reelAngle,stopped);assert(!machineryPose(r).driven);
}
checks.push('30/60/120/144 Hz: committed cutting drives the reel; moving headland turns leave it braked; wheel rotation cancels actual forward travel at ground contact');
const snapshots=[];
for(const hz of [30,60,120,144]){
 const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:0,y:92});Object.assign(r.rig,{x:12.7,y:74,yaw:-Math.PI/2,direction:-1,phase:'pass',deployment:1,distance:12.34,reelAngle:1.2});tick(r,.25,hz);assert(r.won);angle(r.ending.wheelBase,-r.rig.distance/RIG_WHEELS[0].radius);angle(r.ending.reelBase,r.rig.reelAngle);
 for(const wait of [0,3,3,1,4]){
  tick(r,wait,hz);const pose=machineryPose(r),copy=createRun(readSave(JSON.stringify(snapshot(r)))),restored=machineryPose(copy);
  angle(pose.wheel,restored.wheel);angle(pose.reel,restored.reel);near(Math.cos(pose.wheel),Math.cos(restored.wheel));near(Math.cos(pose.reel),Math.cos(restored.reel));
  snapshots.push({hz,age:r.ending.age,pose,restored});
 }
 const pose=machineryPose(r);tick(r,5,hz);assert.deepEqual(machineryPose(r),pose);r.mode='paused';const clock=r.ending.age;tick(r,5,hz);near(r.ending.age,clock);assert.deepEqual(machineryPose(r),pose);
}
checks.push('Twenty live-trap snapshots preserve nonzero wheel/reel phase through save serialization and restoration; both mechanisms settle and pause exactly');
for(const value of [undefined,null,'bad',Infinity,-Infinity,NaN]){const e=createEnding({wheelBase:value,reelBase:value});assert.equal(e.wheelBase,0);assert.equal(e.reelBase,0);}
assert(Number.isFinite(machineryPose(createRun({checkpoint:2})).wheel));
checks.push('Legacy and malformed mechanism phases restore finite defaults without a save-version change');
const meshes=[],machine=createFinalCutMachinery((id,mesh)=>meshes.push({id,mesh})),root=new THREE.Group();
for(const length of [2.7,3.9])machine.addReel(String(length),root,0,0,0,length);
let maxRadius=0;
for(const {id,mesh}of meshes){const p=mesh.geometry.attributes.position,length=+id;for(let k=0;k<p.count;k++){assert(Math.abs(p.getX(k))<=length/2+1e-6);const radius=Math.hypot(p.getY(k),p.getZ(k));maxRadius=Math.max(maxRadius,radius);assert(radius<=RIG_BANK.reelRadius+.000001);}}
assert.equal(machine.stats().geometries,4);machine.dispose();
checks.push('Every constructed blade, shaft, bearing, guard and bedknife vertex stays inside its shared cutting radius and authoritative reel width');
fs.mkdirSync('output/final-cut/machinery',{recursive:true});fs.writeFileSync('output/final-cut/machinery/rules.json',JSON.stringify({passed:true,checks,maxRadius,snapshots},null,2));console.log(JSON.stringify({passed:true,checks,maxRadius}));

