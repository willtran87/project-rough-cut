import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {garageGuide,garageOpening,createGarageMotion} from '../web/back-nine-garage-motion.js';
const scene=new THREE.Scene(),materials=Object.fromEntries(['iron','brass','rust'].map(n=>[n,new THREE.MeshLambertMaterial()]));
const art=createGarageMotion(scene,materials),r={mode:'driving',time:0,exitRelease:{open:0},finale:{gate:0}};
for(let i=0;i<=1000;i++){
 const d=i/100,p=garageGuide(d),next=garageGuide(d+.001);
 assert(Math.abs(Math.hypot(next.y-p.y,next.z-p.z)-.001)<.00001);
 assert(p.y<=4.961&&p.z<=0&&Number.isFinite(p.angle));
}
for(let i=0;i<=100;i++){
 r.time=i*.02;r.exitRelease.open=i/100;art.update(r);
 assert.equal(art.stats().open,i/100);
 const slab=art.root.children[0];slab.updateWorldMatrix(true,false);
 const p=slab.geometry.attributes.position,v=new THREE.Vector3();
 for(let k=0;k<p.count;k++){
  v.fromBufferAttribute(p,k).applyMatrix4(slab.matrixWorld);
  assert(v.y>=-.001&&v.y<5.10,'Door stays above floor and below roof');
  assert(v.z< -799.8&&v.z> -806,'Door follows its overhead rail');
  if(i===100)assert(v.y>4.8,'Whole cart aperture clears when open');
 }
}
assert(art.stats().dust>0);const uploads=art.stats().uploads;art.update(r);assert.equal(art.stats().uploads,uploads,'Paused door uploads nothing');
art.update(r,true);assert.equal(art.stats().dust,0);
r.mode='sealing';r.finale.gate=.45;r.time+=.1;art.update(r);assert.equal(garageOpening(r),.55);
r.mode='complete';r.finale.gate=1;art.update(r);assert.equal(art.stats().open,0);
const reset={...r,time:0,mode:'driving',exitRelease:{open:0}};art.update(reset);assert.equal(art.stats().dust,0);
art.dispose();assert.equal(scene.children.length,0);Object.values(materials).forEach(m=>m.dispose());
console.log('PASS: 1001 continuous rail samples; 101 full door geometry sweeps; open/close/pause/reduced/retry/disposal');
