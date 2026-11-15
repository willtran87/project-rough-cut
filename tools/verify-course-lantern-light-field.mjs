import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createCourseLanternLightField} from '../web/course-lantern-light-field.js';

const anchors=Array.from({length:43},(_,i)=>({position:new THREE.Vector3(Math.sin(i*1.7)*12,.28+i%3,-i*2.6),intensity:.8+i%3*.1}));
const field=createCourseLanternLightField(anchors);let samples=0;
for(let z=-118;z<8;z+=.37)for(let x=-18;x<18;x+=.43){
 const candidates=field.candidates(x,z);
 assert.equal(candidates.length,new Set(candidates).size);
 anchors.forEach((a,i)=>{if(Math.hypot(a.position.x-x,a.position.z-z)<=3.25)assert(candidates.includes(i),'Grid must retain every source that can reach a fragment');});samples++;
}
const textures=field.textures,versions=textures.map(t=>t.version);
field.update();assert.deepEqual(textures.map(t=>t.version),versions,'Unchanged frame does not upload again');
anchors[5].intensity=.62;field.update();assert.deepEqual(textures.map(t=>t.version),versions);assert(Math.abs(field.stats().sources[5].power-2.8*.62)<1e-6);
const m=new THREE.MeshLambertMaterial(),originalCompile=m.onBeforeCompile,originalKey=m.customProgramCacheKey;field.apply(m);const v=m.version;field.apply(m);assert.equal(m.version,v);
const shader={uniforms:{},fragmentShader:'#include <lights_fragment_end>'};m.onBeforeCompile(shader);assert(shader.fragmentShader.includes('RE_Direct(courseLampLight'));assert.equal(shader.uniforms.courseLampSources.value.length,anchors.length);assert(Math.abs(shader.uniforms.courseLampSources.value[5].w-2.8*.62)<1e-6);
const unlit=new THREE.MeshBasicMaterial(),oldVersion=unlit.version;field.apply(unlit);assert.equal(unlit.version,oldVersion);
let disposed=0;textures.forEach(t=>t.addEventListener('dispose',()=>disposed++));field.dispose();field.dispose();assert.equal(disposed,1);
assert.equal(m.onBeforeCompile,originalCompile);assert.equal(m.customProgramCacheKey,originalKey);
const empty=createCourseLanternLightField([]);assert.deepEqual(empty.candidates(0,0),[]);empty.dispose();
console.log(JSON.stringify({passed:true,samples,checks:['Conservative cell membership','Every fixed source retained','Flicker changes uniforms without re-uploading grid','Lit materials only','Exact-once texture disposal and restored material hooks','Empty scene']}));
