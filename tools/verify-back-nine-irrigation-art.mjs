import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE,surfaceAt} from '../web/back-nine-course.js';
import {createRun} from '../web/back-nine-sim.js';
import {terrainHeight} from '../web/course-terrain.js';
import {irrigationPhase} from '../web/chase-irrigation.js';
import {createIrrigationArt,sprinklerDrop} from '../web/back-nine-irrigation-art.js';
const checks=[];
for(const w of COURSE.wet)for(const boost of [false,true])for(let t=0;t<20;t+=.17)for(let i=0;i<(boost?32:24);i++){
 const p=sprinklerDrop(w,t,i,boost);assert(Object.values(p).every(Number.isFinite));
 assert(Math.hypot(p.x-w.x,p.y-w.y)<w.r);assert(Math.hypot(p.landingX-w.x,p.landingY-w.y)<w.r);
 assert(p.height>=terrainHeight(p.x,p.y));
}
checks.push('All normal/boosted ballistic drops and landing points stay above terrain and inside real wet zones');
const scene=new THREE.Scene(),brass=new THREE.MeshLambertMaterial(),cylinder=new THREE.CylinderGeometry(1,1,1,12);
const wetMasks={value:COURSE.wet.map(()=>new THREE.Vector3())};
const art=createIrrigationArt({scene,map:null,materials:{brass},put(){},box(){},cylinder,wetMasks});
const run=createRun(0,0,713),actor={x:-12,y:238};run.mode='driving';run.time=20;
const phases=()=>COURSE.wet.map((_,i)=>irrigationPhase(run,i));
run.tactics.floodUntil[0]=100;art.update(run,actor,phases());let s=art.stats();assert.equal(s.visible,1);assert.equal(s.drops,32);assert.equal(s.ripples,8);assert.equal(surfaceAt(actor,run),'wet');assert(s.waterVisible[0]);
assert.equal(s.mist,16);assert(wetMasks.value[0].z>0);
art.update(run,{x:100,y:238},phases());assert.equal(wetMasks.value[0].z,0);assert.equal(art.stats().mist,0);assert(!art.stats().waterVisible[0]);
art.update(run,actor,phases());assert(wetMasks.value[0].z>0);assert.equal(art.stats().mist,16);
checks.push('Culling water restores the dry underlayer; returning restores matching water/mask and fine impact spray');
run.time+=1;art.update(run,actor,phases());assert.equal(art.stats().clock,21);assert.notEqual(art.stats().heads[0].yaw,s.heads[0].yaw);
const meshes=scene.children.filter(m=>m.isInstancedMesh),matrices=meshes.map(m=>m.instanceMatrix.array.slice());s=art.stats();
run.mode='paused';for(let i=0;i<4;i++)art.update(run,actor,phases());assert.deepEqual(art.stats(),s);meshes.forEach((m,i)=>assert.deepEqual(m.instanceMatrix.array,matrices[i]));
checks.push('Pressure override raises the head, rotates real jets and ripples; extra renders and pause preserve all poses');
// Reduced motion calms the camera, not the water (3caeb5f): spray keeps animating.
run.mode='driving';run.time+=1;art.update(run,actor,phases(),true);assert.equal(art.stats().clock,s.clock+1);assert.equal(art.stats().drops,32);assert.equal(art.stats().ripples,8);assert(art.stats().waterVisible[0]);assert.notEqual(art.stats().heads[0].yaw,s.heads[0].yaw);
run.tactics.floodUntil[0]=0;while(irrigationPhase(run,0).active)run.time+=.1;art.update(run,actor,phases());assert(!art.stats().waterVisible[0]);assert.equal(art.stats().drops,0);assert.notEqual(surfaceAt(actor,run),'wet');assert(Math.abs(art.stats().heads[0].height-terrainHeight(actor.x,actor.y)-.12)<1e-8);
assert.equal(wetMasks.value[0].z,0);assert.equal(art.stats().mist,0);
checks.push('Reduced motion keeps flooding and animated spray; switching off removes water exactly with physical wetness and retracts the head');
const fresh=createRun(0,0,713);fresh.mode='driving';fresh.time=0;art.update(fresh,actor,COURSE.wet.map((_,i)=>irrigationPhase(fresh,i)));assert.equal(art.stats().clock,0);assert(art.stats().drops<=96);assert(art.stats().ripples<=24);
art.dispose();assert.equal(scene.children.length,0);brass.dispose();cylinder.dispose();checks.push('Retry resets visual clock; bounded pools and all owned scene resources dispose');
const out='output/back-nine-visual-upgrade/irrigation';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/contracts.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
