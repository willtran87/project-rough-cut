import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createBackNineMowerScars} from '../web/back-nine-mower-scars.js';
import {createRun} from '../web/back-nine-sim.js';
import {terrainHeight,TERRAIN_FORMS} from '../web/course-terrain.js';

const scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial(),scars=createBackNineMowerScars(scene,material);
const run=()=>{const r=createRun(0,0,713);r.mode='driving';r.grace=0;r.time=20;Object.assign(r.joe,{x:20,y:40,yaw:0,speed:10,mode:'pursuing'});r.joe.ram.phase='none';return r;};
let r=run();scars.warm();scars.finishWarm();assert.equal(scars.stats().segments,0);
const buffers=scars.batches.map(b=>b.g.attributes.position.array);
scars.update(r);for(let i=1;i<=100;i++){r.time+=.1;r.joe.y=40+i*.5;r.joe.x=20+3*Math.sin(i*.025);r.joe.yaw=Math.atan2(.075*Math.cos(i*.025),.5);scars.update(r);}
assert(scars.stats().segments>30);const dry=scars.stats();let vertices=0,triangles=0,minClearance=Infinity,maxClearance=-Infinity;
for(const b of scars.batches){
 const p=b.g.attributes.position,n=b.g.attributes.normal,ix=b.g.index;
 for(let k=0;k<b.g.drawRange.count;k+=3){
  const ids=[ix.getX(k),ix.getX(k+1),ix.getX(k+2)],v=ids.map(i=>new THREE.Vector3().fromBufferAttribute(p,i));
  assert(new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0])).y>=0,'upward winding');
  for(const weights of [[1/3,1/3,1/3],[.5,.5,0],[.5,0,.5],[0,.5,.5]]){
   const sample=new THREE.Vector3();v.forEach((a,i)=>sample.addScaledVector(a,weights[i]));const h=sample.y-terrainHeight(sample.x,-sample.z);minClearance=Math.min(minClearance,h);maxClearance=Math.max(maxClearance,h);
  }triangles++;
 }
 for(let i=0;i<b.used*p.count/32;i++){assert(Number.isFinite(p.getY(i)));assert(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);vertices++;}
}
assert(minClearance>.02&&maxClearance<.11,`terrain clearance ${minClearance}..${maxClearance}`);
const before=scars.stats().stamped;scars.update(r);assert.equal(scars.stats().uploads,0);assert.equal(scars.stats().stamped,before);
r.mode='paused';r.joe.y+=5;scars.update(r);assert.equal(scars.stats().stamped,before);r.mode='driving';scars.update(r);assert.equal(scars.stats().stamped,before,'resume must not bridge pause');
r.joe.y+=150;r.time++;scars.update(r);assert.equal(scars.stats().stamped,before,'teleport must not lay a ribbon');
for(const [x,y,name]of [[0,10,'road'],[20,228,'sand'],[0,295,'relay'],[-23,800,'garage'],[40,60,'boundary']]){r=run();Object.assign(r.joe,{x,y});scars.update(r);for(let i=0;i<5;i++){r.time+=.1;r.joe.y+=.5;scars.update(r);}assert.equal(scars.stats().segments,0,name);}
r=run();Object.assign(r.joe,{x:-5,y:235});r.tactics.floodUntil[0]=100;scars.update(r);for(let i=0;i<12;i++){r.time+=.1;r.joe.y+=.3;scars.update(r);}assert(scars.stats().wetStamped>0,'active irrigation darkens tracks');const wet=scars.stats();
const frequency=[];for(const fps of [30,120]){r=run();scars.update(r);for(let i=1;i<=fps*4;i++){r.time=20+i/fps;r.joe.y=40+10*i/fps;scars.update(r);}frequency.push(scars.stats().stamped);}assert.equal(frequency[0],frequency[1],'distance sampling independent of presentation frequency');
r=run();scars.update(r);for(let lap=0;lap<15;lap++)for(let i=0;i<50;i++){r.time+=.1;r.joe.y=40+i;scars.update(r);}assert(scars.stats().stamped>256);assert(scars.stats().segments<=256&&scars.stats().segments>=225);assert(scars.batches.every((b,i)=>b.g.attributes.position.array===buffers[i]),'fixed buffers');const bounded=scars.stats();
const terrainAudit={routes:0,markedRoutes:0,triangles:0,minClearance:Infinity,maxClearance:-Infinity,soilMin:Infinity,soilMax:-Infinity};
for(const [cx,cy,rx,ry]of TERRAIN_FORMS)for(let heading=0;heading<8;heading++){
 r=run();const yaw=heading*Math.PI/4,x=cx+rx*.25*Math.cos(yaw),y=cy+ry*.25*Math.sin(yaw);Object.assign(r.joe,{x,y,yaw});scars.update(r);
 for(let step=1;step<=10;step++){r.time+=.05;r.joe.x=x+Math.sin(yaw)*step*.4;r.joe.y=y+Math.cos(yaw)*step*.4;scars.update(r);}
 terrainAudit.routes++;if(scars.stats().segments)terrainAudit.markedRoutes++;
 for(const b of scars.batches){const p=b.g.attributes.position,ix=b.g.index,soil=b.g.attributes.scarSoil;
  for(let i=0;i<b.used*p.count/32;i++){const amount=soil.getX(i);assert(amount>=0&&amount<=1);terrainAudit.soilMin=Math.min(terrainAudit.soilMin,amount);terrainAudit.soilMax=Math.max(terrainAudit.soilMax,amount);}
  for(let k=0;k<b.g.drawRange.count;k+=3){const v=[0,1,2].map(i=>new THREE.Vector3().fromBufferAttribute(p,ix.getX(k+i)));for(const weights of [[1/3,1/3,1/3],[.5,.5,0],[.5,0,.5],[0,.5,.5]]){const sample=new THREE.Vector3();v.forEach((a,i)=>sample.addScaledVector(a,weights[i]));const h=sample.y-terrainHeight(sample.x,-sample.z);terrainAudit.minClearance=Math.min(terrainAudit.minClearance,h);terrainAudit.maxClearance=Math.max(terrainAudit.maxClearance,h);}terrainAudit.triangles++;}
 }
}
assert(terrainAudit.markedRoutes>40);assert(terrainAudit.minClearance>.02&&terrainAudit.maxClearance<.11,JSON.stringify(terrainAudit));assert.equal(terrainAudit.soilMin,0);assert.equal(terrainAudit.soilMax,1);
scars.update(createRun());assert.equal(scars.stats().segments,0);assert(scars.batches.every(b=>!b.mesh.visible));scars.dispose();material.dispose();assert.equal(scene.children.length,0);
console.log(JSON.stringify({passed:true,dry,wet,frequency,bounded,vertices,triangles,minClearance,maxClearance,terrainAudit}));
