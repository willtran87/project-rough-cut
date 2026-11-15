import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createRun} from '../web/back-nine-sim.js';
import {COURSE} from '../web/back-nine-course.js';
import {featureBreakPose} from '../web/back-nine-break-pose.js';
import {fragmentPose,fragmentMaterial,createBreakFragments} from '../web/back-nine-break-fragments.js';
import {isDestructibleFeature} from '../web/course-destruction-state.js';
const features=COURSE.features.filter(isDestructibleFeature),state={power:1,dx:1,dy:0};
let poses=0;
for(const f of features)for(let i=0;i<3;i++)for(const age of [0,.1,.3,.65,.85,2,200]){
 const p=featureBreakPose(f,i,age,state);assert(Object.values(p).every(v=>typeof v==='boolean'||Number.isFinite(v)));assert(p.scaleY>=.1&&p.scaleY<=1);poses++;
 if(age>=.85)assert.deepEqual(p,featureBreakPose(f,i,200,state));
}
assert.notEqual(featureBreakPose(features.find(f=>f.kind==='parked-cart'),0,2,state).scaleY,featureBreakPose(features.find(f=>f.kind==='service-fence'),0,2,state).scaleY);
for(const f of features)for(let i=0;i<12;i++){
 const p=fragmentPose(f,state,i,2),late=fragmentPose(f,state,i,200),reduced=fragmentPose(f,state,i,0,true);
 assert.deepEqual(p,late);assert.deepEqual(p,reduced);assert.equal(p.lift,0);assert(Math.abs(p.pitch)<1e-12);assert(Math.abs(p.roll)<1e-12);assert.equal(p.material,fragmentMaterial(f,i));
}
const scene=new THREE.Scene(),materials=Object.fromEntries(['wood','iron','leaf'].map(n=>[n,new THREE.MeshLambertMaterial()])),art=createBreakFragments(scene,materials),run=createRun(0,0,713);
art.update(run);assert.equal(art.stats().wood+art.stats().metal+art.stats().leaves,0);
for(const s of [...run.destruction.props,...Object.values(run.destruction.features)])Object.assign(s,{brokenAt:0,...state});run.time=.3;art.update(run);assert.equal(art.stats().wood+art.stats().metal+art.stats().leaves,art.stats().capacity);assert(art.stats().dust>0);
run.time=2;art.update(run);assert.equal(art.stats().dust,0);const uploads=art.stats().uploads;run.time=200;art.update(run);assert.equal(art.stats().uploads,uploads,'Settled fragments do not keep uploading');
art.update(createRun());assert.equal(art.stats().wood+art.stats().metal+art.stats().leaves,0);art.dispose();assert.equal(scene.children.length,0);Object.values(materials).forEach(m=>m.dispose());
console.log(JSON.stringify({passed:true,poses,features:features.length,checks:['Distinct material collapse','Directional motion','Persistent fixed aftermath','All objects simultaneous within fixed capacity','Pause/settled cache','Reduced motion settles instantly','Retry clears fragments','Disposal']}));
