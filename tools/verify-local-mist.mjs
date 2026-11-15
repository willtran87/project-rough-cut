import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mistChord,MIST_HOLLOWS,createBackNineLocalMist} from '../web/back-nine-local-mist.js';
import * as THREE from '../web/vendor/three/three.module.js';
const origin=[0,0,-20],end=[0,0,20],center=[0,0,0],radii=[10,1.35,15];
assert(Math.abs(mistChord(origin,end,center,radii)-16)<1e-10);
assert.equal(mistChord([0,2,-20],[0,2,20],center,radii),0);
assert.equal(mistChord([0,0,-30],[0,0,-20],center,radii),0);
assert.equal(mistChord(center,center,center,radii),0);
let maxError=0,maxSplit=0;
const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
for(let n=0;n<360;n++){
 const h=MIST_HOLLOWS[n%3],c=[h.x,h.base,-h.y],r=[h.rx,h.ry,h.rz];
 const a=[h.x+(random(n+1)-.5)*80,h.base+random(n+2)*5,-h.y+(random(n+3)-.5)*150];
 const b=[h.x+(random(n+11)-.5)*80,h.base+(random(n+12)-.3)*6,-h.y+(random(n+13)-.5)*150];
 const d=b.map((v,i)=>v-a[i]),length=Math.hypot(...d),steps=4000;let numeric=0;
 for(let i=0;i<steps;i++){const t=(i+.5)/steps;const q=a.map((v,j)=>(v+d[j]*t-c[j])/r[j]);numeric+=Math.max(0,1-q.reduce((s,v)=>s+v*v,0))**2*length/steps;}
 const integral=mistChord(a,b,c,r);assert(Number.isFinite(integral)&&integral>=0);maxError=Math.max(maxError,Math.abs(integral-numeric));
 const mid=a.map((v,i)=>v+d[i]*.37),split=mistChord(a,mid,c,r)+mistChord(mid,b,c,r);
 maxSplit=Math.max(maxSplit,Math.abs(integral-split));assert(Math.abs(integral-mistChord(b,a,c,r))<1e-8);
}
assert(maxError<1e-4,{maxError});assert(maxSplit<1e-8,{maxSplit});
const camera=new THREE.PerspectiveCamera(),mist=createBackNineLocalMist(camera);
camera.position.set(-8,3,-220);mist.update({time:20});const pose=mist.stats();
camera.rotation.y=2;camera.updateMatrixWorld();mist.update({time:20});assert.deepEqual(mist.stats(),pose,'View direction must not drag the mist');
mist.update({time:30});assert.notDeepEqual(mist.stats().centers,pose.centers,'Bank should drift with simulation time');
mist.update({time:30},true);const still=mist.stats();mist.update({time:90},true);assert.deepEqual(mist.stats(),still,'Reduced motion must freeze drift');
mist.update({time:20});assert.deepEqual(mist.stats(),pose,'Rewind must restore bank placement');
camera.position.set(0,3,-800);mist.update({time:20});assert.equal(mist.stats().active,0);
for(const type of [THREE.MeshBasicMaterial,THREE.MeshLambertMaterial,THREE.MeshPhongMaterial,THREE.MeshStandardMaterial]){
 const material=new type(),key=material.customProgramCacheKey();mist.finish(material);const once=material.customProgramCacheKey();mist.finish(material);assert.equal(material.customProgramCacheKey(),once);assert.notEqual(once,key);
 const shader={uniforms:{},vertexShader:'#include <project_vertex>\n#include <worldpos_vertex>',fragmentShader:'#include <fog_fragment>'};material.onBeforeCompile(shader,{});assert.equal(shader.uniforms.hollowViewInverse.value,camera.matrixWorld);assert(shader.vertexShader.includes('mvPosition'));assert(shader.vertexShader.includes('hollowChord'));assert(shader.fragmentShader.includes('hollowDepth'));
}
const out='output/back-nine-visual-upgrade/local-mist';fs.mkdirSync(out,{recursive:true});
const result={passed:true,stateChecks:['view independence','simulation drift','reduced motion','rewind','distant culling','four material families'],rays:360,integrationSteps:4000,maxError,maxSplit,hollows:MIST_HOLLOWS};fs.writeFileSync(out+'/math.json',JSON.stringify(result,null,2));console.log(result);
