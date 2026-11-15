import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createCourseLanternLightField} from '../web/course-lantern-light-field-packed.js';

const anchors=Array.from({length:43},(_,i)=>({position:new THREE.Vector3(Math.sin(i*1.7)*12,.28+i%3,-i*2.6),intensity:.8+i%3*.1}));
const field=createCourseLanternLightField(anchors),map=field.textures[0];let samples=0,texels=0;
for(let z=-118;z<8;z+=.37)for(let x=-18;x<18;x+=.43){
 const ids=field.candidates(x,z);assert.equal(ids.length,new Set(ids).size);
 anchors.forEach((a,i)=>{if(Math.hypot(a.position.x-x,a.position.z-z)<=3.25)assert(ids.includes(i));});samples++;
}
function checkData(){
 const s=field.stats(),[w,h]=s.grid,n=s.maxPerCell;
 const minX=Math.floor((Math.min(0,...anchors.map(a=>a.position.x))-s.range)/s.cellSize)*s.cellSize;
 const minZ=Math.floor((Math.min(0,...anchors.map(a=>a.position.z))-s.range)/s.cellSize)*s.cellSize;
 assert.equal(map.image.width,w);assert.equal(map.image.height,h*n);
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){
  const ids=field.candidates(minX+(x+.5)*s.cellSize,minZ+(z+.5)*s.cellSize);
  for(let slot=0;slot<n;slot++){
   const a=anchors[ids[slot]],expected=a?[a.position.x,a.position.y,a.position.z,s.power*a.intensity].map(Math.fround):[0,0,0,0];
   assert.deepEqual(Array.from(map.image.data.slice(((z*n+slot)*w+x)*4,((z*n+slot)*w+x)*4+4)),expected);texels++;
  }
 }
}
checkData();let version=map.version;
field.update();assert.equal(map.version,version,'Unchanged frame must not upload');
for(const power of [0,.62,-.2,.9]){
 anchors[5].intensity=power;field.update();assert.equal(map.version,++version,'One upload for a changed frame');checkData();
 field.update();assert.equal(map.version,version,'Stable power must not upload');
}
anchors.forEach(a=>a.intensity*=.37);field.update();assert.equal(map.version,++version,'All changed sources share one upload');checkData();
const m=new THREE.MeshLambertMaterial(),compile=m.onBeforeCompile,key=m.customProgramCacheKey;
field.apply(m);const materialVersion=m.version;field.apply(m);assert.equal(m.version,materialVersion);
const shader={uniforms:{},fragmentShader:'#include <lights_fragment_end>'};m.onBeforeCompile(shader);
assert.equal(shader.uniforms.coursePackedLamps.value,map);assert(shader.fragmentShader.includes('RE_Direct(courseLampLight'));
assert.equal(map.magFilter,THREE.NearestFilter);assert.equal(map.minFilter,THREE.NearestFilter);assert.equal(map.generateMipmaps,false);
const unlit=new THREE.MeshBasicMaterial(),unlitVersion=unlit.version;field.apply(unlit);assert.equal(unlit.version,unlitVersion);
let disposed=0;map.addEventListener('dispose',()=>disposed++);field.dispose();field.dispose();field.update();
assert.equal(disposed,1);assert.equal(map.version,version);assert.equal(m.onBeforeCompile,compile);assert.equal(m.customProgramCacheKey,key);
const empty=createCourseLanternLightField([]);assert.deepEqual(empty.candidates(0,0),[]);assert(empty.textures[0].image.data.every(v=>v===0));empty.dispose();
console.log(JSON.stringify({passed:true,samples,texels,checks:['Every reachable source retained','Every packed cell copy exact','Zero, negative, dimmed and restored source power','One upload per changed frame; none for unchanged frames','Lit materials only','Exact-once disposal and hook restoration','Empty field']}));
