import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE} from '../web/back-nine-course.js';
import {terrainHeight} from '../web/course-terrain.js';
import {createIrrigationArt} from '../web/back-nine-irrigation-art.js';
import {FLOOD_DRY_CULL_RATIO,floodShoreOpacity} from '../web/back-nine-flood-shore.js';

let samples=0;
for(let p=0;p<=100;p++){
 const pocket=p/100;let previous=1;
 for(let r=0;r<=1000;r++){
  const radial=r/1000,alpha=floodShoreOpacity(radial,pocket);samples++;
  assert(Number.isFinite(alpha)&&alpha>=0&&alpha<=1);
  assert(alpha<=previous+1e-12,'shore fades monotonically toward the physical boundary');
  assert(previous-alpha<.008,'no hard opacity jump');previous=alpha;
  if(radial<=FLOOD_DRY_CULL_RATIO+.02)assert.equal(alpha,1,'all removed dry turf stays under fully opaque water, including a safety margin');
 }
 assert.equal(floodShoreOpacity(1,pocket),0);assert.equal(floodShoreOpacity(1.05,pocket),0);
}
assert(Math.abs(floodShoreOpacity(.82,.4)-floodShoreOpacity(.82,1))>.2,'pockets produce an irregular shoreline, not just a uniform radial fade');
const scene=new THREE.Scene(),brass=new THREE.MeshLambertMaterial(),wetMasks={value:COURSE.wet.map(()=>new THREE.Vector3())};
const art=createIrrigationArt({scene,map:null,materials:{brass},put(){},box(){},cylinder:null,wetMasks});
const sheets=scene.children.filter(m=>m.geometry?.attributes.floodLocal);assert.equal(sheets.length,3);
let vertices=0;
for(const [i,m]of sheets.entries()){
 assert(m.material.transparent&&!m.material.depthWrite&&m.material.depthTest);
 const p=m.geometry.attributes.position,local=m.geometry.attributes.floodLocal,w=COURSE.wet[i];
 for(let j=0;j<p.count;j++){
  const x=p.getX(j),z=p.getZ(j);vertices++;
  assert(Math.abs(p.getY(j)-terrainHeight(x,-z)-.055)<.00002,'water stays on shared terrain');
  assert(Math.hypot(local.getX(j),local.getY(j))<1.000002,'no water beyond real wet footprint');
 }
}
const run={time:20,mode:'driving'},actor={...COURSE.wet[0]},states=COURSE.wet.map(()=>({active:true,manual:false}));
art.update(run,actor,states);assert(Math.abs(wetMasks.value[0].z/COURSE.wet[0].r-FLOOD_DRY_CULL_RATIO)<1e-12);
states[0].active=false;art.update(run,actor,states);assert.equal(wetMasks.value[0].z,0);assert.equal(sheets[0].visible,false);
art.dispose();assert.equal(scene.children.length,0);brass.dispose();
console.log(JSON.stringify({passed:true,opacitySamples:samples,vertices,sheets:3,cullRatio:FLOOD_DRY_CULL_RATIO,checks:['opaque dry-core coverage','continuous irregular margin','physical wet boundary','shared terrain','dry/cull restoration','dispose']}));
